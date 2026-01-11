-- CreateTable
CREATE TABLE "IntakeSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT
);
