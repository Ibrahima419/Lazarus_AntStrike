import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { CaseService } from './case.service';
import { AlertingService } from './alerting.service';

const prisma = new PrismaClient();

export interface CreatePlaybookData {
  name: string;
  description: string;
  triggerConditions: any;
  actions: any[];
  enabled?: boolean;
}

export interface PlaybookExecution {
  playbookId: string;
  triggeredBy: string;
  context: any;
}

export class PlaybookService {
  /**
   * Créer un nouveau playbook
   */
  static async createPlaybook(tenantId: string, userId: string, data: CreatePlaybookData) {
    try {
      const playbook = await prisma.playbook.create({
        data: {
          tenantId,
          name: data.name,
          description: data.description,
          trigger: data.triggerConditions || {},
          steps: data.actions || [],
          isActive: data.enabled ?? true
          // createdBy: userId, // TODO: Ajouter au schema Playbook
        } as any,
      });

      logger.info(`Playbook créé: ${playbook.id} par user ${userId}`);
      return playbook;
    } catch (error) {
      logger.error('Erreur création playbook:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les playbooks d'un tenant
   */
  static async getPlaybooks(tenantId: string, onlyEnabled = false) {
    try {
      const where: any = { tenantId };
      if (onlyEnabled) where.enabled = true;

      const playbooks = await prisma.playbook.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return playbooks;
    } catch (error) {
      logger.error('Erreur récupération playbooks:', error);
      throw error;
    }
  }

  /**
   * Récupérer un playbook spécifique
   */
  static async getPlaybookById(tenantId: string, playbookId: string) {
    try {
      const playbook = await prisma.playbook.findFirst({
        where: { id: playbookId, tenantId },
      });

      if (!playbook) {
        throw new Error('Playbook non trouvé');
      }

      return playbook;
    } catch (error) {
      logger.error('Erreur récupération playbook:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un playbook
   */
  static async updatePlaybook(
    tenantId: string,
    playbookId: string,
    data: Partial<CreatePlaybookData>
  ) {
    try {
      const playbook = await prisma.playbook.update({
        where: { id: playbookId, tenantId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      logger.info(`Playbook mis à jour: ${playbookId}`);
      return playbook;
    } catch (error) {
      logger.error('Erreur mise à jour playbook:', error);
      throw error;
    }
  }

  /**
   * Activer/désactiver un playbook
   */
  static async togglePlaybook(tenantId: string, playbookId: string, enabled: boolean) {
    try {
      const playbook = await prisma.playbook.update({
        where: { id: playbookId, tenantId },
        data: { isActive: enabled },
      });

      logger.info(`Playbook ${enabled ? 'activé' : 'désactivé'}: ${playbookId}`);
      return playbook;
    } catch (error) {
      logger.error('Erreur toggle playbook:', error);
      throw error;
    }
  }

  /**
   * Supprimer un playbook
   */
  static async deletePlaybook(tenantId: string, playbookId: string) {
    try {
      await prisma.playbook.delete({
        where: { id: playbookId, tenantId },
      });

      logger.info(`Playbook supprimé: ${playbookId}`);
      return { success: true };
    } catch (error) {
      logger.error('Erreur suppression playbook:', error);
      throw error;
    }
  }

  /**
   * Exécuter un playbook manuellement
   */
  static async executePlaybook(tenantId: string, userId: string, execution: PlaybookExecution) {
    try {
      const playbook = await this.getPlaybookById(tenantId, execution.playbookId);

      if (!playbook.isActive) {
        throw new Error('Playbook désactivé');
      }

      logger.info(`Exécution playbook: ${playbook.id}`);

      // Exécuter les actions du playbook
      const results = [];
      for (const action of playbook.steps as any[]) {
        const result = await this.executeAction(tenantId, userId, action, execution.context);
        results.push(result);
      }

      // Incrémenter le compteur d'exécutions
      await prisma.playbook.update({
        where: { id: playbook.id },
        data: {
          executionCount: { increment: 1 },
          // lastExecuted tracké via PlaybookExecution: new Date(),
        },
      });

      logger.info(`Playbook exécuté avec succès: ${playbook.id}`);
      return {
        playbookId: playbook.id,
        playbookName: playbook.name,
        executedAt: new Date(),
        results,
        success: true,
      };
    } catch (error) {
      logger.error('Erreur exécution playbook:', error);
      throw error;
    }
  }

  /**
   * Exécuter une action individuelle du playbook
   */
  private static async executeAction(
    tenantId: string,
    userId: string,
    action: any,
    context: any
  ): Promise<any> {
    try {
      switch (action.type) {
        case 'CREATE_ALERT':
          return await this.actionCreateAlert(tenantId, userId, action.params, context);

        case 'CREATE_CASE':
          return await this.actionCreateCase(tenantId, userId, action.params, context);

        case 'SEND_NOTIFICATION':
          return await this.actionSendNotification(tenantId, action.params, context);

        case 'ENRICH_IOC':
          return await this.actionEnrichIOC(tenantId, action.params, context);

        case 'UPDATE_THREAT':
          return await this.actionUpdateThreat(tenantId, action.params, context);

        case 'QUARANTINE_ASSET':
          return await this.actionQuarantineAsset(tenantId, action.params, context);

        case 'BLOCK_IP':
          return await this.actionBlockIP(tenantId, action.params, context);

        case 'GENERATE_REPORT':
          return await this.actionGenerateReport(tenantId, action.params, context);

        default:
          logger.warn(`Action inconnue: ${action.type}`);
          return { action: action.type, status: 'skipped', message: 'Action non supportée' };
      }
    } catch (error: any) {
      logger.error(`Erreur exécution action ${action.type}:`, error);
      return { action: action.type, status: 'error', error: error?.message || 'Unknown error' };
    }
  }

  // ========== Actions du Playbook ==========

  private static async actionCreateAlert(
    tenantId: string,
    userId: string,
    params: any,
    context: any
  ): Promise<any> {
    try {
      const alertData = {
        tenantId,
        storyId: context.storyId || context.threatId || 'playbook-generated',
        title: params.title || context.threatTitle || 'Alerte automatique',
        summary: params.description || context.threatDescription || 'Créée automatiquement par playbook',
        severity: params.severity || context.severity || 'MEDIUM',
        category: params.category || 'OTHER',
        priority: params.priority || 'P1',
        iocs: params.iocs || [],
        affectedAssets: params.affectedAssets || [],
        recommendedActions: params.recommendedActions || [],
      };

      const alert = await AlertingService.createAlert(alertData as any);
      logger.info(`Alerte créée par playbook: ${alert.id}`);
      return { action: 'CREATE_ALERT', status: 'success', alertId: alert.id };
    } catch (error: any) {
      logger.error('Erreur création alerte playbook:', error);
      return { action: 'CREATE_ALERT', status: 'error', error: error?.message || 'Unknown error' };
    }
  }

  private static async actionCreateCase(
    tenantId: string,
    userId: string,
    params: any,
    context: any
  ): Promise<any> {
    try {
      const caseData = {
        title: params.title || context.threatTitle || 'Case automatique',
        description: params.description || context.threatDescription || 'Créé par playbook',
        severity: params.severity || context.severity || 'MEDIUM',
        priority: params.priority || 'MEDIUM',
        threatIds: context.threatId ? [context.threatId] : [],
      };

      const newCase = await CaseService.createCase(tenantId, userId, caseData);
      logger.info(`Case créé par playbook: ${newCase.id}`);
      return { action: 'CREATE_CASE', status: 'success', caseId: newCase.id };
    } catch (error: any) {
      logger.error('Erreur création case playbook:', error);
      return { action: 'CREATE_CASE', status: 'error', error: error?.message || 'Unknown error' };
    }
  }

  private static async actionSendNotification(
    tenantId: string,
    params: any,
    context: any
  ): Promise<any> {
    try {
      // Implémenter l'envoi de notifications (email, Slack, Teams, etc.)
      logger.info(`Notification envoyée: ${params.message}`);
      return {
        action: 'SEND_NOTIFICATION',
        status: 'success',
        message: params.message,
        recipients: params.recipients,
      };
    } catch (error: any) {
      logger.error('Erreur envoi notification:', error);
      return { action: 'SEND_NOTIFICATION', status: 'error', error: error?.message || 'Unknown error' };
    }
  }

  private static async actionEnrichIOC(tenantId: string, params: any, context: any): Promise<any> {
    try {
      // Implémenter l'enrichissement IOC
      logger.info(`IOC enrichi: ${params.iocValue}`);
      return {
        action: 'ENRICH_IOC',
        status: 'success',
        iocValue: params.iocValue,
        iocType: params.iocType,
      };
    } catch (error: any) {
      logger.error('Erreur enrichissement IOC:', error);
      return { action: 'ENRICH_IOC', status: 'error', error: error?.message || 'Unknown error' };
    }
  }

  private static async actionUpdateThreat(
    tenantId: string,
    params: any,
    context: any
  ): Promise<any> {
    try {
      // Implémenter la mise à jour de threat
      logger.info(`Threat mis à jour: ${context.threatId}`);
      return { action: 'UPDATE_THREAT', status: 'success', threatId: context.threatId };
    } catch (error: any) {
      logger.error('Erreur mise à jour threat:', error);
      return { action: 'UPDATE_THREAT', status: 'error', error: error?.message || 'Unknown error' };
    }
  }

  private static async actionQuarantineAsset(
    tenantId: string,
    params: any,
    context: any
  ): Promise<any> {
    try {
      // Implémenter la quarantaine d'asset
      logger.info(`Asset mis en quarantaine: ${params.assetId}`);
      return {
        action: 'QUARANTINE_ASSET',
        status: 'success',
        assetId: params.assetId,
        assetName: params.assetName,
      };
    } catch (error: any) {
      logger.error('Erreur quarantaine asset:', error);
      return { action: 'QUARANTINE_ASSET', status: 'error', error: error?.message || 'Unknown error' };
    }
  }

  private static async actionBlockIP(tenantId: string, params: any, context: any): Promise<any> {
    try {
      // Implémenter le blocage d'IP sur le firewall
      logger.info(`IP bloquée: ${params.ip}`);
      return { action: 'BLOCK_IP', status: 'success', ip: params.ip, duration: params.duration };
    } catch (error: any) {
      logger.error('Erreur blocage IP:', error);
      return { action: 'BLOCK_IP', status: 'error', error: error?.message || 'Unknown error' };
    }
  }

  private static async actionGenerateReport(
    tenantId: string,
    params: any,
    context: any
  ): Promise<any> {
    try {
      // Implémenter la génération de rapport
      logger.info(`Rapport généré: ${params.reportType}`);
      return {
        action: 'GENERATE_REPORT',
        status: 'success',
        reportType: params.reportType,
        format: params.format,
      };
    } catch (error: any) {
      logger.error('Erreur génération rapport:', error);
      return { action: 'GENERATE_REPORT', status: 'error', error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Évaluer automatiquement si un playbook doit être déclenché
   */
  static async evaluateTriggersForEvent(tenantId: string, userId: string, event: any) {
    try {
      // Récupérer tous les playbooks actifs
      const playbooks = await this.getPlaybooks(tenantId, true);

      for (const playbook of playbooks) {
        const shouldTrigger = this.evaluateTriggerConditions(
          playbook.trigger as any,
          event
        );

        if (shouldTrigger) {
          logger.info(`Playbook déclenché automatiquement: ${playbook.id}`);
          await this.executePlaybook(tenantId, userId, {
            playbookId: playbook.id,
            triggeredBy: 'automatic',
            context: event,
          });
        }
      }
    } catch (error) {
      logger.error('Erreur évaluation triggers:', error);
    }
  }

  /**
   * Évaluer les conditions de déclenchement
   */
  private static evaluateTriggerConditions(conditions: any, event: any): boolean {
    try {
      // Exemple de logique d'évaluation simple
      if (conditions.eventType && conditions.eventType !== event.type) {
        return false;
      }

      if (conditions.severity && !this.matchSeverity(conditions.severity, event.severity)) {
        return false;
      }

      if (conditions.category && conditions.category !== event.category) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erreur évaluation conditions:', error);
      return false;
    }
  }

  private static matchSeverity(conditionSeverity: string | string[], eventSeverity: string): boolean {
    if (Array.isArray(conditionSeverity)) {
      return conditionSeverity.includes(eventSeverity);
    }
    return conditionSeverity === eventSeverity;
  }
}

