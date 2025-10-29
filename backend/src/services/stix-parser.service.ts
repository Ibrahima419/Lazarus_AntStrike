/**
 * 📦 STIX 2.1 Parser Service
 * Parse et convertit STIX bundles
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { IOCEnrichmentService } from './ioc-enrichment.service';

interface STIXBundle {
  type: 'bundle';
  id: string;
  objects: STIXObject[];
}

interface STIXObject {
  type: string;
  id: string;
  created?: string;
  modified?: string;
  [key: string]: any;
}

interface ParsedSTIX {
  indicators: any[];
  threats: any[];
  campaigns: any[];
  attackPatterns: any[];
  relationships: any[];
  total: number;
}

export class STIXParserService {
  /**
   * Parser un STIX Bundle complet
   */
  static async parseBundle(bundle: STIXBundle): Promise<ParsedSTIX> {
    try {
      logger.info(`Parsing STIX bundle: ${bundle.id}`);

      const result: ParsedSTIX = {
        indicators: [],
        threats: [],
        campaigns: [],
        attackPatterns: [],
        relationships: [],
        total: 0
      };

      // Parser chaque objet selon son type
      for (const obj of bundle.objects) {
        switch (obj.type) {
          case 'indicator':
            result.indicators.push(this.parseIndicator(obj));
            break;
          
          case 'malware':
          case 'threat-actor':
          case 'intrusion-set':
            result.threats.push(this.parseThreat(obj));
            break;
          
          case 'campaign':
            result.campaigns.push(this.parseCampaign(obj));
            break;
          
          case 'attack-pattern':
            result.attackPatterns.push(this.parseAttackPattern(obj));
            break;
          
          case 'relationship':
            result.relationships.push(this.parseRelationship(obj));
            break;
          
          default:
            logger.debug(`Skipping unsupported STIX type: ${obj.type}`);
        }
      }

      result.total = bundle.objects.length;
      
      logger.info(`STIX bundle parsed: ${result.total} objects`, {
        indicators: result.indicators.length,
        threats: result.threats.length,
        campaigns: result.campaigns.length
      });

      return result;
    } catch (error) {
      logger.error('Erreur parsing STIX bundle:', error);
      throw error;
    }
  }

  /**
   * Parser STIX Indicator → IOC AntStrike
   */
  private static parseIndicator(indicator: any): any {
    try {
      // Extraire pattern (ex: "[ipv4-addr:value = '1.2.3.4']")
      const pattern = indicator.pattern;
      const ioc = this.extractIOCFromPattern(pattern);

      return {
        stixId: indicator.id,
        iocValue: ioc.value,
        iocType: ioc.type,
        name: indicator.name,
        description: indicator.description,
        confidence: this.mapConfidence(indicator.confidence),
        validFrom: indicator.valid_from,
        validUntil: indicator.valid_until,
        labels: indicator.labels || [],
        killChainPhases: indicator.kill_chain_phases || [],
        externalReferences: indicator.external_references || []
      };
    } catch (error) {
      logger.warn(`Failed to parse indicator ${indicator.id}:`, error);
      return null;
    }
  }

  /**
   * Extraire IOC depuis STIX pattern
   */
  private static extractIOCFromPattern(pattern: string): { value: string; type: string } {
    // Patterns STIX 2.1:
    // [ipv4-addr:value = '1.2.3.4']
    // [domain-name:value = 'evil.com']
    // [url:value = 'http://evil.com/malware']
    // [file:hashes.MD5 = 'abc123...']

    const ipMatch = pattern.match(/ipv4-addr:value\s*=\s*'([^']+)'/);
    if (ipMatch) return { value: ipMatch[1], type: 'IP' };

    const domainMatch = pattern.match(/domain-name:value\s*=\s*'([^']+)'/);
    if (domainMatch) return { value: domainMatch[1], type: 'DOMAIN' };

    const urlMatch = pattern.match(/url:value\s*=\s*'([^']+)'/);
    if (urlMatch) return { value: urlMatch[1], type: 'URL' };

    const hashMatch = pattern.match(/file:hashes\.(MD5|SHA-1|SHA-256)\s*=\s*'([^']+)'/);
    if (hashMatch) return { value: hashMatch[2], type: 'FILE_HASH' };

    const emailMatch = pattern.match(/email-addr:value\s*=\s*'([^']+)'/);
    if (emailMatch) return { value: emailMatch[1], type: 'EMAIL' };

    throw new Error(`Cannot extract IOC from pattern: ${pattern}`);
  }

  /**
   * Mapper confidence STIX → AntStrike (0-100)
   */
  private static mapConfidence(stixConfidence?: number): number {
    if (!stixConfidence) return 50;
    return Math.round(stixConfidence);
  }

  /**
   * Parser Threat (malware, threat-actor, intrusion-set)
   */
  private static parseThreat(threat: any): any {
    return {
      stixId: threat.id,
      type: threat.type,
      name: threat.name,
      description: threat.description,
      aliases: threat.aliases || [],
      firstSeen: threat.first_seen,
      lastSeen: threat.last_seen,
      goals: threat.goals || [],
      sophistication: threat.sophistication,
      resourceLevel: threat.resource_level,
      primaryMotivation: threat.primary_motivation,
      labels: threat.labels || []
    };
  }

  /**
   * Parser Campaign
   */
  private static parseCampaign(campaign: any): any {
    return {
      stixId: campaign.id,
      name: campaign.name,
      description: campaign.description,
      aliases: campaign.aliases || [],
      firstSeen: campaign.first_seen,
      lastSeen: campaign.last_seen,
      objective: campaign.objective,
      labels: campaign.labels || []
    };
  }

  /**
   * Parser Attack Pattern (MITRE ATT&CK)
   */
  private static parseAttackPattern(pattern: any): any {
    // Extraire MITRE ID
    const mitreRef = pattern.external_references?.find(
      (ref: any) => ref.source_name === 'mitre-attack'
    );

    return {
      stixId: pattern.id,
      mitreId: mitreRef?.external_id,
      name: pattern.name,
      description: pattern.description,
      killChainPhases: pattern.kill_chain_phases || [],
      platforms: pattern.x_mitre_platforms || [],
      labels: pattern.labels || []
    };
  }

  /**
   * Parser Relationship
   */
  private static parseRelationship(rel: any): any {
    return {
      stixId: rel.id,
      sourceRef: rel.source_ref,
      targetRef: rel.target_ref,
      relationshipType: rel.relationship_type,
      description: rel.description
    };
  }

  /**
   * Importer STIX bundle dans la DB
   */
  static async importBundle(tenantId: string, bundle: STIXBundle): Promise<{
    imported: number;
    skipped: number;
    errors: number;
  }> {
    const stats = { imported: 0, skipped: 0, errors: 0 };

    try {
      const parsed = await this.parseBundle(bundle);

      // Importer indicators (IOCs)
      for (const indicator of parsed.indicators) {
        if (!indicator) {
          stats.skipped++;
          continue;
        }

        try {
          // Vérifier si existe déjà
          const existing = await prisma.iOCHistory.findFirst({
            where: {
              tenantId,
              iocValue: indicator.iocValue,
              iocType: indicator.iocType
            }
          });

          if (existing) {
            stats.skipped++;
            continue;
          }

          // Enrichir l'IOC
          await IOCEnrichmentService.enrichIOC(tenantId, {
            iocValue: indicator.iocValue,
            iocType: indicator.iocType,
            source: `STIX: ${indicator.name || 'Unknown'}`
          });

          stats.imported++;
        } catch (error) {
          logger.warn(`Failed to import indicator ${indicator.iocValue}:`, error);
          stats.errors++;
        }
      }

      logger.info(`STIX import completed for tenant ${tenantId}`, stats);

      return stats;
    } catch (error) {
      logger.error('Erreur import STIX bundle:', error);
      throw error;
    }
  }

  /**
   * Exporter données AntStrike → STIX Bundle
   */
  static async exportToSTIX(
    tenantId: string,
    filters?: {
      iocTypes?: string[];
      severity?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<STIXBundle> {
    try {
      // Récupérer IOCs enrichis
      const iocs = await prisma.iOCHistory.findMany({
        where: {
          tenantId,
          iocType: filters?.iocTypes ? { in: filters.iocTypes } : undefined,
          observedAt: {
            gte: filters?.dateFrom,
            lte: filters?.dateTo
          }
        },
        take: 1000  // Max 1000 pour performance
      });

      // Convertir chaque IOC en STIX Indicator
      const indicators = iocs.map(ioc => this.iocToSTIXIndicator(ioc));

      // Créer bundle
      const bundle: STIXBundle = {
        type: 'bundle',
        id: `bundle--${uuidv4()}`,
        objects: indicators
      };

      logger.info(`STIX bundle exported: ${indicators.length} indicators`);

      return bundle;
    } catch (error) {
      logger.error('Erreur export STIX:', error);
      throw error;
    }
  }

  /**
   * Convertir IOC AntStrike → STIX Indicator
   */
  private static iocToSTIXIndicator(ioc: any): STIXObject {
    const pattern = this.createSTIXPattern(ioc.iocValue, ioc.iocType);
    const now = new Date().toISOString();

    return {
      type: 'indicator',
      spec_version: '2.1',
      id: `indicator--${uuidv4()}`,
      created: ioc.createdAt?.toISOString() || now,
      modified: ioc.observedAt?.toISOString() || now,
      name: `${ioc.iocType}: ${ioc.iocValue}`,
      description: `IOC enriched by AntStrike CTI`,
      pattern: pattern,
      pattern_type: 'stix',
      valid_from: ioc.observedAt?.toISOString() || now,
      labels: this.generateLabels(ioc),
      confidence: this.calculateConfidence(ioc),
      external_references: [
        {
          source_name: 'AntStrike CTI',
          url: `https://antstrike-cti.com/iocs/${ioc.id}`
        }
      ]
    };
  }

  /**
   * Créer STIX pattern depuis IOC
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
   * Créer pattern pour hash (détecte MD5/SHA1/SHA256)
   */
  private static createHashPattern(hash: string): string {
    const length = hash.length;
    if (length === 32) return `[file:hashes.MD5 = '${hash}']`;
    if (length === 40) return `[file:hashes.'SHA-1' = '${hash}']`;
    if (length === 64) return `[file:hashes.'SHA-256' = '${hash}']`;
    return `[file:hashes.'SHA-256' = '${hash}']`;  // Default
  }

  /**
   * Générer labels STIX depuis IOC enrichment
   */
  private static generateLabels(ioc: any): string[] {
    const labels: string[] = [];

    // Type de menace
    const enrichData = ioc.enrichmentData;
    
    if (enrichData?.ipData?.reputation === 'malicious') {
      labels.push('malicious-activity');
    }
    if (enrichData?.fileData?.malicious) {
      labels.push('malware');
    }
    if (enrichData?.domainData?.phishingDetected) {
      labels.push('phishing');
    }

    // Source
    const sources = enrichData?.ipData?.sources || enrichData?.fileData?.sources || [];
    sources.forEach((source: string) => {
      labels.push(`source:${source.toLowerCase()}`);
    });

    return labels.length > 0 ? labels : ['anomalous-activity'];
  }

  /**
   * Calculer confidence STIX (0-100)
   */
  private static calculateConfidence(ioc: any): number {
    const enrichData = ioc.enrichmentData;
    let confidence = 50;  // Base

    // Sources multiples = plus de confidence
    const sources = enrichData?.ipData?.sources || enrichData?.fileData?.sources || [];
    confidence += sources.length * 10;

    // Détections multiples
    if (enrichData?.fileData?.detections > 10) {
      confidence += 20;
    }

    // Reports multiples
    if (enrichData?.ipData?.totalReports > 50) {
      confidence += 15;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Valider STIX bundle
   */
  static validateBundle(bundle: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Vérifier structure de base
    if (bundle.type !== 'bundle') {
      errors.push('Type must be "bundle"');
    }

    if (!bundle.id || !bundle.id.startsWith('bundle--')) {
      errors.push('Invalid bundle ID format');
    }

    if (!Array.isArray(bundle.objects)) {
      errors.push('Objects must be an array');
    }

    // Vérifier chaque objet
    bundle.objects?.forEach((obj: any, index: number) => {
      if (!obj.type) {
        errors.push(`Object ${index}: missing type`);
      }
      if (!obj.id) {
        errors.push(`Object ${index}: missing id`);
      }
      if (obj.spec_version && obj.spec_version !== '2.1' && obj.spec_version !== '2.0') {
        errors.push(`Object ${index}: unsupported spec_version ${obj.spec_version}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convertir IOCs multiples en STIX Bundle
   */
  static async createBundleFromIOCs(
    tenantId: string,
    iocIds: string[]
  ): Promise<STIXBundle> {
    const iocs = await prisma.iOCHistory.findMany({
      where: {
        tenantId,
        id: { in: iocIds }
      }
    });

    const indicators = iocs.map(ioc => this.iocToSTIXIndicator(ioc));

    return {
      type: 'bundle',
      id: `bundle--${uuidv4()}`,
      objects: indicators
    };
  }

  /**
   * Parser et importer fichier STIX
   */
  static async importSTIXFile(
    tenantId: string,
    fileContent: string
  ): Promise<{ imported: number; skipped: number; errors: number }> {
    try {
      // Parser JSON
      const bundle = JSON.parse(fileContent) as STIXBundle;

      // Valider
      const validation = this.validateBundle(bundle);
      if (!validation.valid) {
        throw new Error(`Invalid STIX bundle: ${validation.errors.join(', ')}`);
      }

      // Importer
      return await this.importBundle(tenantId, bundle);
    } catch (error) {
      logger.error('Erreur import fichier STIX:', error);
      throw error;
    }
  }
}

