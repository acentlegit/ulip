const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const auditLog = async (req, action, entityType, entityId = null, details = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: req.user?.organizationId || null,
        userId: req.user?.id || null,
        action,
        entityType,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"] || null
      }
    });
  } catch (error) {
    console.error("Audit log error:", error);
    // Don't fail the request if audit logging fails
  }
};

module.exports = auditLog;
