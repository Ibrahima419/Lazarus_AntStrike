/**
 * 🧪 Alert Management Tests
 * Tests unitaires pour la gestion des alertes
 */

import { AlertManagementService } from '../src/services/alert-management.service';
import { prisma } from '../src/config/database';

describe('AlertManagementService', () => {
  const mockTenantId = 'test-tenant-alert-123';
  const mockUserId = 'test-user-alert-123';
  let mockAlertId: string;

  afterAll(async () => {
    // Cleanup
    await prisma.alertHistory.deleteMany({ where: { alertId: mockAlertId } });
    await prisma.alert.deleteMany({ where: { tenantId: mockTenantId } });
    await prisma.$disconnect();
  });

  describe('createAlert', () => {
    it('should create an alert with deduplication check', async () => {
      const input = {
        title: 'Suspicious Login Attempt',
        description: 'Multiple failed login attempts detected',
        severity: 'high' as const,
        priority: 'P2' as const,
        source: 'firewall',
        tags: ['authentication', 'brute-force']
      };

      const result = await AlertManagementService.createAlert(mockTenantId, input);

      mockAlertId = result.alert.id;

      expect(result).toBeDefined();
      expect(result.isDuplicate).toBe(false);
      expect(result.alert.id).toBeDefined();
      expect(result.alert.title).toBe(input.title);
      expect(result.alert.severity).toBe('high');
      expect(result.alert.priority).toBe('P2');
      expect(result.alert.fingerprint).toBeDefined();
    });

    it('should detect duplicate alerts within 24h', async () => {
      const input = {
        title: 'Suspicious Login Attempt',
        description: 'Multiple failed login attempts detected',
        severity: 'high' as const,
        source: 'firewall'
      };

      const result = await AlertManagementService.createAlert(mockTenantId, input);

      expect(result.isDuplicate).toBe(true);
      expect(result.message).toContain('already exists');
    });

    it('should auto-assign P1 priority for critical severity', async () => {
      const input = {
        title: 'Ransomware Detected',
        severity: 'critical' as const
      };

      const result = await AlertManagementService.createAlert(mockTenantId, input);

      expect(result.alert.priority).toBe('P1');
      expect(result.alert.slaResponseTime).toBe(15); // P1 = 15min

      await prisma.alert.delete({ where: { id: result.alert.id } });
    });
  });

  describe('getAlert', () => {
    it('should retrieve alert with SLA status', async () => {
      const alert = await AlertManagementService.getAlert(mockTenantId, mockAlertId);

      expect(alert).toBeDefined();
      expect(alert.id).toBe(mockAlertId);
      expect(alert.slaStatus).toBeDefined();
      expect(alert.slaStatus.response).toBeDefined();
      expect(alert.slaStatus.resolution).toBeDefined();
    });

    it('should return null for non-existent alert', async () => {
      const alert = await AlertManagementService.getAlert(mockTenantId, 'non-existent-id');

      expect(alert).toBeNull();
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge a new alert', async () => {
      const result = await AlertManagementService.acknowledgeAlert(
        mockTenantId,
        mockAlertId,
        mockUserId
      );

      expect(result).toBeDefined();

      const updated = await prisma.alert.findUnique({ where: { id: mockAlertId } });
      expect(updated?.status).toBe('acknowledged');
      expect(updated?.acknowledgedAt).toBeDefined();
    });
  });

  describe('assignAlert', () => {
    it('should assign alert to analyst', async () => {
      const assignee = 'analyst-123';
      const result = await AlertManagementService.assignAlert(
        mockTenantId,
        mockAlertId,
        assignee,
        mockUserId
      );

      expect(result).toBeDefined();

      const updated = await prisma.alert.findUnique({ where: { id: mockAlertId } });
      expect(updated?.assignee).toBe(assignee);
      expect(updated?.assignedAt).toBeDefined();
      expect(updated?.status).toBe('assigned');
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an alert', async () => {
      const resolution = 'False positive - legitimate traffic';
      const result = await AlertManagementService.resolveAlert(
        mockTenantId,
        mockAlertId,
        resolution,
        mockUserId
      );

      expect(result).toBeDefined();

      const updated = await prisma.alert.findUnique({ where: { id: mockAlertId } });
      expect(updated?.status).toBe('resolved');
      expect(updated?.resolvedAt).toBeDefined();
    });
  });

  describe('closeAlert', () => {
    it('should close an alert', async () => {
      const result = await AlertManagementService.closeAlert(
        mockTenantId,
        mockAlertId,
        mockUserId
      );

      expect(result).toBeDefined();

      const updated = await prisma.alert.findUnique({ where: { id: mockAlertId } });
      expect(updated?.status).toBe('closed');
      expect(updated?.closedAt).toBeDefined();
    });
  });

  describe('addNote', () => {
    it('should add a note to alert', async () => {
      const content = 'This is a test note';
      const note = await AlertManagementService.addNote(
        mockAlertId,
        mockUserId,
        content
      );

      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
      expect(note.content).toBe(content);
      expect(note.userId).toBe(mockUserId);

      await prisma.alertNote.delete({ where: { id: note.id } });
    });
  });

  describe('getHistory', () => {
    it('should retrieve alert history', async () => {
      const history = await AlertManagementService.getHistory(mockAlertId);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      
      // Vérifier qu'il y a bien les actions créées
      const actions = history.map(h => h.action);
      expect(actions).toContain('created');
    });
  });

  describe('bulkOperation', () => {
    it('should acknowledge multiple alerts', async () => {
      // Créer 3 alertes pour bulk test
      const alerts = await Promise.all([
        AlertManagementService.createAlert(mockTenantId, { 
          title: 'Bulk Test 1', 
          severity: 'low' as const 
        }),
        AlertManagementService.createAlert(mockTenantId, { 
          title: 'Bulk Test 2', 
          severity: 'low' as const 
        }),
        AlertManagementService.createAlert(mockTenantId, { 
          title: 'Bulk Test 3', 
          severity: 'low' as const 
        })
      ]);

      const alertIds = alerts.map(a => a.alert.id);

      const result = await AlertManagementService.bulkOperation(
        mockTenantId,
        alertIds,
        'acknowledge',
        {},
        mockUserId
      );

      expect(result.updated).toBe(3);

      // Cleanup
      await prisma.alert.deleteMany({ where: { id: { in: alertIds } } });
    });
  });

  describe('getStats', () => {
    it('should return alert statistics', async () => {
      const stats = await AlertManagementService.getStats(mockTenantId);

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
      expect(Array.isArray(stats.bySeverity)).toBe(true);
      expect(Array.isArray(stats.byStatus)).toBe(true);
      expect(Array.isArray(stats.byPriority)).toBe(true);
      expect(typeof stats.mtta).toBe('number');
      expect(typeof stats.mttr).toBe('number');
    });
  });

  describe('checkSLAViolations', () => {
    it('should detect SLA violations', async () => {
      const violationCount = await AlertManagementService.checkSLAViolations(mockTenantId);

      expect(typeof violationCount).toBe('number');
      expect(violationCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSLAViolations', () => {
    it('should retrieve alerts with SLA violations', async () => {
      const violations = await AlertManagementService.getSLAViolations(mockTenantId);

      expect(Array.isArray(violations)).toBe(true);
    });
  });
});



