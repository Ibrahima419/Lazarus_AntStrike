-- CreateTable
CREATE TABLE "playbooks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'response',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "trigger" JSONB NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "variables" JSONB NOT NULL DEFAULT '{}',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvers" JSONB NOT NULL DEFAULT '[]',
    "timeout" INTEGER NOT NULL DEFAULT 3600,
    "retryPolicy" JSONB NOT NULL DEFAULT '{}',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "author" TEXT,
    "createdBy" TEXT,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgExecutionTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "playbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playbook_executions" (
    "id" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "triggerSource" TEXT,
    "triggerData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "currentStep" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "executionTime" INTEGER,
    "results" JSONB NOT NULL DEFAULT '{}',
    "errors" JSONB NOT NULL DEFAULT '[]',
    "approvals" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playbook_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playbook_step_executions" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "executionTime" INTEGER,
    "output" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "playbook_step_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playbooks_tenantId_idx" ON "playbooks"("tenantId");

-- CreateIndex
CREATE INDEX "playbooks_category_idx" ON "playbooks"("category");

-- CreateIndex
CREATE INDEX "playbooks_isPublished_idx" ON "playbooks"("isPublished");

-- CreateIndex
CREATE INDEX "playbooks_isActive_idx" ON "playbooks"("isActive");

-- CreateIndex
CREATE INDEX "playbook_executions_tenantId_idx" ON "playbook_executions"("tenantId");

-- CreateIndex
CREATE INDEX "playbook_executions_playbookId_idx" ON "playbook_executions"("playbookId");

-- CreateIndex
CREATE INDEX "playbook_executions_status_idx" ON "playbook_executions"("status");

-- CreateIndex
CREATE INDEX "playbook_executions_startedAt_idx" ON "playbook_executions"("startedAt");

-- CreateIndex
CREATE INDEX "playbook_step_executions_executionId_idx" ON "playbook_step_executions"("executionId");

-- CreateIndex
CREATE INDEX "playbook_step_executions_stepId_idx" ON "playbook_step_executions"("stepId");

-- AddForeignKey
ALTER TABLE "playbooks" ADD CONSTRAINT "playbooks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playbook_executions" ADD CONSTRAINT "playbook_executions_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "playbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playbook_executions" ADD CONSTRAINT "playbook_executions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playbook_step_executions" ADD CONSTRAINT "playbook_step_executions_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "playbook_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
