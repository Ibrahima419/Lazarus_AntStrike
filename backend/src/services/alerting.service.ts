/**
 * 🚨 Alerting Service
 * Génération et gestion des alertes personnalisées
 */

import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { TaranisProxyService } from './taranis-proxy.service';
import { EmailService } from './email.service';
// Types et constantes pour alerting
type SeverityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INFO';
type PriorityType = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
type CategoryType = 'INCIDENT' | 'VULNERABILITY' | 'THREAT' | 'COMPLIANCE' | 'RANSOMWARE' | 'PHISHING' | 'MALWARE' | 'APT' | 'DATA_BREACH' | 'OTHER';

const Severity = {
  LOW: 'LOW' as SeverityType,
  MEDIUM: 'MEDIUM' as SeverityType,
  HIGH: 'HIGH' as SeverityType,
  CRITICAL: 'CRITICAL' as SeverityType,
  INFO: 'INFO' as SeverityType
};

const Priority = {
  P0: 'P0' as PriorityType,
  P1: 'P1' as PriorityType,
  P2: 'P2' as PriorityType,
  P3: 'P3' as PriorityType,
  P4: 'P4' as PriorityType
};

const Category = {
  INCIDENT: 'INCIDENT' as CategoryType,
  VULNERABILITY: 'VULNERABILITY' as CategoryType,
  THREAT: 'THREAT' as CategoryType,
  COMPLIANCE: 'COMPLIANCE' as CategoryType,
  RANSOMWARE: 'RANSOMWARE' as CategoryType,
  PHISHING: 'PHISHING' as CategoryType,
  MALWARE: 'MALWARE' as CategoryType,
  APT: 'APT' as CategoryType,
  DATA_BREACH: 'DATA_BREACH' as CategoryType,
  OTHER: 'OTHER' as CategoryType
};

interface CreateAlertData {
  tenantId: string;
  storyId: string;
  severity: SeverityType;
  priority: PriorityType;
  category: CategoryType;
  title: string;
  summary: string;
  iocs?: string[];
  affectedAssets?: string[];
  recommendedActions?: string[];
}

export class AlertingService {
  /**
   * Créer alerte
   */
  static async createAlert(data: CreateAlertData) {
    const { tenantId, severity, priority } = data;

    // Calculer SLA deadline basé sur priority
    const slaDeadline = this.calculateSlaDeadline(priority);

    const alert = await prisma.alert.create({
      data: {
        tenantId: data.tenantId,
        title: data.title,
        description: data.summary,
        severity: data.severity.toLowerCase(),
        source: 'system',
        status: 'new'
        // TODO: Adapter aux champs exacts du modèle Alert
      }
    });

    logger.info('Alert created', { alertId: alert.id, tenantId, severity });

    // Notifier selon severity
    await this.notifyAlert(alert);

    return alert;
  }

  /**
   * Calculer SLA deadline
   */
  private static calculateSlaDeadline(priority: string): Date {
    const now = new Date();
    const slaHours = {
      P0: 1,   // 1 hour
      P1: 4,   // 4 hours
      P2: 24,  // 24 hours
      P3: 72   // 72 hours
    };

    const hours = slaHours[priority as keyof typeof slaHours] || 24;
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }

  /**
   * Notifier alerte
   */
  private static async notifyAlert(alert: any) {
    const notificationChannels: string[] = [];

    try {
      // Get tenant settings
      const tenant = await prisma.tenant.findUnique({
        where: { id: alert.tenantId }
      });

      if (!tenant) return;

      // Email notification
      if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
        await EmailService.sendAlertEmail(tenant, alert);
        notificationChannels.push('email');
      }

      // Slack notification (si configuré)
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackNotification(alert);
        notificationChannels.push('slack');
      }

      // Update alert avec channels utilisés
      // TODO: Mettre à jour les canaux de notification si le champ existe
      // await prisma.alert.update({
      //   where: { id: alert.id },
      //   data: { notifiedVia: notificationChannels }
      // });

      logger.info('Alert notifications sent', { 
        alertId: alert.id, 
        channels: notificationChannels 
      });
    } catch (error: any) {
      logger.error('Error sending alert notifications', { 
        alertId: alert.id, 
        error: error.message 
      });
    }
  }

  /**
   * Envoyer notification Slack
   */
  private static async sendSlackNotification(alert: any) {
    // TODO: Implémenter Slack webhook
    logger.info('Slack notification would be sent', { alertId: alert.id });
  }

  /**
   * Get alerts pour tenant
   */
  static async getAlerts(tenantId: string, filters?: any) {
    const where: any = { tenantId };

    if (filters?.severity) where.severity = filters.severity;
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0
    });

    return alerts;
  }

  /**
   * Get alert détails
   */
  static async getAlert(alertId: string, tenantId: string) {
    const alert = await prisma.alert.findFirst({
      where: { id: alertId, tenantId }
    });

    return alert;
  }

  /**
   * Update alert (acknowledge, assign, resolve)
   */
  static async updateAlert(
    alertId: string, 
    tenantId: string, 
    data: any
  ) {
    const updateData: any = {};

    if (data.status) {
      updateData.status = data.status;
      
      if (data.status === 'ACKNOWLEDGED') {
        updateData.acknowledgedAt = new Date();
      }
      
      if (data.status === 'RESOLVED' || data.status === 'FALSE_POSITIVE') {
        updateData.resolvedAt = new Date();
      }
    }

    if (data.assignedTo) updateData.assignedTo = data.assignedTo;

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: updateData
    });

    logger.info('Alert updated', { alertId, tenantId, changes: Object.keys(updateData) });

    return alert;
  }

  /**
   * Delete alert
   */
  static async deleteAlert(alertId: string, tenantId: string) {
    await prisma.alert.delete({
      where: { id: alertId }
    });

    logger.info('Alert deleted', { alertId, tenantId });
  }

  /**
   * Analyser story et créer alert si nécessaire
   */
  static async analyzeStoryForAlerts(tenantId: string, story: any) {
    // Déterminer severity basé sur contenu
    const severity = this.determineSeverity(story);
    
    if (severity === Severity.LOW || severity === Severity.INFO) {
      return null; // Pas d'alerte pour low/info
    }

    // Déterminer category
    const category = this.determineCategory(story);

    // Déterminer priority
    const priority = this.determinePriority(severity, category);

    // Créer alerte
    return await this.createAlert({
      tenantId,
      storyId: story.id,
      severity,
      priority,
      category,
      title: story.title,
      summary: story.summary || story.content?.substring(0, 200),
      iocs: this.extractIOCs(story),
      affectedAssets: [],
      recommendedActions: this.generateRecommendations(category, severity)
    });
  }

  /**
   * Déterminer severity
   */
  private static determineSeverity(story: any): SeverityType {
    const content = (story.title + ' ' + story.content).toLowerCase();

    if (
      content.includes('critical') || 
      content.includes('0-day') ||
      content.includes('ransomware')
    ) {
      return Severity.CRITICAL;
    }

    if (
      content.includes('vulnerability') ||
      content.includes('exploit') ||
      content.includes('breach')
    ) {
      return Severity.HIGH;
    }

    if (content.includes('phishing') || content.includes('malware')) {
      return Severity.MEDIUM;
    }

    return Severity.LOW;
  }

  /**
   * Déterminer category
   */
  private static determineCategory(story: any): CategoryType {
    const content = (story.title + ' ' + story.content).toLowerCase();

    if (content.includes('ransomware')) return Category.RANSOMWARE;
    if (content.includes('phishing')) return Category.PHISHING;
    if (content.includes('vulnerability')) return Category.VULNERABILITY;
    if (content.includes('malware')) return Category.MALWARE;
    if (content.includes('apt')) return Category.APT;
    if (content.includes('breach') || content.includes('leak')) return Category.DATA_BREACH;
    
    return Category.OTHER;
  }

  /**
   * Déterminer priority
   */
  private static determinePriority(severity: SeverityType, category: CategoryType): PriorityType {
    if (severity === Severity.CRITICAL) return Priority.P0;
    if (severity === Severity.HIGH && category === Category.RANSOMWARE) return Priority.P0;
    if (severity === Severity.HIGH) return Priority.P1;
    if (severity === Severity.MEDIUM) return Priority.P2;
    return Priority.P3;
  }

  /**
   * Extraire IOCs
   */
  private static extractIOCs(story: any): string[] {
    const content = story.title + ' ' + story.content;
    const iocs: string[] = [];

    // IP addresses
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const ips = content.match(ipRegex);
    if (ips) iocs.push(...ips.slice(0, 5));

    // TODO: Domains, hashes, etc. via Taranis IOC bot

    return iocs;
  }

  /**
   * Générer recommendations
   */
  private static generateRecommendations(category: CategoryType, severity: SeverityType): string[] {
    const recommendations: string[] = [];

    if (category === Category.RANSOMWARE) {
      recommendations.push('Isoler les systèmes affectés immédiatement');
      recommendations.push('Vérifier les sauvegardes et leur intégrité');
      recommendations.push('Bloquer les IOCs au niveau firewall/EDR');
    }

    if (category === Category.VULNERABILITY) {
      recommendations.push('Identifier les systèmes vulnérables');
      recommendations.push('Appliquer les patches disponibles');
      recommendations.push('Implémenter des mesures de mitigation temporaires');
    }

    if (severity === Severity.CRITICAL) {
      recommendations.push('Activer la cellule de crise');
      recommendations.push('Notifier la direction');
    }

    return recommendations;
  }
}



