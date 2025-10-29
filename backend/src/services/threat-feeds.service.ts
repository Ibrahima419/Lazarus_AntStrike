/**
 * 🎯 Threat Feeds Service
 * Intégration avec feeds de threat intelligence commerciaux (gratuits)
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface ThreatFeed {
  id: string;
  name: string;
  provider: string;
  apiUrl: string;
  requiresAuth: boolean;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'mixed';
  enabled: boolean;
  description: string;
}

export class ThreatFeedsService {
  /**
   * AlienVault OTX (Open Threat Exchange)
   */
  static async syncAlienVaultOTX(tenantId: string): Promise<{ imported: number; skipped: number }> {
    try {
      const apiKey = process.env.OTX_API_KEY;
      
      if (!apiKey) {
        logger.warn('AlienVault OTX API key not configured');
        return { imported: 0, skipped: 0 };
      }

      logger.info('Syncing AlienVault OTX...');

      // Récupérer pulses subscribed
      const response = await axios.get(
        'https://otx.alienvault.com/api/v1/pulses/subscribed',
        {
          headers: { 'X-OTX-API-KEY': apiKey },
          params: {
            modified_since: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 jours
            limit: 100
          },
          timeout: 15000
        }
      );

      const pulses = response.data.results || [];
      
      let imported = 0;
      let skipped = 0;

      for (const pulse of pulses) {
        for (const indicator of pulse.indicators || []) {
          try {
            const iocType = this.mapOTXType(indicator.type);
            
            if (!iocType) {
              skipped++;
              continue;
            }

            // Vérifier si existe
            const existing = await prisma.iOCHistory.findFirst({
              where: {
                tenantId,
                iocValue: indicator.indicator,
                iocType
              }
            });

            if (existing) {
              skipped++;
              continue;
            }

            // Créer IOC
            await prisma.iOCHistory.create({
              data: {
                tenantId,
                iocValue: indicator.indicator,
                iocType,
                source: `AlienVault OTX: ${pulse.name}`,
                enrichmentData: {
                  otx: {
                    pulseId: pulse.id,
                    pulseName: pulse.name,
                    description: indicator.description,
                    tags: pulse.tags || [],
                    tlp: pulse.TLP || 'white'
                  }
                },
                // lastEnriched géré par observedAt: new Date()
              }
            });

            imported++;
          } catch (error) {
            skipped++;
          }
        }

        // Rate limiting
        await this.sleep(1000);
      }

      logger.info(`AlienVault OTX sync: ${imported} imported, ${skipped} skipped`);

      return { imported, skipped };
    } catch (error: any) {
      logger.error('AlienVault OTX sync error:', error.message);
      return { imported: 0, skipped: 0 };
    }
  }

  /**
   * MalwareBazaar (Abuse.ch)
   */
  static async syncMalwareBazaar(tenantId: string): Promise<{ imported: number; skipped: number }> {
    try {
      logger.info('Syncing MalwareBazaar...');

      // MalwareBazaar API (gratuit, pas de clé requise)
      const response = await axios.post(
        'https://mb-api.abuse.ch/api/v1/',
        {
          query: 'get_recent',
          selector: 100 // 100 derniers samples
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const samples = response.data.data || [];
      
      let imported = 0;
      let skipped = 0;

      for (const sample of samples) {
        try {
          // Hashes disponibles: MD5, SHA256
          const hashes = [
            sample.sha256_hash,
            sample.md5_hash
          ].filter(Boolean);

          for (const hash of hashes) {
            const existing = await prisma.iOCHistory.findFirst({
              where: {
                tenantId,
                iocValue: hash,
                iocType: 'FILE_HASH'
              }
            });

            if (existing) {
              skipped++;
              continue;
            }

            await prisma.iOCHistory.create({
              data: {
                tenantId,
                iocValue: hash,
                iocType: 'FILE_HASH',
                source: 'MalwareBazaar',
                enrichmentData: {
                  malwareBazaar: {
                    signature: sample.signature,
                    fileType: sample.file_type,
                    fileSize: sample.file_size,
                    tags: sample.tags || [],
                    firstSeen: sample.first_seen
                  }
                },
                // lastEnriched géré par observedAt: new Date()
              }
            });

            imported++;
          }
        } catch (error) {
          skipped++;
        }
      }

      logger.info(`MalwareBazaar sync: ${imported} imported, ${skipped} skipped`);

      return { imported, skipped };
    } catch (error: any) {
      logger.error('MalwareBazaar sync error:', error.message);
      return { imported: 0, skipped: 0 };
    }
  }

  /**
   * ThreatFox (Abuse.ch) - déjà dans OSINT feeds mais avec enrichissement
   */
  static async syncThreatFox(tenantId: string): Promise<{ imported: number; skipped: number }> {
    try {
      logger.info('Syncing ThreatFox...');

      const response = await axios.post(
        'https://threatfox-api.abuse.ch/api/v1/',
        {
          query: 'get_iocs',
          days: 7
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const iocs = response.data.data || [];
      
      let imported = 0;
      let skipped = 0;

      for (const ioc of iocs) {
        try {
          const iocType = this.mapThreatFoxType(ioc.ioc_type);
          
          if (!iocType) {
            skipped++;
            continue;
          }

          const existing = await prisma.iOCHistory.findFirst({
            where: {
              tenantId,
              iocValue: ioc.ioc_value,
              iocType
            }
          });

          if (existing) {
            skipped++;
            continue;
          }

          await prisma.iOCHistory.create({
            data: {
              tenantId,
              iocValue: ioc.ioc_value,
              iocType,
              source: 'ThreatFox',
              enrichmentData: {
                threatFox: {
                  threatType: ioc.threat_type,
                  malware: ioc.malware,
                  confidence: ioc.confidence_level,
                  tags: ioc.tags || [],
                  firstSeen: ioc.first_seen
                }
              },
              // lastEnriched géré par observedAt: new Date()
            }
          });

          imported++;
        } catch (error) {
          skipped++;
        }
      }

      logger.info(`ThreatFox sync: ${imported} imported, ${skipped} skipped`);

      return { imported, skipped };
    } catch (error: any) {
      logger.error('ThreatFox sync error:', error.message);
      return { imported: 0, skipped: 0 };
    }
  }

  /**
   * URLhaus (Abuse.ch) - déjà dans OSINT feeds mais avec enrichissement
   */
  static async syncURLhaus(tenantId: string): Promise<{ imported: number; skipped: number }> {
    try {
      logger.info('Syncing URLhaus...');

      const response = await axios.post(
        'https://urlhaus-api.abuse.ch/v1/urls/recent/',
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const urls = response.data.urls || [];
      
      let imported = 0;
      let skipped = 0;

      for (const urlData of urls.slice(0, 200)) { // Limiter à 200
        try {
          const existing = await prisma.iOCHistory.findFirst({
            where: {
              tenantId,
              iocValue: urlData.url,
              iocType: 'URL'
            }
          });

          if (existing) {
            skipped++;
            continue;
          }

          await prisma.iOCHistory.create({
            data: {
              tenantId,
              iocValue: urlData.url,
              iocType: 'URL',
              source: 'URLhaus',
              enrichmentData: {
                urlhaus: {
                  host: urlData.host,
                  urlStatus: urlData.url_status,
                  threat: urlData.threat,
                  tags: urlData.tags || [],
                  dateAdded: urlData.date_added
                }
              },
              // lastEnriched géré par observedAt: new Date()
            }
          });

          imported++;
        } catch (error) {
          skipped++;
        }
      }

      logger.info(`URLhaus sync: ${imported} imported, ${skipped} skipped`);

      return { imported, skipped };
    } catch (error: any) {
      logger.error('URLhaus sync error:', error.message);
      return { imported: 0, skipped: 0 };
    }
  }

  /**
   * Synchroniser tous les feeds
   */
  static async syncAllFeeds(tenantId: string): Promise<any> {
    logger.info(`Syncing all threat feeds for tenant ${tenantId}`);

    const [otxResult, mbResult, tfResult, uhResult] = await Promise.allSettled([
      this.syncAlienVaultOTX(tenantId),
      this.syncMalwareBazaar(tenantId),
      this.syncThreatFox(tenantId),
      this.syncURLhaus(tenantId)
    ]);

    const results = {
      alienVaultOTX: otxResult.status === 'fulfilled' ? otxResult.value : { imported: 0, skipped: 0 },
      malwareBazaar: mbResult.status === 'fulfilled' ? mbResult.value : { imported: 0, skipped: 0 },
      threatFox: tfResult.status === 'fulfilled' ? tfResult.value : { imported: 0, skipped: 0 },
      urlhaus: uhResult.status === 'fulfilled' ? uhResult.value : { imported: 0, skipped: 0 }
    };

    const totalImported = Object.values(results).reduce((sum, r) => sum + r.imported, 0);
    const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.skipped, 0);

    logger.info(`All threat feeds synced: ${totalImported} imported, ${totalSkipped} skipped`);

    // Sauvegarder log
    await this.saveSyncLog(tenantId, results);

    return {
      ...results,
      total: {
        imported: totalImported,
        skipped: totalSkipped
      }
    };
  }

  /**
   * Statistiques threat feeds
   */
  static async getStats(tenantId: string): Promise<any> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = ({} as Record<string, any>);
    const logs = settings.threatFeedLogs || [];

    // IOCs par source
    const sources = ['AlienVault OTX', 'MalwareBazaar', 'ThreatFox', 'URLhaus'];
    const bySource: Record<string, number> = {};

    for (const source of sources) {
      const count = await prisma.iOCHistory.count({
        where: {
          tenantId,
          source: { startsWith: source }
        }
      });
      bySource[source] = count;
    }

    const total = Object.values(bySource).reduce((a, b) => a + b, 0);

    return {
      totalIOCs: total,
      bySource,
      lastSync: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
      syncHistory: logs.slice(-10)
    };
  }

  /**
   * Configurer threat feeds
   */
  static async configure(
    tenantId: string,
    config: {
      enabled: boolean;
      autoSync: boolean;
      syncInterval?: number;
      feeds: string[];
    }
  ): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = ({} as Record<string, any>);
    settings.threatFeeds = {
      enabled: config.enabled,
      autoSync: config.autoSync,
      syncInterval: config.syncInterval || 24,
      feeds: config.feeds,
      lastConfigUpdate: new Date().toISOString()
    };

      // TODO: Sauvegarder dans TenantConfiguration
      logger.info(`Threat feeds configured for tenant ${tenantId}`, { feedsConfig: config.feeds });

    logger.info(`Threat feeds configured for tenant ${tenantId}`);
  }

  // ========== Type Mapping ==========

  /**
   * Mapper type OTX vers AntStrike
   */
  private static mapOTXType(otxType: string): string | null {
    const mapping: Record<string, string> = {
      'IPv4': 'IP',
      'IPv6': 'IP',
      'domain': 'DOMAIN',
      'hostname': 'DOMAIN',
      'URL': 'URL',
      'URI': 'URL',
      'FileHash-MD5': 'FILE_HASH',
      'FileHash-SHA1': 'FILE_HASH',
      'FileHash-SHA256': 'FILE_HASH',
      'email': 'EMAIL',
      'CVE': 'CVE'
    };

    return mapping[otxType] || null;
  }

  /**
   * Mapper type ThreatFox vers AntStrike
   */
  private static mapThreatFoxType(tfType: string): string | null {
    const mapping: Record<string, string> = {
      'ip:port': 'IP',
      'domain': 'DOMAIN',
      'url': 'URL',
      'md5_hash': 'FILE_HASH',
      'sha256_hash': 'FILE_HASH'
    };

    return mapping[tfType] || null;
  }

  /**
   * Sauvegarder log de sync
   */
  private static async saveSyncLog(tenantId: string, results: any): Promise<void> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      const settings = ({} as Record<string, any>);
      if (!settings.threatFeedLogs) settings.threatFeedLogs = [];

      settings.threatFeedLogs.push({
        timestamp: new Date().toISOString(),
        results
      });

      // Garder 50 derniers
      if (settings.threatFeedLogs.length > 50) {
        settings.threatFeedLogs = settings.threatFeedLogs.slice(-50);
      }

      await prisma.tenant.update({
        where: { id: tenantId },
        data: { 
          // settings: settings // TODO: TenantConfiguration
        }
      });
    } catch (error) {
      logger.warn('Failed to save threat feed log:', error);
    }
  }

  /**
   * Helper: Sleep
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Feeds disponibles
   */
  static getAvailableFeeds(): ThreatFeed[] {
    return [
      {
        id: 'alienvault-otx',
        name: 'AlienVault OTX',
        provider: 'AlienVault',
        apiUrl: 'https://otx.alienvault.com/api/v1',
        requiresAuth: true,
        type: 'mixed',
        enabled: true,
        description: 'Open Threat Exchange - 19M+ pulses, 100K+ contributors'
      },
      {
        id: 'malwarebazaar',
        name: 'MalwareBazaar',
        provider: 'Abuse.ch',
        apiUrl: 'https://mb-api.abuse.ch/api/v1',
        requiresAuth: false,
        type: 'hash',
        enabled: true,
        description: 'Malware samples repository - 1M+ samples'
      },
      {
        id: 'threatfox',
        name: 'ThreatFox',
        provider: 'Abuse.ch',
        apiUrl: 'https://threatfox-api.abuse.ch/api/v1',
        requiresAuth: false,
        type: 'mixed',
        enabled: true,
        description: 'IOCs from malware researchers'
      },
      {
        id: 'urlhaus',
        name: 'URLhaus',
        provider: 'Abuse.ch',
        apiUrl: 'https://urlhaus-api.abuse.ch/v1',
        requiresAuth: false,
        type: 'url',
        enabled: true,
        description: 'Malware distribution sites'
      }
    ];
  }
}

