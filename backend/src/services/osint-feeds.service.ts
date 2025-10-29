/**
 * 📡 OSINT Feeds Service
 * Agrégation automatique de feeds de threat intelligence publics
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { IOCEnrichmentService } from './ioc-enrichment.service';

interface OSINTFeed {
  id: string;
  name: string;
  url: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'mixed';
  format: 'text' | 'csv' | 'json' | 'stix';
  updateFrequency: number; // en minutes
  enabled: boolean;
  description: string;
}

interface FeedResult {
  feedId: string;
  feedName: string;
  imported: number;
  skipped: number;
  errors: number;
  timestamp: Date;
}

export class OSINTFeedsService {
  // Feeds OSINT gratuits et populaires
  private static readonly PUBLIC_FEEDS: OSINTFeed[] = [
    // Abuse.ch - Malware & C2
    {
      id: 'abuse-ch-feodotracker',
      name: 'Abuse.ch Feodo Tracker (Botnet C2)',
      url: 'https://feodotracker.abuse.ch/downloads/ipblocklist.txt',
      type: 'ip',
      format: 'text',
      updateFrequency: 360, // 6h
      enabled: true,
      description: 'Botnet C2 IP addresses (Emotet, TrickBot, etc.)'
    },
    {
      id: 'abuse-ch-urlhaus',
      name: 'Abuse.ch URLhaus',
      url: 'https://urlhaus.abuse.ch/downloads/text/',
      type: 'url',
      format: 'text',
      updateFrequency: 360,
      enabled: true,
      description: 'Malware distribution URLs'
    },
    {
      id: 'abuse-ch-threatfox',
      name: 'Abuse.ch ThreatFox IOCs',
      url: 'https://threatfox.abuse.ch/export/json/recent/',
      type: 'mixed',
      format: 'json',
      updateFrequency: 720, // 12h
      enabled: true,
      description: 'Recent IOCs (IPs, domains, hashes)'
    },
    
    // Blocklists
    {
      id: 'blocklist-de-all',
      name: 'Blocklist.de All Attacks',
      url: 'https://lists.blocklist.de/lists/all.txt',
      type: 'ip',
      format: 'text',
      updateFrequency: 1440, // 24h
      enabled: true,
      description: 'IPs that attacked servers'
    },
    
    // Emerging Threats
    {
      id: 'emergingthreats-compromised',
      name: 'Emerging Threats Compromised IPs',
      url: 'https://rules.emergingthreats.net/blockrules/compromised-ips.txt',
      type: 'ip',
      format: 'text',
      updateFrequency: 1440,
      enabled: true,
      description: 'Compromised IP addresses'
    },
    
    // PhishTank
    {
      id: 'phishtank',
      name: 'PhishTank',
      url: 'http://data.phishtank.com/data/online-valid.json',
      type: 'url',
      format: 'json',
      updateFrequency: 360,
      enabled: true,
      description: 'Verified phishing URLs'
    },
    
    // Tor Exit Nodes
    {
      id: 'tor-exit-nodes',
      name: 'Tor Exit Nodes',
      url: 'https://check.torproject.org/torbulkexitlist',
      type: 'ip',
      format: 'text',
      updateFrequency: 1440,
      enabled: true,
      description: 'Current Tor exit node IPs'
    },
    
    // SSL Blacklist
    {
      id: 'sslbl-abuse-ch',
      name: 'SSL Blacklist (Abuse.ch)',
      url: 'https://sslbl.abuse.ch/blacklist/sslipblacklist.csv',
      type: 'ip',
      format: 'csv',
      updateFrequency: 720,
      enabled: true,
      description: 'Malicious SSL certificates IPs'
    }
  ];

  /**
   * Obtenir tous les feeds disponibles
   */
  static getAvailableFeeds(): OSINTFeed[] {
    return this.PUBLIC_FEEDS;
  }

  /**
   * Obtenir feed par ID
   */
  static getFeedById(feedId: string): OSINTFeed | undefined {
    return this.PUBLIC_FEEDS.find(f => f.id === feedId);
  }

  /**
   * Import automatique de tous les feeds actifs
   */
  static async importAllFeeds(tenantId: string): Promise<FeedResult[]> {
    logger.info(`Starting OSINT feeds import for tenant ${tenantId}`);

    const results: FeedResult[] = [];
    const activeFeeds = this.PUBLIC_FEEDS.filter(f => f.enabled);

    for (const feed of activeFeeds) {
      try {
        const result = await this.importFeed(tenantId, feed.id);
        results.push(result);
        
        // Rate limiting entre feeds
        await this.sleep(2000);
      } catch (error: any) {
        logger.error(`Error importing feed ${feed.id}:`, error.message);
        results.push({
          feedId: feed.id,
          feedName: feed.name,
          imported: 0,
          skipped: 0,
          errors: 1,
          timestamp: new Date()
        });
      }
    }

    // Sauvegarder log d'import
    await this.saveFeedImportLog(tenantId, results);

    logger.info(`OSINT feeds import completed: ${results.length} feeds processed`);

    return results;
  }

  /**
   * Import d'un feed spécifique
   */
  static async importFeed(tenantId: string, feedId: string): Promise<FeedResult> {
    const feed = this.getFeedById(feedId);
    
    if (!feed) {
      throw new Error(`Feed ${feedId} not found`);
    }

    if (!feed.enabled) {
      throw new Error(`Feed ${feedId} is disabled`);
    }

    logger.info(`Importing feed: ${feed.name}`);

    const result: FeedResult = {
      feedId: feed.id,
      feedName: feed.name,
      imported: 0,
      skipped: 0,
      errors: 0,
      timestamp: new Date()
    };

    try {
      // Télécharger le feed
      const response = await axios.get(feed.url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'AntStrike-CTI/1.0'
        }
      });

      // Parser selon le format
      let iocs: string[] = [];
      
      switch (feed.format) {
        case 'text':
          iocs = this.parseTextFeed(response.data, feed.type);
          break;
        case 'csv':
          iocs = this.parseCSVFeed(response.data, feed.type);
          break;
        case 'json':
          iocs = this.parseJSONFeed(response.data, feed);
          break;
        default:
          throw new Error(`Unsupported format: ${feed.format}`);
      }

      logger.info(`Feed ${feed.name}: ${iocs.length} IOCs extracted`);

      // Importer les IOCs
      for (const ioc of iocs) {
        try {
          // Vérifier si existe déjà
          const existing = await prisma.iOCHistory.findFirst({
            where: {
              tenantId,
              iocValue: ioc,
              iocType: this.mapFeedTypeToIOCType(feed.type)
            }
          });

          if (existing) {
            result.skipped++;
            continue;
          }

          // Créer IOC sans enrichissement externe (économiser API calls)
          await prisma.iOCHistory.create({
            data: {
              tenantId,
              iocValue: ioc,
              iocType: this.mapFeedTypeToIOCType(feed.type),
              source: `OSINT Feed: ${feed.name}`,
              enrichmentData: {
                feed: {
                  id: feed.id,
                  name: feed.name,
                  importedAt: new Date().toISOString()
                }
              },
              // lastEnriched géré par observedAt new Date()
            }
          });

          result.imported++;

          // Log progress
          if (result.imported % 100 === 0) {
            logger.info(`Feed ${feed.name}: ${result.imported} IOCs imported...`);
          }

        } catch (error) {
          result.errors++;
        }
      }

      logger.info(`Feed ${feed.name} import completed:`, result);

    } catch (error: any) {
      logger.error(`Error processing feed ${feed.name}:`, error.message);
      result.errors++;
    }

    return result;
  }

  /**
   * Parser feed format texte
   */
  private static parseTextFeed(data: string, type: string): string[] {
    const lines = data.split('\n');
    const iocs: string[] = [];

    lines.forEach(line => {
      line = line.trim();
      
      // Ignorer commentaires et lignes vides
      if (!line || line.startsWith('#') || line.startsWith(';') || line.startsWith('//')) {
        return;
      }

      // Valider selon le type
      if (this.validateIOC(line, type)) {
        iocs.push(line);
      }
    });

    return [...new Set(iocs)]; // Unique
  }

  /**
   * Parser feed format CSV
   */
  private static parseCSVFeed(data: string, type: string): string[] {
    const lines = data.split('\n');
    const iocs: string[] = [];

    lines.forEach((line, index) => {
      // Skip header
      if (index === 0 || !line.trim()) return;

      const parts = line.split(',');
      if (parts.length > 0) {
        const ioc = parts[0].trim().replace(/"/g, '');
        if (this.validateIOC(ioc, type)) {
          iocs.push(ioc);
        }
      }
    });

    return [...new Set(iocs)];
  }

  /**
   * Parser feed format JSON
   */
  private static parseJSONFeed(data: any, feed: OSINTFeed): string[] {
    const iocs: string[] = [];

    try {
      let jsonData = typeof data === 'string' ? JSON.parse(data) : data;

      // PhishTank format
      if (feed.id === 'phishtank' && Array.isArray(jsonData)) {
        jsonData.forEach((entry: any) => {
          if (entry.url) {
            iocs.push(entry.url);
          }
        });
      }
      
      // Abuse.ch ThreatFox format
      else if (feed.id === 'abuse-ch-threatfox' && jsonData.data) {
        jsonData.data.forEach((entry: any) => {
          if (entry.ioc && entry.ioc_type) {
            iocs.push(entry.ioc);
          }
        });
      }
      
      // Generic array format
      else if (Array.isArray(jsonData)) {
        jsonData.forEach((entry: any) => {
          if (typeof entry === 'string') {
            iocs.push(entry);
          } else if (entry.indicator || entry.ioc || entry.value) {
            iocs.push(entry.indicator || entry.ioc || entry.value);
          }
        });
      }

    } catch (error) {
      logger.error('Error parsing JSON feed:', error);
    }

    return [...new Set(iocs)];
  }

  /**
   * Valider IOC selon le type
   */
  private static validateIOC(value: string, type: string): boolean {
    switch (type) {
      case 'ip':
        return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value);
      
      case 'domain':
        return /^[a-z0-9][a-z0-9-]*\.[a-z]{2,}$/i.test(value);
      
      case 'url':
        return value.startsWith('http://') || value.startsWith('https://');
      
      case 'hash':
        return /^[a-f0-9]{32,64}$/i.test(value);
      
      case 'mixed':
        // Accepter tous les formats valides
        return this.validateIOC(value, 'ip') ||
               this.validateIOC(value, 'domain') ||
               this.validateIOC(value, 'url') ||
               this.validateIOC(value, 'hash');
      
      default:
        return false;
    }
  }

  /**
   * Mapper type de feed vers type IOC
   */
  private static mapFeedTypeToIOCType(feedType: string): string {
    const mapping: Record<string, string> = {
      'ip': 'IP',
      'domain': 'DOMAIN',
      'url': 'URL',
      'hash': 'FILE_HASH',
      'mixed': 'IP' // Default pour mixed
    };

    return mapping[feedType] || 'IP';
  }

  /**
   * Sauvegarder log d'import
   */
  private static async saveFeedImportLog(
    tenantId: string,
    results: FeedResult[]
  ): Promise<void> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      const settings = ({} as Record<string, any>);
      if (!settings.osintFeedLogs) settings.osintFeedLogs = [];

      const log = {
        timestamp: new Date().toISOString(),
        feedsProcessed: results.length,
        totalImported: results.reduce((sum, r) => sum + r.imported, 0),
        totalSkipped: results.reduce((sum, r) => sum + r.skipped, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors, 0),
        details: results
      };

      settings.osintFeedLogs.push(log);

      // Garder seulement les 30 derniers logs
      if (settings.osintFeedLogs.length > 30) {
        settings.osintFeedLogs = settings.osintFeedLogs.slice(-30);
      }

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {}
      });

      logger.info('OSINT feed import log saved');
    } catch (error) {
      logger.warn('Failed to save feed import log:', error);
    }
  }

  /**
   * Statistiques des feeds
   */
  static async getStats(tenantId: string): Promise<any> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = ({} as Record<string, any>);
    const logs = settings.osintFeedLogs || [];

    // Total IOCs importés depuis feeds
    const feedIOCs = await prisma.iOCHistory.count({
      where: {
        tenantId,
        source: {
          startsWith: 'OSINT Feed:'
        }
      }
    });

    // Dernière import
    const lastImport = logs.length > 0 ? logs[logs.length - 1] : null;

    // Stats par feed
    const feedStats: Record<string, number> = {};
    logs.forEach((log: any) => {
      log.details?.forEach((detail: FeedResult) => {
        feedStats[detail.feedName] = (feedStats[detail.feedName] || 0) + detail.imported;
      });
    });

    return {
      availableFeeds: this.PUBLIC_FEEDS.length,
      activeFeeds: this.PUBLIC_FEEDS.filter(f => f.enabled).length,
      totalIOCsFromFeeds: feedIOCs,
      lastImport: lastImport ? {
        timestamp: lastImport.timestamp,
        imported: lastImport.totalImported,
        errors: lastImport.totalErrors
      } : null,
      topFeeds: Object.entries(feedStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      importHistory: logs.slice(-10)
    };
  }

  /**
   * Configurer feeds pour un tenant
   */
  static async configureFeedsForTenant(
    tenantId: string,
    config: {
      enabled: boolean;
      autoImport: boolean;
      importInterval?: number; // en heures
      selectedFeeds?: string[];
    }
  ): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = ({} as Record<string, any>);
    settings.osintFeeds = {
      enabled: config.enabled,
      autoImport: config.autoImport,
      importInterval: config.importInterval || 24,
      selectedFeeds: config.selectedFeeds || this.PUBLIC_FEEDS.map(f => f.id),
      lastConfigUpdate: new Date().toISOString()
    };

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {}
    });

    logger.info(`OSINT feeds configured for tenant ${tenantId}`);
  }

  /**
   * Helper: Sleep
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}




