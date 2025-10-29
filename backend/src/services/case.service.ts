import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface CreateCaseData {
  title: string;
  description?: string;
  severity: string;
  priority: string;
  status?: string;
  threatIds?: string[];
  alertIds?: string[];
  assignedTo?: string;
}

interface UpdateCaseData {
  title?: string;
  description?: string;
  severity?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
}

export class CaseService {
  /**
   * Créer un nouveau case
   */
  static async createCase(tenantId: string, userId: string, data: CreateCaseData) {
    try {
      const newCase = await prisma.case.create({
        data: {
          title: data.title,
          description: data.description || '',
          severity: data.severity,
          priority: data.priority,
          status: data.status || 'new',
          tenantId,
          // createdBy: userId, // TODO: Ajouter au schéma Prisma si nécessaire
          assignee: data.assignedTo || userId,
          assignedAt: new Date(),
        },
      });

      logger.info(`Case créé: ${newCase.id} par user ${userId}`);
      return newCase;
    } catch (error) {
      logger.error('Erreur création case:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les cases d'un tenant
   */
  static async getCases(tenantId: string, filters?: {
    status?: string;
    severity?: string;
    priority?: string;
    assignedTo?: string;
  }) {
    try {
      const where: any = { tenantId };

      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.severity) {
        where.severity = filters.severity;
      }
      if (filters?.priority) {
        where.priority = filters.priority;
      }
      if (filters?.assignedTo) {
        where.assignee = filters.assignedTo;
      }

      const cases = await prisma.case.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return cases;
    } catch (error) {
      logger.error('Erreur récupération cases:', error);
      throw error;
    }
  }

  /**
   * Récupérer un case par ID
   */
  static async getCaseById(tenantId: string, caseId: string) {
    try {
      const caseData = await prisma.case.findFirst({
        where: {
          id: caseId,
          tenantId,
        },
        include: {
          notes: true,
        },
      });

      if (!caseData) {
        throw new Error('Case non trouvé');
      }

      return caseData;
    } catch (error) {
      logger.error(`Erreur récupération case ${caseId}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour un case
   */
  static async updateCase(tenantId: string, caseId: string, data: UpdateCaseData) {
    try {
      const updatedCase = await prisma.case.update({
        where: {
          id: caseId,
          tenantId,
        },
        data: {
          title: data.title,
          description: data.description,
          severity: data.severity,
          priority: data.priority,
          status: data.status,
          assignee: data.assignedTo,
          updatedAt: new Date(),
        },
      });

      logger.info(`Case mis à jour: ${caseId}`);
      return updatedCase;
    } catch (error) {
      logger.error(`Erreur mise à jour case ${caseId}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer un case
   */
  static async deleteCase(tenantId: string, caseId: string) {
    try {
      await prisma.case.delete({
        where: {
          id: caseId,
          tenantId,
        },
      });

      logger.info(`Case supprimé: ${caseId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Erreur suppression case ${caseId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des cases
   */
  static async getCaseStats(tenantId: string) {
    try {
      const [total, open, inProgress, closed, critical, high] = await Promise.all([
        prisma.case.count({ where: { tenantId } }),
        prisma.case.count({ where: { tenantId, status: 'new' } }),
        prisma.case.count({ where: { tenantId, status: 'investigating' } }),
        prisma.case.count({ where: { tenantId, status: 'closed' } }),
        prisma.case.count({ where: { tenantId, severity: 'critical' } }),
        prisma.case.count({ where: { tenantId, severity: 'high' } }),
      ]);

      return {
        total,
        byStatus: {
          open,
          inProgress,
          closed,
        },
        bySeverity: {
          critical,
          high,
        },
      };
    } catch (error) {
      logger.error('Erreur récupération stats cases:', error);
      throw error;
    }
  }

  /**
   * Assigner un case à un utilisateur
   */
  static async assignCase(tenantId: string, caseId: string, userId: string) {
    try {
      const updatedCase = await prisma.case.update({
        where: {
          id: caseId,
          tenantId,
        },
        data: {
          assignee: userId,
          status: 'investigating',
          updatedAt: new Date(),
        },
      });

      logger.info(`Case ${caseId} assigné à user ${userId}`);
      return updatedCase;
    } catch (error) {
      logger.error(`Erreur assignation case ${caseId}:`, error);
      throw error;
    }
  }

  /**
   * Fermer un case
   */
  static async closeCase(tenantId: string, caseId: string, closureNotes?: string) {
    try {
      const updatedCase = await prisma.case.update({
        where: {
          id: caseId,
          tenantId,
        },
        data: {
          status: 'closed',
          closedAt: new Date(),
          // closureNotes stockée dans notes si besoin
          updatedAt: new Date(),
        },
      });

      logger.info(`Case fermé: ${caseId}`);
      return updatedCase;
    } catch (error) {
      logger.error(`Erreur fermeture case ${caseId}:`, error);
      throw error;
    }
  }

  /**
   * Réouvrir un case
   */
  static async reopenCase(tenantId: string, caseId: string) {
    try {
      const updatedCase = await prisma.case.update({
        where: {
          id: caseId,
          tenantId,
        },
        data: {
          status: 'new',
          closedAt: null,
          updatedAt: new Date(),
        },
      });

      logger.info(`Case réouvert: ${caseId}`);
      return updatedCase;
    } catch (error) {
      logger.error(`Erreur réouverture case ${caseId}:`, error);
      throw error;
    }
  }
}
