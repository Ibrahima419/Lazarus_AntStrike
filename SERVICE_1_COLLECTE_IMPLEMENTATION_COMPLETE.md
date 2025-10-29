# 📡 SERVICE 1 : COLLECTE & AGRÉGATION - Implémentation Complète

**Objectif :** Rendre le service de collecte 100% opérationnel  
**Score Actuel :** 50%  
**Score Cible :** 95%  
**Durée :** 3 semaines  
**Date :** 20 Octobre 2025

---

## 🎯 VUE D'ENSEMBLE DU SERVICE 1

```
┌────────────────────────────────────────────────────────┐
│         SERVICE 1: COLLECTE & AGRÉGATION               │
│                                                        │
│  Mission: Collecter threat intelligence depuis         │
│           sources multiples et normaliser les données  │
│                                                        │
│  Sources:                                              │
│  ├─ 📦 STIX/TAXII (Standards CTI)                     │
│  ├─ 🔄 MISP (Threat Sharing Platform)                 │
│  ├─ 🔐 CVE (Vulnerabilities)                          │
│  ├─ 📰 OSINT Feeds (Open Source Intel)                │
│  ├─ 🕵️ Dark Web (Forums, Marketplaces)                │
│  ├─ 🍯 Honeypots (Attack Data)                        │
│  └─ 🌐 Threat Feeds (AlienVault OTX, etc.)            │
│                                                        │
│  Output: Données normalisées → Database + Queue       │
└────────────────────────────────────────────────────────┘
```

---

## 📊 ÉTAT DES LIEUX DÉTAILLÉ

### Composants Existants

| Composant | Fichier | État | Score | Priorité |
|-----------|---------|------|-------|----------|
| **STIX Parser** | `stix-parser.service.ts` | 🟡 Partiel | 60% | 🔴 HAUTE |
| **TAXII Server** | `taxii-server.service.ts` | 🟡 Partiel | 60% | 🔴 HAUTE |
| **MISP Client** | `misp-client.service.ts` | 🟡 Partiel | 50% | 🔴 HAUTE |
| **CVE Enrichment** | `cve-enrichment.service.ts` | 🟢 Bon | 75% | 🟡 MOYENNE |
| **OSINT Feeds** | `osint-feeds.service.ts` | 🔴 Basique | 40% | 🔴 HAUTE |
| **Dark Web** | `darkweb-monitoring.service.ts` | 🔴 Stub | 20% | 🔴 HAUTE |
| **Honeypots** | `honeypot-collector.service.ts` | 🔴 Stub | 30% | 🟡 MOYENNE |
| **Threat Feeds** | `threat-feeds.service.ts` | 🟡 Partiel | 50% | 🟡 MOYENNE |

---

## 🗓️ PLAN D'IMPLÉMENTATION - 3 SEMAINES

### **SEMAINE 1 : STIX/TAXII + MISP**

#### Sprint 1.1 - STIX 2.1 Parser (Jours 1-3)

**Objectif :** Parser complet des objets STIX 2.1

```typescript
// backend/src/services/stix-parser.service.ts

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * STIX 2.1 Parser Service
 * Supports all STIX Domain Objects (SDO) and Relationships
 */
export class STIXParserService {
  /**
   * Parse STIX Bundle
   */
  static async parseBundle(bundle: any, tenantId: string): Promise<any> {
    logger.info('Parsing STIX bundle', {
      bundleId: bundle.id,
      objectCount: bundle.objects?.length || 0,
      tenantId
    });

    // Validate bundle
    if (bundle.type !== 'bundle') {
      throw new Error('Invalid STIX bundle: type must be "bundle"');
    }

    if (!bundle.objects || !Array.isArray(bundle.objects)) {
      throw new Error('Invalid STIX bundle: missing objects array');
    }

    // Store bundle
    const storedBundle = await prisma.sTIXBundle.create({
      data: {
        tenantId,
        bundleId: bundle.id,
        type: bundle.type,
        specVersion: bundle.spec_version || '2.1',
        objects: bundle.objects
      }
    });

    // Parse each object
    const results = {
      total: bundle.objects.length,
      parsed: 0,
      threats: [],
      indicators: [],
      campaigns: [],
      threatActors: [],
      errors: []
    };

    for (const obj of bundle.objects) {
      try {
        const parsed = await this.parseObject(obj, tenantId);
        if (parsed) {
          results.parsed++;
          
          // Categorize by type
          switch (obj.type) {
            case 'indicator':
              results.indicators.push(parsed);
              break;
            case 'malware':
            case 'attack-pattern':
              results.threats.push(parsed);
              break;
            case 'campaign':
              results.campaigns.push(parsed);
              break;
            case 'threat-actor':
              results.threatActors.push(parsed);
              break;
          }
        }
      } catch (error) {
        logger.error('Failed to parse STIX object', {
          objectId: obj.id,
          error: error.message
        });
        results.errors.push({
          objectId: obj.id,
          error: error.message
        });
      }
    }

    logger.info('STIX bundle parsed', {
      bundleId: bundle.id,
      results
    });

    return {
      bundleId: storedBundle.id,
      results
    };
  }

  /**
   * Parse individual STIX object
   */
  static async parseObject(obj: any, tenantId: string): Promise<any> {
    switch (obj.type) {
      case 'indicator':
        return await this.parseIndicator(obj, tenantId);
      
      case 'malware':
        return await this.parseMalware(obj, tenantId);
      
      case 'threat-actor':
        return await this.parseThreatActor(obj, tenantId);
      
      case 'campaign':
        return await this.parseCampaign(obj, tenantId);
      
      case 'attack-pattern':
        return await this.parseAttackPattern(obj, tenantId);
      
      case 'vulnerability':
        return await this.parseVulnerability(obj, tenantId);
      
      case 'relationship':
        return await this.parseRelationship(obj, tenantId);
      
      default:
        logger.warn('Unsupported STIX object type', { type: obj.type });
        return null;
    }
  }

  /**
   * Parse STIX Indicator → Threat
   */
  private static async parseIndicator(indicator: any, tenantId: string): Promise<any> {
    // Extract IOCs from pattern
    const iocs = this.extractIOCsFromPattern(indicator.pattern);

    // Map confidence (0-100 scale)
    const confidence = indicator.confidence || 50;

    // Determine severity from labels
    const severity = this.determineSeverity(indicator.labels);

    const threat = await prisma.threat.create({
      data: {
        tenantId,
        name: indicator.name || 'Unnamed Indicator',
        type: indicator.indicator_types?.[0] || 'unknown',
        severity,
        confidence,
        status: 'new',
        description: indicator.description || null,
        iocs: iocs,
        mitreTactics: [],
        tags: indicator.labels || [],
        source: 'STIX',
        firstSeen: indicator.valid_from ? new Date(indicator.valid_from) : new Date(),
        lastSeen: indicator.valid_until ? new Date(indicator.valid_until) : new Date()
      }
    });

    logger.info('Parsed STIX indicator', {
      indicatorId: indicator.id,
      threatId: threat.id,
      iocsCount: iocs.length
    });

    return threat;
  }

  /**
   * Parse STIX Malware → Threat
   */
  private static async parseMalware(malware: any, tenantId: string): Promise<any> {
    const threat = await prisma.threat.create({
      data: {
        tenantId,
        name: malware.name || 'Unnamed Malware',
        type: 'malware',
        severity: this.determineSeverity(malware.labels),
        confidence: 70,
        status: 'new',
        description: malware.description || null,
        iocs: [],
        mitreTactics: [],
        tags: malware.labels || [],
        source: 'STIX'
      }
    });

    return threat;
  }

  /**
   * Parse STIX Threat Actor → ThreatActor
   */
  private static async parseThreatActor(actor: any, tenantId: string): Promise<any> {
    const threatActor = await prisma.threatActor.create({
      data: {
        tenantId,
        name: actor.name,
        aliases: actor.aliases || [],
        type: actor.threat_actor_types?.[0] || 'unknown',
        sophistication: actor.sophistication || 'unknown',
        description: actor.description || null,
        tags: actor.labels || []
      }
    });

    return threatActor;
  }

  /**
   * Parse STIX Campaign → Campaign
   */
  private static async parseCampaign(campaign: any, tenantId: string): Promise<any> {
    const campaignObj = await prisma.campaign.create({
      data: {
        tenantId,
        name: campaign.name,
        description: campaign.description || null,
        firstSeen: campaign.first_seen ? new Date(campaign.first_seen) : new Date(),
        lastSeen: campaign.last_seen ? new Date(campaign.last_seen) : new Date(),
        status: 'active',
        tags: campaign.labels || []
      }
    });

    return campaignObj;
  }

  /**
   * Parse STIX Attack Pattern → TTP
   */
  private static async parseAttackPattern(pattern: any, tenantId: string): Promise<any> {
    // Extract MITRE ATT&CK ID from external references
    const mitreRef = pattern.external_references?.find(
      (ref: any) => ref.source_name === 'mitre-attack'
    );

    if (mitreRef) {
      const ttp = await prisma.tTP.create({
        data: {
          tenantId,
          tactic: this.extractTacticFromKillChain(pattern.kill_chain_phases),
          tacticId: this.extractTacticIdFromKillChain(pattern.kill_chain_phases),
          technique: pattern.name,
          techniqueId: mitreRef.external_id,
          confidence: 80,
          sourceType: 'stix'
        }
      });

      return ttp;
    }

    return null;
  }

  /**
   * Parse STIX Vulnerability → CVE
   */
  private static async parseVulnerability(vuln: any, tenantId: string): Promise<any> {
    const cveId = vuln.external_references?.find(
      (ref: any) => ref.source_name === 'cve'
    )?.external_id;

    if (!cveId) {
      return null;
    }

    const cve = await prisma.cVEVulnerability.create({
      data: {
        tenantId,
        cveId,
        description: vuln.description || null
      }
    });

    return cve;
  }

  /**
   * Parse STIX Relationship
   */
  private static async parseRelationship(rel: any, tenantId: string): Promise<any> {
    // TODO: Create relationships between objects
    // This requires tracking object IDs and creating links in database
    logger.info('Parsed STIX relationship', {
      source: rel.source_ref,
      target: rel.target_ref,
      type: rel.relationship_type
    });

    return rel;
  }

  /**
   * Extract IOCs from STIX pattern
   * Example: "[ipv4-addr:value = '1.2.3.4']"
   */
  private static extractIOCsFromPattern(pattern: string): any[] {
    if (!pattern) return [];

    const iocs: any[] = [];

    // IPv4
    const ipv4Regex = /ipv4-addr:value\s*=\s*'([^']+)'/g;
    let match;
    while ((match = ipv4Regex.exec(pattern)) !== null) {
      iocs.push({ type: 'IP', value: match[1] });
    }

    // Domain
    const domainRegex = /domain-name:value\s*=\s*'([^']+)'/g;
    while ((match = domainRegex.exec(pattern)) !== null) {
      iocs.push({ type: 'DOMAIN', value: match[1] });
    }

    // URL
    const urlRegex = /url:value\s*=\s*'([^']+)'/g;
    while ((match = urlRegex.exec(pattern)) !== null) {
      iocs.push({ type: 'URL', value: match[1] });
    }

    // File hash
    const hashRegex = /file:hashes\.'([^']+)'\s*=\s*'([^']+)'/g;
    while ((match = hashRegex.exec(pattern)) !== null) {
      iocs.push({ type: 'FILE_HASH', value: match[2], hashType: match[1] });
    }

    return iocs;
  }

  /**
   * Determine severity from labels
   */
  private static determineSeverity(labels: string[] = []): string {
    const labelStr = labels.join(' ').toLowerCase();

    if (labelStr.includes('critical') || labelStr.includes('high')) {
      return 'high';
    } else if (labelStr.includes('medium') || labelStr.includes('moderate')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Extract tactic from kill chain phases
   */
  private static extractTacticFromKillChain(phases: any[] = []): string {
    const mitrePhase = phases.find(
      (p: any) => p.kill_chain_name === 'mitre-attack'
    );

    return mitrePhase?.phase_name || 'unknown';
  }

  /**
   * Extract tactic ID from kill chain phases
   */
  private static extractTacticIdFromKillChain(phases: any[] = []): string {
    const mitrePhase = phases.find(
      (p: any) => p.kill_chain_name === 'mitre-attack'
    );

    // Map phase name to tactic ID
    const tacticMap: any = {
      'reconnaissance': 'TA0043',
      'resource-development': 'TA0042',
      'initial-access': 'TA0001',
      'execution': 'TA0002',
      'persistence': 'TA0003',
      'privilege-escalation': 'TA0004',
      'defense-evasion': 'TA0005',
      'credential-access': 'TA0006',
      'discovery': 'TA0007',
      'lateral-movement': 'TA0008',
      'collection': 'TA0009',
      'command-and-control': 'TA0011',
      'exfiltration': 'TA0010',
      'impact': 'TA0040'
    };

    return tacticMap[mitrePhase?.phase_name] || 'TA0000';
  }

  /**
   * Export threats to STIX bundle
   */
  static async exportToSTIX(threatIds: string[], tenantId: string): Promise<any> {
    const threats = await prisma.threat.findMany({
      where: {
        id: { in: threatIds },
        tenantId
      }
    });

    const objects = threats.map((threat) => ({
      type: 'indicator',
      spec_version: '2.1',
      id: `indicator--${threat.id}`,
      created: threat.createdAt.toISOString(),
      modified: threat.updatedAt.toISOString(),
      name: threat.name,
      description: threat.description,
      indicator_types: [threat.type],
      pattern: this.createSTIXPattern(threat.iocs),
      pattern_type: 'stix',
      valid_from: threat.firstSeen.toISOString(),
      labels: threat.tags
    }));

    const bundle = {
      type: 'bundle',
      id: `bundle--${uuidv4()}`,
      objects
    };

    return bundle;
  }

  /**
   * Create STIX pattern from IOCs
   */
  private static createSTIXPattern(iocs: any[]): string {
    if (!iocs || iocs.length === 0) {
      return "[]";
    }

    const patterns = iocs.map((ioc: any) => {
      switch (ioc.type) {
        case 'IP':
          return `[ipv4-addr:value = '${ioc.value}']`;
        case 'DOMAIN':
          return `[domain-name:value = '${ioc.value}']`;
        case 'URL':
          return `[url:value = '${ioc.value}']`;
        case 'FILE_HASH':
          return `[file:hashes.'SHA-256' = '${ioc.value}']`;
        default:
          return null;
      }
    }).filter(Boolean);

    return patterns.join(' OR ');
  }
}
```

**Tests :**

```typescript
// backend/tests/services/stix-parser.test.ts

import { STIXParserService } from '../../src/services/stix-parser.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TEST_TENANT_ID = 'test-tenant';

describe('STIXParserService', () => {
  beforeAll(async () => {
    // Clean test data
    await prisma.threat.deleteMany({ where: { tenantId: TEST_TENANT_ID } });
  });

  describe('parseBundle()', () => {
    it('should parse valid STIX 2.1 bundle', async () => {
      const bundle = {
        type: 'bundle',
        id: 'bundle--test-123',
        spec_version: '2.1',
        objects: [
          {
            type: 'indicator',
            id: 'indicator--test-456',
            spec_version: '2.1',
            created: '2025-01-01T00:00:00.000Z',
            modified: '2025-01-01T00:00:00.000Z',
            name: 'Malicious IP',
            indicator_types: ['malicious-activity'],
            pattern: "[ipv4-addr:value = '1.2.3.4']",
            pattern_type: 'stix',
            valid_from: '2025-01-01T00:00:00.000Z',
            labels: ['malware', 'high']
          }
        ]
      };

      const result = await STIXParserService.parseBundle(bundle, TEST_TENANT_ID);

      expect(result).toHaveProperty('bundleId');
      expect(result.results.total).toBe(1);
      expect(result.results.parsed).toBe(1);
      expect(result.results.indicators).toHaveLength(1);
    });

    it('should extract IOCs from pattern', async () => {
      const bundle = {
        type: 'bundle',
        id: 'bundle--test-789',
        objects: [
          {
            type: 'indicator',
            id: 'indicator--test-789',
            name: 'Multiple IOCs',
            pattern: "[ipv4-addr:value = '8.8.8.8'] OR [domain-name:value = 'evil.com']",
            pattern_type: 'stix',
            valid_from: '2025-01-01T00:00:00.000Z'
          }
        ]
      };

      const result = await STIXParserService.parseBundle(bundle, TEST_TENANT_ID);
      const threat = result.results.indicators[0];

      expect(threat.iocs).toHaveLength(2);
      expect(threat.iocs[0]).toMatchObject({ type: 'IP', value: '8.8.8.8' });
      expect(threat.iocs[1]).toMatchObject({ type: 'DOMAIN', value: 'evil.com' });
    });
  });

  describe('exportToSTIX()', () => {
    it('should export threats to STIX bundle', async () => {
      // Create test threat
      const threat = await prisma.threat.create({
        data: {
          tenantId: TEST_TENANT_ID,
          name: 'Test Threat',
          type: 'malware',
          severity: 'high',
          iocs: [{ type: 'IP', value: '1.1.1.1' }],
          tags: ['test']
        }
      });

      const bundle = await STIXParserService.exportToSTIX([threat.id], TEST_TENANT_ID);

      expect(bundle.type).toBe('bundle');
      expect(bundle.objects).toHaveLength(1);
      expect(bundle.objects[0].type).toBe('indicator');
      expect(bundle.objects[0].name).toBe('Test Threat');
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
```

**Endpoints :**

```typescript
// backend/src/controllers/stix.controller.ts

import { Request, Response } from 'express';
import { STIXParserService } from '../services/stix-parser.service';

export class STIXController {
  /**
   * Import STIX bundle
   * POST /api/stix/import
   */
  static async importBundle(req: Request, res: Response) {
    try {
      const { bundle } = req.body;
      const { tenantId } = req.user;

      const result = await STIXParserService.parseBundle(bundle, tenantId);

      res.json({
        success: true,
        message: `Parsed ${result.results.parsed}/${result.results.total} objects`,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Export threats to STIX
   * POST /api/stix/export
   */
  static async exportBundle(req: Request, res: Response) {
    try {
      const { threatIds } = req.body;
      const { tenantId } = req.user;

      const bundle = await STIXParserService.exportToSTIX(threatIds, tenantId);

      res.json({
        success: true,
        data: bundle
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
```

**Temps estimé :** 24 heures (3 jours)

---

#### Sprint 1.2 - TAXII 2.1 Server (Jours 4-5)

**Objectif :** Serveur TAXII 2.1 complet pour partage de threat intel

```typescript
// backend/src/services/taxii-server.service.ts

import { PrismaClient } from '@prisma/client';
import { STIXParserService } from './stix-parser.service';

const prisma = new PrismaClient();

/**
 * TAXII 2.1 Server Implementation
 * Spec: https://docs.oasis-open.org/cti/taxii/v2.1/taxii-v2.1.html
 */
export class TAXIIServerService {
  /**
   * Get discovery information
   * GET /taxii2/
   */
  static async getDiscovery(): Promise<any> {
    return {
      title: 'AntStrike CTI TAXII Server',
      description: 'TAXII 2.1 API for threat intelligence sharing',
      contact: 'support@antstrike.com',
      default: '/taxii2/api1/',
      api_roots: [
        '/taxii2/api1/'
      ]
    };
  }

  /**
   * Get API root information
   * GET /taxii2/:apiRoot/
   */
  static async getApiRoot(apiRoot: string): Promise<any> {
    return {
      title: 'AntStrike CTI API Root',
      description: 'Main API root for threat intelligence',
      versions: ['application/taxii+json;version=2.1'],
      max_content_length: 10485760 // 10MB
    };
  }

  /**
   * List collections
   * GET /taxii2/:apiRoot/collections/
   */
  static async listCollections(tenantId: string): Promise<any> {
    const collections = await prisma.tAXIICollection.findMany({
      where: { tenantId }
    });

    return {
      collections: collections.map((col) => ({
        id: col.collectionId,
        title: col.title,
        description: col.description,
        can_read: col.canRead,
        can_write: col.canWrite,
        media_types: col.mediaTypes
      }))
    };
  }

  /**
   * Get collection by ID
   * GET /taxii2/:apiRoot/collections/:collectionId/
   */
  static async getCollection(
    collectionId: string,
    tenantId: string
  ): Promise<any> {
    const collection = await prisma.tAXIICollection.findFirst({
      where: {
        collectionId,
        tenantId
      }
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    return {
      id: collection.collectionId,
      title: collection.title,
      description: collection.description,
      can_read: collection.canRead,
      can_write: collection.canWrite,
      media_types: collection.mediaTypes
    };
  }

  /**
   * Get objects from collection
   * GET /taxii2/:apiRoot/collections/:collectionId/objects/
   */
  static async getObjects(
    collectionId: string,
    tenantId: string,
    params: {
      limit?: number;
      addedAfter?: string;
      type?: string;
    } = {}
  ): Promise<any> {
    const { limit = 100, addedAfter, type } = params;

    // Get threats matching criteria
    const where: any = { tenantId };

    if (addedAfter) {
      where.createdAt = { gte: new Date(addedAfter) };
    }

    if (type) {
      where.type = type;
    }

    const threats = await prisma.threat.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Convert to STIX bundle
    const objects = threats.map((threat) => ({
      type: 'indicator',
      spec_version: '2.1',
      id: `indicator--${threat.id}`,
      created: threat.createdAt.toISOString(),
      modified: threat.updatedAt.toISOString(),
      name: threat.name,
      description: threat.description,
      indicator_types: [threat.type],
      pattern: this.createPattern(threat.iocs),
      pattern_type: 'stix',
      valid_from: threat.firstSeen.toISOString(),
      labels: threat.tags
    }));

    return {
      type: 'bundle',
      id: `bundle--${Date.now()}`,
      objects
    };
  }

  /**
   * Add objects to collection
   * POST /taxii2/:apiRoot/collections/:collectionId/objects/
   */
  static async addObjects(
    collectionId: string,
    tenantId: string,
    envelope: any
  ): Promise<any> {
    // Verify collection exists and is writable
    const collection = await prisma.tAXIICollection.findFirst({
      where: { collectionId, tenantId }
    });

    if (!collection || !collection.canWrite) {
      throw new Error('Collection not writable');
    }

    // Parse objects from envelope
    const objects = envelope.objects || [];
    const results = {
      success: 0,
      failure: 0,
      pending: 0,
      successes: [] as string[],
      failures: [] as any[]
    };

    for (const obj of objects) {
      try {
        await STIXParserService.parseObject(obj, tenantId);
        results.success++;
        results.successes.push(obj.id);
      } catch (error) {
        results.failure++;
        results.failures.push({
          id: obj.id,
          message: error.message
        });
      }
    }

    return {
      id: `status--${Date.now()}`,
      status: 'complete',
      request_timestamp: new Date().toISOString(),
      total_count: objects.length,
      success_count: results.success,
      failure_count: results.failure,
      pending_count: 0,
      successes: results.successes,
      failures: results.failures
    };
  }

  /**
   * Create collection
   */
  static async createCollection(
    tenantId: string,
    data: {
      title: string;
      description?: string;
      canRead?: boolean;
      canWrite?: boolean;
    }
  ): Promise<any> {
    const collection = await prisma.tAXIICollection.create({
      data: {
        tenantId,
        collectionId: `collection--${Date.now()}`,
        title: data.title,
        description: data.description,
        canRead: data.canRead ?? true,
        canWrite: data.canWrite ?? false,
        mediaTypes: ['application/stix+json;version=2.1']
      }
    });

    return collection;
  }

  /**
   * Helper: Create STIX pattern from IOCs
   */
  private static createPattern(iocs: any[]): string {
    if (!iocs || iocs.length === 0) {
      return "[]";
    }

    const patterns = iocs.map((ioc: any) => {
      switch (ioc.type) {
        case 'IP':
          return `[ipv4-addr:value = '${ioc.value}']`;
        case 'DOMAIN':
          return `[domain-name:value = '${ioc.value}']`;
        case 'URL':
          return `[url:value = '${ioc.value}']`;
        case 'FILE_HASH':
          return `[file:hashes.'SHA-256' = '${ioc.value}']`;
        default:
          return null;
      }
    }).filter(Boolean);

    return patterns.join(' OR ');
  }
}
```

**Routes :**

```typescript
// backend/src/routes/taxii.routes.ts

import { Router } from 'express';
import { TAXIIServerService } from '../services/taxii-server.service';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Discovery
router.get('/taxii2/', async (req, res) => {
  try {
    const discovery = await TAXIIServerService.getDiscovery();
    res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
    res.json(discovery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Root
router.get('/taxii2/:apiRoot/', authenticateJWT, async (req, res) => {
  try {
    const apiRoot = await TAXIIServerService.getApiRoot(req.params.apiRoot);
    res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
    res.json(apiRoot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Collections
router.get('/taxii2/:apiRoot/collections/', authenticateJWT, async (req, res) => {
  try {
    const collections = await TAXIIServerService.listCollections(req.user.tenantId);
    res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Collection details
router.get('/taxii2/:apiRoot/collections/:collectionId/', authenticateJWT, async (req, res) => {
  try {
    const collection = await TAXIIServerService.getCollection(
      req.params.collectionId,
      req.user.tenantId
    );
    res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
    res.json(collection);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get objects
router.get('/taxii2/:apiRoot/collections/:collectionId/objects/', authenticateJWT, async (req, res) => {
  try {
    const objects = await TAXIIServerService.getObjects(
      req.params.collectionId,
      req.user.tenantId,
      {
        limit: parseInt(req.query.limit as string) || 100,
        addedAfter: req.query.added_after as string,
        type: req.query.type as string
      }
    );
    res.setHeader('Content-Type', 'application/stix+json;version=2.1');
    res.json(objects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add objects
router.post('/taxii2/:apiRoot/collections/:collectionId/objects/', authenticateJWT, async (req, res) => {
  try {
    const result = await TAXIIServerService.addObjects(
      req.params.collectionId,
      req.user.tenantId,
      req.body
    );
    res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
    res.status(202).json(result);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

export default router;
```

**Temps estimé :** 16 heures (2 jours)

---

#### Sprint 1.3 - MISP Integration (Jours 6-7)

**Objectif :** Synchronisation bidirectionnelle avec MISP

```typescript
// backend/src/services/misp-client.service.ts

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * MISP Client for bidirectional synchronization
 */
export class MISPClientService {
  private static baseURL: string = process.env.MISP_URL || 'https://misp.local';
  private static apiKey: string = process.env.MISP_API_KEY || '';

  /**
   * Test connection to MISP
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/servers/getVersion`, {
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 5000
      });

      logger.info('MISP connection successful', {
        version: response.data.version
      });

      return true;
    } catch (error) {
      logger.error('MISP connection failed', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Fetch events from MISP
   */
  static async fetchEvents(
    tenantId: string,
    params: {
      limit?: number;
      page?: number;
      published?: boolean;
      timestamp?: string;
    } = {}
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/events/restSearch`,
        {
          returnFormat: 'json',
          limit: params.limit || 100,
          page: params.page || 1,
          published: params.published ?? true,
          timestamp: params.timestamp // events modified after timestamp
        },
        {
          headers: {
            'Authorization': this.apiKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const events = response.data.response || [];

      logger.info('Fetched MISP events', {
        count: events.length,
        tenantId
      });

      // Store events in database
      for (const event of events) {
        await this.storeEvent(event.Event, tenantId);
      }

      return {
        fetched: events.length,
        stored: events.length
      };
    } catch (error) {
      logger.error('Failed to fetch MISP events', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Store MISP event in database
   */
  private static async storeEvent(event: any, tenantId: string): Promise<any> {
    // Check if event already exists
    const existing = await prisma.mISPEvent.findFirst({
      where: {
        uuid: event.uuid,
        tenantId
      }
    });

    if (existing) {
      // Update existing event
      return await prisma.mISPEvent.update({
        where: { id: existing.id },
        data: {
          info: event.info,
          date: event.date,
          threatLevel: event.threat_level_id.toString(),
          analysis: event.analysis.toString(),
          distribution: event.distribution.toString(),
          published: event.published,
          attributes: event.Attribute || [],
          tags: event.Tag?.map((t: any) => t.name) || [],
          galaxies: event.Galaxy || [],
          rawData: event,
          lastSync: new Date()
        }
      });
    } else {
      // Create new event
      return await prisma.mISPEvent.create({
        data: {
          tenantId,
          eventId: event.id.toString(),
          orgId: event.org_id?.toString(),
          orgcId: event.orgc_id?.toString(),
          info: event.info,
          date: event.date,
          threatLevel: event.threat_level_id.toString(),
          analysis: event.analysis.toString(),
          distribution: event.distribution.toString(),
          published: event.published,
          uuid: event.uuid,
          attributes: event.Attribute || [],
          tags: event.Tag?.map((t: any) => t.name) || [],
          galaxies: event.Galaxy || [],
          rawData: event
        }
      });
    }
  }

  /**
   * Push threat to MISP as event
   */
  static async pushThreat(threatId: string, tenantId: string): Promise<any> {
    const threat = await prisma.threat.findFirst({
      where: { id: threatId, tenantId }
    });

    if (!threat) {
      throw new Error('Threat not found');
    }

    // Convert threat to MISP event format
    const event = {
      info: threat.name,
      threat_level_id: this.mapSeverityToThreatLevel(threat.severity),
      analysis: 0, // Initial
      distribution: 3, // All communities
      Attribute: threat.iocs.map((ioc: any) => ({
        type: this.mapIOCTypeToMISP(ioc.type),
        category: 'Network activity',
        value: ioc.value,
        to_ids: true
      })),
      Tag: threat.tags.map((tag: string) => ({
        name: tag
      }))
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/events/add`,
        event,
        {
          headers: {
            'Authorization': this.apiKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Pushed threat to MISP', {
        threatId,
        mispEventId: response.data.Event.id
      });

      return response.data.Event;
    } catch (error) {
      logger.error('Failed to push threat to MISP', {
        threatId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Scheduled sync (cron job)
   */
  static async scheduledSync(tenantId: string): Promise<void> {
    logger.info('Starting MISP scheduled sync', { tenantId });

    try {
      // Get last sync timestamp
      const lastEvent = await prisma.mISPEvent.findFirst({
        where: { tenantId },
        orderBy: { lastSync: 'desc' }
      });

      const timestamp = lastEvent?.lastSync
        ? Math.floor(lastEvent.lastSync.getTime() / 1000).toString()
        : undefined;

      // Fetch new/updated events
      await this.fetchEvents(tenantId, {
        limit: 1000,
        timestamp
      });

      logger.info('MISP sync completed', { tenantId });
    } catch (error) {
      logger.error('MISP sync failed', {
        tenantId,
        error: error.message
      });
    }
  }

  /**
   * Map severity to MISP threat level
   */
  private static mapSeverityToThreatLevel(severity: string): number {
    const map: any = {
      'low': 3,
      'medium': 2,
      'high': 1,
      'critical': 1
    };
    return map[severity] || 4; // undefined
  }

  /**
   * Map IOC type to MISP attribute type
   */
  private static mapIOCTypeToMISP(type: string): string {
    const map: any = {
      'IP': 'ip-dst',
      'DOMAIN': 'domain',
      'URL': 'url',
      'FILE_HASH': 'sha256',
      'EMAIL': 'email-src'
    };
    return map[type] || 'other';
  }
}
```

**Scheduler (Cron Job) :**

```typescript
// backend/src/schedulers/misp-sync.scheduler.ts

import cron from 'node-cron';
import { MISPClientService } from '../services/misp-client.service';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Schedule MISP sync every 6 hours
 */
export function scheduleMISPSync() {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('MISP sync cron job triggered');

    try {
      // Get all tenants
      const tenants = await prisma.tenant.findMany({
        where: { isActive: true }
      });

      for (const tenant of tenants) {
        await MISPClientService.scheduledSync(tenant.id);
      }

      logger.info('MISP sync completed for all tenants');
    } catch (error) {
      logger.error('MISP sync cron job failed', {
        error: error.message
      });
    }
  });

  logger.info('✅ MISP sync scheduler initialized (every 6 hours)');
}
```

**Temps estimé :** 16 heures (2 jours)

---

### **SEMAINE 2 : CVE + OSINT + THREAT FEEDS**

#### Sprint 2.1 - CVE Enrichment Avancé (Jours 8-9)

**Objectif :** Enrichissement CVE complet avec NVD + CIRCL

```typescript
// backend/src/services/cve-enrichment.service.ts

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { CacheService } from '../utils/cache';

const prisma = new PrismaClient();

/**
 * CVE Enrichment Service
 * Sources: NVD (NIST) + CIRCL CVE Search
 */
export class CVEEnrichmentService {
  /**
   * Enrich CVE with full details
   */
  static async enrichCVE(cveId: string, tenantId: string): Promise<any> {
    logger.info('Enriching CVE', { cveId, tenantId });

    // Check cache
    const cacheKey = `cve:${cveId}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      logger.info('CVE cache hit', { cveId });
      return { ...cached, cached: true };
    }

    // Fetch from NVD
    const nvdData = await this.fetchFromNVD(cveId);

    // Fetch from CIRCL
    const circlData = await this.fetchFromCIRCL(cveId);

    // Merge data
    const enrichedData = {
      cveId,
      description: nvdData?.description || circlData?.summary || null,
      severity: nvdData?.severity || this.mapCVSSToSeverity(circlData?.cvss),
      cvssScore: nvdData?.cvssScore || circlData?.cvss || null,
      cvssVector: nvdData?.cvssVector || circlData?.cvss_vector || null,
      publishedDate: nvdData?.publishedDate || circlData?.Published || null,
      lastModifiedDate: nvdData?.lastModifiedDate || circlData?.Modified || null,
      cweId: nvdData?.cweId || circlData?.cwe || null,
      references: this.mergeReferences(nvdData?.references, circlData?.references),
      affectedProducts: nvdData?.affectedProducts || [],
      exploitAvailable: await this.checkExploit(cveId),
      exploitMaturity: await this.getExploitMaturity(cveId),
      patchAvailable: circlData?.patch_available || false,
      enrichmentData: {
        nvd: nvdData,
        circl: circlData
      },
      sources: ['NVD', 'CIRCL']
    };

    // Cache for 7 days
    await CacheService.set(cacheKey, enrichedData, 7 * 24 * 3600);

    // Store in database
    await this.storeCVE(enrichedData, tenantId);

    logger.info('CVE enriched successfully', { cveId });

    return { ...enrichedData, cached: false };
  }

  /**
   * Fetch CVE from NVD (NIST)
   */
  private static async fetchFromNVD(cveId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://services.nvd.nist.gov/rest/json/cves/2.0`,
        {
          params: {
            cveId
          },
          headers: {
            'apiKey': process.env.NVD_API_KEY || ''
          },
          timeout: 10000
        }
      );

      const cve = response.data.vulnerabilities?.[0]?.cve;
      if (!cve) return null;

      const cvssV3 = cve.metrics?.cvssMetricV31?.[0]?.cvssData;
      const cvssV2 = cve.metrics?.cvssMetricV2?.[0]?.cvssData;

      return {
        description: cve.descriptions?.find((d: any) => d.lang === 'en')?.value,
        severity: cvssV3?.baseSeverity || cvssV2?.baseSeverity || 'UNKNOWN',
        cvssScore: cvssV3?.baseScore || cvssV2?.baseScore || null,
        cvssVector: cvssV3?.vectorString || cvssV2?.vectorString || null,
        publishedDate: cve.published ? new Date(cve.published) : null,
        lastModifiedDate: cve.lastModified ? new Date(cve.lastModified) : null,
        cweId: cve.weaknesses?.[0]?.description?.[0]?.value || null,
        references: cve.references?.map((ref: any) => ({
          url: ref.url,
          source: ref.source,
          tags: ref.tags
        })) || [],
        affectedProducts: this.extractAffectedProducts(cve.configurations)
      };
    } catch (error) {
      logger.error('NVD API error', { cveId, error: error.message });
      return null;
    }
  }

  /**
   * Fetch CVE from CIRCL
   */
  private static async fetchFromCIRCL(cveId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://cve.circl.lu/api/cve/${cveId}`,
        {
          timeout: 5000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('CIRCL API error', { cveId, error: error.message });
      return null;
    }
  }

  /**
   * Check if exploit is available
   */
  private static async checkExploit(cveId: string): Promise<boolean> {
    try {
      // Check Exploit-DB
      const response = await axios.get(
        `https://www.exploit-db.com/search`,
        {
          params: {
            cve: cveId
          },
          timeout: 5000
        }
      );

      return response.data.includes(cveId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get exploit maturity
   */
  private static async getExploitMaturity(cveId: string): Promise<string | null> {
    // TODO: Check threat intelligence sources for exploit maturity
    // - Proof of Concept
    // - Functional
    // - High
    return null;
  }

  /**
   * Store CVE in database
   */
  private static async storeCVE(data: any, tenantId: string): Promise<void> {
    await prisma.cVEVulnerability.upsert({
      where: { cveId: data.cveId },
      create: {
        tenantId,
        cveId: data.cveId,
        description: data.description,
        severity: data.severity,
        cvssScore: data.cvssScore,
        cvssVector: data.cvssVector,
        publishedDate: data.publishedDate,
        lastModifiedDate: data.lastModifiedDate,
        cweId: data.cweId,
        references: data.references,
        affectedProducts: data.affectedProducts,
        exploitAvailable: data.exploitAvailable,
        exploitMaturity: data.exploitMaturity,
        patchAvailable: data.patchAvailable,
        enrichmentData: data.enrichmentData
      },
      update: {
        description: data.description,
        severity: data.severity,
        cvssScore: data.cvssScore,
        cvssVector: data.cvssVector,
        lastModifiedDate: data.lastModifiedDate,
        references: data.references,
        affectedProducts: data.affectedProducts,
        exploitAvailable: data.exploitAvailable,
        exploitMaturity: data.exploitMaturity,
        patchAvailable: data.patchAvailable,
        enrichmentData: data.enrichmentData
      }
    });
  }

  /**
   * Bulk enrich CVEs
   */
  static async bulkEnrich(cveIds: string[], tenantId: string): Promise<any> {
    const results = {
      total: cveIds.length,
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const cveId of cveIds) {
      try {
        await this.enrichCVE(cveId, tenantId);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          cveId,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Helper functions
   */
  private static mapCVSSToSeverity(cvss: number): string {
    if (cvss >= 9.0) return 'CRITICAL';
    if (cvss >= 7.0) return 'HIGH';
    if (cvss >= 4.0) return 'MEDIUM';
    if (cvss >= 0.1) return 'LOW';
    return 'NONE';
  }

  private static mergeReferences(nvdRefs: any[] = [], circlRefs: any[] = []): any[] {
    const merged = [...nvdRefs];
    
    circlRefs.forEach((ref: string) => {
      if (!merged.find((m: any) => m.url === ref)) {
        merged.push({ url: ref, source: 'CIRCL' });
      }
    });

    return merged;
  }

  private static extractAffectedProducts(configurations: any): string[] {
    // Extract CPE (Common Platform Enumeration) from configurations
    const products: string[] = [];

    if (!configurations) return products;

    // TODO: Parse CPE configurations
    // Example: cpe:2.3:a:vendor:product:version:*:*:*:*:*:*:*

    return products;
  }
}
```

**Temps estimé :** 16 heures (2 jours)

---

#### Sprint 2.2 - OSINT Feeds Collector (Jours 10-12)

**Objectif :** Collecteur automatique de feeds OSINT (RSS, Twitter, Blogs)

```typescript
// backend/src/services/osint-feeds.service.ts

import axios from 'axios';
import Parser from 'rss-parser';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const parser = new Parser();

/**
 * OSINT Feeds Collector
 * Supports: RSS/Atom feeds, Twitter, Security blogs
 */
export class OSINTFeedsService {
  /**
   * Predefined threat intelligence feeds
   */
  private static readonly DEFAULT_FEEDS = [
    {
      name: 'US-CERT Alerts',
      url: 'https://www.us-cert.gov/ncas/alerts.xml',
      type: 'rss',
      category: 'government'
    },
    {
      name: 'Krebs on Security',
      url: 'https://krebsonsecurity.com/feed/',
      type: 'rss',
      category: 'blog'
    },
    {
      name: 'The Hacker News',
      url: 'https://feeds.feedburner.com/TheHackersNews',
      type: 'rss',
      category: 'news'
    },
    {
      name: 'Bleeping Computer',
      url: 'https://www.bleepingcomputer.com/feed/',
      type: 'rss',
      category: 'news'
    },
    {
      name: 'Threat Post',
      url: 'https://threatpost.com/feed/',
      type: 'rss',
      category: 'news'
    },
    {
      name: 'Dark Reading',
      url: 'https://www.darkreading.com/rss_simple.asp',
      type: 'rss',
      category: 'news'
    }
  ];

  /**
   * Initialize default feeds for tenant
   */
  static async initializeDefaultFeeds(tenantId: string): Promise<void> {
    for (const feed of this.DEFAULT_FEEDS) {
      await prisma.oSINTFeed.upsert({
        where: {
          tenantId_name: {
            tenantId,
            name: feed.name
          }
        },
        create: {
          tenantId,
          name: feed.name,
          feedType: feed.type,
          url: feed.url,
          enabled: true,
          config: { category: feed.category }
        },
        update: {}
      });
    }

    logger.info('Default OSINT feeds initialized', { tenantId });
  }

  /**
   * Fetch all feeds for tenant
   */
  static async fetchAllFeeds(tenantId: string): Promise<any> {
    const feeds = await prisma.oSINTFeed.findMany({
      where: {
        tenantId,
        enabled: true
      }
    });

    const results = {
      total: feeds.length,
      success: 0,
      failed: 0,
      items: 0
    };

    for (const feed of feeds) {
      try {
        const items = await this.fetchFeed(feed.id, tenantId);
        results.success++;
        results.items += items;

        // Update feed stats
        await prisma.oSINTFeed.update({
          where: { id: feed.id },
          data: {
            lastFetch: new Date(),
            lastSuccess: new Date(),
            itemsCollected: { increment: items }
          }
        });
      } catch (error) {
        results.failed++;

        // Update feed error
        await prisma.oSINTFeed.update({
          where: { id: feed.id },
          data: {
            lastFetch: new Date(),
            lastError: error.message
          }
        });

        logger.error('Failed to fetch OSINT feed', {
          feedId: feed.id,
          feedName: feed.name,
          error: error.message
        });
      }
    }

    logger.info('OSINT feeds fetched', results);

    return results;
  }

  /**
   * Fetch single feed
   */
  static async fetchFeed(feedId: string, tenantId: string): Promise<number> {
    const feed = await prisma.oSINTFeed.findUnique({
      where: { id: feedId }
    });

    if (!feed) {
      throw new Error('Feed not found');
    }

    switch (feed.feedType) {
      case 'rss':
        return await this.fetchRSSFeed(feed, tenantId);
      
      case 'twitter':
        return await this.fetchTwitterFeed(feed, tenantId);
      
      case 'api':
        return await this.fetchAPIFeed(feed, tenantId);
      
      default:
        throw new Error(`Unsupported feed type: ${feed.feedType}`);
    }
  }

  /**
   * Fetch RSS/Atom feed
   */
  private static async fetchRSSFeed(feed: any, tenantId: string): Promise<number> {
    const rss = await parser.parseURL(feed.url);
    let itemsStored = 0;

    for (const item of rss.items) {
      // Check if item already exists
      const exists = await prisma.threat.findFirst({
        where: {
          tenantId,
          source: `OSINT:${feed.name}`,
          name: item.title
        }
      });

      if (exists) continue;

      // Extract IOCs from content
      const iocs = this.extractIOCsFromText(
        `${item.title} ${item.contentSnippet || item.content || ''}`
      );

      // Determine severity from keywords
      const severity = this.determineSeverityFromText(
        `${item.title} ${item.contentSnippet || ''}`
      );

      // Create threat
      await prisma.threat.create({
        data: {
          tenantId,
          name: item.title || 'Unnamed',
          type: 'osint',
          severity,
          confidence: 50,
          status: 'new',
          description: item.contentSnippet || item.content || null,
          iocs,
          tags: [feed.name, feed.config.category],
          source: `OSINT:${feed.name}`,
          firstSeen: item.pubDate ? new Date(item.pubDate) : new Date(),
          lastSeen: new Date()
        }
      });

      itemsStored++;
    }

    logger.info('RSS feed processed', {
      feedName: feed.name,
      itemsFound: rss.items.length,
      itemsStored
    });

    return itemsStored;
  }

  /**
   * Fetch Twitter feed (TODO)
   */
  private static async fetchTwitterFeed(feed: any, tenantId: string): Promise<number> {
    // TODO: Implement Twitter API integration
    // Requires Twitter API credentials
    logger.warn('Twitter feed not yet implemented', { feedName: feed.name });
    return 0;
  }

  /**
   * Fetch API feed (TODO)
   */
  private static async fetchAPIFeed(feed: any, tenantId: string): Promise<number> {
    // TODO: Generic API fetcher
    logger.warn('API feed not yet implemented', { feedName: feed.name });
    return 0;
  }

  /**
   * Extract IOCs from text
   */
  private static extractIOCsFromText(text: string): any[] {
    const iocs: any[] = [];

    // IPv4
    const ipv4Regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const ips = text.match(ipv4Regex) || [];
    ips.forEach((ip) => {
      if (this.isValidIP(ip)) {
        iocs.push({ type: 'IP', value: ip });
      }
    });

    // Domains
    const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
    const domains = text.match(domainRegex) || [];
    domains.forEach((domain) => {
      if (this.isValidDomain(domain)) {
        iocs.push({ type: 'DOMAIN', value: domain.toLowerCase() });
      }
    });

    // URLs
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
    const urls = text.match(urlRegex) || [];
    urls.forEach((url) => {
      iocs.push({ type: 'URL', value: url });
    });

    // Hashes (SHA256)
    const sha256Regex = /\b[a-f0-9]{64}\b/gi;
    const hashes = text.match(sha256Regex) || [];
    hashes.forEach((hash) => {
      iocs.push({ type: 'FILE_HASH', value: hash.toLowerCase() });
    });

    // Remove duplicates
    return iocs.filter((ioc, index, self) =>
      index === self.findIndex((t) => t.type === ioc.type && t.value === ioc.value)
    );
  }

  /**
   * Determine severity from text keywords
   */
  private static determineSeverityFromText(text: string): string {
    const lowerText = text.toLowerCase();

    const criticalKeywords = ['critical', 'zero-day', '0-day', 'ransomware', 'breach', 'compromised'];
    const highKeywords = ['vulnerability', 'exploit', 'attack', 'malware', 'phishing'];
    const mediumKeywords = ['warning', 'threat', 'suspicious', 'alert'];

    if (criticalKeywords.some((k) => lowerText.includes(k))) {
      return 'critical';
    } else if (highKeywords.some((k) => lowerText.includes(k))) {
      return 'high';
    } else if (mediumKeywords.some((k) => lowerText.includes(k))) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Validators
   */
  private static isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    return parts.length === 4 && parts.every((p) => {
      const num = parseInt(p);
      return num >= 0 && num <= 255;
    });
  }

  private static isValidDomain(domain: string): boolean {
    // Filter out common false positives
    const blacklist = ['example.com', 'localhost', 'test.com'];
    return !blacklist.includes(domain.toLowerCase());
  }

  /**
   * Scheduled fetch (cron job)
   */
  static async scheduledFetch(tenantId: string): Promise<void> {
    logger.info('Starting OSINT feeds scheduled fetch', { tenantId });

    try {
      await this.fetchAllFeeds(tenantId);
    } catch (error) {
      logger.error('OSINT feeds fetch failed', {
        tenantId,
        error: error.message
      });
    }
  }
}
```

**Scheduler :**

```typescript
// backend/src/schedulers/osint-feeds.scheduler.ts

import cron from 'node-cron';
import { OSINTFeedsService } from '../services/osint-feeds.service';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Schedule OSINT feeds fetch every 6 hours
 */
export function scheduleOSINTFeeds() {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('OSINT feeds cron job triggered');

    try {
      const tenants = await prisma.tenant.findMany({
        where: { isActive: true }
      });

      for (const tenant of tenants) {
        await OSINTFeedsService.scheduledFetch(tenant.id);
      }

      logger.info('OSINT feeds completed for all tenants');
    } catch (error) {
      logger.error('OSINT feeds cron job failed', {
        error: error.message
      });
    }
  });

  logger.info('✅ OSINT feeds scheduler initialized (every 6 hours)');
}
```

**Temps estimé :** 24 heures (3 jours)

---

### **SEMAINE 3 : DARK WEB + HONEYPOTS + THREAT FEEDS**

#### Sprint 3.1 - Dark Web Monitoring (Jours 13-15)

**Objectif :** Monitoring basique du Dark Web (forums, paste sites)

```typescript
// backend/src/services/darkweb-monitoring.service.ts

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

/**
 * Dark Web Monitoring Service
 * Note: Pour production, utiliser des services spécialisés (Flashpoint, Recorded Future)
 * Cette implémentation est basique pour démo
 */
export class DarkWebMonitoringService {
  /**
   * Monitor paste sites (Pastebin-like)
   */
  static async monitorPasteSites(tenantId: string, keywords: string[]): Promise<number> {
    logger.info('Monitoring paste sites', { tenantId, keywords });

    const pasteSites = [
      'https://pastebin.com',
      // Autres sites paste publics
    ];

    let itemsFound = 0;

    for (const site of pasteSites) {
      try {
        // Note: Cette approche est très limitée et pour démo uniquement
        // En production, utiliser des APIs spécialisées
        const items = await this.scrapePasteSite(site, keywords, tenantId);
        itemsFound += items;
      } catch (error) {
        logger.error('Paste site monitoring failed', {
          site,
          error: error.message
        });
      }
    }

    return itemsFound;
  }

  /**
   * Scrape paste site (basic implementation)
   */
  private static async scrapePasteSite(
    siteUrl: string,
    keywords: string[],
    tenantId: string
  ): Promise<number> {
    // TODO: Implémenter scraping réel avec rate limiting
    // Pour l'instant, retourne 0
    logger.warn('Paste site scraping not fully implemented', { siteUrl });
    return 0;
  }

  /**
   * Create dark web item
   */
  static async createDarkWebItem(data: {
    tenantId: string;
    source: string;
    sourceType: string;
    title?: string;
    content: string;
    url?: string;
    author?: string;
    timestamp?: Date;
    keywords: string[];
  }): Promise<any> {
    // Extract IOCs from content
    const iocs = this.extractIOCs(data.content);

    // Calculate threat score
    const threatScore = this.calculateThreatScore(data.content, data.keywords);

    const item = await prisma.darkWebItem.create({
      data: {
        tenantId: data.tenantId,
        source: data.source,
        sourceType: data.sourceType,
        title: data.title,
        content: data.content,
        url: data.url,
        author: data.author,
        timestamp: data.timestamp || new Date(),
        iocs,
        keywords: data.keywords,
        threatScore,
        metadata: {}
      }
    });

    logger.info('Dark web item created', {
      itemId: item.id,
      source: data.source,
      threatScore
    });

    return item;
  }

  /**
   * Extract IOCs from dark web content
   */
  private static extractIOCs(content: string): any[] {
    const iocs: any[] = [];

    // IPv4
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const ips = content.match(ipRegex) || [];
    ips.forEach((ip) => iocs.push({ type: 'IP', value: ip }));

    // Domains
    const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
    const domains = content.match(domainRegex) || [];
    domains.forEach((domain) => iocs.push({ type: 'DOMAIN', value: domain }));

    // Hashes
    const hashRegex = /\b[a-f0-9]{32,64}\b/gi;
    const hashes = content.match(hashRegex) || [];
    hashes.forEach((hash) => iocs.push({ type: 'FILE_HASH', value: hash }));

    // Email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = content.match(emailRegex) || [];
    emails.forEach((email) => iocs.push({ type: 'EMAIL', value: email }));

    return iocs;
  }

  /**
   * Calculate threat score based on keywords
   */
  private static calculateThreatScore(content: string, keywords: string[]): number {
    let score = 0;
    const lowerContent = content.toLowerCase();

    // High value keywords
    const highValueKeywords = ['ransomware', 'exploit', '0-day', 'breach', 'dump', 'database'];
    highValueKeywords.forEach((keyword) => {
      if (lowerContent.includes(keyword)) score += 20;
    });

    // Medium value keywords
    const mediumValueKeywords = ['hack', 'malware', 'vulnerability', 'leaked'];
    mediumValueKeywords.forEach((keyword) => {
      if (lowerContent.includes(keyword)) score += 10;
    });

    // Custom keywords
    keywords.forEach((keyword) => {
      if (lowerContent.includes(keyword.toLowerCase())) score += 15;
    });

    return Math.min(score, 100);
  }

  /**
   * Search dark web items
   */
  static async searchItems(
    tenantId: string,
    query: {
      keywords?: string[];
      minThreatScore?: number;
      sourceType?: string;
      dateFrom?: Date;
    } = {}
  ): Promise<any[]> {
    const where: any = { tenantId };

    if (query.minThreatScore) {
      where.threatScore = { gte: query.minThreatScore };
    }

    if (query.sourceType) {
      where.sourceType = query.sourceType;
    }

    if (query.dateFrom) {
      where.collectedAt = { gte: query.dateFrom };
    }

    const items = await prisma.darkWebItem.findMany({
      where,
      orderBy: { threatScore: 'desc' },
      take: 100
    });

    return items;
  }
}
```

**Note Importante :** Pour un monitoring du Dark Web réel et efficace en production, il faut :

1. **Utiliser des services spécialisés :**
   - Flashpoint Intelligence
   - Recorded Future
   - Digital Shadows
   - Intel 471

2. **Infrastruct
