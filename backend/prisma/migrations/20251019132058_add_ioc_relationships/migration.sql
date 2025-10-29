-- CreateTable
CREATE TABLE "ioc_relationships" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ioc1" TEXT NOT NULL,
    "ioc2" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL DEFAULT 'related',
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "context" JSONB DEFAULT '{}',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ioc_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ioc_relationships_tenantId_ioc1_idx" ON "ioc_relationships"("tenantId", "ioc1");

-- CreateIndex
CREATE INDEX "ioc_relationships_tenantId_ioc2_idx" ON "ioc_relationships"("tenantId", "ioc2");

-- CreateIndex
CREATE INDEX "ioc_relationships_relationshipType_idx" ON "ioc_relationships"("relationshipType");
