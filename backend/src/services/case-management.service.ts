/**
 * 📁 Case Management Service
 * Gestion complète des investigations et incidents
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface CaseInput {
  title: string;
  description?: string;
  type?: 'incident' | 'investigation' | 'vulnerability' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  category?: string;
  tags?: string[];
  source?: string;
  affectedSystems?: string[];
  affectedUsers?: string[];
}

interface CaseFilters {
  type?: string[];
  severity?: string[];
  status?: string[];
  priority?: string[];
  assignee?: string;
  investigator?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

interface SLAConfig {
  P1: { response: number; resolution: number };
  P2: { response: number; resolution: number };
  P3: { response: number; resolution: number };
  P4: { response: number; resolution: number };
}

const CASE_SLA: SLAConfig = {
  P1: { response: 30, resolution: 240 },     // 30min, 4h
  P2: { response: 60, resolution: 480 },     // 1h, 8h
  P3: { response: 240, resolution: 1440 },   // 4h, 24h
  P4: { response: 480, resolution: 4320 }    // 8h, 72h
};

export class CaseManagementService {
  /**
   * Créer un case
   */
  static async createCase(
    tenantId: string,
    input: CaseInput,
    userId?: string
  ): Promise<any> {
    try {
      logger.info(`Creating case: ${input.title}`);

      // Déterminer priority
      const priority = input.priority || this.determinePriority(input.severity);

      // SLA
      const sla = CASE_SLA[priority as keyof SLAConfig];

      const caseRecord = await prisma.case.create({
        data: {
          tenantId,
          title: input.title,
          description: input.description,
          type: input.type || 'incident',
          severity: input.severity,
          priority,
          category: input.category,
          tags: input.tags || [],
          source: input.source,
          affectedSystems: input.affectedSystems || [],
          affectedUsers: input.affectedUsers || [],
          status: 'new',
          slaResponseTime: sla.response,
          slaResolutionTime: sla.resolution
        }
      });

      // Timeline entry
      await this.addTimelineEntry(caseRecord.id, 'created', userId, 'Case created');

      logger.info(`Case created: ${caseRecord.id}`);
      return caseRecord;
    } catch (error: any) {
      logger.error('Error creating case:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir un case
   */
  static async getCase(
    tenantId: string,
    caseId: string
  ): Promise<any> {
    const caseRecord = await prisma.case.findFirst({
      where: { id: caseId, tenantId },
      include: {
        timeline: { orderBy: { timestamp: 'desc' }, take: 50 },
        notes: { orderBy: { createdAt: 'desc' }, take: 20 },
        tasks: { orderBy: { createdAt: 'desc' } },
        evidence: { orderBy: { collectedAt: 'desc' } },
        threats: { include: { threat: true } },
        alerts: { include: { alert: true } }
      }
    });

    if (!caseRecord) return null;

    // Calculer SLA status
    const slaStatus = this.calculateSLAStatus(caseRecord);

    // Calculer progress
    const progress = this.calculateProgress(caseRecord);

    return {
      ...caseRecord,
      slaStatus,
      progress
    };
  }

  /**
   * Lister les cases
   */
  static async listCases(
    tenantId: string,
    filters: CaseFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    const where: any = { tenantId };

    if (filters.type && filters.type.length > 0) {
      where.type = { in: filters.type };
    }
    if (filters.severity && filters.severity.length > 0) {
      where.severity = { in: filters.severity };
    }
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }
    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }
    if (filters.assignee) {
      where.assignee = filters.assignee;
    }
    if (filters.investigator) {
      where.investigator = filters.investigator;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          threats: { include: { threat: { select: { name: true } } } },
          alerts: { include: { alert: { select: { title: true, severity: true } } } }
        },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.case.count({ where })
    ]);

    return {
      cases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Mettre à jour un case
   */
  static async updateCase(
    tenantId: string,
    caseId: string,
    updates: Partial<CaseInput>,
    userId?: string
  ): Promise<any> {
    try {
      const caseRecord = await prisma.case.updateMany({
        where: { id: caseId, tenantId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      await this.addTimelineEntry(caseId, 'updated', userId, 'Case updated', updates);

      logger.info(`Case updated: ${caseId}`);
      return caseRecord;
    } catch (error: any) {
      logger.error('Error updating case:', error.message);
      throw error;
    }
  }

  /**
   * Triage
   */
  static async triage(
    tenantId: string,
    caseId: string,
    userId?: string
  ): Promise<any> {
    try {
      const caseRecord = await prisma.case.updateMany({
        where: { id: caseId, tenantId, status: 'new' },
        data: {
          status: 'triage',
          triagedAt: new Date(),
          updatedAt: new Date()
        }
      });

      await this.addTimelineEntry(caseId, 'triaged', userId, 'Case triaged');
      logger.info(`Case triaged: ${caseId}`);
      return caseRecord;
    } catch (error: any) {
      logger.error('Error triaging case:', error.message);
      throw error;
    }
  }

  /**
   * Start Investigation
   */
  static async investigate(
    tenantId: string,
    caseId: string,
    investigator: string,
    userId?: string
  ): Promise<any> {
    try {
      const caseRecord = await prisma.case.updateMany({
        where: { id: caseId, tenantId },
        data: {
          status: 'investigating',
          investigator,
          updatedAt: new Date()
        }
      });

      await this.addTimelineEntry(caseId, 'investigation_started', userId, 
        `Investigation started by ${investigator}`);
      
      logger.info(`Investigation started: ${caseId}`);
      return caseRecord;
    } catch (error: any) {
      logger.error('Error starting investigation:', error.message);
      throw error;
    }
  }

  /**
   * Contain
   */
  static async contain(
    tenantId: string,
    caseId: string,
    userId?: string
  ): Promise<any> {
    try {
      const caseRecord = await prisma.case.updateMany({
        where: { id: caseId, tenantId },
        data: {
          status: 'contained',
          containedAt: new Date(),
          updatedAt: new Date()
        }
      });

      await this.addTimelineEntry(caseId, 'contained', userId, 'Threat contained');
      logger.info(`Case contained: ${caseId}`);
      return caseRecord;
    } catch (error: any) {
      logger.error('Error containing case:', error.message);
      throw error;
    }
  }

  /**
   * Remediate
   */
  static async remediate(
    tenantId: string,
    caseId: string,
    userId?: string
  ): Promise<any> {
    try {
      const caseRecord = await prisma.case.updateMany({
        where: { id: caseId, tenantId },
        data: {
          status: 'remediation',
          remediatedAt: new Date(),
          updatedAt: new Date()
        }
      });

      await this.addTimelineEntry(caseId, 'remediation_started', userId, 'Remediation started');
      logger.info(`Remediation started: ${caseId}`);
      return caseRecord;
    } catch (error: any) {
      logger.error('Error remediating case:', error.message);
      throw error;
    }
  }

  /**
   * Close case
   */
  static async closeCase(
    tenantId: string,
    caseId: string,
    resolution: string,
    userId?: string
  ): Promise<any> {
    try {
      const caseRecord = await prisma.case.updateMany({
        where: { id: caseId, tenantId },
        data: {
          status: 'closed',
          closedAt: new Date(),
          updatedAt: new Date()
        }
      });

      await this.addTimelineEntry(caseId, 'closed', userId, 
        `Case closed: ${resolution}`);
      
      logger.info(`Case closed: ${caseId}`);
      return caseRecord;
    } catch (error: any) {
      logger.error('Error closing case:', error.message);
      throw error;
    }
  }

  /**
   * Assigner un case
   */
  static async assignCase(
    tenantId: string,
    caseId: string,
    assignee: string,
    userId?: string
  ): Promise<any> {
    try {
      const caseRecord = await prisma.case.updateMany({
        where: { id: caseId, tenantId },
        data: {
          assignee,
          assignedAt: new Date(),
          updatedAt: new Date()
        }
      });

      await this.addTimelineEntry(caseId, 'assigned', userId, 
        `Assigned to ${assignee}`);
      
      logger.info(`Case assigned: ${caseId}`);
      return caseRecord;
    } catch (error: any) {
      logger.error('Error assigning case:', error.message);
      throw error;
    }
  }

  /**
   * Ajouter une note
   */
  static async addNote(
    caseId: string,
    userId: string,
    content: string,
    type: string = 'note',
    isPrivate: boolean = false
  ): Promise<any> {
    try {
      const note = await prisma.caseNote.create({
        data: {
          caseId,
          userId,
          content,
          type,
          isPrivate
        }
      });

      await this.addTimelineEntry(caseId, 'note_added', userId, 
        `Note added: ${content.substring(0, 50)}...`);

      logger.info(`Note added to case ${caseId}`);
      return note;
    } catch (error: any) {
      logger.error('Error adding note:', error.message);
      throw error;
    }
  }

  /**
   * Ajouter entrée timeline
   */
  private static async addTimelineEntry(
    caseId: string,
    action: string,
    actor?: string | null,
    description?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await prisma.caseTimeline.create({
        data: {
          caseId,
          action,
          actor: actor || null,
          description,
          metadata
        }
      });
    } catch (error: any) {
      logger.error('Error adding timeline entry:', error.message);
    }
  }

  /**
   * Calculer SLA status
   */
  private static calculateSLAStatus(caseRecord: any): any {
    const now = new Date();
    const created = caseRecord.createdAt;

    const responseDeadline = new Date(created.getTime() + (caseRecord.slaResponseTime || 240) * 60 * 1000);
    const resolutionDeadline = new Date(created.getTime() + (caseRecord.slaResolutionTime || 1440) * 60 * 1000);

    // Response SLA
    let responseStatus = 'ok';
    let responseRemaining = 0;

    if (caseRecord.triagedAt) {
      const responseTime = (caseRecord.triagedAt.getTime() - created.getTime()) / 60000;
      responseStatus = responseTime <= (caseRecord.slaResponseTime || 240) ? 'met' : 'violated';
    } else {
      responseRemaining = Math.floor((responseDeadline.getTime() - now.getTime()) / 60000);
      if (responseRemaining < 0) responseStatus = 'violated';
      else if (responseRemaining < (caseRecord.slaResponseTime || 240) * 0.2) responseStatus = 'at_risk';
    }

    // Resolution SLA
    let resolutionStatus = 'ok';
    let resolutionRemaining = 0;

    if (caseRecord.closedAt) {
      const resolutionTime = (caseRecord.closedAt.getTime() - created.getTime()) / 60000;
      resolutionStatus = resolutionTime <= (caseRecord.slaResolutionTime || 1440) ? 'met' : 'violated';
    } else {
      resolutionRemaining = Math.floor((resolutionDeadline.getTime() - now.getTime()) / 60000);
      if (resolutionRemaining < 0) resolutionStatus = 'violated';
      else if (resolutionRemaining < (caseRecord.slaResolutionTime || 1440) * 0.2) resolutionStatus = 'at_risk';
    }

    return {
      response: {
        status: responseStatus,
        deadline: responseDeadline,
        remainingMinutes: responseRemaining
      },
      resolution: {
        status: resolutionStatus,
        deadline: resolutionDeadline,
        remainingMinutes: resolutionRemaining
      }
    };
  }

  /**
   * Calculer progress (%)
   */
  private static calculateProgress(caseRecord: any): number {
    const statusWeights: Record<string, number> = {
      'new': 0,
      'triage': 15,
      'investigating': 40,
      'contained': 65,
      'remediation': 85,
      'closed': 100
    };

    let progress = statusWeights[caseRecord.status] || 0;

    // Bonus pour tasks complétées
    if (caseRecord.tasks && caseRecord.tasks.length > 0) {
      const completedTasks = caseRecord.tasks.filter((t: any) => t.status === 'done').length;
      const taskProgress = (completedTasks / caseRecord.tasks.length) * 20;
      progress = Math.min(progress + taskProgress, 95);
    }

    return progress;
  }

  /**
   * Déterminer priority depuis severity
   */
  private static determinePriority(severity: string): string {
    switch (severity) {
      case 'critical': return 'P1';
      case 'high': return 'P2';
      case 'medium': return 'P3';
      default: return 'P4';
    }
  }

  /**
   * Stats globales
   */
  static async getStats(tenantId: string): Promise<any> {
    const total = await prisma.case.count({ where: { tenantId } });

    const byType = await prisma.case.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: true
    });

    const bySeverity = await prisma.case.groupBy({
      by: ['severity'],
      where: { tenantId },
      _count: true
    });

    const byStatus = await prisma.case.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true
    });

    // MTTA (Mean Time To Acknowledge/Triage)
    const triagedCases = await prisma.case.findMany({
      where: {
        tenantId,
        triagedAt: { not: null }
      },
      select: { createdAt: true, triagedAt: true }
    });

    const mtta = triagedCases.length > 0
      ? triagedCases.reduce((sum, c) => {
          return sum + (c.triagedAt!.getTime() - c.createdAt.getTime());
        }, 0) / triagedCases.length / 60000 // minutes
      : 0;

    // MTTR (Mean Time To Resolve)
    const closedCases = await prisma.case.findMany({
      where: {
        tenantId,
        closedAt: { not: null }
      },
      select: { createdAt: true, closedAt: true }
    });

    const mttr = closedCases.length > 0
      ? closedCases.reduce((sum, c) => {
          return sum + (c.closedAt!.getTime() - c.createdAt.getTime());
        }, 0) / closedCases.length / 60000 // minutes
      : 0;

    return {
      total,
      byType: byType.map(t => ({ type: t.type, count: t._count })),
      bySeverity: bySeverity.map(s => ({ severity: s.severity, count: s._count })),
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
      mtta: Math.round(mtta),
      mttr: Math.round(mttr)
    };
  }
}

