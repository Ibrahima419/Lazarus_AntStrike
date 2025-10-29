/**
 * 🧪 Case Management Tests
 * Tests unitaires pour la gestion des cases
 */

import { CaseManagementService } from '../src/services/case-management.service';
import { prisma } from '../src/config/database';

describe('CaseManagementService', () => {
  const mockTenantId = 'test-tenant-case-123';
  const mockUserId = 'test-user-case-123';
  let mockCaseId: string;

  afterAll(async () => {
    // Cleanup
    await prisma.caseTimeline.deleteMany({ where: { caseId: mockCaseId } });
    await prisma.case.deleteMany({ where: { tenantId: mockTenantId } });
    await prisma.$disconnect();
  });

  describe('createCase', () => {
    it('should create a case with required fields', async () => {
      const input = {
        title: 'Test Security Incident',
        description: 'Test incident for unit testing',
        severity: 'high' as const,
        type: 'incident' as const,
        category: 'malware',
        tags: ['test', 'malware'],
        affectedSystems: ['server-01', 'workstation-23']
      };

      const caseRecord = await CaseManagementService.createCase(
        mockTenantId,
        input,
        mockUserId
      );

      mockCaseId = caseRecord.id;

      expect(caseRecord).toBeDefined();
      expect(caseRecord.id).toBeDefined();
      expect(caseRecord.title).toBe(input.title);
      expect(caseRecord.severity).toBe('high');
      expect(caseRecord.status).toBe('new');
      expect(caseRecord.priority).toBe('P2'); // High = P2
      expect(caseRecord.slaResponseTime).toBe(60); // P2 = 1h
      expect(caseRecord.slaResolutionTime).toBe(480); // P2 = 8h
    });

    it('should auto-assign correct priority based on severity', async () => {
      const criticalCase = await CaseManagementService.createCase(
        mockTenantId,
        { title: 'Critical', severity: 'critical' as const },
        mockUserId
      );

      expect(criticalCase.priority).toBe('P1');
      expect(criticalCase.slaResponseTime).toBe(30); // P1 = 30min

      await prisma.case.delete({ where: { id: criticalCase.id } });
    });
  });

  describe('getCase', () => {
    it('should retrieve case with all relations', async () => {
      const caseRecord = await CaseManagementService.getCase(mockTenantId, mockCaseId);

      expect(caseRecord).toBeDefined();
      expect(caseRecord.id).toBe(mockCaseId);
      expect(caseRecord.timeline).toBeDefined();
      expect(Array.isArray(caseRecord.timeline)).toBe(true);
      expect(caseRecord.slaStatus).toBeDefined();
      expect(caseRecord.progress).toBeDefined();
    });

    it('should return null for non-existent case', async () => {
      const caseRecord = await CaseManagementService.getCase(
        mockTenantId,
        'non-existent-id'
      );

      expect(caseRecord).toBeNull();
    });
  });

  describe('workflow transitions', () => {
    it('should triage a case', async () => {
      const result = await CaseManagementService.triage(mockTenantId, mockCaseId, mockUserId);

      expect(result).toBeDefined();

      // Vérifier le changement de status
      const updated = await prisma.case.findUnique({ where: { id: mockCaseId } });
      expect(updated?.status).toBe('triage');
      expect(updated?.triagedAt).toBeDefined();
    });

    it('should start investigation', async () => {
      const investigator = 'analyst-456';
      const result = await CaseManagementService.investigate(
        mockTenantId,
        mockCaseId,
        investigator,
        mockUserId
      );

      expect(result).toBeDefined();

      const updated = await prisma.case.findUnique({ where: { id: mockCaseId } });
      expect(updated?.status).toBe('investigating');
      expect(updated?.investigator).toBe(investigator);
    });

    it('should contain threat', async () => {
      const result = await CaseManagementService.contain(mockTenantId, mockCaseId, mockUserId);

      expect(result).toBeDefined();

      const updated = await prisma.case.findUnique({ where: { id: mockCaseId } });
      expect(updated?.status).toBe('contained');
      expect(updated?.containedAt).toBeDefined();
    });

    it('should start remediation', async () => {
      const result = await CaseManagementService.remediate(mockTenantId, mockCaseId, mockUserId);

      expect(result).toBeDefined();

      const updated = await prisma.case.findUnique({ where: { id: mockCaseId } });
      expect(updated?.status).toBe('remediation');
      expect(updated?.remediatedAt).toBeDefined();
    });

    it('should close case', async () => {
      const resolution = 'Threat eliminated, systems restored';
      const result = await CaseManagementService.closeCase(
        mockTenantId,
        mockCaseId,
        resolution,
        mockUserId
      );

      expect(result).toBeDefined();

      const updated = await prisma.case.findUnique({ where: { id: mockCaseId } });
      expect(updated?.status).toBe('closed');
      expect(updated?.closedAt).toBeDefined();
    });
  });

  describe('assignCase', () => {
    it('should assign case to analyst', async () => {
      const assignee = 'analyst-789';
      const result = await CaseManagementService.assignCase(
        mockTenantId,
        mockCaseId,
        assignee,
        mockUserId
      );

      expect(result).toBeDefined();

      const updated = await prisma.case.findUnique({ where: { id: mockCaseId } });
      expect(updated?.assignee).toBe(assignee);
      expect(updated?.assignedAt).toBeDefined();
    });
  });

  describe('addNote', () => {
    it('should add a note to case', async () => {
      const content = 'This is a test note for the investigation';
      const note = await CaseManagementService.addNote(
        mockCaseId,
        mockUserId,
        content,
        'note',
        false
      );

      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
      expect(note.content).toBe(content);
      expect(note.userId).toBe(mockUserId);
      expect(note.type).toBe('note');

      // Cleanup
      await prisma.caseNote.delete({ where: { id: note.id } });
    });
  });

  describe('getStats', () => {
    it('should return case statistics', async () => {
      const stats = await CaseManagementService.getStats(mockTenantId);

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
      expect(Array.isArray(stats.byType)).toBe(true);
      expect(Array.isArray(stats.bySeverity)).toBe(true);
      expect(Array.isArray(stats.byStatus)).toBe(true);
      expect(typeof stats.mtta).toBe('number');
      expect(typeof stats.mttr).toBe('number');
    });

    it('should calculate MTTA correctly', async () => {
      const stats = await CaseManagementService.getStats(mockTenantId);

      // MTTA devrait être >= 0
      expect(stats.mtta).toBeGreaterThanOrEqual(0);
    });

    it('should calculate MTTR correctly', async () => {
      const stats = await CaseManagementService.getStats(mockTenantId);

      // MTTR devrait être >= 0
      expect(stats.mttr).toBeGreaterThanOrEqual(0);
    });
  });

  describe('listCases', () => {
    it('should list cases with pagination', async () => {
      const result = await CaseManagementService.listCases(
        mockTenantId,
        {},
        1,
        10
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.cases)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBeGreaterThan(0);
    });

    it('should filter cases by severity', async () => {
      const result = await CaseManagementService.listCases(
        mockTenantId,
        { severity: ['high', 'critical'] },
        1,
        50
      );

      expect(result).toBeDefined();
      result.cases.forEach((c: any) => {
        expect(['high', 'critical']).toContain(c.severity);
      });
    });

    it('should filter cases by status', async () => {
      const result = await CaseManagementService.listCases(
        mockTenantId,
        { status: ['closed'] },
        1,
        50
      );

      expect(result).toBeDefined();
      result.cases.forEach((c: any) => {
        expect(c.status).toBe('closed');
      });
    });
  });
});



