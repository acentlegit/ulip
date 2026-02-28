const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization, authorize } = require("../middleware/auth");
const auditLog = require("../middleware/audit");
const { UserRoles, isAdminRole } = require("../constants/roles");

const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireOrganization);

// Get organization details
router.get("/", async (req, res) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.user.organizationId }
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Get counts separately to avoid Prisma issues
    const [
      usersCount,
      casesCount,
      clientsCount,
      documentsCount,
      tasksCount,
      invoicesCount
    ] = await Promise.all([
      prisma.user.count({ where: { organizationId: organization.id } }),
      prisma.case.count({ where: { organizationId: organization.id } }),
      prisma.client.count({ where: { organizationId: organization.id } }),
      prisma.document.count({ where: { organizationId: organization.id } }),
      prisma.task.count({ where: { organizationId: organization.id } }),
      prisma.invoice.count({ where: { organizationId: organization.id } })
    ]);

    const organizationWithCounts = {
      ...organization,
      _count: {
        users: usersCount,
        cases: casesCount,
        clients: clientsCount,
        documents: documentsCount,
        tasks: tasksCount,
        invoices: invoicesCount
      }
    };

    res.json(organizationWithCounts);
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
});

// Update organization (only admins)
router.put("/", authorize(UserRoles.ORG_ADMIN, UserRoles.SUPER_ADMIN), async (req, res) => {
  try {
    const { name, domain, subscriptionTier } = req.body;

    // Validate subscription tier if provided
    const validTiers = ["FREE", "BASIC", "PRO", "ENTERPRISE"];
    if (subscriptionTier && !validTiers.includes(subscriptionTier)) {
      return res.status(400).json({ 
        error: "Invalid subscription tier",
        validTiers: validTiers
      });
    }

    // Check if domain is unique (if provided)
    if (domain) {
      const existingOrg = await prisma.organization.findFirst({
        where: {
          domain: domain,
          id: { not: req.user.organizationId }
        }
      });

      if (existingOrg) {
        return res.status(400).json({ error: "Domain already in use" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (domain !== undefined) updateData.domain = domain || null;
    if (subscriptionTier) updateData.subscriptionTier = subscriptionTier;

    const updated = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: updateData
    });

    // Get counts separately
    const [
      usersCount,
      casesCount,
      clientsCount,
      documentsCount,
      tasksCount,
      invoicesCount
    ] = await Promise.all([
      prisma.user.count({ where: { organizationId: updated.id } }),
      prisma.case.count({ where: { organizationId: updated.id } }),
      prisma.client.count({ where: { organizationId: updated.id } }),
      prisma.document.count({ where: { organizationId: updated.id } }),
      prisma.task.count({ where: { organizationId: updated.id } }),
      prisma.invoice.count({ where: { organizationId: updated.id } })
    ]);

    const updatedWithCounts = {
      ...updated,
      _count: {
        users: usersCount,
        cases: casesCount,
        clients: clientsCount,
        documents: documentsCount,
        tasks: tasksCount,
        invoices: invoicesCount
      }
    };

    await auditLog(req, "UPDATE", "ORGANIZATION", updated.id, updateData);

    res.json(updatedWithCounts);
  } catch (error) {
    console.error("Update organization error:", error);
    res.status(500).json({ error: "Failed to update organization" });
  }
});

// Get organization statistics
router.get("/stats", async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const [
      totalUsers,
      totalCases,
      totalClients,
      totalDocuments,
      activeTasks,
      totalInvoices,
      totalRevenue,
      activeCases
    ] = await Promise.all([
      prisma.user.count({ where: { organizationId: orgId } }),
      prisma.case.count({ where: { organizationId: orgId } }),
      prisma.client.count({ where: { organizationId: orgId } }),
      prisma.document.count({ where: { organizationId: orgId } }),
      prisma.task.count({ 
        where: { 
          organizationId: orgId,
          status: { not: "COMPLETED" }
        }
      }),
      prisma.invoice.count({ where: { organizationId: orgId } }),
      prisma.invoice.aggregate({
        where: { 
          organizationId: orgId,
          status: "PAID"
        },
        _sum: { total: true }
      }),
      prisma.case.count({ 
        where: { 
          organizationId: orgId,
          status: { in: ["OPEN", "IN_PROGRESS"] }
        }
      })
    ]);

    res.json({
      users: totalUsers,
      cases: {
        total: totalCases,
        active: activeCases
      },
      clients: totalClients,
      documents: totalDocuments,
      tasks: {
        active: activeTasks
      },
      invoices: {
        total: totalInvoices
      },
      revenue: {
        total: totalRevenue._sum.total || 0
      }
    });
  } catch (error) {
    console.error("Get organization stats error:", error);
    res.status(500).json({ error: "Failed to fetch organization statistics" });
  }
});

// Get organization users
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user.organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            cases: true,
            tasks: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(users);
  } catch (error) {
    console.error("Get organization users error:", error);
    res.status(500).json({ error: "Failed to fetch organization users" });
  }
});

module.exports = router;
