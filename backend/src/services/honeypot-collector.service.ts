/**
 * 🍯 Honeypot Collector Service
 * Collecte et analyse des logs honeypot
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface HoneypotConfig {
  id: string;
  name: string;
  url: string;
  type: 'cowrie' | 'dionaea' | 'tpot' | 'custom';
  enabled: boolean;
  authToken?: string;
}

interface HoneypotLog {
  sourceIP: string;
  targetPort: number;
  protocol: string;
  payload?: string;
  timestamp: Date;
  country?: string;
  honeypotId: string;
  attackType?: string;
}

interface HoneypotStats {
  totalAttacks: number;
  uniqueIPs: number;
  topAttackers: Array<{ ip: string; count: number }>;
  topPorts: Array<{ port: number; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
}

export class HoneypotCollectorService {
  /**
   * Collecter logs depuis un honeypot
   */
  static async collectLogs(
    tenantId: string,
    honeypotConfig: HoneypotConfig,
    lastHours: number = 24
  ): Promise<HoneypotLog[]> {
    try {
      logger.info(`Collecting logs from honeypot: ${honeypotConfig.name}`);

      let logs: HoneypotLog[] = [];

      switch (honeypotConfig.type) {
        case 'cowrie':
          logs = await this.collectCowrieLogs(honeypotConfig, lastHours);
          break;
        
        case 'dionaea':
          logs = await this.collectDionaeaLogs(honeypotConfig, lastHours);
          break;
        
        case 'tpot':
          logs = await this.collectTPotLogs(honeypotConfig, lastHours);
          break;
        
        case 'custom':
          logs = await this.collectCustomLogs(honeypotConfig, lastHours);
          break;
        
        default:
          throw new Error(`Unsupported honeypot type: ${honeypotConfig.type}`);
      }

      logger.info(`Collected ${logs.length} logs from ${honeypotConfig.name}`);

      return logs;
    } catch (error: any) {
      logger.error(`Error collecting logs from ${honeypotConfig.name}:`, error.message);
      return [];
    }
  }

  /**
   * Collecter logs Cowrie (SSH/Telnet honeypot)
   */
  private static async collectCowrieLogs(
    config: HoneypotConfig,
    lastHours: number
  ): Promise<HoneypotLog[]> {
    try {
      // Format standard Cowrie JSON logs
      const response = await axios.get(`${config.url}/api/logs`, {
        params: {
          since: Date.now() - (lastHours * 3600000),
          format: 'json'
        },
        headers: config.authToken ? { 'Authorization': `Bearer ${config.authToken}` } : {},
        timeout: 10000
      });

      const logs = response.data.logs || [];

      return logs.map((log: any) => ({
        sourceIP: log.src_ip,
        targetPort: log.dst_port || 22,
        protocol: log.protocol || 'ssh',
        payload: log.input || log.message,
        timestamp: new Date(log.timestamp),
        country: log.sensor?.country,
        honeypotId: config.id,
        attackType: this.detectAttackType(log)
      }));
    } catch (error: any) {
      logger.warn(`Cowrie logs collection failed:`, error.message);
      return [];
    }
  }

  /**
   * Collecter logs Dionaea (Multi-protocol honeypot)
   */
  private static async collectDionaeaLogs(
    config: HoneypotConfig,
    lastHours: number
  ): Promise<HoneypotLog[]> {
    try {
      const response = await axios.get(`${config.url}/api/incidents`, {
        params: {
          since: new Date(Date.now() - lastHours * 3600000).toISOString()
        },
        headers: config.authToken ? { 'Authorization': config.authToken } : {},
        timeout: 10000
      });

      const incidents = response.data || [];

      return incidents.map((inc: any) => ({
        sourceIP: inc.connection?.remote_host,
        targetPort: inc.connection?.remote_port,
        protocol: inc.connection?.protocol,
        payload: inc.data,
        timestamp: new Date(inc.connection_time),
        honeypotId: config.id,
        attackType: inc.incident_type
      }));
    } catch (error: any) {
      logger.warn(`Dionaea logs collection failed:`, error.message);
      return [];
    }
  }

  /**
   * Collecter logs T-Pot (All-in-one honeypot)
   */
  private static async collectTPotLogs(
    config: HoneypotConfig,
    lastHours: number
  ): Promise<HoneypotLog[]> {
    try {
      // T-Pot expose Elasticsearch
      const response = await axios.post(`${config.url}/elasticsearch/_search`, {
        query: {
          range: {
            '@timestamp': {
              gte: `now-${lastHours}h`
            }
          }
        },
        size: 1000
      }, {
        headers: config.authToken ? { 'Authorization': `Basic ${config.authToken}` } : {},
        timeout: 10000
      });

      const hits = response.data.hits?.hits || [];

      return hits.map((hit: any) => {
        const source = hit._source;
        return {
          sourceIP: source.src_ip,
          targetPort: source.dest_port,
          protocol: source.protocol,
          payload: source.payload,
          timestamp: new Date(source['@timestamp']),
          country: source.geoip?.country_name,
          honeypotId: config.id,
          attackType: source.honeypot_type
        };
      });
    } catch (error: any) {
      logger.warn(`T-Pot logs collection failed:`, error.message);
      return [];
    }
  }

  /**
   * Collecter logs format custom
   */
  private static async collectCustomLogs(
    config: HoneypotConfig,
    lastHours: number
  ): Promise<HoneypotLog[]> {
    try {
      const response = await axios.get(`${config.url}`, {
        headers: config.authToken ? { 'Authorization': config.authToken } : {},
        timeout: 10000
      });

      // Supposer format JSON standard
      const logs = response.data.logs || response.data || [];

      return logs.map((log: any) => ({
        sourceIP: log.source_ip || log.src_ip || log.ip,
        targetPort: log.port || log.target_port || 0,
        protocol: log.protocol || 'unknown',
        payload: log.payload || log.data,
        timestamp: new Date(log.timestamp || log.time),
        honeypotId: config.id
      }));
    } catch (error: any) {
      logger.warn(`Custom honeypot logs collection failed:`, error.message);
      return [];
    }
  }

  /**
   * Analyser logs et créer IOCs
   */
  static async analyzeLogs(
    tenantId: string,
    logs: HoneypotLog[]
  ): Promise<{ iocsCreated: number; alertsCreated: number }> {
    try {
      logger.info(`Analyzing ${logs.length} honeypot logs`);

      // Agréger IPs par fréquence
      const ipStats = new Map<string, number>();
      logs.forEach(log => {
        ipStats.set(log.sourceIP, (ipStats.get(log.sourceIP) || 0) + 1);
      });

      let iocsCreated = 0;
      let alertsCreated = 0;

      // Créer IOCs pour IPs avec > 5 tentatives
      for (const [ip, count] of ipStats.entries()) {
        if (count >= 5) {
          try {
            // Vérifier si IOC existe déjà
            const existing = await prisma.iOCHistory.findFirst({
              where: {
                tenantId,
                iocValue: ip,
                iocType: 'IP'
              }
            });

            if (!existing) {
              await prisma.iOCHistory.create({
                data: {
                  tenantId,
                  iocValue: ip,
                  iocType: 'IP',
                  source: 'Honeypot',
                  enrichmentData: {
                    honeypot: {
                      attackCount: count,
                      firstSeen: logs.find(l => l.sourceIP === ip)?.timestamp,
                      lastSeen: logs.filter(l => l.sourceIP === ip).pop()?.timestamp
                    }
                  },
                  // lastEnriched géré par observedAt: new Date()
                }
              });

              iocsCreated++;
            }

            // Créer alerte si beaucoup d'attaques
            if (count > 50) {
              const { AlertingService } = await import('./alerting.service');
              
              await AlertingService.createAlert({
                tenantId,
                storyId: `honeypot-${ip}-${Date.now()}`,
                severity: count > 100 ? 'HIGH' : 'MEDIUM',
                priority: count > 100 ? 'P1' : 'P2',
                category: 'INTRUSION_DETECTION' as any,
                title: `Honeypot Attack Detected from ${ip}`,
                summary: `${count} attack attempts in last 24h`,
                iocs: [ip],
                affectedAssets: [],
                recommendedActions: [
                  `Block IP ${ip} at firewall`,
                  'Review attack patterns',
                  'Check if production systems affected',
                  'Update IPS signatures'
                ]
              });

              alertsCreated++;
            }
          } catch (error) {
            logger.warn(`Failed to process honeypot IP ${ip}:`, error);
          }
        }
      }

      logger.info(`Honeypot analysis completed: ${iocsCreated} IOCs, ${alertsCreated} alerts`);

      return { iocsCreated, alertsCreated };
    } catch (error: any) {
      logger.error('Error analyzing honeypot logs:', error.message);
      return { iocsCreated: 0, alertsCreated: 0 };
    }
  }

  /**
   * Import complet depuis tous les honeypots configurés
   */
  static async importAllHoneypots(tenantId: string): Promise<any> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      const settings = ({} as Record<string, any>);
      const honeypots: HoneypotConfig[] = settings.honeypots || [];

      if (honeypots.length === 0) {
        logger.warn(`No honeypots configured for tenant ${tenantId}`);
        return { totalLogs: 0, iocsCreated: 0, alertsCreated: 0 };
      }

      logger.info(`Importing from ${honeypots.length} honeypots`);

      let totalLogs = 0;
      let totalIOCs = 0;
      let totalAlerts = 0;

      for (const honeypot of honeypots.filter(h => h.enabled)) {
        try {
          const logs = await this.collectLogs(tenantId, honeypot, 24);
          totalLogs += logs.length;

          const analysis = await this.analyzeLogs(tenantId, logs);
          totalIOCs += analysis.iocsCreated;
          totalAlerts += analysis.alertsCreated;

          await this.sleep(1000);
        } catch (error: any) {
          logger.error(`Honeypot ${honeypot.name} failed:`, error.message);
        }
      }

      logger.info(`Honeypot import completed: ${totalLogs} logs, ${totalIOCs} IOCs, ${totalAlerts} alerts`);

      return {
        honeypots: honeypots.length,
        totalLogs,
        iocsCreated: totalIOCs,
        alertsCreated: totalAlerts
      };
    } catch (error: any) {
      logger.error('Error importing honeypots:', error.message);
      throw error;
    }
  }

  /**
   * Statistiques honeypots
   */
  static async getStats(tenantId: string): Promise<HoneypotStats> {
    // Récupérer IOCs depuis honeypots
    const honeypotIOCs = await prisma.iOCHistory.findMany({
      where: {
        tenantId,
        source: 'Honeypot'
      }
    });

    const ipCounts = new Map<string, number>();
    
    honeypotIOCs.forEach(ioc => {
      const enrichData = ioc.enrichmentData as any;
      const count = enrichData?.honeypot?.attackCount || 1;
      ipCounts.set(ioc.iocValue, count);
    });

    const topAttackers = Array.from(ipCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    return {
      totalAttacks: honeypotIOCs.length,
      uniqueIPs: honeypotIOCs.length,
      topAttackers,
      topPorts: [
        { port: 22, count: 0 },   // SSH
        { port: 23, count: 0 },   // Telnet
        { port: 3306, count: 0 }, // MySQL
        { port: 445, count: 0 }   // SMB
      ],
      topCountries: []
    };
  }

  /**
   * Configurer honeypots pour un tenant
   */
  static async configure(
    tenantId: string,
    honeypots: HoneypotConfig[]
  ): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = ({} as Record<string, any>);
    settings.honeypots = honeypots;

    // TODO: Sauvegarder dans TenantConfiguration
    logger.info(`Honeypots configured for tenant ${tenantId}`, { honeypots });

    logger.info(`Honeypots configured for tenant ${tenantId}: ${honeypots.length} honeypots`);
  }

  /**
   * Honeypots supportés
   */
  static getSupportedHoneypots(): Array<{ name: string; type: string; description: string; url: string }> {
    return [
      {
        name: 'Cowrie',
        type: 'cowrie',
        description: 'SSH/Telnet honeypot - Détecte brute force, exploits SSH',
        url: 'https://github.com/cowrie/cowrie'
      },
      {
        name: 'Dionaea',
        type: 'dionaea',
        description: 'Multi-protocol honeypot - SMB, HTTP, FTP, MySQL, etc.',
        url: 'https://github.com/DinoTools/dionaea'
      },
      {
        name: 'T-Pot',
        type: 'tpot',
        description: 'All-in-one honeypot (Cowrie + Dionaea + 15 autres)',
        url: 'https://github.com/telekom-security/tpotce'
      },
      {
        name: 'Custom',
        type: 'custom',
        description: 'Format JSON custom (configurable)',
        url: 'https://docs.antstrike-cti.com/honeypots'
      }
    ];
  }

  // ========== Helpers ==========

  /**
   * Détecter type d'attaque
   */
  private static detectAttackType(log: any): string {
    const input = log.input?.toLowerCase() || '';
    const message = log.message?.toLowerCase() || '';
    const combined = input + ' ' + message;

    if (combined.includes('wget') || combined.includes('curl')) return 'malware-download';
    if (combined.includes('chmod') || combined.includes('execute')) return 'remote-execution';
    if (combined.includes('password') || combined.includes('passwd')) return 'brute-force';
    if (combined.includes('exploit')) return 'exploitation';
    if (combined.includes('scan')) return 'reconnaissance';

    return 'unknown';
  }

  /**
   * Sleep helper
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}




