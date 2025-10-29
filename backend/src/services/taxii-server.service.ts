/**
 * 📡 TAXII 2.1 Server Service
 * Serveur TAXII pour partage de threat intelligence
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { STIXParserService } from './stix-parser.service';

// TAXII 2.1 Types
interface TAXIIDiscovery {
  title: string;
  description: string;
  contact: string;
  default: string;
  api_roots: string[];
}

interface TAXIICollection {
  id: string;
  title: string;
  description: string;
  can_read: boolean;
  can_write: boolean;
  media_types: string[];
}

interface TAXIIEnvelope {
  more: boolean;
  objects: any[];
}

export class TAXIIServerService {
  private static readonly API_ROOT = '/taxii';
  private static readonly SERVER_TITLE = 'AntStrike CTI TAXII Server';
  private static readonly SERVER_DESC = 'TAXII 2.1 server for cyber threat intelligence sharing';

  /**
   * Discovery Endpoint
   * GET /taxii/
   */
  static getDiscovery(): TAXIIDiscovery {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    
    return {
      title: this.SERVER_TITLE,
      description: this.SERVER_DESC,
      contact: 'support@antstrike-cti.com',
      default: `${baseUrl}${this.API_ROOT}/collections/`,
      api_roots: [
        `${baseUrl}${this.API_ROOT}/`
      ]
    };
  }

  /**
   * API Root Information
   * GET /taxii/
   */
  static getAPIRoot() {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    
    return {
      title: this.SERVER_TITLE,
      description: this.SERVER_DESC,
      versions: ['application/taxii+json;version=2.1'],
      max_content_length: 10485760,  // 10MB
      collections: `${baseUrl}${this.API_ROOT}/collections/`
    };
  }

  /**
   * Get Collections
   * GET /taxii/collections/
   */
  static async getCollections(tenantId: string): Promise<{ collections: TAXIICollection[] }> {
    // Collections par défaut (peuvent être customisées par tenant)
    const collections: TAXIICollection[] = [
      {
        id: 'indicators',
        title: 'IOCs & Indicators of Compromise',
        description: 'Collection of IP addresses, domains, file hashes, and other indicators',
        can_read: true,
        can_write: true,
        media_types: ['application/taxii+json;version=2.1']
      },
      {
        id: 'threats',
        title: 'Threat Intelligence',
        description: 'Malware, threat actors, and intrusion sets',
        can_read: true,
        can_write: true,
        media_types: ['application/taxii+json;version=2.1']
      },
      {
        id: 'campaigns',
        title: 'Campaigns & APTs',
        description: 'Coordinated attack campaigns and APT groups',
        can_read: true,
        can_write: true,
        media_types: ['application/taxii+json;version=2.1']
      },
      {
        id: 'attack-patterns',
        title: 'MITRE ATT&CK Patterns',
        description: 'Attack patterns and techniques (MITRE ATT&CK framework)',
        can_read: true,
        can_write: false,  // Read-only (source MITRE officielle)
        media_types: ['application/taxii+json;version=2.1']
      }
    ];

    logger.info(`TAXII collections requested for tenant ${tenantId}`);

    return { collections };
  }

  /**
   * Get Collection by ID
   * GET /taxii/collections/{id}/
   */
  static async getCollection(tenantId: string, collectionId: string): Promise<TAXIICollection | null> {
    const collections = await this.getCollections(tenantId);
    const collection = collections.collections.find(c => c.id === collectionId);

    if (!collection) {
      logger.warn(`Collection not found: ${collectionId}`);
      return null;
    }

    return collection;
  }

  /**
   * Get Objects from Collection
   * GET /taxii/collections/{id}/objects/
   */
  static async getObjects(
    tenantId: string,
    collectionId: string,
    params?: {
      added_after?: string;
      limit?: number;
      next?: string;
      match?: {
        id?: string[];
        type?: string[];
        version?: string;
      };
    }
  ): Promise<TAXIIEnvelope> {
    try {
      logger.info(`TAXII get objects: collection=${collectionId}, tenant=${tenantId}`, params);

      let objects: any[] = [];

      switch (collectionId) {
        case 'indicators':
          objects = await this.getIndicators(tenantId, params);
          break;
        
        case 'threats':
          objects = await this.getThreats(tenantId, params);
          break;
        
        case 'campaigns':
          objects = await this.getCampaigns(tenantId, params);
          break;
        
        case 'attack-patterns':
          objects = await this.getAttackPatterns(tenantId, params);
          break;
        
        default:
          logger.warn(`Unknown collection: ${collectionId}`);
          return { more: false, objects: [] };
      }

      // Pagination
      const limit = params?.limit || 100;
      const more = objects.length > limit;
      const returnObjects = objects.slice(0, limit);

      return {
        more,
        objects: returnObjects
      };
    } catch (error) {
      logger.error('Erreur TAXII get objects:', error);
      throw error;
    }
  }

  /**
   * Add Objects to Collection
   * POST /taxii/collections/{id}/objects/
   */
  static async addObjects(
    tenantId: string,
    collectionId: string,
    envelope: TAXIIEnvelope
  ): Promise<{
    id: string;
    status: string;
    success_count: number;
    failure_count: number;
    pending_count: number;
  }> {
    try {
      logger.info(`TAXII add objects: collection=${collectionId}, count=${envelope.objects.length}`);

      const statusId = uuidv4();
      let successCount = 0;
      let failureCount = 0;

      // Créer bundle STIX depuis objects
      const bundle: any = {
        type: 'bundle',
        id: `bundle--${uuidv4()}`,
        objects: envelope.objects
      };

      // Importer via STIX Parser
      const result = await STIXParserService.importBundle(tenantId, bundle);
      
      successCount = result.imported;
      failureCount = result.errors;

      // Enregistrer status pour suivi
      await this.recordStatus(tenantId, statusId, {
        collectionId,
        totalCount: envelope.objects.length,
        successCount,
        failureCount
      });

      return {
        id: statusId,
        status: 'complete',
        success_count: successCount,
        failure_count: failureCount,
        pending_count: 0
      };
    } catch (error) {
      logger.error('Erreur TAXII add objects:', error);
      throw error;
    }
  }

  /**
   * Get Status
   * GET /taxii/status/{id}/
   */
  static async getStatus(tenantId: string, statusId: string): Promise<any> {
    // Récupérer depuis cache ou DB
    // Pour simplification, retourner completed
    return {
      id: statusId,
      status: 'complete',
      request_timestamp: new Date().toISOString(),
      total_count: 0,
      success_count: 0,
      failure_count: 0,
      pending_count: 0
    };
  }

  // ========== Méthodes Privées ==========

  /**
   * Récupérer indicators (IOCs) en format STIX
   */
  private static async getIndicators(
    tenantId: string,
    params?: any
  ): Promise<any[]> {
    const iocs = await prisma.iOCHistory.findMany({
      where: {
        tenantId,
        observedAt: params?.added_after ? {
          gte: new Date(params.added_after)
        } : undefined
      },
      orderBy: { observedAt: 'desc' },
      take: (params?.limit || 100) + 1  // +1 pour détecter "more"
    });

    // Convertir IOCs → STIX Indicators
    return iocs.map(ioc => this.iocToSTIXIndicator(ioc));
  }

  /**
   * Convertir IOC → STIX Indicator (format TAXII)
   */
  private static iocToSTIXIndicator(ioc: any): any {
    const pattern = this.createSTIXPattern(ioc.iocValue, ioc.iocType);
    const now = new Date().toISOString();

    return {
      type: 'indicator',
      spec_version: '2.1',
      id: `indicator--${uuidv4()}`,
      created: ioc.createdAt?.toISOString() || now,
      modified: ioc.observedAt?.toISOString() || now,
      name: `${ioc.iocType}: ${ioc.iocValue}`,
      description: `IOC from AntStrike CTI`,
      indicator_types: ['malicious-activity'],
      pattern: pattern,
      pattern_type: 'stix',
      pattern_version: '2.1',
      valid_from: ioc.observedAt?.toISOString() || now,
      labels: this.generateLabels(ioc),
      confidence: this.calculateConfidence(ioc),
      external_references: [
        {
          source_name: 'AntStrike CTI',
          external_id: ioc.id,
          url: `${process.env.FRONTEND_URL}/iocs/${ioc.id}`
        }
      ]
    };
  }

  /**
   * Créer STIX pattern
   */
  private static createSTIXPattern(value: string, type: string): string {
    const typeMap: Record<string, string> = {
      'IP': `[ipv4-addr:value = '${value}']`,
      'DOMAIN': `[domain-name:value = '${value}']`,
      'URL': `[url:value = '${value}']`,
      'FILE_HASH': this.createHashPattern(value),
      'EMAIL': `[email-addr:value = '${value}']`,
      'CVE': `[vulnerability:name = '${value}']`
    };

    return typeMap[type] || `[x-custom:value = '${value}']`;
  }

  /**
   * Pattern pour hash
   */
  private static createHashPattern(hash: string): string {
    const length = hash.length;
    if (length === 32) return `[file:hashes.MD5 = '${hash}']`;
    if (length === 40) return `[file:hashes.'SHA-1' = '${hash}']`;
    if (length === 64) return `[file:hashes.'SHA-256' = '${hash}']`;
    return `[file:hashes.'SHA-256' = '${hash}']`;
  }

  /**
   * Générer labels STIX
   */
  private static generateLabels(ioc: any): string[] {
    const labels: string[] = ['anomalous-activity'];
    const enrichData = ioc.enrichmentData;

    if (enrichData?.ipData?.reputation === 'malicious') labels.push('malicious-activity');
    if (enrichData?.fileData?.malicious) labels.push('malware');
    if (enrichData?.domainData?.phishingDetected) labels.push('phishing');

    return labels;
  }

  /**
   * Calculer confidence
   */
  private static calculateConfidence(ioc: any): number {
    const enrichData = ioc.enrichmentData;
    let confidence = 50;

    const sources = enrichData?.ipData?.sources || enrichData?.fileData?.sources || [];
    confidence += sources.length * 10;

    if (enrichData?.fileData?.detections > 10) confidence += 20;
    if (enrichData?.ipData?.totalReports > 50) confidence += 15;

    return Math.min(confidence, 100);
  }

  /**
   * Récupérer threats
   */
  private static async getThreats(tenantId: string, params?: any): Promise<any[]> {
    // À implémenter quand Threat model sera plus complet
    return [];
  }

  /**
   * Récupérer campaigns
   */
  private static async getCampaigns(tenantId: string, params?: any): Promise<any[]> {
    const campaigns = await prisma.threatCorrelation.findMany({
      where: { tenantId },
      take: params?.limit || 100
    });

    return campaigns.map(c => ({
      type: 'campaign',
      spec_version: '2.1',
      id: `campaign--${uuidv4()}`,
      created: c.createdAt.toISOString(),
      modified: c.createdAt.toISOString(),
      name: `Correlation-${c.id}`,
      description: `Threat correlation with confidence ${c.confidenceScore}`,
      first_seen: c.createdAt.toISOString(),
      last_seen: c.createdAt.toISOString(),
      confidence: Math.round(c.confidenceScore * 100)
    }));
  }

  /**
   * Récupérer attack patterns (MITRE ATT&CK)
   */
  private static async getAttackPatterns(tenantId: string, params?: any): Promise<any[]> {
    // À implémenter quand MITRE DB sera chargée
    return [];
  }

  /**
   * Enregistrer status pour suivi
   */
  private static async recordStatus(
    tenantId: string,
    statusId: string,
    data: any
  ): Promise<void> {
    // Sauvegarder dans cache ou DB pour récupération ultérieure
    // Pour simplification, on log juste
    logger.info(`TAXII status recorded: ${statusId}`, data);
  }

  /**
   * Vérifier permissions collection
   */
  static async checkCollectionPermissions(
    tenantId: string,
    collectionId: string,
    action: 'read' | 'write'
  ): Promise<boolean> {
    const collection = await this.getCollection(tenantId, collectionId);
    
    if (!collection) return false;

    if (action === 'read') return collection.can_read;
    if (action === 'write') return collection.can_write;

    return false;
  }

  /**
   * Statistiques TAXII
   */
  static async getStats(tenantId: string): Promise<any> {
    const collections = await this.getCollections(tenantId);
    
    const stats = {
      collections: collections.collections.length,
      indicators: await prisma.iOCHistory.count({ where: { tenantId } }),
      threats: 0,  // À implémenter
      campaigns: await prisma.threatCorrelation.count({ where: { tenantId } }),
      lastSync: new Date().toISOString()
    };

    return stats;
  }
}




