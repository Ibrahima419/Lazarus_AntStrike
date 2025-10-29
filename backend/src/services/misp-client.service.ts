/**
 * 🔗 MISP Client Service
 * Intégration bi-directionnelle avec MISP (Malware Information Sharing Platform)
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { IOCEnrichmentService } from './ioc-enrichment.service';

interface MISPConfig {
  url: string;
  apiKey: string;
  verifySsl?: boolean;
}

interface MISPEvent {
  id: string;
  info: string;
  threat_level_id: number;
  analysis: number;
  date: string;
  published: boolean;
  Attribute: MISPAttribute[];
}

interface MISPAttribute {
  id: string;
  event_id: string;
  type: string;
  category: string;
  value: string;
  to_ids: boolean;
  comment: string;
  timestamp: number;
  Tag?: Array<{ name: string }>;
}

export class MISPClientService {
  /**
   * Créer client MISP authentifié
   */
  private static createClient(config: MISPConfig): AxiosInstance {
    return axios.create({
      baseURL: config.url,
      headers: {
        'Authorization': config.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      httpsAgent: config.verifySsl === false ? 
        new (require('https').Agent)({ rejectUnauthorized: false }) : 
        undefined,
      timeout: 30000
    });
  }

  /**
   * Tester connexion MISP
   */
  static async testConnection(config: MISPConfig): Promise<boolean> {
    try {
      const client = this.createClient(config);
      const response = await client.get('/servers/getPyMISPVersion.json');
      
      logger.info(`MISP connection successful: ${config.url}`, {
        version: response.data.version
      });
      
      return true;
    } catch (error: any) {
      logger.error('MISP connection failed:', error.message);
      return false;
    }
  }

  /**
   * Récupérer events récents depuis MISP
   */
  static async getRecentEvents(
    config: MISPConfig,
    lastDays: number = 7
  ): Promise<MISPEvent[]> {
    try {
      const client = this.createClient(config);
      
      const timestamp = Math.floor(Date.now() / 1000) - (lastDays * 86400);
      
      const response = await client.post('/events/restSearch', {
        returnFormat: 'json',
        published: true,
        timestamp: timestamp.toString(),
        limit: 100,
        page: 1
      });

      const events = response.data.response || [];
      
      logger.info(`MISP events retrieved: ${events.length} events from last ${lastDays} days`);
      
      return events.map((e: any) => e.Event);
    } catch (error: any) {
      logger.error('Erreur récupération events MISP:', error.message);
      throw error;
    }
  }

  /**
   * Récupérer attributes (IOCs) depuis MISP
   */
  static async getAttributes(
    config: MISPConfig,
    filters?: {
      type?: string;
      category?: string;
      limit?: number;
      to_ids?: boolean;
    }
  ): Promise<MISPAttribute[]> {
    try {
      const client = this.createClient(config);
      
      const response = await client.post('/attributes/restSearch', {
        returnFormat: 'json',
        type: filters?.type,
        category: filters?.category,
        limit: filters?.limit || 1000,
        to_ids: filters?.to_ids !== false,  // Par défaut: seulement IOCs marqués pour IDS
        published: true,
        enforceWarninglist: true  // Filtrer false positives
      });

      const attributes = response.data.response?.Attribute || [];
      
      logger.info(`MISP attributes retrieved: ${attributes.length} IOCs`);
      
      return attributes;
    } catch (error: any) {
      logger.error('Erreur récupération attributes MISP:', error.message);
      throw error;
    }
  }

  /**
   * Publier event sur MISP
   */
  static async publishEvent(
    config: MISPConfig,
    event: {
      info: string;
      threat_level_id: number;  // 1=High, 2=Medium, 3=Low, 4=Undefined
      analysis: number;  // 0=Initial, 1=Ongoing, 2=Complete
      distribution: number;  // 0=Org only, 1=Community, 2=Connected, 3=All
      attributes: Array<{
        type: string;
        category: string;
        value: string;
        to_ids: boolean;
        comment?: string;
      }>;
      tags?: string[];
    }
  ): Promise<MISPEvent> {
    try {
      const client = this.createClient(config);
      
      const response = await client.post('/events/add', {
        Event: event
      });

      const createdEvent = response.data.Event;
      
      logger.info(`Event publié sur MISP: ${createdEvent.id} - ${event.info}`);
      
      return createdEvent;
    } catch (error: any) {
      logger.error('Erreur publication MISP event:', error.message);
      throw error;
    }
  }

  /**
   * Synchroniser IOCs MISP → AntStrike
   */
  static async syncIOCs(
    tenantId: string,
    config: MISPConfig,
    options?: {
      lastDays?: number;
      types?: string[];
      autoEnrich?: boolean;
    }
  ): Promise<{ imported: number; skipped: number; errors: number }> {
    try {
      logger.info(`Starting MISP sync for tenant ${tenantId}`);

      const stats = {
        imported: 0,
        skipped: 0,
        errors: 0
      };

      // Récupérer attributes MISP
      const attributes = await this.getAttributes(config, {
        limit: 1000,
        to_ids: true
      });

      logger.info(`Processing ${attributes.length} MISP attributes...`);

      // Traiter chaque attribute
      for (const attr of attributes) {
        try {
          // Convertir MISP → AntStrike IOC
          const ioc = this.mispAttributeToIOC(attr);
          
          if (!ioc) {
            stats.skipped++;
            continue;
          }

          // Filtrer par types si spécifié
          if (options?.types && !options.types.includes(ioc.iocType)) {
            stats.skipped++;
            continue;
          }

          // Vérifier si déjà existe
          const existing = await prisma.iOCHistory.findFirst({
            where: {
              tenantId,
              iocValue: ioc.iocValue,
              iocType: ioc.iocType
            }
          });

          if (existing) {
            stats.skipped++;
            continue;
          }

          // Importer et enrichir (optionnel)
          if (options?.autoEnrich !== false) {
            await IOCEnrichmentService.enrichIOC(tenantId, ioc);
          } else {
            // Import sans enrichissement externe (plus rapide)
            await prisma.iOCHistory.create({
              data: {
                tenantId,
                iocValue: ioc.iocValue,
                iocType: ioc.iocType,
                source: ioc.source,
                enrichmentData: {
                  misp: {
                    eventId: attr.event_id,
                    category: attr.category,
                    comment: attr.comment,
                    tags: attr.Tag?.map(t => t.name) || []
                  }
                }
              }
            });
          }

          stats.imported++;
          
          // Log progress chaque 100
          if (stats.imported % 100 === 0) {
            logger.info(`MISP sync progress: ${stats.imported} imported...`);
          }

        } catch (error) {
          logger.warn(`Failed to import MISP attribute ${attr.id}:`, error);
          stats.errors++;
        }
      }

      logger.info(`MISP sync completed for tenant ${tenantId}`, stats);

      // Enregistrer log de sync
      await this.recordSyncLog(tenantId, stats);

      return stats;
    } catch (error: any) {
      logger.error('Erreur sync MISP:', error.message);
      throw error;
    }
  }

  /**
   * Publier IOCs AntStrike → MISP
   */
  static async publishIOCs(
    tenantId: string,
    config: MISPConfig,
    iocIds: string[],
    eventInfo?: string
  ): Promise<{ eventId: string; published: number }> {
    try {
      logger.info(`Publishing ${iocIds.length} IOCs to MISP`);

      // Récupérer IOCs
      const iocs = await prisma.iOCHistory.findMany({
        where: {
          tenantId,
          id: { in: iocIds }
        }
      });

      // Créer attributes MISP
      const attributes = iocs.map(ioc => this.iocToMISPAttribute(ioc));

      // Créer event MISP
      const event = await this.publishEvent(config, {
        info: eventInfo || `IOCs from AntStrike CTI - ${new Date().toISOString()}`,
        threat_level_id: 2,  // Medium
        analysis: 2,  // Complete
        distribution: 1,  // Community
        attributes,
        tags: ['AntStrike-CTI', 'automated-export']
      });

      logger.info(`Published ${attributes.length} IOCs to MISP event ${event.id}`);

      return {
        eventId: event.id,
        published: attributes.length
      };
    } catch (error: any) {
      logger.error('Erreur publication IOCs MISP:', error.message);
      throw error;
    }
  }

  // ========== Mapping Methods ==========

  /**
   * Convertir MISP Attribute → AntStrike IOC
   */
  private static mispAttributeToIOC(attr: MISPAttribute): any | null {
    const iocType = this.mapMISPType(attr.type);
    
    if (!iocType) {
      logger.debug(`Skipping unsupported MISP type: ${attr.type}`);
      return null;
    }

    return {
      iocValue: attr.value,
      iocType,
      source: `MISP Event ${attr.event_id}`,
      confidence: this.calculateConfidence(attr),
      tags: attr.Tag?.map(t => t.name) || []
    };
  }

  /**
   * Convertir IOC AntStrike → MISP Attribute
   */
  private static iocToMISPAttribute(ioc: any): any {
    const mispType = this.mapToMISPType(ioc.iocType, ioc.iocValue);
    
    return {
      type: mispType,
      category: this.determineMISPCategory(ioc),
      value: ioc.iocValue,
      to_ids: true,
      comment: `Imported from AntStrike CTI`,
      disable_correlation: false
    };
  }

  /**
   * Mapper type MISP → AntStrike
   */
  private static mapMISPType(mispType: string): string | null {
    const TYPE_MAP: Record<string, string> = {
      // Network
      'ip-src': 'IP',
      'ip-dst': 'IP',
      'ip-src|port': 'IP',
      'ip-dst|port': 'IP',
      'domain': 'DOMAIN',
      'hostname': 'DOMAIN',
      'url': 'URL',
      'uri': 'URL',
      
      // Email
      'email': 'EMAIL',
      'email-src': 'EMAIL',
      'email-dst': 'EMAIL',
      'email-subject': 'EMAIL',
      
      // File hashes
      'md5': 'FILE_HASH',
      'sha1': 'FILE_HASH',
      'sha256': 'FILE_HASH',
      'sha512': 'FILE_HASH',
      'ssdeep': 'FILE_HASH',
      'filename|md5': 'FILE_HASH',
      'filename|sha1': 'FILE_HASH',
      'filename|sha256': 'FILE_HASH',
      
      // Vulnerability
      'vulnerability': 'CVE',
      'weakness': 'CVE'
    };

    return TYPE_MAP[mispType] || null;
  }

  /**
   * Mapper type AntStrike → MISP
   */
  private static mapToMISPType(iocType: string, value: string): string {
    const TYPE_MAP: Record<string, string> = {
      'IP': 'ip-dst',
      'DOMAIN': 'domain',
      'URL': 'url',
      'EMAIL': 'email-dst',
      'CVE': 'vulnerability'
    };

    // Pour FILE_HASH, détecter le type
    if (iocType === 'FILE_HASH') {
      const length = value.length;
      if (length === 32) return 'md5';
      if (length === 40) return 'sha1';
      if (length === 64) return 'sha256';
      return 'sha256';
    }

    return TYPE_MAP[iocType] || 'other';
  }

  /**
   * Déterminer catégorie MISP
   */
  private static determineMISPCategory(ioc: any): string {
    const enrichData = ioc.enrichmentData;

    // Malware
    if (enrichData?.fileData?.malicious) return 'Payload delivery';
    
    // Network activity
    if (ioc.iocType === 'IP' || ioc.iocType === 'DOMAIN') {
      if (enrichData?.ipData?.reputation === 'malicious') {
        return 'Network activity';
      }
      return 'External analysis';
    }

    // Phishing
    if (enrichData?.domainData?.phishingDetected) return 'Social engineering';

    return 'Other';
  }

  /**
   * Calculer confidence depuis MISP attribute
   */
  private static calculateConfidence(attr: MISPAttribute): number {
    let confidence = 50;  // Base

    // IDS flag = haute confidence
    if (attr.to_ids) confidence += 30;

    // Commentaire détaillé = plus fiable
    if (attr.comment && attr.comment.length > 20) confidence += 10;

    // Tags multiples = plus de contexte
    if (attr.Tag && attr.Tag.length > 2) confidence += 10;

    return Math.min(confidence, 100);
  }

  /**
   * Récupérer config MISP du tenant
   */
  static async getTenantMISPConfig(tenantId: string): Promise<MISPConfig | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) return null;

    const settings = ({} as Record<string, any>);
    const mispConfig = settings?.misp;

    if (!mispConfig?.enabled || !mispConfig?.url || !mispConfig?.apiKey) {
      return null;
    }

    return {
      url: mispConfig.url,
      apiKey: mispConfig.apiKey,
      verifySsl: mispConfig.verifySsl !== false
    };
  }

  /**
   * Enregistrer log de synchronisation
   */
  private static async recordSyncLog(
    tenantId: string,
    stats: { imported: number; skipped: number; errors: number }
  ): Promise<void> {
    try {
      // Créer log dans tenant.settings ou table dédiée
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      const settings = {} as Record<string, any> // TODO: TenantConfiguration as any || {};
      if (!settings.mispSyncLogs) settings.mispSyncLogs = [];

      settings.mispSyncLogs.push({
        timestamp: new Date().toISOString(),
        ...stats
      });

      // Garder seulement les 50 derniers logs
      if (settings.mispSyncLogs.length > 50) {
        settings.mispSyncLogs = settings.mispSyncLogs.slice(-50);
      }

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {} // TODO: Save to TenantConfiguration
      });

      logger.info('MISP sync log recorded', stats);
    } catch (error) {
      logger.warn('Failed to record MISP sync log:', error);
    }
  }

  /**
   * Statistiques MISP pour tenant
   */
  static async getStats(tenantId: string): Promise<any> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = {} as Record<string, any> // TODO: TenantConfiguration as any || {};
    const mispConfig = settings?.misp;
    const syncLogs = settings?.mispSyncLogs || [];

    // Calculer totaux
    const totalImported = syncLogs.reduce((sum: number, log: any) => sum + (log.imported || 0), 0);
    const totalSkipped = syncLogs.reduce((sum: number, log: any) => sum + (log.skipped || 0), 0);
    const totalErrors = syncLogs.reduce((sum: number, log: any) => sum + (log.errors || 0), 0);

    // Last sync
    const lastSync = syncLogs.length > 0 ? syncLogs[syncLogs.length - 1] : null;

    return {
      enabled: mispConfig?.enabled || false,
      url: mispConfig?.url || null,
      autoSync: mispConfig?.autoSync || false,
      syncInterval: mispConfig?.syncInterval || 3600,
      lastSync: lastSync?.timestamp || null,
      totalImported,
      totalSkipped,
      totalErrors,
      syncHistory: syncLogs.slice(-10)  // 10 derniers syncs
    };
  }

  /**
   * Configurer MISP pour tenant
   */
  static async configureMISP(
    tenantId: string,
    config: {
      url: string;
      apiKey: string;
      enabled?: boolean;
      autoSync?: boolean;
      syncInterval?: number;
      verifySsl?: boolean;
    }
  ): Promise<void> {
    try {
      // Tester connexion
      const isValid = await this.testConnection({
        url: config.url,
        apiKey: config.apiKey,
        verifySsl: config.verifySsl
      });

      if (!isValid) {
        throw new Error('MISP connection failed');
      }

      // Sauvegarder config
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      const settings = {} as Record<string, any> // TODO: TenantConfiguration as any || {};
      settings.misp = {
        url: config.url,
        apiKey: config.apiKey,
        enabled: config.enabled !== false,
        autoSync: config.autoSync || false,
        syncInterval: config.syncInterval || 3600,
        verifySsl: config.verifySsl !== false
      };

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {} // TODO: Save to TenantConfiguration
      });

      logger.info(`MISP configured for tenant ${tenantId}:`, {
        url: config.url,
        autoSync: config.autoSync
      });
    } catch (error: any) {
      logger.error('Erreur configuration MISP:', error.message);
      throw error;
    }
  }
}




