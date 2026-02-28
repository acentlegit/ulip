const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Create Prisma client with error handling
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: "pretty"
  });
} catch (error) {
  console.error("Failed to initialize Prisma Client:", error);
  throw error;
}

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      organizationId: user.organizationId 
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Verify JWT token middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { organization: true }
      });

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      req.user = user;
      req.organizationId = user.organizationId;
      next();
    } catch (dbError) {
      console.error("Database error in authenticate:", dbError);
      return res.status(500).json({ 
        error: "Database error",
        details: process.env.NODE_ENV === "development" ? dbError.message : undefined
      });
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.error("Auth error:", error);
    return res.status(500).json({ 
      error: "Authentication error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Role-based access control
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: "Insufficient permissions" });
    }
  };
};

// Multi-tenant isolation - ensure user can only access their organization's data
const requireOrganization = (req, res, next) => {
  if (!req.user || !req.user.organizationId) {
    return res.status(403).json({ error: "Organization access required" });
  }
  next();
};

module.exports = {
  generateToken,
  authenticate,
  authorize,
  requireOrganization
};
