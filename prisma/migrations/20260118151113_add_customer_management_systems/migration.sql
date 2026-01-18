-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customerId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'GENERAL',
    "authorName" TEXT,
    CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "IntakeSubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customerId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    CONSTRAINT "CustomerFile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "IntakeSubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerDeployment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customerId" INTEGER NOT NULL,
    "cfProjectId" TEXT,
    "cfProjectName" TEXT,
    "cfProductionUrl" TEXT,
    "customDomain" TEXT,
    "domainStatus" TEXT NOT NULL DEFAULT 'NONE',
    "deploymentStatus" TEXT NOT NULL DEFAULT 'NOT_DEPLOYED',
    "lastDeploymentAt" DATETIME,
    "lastDeploymentId" TEXT,
    "lastDeploymentError" TEXT,
    "gitRepoUrl" TEXT,
    "gitBranch" TEXT NOT NULL DEFAULT 'main',
    CONSTRAINT "CustomerDeployment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "IntakeSubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
