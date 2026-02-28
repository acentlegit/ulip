const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization } = require("../middleware/auth");
const auditLog = require("../middleware/audit");
const multer = require("multer");

const prisma = new PrismaClient();

// Configure multer for file uploads (in production, use S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.use(authenticate);
router.use(requireOrganization);

// Get all documents
router.get("/", async (req, res) => {
  try {
    const { caseId, clientId, search, tags, isTemplate } = req.query;
    
    const where = {
      organizationId: req.user.organizationId
    };

    if (caseId) where.caseId = caseId;
    if (clientId) where.clientId = clientId;
    if (isTemplate === "true") where.isTemplate = true;
    if (search) {
      where.OR = [
        { fileName: { contains: search } },
        { description: { contains: search } }
      ];
    }
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags];
      where.tags = { contains: tagList.join(",") };
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } },
        client: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Get document by ID
router.get("/:id", async (req, res) => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, title: true } },
        client: { select: { id: true, name: true } },
        versions: {
          orderBy: { version: "desc" }
        },
        parentDocument: true
      }
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

// Upload document
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const {
      caseId,
      clientId,
      description,
      tags,
      isTemplate,
      templateCategory,
      accessLevel
    } = req.body;

    // In production, upload to S3
    const s3Key = `documents/${req.user.organizationId}/${Date.now()}-${req.file.originalname}`;
    
    // For now, store file info (in production, upload to S3)
    const document = await prisma.document.create({
      data: {
        organizationId: req.user.organizationId,
        caseId: caseId || null,
        clientId: clientId || null,
        uploadedBy: req.user.id,
        fileName: req.file.originalname,
        originalFileName: req.file.originalname,
        fileType: req.file.originalname.split(".").pop() || "",
        fileSize: req.file.size,
        s3Key,
        s3Bucket: "legal-documents",
        mimeType: req.file.mimetype,
        description,
        tags: tags ? (Array.isArray(tags) ? tags.join(",") : tags) : null,
        isTemplate: isTemplate === "true",
        templateCategory,
        accessLevel: accessLevel || "ORGANIZATION"
      },
      include: {
        uploader: { select: { id: true, name: true } }
      }
    });

    await auditLog(req, "CREATE", "DOCUMENT", document.id, { fileName: req.file.originalname });

    res.status(201).json(document);
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

// Update document
router.put("/:id", async (req, res) => {
  try {
    const { description, tags, accessLevel } = req.body;

    const document = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        description,
        tags: tags ? (Array.isArray(tags) ? tags.join(",") : tags) : undefined,
        accessLevel
      }
    });

    await auditLog(req, "UPDATE", "DOCUMENT", updated.id, req.body);

    res.json(updated);
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({ error: "Failed to update document" });
  }
});

// Delete document
router.delete("/:id", async (req, res) => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // In production, delete from S3
    await prisma.document.delete({ where: { id: req.params.id } });
    await auditLog(req, "DELETE", "DOCUMENT", req.params.id);

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Create new version
router.post("/:id/versions", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const parent = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!parent) {
      return res.status(404).json({ error: "Parent document not found" });
    }

    const newVersion = await prisma.document.create({
      data: {
        organizationId: req.user.organizationId,
        caseId: parent.caseId,
        clientId: parent.clientId,
        uploadedBy: req.user.id,
        fileName: req.file.originalname,
        originalFileName: req.file.originalname,
        fileType: req.file.originalname.split(".").pop() || "",
        fileSize: req.file.size,
        s3Key: `documents/${req.user.organizationId}/${Date.now()}-${req.file.originalname}`,
        s3Bucket: "legal-documents",
        mimeType: req.file.mimetype,
        description: parent.description,
        tags: parent.tags,
        version: parent.version + 1,
        parentDocumentId: parent.id,
        accessLevel: parent.accessLevel
      }
    });

    await auditLog(req, "CREATE", "DOCUMENT_VERSION", newVersion.id);

    res.status(201).json(newVersion);
  } catch (error) {
    console.error("Create version error:", error);
    res.status(500).json({ error: "Failed to create version" });
  }
});

module.exports = router;
