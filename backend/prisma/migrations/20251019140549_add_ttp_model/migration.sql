-- CreateTable
CREATE TABLE "ttps" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "threatId" TEXT,
    "alertId" TEXT,
    "caseId" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'manual',
    "tactic" TEXT NOT NULL,
    "tacticId" TEXT NOT NULL,
    "technique" TEXT NOT NULL,
    "techniqueId" TEXT NOT NULL,
    "subTechnique" TEXT,
    "subTechniqueId" TEXT,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "evidence" JSONB DEFAULT '[]',
    "extractedFrom" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ttps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ttps_tenantId_tactic_idx" ON "ttps"("tenantId", "tactic");

-- CreateIndex
CREATE INDEX "ttps_tenantId_techniqueId_idx" ON "ttps"("tenantId", "techniqueId");

-- CreateIndex
CREATE INDEX "ttps_threatId_idx" ON "ttps"("threatId");

-- CreateIndex
CREATE INDEX "ttps_confidence_idx" ON "ttps"("confidence");

-- AddForeignKey
ALTER TABLE "ttps" ADD CONSTRAINT "ttps_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
