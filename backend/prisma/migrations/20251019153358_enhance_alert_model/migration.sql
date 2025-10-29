-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "acknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignee" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "correlatedAlerts" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "fingerprint" TEXT,
ADD COLUMN     "parentAlertId" TEXT,
ADD COLUMN     "priority" TEXT DEFAULT 'P3',
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "slaResolutionTime" INTEGER,
ADD COLUMN     "slaResponseTime" INTEGER,
ADD COLUMN     "slaViolated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "alert_notes" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_history" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "changes" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alert_notes_alertId_idx" ON "alert_notes"("alertId");

-- CreateIndex
CREATE INDEX "alert_history_alertId_idx" ON "alert_history"("alertId");

-- CreateIndex
CREATE INDEX "alert_history_timestamp_idx" ON "alert_history"("timestamp");

-- CreateIndex
CREATE INDEX "alerts_priority_idx" ON "alerts"("priority");

-- CreateIndex
CREATE INDEX "alerts_assignee_idx" ON "alerts"("assignee");

-- CreateIndex
CREATE INDEX "alerts_fingerprint_idx" ON "alerts"("fingerprint");

-- AddForeignKey
ALTER TABLE "alert_notes" ADD CONSTRAINT "alert_notes_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_history" ADD CONSTRAINT "alert_history_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
