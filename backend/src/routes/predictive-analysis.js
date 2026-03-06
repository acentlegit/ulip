const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireOrganization } = require("../middleware/auth");
const { UserRoles } = require("../constants/roles");

const prisma = new PrismaClient();

// Helper function to map practiceArea to case type for analysis
const mapPracticeAreaToCaseType = (practiceArea) => {
  if (!practiceArea) return "CIVIL";
  const upperArea = practiceArea.toUpperCase();
  if (upperArea.includes("CRIMINAL")) return "CRIMINAL";
  if (upperArea.includes("FAMILY") || upperArea.includes("DIVORCE") || upperArea.includes("CUSTODY")) return "FAMILY";
  return "CIVIL"; // Default to CIVIL for all other practice areas
};

// All routes require authentication and organization
router.use(authenticate);
router.use(requireOrganization);

/**
 * Predictive Case Outcome Engine
 * Analyzes case factors and predicts outcomes
 */
router.post("/predict-outcome", async (req, res) => {
  try {
    const { caseId, factors } = req.body;
    const userId = req.user.id;

    // If caseId provided, fetch case data
    let caseData = null;
    if (caseId) {
      caseData = await prisma.case.findFirst({
        where: {
          id: caseId,
          organizationId: req.user.organizationId,
        },
        include: {
          client: true,
          documents: true,
        },
      });

      if (!caseData) {
        return res.status(404).json({ error: "Case not found" });
      }
    }

    // Extract factors from case or use provided factors
    const caseType = caseData?.practiceArea ? mapPracticeAreaToCaseType(caseData.practiceArea) : "CIVIL";
    
    // Try to get real factors from database
    let savedFactors = null;
    if (caseId) {
      savedFactors = await prisma.caseFactors.findUnique({
        where: { caseId },
      });
    }

    // Use saved factors if available, otherwise use provided factors or defaults
    const caseFactors = factors || {
      caseType: caseType,
      priority: caseData?.priority || "MEDIUM",
      evidenceStrength: savedFactors?.evidenceStrength ?? 0.7,
      judgeHistory: savedFactors?.judgeHistory ?? 0.6,
      similarCaseOutcomes: savedFactors?.similarCaseOutcomes ?? 0.65,
      clientHistory: savedFactors?.clientHistory ?? 0.7,
      opposingCounselStrength: savedFactors?.opposingCounselStrength ?? 0.5,
      jurisdiction: savedFactors?.jurisdiction ?? "STATE",
    };

    // Predictive Algorithm (Enhanced from LEXNOVA)
    const weights = {
      evidenceStrength: 0.25,
      judgeHistory: 0.20,
      similarCaseOutcomes: 0.20,
      clientHistory: 0.15,
      opposingCounselStrength: 0.10,
      jurisdiction: 0.10,
    };

    // Calculate win probability
    let winProbability =
      caseFactors.evidenceStrength * weights.evidenceStrength +
      caseFactors.judgeHistory * weights.judgeHistory +
      caseFactors.similarCaseOutcomes * weights.similarCaseOutcomes +
      caseFactors.clientHistory * weights.clientHistory +
      (1 - caseFactors.opposingCounselStrength) * weights.opposingCounselStrength +
      (caseFactors.jurisdiction === "FEDERAL" ? 0.6 : 0.7) * weights.jurisdiction;

    // Adjust based on case type
    if (caseType === "CRIMINAL") {
      winProbability *= 0.85; // Lower probability for criminal cases
    } else if (caseType === "FAMILY") {
      winProbability *= 0.9;
    }

    // Normalize to 0.3-0.95 range for realism
    winProbability = Math.max(0.3, Math.min(0.95, winProbability));

    // Calculate recommended settlement
    const estimatedValue = caseData?.estimatedValue || 500000;
    const recommendedSettlement = estimatedValue * (1 - winProbability) * 0.8;

    // Risk score (inverse of win probability)
    const riskScore = Math.round((1 - winProbability) * 100);

    // Generate recommendations
    const recommendations = [];
    if (winProbability < 0.5) {
      recommendations.push("Consider settlement negotiations");
      recommendations.push("Strengthen evidence collection");
    } else if (winProbability >= 0.7) {
      recommendations.push("Strong case - proceed to trial");
      recommendations.push("Focus on key evidence presentation");
    } else {
      recommendations.push("Moderate case strength - evaluate settlement options");
      recommendations.push("Consider mediation as alternative");
    }

    if (caseFactors.evidenceStrength < 0.6) {
      recommendations.push("Evidence quality needs improvement");
    }

    if (caseFactors.opposingCounselStrength > 0.7) {
      recommendations.push("Strong opposing counsel - prepare thoroughly");
    }

    const prediction = {
      caseId: caseId || null,
      winProbability: Math.round(winProbability * 100) / 100,
      riskScore,
      recommendedSettlement: Math.round(recommendedSettlement),
      confidence: winProbability > 0.7 || winProbability < 0.4 ? "HIGH" : "MEDIUM",
      factors: caseFactors,
      recommendations,
      estimatedTrialDuration: Math.round(180 + (1 - winProbability) * 120), // days
      estimatedCost: Math.round(50000 + (1 - winProbability) * 100000),
      timestamp: new Date().toISOString(),
    };

    // Save prediction to database (optional - create predictions table later)
    res.json(prediction);
  } catch (error) {
    console.error("Predictive analysis error:", error);
    res.status(500).json({ error: "Failed to generate prediction", message: error.message });
  }
});

/**
 * Get AI Legal Strategy Generator
 * Generates strategic recommendations based on case analysis
 */
router.post("/generate-strategy", async (req, res) => {
  try {
    const { caseId, caseType: providedCaseType, priority: providedPriority } = req.body;

    // Fetch case data if caseId provided
    let caseData = null;
    if (caseId) {
      caseData = await prisma.case.findFirst({
        where: {
          id: caseId,
          organizationId: req.user.organizationId,
        },
      });
    }

    // Use provided values or case data or defaults
    const caseType = providedCaseType || (caseData?.practiceArea ? mapPracticeAreaToCaseType(caseData.practiceArea) : "CIVIL");
    const priority = providedPriority || caseData?.priority || "MEDIUM";

    const strategies = {
      CIVIL: {
        high: [
          "Aggressive discovery strategy",
          "Early motion practice to limit scope",
          "Expert witness preparation",
          "Settlement leverage through strong evidence",
        ],
        medium: [
          "Balanced approach with settlement options",
          "Standard discovery process",
          "Mediation consideration",
          "Cost-benefit analysis",
        ],
        low: [
          "Efficient resolution focus",
          "Limited discovery",
          "Early settlement discussions",
          "Cost containment",
        ],
      },
      CRIMINAL: {
        high: [
          "Comprehensive defense strategy",
          "Evidence suppression motions",
          "Expert testimony preparation",
          "Jury selection strategy",
        ],
        medium: [
          "Standard defense protocols",
          "Plea negotiation evaluation",
          "Witness preparation",
          "Legal research on precedents",
        ],
        low: [
          "Efficient case resolution",
          "Plea bargain evaluation",
          "Minimal resource allocation",
          "Quick disposition focus",
        ],
      },
      FAMILY: {
        high: [
          "Child custody evaluation",
          "Asset protection strategy",
          "Mediation preparation",
          "Expert evaluations",
        ],
        medium: [
          "Collaborative approach",
          "Mediation focus",
          "Documentation emphasis",
          "Communication strategy",
        ],
        low: [
          "Amicable resolution",
          "Direct negotiation",
          "Minimal court involvement",
          "Cost-effective approach",
        ],
      },
    };

    const caseTypeStrategies = strategies[caseType] || strategies.CIVIL;
    const priorityStrategies = caseTypeStrategies[priority] || caseTypeStrategies.medium;

    const strategy = {
      caseId: caseId || null,
      caseType,
      priority,
      strategies: priorityStrategies,
      timeline: {
        immediate: priorityStrategies.slice(0, 2),
        shortTerm: priorityStrategies.slice(2, 4),
        longTerm: priorityStrategies.slice(4) || [],
      },
      estimatedEffort: priority === "HIGH" ? "High" : priority === "MEDIUM" ? "Medium" : "Low",
      timestamp: new Date().toISOString(),
    };

    res.json(strategy);
  } catch (error) {
    console.error("Strategy generation error:", error);
    res.status(500).json({ error: "Failed to generate strategy", message: error.message });
  }
});

/**
 * Legal Risk Scoring Engine
 * Calculates comprehensive risk score for cases
 */
router.post("/risk-score", async (req, res) => {
  try {
    const { caseId, factors } = req.body;

    let caseData = null;
    if (caseId) {
      caseData = await prisma.case.findFirst({
        where: {
          id: caseId,
          organizationId: req.user.organizationId,
        },
      });
    }

    const riskFactors = factors || {
      financialExposure: caseData?.estimatedValue || 100000,
      evidenceQuality: 0.7,
      legalPrecedent: 0.6,
      clientCooperation: 0.8,
      opposingPartyStrength: 0.5,
      jurisdictionComplexity: 0.6,
      timePressure: 0.5,
    };

    // Calculate risk components
    const financialRisk = Math.min(riskFactors.financialExposure / 1000000, 1) * 30;
    const evidenceRisk = (1 - riskFactors.evidenceQuality) * 25;
    const precedentRisk = (1 - riskFactors.legalPrecedent) * 15;
    const cooperationRisk = (1 - riskFactors.clientCooperation) * 10;
    const oppositionRisk = riskFactors.opposingPartyStrength * 10;
    const complexityRisk = riskFactors.jurisdictionComplexity * 5;
    const timeRisk = riskFactors.timePressure * 5;

    const totalRiskScore = Math.round(
      financialRisk +
        evidenceRisk +
        precedentRisk +
        cooperationRisk +
        oppositionRisk +
        complexityRisk +
        timeRisk
    );

    const riskLevel =
      totalRiskScore >= 70
        ? "CRITICAL"
        : totalRiskScore >= 50
        ? "HIGH"
        : totalRiskScore >= 30
        ? "MEDIUM"
        : "LOW";

    const riskBreakdown = {
      financial: Math.round(financialRisk),
      evidence: Math.round(evidenceRisk),
      precedent: Math.round(precedentRisk),
      cooperation: Math.round(cooperationRisk),
      opposition: Math.round(oppositionRisk),
      complexity: Math.round(complexityRisk),
      time: Math.round(timeRisk),
    };

    const mitigation = [];
    if (riskBreakdown.evidence > 15) {
      mitigation.push("Strengthen evidence collection and documentation");
    }
    if (riskBreakdown.financial > 20) {
      mitigation.push("Consider insurance coverage or settlement");
    }
    if (riskBreakdown.opposition > 8) {
      mitigation.push("Prepare for aggressive opposition strategy");
    }
    if (riskBreakdown.cooperation > 7) {
      mitigation.push("Improve client communication and cooperation");
    }

    res.json({
      caseId: caseId || null,
      totalRiskScore,
      riskLevel,
      riskBreakdown,
      mitigation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Risk scoring error:", error);
    res.status(500).json({ error: "Failed to calculate risk score", message: error.message });
  }
});

/**
 * Get cases for predictive analysis
 */
router.get("/cases", async (req, res) => {
  try {
    console.log("Fetching cases for organization:", req.user.organizationId);
    console.log("User:", req.user.id, req.user.email);
    
    const cases = await prisma.case.findMany({
      where: {
        organizationId: req.user.organizationId,
      },
      select: {
        id: true,
        title: true,
        practiceArea: true,
        status: true,
        priority: true,
        estimatedValue: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    console.log(`Found ${cases.length} cases for organization ${req.user.organizationId}`);
    res.json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Failed to fetch cases", message: error.message });
  }
});

module.exports = router;
