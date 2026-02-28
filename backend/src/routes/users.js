const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize, requireOrganization } = require("../middleware/auth");
const auditLog = require("../middleware/audit");
const { UserRoles, getAllRoles, isAdminRole } = require("../constants/roles");

const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireOrganization);

// Get all users in organization
router.get("/", authorize(UserRoles.ORG_ADMIN, UserRoles.SUPER_ADMIN), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId: req.user.organizationId
      },
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
            tasks: true,
            timeEntries: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    // Users can view their own profile, admins can view anyone
    const canView = req.user.id === req.params.id || 
                   isAdminRole(req.user.role);

    if (!canView) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        twoFactorEnabled: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        organization: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create user
router.post("/", authorize(UserRoles.ORG_ADMIN, UserRoles.SUPER_ADMIN), async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Validate role
    const validRoles = getAllRoles();
    const userRole = role || UserRoles.PARALEGAL;
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ 
        error: "Invalid role", 
        validRoles: validRoles 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        phone,
        organizationId: req.user.organizationId
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    await auditLog(req, "CREATE", "USER", user.id, { email, role });

    res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    // Users can update their own profile, admins can update anyone
    const canUpdate = req.user.id === req.params.id || 
                     isAdminRole(req.user.role);

    if (!canUpdate) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { name, phone, role } = req.body;

    // Only admins can change roles
    const updateData = { name, phone };
    if (isAdminRole(req.user.role) && role) {
      // Validate role if provided
      const validRoles = getAllRoles();
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          error: "Invalid role", 
          validRoles: validRoles 
        });
      }
      updateData.role = role;
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true
      }
    });

    await auditLog(req, "UPDATE", "USER", updated.id, req.body);

    res.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
router.delete("/:id", authorize(UserRoles.ORG_ADMIN, UserRoles.SUPER_ADMIN), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    await auditLog(req, "DELETE", "USER", req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
