-- Migration: Add CaseFactors table for storing predictive analysis factors
-- This allows lawyers to input real data for more accurate predictions

CREATE TABLE IF NOT EXISTS "CaseFactors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "evidenceStrength" REAL DEFAULT 0.7,
    "judgeHistory" REAL DEFAULT 0.6,
    "similarCaseOutcomes" REAL DEFAULT 0.65,
    "clientHistory" REAL DEFAULT 0.7,
    "opposingCounselStrength" REAL DEFAULT 0.5,
    "jurisdiction" TEXT DEFAULT 'STATE',
    "notes" TEXT,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseFactors_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CaseFactors_caseId_key" ON "CaseFactors"("caseId");
