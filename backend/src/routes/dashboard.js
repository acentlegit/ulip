const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization } = require("../middleware/auth");
const { UserRoles, canAccessFinance } = require("../constants/roles");

const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireOrganization);

// Get dashboard data based on user role
router.get("/", async (req, res) => {
  try {
    const role = req.user.role;
    const orgId = req.user.organizationId;

    // Common stats for all roles
    const [cases, clients, tasks, invoices, users] = await Promise.all([
      prisma.case.count({ where: { organizationId: orgId } }),
      prisma.client.count({ where: { organizationId: orgId } }),
      prisma.task.count({ 
        where: { 
          organizationId: orgId,
          status: { not: "COMPLETED" }
        }
      }),
      prisma.invoice.count({ 
        where: { 
          organizationId: orgId,
          status: { not: "PAID" }
        }
      }),
      prisma.user.count({ where: { organizationId: orgId } })
    ]);

    let dashboardData = {
      totalUsers: users,
      cases,
      clients,
      tasks,
      invoices
    };

    // Role-specific data
    if (role === UserRoles.LAWYER || role === UserRoles.PARALEGAL) {
      // Get user's cases and tasks
      const userCases = await prisma.caseMember.findMany({
        where: { userId: req.user.id },
        include: {
          case: {
            include: {
              client: { select: { id: true, name: true } }
            }
          }
        }
      });

      const userTasks = await prisma.task.findMany({
        where: {
          assignedTo: req.user.id,
          status: { not: "COMPLETED" }
        },
        include: {
          case: { select: { id: true, title: true } }
        },
        orderBy: { dueDate: "asc" },
        take: 10
      });

      const userTimeEntries = await prisma.timeEntry.findMany({
        where: {
          userId: req.user.id,
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        },
        select: { hours: true, billable: true }
      });

      dashboardData = {
        ...dashboardData,
        myCases: userCases.map(uc => uc.case),
        myTasks: userTasks,
        myHours: userTimeEntries.reduce((sum, e) => sum + e.hours, 0),
        billableHours: userTimeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0)
      };
    }

    if (canAccessFinance(role)) {
      // Financial data
      const allInvoices = await prisma.invoice.findMany({
        where: { organizationId: orgId },
        select: { total: true, status: true }
      });

      const revenue = allInvoices
        .filter(i => i.status === "PAID")
        .reduce((sum, i) => sum + i.total, 0);

      const pending = allInvoices
        .filter(i => i.status === "SENT")
        .reduce((sum, i) => sum + i.total, 0);

      const overdue = allInvoices
        .filter(i => i.status === "OVERDUE")
        .reduce((sum, i) => sum + i.total, 0);

      dashboardData = {
        ...dashboardData,
        revenue,
        pendingRevenue: pending,
        overdueAmount: overdue
      };
    }

    // Recent activity
    const recentCases = await prisma.case.findMany({
      where: { organizationId: orgId },
      include: {
        client: { select: { id: true, name: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    });

    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        organizationId: orgId,
        status: { not: "COMPLETED" },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      include: {
        assignee: { select: { id: true, name: true } },
        case: { select: { id: true, title: true } }
      },
      orderBy: { dueDate: "asc" },
      take: 10
    });

    dashboardData.recentCases = recentCases;
    dashboardData.upcomingDeadlines = upcomingDeadlines;

    res.json(dashboardData);
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

module.exports = router;
