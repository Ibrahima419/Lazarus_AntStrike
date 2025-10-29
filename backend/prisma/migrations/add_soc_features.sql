-- Migration: Add SOC Features
-- Cases, IOC Enrichment, Playbooks, Investigation Notes, Correlations, Metrics

-- Cases (Investigation Cases)
CREATE TABLE IF NOT EXISTS "cases" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "alertId" TEXT,
  "storyId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "assignedTo" TEXT,
  "team" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP,
  "resolvedAt" TIMESTAMP,
  "closedAt" TIMESTAMP,
  "mttr" INTEGER,
  "mttd" INTEGER,
  "notes" JSONB DEFAULT '[]',
  "evidence" JSONB DEFAULT '[]',
  "timeline" JSONB DEFAULT '[]',
  "playbook" JSONB,
  CONSTRAINT "cases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
);

CREATE INDEX "cases_tenantId_status_idx" ON "cases"("tenantId", "status");
CREATE INDEX "cases_assignedTo_idx" ON "cases"("assignedTo");

-- IOC Enrichment Cache
CREATE TABLE IF NOT EXISTS "ioc_enrichments" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "ioc" TEXT NOT NULL,
  "iocType" TEXT NOT NULL,
  "reputation" JSONB NOT NULL DEFAULT '{}',
  "sources" JSONB NOT NULL DEFAULT '{}',
  "enrichedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP NOT NULL,
  CONSTRAINT "ioc_enrichments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  UNIQUE("ioc", "iocType")
);

CREATE INDEX "ioc_enrichments_tenantId_idx" ON "ioc_enrichments"("tenantId");
CREATE INDEX "ioc_enrichments_ioc_idx" ON "ioc_enrichments"("ioc");

-- Investigation Notes
CREATE TABLE IF NOT EXISTS "investigation_notes" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'note',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "investigation_notes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
);

CREATE INDEX "investigation_notes_caseId_idx" ON "investigation_notes"("caseId");

-- Playbooks
CREATE TABLE IF NOT EXISTS "playbooks" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "steps" JSONB NOT NULL DEFAULT '[]',
  "automated" BOOLEAN NOT NULL DEFAULT false,
  "timesUsed" INTEGER NOT NULL DEFAULT 0,
  "avgCompletionTime" INTEGER,
  CONSTRAINT "playbooks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
);

CREATE INDEX "playbooks_tenantId_category_idx" ON "playbooks"("tenantId", "category");

-- Threat Correlations
CREATE TABLE IF NOT EXISTS "threat_correlations" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "threatId1" TEXT NOT NULL,
  "threatId2" TEXT NOT NULL,
  "correlationType" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "detectedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "threat_correlations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  UNIQUE("threatId1", "threatId2", "correlationType")
);

CREATE INDEX "threat_correlations_tenantId_idx" ON "threat_correlations"("tenantId");

-- Analyst Metrics
CREATE TABLE IF NOT EXISTS "analyst_metrics" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "alertsHandled" INTEGER NOT NULL DEFAULT 0,
  "casesClosed" INTEGER NOT NULL DEFAULT 0,
  "avgMTTR" INTEGER,
  "avgMTTD" INTEGER,
  "falsePositives" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "analyst_metrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  UNIQUE("userId", "date")
);

CREATE INDEX "analyst_metrics_tenantId_idx" ON "analyst_metrics"("tenantId");
CREATE INDEX "analyst_metrics_userId_date_idx" ON "analyst_metrics"("userId", "date");

