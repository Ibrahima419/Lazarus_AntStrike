-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MANAGER';

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "createdBy" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3),
    "closureNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_notes" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'OBSERVATION',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigation_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ioc_enrichments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "iocValue" TEXT NOT NULL,
    "iocType" TEXT NOT NULL,
    "source" TEXT,
    "enrichmentData" JSONB NOT NULL DEFAULT '{}',
    "lastEnriched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ioc_enrichments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playbooks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "triggerConditions" JSONB NOT NULL DEFAULT '{}',
    "actions" JSONB NOT NULL DEFAULT '[]',
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecuted" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threat_correlations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "threatId" TEXT NOT NULL,
    "relatedThreatId" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "commonIndicators" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "threat_correlations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyst_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "casesClosed" INTEGER NOT NULL DEFAULT 0,
    "alertsTriaged" INTEGER NOT NULL DEFAULT 0,
    "threatsAnalyzed" INTEGER NOT NULL DEFAULT 0,
    "avgMTTR" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analyst_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cve_enrichments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cveId" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "cvssScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "published" TIMESTAMP(3) NOT NULL,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "enrichmentData" JSONB NOT NULL DEFAULT '{}',
    "lastEnriched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cve_enrichments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cases_tenantId_idx" ON "cases"("tenantId");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "cases_severity_idx" ON "cases"("severity");

-- CreateIndex
CREATE INDEX "cases_assignedTo_idx" ON "cases"("assignedTo");

-- CreateIndex
CREATE INDEX "cases_createdBy_idx" ON "cases"("createdBy");

-- CreateIndex
CREATE INDEX "investigation_notes_caseId_idx" ON "investigation_notes"("caseId");

-- CreateIndex
CREATE INDEX "investigation_notes_userId_idx" ON "investigation_notes"("userId");

-- CreateIndex
CREATE INDEX "ioc_enrichments_tenantId_idx" ON "ioc_enrichments"("tenantId");

-- CreateIndex
CREATE INDEX "ioc_enrichments_iocType_idx" ON "ioc_enrichments"("iocType");

-- CreateIndex
CREATE UNIQUE INDEX "ioc_enrichments_tenantId_iocValue_iocType_key" ON "ioc_enrichments"("tenantId", "iocValue", "iocType");

-- CreateIndex
CREATE INDEX "playbooks_tenantId_idx" ON "playbooks"("tenantId");

-- CreateIndex
CREATE INDEX "playbooks_enabled_idx" ON "playbooks"("enabled");

-- CreateIndex
CREATE INDEX "threat_correlations_tenantId_idx" ON "threat_correlations"("tenantId");

-- CreateIndex
CREATE INDEX "threat_correlations_threatId_idx" ON "threat_correlations"("threatId");

-- CreateIndex
CREATE INDEX "threat_correlations_relatedThreatId_idx" ON "threat_correlations"("relatedThreatId");

-- CreateIndex
CREATE UNIQUE INDEX "threat_correlations_tenantId_threatId_relatedThreatId_key" ON "threat_correlations"("tenantId", "threatId", "relatedThreatId");

-- CreateIndex
CREATE INDEX "analyst_metrics_userId_idx" ON "analyst_metrics"("userId");

-- CreateIndex
CREATE INDEX "analyst_metrics_date_idx" ON "analyst_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "analyst_metrics_userId_date_key" ON "analyst_metrics"("userId", "date");

-- CreateIndex
CREATE INDEX "cve_enrichments_tenantId_idx" ON "cve_enrichments"("tenantId");

-- CreateIndex
CREATE INDEX "cve_enrichments_cveId_idx" ON "cve_enrichments"("cveId");

-- CreateIndex
CREATE INDEX "cve_enrichments_severity_idx" ON "cve_enrichments"("severity");

-- CreateIndex
CREATE INDEX "cve_enrichments_published_idx" ON "cve_enrichments"("published");

-- CreateIndex
CREATE UNIQUE INDEX "cve_enrichments_tenantId_cveId_key" ON "cve_enrichments"("tenantId", "cveId");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_notes" ADD CONSTRAINT "investigation_notes_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ioc_enrichments" ADD CONSTRAINT "ioc_enrichments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playbooks" ADD CONSTRAINT "playbooks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threat_correlations" ADD CONSTRAINT "threat_correlations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cve_enrichments" ADD CONSTRAINT "cve_enrichments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
