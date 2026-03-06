-- CreateTable
CREATE TABLE "CaseFactors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "evidenceStrength" REAL NOT NULL DEFAULT 0.7,
    "judgeHistory" REAL NOT NULL DEFAULT 0.6,
    "similarCaseOutcomes" REAL NOT NULL DEFAULT 0.65,
    "clientHistory" REAL NOT NULL DEFAULT 0.7,
    "opposingCounselStrength" REAL NOT NULL DEFAULT 0.5,
    "jurisdiction" TEXT NOT NULL DEFAULT 'STATE',
    "notes" TEXT,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaseFactors_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ORG_ADMIN',
    "organizationId" TEXT,
    "phone" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "lastLogin", "name", "organizationId", "password", "phone", "role", "twoFactorEnabled", "twoFactorSecret", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "lastLogin", "name", "organizationId", "password", "phone", "role", "twoFactorEnabled", "twoFactorSecret", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CaseFactors_caseId_key" ON "CaseFactors"("caseId");
