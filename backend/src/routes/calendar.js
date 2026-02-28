const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization } = require("../middleware/auth");
const auditLog = require("../middleware/audit");

const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireOrganization);

// Get calendar events (hearings, tasks, deadlines)
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days default

    const [hearings, tasks, deadlines] = await Promise.all([
      prisma.hearing.findMany({
        where: {
          case: { organizationId: req.user.organizationId },
          date: { gte: start, lte: end }
        },
        include: {
          case: { select: { id: true, title: true, caseNumber: true } }
        }
      }),
      prisma.task.findMany({
        where: {
          organizationId: req.user.organizationId,
          dueDate: { gte: start, lte: end },
          status: { not: "COMPLETED" }
        },
        include: {
          assignee: { select: { id: true, name: true } },
          case: { select: { id: true, title: true } }
        }
      }),
      prisma.invoice.findMany({
        where: {
          organizationId: req.user.organizationId,
          dueDate: { gte: start, lte: end },
          status: { not: "PAID" }
        },
        include: {
          client: { select: { id: true, name: true } }
        }
      })
    ]);

    const events = [
      ...hearings.map(h => ({
        id: h.id,
        type: "HEARING",
        title: h.title,
        date: h.date,
        location: h.location,
        court: h.court,
        case: h.case
      })),
      ...tasks.map(t => ({
        id: t.id,
        type: "TASK",
        title: t.title,
        date: t.dueDate,
        priority: t.priority,
        assignee: t.assignee,
        case: t.case
      })),
      ...deadlines.map(d => ({
        id: d.id,
        type: "INVOICE_DUE",
        title: `Invoice ${d.invoiceNumber} Due`,
        date: d.dueDate,
        client: d.client,
        amount: d.total
      }))
    ];

    res.json(events.sort((a, b) => a.date - b.date));
  } catch (error) {
    console.error("Get calendar error:", error);
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
});

// Create hearing
router.post("/hearings", async (req, res) => {
  try {
    const {
      caseId,
      title,
      type,
      date,
      location,
      court,
      judge,
      notes
    } = req.body;

    // Verify case belongs to organization
    const case_ = await prisma.case.findFirst({
      where: {
        id: caseId,
        organizationId: req.user.organizationId
      }
    });

    if (!case_) {
      return res.status(400).json({ error: "Case not found" });
    }

    const hearing = await prisma.hearing.create({
      data: {
        caseId,
        title,
        type: type || "HEARING",
        date: new Date(date),
        location,
        court,
        judge,
        notes
      },
      include: {
        case: { select: { id: true, title: true } }
      }
    });

    await auditLog(req, "CREATE", "HEARING", hearing.id, { title, date });

    res.status(201).json(hearing);
  } catch (error) {
    console.error("Create hearing error:", error);
    res.status(500).json({ error: "Failed to create hearing" });
  }
});

// Update hearing
router.put("/hearings/:id", async (req, res) => {
  try {
    const hearing = await prisma.hearing.findFirst({
      where: {
        id: req.params.id,
        case: { organizationId: req.user.organizationId }
      }
    });

    if (!hearing) {
      return res.status(404).json({ error: "Hearing not found" });
    }

    const updated = await prisma.hearing.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined
      },
      include: {
        case: { select: { id: true, title: true } }
      }
    });

    await auditLog(req, "UPDATE", "HEARING", updated.id, req.body);

    res.json(updated);
  } catch (error) {
    console.error("Update hearing error:", error);
    res.status(500).json({ error: "Failed to update hearing" });
  }
});

// Delete hearing
router.delete("/hearings/:id", async (req, res) => {
  try {
    const hearing = await prisma.hearing.findFirst({
      where: {
        id: req.params.id,
        case: { organizationId: req.user.organizationId }
      }
    });

    if (!hearing) {
      return res.status(404).json({ error: "Hearing not found" });
    }

    await prisma.hearing.delete({ where: { id: req.params.id } });
    await auditLog(req, "DELETE", "HEARING", req.params.id);

    res.json({ message: "Hearing deleted successfully" });
  } catch (error) {
    console.error("Delete hearing error:", error);
    res.status(500).json({ error: "Failed to delete hearing" });
  }
});

module.exports = router;
