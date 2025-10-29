/**
 * 🚨 Alert Management Service
 * Gestion avancée des alertes avec workflow, SLA, assignment
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import crypto from 'crypto';

interface AlertInput {
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  category?: string;
  tags?: string[];
  source?: string;
  threatId?: string;
  raw?: any;
}

interface AlertFilters {
  severity?: string[];
  status?: string[];
  priority?: string[];
  assignee?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

interface SLAConfig {
  P1: { response: number; resolution: number }; // minutes
  P2: { response: number; resolution: number };
  P3: { response: number; resolution: number };
  P4: { response: number; resolution: number };
}

const DEFAULT_SLA: SLAConfig = {
  P1: { response: 15, resolution: 240 },    // 15min, 4h
  P2: { response: 30, resolution: 480 },    // 30min, 8h
  P3: { response: 60, resolution: 1440 },   // 1h, 24h
  P4: { response: 240, resolution: 2880 }   // 4h, 48h
};

export class AlertManagementService {
  /**
   * Créer une alerte
   */
  static async createAlert(
    tenantId: string,
    input: AlertInput
  ): Promise<any> {
    try {
      logger.info(`Creating alert: ${input.title}`);

      // Déterminer priority si non fournie
      const priority = input.priority || this.determinePriority(input.severity);

      // Calculer SLA
      const sla = DEFAULT_SLA[priority as keyof SLAConfig];

      // Générer fingerprint pour deduplication
      const fingerprint = this.generateFingerprint(input);

      // Vérifier duplicates récents (24h)
      const duplicate = await this.findDuplicate(tenantId, fingerprint);
      if (duplicate) {
        logger.info(`Duplicate alert found: ${duplicate.id}`);
        return {
          alert: duplicate,
          isDuplicate: true,
          message: 'Alert already exists'
        };
      }

      // Créer alerte
      const alert = await prisma.alert.create({
        data: {
          tenantId,
          title: input.title,
          description: input.description,
          severity: input.severity,
          priority,
          category: input.category,
          tags: input.tags || [],
          source: input.source,
          threatId: input.threatId,
          raw: input.raw,
          status: 'new',
          fingerprint,
          slaResponseTime: sla.response,
          slaResolutionTime: sla.resolution
        }
      });

      // Créer entrée historique
      await this.addHistory(alert.id, 'created', null, { 
        severity: input.severity,
        priority 
      });

      logger.info(`Alert created: ${alert.id}`);
      return { alert, isDuplicate: false };
    } catch (error: any) {
      logger.error('Error creating alert:', error.message);
      throw error;
    }
  }

  /**
   * Générer fingerprint pour deduplication
   */
  private static generateFingerprint(input: AlertInput): string {
    const data = {
      title: input.title.toLowerCase().trim(),
      severity: input.severity,
      source: input.source
    };
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Trouver duplicate récent
   */
  private static async findDuplicate(
    tenantId: string,
    fingerprint: string
  ): Promise<any | null> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await prisma.alert.findFirst({
      where: {
        tenantId,
        fingerprint,
        createdAt: { gte: oneDayAgo },
        status: { not: 'closed' }
      }
    });
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
   * Obtenir une alerte
   */
  static async getAlert(
    tenantId: string,
    alertId: string
  ): Promise<any> {
    const alert = await prisma.alert.findFirst({
      where: { id: alertId, tenantId },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' }
        },
        history: {
          orderBy: { timestamp: 'desc' }
        },
        threat: {
          select: { id: true, name: true, type: true, severity: true }
        }
      }
    });

    if (!alert) return null;

    // Calculer SLA status
    const slaStatus = this.calculateSLAStatus(alert);

    return {
      ...alert,
      slaStatus
    };
  }

  /**
   * Lister les alertes
   */
  static async listAlerts(
    tenantId: string,
    filters: AlertFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    const where: any = { tenantId };

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
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          threat: { select: { name: true, type: true } }
        },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.alert.count({ where })
    ]);

    return {
      alerts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Mettre à jour une alerte
   */
  static async updateAlert(
    tenantId: string,
    alertId: string,
    updates: Partial<AlertInput>,
    userId?: string
  ): Promise<any> {
    try {
      const alert = await prisma.alert.updateMany({
        where: { id: alertId, tenantId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      // Historique
      await this.addHistory(alertId, 'updated', userId, updates);

      logger.info(`Alert updated: ${alertId}`);
      return alert;
    } catch (error: any) {
      logger.error('Error updating alert:', error.message);
      throw error;
    }
  }

  /**
   * Acquitter une alerte
   */
  static async acknowledgeAlert(
    tenantId: string,
    alertId: string,
    userId: string
  ): Promise<any> {
    try {
      const alert = await prisma.alert.updateMany({
        where: { id: alertId, tenantId, status: 'new' },
        data: {
          status: 'acknowledged',
          acknowledgedAt: new Date(),
          updatedAt: new Date()
        }
      });

      await this.addHistory(alertId, 'acknowledged', userId);
      logger.info(`Alert acknowledged: ${alertId}`);
      return alert;
    } catch (error: any) {
      logger.error('Error acknowledging alert:', error.message);
      throw error;
    }
  }

  /**
   * Assigner une alerte
   */
  static async assignAlert(
    tenantId: string,
    alertId: string,
    assignee: string,
    userId?: string
  ): Promise<any> {
    try {
      const alert = await prisma.alert.updateMany({
        where: { id: alertId, tenantId },
        data: {
          assignee,
          assignedAt: new Date(),
          status: 'assigned',
          updatedAt: new Date()
        }
      });

      await this.addHistory(alertId, 'assigned', userId, { assignee });
      logger.info(`Alert assigned to ${assignee}: ${alertId}`);
      return alert;
    } catch (error: any) {
      logger.error('Error assigning alert:', error.message);
      throw error;
    }
  }

  /**
   * Résoudre une alerte
   */
  static async resolveAlert(
    tenantId: string,
    alertId: string,
    resolution: string,
    userId?: string
  ): Promise<any> {
    try {
      const alert = await prisma.alert.updateMany({
        where: { id: alertId, tenantId },
        data: {
          status: 'resolved',
          resolvedAt: new Date(),
          updatedAt: new Date()
        }
      });

      await this.addHistory(alertId, 'resolved', userId, { resolution });
      logger.info(`Alert resolved: ${alertId}`);
      return alert;
    } catch (error: any) {
      logger.error('Error resolving alert:', error.message);
      throw error;
    }
  }

  /**
   * Clôturer une alerte
   */
  static async closeAlert(
    tenantId: string,
    alertId: string,
    userId?: string
  ): Promise<any> {
    try {
      const alert = await prisma.alert.updateMany({
        where: { id: alertId, tenantId },
        data: {
          status: 'closed',
          closedAt: new Date(),
          updatedAt: new Date()
        }
      });

      await this.addHistory(alertId, 'closed', userId);
      logger.info(`Alert closed: ${alertId}`);
      return alert;
    } catch (error: any) {
      logger.error('Error closing alert:', error.message);
      throw error;
    }
  }

  /**
   * Ajouter une note
   */
  static async addNote(
    alertId: string,
    userId: string,
    content: string
  ): Promise<any> {
    try {
      const note = await prisma.alertNote.create({
        data: {
          alertId,
          userId,
          content
        }
      });

      await this.addHistory(alertId, 'note_added', userId, { 
        noteId: note.id 
      });

      logger.info(`Note added to alert ${alertId}`);
      return note;
    } catch (error: any) {
      logger.error('Error adding note:', error.message);
      throw error;
    }
  }

  /**
   * Ajouter entrée historique
   */
  private static async addHistory(
    alertId: string,
    action: string,
    userId?: string | null,
    changes?: any
  ): Promise<void> {
    try {
      await prisma.alertHistory.create({
        data: {
          alertId,
          action,
          userId: userId || null,
          changes: changes || null
        }
      });
    } catch (error: any) {
      logger.error('Error adding history:', error.message);
    }
  }

  /**
   * Obtenir historique d'une alerte
   */
  static async getHistory(alertId: string): Promise<any[]> {
    return await prisma.alertHistory.findMany({
      where: { alertId },
      orderBy: { timestamp: 'desc' }
    });
  }

  /**
   * Calculer SLA status
   */
  private static calculateSLAStatus(alert: any): any {
    const now = new Date();
    const created = alert.createdAt;

    const responseDeadline = new Date(created.getTime() + (alert.slaResponseTime || 60) * 60 * 1000);
    const resolutionDeadline = new Date(created.getTime() + (alert.slaResolutionTime || 1440) * 60 * 1000);

    // Response SLA
    let responseStatus = 'ok';
    let responseRemaining = 0;

    if (alert.acknowledgedAt) {
      const responseTime = (alert.acknowledgedAt.getTime() - created.getTime()) / 60000; // minutes
      responseStatus = responseTime <= (alert.slaResponseTime || 60) ? 'met' : 'violated';
    } else {
      responseRemaining = Math.floor((responseDeadline.getTime() - now.getTime()) / 60000);
      if (responseRemaining < 0) responseStatus = 'violated';
      else if (responseRemaining < (alert.slaResponseTime || 60) * 0.2) responseStatus = 'at_risk';
    }

    // Resolution SLA
    let resolutionStatus = 'ok';
    let resolutionRemaining = 0;

    if (alert.resolvedAt) {
      const resolutionTime = (alert.resolvedAt.getTime() - created.getTime()) / 60000; // minutes
      resolutionStatus = resolutionTime <= (alert.slaResolutionTime || 1440) ? 'met' : 'violated';
    } else {
      resolutionRemaining = Math.floor((resolutionDeadline.getTime() - now.getTime()) / 60000);
      if (resolutionRemaining < 0) resolutionStatus = 'violated';
      else if (resolutionRemaining < (alert.slaResolutionTime || 1440) * 0.2) resolutionStatus = 'at_risk';
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
   * Obtenir violations SLA
   */
  static async getSLAViolations(tenantId: string): Promise<any[]> {
    const alerts = await prisma.alert.findMany({
      where: {
        tenantId,
        slaViolated: true,
        status: { not: 'closed' }
      },
      orderBy: { createdAt: 'asc' }
    });

    return alerts;
  }

  /**
   * Vérifier et marquer violations SLA
   */
  static async checkSLAViolations(tenantId: string): Promise<number> {
    try {
      const openAlerts = await prisma.alert.findMany({
        where: {
          tenantId,
          status: { notIn: ['resolved', 'closed'] },
          slaViolated: false
        }
      });

      let violationCount = 0;

      for (const alert of openAlerts) {
        const slaStatus = this.calculateSLAStatus(alert);
        
        const isViolated = 
          slaStatus.response.status === 'violated' || 
          slaStatus.resolution.status === 'violated';

        if (isViolated) {
          await prisma.alert.update({
            where: { id: alert.id },
            data: { slaViolated: true }
          });
          
          await this.addHistory(alert.id, 'sla_violated', null, { slaStatus });
          violationCount++;
        }
      }

      logger.info(`SLA check completed: ${violationCount} violations`);
      return violationCount;
    } catch (error: any) {
      logger.error('Error checking SLA violations:', error.message);
      throw error;
    }
  }

  /**
   * Opérations bulk
   */
  static async bulkOperation(
    tenantId: string,
    alertIds: string[],
    operation: 'acknowledge' | 'assign' | 'resolve' | 'close',
    data?: any,
    userId?: string
  ): Promise<any> {
    try {
      logger.info(`Bulk operation: ${operation} on ${alertIds.length} alerts`);

      let updateData: any = { updatedAt: new Date() };

      switch (operation) {
        case 'acknowledge':
          updateData.status = 'acknowledged';
          updateData.acknowledgedAt = new Date();
          break;
        case 'assign':
          updateData.assignee = data.assignee;
          updateData.assignedAt = new Date();
          updateData.status = 'assigned';
          break;
        case 'resolve':
          updateData.status = 'resolved';
          updateData.resolvedAt = new Date();
          break;
        case 'close':
          updateData.status = 'closed';
          updateData.closedAt = new Date();
          break;
      }

      const result = await prisma.alert.updateMany({
        where: {
          id: { in: alertIds },
          tenantId
        },
        data: updateData
      });

      // Historique pour chaque alerte
      for (const alertId of alertIds) {
        await this.addHistory(alertId, `bulk_${operation}`, userId, data);
      }

      logger.info(`Bulk operation completed: ${result.count} alerts updated`);
      return { updated: result.count };
    } catch (error: any) {
      logger.error('Error in bulk operation:', error.message);
      throw error;
    }
  }

  /**
   * Stats globales
   */
  static async getStats(tenantId: string): Promise<any> {
    const total = await prisma.alert.count({ where: { tenantId } });

    const bySeverity = await prisma.alert.groupBy({
      by: ['severity'],
      where: { tenantId },
      _count: true
    });

    const byStatus = await prisma.alert.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true
    });

    const byPriority = await prisma.alert.groupBy({
      by: ['priority'],
      where: { tenantId },
      _count: true
    });

    const slaViolations = await prisma.alert.count({
      where: { tenantId, slaViolated: true }
    });

    // MTTA (Mean Time To Acknowledge)
    const acknowledgedAlerts = await prisma.alert.findMany({
      where: {
        tenantId,
        acknowledgedAt: { not: null }
      },
      select: { createdAt: true, acknowledgedAt: true }
    });

    const mtta = acknowledgedAlerts.length > 0
      ? acknowledgedAlerts.reduce((sum, a) => {
          return sum + (a.acknowledgedAt!.getTime() - a.createdAt.getTime());
        }, 0) / acknowledgedAlerts.length / 60000 // minutes
      : 0;

    // MTTR (Mean Time To Resolve)
    const resolvedAlerts = await prisma.alert.findMany({
      where: {
        tenantId,
        resolvedAt: { not: null }
      },
      select: { createdAt: true, resolvedAt: true }
    });

    const mttr = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, a) => {
          return sum + (a.resolvedAt!.getTime() - a.createdAt.getTime());
        }, 0) / resolvedAlerts.length / 60000 // minutes
      : 0;

    return {
      total,
      bySeverity: bySeverity.map(s => ({
        severity: s.severity,
        count: s._count
      })),
      byStatus: byStatus.map(s => ({
        status: s.status,
        count: s._count
      })),
      byPriority: byPriority.map(p => ({
        priority: p.priority,
        count: p._count
      })),
      slaViolations,
      mtta: Math.round(mtta),
      mttr: Math.round(mttr)
    };
  }
}

