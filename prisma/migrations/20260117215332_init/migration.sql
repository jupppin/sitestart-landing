-- CreateTable
CREATE TABLE "IntakeSubmission" (
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
    "revenue" REAL,
    "projectStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "projectNotes" TEXT,
    "liveUrl" TEXT,
    "goLiveDate" DATETIME,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionCurrentPeriodEnd" DATETIME,
    "subscriptionCanceledAt" DATETIME,
    "billingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "lastInvoiceDate" DATETIME,
    "lastInvoicePaidAt" DATETIME,
    "setupFeeToken" TEXT,
    "subscriptionToken" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "IntakeSubmission_stripeCustomerId_key" ON "IntakeSubmission"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeSubmission_stripeSubscriptionId_key" ON "IntakeSubmission"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeSubmission_setupFeeToken_key" ON "IntakeSubmission"("setupFeeToken");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeSubmission_subscriptionToken_key" ON "IntakeSubmission"("subscriptionToken");
