const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization } = require("../middleware/auth");

const prisma = new PrismaClient();

// All routes require authentication and organization
router.use(authenticate);
router.use(requireOrganization);

/**
 * Get or create case factors for a case
 */
router.get("/:caseId", async (req, res) => {
  try {
    const { caseId } = req.params;

    // Verify case belongs to organization
    const case_ = await prisma.case.findFirst({
      where: {
        id: caseId,
        organizationId: req.user.organizationId,
      },
    });

    if (!case_) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Get or create factors
    let factors = await prisma.caseFactors.findUnique({
      where: { caseId },
    });

    if (!factors) {
      // Create default factors
      factors = await prisma.caseFactors.create({
        data: {
          caseId,
        },
      });
    }

    res.json(factors);
  } catch (error) {
    console.error("Get case factors error:", error);
    res.status(500).json({ error: "Failed to fetch case factors", message: error.message });
  }
});

/**
 * Update case factors
 */
router.put("/:caseId", async (req, res) => {
  try {
    const { caseId } = req.params;
    const {
      evidenceStrength,
      judgeHistory,
      similarCaseOutcomes,
      clientHistory,
      opposingCounselStrength,
      jurisdiction,
      notes,
    } = req.body;

    // Verify case belongs to organization
    const case_ = await prisma.case.findFirst({
      where: {
        id: caseId,
        organizationId: req.user.organizationId,
      },
    });

    if (!case_) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Validate ranges
    const validateRange = (value, min, max) => {
      if (value !== undefined && (value < min || value > max)) {
        throw new Error(`Value must be between ${min} and ${max}`);
      }
    };

    if (evidenceStrength !== undefined) validateRange(evidenceStrength, 0, 1);
    if (judgeHistory !== undefined) validateRange(judgeHistory, 0, 1);
    if (similarCaseOutcomes !== undefined) validateRange(similarCaseOutcomes, 0, 1);
    if (clientHistory !== undefined) validateRange(clientHistory, 0, 1);
    if (opposingCounselStrength !== undefined) validateRange(opposingCounselStrength, 0, 1);

    // Update or create factors
    const factors = await prisma.caseFactors.upsert({
      where: { caseId },
      update: {
        evidenceStrength,
        judgeHistory,
        similarCaseOutcomes,
        clientHistory,
        opposingCounselStrength,
        jurisdiction,
        notes,
        updatedBy: req.user.id,
      },
      create: {
        caseId,
        evidenceStrength: evidenceStrength ?? 0.7,
        judgeHistory: judgeHistory ?? 0.6,
        similarCaseOutcomes: similarCaseOutcomes ?? 0.65,
        clientHistory: clientHistory ?? 0.7,
        opposingCounselStrength: opposingCounselStrength ?? 0.5,
        jurisdiction: jurisdiction ?? "STATE",
        notes,
        updatedBy: req.user.id,
      },
    });

    res.json(factors);
  } catch (error) {
    console.error("Update case factors error:", error);
    res.status(500).json({ error: "Failed to update case factors", message: error.message });
  }
});

/**
 * Calculate client history from past cases
 * This uses REAL data from your database
 */
router.get("/:caseId/calculate-client-history", async (req, res) => {
  try {
    const { caseId } = req.params;

    // Get the current case
    const currentCase = await prisma.case.findFirst({
      where: {
        id: caseId,
        organizationId: req.user.organizationId,
      },
      include: {
        client: true,
      },
    });

    if (!currentCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Get all CLOSED cases for this client
    const pastCases = await prisma.case.findMany({
      where: {
        clientId: currentCase.clientId,
        organizationId: req.user.organizationId,
        status: "CLOSED",
        id: { not: caseId }, // Exclude current case
      },
      select: {
        status: true,
        estimatedValue: true,
        closedDate: true,
      },
    });

    if (pastCases.length === 0) {
      return res.json({
        clientHistory: 0.7, // Default if no past cases
        message: "No past cases found for this client",
        totalCases: 0,
      });
    }

    // Calculate win rate (assuming CLOSED with positive outcome is a "win")
    // In a real system, you'd have an outcome field
    // For now, we'll use a simple heuristic
    const totalCases = pastCases.length;
    const recentCases = pastCases.filter(
      (c) => c.closedDate && new Date(c.closedDate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    ).length;

    // Simple calculation: more recent cases = better history
    // In production, you'd track actual outcomes
    const clientHistory = Math.min(0.95, 0.5 + (recentCases / totalCases) * 0.4);

    res.json({
      clientHistory: Math.round(clientHistory * 100) / 100,
      totalCases,
      recentCases,
      message: `Calculated from ${totalCases} past cases`,
    });
  } catch (error) {
    console.error("Calculate client history error:", error);
    res.status(500).json({ error: "Failed to calculate client history", message: error.message });
  }
});

module.exports = router;
