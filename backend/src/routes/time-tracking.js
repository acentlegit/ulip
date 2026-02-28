const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization } = require("../middleware/auth");
const auditLog = require("../middleware/audit");

const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireOrganization);

// Get all time entries
router.get("/", async (req, res) => {
  try {
    const { caseId, userId, dateFrom, dateTo, billable, status } = req.query;
    
    const where = {
      organizationId: req.user.organizationId
    };

    if (caseId) where.caseId = caseId;
    if (userId) where.userId = userId;
    if (billable !== undefined) where.billable = billable === "true";
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } }
      },
      orderBy: { date: "desc" }
    });

    res.json(entries);
  } catch (error) {
    console.error("Get time entries error:", error);
    res.status(500).json({ error: "Failed to fetch time entries" });
  }
});

// Create time entry
router.post("/", async (req, res) => {
  try {
    const {
      caseId,
      description,
      date,
      hours,
      billable,
      rate
    } = req.body;

    const amount = hours * (rate || 0);

    const entry = await prisma.timeEntry.create({
      data: {
        organizationId: req.user.organizationId,
        caseId: caseId || null,
        userId: req.user.id,
        description,
        date: date ? new Date(date) : new Date(),
        hours: parseFloat(hours),
        billable: billable !== false,
        rate: rate ? parseFloat(rate) : null,
        amount: amount > 0 ? amount : null
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } }
      }
    });

    await auditLog(req, "CREATE", "TIME_ENTRY", entry.id, { hours, billable });

    res.status(201).json(entry);
  } catch (error) {
    console.error("Create time entry error:", error);
    res.status(500).json({ error: "Failed to create time entry" });
  }
});

// Update time entry
router.put("/:id", async (req, res) => {
  try {
    const {
      description,
      date,
      hours,
      billable,
      rate,
      status
    } = req.body;

    const entry = await prisma.timeEntry.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!entry) {
      return res.status(404).json({ error: "Time entry not found" });
    }

    const updateData = {
      description,
      date: date ? new Date(date) : undefined,
      hours: hours ? parseFloat(hours) : undefined,
      billable,
      rate: rate ? parseFloat(rate) : undefined,
      status
    };

    if (updateData.hours && updateData.rate) {
      updateData.amount = updateData.hours * updateData.rate;
    }

    const updated = await prisma.timeEntry.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } }
      }
    });

    await auditLog(req, "UPDATE", "TIME_ENTRY", updated.id, req.body);

    res.json(updated);
  } catch (error) {
    console.error("Update time entry error:", error);
    res.status(500).json({ error: "Failed to update time entry" });
  }
});

// Delete time entry
router.delete("/:id", async (req, res) => {
  try {
    const entry = await prisma.timeEntry.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!entry) {
      return res.status(404).json({ error: "Time entry not found" });
    }

    await prisma.timeEntry.delete({ where: { id: req.params.id } });
    await auditLog(req, "DELETE", "TIME_ENTRY", req.params.id);

    res.json({ message: "Time entry deleted successfully" });
  } catch (error) {
    console.error("Delete time entry error:", error);
    res.status(500).json({ error: "Failed to delete time entry" });
  }
});

// Get time tracking dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const where = {
      organizationId: req.user.organizationId
    };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      select: {
        hours: true,
        billable: true,
        amount: true,
        status: true,
        date: true
      }
    });

    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = entries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0);
    const totalBilled = entries.filter(e => e.status === "BILLED").reduce((sum, e) => sum + (e.amount || 0), 0);
    const unbilledAmount = entries.filter(e => e.status === "DRAFT").reduce((sum, e) => sum + (e.amount || 0), 0);

    res.json({
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      totalBilled,
      unbilledAmount,
      totalEntries: entries.length
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

module.exports = router;
