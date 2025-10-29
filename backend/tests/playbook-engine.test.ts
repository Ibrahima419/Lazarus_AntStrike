/**
 * 🧪 Playbook Engine Tests
 * Tests unitaires pour le moteur de playbooks SOAR
 */

import { PlaybookEngineService } from '../src/services/playbook-engine.service';
import { prisma } from '../src/config/database';

describe('PlaybookEngineService', () => {
  const mockTenantId = 'test-tenant-123';
  const mockUserId = 'test-user-123';
  let mockPlaybookId: string;

  beforeAll(async () => {
    // Créer un playbook de test
    const playbook = await prisma.playbook.create({
      data: {
        tenantId: mockTenantId,
        name: 'Test Playbook',
        description: 'Playbook for testing',
        category: 'test',
        type: 'response',
        trigger: { eventType: 'alert.created' },
        steps: [
          {
            id: 'step-1',
            type: 'action',
            name: 'Block IP',
            actionType: 'block_ip',
            actionConfig: { ip: '{{alert.ip}}', duration: 3600 },
            nextStepOnSuccess: 'step-2'
          },
          {
            id: 'step-2',
            type: 'action',
            name: 'Send Notification',
            actionType: 'send_email',
            actionConfig: { to: 'soc@test.com', subject: 'IP Blocked' },
            nextStepOnSuccess: 'step-3'
          },
          {
            id: 'step-3',
            type: 'end',
            name: 'End'
          }
        ],
        variables: {},
        isActive: true,
        createdBy: mockUserId
      }
    });

    mockPlaybookId = playbook.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.playbookExecution.deleteMany({ where: { tenantId: mockTenantId } });
    await prisma.playbook.deleteMany({ where: { id: mockPlaybookId } });
    await prisma.$disconnect();
  });

  describe('executePlaybook', () => {
    it('should execute a simple playbook successfully', async () => {
      const triggerData = {
        source: 'test',
        alert: {
          id: 'alert-123',
          ip: '192.168.1.100',
          severity: 'high'
        }
      };

      const result = await PlaybookEngineService.executePlaybook(
        mockTenantId,
        mockPlaybookId,
        triggerData,
        'manual'
      );

      expect(result).toBeDefined();
      expect(result.executionId).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.results).toBeDefined();
    });

    it('should throw error for inactive playbook', async () => {
      // Désactiver le playbook
      await prisma.playbook.update({
        where: { id: mockPlaybookId },
        data: { isActive: false }
      });

      await expect(
        PlaybookEngineService.executePlaybook(mockTenantId, mockPlaybookId, {}, 'manual')
      ).rejects.toThrow('Playbook not found or inactive');

      // Réactiver
      await prisma.playbook.update({
        where: { id: mockPlaybookId },
        data: { isActive: true }
      });
    });

    it('should interpolate variables correctly', async () => {
      const triggerData = {
        alert: {
          ip: '10.0.0.1',
          severity: 'critical'
        }
      };

      const result = await PlaybookEngineService.executePlaybook(
        mockTenantId,
        mockPlaybookId,
        triggerData,
        'auto'
      );

      expect(result.status).toBe('completed');
      // L'IP devrait être interpolée dans les résultats
      expect(JSON.stringify(result.results)).toContain('10.0.0.1');
    });
  });

  describe('getExecutions', () => {
    it('should retrieve executions for a tenant', async () => {
      const executions = await PlaybookEngineService.getExecutions(mockTenantId);

      expect(Array.isArray(executions)).toBe(true);
      expect(executions.length).toBeGreaterThan(0);
    });

    it('should filter executions by playbookId', async () => {
      const executions = await PlaybookEngineService.getExecutions(mockTenantId, mockPlaybookId);

      expect(Array.isArray(executions)).toBe(true);
      executions.forEach(exec => {
        expect(exec.playbookId).toBe(mockPlaybookId);
      });
    });

    it('should limit executions results', async () => {
      const limit = 5;
      const executions = await PlaybookEngineService.getExecutions(mockTenantId, undefined, limit);

      expect(executions.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('getExecutionDetails', () => {
    it('should retrieve execution details with steps', async () => {
      // Créer une execution
      const execution = await prisma.playbookExecution.create({
        data: {
          playbookId: mockPlaybookId,
          tenantId: mockTenantId,
          triggeredBy: 'test',
          status: 'completed'
        }
      });

      const details = await PlaybookEngineService.getExecutionDetails(mockTenantId, execution.id);

      expect(details).toBeDefined();
      expect(details.id).toBe(execution.id);
      expect(details.playbook).toBeDefined();
      expect(Array.isArray(details.stepExecutions)).toBe(true);

      // Cleanup
      await prisma.playbookExecution.delete({ where: { id: execution.id } });
    });

    it('should return null for non-existent execution', async () => {
      const details = await PlaybookEngineService.getExecutionDetails(
        mockTenantId,
        'non-existent-id'
      );

      expect(details).toBeNull();
    });
  });

  describe('cancelExecution', () => {
    it('should cancel a running execution', async () => {
      // Créer une execution en cours
      const execution = await prisma.playbookExecution.create({
        data: {
          playbookId: mockPlaybookId,
          tenantId: mockTenantId,
          triggeredBy: 'test',
          status: 'running'
        }
      });

      const result = await PlaybookEngineService.cancelExecution(mockTenantId, execution.id);

      expect(result).toBeDefined();

      // Vérifier que le status a changé
      const updated = await prisma.playbookExecution.findUnique({
        where: { id: execution.id }
      });

      expect(updated?.status).toBe('cancelled');
      expect(updated?.completedAt).toBeDefined();

      // Cleanup
      await prisma.playbookExecution.delete({ where: { id: execution.id } });
    });
  });
});

