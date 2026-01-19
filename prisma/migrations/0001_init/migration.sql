-- CreateTable
CREATE TABLE "IntakeSubmission" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
    "paidAt" TIMESTAMP(3),
    "revenue" DOUBLE PRECISION,
    "projectStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "projectNotes" TEXT,
    "liveUrl" TEXT,
    "goLiveDate" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
    "subscriptionCanceledAt" TIMESTAMP(3),
    "billingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "lastInvoiceDate" TIMESTAMP(3),
    "lastInvoicePaidAt" TIMESTAMP(3),
    "setupFeeToken" TEXT,
    "subscriptionToken" TEXT,

    CONSTRAINT "IntakeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'GENERAL',
    "authorName" TEXT,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerFile" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,

    CONSTRAINT "CustomerFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDeployment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "cfProjectId" TEXT,
    "cfProjectName" TEXT,
    "cfProductionUrl" TEXT,
    "customDomain" TEXT,
    "domainStatus" TEXT NOT NULL DEFAULT 'NONE',
    "deploymentStatus" TEXT NOT NULL DEFAULT 'NOT_DEPLOYED',
    "lastDeploymentAt" TIMESTAMP(3),
    "lastDeploymentId" TEXT,
    "lastDeploymentError" TEXT,
    "gitRepoUrl" TEXT,
    "gitBranch" TEXT NOT NULL DEFAULT 'main',

    CONSTRAINT "CustomerDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntakeSubmission_stripeCustomerId_key" ON "IntakeSubmission"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeSubmission_stripeSubscriptionId_key" ON "IntakeSubmission"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeSubmission_setupFeeToken_key" ON "IntakeSubmission"("setupFeeToken");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeSubmission_subscriptionToken_key" ON "IntakeSubmission"("subscriptionToken");

-- CreateIndex
CREATE INDEX "CustomerNote_customerId_idx" ON "CustomerNote"("customerId");

-- CreateIndex
CREATE INDEX "CustomerNote_noteType_idx" ON "CustomerNote"("noteType");

-- CreateIndex
CREATE INDEX "CustomerNote_createdAt_idx" ON "CustomerNote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerFile_fileKey_key" ON "CustomerFile"("fileKey");

-- CreateIndex
CREATE INDEX "CustomerFile_customerId_idx" ON "CustomerFile"("customerId");

-- CreateIndex
CREATE INDEX "CustomerFile_category_idx" ON "CustomerFile"("category");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDeployment_customerId_key" ON "CustomerDeployment"("customerId");

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "IntakeSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFile" ADD CONSTRAINT "CustomerFile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "IntakeSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDeployment" ADD CONSTRAINT "CustomerDeployment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "IntakeSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
