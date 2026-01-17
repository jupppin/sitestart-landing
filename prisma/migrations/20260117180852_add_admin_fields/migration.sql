/*
  Warnings:

  - Added the required column `updatedAt` to the `IntakeSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IntakeSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "businessName" TEXT NOT NULL,
    "industryType" TEXT NOT NULL,
    "currentWebsite" TEXT,
    "hasNoWebsite" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT NOT NULL,
    "otherFeatures" TEXT,
    "budgetRange" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "paidAt" DATETIME,
    "revenue" REAL
);
INSERT INTO "new_IntakeSubmission" ("additionalInfo", "budgetRange", "businessName", "contacted", "createdAt", "currentWebsite", "email", "features", "fullName", "hasNoWebsite", "id", "industryType", "notes", "otherFeatures", "phone", "timeline", "updatedAt") SELECT "additionalInfo", "budgetRange", "businessName", "contacted", "createdAt", "currentWebsite", "email", "features", "fullName", "hasNoWebsite", "id", "industryType", "notes", "otherFeatures", "phone", "timeline", "createdAt" FROM "IntakeSubmission";
DROP TABLE "IntakeSubmission";
ALTER TABLE "new_IntakeSubmission" RENAME TO "IntakeSubmission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
