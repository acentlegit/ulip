const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization } = require("../middleware/auth");
const auditLog = require("../middleware/audit");

const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireOrganization);

// Get all invoices
router.get("/", async (req, res) => {
  try {
    const { caseId, clientId, status, dateFrom, dateTo } = req.query;
    
    const where = {
      organizationId: req.user.organizationId
    };

    if (caseId) where.caseId = caseId;
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.issueDate = {};
      if (dateFrom) where.issueDate.gte = new Date(dateFrom);
      if (dateTo) where.issueDate.lte = new Date(dateTo);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } },
        timeEntries: true,
        expenses: true
      },
      orderBy: { issueDate: "desc" }
    });

    res.json(invoices);
  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Get invoice by ID
router.get("/:id", async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      include: {
        client: true,
        case: { select: { id: true, title: true } },
        timeEntries: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        expenses: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// Create invoice
router.post("/", async (req, res) => {
  try {
    const {
      caseId,
      clientId,
      timeEntryIds,
      expenseIds,
      dueDate,
      tax,
      notes
    } = req.body;

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId: req.user.organizationId
      }
    });

    if (!client) {
      return res.status(400).json({ error: "Client not found" });
    }

    // Get time entries and expenses
    const timeEntries = timeEntryIds ? await prisma.timeEntry.findMany({
      where: {
        id: { in: timeEntryIds },
        organizationId: req.user.organizationId,
        status: "DRAFT"
      }
    }) : [];

    const expenses = expenseIds ? await prisma.expense.findMany({
      where: {
        id: { in: expenseIds },
        billable: true,
        invoiceId: null
      }
    }) : [];

    // Calculate totals
    const timeAmount = timeEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const expenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const subtotal = timeAmount + expenseAmount;
    const taxAmount = tax ? parseFloat(tax) : 0;
    const total = subtotal + taxAmount;

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { organizationId: req.user.organizationId }
    });
    const invoiceNumber = `INV-${Date.now()}-${invoiceCount + 1}`;

    const invoice = await prisma.invoice.create({
      data: {
        organizationId: req.user.organizationId,
        caseId: caseId || null,
        clientId,
        invoiceNumber,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        subtotal,
        tax: taxAmount,
        total,
        notes
      }
    });

    // Link time entries and expenses
    if (timeEntries.length > 0) {
      await prisma.timeEntry.updateMany({
        where: { id: { in: timeEntryIds } },
        data: { invoiceId: invoice.id, status: "BILLED" }
      });
    }

    if (expenses.length > 0) {
      await prisma.expense.updateMany({
        where: { id: { in: expenseIds } },
        data: { invoiceId: invoice.id }
      });
    }

    await auditLog(req, "CREATE", "INVOICE", invoice.id, { invoiceNumber, total });

    const created = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        client: true,
        case: true,
        timeEntries: true,
        expenses: true
      }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// Update invoice
router.put("/:id", async (req, res) => {
  try {
    const { status, dueDate, notes } = req.body;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const updateData = {
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes
    };

    if (status === "PAID" && !invoice.paidAt) {
      updateData.paidAt = new Date();
    }

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        client: true,
        case: true,
        timeEntries: true,
        expenses: true
      }
    });

    await auditLog(req, "UPDATE", "INVOICE", updated.id, req.body);

    res.json(updated);
  } catch (error) {
    console.error("Update invoice error:", error);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

// Mark invoice as paid (with Stripe integration)
router.post("/:id/pay", async (req, res) => {
  try {
    const { stripePaymentId } = req.body;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // In production, verify payment with Stripe
    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stripePaymentId
      }
    });

    await auditLog(req, "PAYMENT", "INVOICE", updated.id, { stripePaymentId });

    res.json(updated);
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

module.exports = router;
