const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization } = require("../middleware/auth");
const auditLog = require("../middleware/audit");

const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireOrganization);

// Get all clients
router.get("/", async (req, res) => {
  try {
    const { status, type, search } = req.query;
    
    const where = {
      organizationId: req.user.organizationId
    };

    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } }
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: {
          select: {
            cases: true,
            invoices: true,
            documents: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json(clients);
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// Get client by ID
router.get("/:id", async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      include: {
        cases: {
          select: {
            id: true,
            title: true,
            status: true,
            practiceArea: true,
            openedDate: true
          },
          orderBy: { openedDate: "desc" }
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
            issueDate: true,
            dueDate: true
          },
          orderBy: { issueDate: "desc" },
          take: 10
        },
        documents: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        communications: {
          orderBy: { createdAt: "desc" },
          take: 20
        },
        _count: {
          select: {
            cases: true,
            invoices: true,
            documents: true
          }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    console.error("Get client error:", error);
    res.status(500).json({ error: "Failed to fetch client" });
  }
});

// Create client
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      company,
      type,
      status,
      notes
    } = req.body;

    const client = await prisma.client.create({
      data: {
        organizationId: req.user.organizationId,
        name,
        email,
        phone,
        address,
        company,
        type: type || "INDIVIDUAL",
        status: status || "ACTIVE",
        notes
      }
    });

    await auditLog(req, "CREATE", "CLIENT", client.id, { name, email });

    res.status(201).json(client);
  } catch (error) {
    console.error("Create client error:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
});

// Update client
router.put("/:id", async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const updated = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body
    });

    await auditLog(req, "UPDATE", "CLIENT", updated.id, req.body);

    res.json(updated);
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// Delete client
router.delete("/:id", async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    await prisma.client.delete({ where: { id: req.params.id } });
    await auditLog(req, "DELETE", "CLIENT", req.params.id);

    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Delete client error:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

// Conflict check
router.post("/:id/conflict-check", async (req, res) => {
  try {
    const { notes } = req.body;

    // In a real system, this would check against all cases and clients
    const conflictCheck = await prisma.conflictCheck.create({
      data: {
        organizationId: req.user.organizationId,
        clientId: req.params.id,
        checkedBy: req.user.id,
        result: "CLEAR", // Simplified - would do actual conflict checking
        notes
      }
    });

    await auditLog(req, "CONFLICT_CHECK", "CLIENT", req.params.id);

    res.status(201).json(conflictCheck);
  } catch (error) {
    console.error("Conflict check error:", error);
    res.status(500).json({ error: "Failed to perform conflict check" });
  }
});

// Get client billing summary
router.get("/:id/billing", async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const invoices = await prisma.invoice.findMany({
      where: { clientId: req.params.id }
    });

    const totalBilled = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = invoices.filter(i => i.status === "SENT").reduce((sum, i) => sum + i.total, 0);
    const overdueAmount = invoices.filter(i => i.status === "OVERDUE").reduce((sum, i) => sum + i.total, 0);

    res.json({
      totalBilled,
      pendingAmount,
      overdueAmount,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(i => i.status === "PAID").length
    });
  } catch (error) {
    console.error("Get billing summary error:", error);
    res.status(500).json({ error: "Failed to fetch billing summary" });
  }
});

module.exports = router;
