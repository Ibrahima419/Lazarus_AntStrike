-- CreateTable
CREATE TABLE "ioc_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "iocValue" TEXT NOT NULL,
    "iocType" TEXT NOT NULL,
    "enrichmentData" JSONB NOT NULL DEFAULT '{}',
    "threatScore" INTEGER NOT NULL DEFAULT 0,
    "reputation" TEXT NOT NULL DEFAULT 'unknown',
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,

    CONSTRAINT "ioc_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ioc_history_tenantId_iocValue_iocType_idx" ON "ioc_history"("tenantId", "iocValue", "iocType");

-- CreateIndex
CREATE INDEX "ioc_history_observedAt_idx" ON "ioc_history"("observedAt");

-- AddForeignKey
ALTER TABLE "ioc_history" ADD CONSTRAINT "ioc_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
