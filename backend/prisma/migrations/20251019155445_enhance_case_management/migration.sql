-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "acknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "affectedSystems" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "affectedUsers" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "category" TEXT,
ADD COLUMN     "confidenceScore" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "containedAt" TIMESTAMP(3),
ADD COLUMN     "impactLevel" TEXT NOT NULL DEFAULT 'low',
ADD COLUMN     "investigator" TEXT,
ADD COLUMN     "parentCaseId" TEXT,
ADD COLUMN     "participants" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'P3',
ADD COLUMN     "relatedCases" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "remediatedAt" TIMESTAMP(3),
ADD COLUMN     "slaResolutionTime" INTEGER,
ADD COLUMN     "slaResponseTime" INTEGER,
ADD COLUMN     "slaViolated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceType" TEXT,
ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "triagedAt" TIMESTAMP(3),
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'incident',
ALTER COLUMN "status" SET DEFAULT 'new';

-- CreateTable
CREATE TABLE "case_timeline" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "actor" TEXT,
    "description" TEXT,
    "metadata" JSONB,

    CONSTRAINT "case_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_notes" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'note',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_tasks" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assignee" TEXT,
    "assignedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedTime" INTEGER,
    "actualTime" INTEGER,
    "dependsOn" JSONB NOT NULL DEFAULT '[]',
    "blockedBy" TEXT,
    "blockedReason" TEXT,
    "checklist" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "hash" TEXT,
    "storagePath" TEXT,
    "storageUrl" TEXT,
    "collectedBy" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "sourceSystem" TEXT,
    "chainOfCustody" JSONB NOT NULL DEFAULT '[]',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "tags" JSONB NOT NULL DEFAULT '[]',
    "category" TEXT,
    "metadata" JSONB,
    "extractedIOCs" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "case_timeline_caseId_idx" ON "case_timeline"("caseId");

-- CreateIndex
CREATE INDEX "case_timeline_timestamp_idx" ON "case_timeline"("timestamp");

-- CreateIndex
CREATE INDEX "case_notes_caseId_idx" ON "case_notes"("caseId");

-- CreateIndex
CREATE INDEX "case_notes_userId_idx" ON "case_notes"("userId");

-- CreateIndex
CREATE INDEX "case_tasks_caseId_idx" ON "case_tasks"("caseId");

-- CreateIndex
CREATE INDEX "case_tasks_tenantId_idx" ON "case_tasks"("tenantId");

-- CreateIndex
CREATE INDEX "case_tasks_assignee_idx" ON "case_tasks"("assignee");

-- CreateIndex
CREATE INDEX "case_tasks_status_idx" ON "case_tasks"("status");

-- CreateIndex
CREATE INDEX "evidence_caseId_idx" ON "evidence"("caseId");

-- CreateIndex
CREATE INDEX "evidence_tenantId_idx" ON "evidence"("tenantId");

-- CreateIndex
CREATE INDEX "evidence_hash_idx" ON "evidence"("hash");

-- CreateIndex
CREATE INDEX "cases_priority_idx" ON "cases"("priority");

-- CreateIndex
CREATE INDEX "cases_assignee_idx" ON "cases"("assignee");

-- AddForeignKey
ALTER TABLE "case_timeline" ADD CONSTRAINT "case_timeline_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_tasks" ADD CONSTRAINT "case_tasks_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
