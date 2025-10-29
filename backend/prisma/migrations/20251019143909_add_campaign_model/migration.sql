/*
  Warnings:

  - You are about to drop the column `acknowledgedAt` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `affectedAssets` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `assignedTo` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `iocs` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `notifiedAt` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `notifiedVia` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedActions` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedAt` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `slaDeadline` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `storyId` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `alerts` table. All the data in the column will be lost.
  - The `severity` column on the `alerts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `alerts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `assignedTo` on the `cases` table. All the data in the column will be lost.
  - You are about to drop the column `closureNotes` on the `cases` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `cases` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `cases` table. All the data in the column will be lost.
  - The `status` column on the `cases` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `enabled` on the `integrations` table. All the data in the column will be lost.
  - You are about to drop the column `lastError` on the `integrations` table. All the data in the column will be lost.
  - You are about to drop the column `branding` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodEnd` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `taranisOrgId` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndsAt` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `tenants` table. All the data in the column will be lost.
  - The `plan` column on the `tenants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `confidenceScore` on the `threat_correlations` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `lastLoginAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `taranisUserId` on the `users` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `analyst_metrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `api_keys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `asset_enrichments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cve_enrichments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `investigation_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ioc_enrichments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playbooks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_logs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[domain]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[apiKey]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `integrations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `apiKey` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domain` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "cve_enrichments" DROP CONSTRAINT "cve_enrichments_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "investigation_notes" DROP CONSTRAINT "investigation_notes_caseId_fkey";

-- DropForeignKey
ALTER TABLE "ioc_enrichments" DROP CONSTRAINT "ioc_enrichments_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "playbooks" DROP CONSTRAINT "playbooks_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "report_logs" DROP CONSTRAINT "report_logs_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "threat_correlations" DROP CONSTRAINT "threat_correlations_tenantId_fkey";

-- DropIndex
DROP INDEX "alerts_createdAt_idx";

-- DropIndex
DROP INDEX "alerts_priority_idx";

-- DropIndex
DROP INDEX "alerts_tenantId_status_idx";

-- DropIndex
DROP INDEX "cases_assignedTo_idx";

-- DropIndex
DROP INDEX "cases_createdBy_idx";

-- DropIndex
DROP INDEX "integrations_tenantId_type_name_key";

-- DropIndex
DROP INDEX "tenants_plan_idx";

-- DropIndex
DROP INDEX "tenants_slug_idx";

-- DropIndex
DROP INDEX "tenants_slug_key";

-- DropIndex
DROP INDEX "tenants_status_idx";

-- DropIndex
DROP INDEX "tenants_stripeCustomerId_key";

-- DropIndex
DROP INDEX "tenants_stripeSubscriptionId_key";

-- DropIndex
DROP INDEX "tenants_taranisOrgId_key";

-- DropIndex
DROP INDEX "threat_correlations_tenantId_idx";

-- DropIndex
DROP INDEX "threat_correlations_tenantId_threatId_relatedThreatId_key";

-- DropIndex
DROP INDEX "users_email_idx";

-- DropIndex
DROP INDEX "users_taranisUserId_key";

-- AlterTable
ALTER TABLE "alerts" DROP COLUMN "acknowledgedAt",
DROP COLUMN "affectedAssets",
DROP COLUMN "assignedTo",
DROP COLUMN "category",
DROP COLUMN "iocs",
DROP COLUMN "notifiedAt",
DROP COLUMN "notifiedVia",
DROP COLUMN "priority",
DROP COLUMN "recommendedActions",
DROP COLUMN "resolvedAt",
DROP COLUMN "slaDeadline",
DROP COLUMN "storyId",
DROP COLUMN "summary",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "raw" JSONB,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "threatId" TEXT,
DROP COLUMN "severity",
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'low',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE "cases" DROP COLUMN "assignedTo",
DROP COLUMN "closureNotes",
DROP COLUMN "createdBy",
DROP COLUMN "priority",
ADD COLUMN     "assignee" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "severity" SET DEFAULT 'low',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE "integrations" DROP COLUMN "enabled",
DROP COLUMN "lastError",
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "config" DROP DEFAULT;

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "branding",
DROP COLUMN "currentPeriodEnd",
DROP COLUMN "settings",
DROP COLUMN "slug",
DROP COLUMN "status",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "taranisOrgId",
DROP COLUMN "trialEndsAt",
DROP COLUMN "type",
ADD COLUMN     "apiKey" TEXT NOT NULL,
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "plan",
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free';

-- AlterTable
ALTER TABLE "threat_correlations" ALTER COLUMN "confidenceScore" SET DEFAULT 0,
ALTER COLUMN "confidenceScore" SET DATA TYPE INTEGER,
ALTER COLUMN "commonIndicators" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "ttps" ADD COLUMN     "campaignId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastLoginAt",
DROP COLUMN "preferences",
DROP COLUMN "taranisUserId",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'analyst';

-- DropTable
DROP TABLE "analyst_metrics";

-- DropTable
DROP TABLE "api_keys";

-- DropTable
DROP TABLE "asset_enrichments";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "cve_enrichments";

-- DropTable
DROP TABLE "investigation_notes";

-- DropTable
DROP TABLE "ioc_enrichments";

-- DropTable
DROP TABLE "playbooks";

-- DropTable
DROP TABLE "report_logs";

-- DropEnum
DROP TYPE "AlertStatus";

-- DropEnum
DROP TYPE "CaseStatus";

-- DropEnum
DROP TYPE "Category";

-- DropEnum
DROP TYPE "IntegrationType";

-- DropEnum
DROP TYPE "Plan";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "ReportFormat";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "Severity";

-- DropEnum
DROP TYPE "TenantStatus";

-- DropEnum
DROP TYPE "TenantType";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "threats" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'new',
    "description" TEXT,
    "iocs" JSONB NOT NULL DEFAULT '[]',
    "mitreTactics" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "source" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_threats" (
    "caseId" TEXT NOT NULL,
    "threatId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_threats_pkey" PRIMARY KEY ("caseId","threatId")
);

-- CreateTable
CREATE TABLE "case_alerts" (
    "caseId" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_alerts_pkey" PRIMARY KEY ("caseId","alertId")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feeds" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'json',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'json',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_configurations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stix_bundles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'bundle',
    "specVersion" TEXT NOT NULL DEFAULT '2.1',
    "objects" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stix_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxii_collections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "canRead" BOOLEAN NOT NULL DEFAULT true,
    "canWrite" BOOLEAN NOT NULL DEFAULT false,
    "mediaTypes" JSONB NOT NULL DEFAULT '["application/stix+json;version=2.1"]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taxii_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "misp_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "orgId" TEXT,
    "orgcId" TEXT,
    "info" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "threatLevel" TEXT NOT NULL DEFAULT 'undefined',
    "analysis" TEXT NOT NULL DEFAULT '0',
    "distribution" TEXT NOT NULL DEFAULT '0',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "uuid" TEXT NOT NULL,
    "attributes" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "galaxies" JSONB NOT NULL DEFAULT '[]',
    "rawData" JSONB NOT NULL,
    "lastSync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "misp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cve_vulnerabilities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cveId" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT,
    "cvssScore" DOUBLE PRECISION,
    "cvssVector" TEXT,
    "publishedDate" TIMESTAMP(3),
    "lastModifiedDate" TIMESTAMP(3),
    "cweId" TEXT,
    "references" JSONB NOT NULL DEFAULT '[]',
    "affectedProducts" JSONB NOT NULL DEFAULT '[]',
    "exploitAvailable" BOOLEAN NOT NULL DEFAULT false,
    "exploitMaturity" TEXT,
    "patchAvailable" BOOLEAN NOT NULL DEFAULT false,
    "enrichmentData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cve_vulnerabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "osint_feeds" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "feedType" TEXT NOT NULL,
    "url" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "schedule" TEXT NOT NULL DEFAULT '0 */6 * * *',
    "lastFetch" TIMESTAMP(3),
    "lastSuccess" TIMESTAMP(3),
    "lastError" TEXT,
    "itemsCollected" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "osint_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "darkweb_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "author" TEXT,
    "timestamp" TIMESTAMP(3),
    "iocs" JSONB NOT NULL DEFAULT '[]',
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "threatScore" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "darkweb_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "honeypot_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "honeypotType" TEXT NOT NULL,
    "sourceIp" TEXT NOT NULL,
    "sourcePort" INTEGER,
    "destinationIp" TEXT,
    "destinationPort" INTEGER,
    "protocol" TEXT,
    "payload" TEXT,
    "session" TEXT,
    "username" TEXT,
    "password" TEXT,
    "command" TEXT,
    "iocs" JSONB NOT NULL DEFAULT '[]',
    "threatLevel" TEXT NOT NULL DEFAULT 'low',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "honeypot_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "threatActor" TEXT,
    "motivation" TEXT,
    "sophistication" TEXT NOT NULL DEFAULT 'unknown',
    "country" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "targetSectors" JSONB NOT NULL DEFAULT '[]',
    "targetCountries" JSONB NOT NULL DEFAULT '[]',
    "targetAssets" JSONB NOT NULL DEFAULT '[]',
    "victimCount" INTEGER NOT NULL DEFAULT 0,
    "iocs" JSONB NOT NULL DEFAULT '[]',
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "threats_tenantId_idx" ON "threats"("tenantId");

-- CreateIndex
CREATE INDEX "threats_type_idx" ON "threats"("type");

-- CreateIndex
CREATE INDEX "threats_severity_idx" ON "threats"("severity");

-- CreateIndex
CREATE INDEX "threats_status_idx" ON "threats"("status");

-- CreateIndex
CREATE INDEX "rules_tenantId_idx" ON "rules"("tenantId");

-- CreateIndex
CREATE INDEX "rules_type_idx" ON "rules"("type");

-- CreateIndex
CREATE INDEX "feeds_tenantId_idx" ON "feeds"("tenantId");

-- CreateIndex
CREATE INDEX "workflows_tenantId_idx" ON "workflows"("tenantId");

-- CreateIndex
CREATE INDEX "reports_tenantId_idx" ON "reports"("tenantId");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_configurations_tenantId_key_key" ON "tenant_configurations"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "stix_bundles_bundleId_key" ON "stix_bundles"("bundleId");

-- CreateIndex
CREATE INDEX "stix_bundles_tenantId_idx" ON "stix_bundles"("tenantId");

-- CreateIndex
CREATE INDEX "stix_bundles_bundleId_idx" ON "stix_bundles"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX "taxii_collections_collectionId_key" ON "taxii_collections"("collectionId");

-- CreateIndex
CREATE INDEX "taxii_collections_tenantId_idx" ON "taxii_collections"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "misp_events_uuid_key" ON "misp_events"("uuid");

-- CreateIndex
CREATE INDEX "misp_events_tenantId_idx" ON "misp_events"("tenantId");

-- CreateIndex
CREATE INDEX "misp_events_eventId_idx" ON "misp_events"("eventId");

-- CreateIndex
CREATE INDEX "misp_events_uuid_idx" ON "misp_events"("uuid");

-- CreateIndex
CREATE INDEX "misp_events_published_idx" ON "misp_events"("published");

-- CreateIndex
CREATE UNIQUE INDEX "cve_vulnerabilities_cveId_key" ON "cve_vulnerabilities"("cveId");

-- CreateIndex
CREATE INDEX "cve_vulnerabilities_tenantId_idx" ON "cve_vulnerabilities"("tenantId");

-- CreateIndex
CREATE INDEX "cve_vulnerabilities_cveId_idx" ON "cve_vulnerabilities"("cveId");

-- CreateIndex
CREATE INDEX "cve_vulnerabilities_severity_idx" ON "cve_vulnerabilities"("severity");

-- CreateIndex
CREATE INDEX "cve_vulnerabilities_cvssScore_idx" ON "cve_vulnerabilities"("cvssScore");

-- CreateIndex
CREATE INDEX "osint_feeds_tenantId_idx" ON "osint_feeds"("tenantId");

-- CreateIndex
CREATE INDEX "osint_feeds_feedType_idx" ON "osint_feeds"("feedType");

-- CreateIndex
CREATE INDEX "osint_feeds_enabled_idx" ON "osint_feeds"("enabled");

-- CreateIndex
CREATE INDEX "darkweb_items_tenantId_idx" ON "darkweb_items"("tenantId");

-- CreateIndex
CREATE INDEX "darkweb_items_sourceType_idx" ON "darkweb_items"("sourceType");

-- CreateIndex
CREATE INDEX "darkweb_items_collectedAt_idx" ON "darkweb_items"("collectedAt");

-- CreateIndex
CREATE INDEX "honeypot_logs_tenantId_idx" ON "honeypot_logs"("tenantId");

-- CreateIndex
CREATE INDEX "honeypot_logs_honeypotType_idx" ON "honeypot_logs"("honeypotType");

-- CreateIndex
CREATE INDEX "honeypot_logs_sourceIp_idx" ON "honeypot_logs"("sourceIp");

-- CreateIndex
CREATE INDEX "honeypot_logs_timestamp_idx" ON "honeypot_logs"("timestamp");

-- CreateIndex
CREATE INDEX "campaigns_tenantId_idx" ON "campaigns"("tenantId");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_threatActor_idx" ON "campaigns"("threatActor");

-- CreateIndex
CREATE INDEX "campaigns_confidence_idx" ON "campaigns"("confidence");

-- CreateIndex
CREATE INDEX "alerts_tenantId_idx" ON "alerts"("tenantId");

-- CreateIndex
CREATE INDEX "alerts_threatId_idx" ON "alerts"("threatId");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");

-- CreateIndex
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_apiKey_key" ON "tenants"("apiKey");

-- CreateIndex
CREATE INDEX "ttps_campaignId_idx" ON "ttps"("campaignId");

-- AddForeignKey
ALTER TABLE "threats" ADD CONSTRAINT "threats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threat_correlations" ADD CONSTRAINT "threat_correlations_threatId_fkey" FOREIGN KEY ("threatId") REFERENCES "threats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threat_correlations" ADD CONSTRAINT "threat_correlations_relatedThreatId_fkey" FOREIGN KEY ("relatedThreatId") REFERENCES "threats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_threatId_fkey" FOREIGN KEY ("threatId") REFERENCES "threats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_threats" ADD CONSTRAINT "case_threats_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_threats" ADD CONSTRAINT "case_threats_threatId_fkey" FOREIGN KEY ("threatId") REFERENCES "threats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_alerts" ADD CONSTRAINT "case_alerts_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_alerts" ADD CONSTRAINT "case_alerts_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeds" ADD CONSTRAINT "feeds_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_configurations" ADD CONSTRAINT "tenant_configurations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stix_bundles" ADD CONSTRAINT "stix_bundles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxii_collections" ADD CONSTRAINT "taxii_collections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "misp_events" ADD CONSTRAINT "misp_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cve_vulnerabilities" ADD CONSTRAINT "cve_vulnerabilities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "osint_feeds" ADD CONSTRAINT "osint_feeds_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "darkweb_items" ADD CONSTRAINT "darkweb_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "honeypot_logs" ADD CONSTRAINT "honeypot_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ttps" ADD CONSTRAINT "ttps_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
