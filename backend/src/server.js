require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Set default DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(__dirname, "../prisma/dev.db")}`;
}

// Initialize Prisma client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Test Prisma connection on startup
prisma.$connect()
  .then(() => {
    console.log("✓ Database connection established");
  })
  .catch((error) => {
    console.error("✗ Database connection failed:", error.message);
    console.error("Please check your DATABASE_URL in .env file");
  });

const authRoutes = require("./routes/auth");
const caseRoutes = require("./routes/cases");
const clientRoutes = require("./routes/clients");
const documentRoutes = require("./routes/documents");
const taskRoutes = require("./routes/tasks");
const timeTrackingRoutes = require("./routes/time-tracking");
const invoiceRoutes = require("./routes/invoices");
const calendarRoutes = require("./routes/calendar");
const userRoutes = require("./routes/users");
const dashboardRoutes = require("./routes/dashboard");
const organizationRoutes = require("./routes/organizations");
const predictiveAnalysisRoutes = require("./routes/predictive-analysis");
const caseFactorsRoutes = require("./routes/case-factors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // For file uploads

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/time-tracking", timeTrackingRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/predictive-analysis", predictiveAnalysisRoutes);
app.use("/api/case-factors", caseFactorsRoutes);

// Health check
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Enterprise Legal Management Platform running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Database: ${process.env.DATABASE_URL ? "configured" : "not configured"}`);
});
