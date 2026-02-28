const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization } = require("../middleware/auth");
const auditLog = require("../middleware/audit");

const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireOrganization);

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const { caseId, status, assignedTo, priority, dueDate } = req.query;
    
    const where = {
      organizationId: req.user.organizationId
    };

    if (caseId) where.caseId = caseId;
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;
    if (priority) where.priority = priority;
    if (dueDate) {
      const date = new Date(dueDate);
      where.dueDate = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } }
      },
      orderBy: [
        { dueDate: "asc" },
        { priority: "desc" }
      ]
    });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Get task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } }
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// Create task
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      caseId,
      assignedTo,
      priority,
      dueDate,
      workflowStage
    } = req.body;

    const task = await prisma.task.create({
      data: {
        organizationId: req.user.organizationId,
        caseId: caseId || null,
        assignedTo: assignedTo || null,
        title,
        description,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        workflowStage
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } }
      }
    });

    await auditLog(req, "CREATE", "TASK", task.id, { title });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      assignedTo,
      priority,
      dueDate,
      workflowStage
    } = req.body;

    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updateData = {
      title,
      description,
      status,
      assignedTo,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      workflowStage
    };

    if (status === "COMPLETED" && !task.completedAt) {
      updateData.completedAt = new Date();
    } else if (status !== "COMPLETED") {
      updateData.completedAt = null;
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } }
      }
    });

    await auditLog(req, "UPDATE", "TASK", updated.id, req.body);

    res.json(updated);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    await auditLog(req, "DELETE", "TASK", req.params.id);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
