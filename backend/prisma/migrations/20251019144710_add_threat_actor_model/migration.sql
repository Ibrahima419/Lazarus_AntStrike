-- CreateTable
CREATE TABLE "threat_actors" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" JSONB NOT NULL DEFAULT '[]',
    "type" TEXT NOT NULL DEFAULT 'unknown',
    "country" TEXT,
    "sponsorship" TEXT,
    "motivation" TEXT,
    "sophistication" TEXT NOT NULL DEFAULT 'unknown',
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "targetSectors" JSONB NOT NULL DEFAULT '[]',
    "targetCountries" JSONB NOT NULL DEFAULT '[]',
    "targetTech" JSONB NOT NULL DEFAULT '[]',
    "preferredTTPs" JSONB NOT NULL DEFAULT '[]',
    "tools" JSONB NOT NULL DEFAULT '[]',
    "malwareFamilies" JSONB NOT NULL DEFAULT '[]',
    "knownIPs" JSONB NOT NULL DEFAULT '[]',
    "knownDomains" JSONB NOT NULL DEFAULT '[]',
    "knownEmails" JSONB NOT NULL DEFAULT '[]',
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "threatLevel" TEXT NOT NULL DEFAULT 'medium',
    "campaigns" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threat_actors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "threat_actors_tenantId_idx" ON "threat_actors"("tenantId");

-- CreateIndex
CREATE INDEX "threat_actors_name_idx" ON "threat_actors"("name");

-- CreateIndex
CREATE INDEX "threat_actors_country_idx" ON "threat_actors"("country");

-- CreateIndex
CREATE INDEX "threat_actors_status_idx" ON "threat_actors"("status");

-- CreateIndex
CREATE INDEX "threat_actors_threatLevel_idx" ON "threat_actors"("threatLevel");

-- AddForeignKey
ALTER TABLE "threat_actors" ADD CONSTRAINT "threat_actors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
