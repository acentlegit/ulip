const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize, requireOrganization } = require("../middleware/auth");
const auditLog = require("../middleware/audit");
const { UserRoles } = require("../constants/roles");

const prisma = new PrismaClient();

// All routes require authentication and organization
router.use(authenticate);
router.use(requireOrganization);

// Get all cases for organization
router.get("/", async (req, res) => {
  try {
    const { status, clientId, practiceArea, search } = req.query;
    
    const where = {
      organizationId: req.user.organizationId
    };

    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (practiceArea) where.practiceArea = practiceArea;
    if (search) {
      // SQLite doesn't support case-insensitive mode, so we'll use contains
      // For case-insensitive search in SQLite, we'd need to use raw SQL or transform the data
      where.OR = [
        { title: { contains: search } },
        { caseNumber: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const cases = await prisma.case.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        _count: {
          select: {
            documents: true,
            tasks: true,
            timeEntries: true,
            invoices: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json(cases);
  } catch (error) {
    console.error("Get cases error:", error);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

// Get case by ID
router.get("/:id", async (req, res) => {
  try {
    const case_ = await prisma.case.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      include: {
        client: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        },
        documents: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true } }
          },
          orderBy: { dueDate: "asc" }
        },
        notes: {
          orderBy: { createdAt: "desc" },
          take: 20
        },
        timeline: {
          orderBy: { eventDate: "desc" }
        },
        parties: true,
        hearings: {
          orderBy: { date: "asc" }
        },
        _count: {
          select: {
            timeEntries: true,
            invoices: true
          }
        }
      }
    });

    if (!case_) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json(case_);
  } catch (error) {
    console.error("Get case error:", error);
    res.status(500).json({ error: "Failed to fetch case" });
  }
});

// Create case
router.post("/", async (req, res) => {
  try {
    const {
      title,
      clientId,
      description,
      caseNumber,
      practiceArea,
      priority,
      openedDate,
      estimatedValue,
      members
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

    const case_ = await prisma.case.create({
      data: {
        organizationId: req.user.organizationId,
        clientId,
        title,
        description,
        caseNumber,
        practiceArea,
        priority: priority || "MEDIUM",
        openedDate: openedDate ? new Date(openedDate) : new Date(),
        estimatedValue,
        members: members ? {
          create: members.map(m => ({
            userId: m.userId,
            role: m.role || "ASSOCIATE"
          }))
        } : undefined
      },
      include: {
        client: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    await auditLog(req, "CREATE", "CASE", case_.id, { title, clientId });

    // Add timeline event
    await prisma.timelineEvent.create({
      data: {
        caseId: case_.id,
        title: "Case Opened",
        description: `Case "${title}" was opened`,
        eventType: "NOTE",
        eventDate: new Date()
      }
    });

    res.status(201).json(case_);
  } catch (error) {
    console.error("Create case error:", error);
    res.status(500).json({ error: "Failed to create case" });
  }
});

// Update case
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      practiceArea,
      priority,
      closedDate,
      estimatedValue
    } = req.body;

    const case_ = await prisma.case.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!case_) {
      return res.status(404).json({ error: "Case not found" });
    }

    const updated = await prisma.case.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        practiceArea,
        priority,
        closedDate: closedDate ? new Date(closedDate) : null,
        estimatedValue
      },
      include: {
        client: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    await auditLog(req, "UPDATE", "CASE", updated.id, req.body);

    res.json(updated);
  } catch (error) {
    console.error("Update case error:", error);
    res.status(500).json({ error: "Failed to update case" });
  }
});

// Delete case
router.delete("/:id", authorize(UserRoles.ORG_ADMIN, UserRoles.SUPER_ADMIN), async (req, res) => {
  try {
    const case_ = await prisma.case.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!case_) {
      return res.status(404).json({ error: "Case not found" });
    }

    await prisma.case.delete({ where: { id: req.params.id } });
    await auditLog(req, "DELETE", "CASE", req.params.id);

    res.json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error("Delete case error:", error);
    res.status(500).json({ error: "Failed to delete case" });
  }
});

// Add case member
router.post("/:id/members", async (req, res) => {
  try {
    const { userId, role } = req.body;

    const case_ = await prisma.case.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!case_) {
      return res.status(404).json({ error: "Case not found" });
    }

    const member = await prisma.caseMember.create({
      data: {
        caseId: req.params.id,
        userId,
        role: role || "ASSOCIATE"
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    await auditLog(req, "CREATE", "CASE_MEMBER", member.id);

    res.status(201).json(member);
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ error: "Failed to add member" });
  }
});

// Add case note
router.post("/:id/notes", async (req, res) => {
  try {
    const { content, isPrivate } = req.body;

    const note = await prisma.caseNote.create({
      data: {
        caseId: req.params.id,
        content,
        isPrivate: isPrivate || false,
        createdBy: req.user.id
      }
    });

    await auditLog(req, "CREATE", "CASE_NOTE", note.id);

    res.status(201).json(note);
  } catch (error) {
    console.error("Add note error:", error);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// Add timeline event
router.post("/:id/timeline", async (req, res) => {
  try {
    const { title, description, eventType, eventDate } = req.body;

    const event = await prisma.timelineEvent.create({
      data: {
        caseId: req.params.id,
        title,
        description,
        eventType: eventType || "NOTE",
        eventDate: eventDate ? new Date(eventDate) : new Date()
      }
    });

    await auditLog(req, "CREATE", "TIMELINE_EVENT", event.id);

    res.status(201).json(event);
  } catch (error) {
    console.error("Add timeline event error:", error);
    res.status(500).json({ error: "Failed to add timeline event" });
  }
});

// Get case analytics
router.get("/:id/analytics", async (req, res) => {
  try {
    const case_ = await prisma.case.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!case_) {
      return res.status(404).json({ error: "Case not found" });
    }

    const [timeEntries, invoices, tasks, documents] = await Promise.all([
      prisma.timeEntry.findMany({
        where: { caseId: req.params.id },
        select: { hours: true, amount: true, billable: true }
      }),
      prisma.invoice.findMany({
        where: { caseId: req.params.id },
        select: { total: true, status: true }
      }),
      prisma.task.findMany({
        where: { caseId: req.params.id },
        select: { status: true }
      }),
      prisma.document.findMany({
        where: { caseId: req.params.id },
        select: { id: true }
      })
    ]);

    const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = timeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0);
    const totalBilled = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.total, 0);
    const pendingBills = invoices.filter(i => i.status === "SENT").reduce((sum, i) => sum + i.total, 0);

    res.json({
      totalHours,
      billableHours,
      totalBilled,
      pendingBills,
      totalInvoices: invoices.length,
      completedTasks: tasks.filter(t => t.status === "COMPLETED").length,
      totalTasks: tasks.length,
      documentCount: documents.length
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
