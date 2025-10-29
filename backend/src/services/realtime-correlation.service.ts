/**
 * ⚡ Real-time Correlation Engine
 * Moteur de corrélation en temps réel pour détection rapide de menaces
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { EventEmitter } from 'events';

interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: any[];
  timeWindow: number; // en secondes
  threshold: number;
  severity: string;
  actions: string[];
}

interface CorrelationEvent {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  data: any;
  tenantId: string;
}

interface CorrelationMatch {
  ruleId: string;
  ruleName: string;
  events: CorrelationEvent[];
  severity: string;
  confidence: number;
  timestamp: Date;
  description: string;
  recommendations: string[];
}

interface RealTimeAlert {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  severity: string;
  confidence: number;
  correlatedEvents: string[];
  triggeredRule: string;
  timestamp: Date;
  status: string;
}

/**
 * Event Emitter pour notifications temps réel
 */
export class CorrelationEventEmitter extends EventEmitter {
  private static instance: CorrelationEventEmitter;

  static getInstance(): CorrelationEventEmitter {
    if (!this.instance) {
      this.instance = new CorrelationEventEmitter();
    }
    return this.instance;
  }

  emitCorrelationMatch(match: CorrelationMatch): void {
    this.emit('correlation:match', match);
    logger.info(`Correlation match emitted: ${match.ruleName}`);
  }

  emitAlert(alert: RealTimeAlert): void {
    this.emit('alert:created', alert);
    logger.info(`Alert emitted: ${alert.title}`);
  }
}

export class RealTimeCorrelationService {
  private static eventBuffer = new Map<string, CorrelationEvent[]>();
  private static correlationRules: CorrelationRule[] = [];
  private static emitter = CorrelationEventEmitter.getInstance();

  /**
   * Initialiser le moteur de corrélation
   */
  static async initialize(tenantId: string): Promise<void> {
    try {
      logger.info(`Initializing Real-Time Correlation Engine for tenant: ${tenantId}`);
      
      // Charger règles de corrélation
      await this.loadCorrelationRules(tenantId);
      
      // Nettoyer buffer ancien
      this.cleanOldEvents();
      
      logger.info('Real-Time Correlation Engine initialized');
    } catch (error: any) {
      logger.error('Error initializing correlation engine:', error.message);
      throw error;
    }
  }

  /**
   * Charger règles de corrélation prédéfinies
   */
  private static async loadCorrelationRules(tenantId: string): Promise<void> {
    // Règles de corrélation prédéfinies
    this.correlationRules = [
      // Règle 1: Multiple failed logins + successful login
      {
        id: 'rule-001',
        name: 'Brute Force Detection',
        description: 'Multiple failed login attempts followed by successful login',
        enabled: true,
        conditions: [
          { type: 'failed_login', count: 5, timeWindow: 300 },
          { type: 'successful_login', count: 1, after: 'failed_login' }
        ],
        timeWindow: 300,
        threshold: 5,
        severity: 'high',
        actions: ['create_alert', 'block_ip', 'notify_admin']
      },
      
      // Règle 2: Lateral movement
      {
        id: 'rule-002',
        name: 'Lateral Movement Detection',
        description: 'Multiple connections to different internal systems from same source',
        enabled: true,
        conditions: [
          { type: 'internal_connection', uniqueTargets: 5, timeWindow: 600 }
        ],
        timeWindow: 600,
        threshold: 5,
        severity: 'critical',
        actions: ['create_alert', 'isolate_system', 'notify_soc']
      },
      
      // Règle 3: Data exfiltration
      {
        id: 'rule-003',
        name: 'Data Exfiltration Detection',
        description: 'Large data transfer to external destination',
        enabled: true,
        conditions: [
          { type: 'outbound_traffic', volume: '> 1GB', timeWindow: 300 }
        ],
        timeWindow: 300,
        threshold: 1,
        severity: 'critical',
        actions: ['create_alert', 'block_traffic', 'notify_incident_response']
      },
      
      // Règle 4: Malware execution chain
      {
        id: 'rule-004',
        name: 'Malware Execution Chain',
        description: 'Suspicious process creation chain (parent-child)',
        enabled: true,
        conditions: [
          { type: 'process_created', suspicious: true, count: 3, timeWindow: 60 }
        ],
        timeWindow: 60,
        threshold: 3,
        severity: 'high',
        actions: ['create_alert', 'kill_process', 'quarantine_system']
      },
      
      // Règle 5: Privilege escalation
      {
        id: 'rule-005',
        name: 'Privilege Escalation',
        description: 'User privilege elevation detected',
        enabled: true,
        conditions: [
          { type: 'privilege_change', from: 'user', to: 'admin' },
          { type: 'sensitive_access', count: 1, after: 'privilege_change', timeWindow: 300 }
        ],
        timeWindow: 300,
        threshold: 1,
        severity: 'high',
        actions: ['create_alert', 'revoke_privileges', 'notify_admin']
      },
      
      // Règle 6: C2 Communication
      {
        id: 'rule-006',
        name: 'C2 Communication Detection',
        description: 'Beaconing pattern to external IP',
        enabled: true,
        conditions: [
          { type: 'outbound_connection', pattern: 'regular_interval', count: 10, timeWindow: 3600 }
        ],
        timeWindow: 3600,
        threshold: 10,
        severity: 'critical',
        actions: ['create_alert', 'block_ip', 'notify_soc']
      },
      
      // Règle 7: Multiple IOC hits
      {
        id: 'rule-007',
        name: 'Multiple IOC Detection',
        description: 'Multiple IOCs from same campaign detected',
        enabled: true,
        conditions: [
          { type: 'ioc_detected', sameCampaign: true, count: 3, timeWindow: 1800 }
        ],
        timeWindow: 1800,
        threshold: 3,
        severity: 'critical',
        actions: ['create_alert', 'correlate_campaign', 'notify_threat_intel']
      },
      
      // Règle 8: Honeypot activity
      {
        id: 'rule-008',
        name: 'Honeypot Interaction',
        description: 'Multiple interactions with honeypot resources',
        enabled: true,
        conditions: [
          { type: 'honeypot_access', count: 2, timeWindow: 600 }
        ],
        timeWindow: 600,
        threshold: 2,
        severity: 'high',
        actions: ['create_alert', 'track_attacker', 'collect_artifacts']
      }
    ];

    logger.info(`Loaded ${this.correlationRules.length} correlation rules`);
  }

  /**
   * Traiter un événement en temps réel
   */
  static async processEvent(event: CorrelationEvent): Promise<CorrelationMatch[]> {
    try {
      logger.debug(`Processing real-time event: ${event.type}`);

      // Ajouter au buffer
      const key = event.tenantId;
      if (!this.eventBuffer.has(key)) {
        this.eventBuffer.set(key, []);
      }
      this.eventBuffer.get(key)!.push(event);

      // Vérifier corrélations
      const matches = await this.checkCorrelations(event.tenantId);

      // Créer alertes pour matches
      for (const match of matches) {
        await this.createAlert(event.tenantId, match);
        this.emitter.emitCorrelationMatch(match);
      }

      return matches;
    } catch (error: any) {
      logger.error('Error processing event:', error.message);
      throw error;
    }
  }

  /**
   * Vérifier corrélations pour un tenant
   */
  private static async checkCorrelations(tenantId: string): Promise<CorrelationMatch[]> {
    const matches: CorrelationMatch[] = [];
    const events = this.eventBuffer.get(tenantId) || [];

    for (const rule of this.correlationRules.filter(r => r.enabled)) {
      const match = this.evaluateRule(rule, events, tenantId);
      if (match) {
        matches.push(match);
      }
    }

    return matches;
  }

  /**
   * Évaluer une règle de corrélation
   */
  private static evaluateRule(
    rule: CorrelationRule,
    events: CorrelationEvent[],
    tenantId: string
  ): CorrelationMatch | null {
    const now = Date.now();
    const windowStart = now - (rule.timeWindow * 1000);

    // Filtrer événements dans la fenêtre temporelle
    const recentEvents = events.filter(e => 
      e.timestamp.getTime() >= windowStart && e.tenantId === tenantId
    );

    // Vérifier conditions
    let conditionsMet = true;
    const matchedEvents: CorrelationEvent[] = [];

    for (const condition of rule.conditions) {
      const matchingEvents = recentEvents.filter(e => {
        // Simple matching (à améliorer avec logic plus complexe)
        if (condition.type && e.type !== condition.type) return false;
        if (condition.count) {
          const typeEvents = recentEvents.filter(ev => ev.type === condition.type);
          return typeEvents.length >= condition.count;
        }
        return true;
      });

      if (matchingEvents.length === 0) {
        conditionsMet = false;
        break;
      }

      matchedEvents.push(...matchingEvents);
    }

    if (!conditionsMet) return null;

    // Calculer confidence
    const confidence = this.calculateConfidence(rule, matchedEvents);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      events: matchedEvents,
      severity: rule.severity,
      confidence,
      timestamp: new Date(),
      description: rule.description,
      recommendations: this.generateRecommendations(rule)
    };
  }

  /**
   * Calculer confidence du match
   */
  private static calculateConfidence(
    rule: CorrelationRule,
    events: CorrelationEvent[]
  ): number {
    let confidence = 50; // Base

    // Plus d'événements = plus de confidence
    if (events.length > rule.threshold * 2) confidence += 20;
    else if (events.length > rule.threshold) confidence += 10;

    // Severity = plus de confidence
    if (rule.severity === 'critical') confidence += 15;
    else if (rule.severity === 'high') confidence += 10;

    // Rapidité des événements
    if (events.length > 0) {
      const timeSpan = events[events.length - 1].timestamp.getTime() - 
                       events[0].timestamp.getTime();
      if (timeSpan < rule.timeWindow * 1000 / 2) {
        confidence += 15; // Événements rapprochés
      }
    }

    return Math.min(confidence, 95);
  }

  /**
   * Générer recommandations
   */
  private static generateRecommendations(rule: CorrelationRule): string[] {
    const recommendations: string[] = [];

    if (rule.actions.includes('block_ip')) {
      recommendations.push('Bloquer l\'adresse IP source immédiatement');
    }
    if (rule.actions.includes('isolate_system')) {
      recommendations.push('Isoler le système affecté du réseau');
    }
    if (rule.actions.includes('kill_process')) {
      recommendations.push('Terminer les processus suspects');
    }
    if (rule.actions.includes('notify_soc')) {
      recommendations.push('Notifier le SOC pour investigation');
    }
    if (rule.actions.includes('collect_artifacts')) {
      recommendations.push('Collecter artefacts forensiques');
    }

    return recommendations;
  }

  /**
   * Créer une alerte
   */
  private static async createAlert(
    tenantId: string,
    match: CorrelationMatch
  ): Promise<RealTimeAlert> {
    try {
      const alert: RealTimeAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        title: `[${match.severity.toUpperCase()}] ${match.ruleName}`,
        description: match.description,
        severity: match.severity,
        confidence: match.confidence,
        correlatedEvents: match.events.map(e => e.id),
        triggeredRule: match.ruleId,
        timestamp: new Date(),
        status: 'open'
      };

      // Sauvegarder en DB
      await prisma.alert.create({
        data: {
          tenantId,
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          status: alert.status,
          raw: {
            confidence: alert.confidence,
            correlatedEvents: alert.correlatedEvents,
            triggeredRule: alert.triggeredRule,
            recommendations: match.recommendations
          }
        }
      });

      // Émettre événement
      this.emitter.emitAlert(alert);

      logger.info(`Alert created: ${alert.title}`);
      return alert;
    } catch (error: any) {
      logger.error('Error creating alert:', error.message);
      throw error;
    }
  }

  /**
   * Nettoyer anciens événements du buffer
   */
  private static cleanOldEvents(): void {
    const now = Date.now();
    const maxAge = 3600 * 1000; // 1 heure

    this.eventBuffer.forEach((events, key) => {
      const filtered = events.filter(e => 
        now - e.timestamp.getTime() < maxAge
      );
      this.eventBuffer.set(key, filtered);
    });

    logger.debug('Old events cleaned from buffer');
  }

  /**
   * Obtenir règles de corrélation
   */
  static getCorrelationRules(): CorrelationRule[] {
    return this.correlationRules;
  }

  /**
   * Obtenir événements récents
   */
  static getRecentEvents(tenantId: string, limit: number = 100): CorrelationEvent[] {
    const events = this.eventBuffer.get(tenantId) || [];
    return events.slice(-limit);
  }

  /**
   * Obtenir statistiques
   */
  static async getStats(tenantId: string): Promise<any> {
    const events = this.eventBuffer.get(tenantId) || [];
    
    // Stats par type d'événement
    const eventsByType: Record<string, number> = {};
    events.forEach(e => {
      eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
    });

    // Alertes récentes
    const recentAlerts = await prisma.alert.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
        }
      }
    });

    // Alertes par sévérité
    const alertsBySeverity = await prisma.alert.groupBy({
      by: ['severity'],
      where: { tenantId },
      _count: true
    });

    return {
      totalEvents: events.length,
      eventsByType,
      activeRules: this.correlationRules.filter(r => r.enabled).length,
      totalRules: this.correlationRules.length,
      recentAlerts24h: recentAlerts,
      alertsBySeverity: alertsBySeverity.map(a => ({
        severity: a.severity,
        count: a._count
      }))
    };
  }

  /**
   * Simuler événement (pour testing)
   */
  static async simulateEvent(
    tenantId: string,
    type: string,
    data: any
  ): Promise<CorrelationEvent> {
    const event: CorrelationEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      source: 'simulation',
      data,
      tenantId
    };

    await this.processEvent(event);
    return event;
  }

  /**
   * Activer/désactiver une règle
   */
  static toggleRule(ruleId: string, enabled: boolean): boolean {
    const rule = this.correlationRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      logger.info(`Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }

  /**
   * S'abonner aux événements de corrélation
   */
  static onCorrelationMatch(callback: (match: CorrelationMatch) => void): void {
    this.emitter.on('correlation:match', callback);
  }

  /**
   * S'abonner aux alertes
   */
  static onAlert(callback: (alert: RealTimeAlert) => void): void {
    this.emitter.on('alert:created', callback);
  }

  /**
   * Forcer une analyse de corrélation
   */
  static async forceCorrelation(tenantId: string): Promise<CorrelationMatch[]> {
    logger.info(`Forcing correlation analysis for tenant: ${tenantId}`);
    return await this.checkCorrelations(tenantId);
  }
}

// Auto-nettoyage périodique du buffer (toutes les 5 minutes)
setInterval(() => {
  RealTimeCorrelationService['cleanOldEvents']();
}, 5 * 60 * 1000);



