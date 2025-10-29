# 🗺️ ROADMAP - COLLECTE & AGRÉGATION DE DONNÉES

**Objectif :** Passer de 50% → **100%** de compétitivité

---

## 📊 ÉTAT ACTUEL (50%)

### ✅ Déjà Implémenté

| Fonctionnalité | Status | Score |
|----------------|--------|-------|
| Flux OSINT via Taranis | ✅ | 100% |
| Custom feeds (bots Taranis) | ✅ | 100% |
| API connectors (3 sources) | ✅ | 60% |

### ❌ Manquant (Gaps Critiques)

| Fonctionnalité | Status | Impact |
|----------------|--------|--------|
| STIX/TAXII | ❌ | 🔴 CRITIQUE |
| MISP Integration | ❌ | 🔴 CRITIQUE |
| CVE Enrichment (NVD) | ⚠️ Préparé | 🟡 HAUTE |
| Dark Web Monitoring | ❌ | 🟡 HAUTE |
| Honeypots Integration | ❌ | 🟢 MOYENNE |
| Threat feeds commerciaux | ❌ | 🟢 BASSE |

---

## 🎯 ROADMAP DÉTAILLÉE

### PHASE 1 : STIX/TAXII Support (5 jours) 🔴

**Priorité :** CRITIQUE - Standard industrie obligatoire

#### **Jour 1-2 : STIX 2.1 Parser**

**Fichier :** `backend/src/services/stix-parser.service.ts`

**Fonctionnalités :**
```typescript
class STIXParserService {
  // Parser STIX Bundle → Objets AntStrike
  static parseSTIXBundle(bundle: any): {
    indicators: IOC[],
    threats: Threat[],
    campaigns: Campaign[],
    attackPatterns: AttackPattern[]
  }
  
  // Convertir IOC → STIX Indicator
  static toSTIXIndicator(ioc: IOC): STIXIndicator
  
  // Import STIX file
  static async importSTIXFile(tenantId: string, filePath: string)
  
  // Export vers STIX
  static async exportToSTIX(tenantId: string, filters: any): STIXBundle
}
```

**Endpoints à créer :**
```
POST /api/stix/import      - Importer fichier STIX
GET  /api/stix/export      - Exporter données en STIX
POST /api/stix/parse       - Parser STIX bundle
GET  /api/stix/validate    - Valider STIX
```

**Packages requis :**
```bash
npm install stix2 @types/stix2
```

**Tests :**
- ✅ Parser STIX 2.1 bundle
- ✅ Extraire 100 IOCs depuis STIX
- ✅ Convertir IOCs → STIX
- ✅ Export rapport en STIX

**Temps estimé :** 16 heures  
**Complexité :** 🟡 Moyenne

---

#### **Jour 3-4 : TAXII 2.1 Server**

**Fichier :** `backend/src/services/taxii-server.service.ts`

**Fonctionnalités :**
```typescript
class TAXIIServerService {
  // Discovery service
  static getDiscovery(): TAXIIDiscovery
  
  // Collections disponibles
  static getCollections(tenantId: string): TAXIICollection[]
  
  // Objects dans une collection
  static getObjects(tenantId: string, collectionId: string, params: any)
  
  // Ajouter objects
  static addObjects(tenantId: string, collectionId: string, objects: any[])
  
  // Status
  static getStatus(tenantId: string, statusId: string)
}
```

**Endpoints TAXII (Standard) :**
```
GET  /taxii/                            - Discovery
GET  /taxii/collections/                - Liste collections
GET  /taxii/collections/{id}/           - Collection info
GET  /taxii/collections/{id}/objects/   - Get objects
POST /taxii/collections/{id}/objects/   - Add objects
GET  /taxii/status/{id}/                - Status
```

**Configuration :**
```typescript
// Collections par défaut
const collections = [
  { id: 'indicators', title: 'IOCs & Indicators' },
  { id: 'threats', title: 'Threat Intelligence' },
  { id: 'campaigns', title: 'Campaigns & APTs' },
  { id: 'attack-patterns', title: 'MITRE ATT&CK Patterns' }
];
```

**Tests :**
- ✅ TAXII Discovery endpoint
- ✅ Liste collections
- ✅ Push 50 IOCs via TAXII
- ✅ Pull IOCs depuis TAXII
- ✅ Authentification TAXII

**Temps estimé :** 16 heures  
**Complexité :** 🟡 Moyenne

---

#### **Jour 5 : Documentation & Tests**

**Actions :**
- Documenter STIX/TAXII dans Swagger
- Tests d'intégration complets
- Guide utilisateur STIX/TAXII
- Exemples de bundles STIX

**Livrables :**
```
✅ 10 endpoints STIX/TAXII
✅ Documentation Swagger
✅ Guide import/export
✅ Tests validés
```

**Temps estimé :** 8 heures

---

### PHASE 2 : MISP Integration (3 jours) 🔴

**Priorité :** CRITIQUE - Communauté mondiale CTI

#### **Jour 1 : MISP Client**

**Fichier :** `backend/src/services/misp-client.service.ts`

**Fonctionnalités :**
```typescript
class MISPClientService {
  // Se connecter à instance MISP
  static async connect(mispUrl: string, apiKey: string): Promise<boolean>
  
  // Récupérer events récents
  static async getRecentEvents(lastDays: number = 7): Promise<MISPEvent[]>
  
  // Récupérer attributes (IOCs)
  static async getAttributes(filters: any): Promise<MISPAttribute[]>
  
  // Publier event sur MISP
  static async publishEvent(tenantId: string, event: any): Promise<MISPEvent>
  
  // Synchroniser IOCs MISP → AntStrike
  static async syncIOCs(tenantId: string): Promise<{imported: number}>
  
  // Publier IOCs AntStrike → MISP
  static async publishIOCs(tenantId: string, iocs: IOC[]): Promise<{published: number}>
}
```

**Endpoints à créer :**
```
POST /api/misp/connect          - Connecter instance MISP
GET  /api/misp/events           - Liste events MISP
GET  /api/misp/attributes       - Liste attributes
POST /api/misp/sync             - Synchroniser IOCs MISP → AntStrike
POST /api/misp/publish          - Publier sur MISP
GET  /api/misp/stats            - Stats synchronisation
```

**Configuration tenant.settings :**
```json
{
  "misp": {
    "enabled": true,
    "url": "https://misp.example.com",
    "apiKey": "YOUR_MISP_API_KEY",
    "autoSync": true,
    "syncInterval": 3600,  // 1 heure
    "publishAuto": false
  }
}
```

**Packages requis :**
```bash
npm install pymisp-node
```

**Tests :**
- ✅ Connexion MISP
- ✅ Import 100 IOCs depuis MISP
- ✅ Publish 10 IOCs vers MISP
- ✅ Sync automatique

**Temps estimé :** 8 heures  
**Complexité :** 🟡 Moyenne

---

#### **Jour 2 : Synchronisation Automatique**

**Fichier :** `backend/src/jobs/misp-sync.job.ts`

**Fonctionnalités :**
```typescript
class MISPSyncJob {
  // Sync toutes les heures
  static async scheduledSync() {
    // Pour chaque tenant avec MISP activé
    const tenants = await prisma.tenant.findMany({
      where: { 
        settings: { path: ['misp', 'enabled'], equals: true }
      }
    });
    
    for (const tenant of tenants) {
      await MISPClientService.syncIOCs(tenant.id);
    }
  }
  
  // Démarrer scheduler
  static start() {
    setInterval(this.scheduledSync, 3600000); // 1h
  }
}
```

**Tests :**
- ✅ Sync automatique toutes les heures
- ✅ Multi-tenant (chaque tenant son MISP)
- ✅ Error handling
- ✅ Logs détaillés

**Temps estimé :** 8 heures

---

#### **Jour 3 : Mapping MISP ↔ AntStrike**

**Fichier :** `backend/src/services/misp-mapper.service.ts`

**Fonctionnalités :**
```typescript
class MISPMapperService {
  // MISP Attribute → AntStrike IOC
  static mispToIOC(attribute: MISPAttribute): IOC {
    return {
      iocValue: attribute.value,
      iocType: this.mapMISPType(attribute.type),
      source: `MISP Event ${attribute.event_id}`,
      confidence: this.mapMISPConfidence(attribute),
      tags: attribute.tags || [],
      firstSeen: new Date(attribute.timestamp * 1000),
      // ... etc
    };
  }
  
  // AntStrike IOC → MISP Attribute
  static iocToMISP(ioc: IOC, eventId: number): MISPAttribute
  
  // Types mapping
  static mapMISPType(mispType: string): IOCType
  
  // Confidence mapping
  static mapMISPConfidence(attr: MISPAttribute): number
}
```

**Mapping Types :**
```typescript
const MISP_TYPE_MAP = {
  'ip-src': 'IP',
  'ip-dst': 'IP',
  'domain': 'DOMAIN',
  'url': 'URL',
  'md5': 'FILE_HASH',
  'sha1': 'FILE_HASH',
  'sha256': 'FILE_HASH',
  'email-src': 'EMAIL',
  'email-dst': 'EMAIL',
  // ... 50+ types MISP
};
```

**Tests :**
- ✅ Mapper 20 types MISP
- ✅ Round-trip (MISP → AntStrike → MISP)
- ✅ Préserver tags et context

**Temps estimé :** 8 heures  
**Complexité :** 🟡 Moyenne

---

### PHASE 3 : CVE Enrichment (2 jours) 🟡

**Priorité :** HAUTE - Vulnérabilités critiques

#### **Jour 1 : NVD API Integration**

**Fichier :** `backend/src/services/ioc-enrichment.service.ts` (ajouter)

**Code à ajouter :**
```typescript
/**
 * Enrichir une CVE (via NVD, MITRE, etc.)
 */
private static async enrichCVE(cve: string): Promise<any> {
  try {
    const data: any = {
      cve,
      description: null,
      cvssScore: null,
      severity: 'UNKNOWN',
      publishedDate: null,
      lastModified: null,
      cwe: [],
      references: [],
      exploitAvailable: false,
      patchAvailable: false,
      affectedProducts: [],
      sources: []
    };

    // Enrichir via NVD
    const nvdData = await this.checkNVD(cve);
    if (nvdData) {
      Object.assign(data, nvdData);
      data.sources.push('NVD');
    }

    // Enrichir via CIRCL (gratuit)
    const circlData = await this.checkCIRCL(cve);
    if (circlData) {
      data.exploitAvailable = circlData.exploit || false;
      data.sources.push('CIRCL');
    }

    return data;
  } catch (error) {
    logger.error('Erreur enrichissement CVE:', error);
    return { cve, error: 'Enrichment failed' };
  }
}

/**
 * Vérifier CVE via NVD
 */
private static async checkNVD(cve: string): Promise<any> {
  try {
    const apiKey = process.env.NVD_API_KEY; // Optionnel mais recommandé
    const headers = apiKey ? { 'apiKey': apiKey } : {};
    
    const axios = require('axios');
    const response = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cve}`,
      { headers, timeout: 5000 }
    );

    const vuln = response.data.vulnerabilities[0]?.cve;
    if (!vuln) return null;

    const metrics = vuln.metrics?.cvssMetricV31?.[0] || vuln.metrics?.cvssMetricV2?.[0];
    
    return {
      description: vuln.descriptions?.find((d: any) => d.lang === 'en')?.value,
      cvssScore: metrics?.cvssData?.baseScore,
      severity: metrics?.cvssData?.baseSeverity || 'UNKNOWN',
      publishedDate: vuln.published,
      lastModified: vuln.lastModified,
      cwe: vuln.weaknesses?.map((w: any) => w.description[0]?.value) || [],
      references: vuln.references?.map((r: any) => r.url).slice(0, 10) || [],
      affectedProducts: this.extractAffectedProducts(vuln)
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      logger.info(`CVE non trouvée dans NVD: ${cve}`);
      return null;
    }
    logger.error('Erreur NVD:', error.message);
    return null;
  }
}

/**
 * Vérifier exploit disponible via CIRCL
 */
private static async checkCIRCL(cve: string): Promise<any> {
  try {
    const axios = require('axios');
    const response = await axios.get(
      `https://cve.circl.lu/api/cve/${cve}`,
      { timeout: 5000 }
    );
    
    return {
      exploit: response.data.exploit || false,
      references: response.data.references || []
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extraire produits affectés
 */
private static extractAffectedProducts(vuln: any): string[] {
  const products: Set<string> = new Set();
  
  vuln.configurations?.forEach((config: any) => {
    config.nodes?.forEach((node: any) => {
      node.cpeMatch?.forEach((cpe: any) => {
        // Extraire vendor:product depuis CPE
        const parts = cpe.criteria.split(':');
        if (parts.length >= 5) {
          products.add(`${parts[3]}:${parts[4]}`);
        }
      });
    });
  });
  
  return Array.from(products).slice(0, 20);
}
```

**Configuration .env :**
```env
# NVD API (Optionnel mais recommandé pour rate limit 50/30s)
NVD_API_KEY=your_nvd_api_key_here

# CIRCL (Gratuit, pas de clé requise)
```

**Tests :**
```typescript
// Test CVE-2021-44228 (Log4Shell)
const result = await IOCEnrichmentService.enrichIOC(tenantId, {
  iocValue: 'CVE-2021-44228',
  iocType: 'CVE'
});

// Devrait retourner:
{
  cve: 'CVE-2021-44228',
  description: 'Apache Log4j2 ...',
  cvssScore: 10.0,
  severity: 'CRITICAL',
  exploitAvailable: true,
  affectedProducts: ['apache:log4j', ...],
  sources: ['NVD', 'CIRCL']
}
```

**Temps estimé :** 16 heures  
**Complexité :** 🟡 Moyenne

---

#### **Jour 5 : Tests & Documentation**

**Actions :**
- Tests unitaires CVE enrichment
- Documentation Swagger
- Guide utilisateur CVE
- Exemples CVE critiques (Log4Shell, ProxyLogon, etc.)

**Temps estimé :** 8 heures

---

### PHASE 2 : MISP Integration (3 jours) 🔴

#### **Jour 1 : MISP API Client**

**Fichier :** `backend/src/services/misp-client.service.ts`

**Code complet :**
```typescript
import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface MISPConfig {
  url: string;
  apiKey: string;
  verifySsl?: boolean;
}

export class MISPClientService {
  /**
   * Récupérer events récents depuis MISP
   */
  static async getRecentEvents(
    config: MISPConfig, 
    lastDays: number = 7
  ): Promise<any[]> {
    try {
      const client = this.createClient(config);
      
      const response = await client.post('/events/restSearch', {
        returnFormat: 'json',
        published: true,
        timestamp: Math.floor(Date.now() / 1000) - (lastDays * 86400),
        limit: 100
      });

      return response.data.response || [];
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
    filters: {
      type?: string;
      category?: string;
      limit?: number;
    } = {}
  ): Promise<any[]> {
    try {
      const client = this.createClient(config);
      
      const response = await client.post('/attributes/restSearch', {
        returnFormat: 'json',
        type: filters.type,
        category: filters.category,
        limit: filters.limit || 1000,
        enforceWarninglist: true,  // Filtrer false positives
        published: true
      });

      return response.data.response?.Attribute || [];
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
      threat_level_id: number;
      analysis: number;
      distribution: number;
      attributes: any[];
      tags?: string[];
    }
  ): Promise<any> {
    try {
      const client = this.createClient(config);
      
      const response = await client.post('/events/add', {
        Event: event
      });

      logger.info(`Event publié sur MISP: ${response.data.Event.id}`);
      return response.data.Event;
    } catch (error: any) {
      logger.error('Erreur publication MISP:', error.message);
      throw error;
    }
  }

  /**
   * Synchroniser IOCs MISP → AntStrike
   */
  static async syncIOCs(
    tenantId: string,
    config: MISPConfig,
    lastDays: number = 7
  ): Promise<{ imported: number; skipped: number }> {
    try {
      const attributes = await this.getAttributes(config, { limit: 1000 });
      
      let imported = 0;
      let skipped = 0;

      for (const attr of attributes) {
        try {
          // Convertir MISP → AntStrike IOC
          const ioc = this.mispToIOC(attr);
          
          // Vérifier si déjà existe
          const existing = await prisma.iOCEnrichment.findFirst({
            where: {
              tenantId,
              iocValue: ioc.iocValue,
              iocType: ioc.iocType
            }
          });

          if (existing) {
            skipped++;
            continue;
          }

          // Enrichir et sauvegarder
          await IOCEnrichmentService.enrichIOC(tenantId, ioc);
          imported++;
          
        } catch (error) {
          logger.warn(`Skip attribute ${attr.id}:`, error);
          skipped++;
        }
      }

      logger.info(`MISP sync completed: ${imported} imported, ${skipped} skipped`);
      
      return { imported, skipped };
    } catch (error: any) {
      logger.error('Erreur sync MISP:', error.message);
      throw error;
    }
  }

  /**
   * Mapper MISP Attribute → AntStrike IOC
   */
  private static mispToIOC(attr: any): any {
    const TYPE_MAP: Record<string, string> = {
      'ip-src': 'IP',
      'ip-dst': 'IP',
      'domain': 'DOMAIN',
      'url': 'URL',
      'md5': 'FILE_HASH',
      'sha1': 'FILE_HASH',
      'sha256': 'FILE_HASH',
      'email-src': 'EMAIL',
      'email-dst': 'EMAIL'
    };

    return {
      iocValue: attr.value,
      iocType: TYPE_MAP[attr.type] || 'OTHER',
      source: `MISP Event ${attr.event_id}`,
      confidence: this.calculateConfidence(attr),
      tags: attr.Tag?.map((t: any) => t.name) || []
    };
  }

  /**
   * Calculer confidence depuis MISP
   */
  private static calculateConfidence(attr: any): number {
    // IDS flag + to_ids = haute confidence
    if (attr.to_ids) return 90;
    
    // Warninglist hit = basse confidence
    if (attr.warnings) return 40;
    
    return 70; // Default medium
  }

  /**
   * Créer client axios MISP
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
        undefined
    });
  }
}
```

**Tests :**
- ✅ Mapper 50 types MISP
- ✅ Import 500 IOCs depuis MISP public
- ✅ Confidence scoring
- ✅ Error handling

**Temps estimé :** 8 heures  
**Complexité :** 🟡 Moyenne

---

### PHASE 3 : Dark Web Monitoring (5 jours) 🟡

**Priorité :** HAUTE - Early warning

#### **Option A : APIs Commerciales (Recommandé MVP)**

**Services disponibles :**
```
1. Intel471 - $$$$ (Enterprise)
2. Flashpoint - $$$ (Mid/Large)
3. DarkOwl - $$ (PME)
4. Recorded Future Dark Web - $$$
```

**Implémentation :**

**Fichier :** `backend/src/services/darkweb-monitoring.service.ts`

```typescript
class DarkWebMonitoringService {
  /**
   * Rechercher mentions dans Dark Web
   */
  static async searchMentions(
    tenantId: string,
    query: {
      keywords?: string[];
      domains?: string[];
      ips?: string[];
      emails?: string[];
    }
  ): Promise<DarkWebMention[]> {
    // Appeler API (Intel471, Flashpoint, etc.)
    const mentions = await this.callDarkWebAPI(query);
    
    // Sauvegarder dans DB
    await prisma.darkWebMention.createMany({
      data: mentions.map(m => ({
        tenantId,
        source: m.source,
        content: m.content,
        url: m.url,
        foundAt: new Date(m.timestamp),
        severity: this.analyzeSeverity(m.content),
        relatedIOCs: this.extractIOCs(m.content)
      }))
    });
    
    // Créer alertes si critique
    for (const mention of mentions) {
      if (this.isCritical(mention)) {
        await AlertingService.createAlert({
          tenantId,
          storyId: `darkweb-${mention.id}`,
          severity: 'HIGH',
          priority: 'P1',
          category: 'DATA_BREACH',
          title: `Dark Web Mention Detected`,
          summary: mention.content.substring(0, 200)
        });
      }
    }
    
    return mentions;
  }

  /**
   * Monitoring automatique
   */
  static async scheduleMonitoring() {
    // Chaque 6 heures
    setInterval(async () => {
      const tenants = await prisma.tenant.findMany({
        where: {
          settings: { path: ['darkWebMonitoring', 'enabled'], equals: true }
        }
      });
      
      for (const tenant of tenants) {
        const keywords = (tenant.settings as any).darkWebMonitoring?.keywords || [];
        await this.searchMentions(tenant.id, { keywords });
      }
    }, 6 * 3600 * 1000);
  }
}
```

**Temps estimé :** 2-3 jours (avec API payante)  
**Coût :** $200-500/mois (API)

---

#### **Option B : Feeds Gratuits (Pour démarrer)**

**Sources gratuites :**
```
1. Tor Hidden Services lists (gratuit)
2. Pastebin monitoring (gratuit avec limits)
3. Telegram channels CTI (gratuit)
4. Reddit r/cybersecurity (gratuit)
```

**Implémentation :**

```typescript
class DarkWebFeedsService {
  /**
   * Monitorer Pastebin
   */
  static async monitorPastebin(keywords: string[]): Promise<any[]> {
    // Pastebin scraping API (gratuit)
    const pastes = await this.scrapePastebin(keywords);
    return pastes.filter(p => this.containsIOCs(p.content));
  }

  /**
   * Monitorer Tor hidden services lists
   */
  static async monitorTorLists(): Promise<any[]> {
    // Listes publiques de .onion
    const lists = [
      'https://raw.githubusercontent.com/DanWin/onion-links/master/README.md',
      // ... autres sources
    ];
    
    const sites = [];
    for (const url of lists) {
      const content = await axios.get(url);
      sites.push(...this.extractOnionLinks(content.data));
    }
    
    return sites;
  }
}
```

**Temps estimé :** 5 jours (scraping + parsing)  
**Coût :** $0 (gratuit mais limité)

---

### PHASE 4 : Honeypots Integration (2 jours) 🟢

**Priorité :** MOYENNE - Données propriétaires

**Fichier :** `backend/src/services/honeypot-collector.service.ts`

```typescript
class HoneypotCollectorService {
  /**
   * Collecter logs depuis honeypots
   */
  static async collectLogs(honeypotUrl: string): Promise<HoneypotLog[]> {
    // Format standard: JSON logs
    const response = await axios.get(`${honeypotUrl}/api/logs`);
    
    return response.data.logs.map((log: any) => ({
      sourceIP: log.src_ip,
      targetPort: log.dst_port,
      protocol: log.protocol,
      payload: log.payload,
      timestamp: new Date(log.timestamp),
      country: log.geo?.country,
      honeypotId: log.honeypot_id
    }));
  }

  /**
   * Analyser et créer IOCs
   */
  static async analyzeLogs(tenantId: string, logs: HoneypotLog[]) {
    // Agréger IPs par fréquence
    const ipStats = this.aggregateIPs(logs);
    
    // Créer IOCs pour IPs > threshold
    for (const [ip, count] of Object.entries(ipStats)) {
      if (count > 5) {  // Plus de 5 tentatives
        await IOCEnrichmentService.enrichIOC(tenantId, {
          iocValue: ip,
          iocType: 'IP',
          source: 'Honeypot'
        });
        
        // Créer alerte
        await AlertingService.createAlert({
          tenantId,
          storyId: `honeypot-${Date.now()}`,
          severity: count > 50 ? 'HIGH' : 'MEDIUM',
          priority: count > 50 ? 'P1' : 'P2',
          category: 'DENIAL_OF_SERVICE',
          title: `Honeypot Attack Detected from ${ip}`,
          summary: `${count} attempts in 24h`
        });
      }
    }
  }

  /**
   * Intégrations supportées
   */
  static getSupportedHoneypots() {
    return [
      { name: 'Cowrie', type: 'SSH/Telnet', url: 'https://github.com/cowrie/cowrie' },
      { name: 'Dionaea', type: 'Multi-protocol', url: 'https://github.com/DinoTools/dionaea' },
      { name: 'T-Pot', type: 'All-in-one', url: 'https://github.com/telekom-security/tpotce' }
    ];
  }
}
```

**Configuration tenant :**
```json
{
  "honeypots": [
    {
      "name": "SSH Honeypot 1",
      "url": "http://honeypot1.local:8080",
      "type": "cowrie",
      "enabled": true
    }
  ]
}
```

**Endpoints :**
```
POST /api/honeypots/add       - Ajouter honeypot
GET  /api/honeypots            - Liste honeypots
POST /api/honeypots/{id}/sync  - Synchroniser logs
GET  /api/honeypots/stats      - Statistiques attaques
```

**Temps estimé :** 16 heures  
**Complexité :** 🟢 Facile

---

### PHASE 5 : Threat Feeds Commerciaux (1 jour) 🟢

**Priorité :** BASSE - Nice to have

**APIs disponibles :**
```
1. AlienVault OTX - Gratuit ✅
2. ThreatFox (abuse.ch) - Gratuit ✅
3. URLhaus (abuse.ch) - Gratuit ✅
4. MalwareBazaar - Gratuit ✅
```

**Fichier :** `backend/src/services/threat-feeds.service.ts`

```typescript
class ThreatFeedsService {
  /**
   * AlienVault OTX
   */
  static async syncOTX(tenantId: string): Promise<number> {
    const apiKey = process.env.OTX_API_KEY;
    const response = await axios.get(
      'https://otx.alienvault.com/api/v1/pulses/subscribed',
      { headers: { 'X-OTX-API-KEY': apiKey } }
    );

    let imported = 0;
    for (const pulse of response.data.results) {
      for (const indicator of pulse.indicators) {
        await IOCEnrichmentService.enrichIOC(tenantId, {
          iocValue: indicator.indicator,
          iocType: this.mapOTXType(indicator.type),
          source: 'AlienVault OTX'
        });
        imported++;
      }
    }
    
    return imported;
  }

  /**
   * ThreatFox (Malware IOCs)
   */
  static async syncThreatFox(tenantId: string): Promise<number> {
    const response = await axios.get(
      'https://threatfox-api.abuse.ch/api/v1/',
      { 
        method: 'POST',
        data: { query: 'get_iocs', days: 7 }
      }
    );

    let imported = 0;
    for (const ioc of response.data.data) {
      await IOCEnrichmentService.enrichIOC(tenantId, {
        iocValue: ioc.ioc_value,
        iocType: ioc.ioc_type === 'ip:port' ? 'IP' : 'DOMAIN',
        source: 'ThreatFox'
      });
      imported++;
    }
    
    return imported;
  }

  /**
   * Synchroniser tous les feeds
   */
  static async syncAllFeeds(tenantId: string) {
    const results = await Promise.allSettled([
      this.syncOTX(tenantId),
      this.syncThreatFox(tenantId),
      this.syncURLhaus(tenantId),
      this.syncMalwareBazaar(tenantId)
    ]);

    const total = results
      .filter(r => r.status === 'fulfilled')
      .reduce((sum, r: any) => sum + r.value, 0);

    logger.info(`Total IOCs importés depuis feeds: ${total}`);
    return total;
  }
}
```

**Cron Job (toutes les 6h) :**
```typescript
setInterval(async () => {
  const tenants = await prisma.tenant.findMany();
  for (const tenant of tenants) {
    await ThreatFeedsService.syncAllFeeds(tenant.id);
  }
}, 6 * 3600 * 1000);
```

**Temps estimé :** 8 heures  
**Complexité :** 🟢 Facile  
**Coût :** $0 (gratuit)

---

## 📊 IMPACT SUR LE SCORE

### Après TOUTES les Phases

| Catégorie | Avant | Après | Gain |
|-----------|-------|-------|------|
| Collecte/Agrégation | 50% | **95%** | +45% |
| STIX/TAXII | 0% | 100% | +100% |
| MISP | 0% | 100% | +100% |
| CVE | 0% | 90% | +90% |
| Dark Web | 0% | 70% | +70% |
| Honeypots | 0% | 80% | +80% |
| Threat Feeds | 25% | 90% | +65% |

**Score Global Collecte:** 50% → **95%** ✅

---

## ⏱️ PLANNING GLOBAL

### Timeline Complète

```
Semaine 1:
  Jour 1-2: STIX Parser
  Jour 3-4: TAXII Server
  Jour 5:   Tests STIX/TAXII

Semaine 2:
  Jour 1:   MISP Client
  Jour 2:   MISP Sync
  Jour 3:   MISP Mapping
  Jour 4-5: CVE Enrichment (NVD)

Semaine 3:
  Jour 1-3: Dark Web (feeds gratuits)
  Jour 4:   Honeypots
  Jour 5:   Threat Feeds commerciaux gratuits

Total: 15 jours (3 semaines)
```

---

## 💰 BUDGET DÉVELOPPEMENT

### Temps Développeur

```
STIX/TAXII:        40 heures × $50/h  = $2,000
MISP:              24 heures × $50/h  = $1,200
CVE (NVD):         16 heures × $50/h  = $800
Dark Web:          24 heures × $50/h  = $1,200
Honeypots:         16 heures × $50/h  = $800
Threat Feeds:      8 heures × $50/h   = $400
Tests/Doc:         24 heures × $50/h  = $1,200
─────────────────────────────────────────────
TOTAL:             152 heures         = $7,600
```

### Coûts API (Annuels)

```
VirusTotal:        $0 (gratuit 500/jour)
AbuseIPDB:         $0 (gratuit 1000/jour)
IPInfo:            $0 (gratuit 50K/mois)
NVD:               $0 (gratuit)
CIRCL:             $0 (gratuit)
AlienVault OTX:    $0 (gratuit)
ThreatFox:         $0 (gratuit)
MISP:              $0 (self-hosted OU cloud gratuit)
Dark Web feeds:    $0 (feeds gratuits)
─────────────────────────────────────────────
TOTAL APIs Gratuit: $0/an

Option Dark Web Pro (futur):
DarkOwl:           $200-300/mois = $2,400-3,600/an
```

---

## 🎯 LIVRABLES PHASE 1 (STIX/TAXII/MISP/CVE)

### Services Créés (4)
```
✅ stix-parser.service.ts
✅ taxii-server.service.ts
✅ misp-client.service.ts
✅ CVE enrichment ajouté à ioc-enrichment.service.ts
```

### Endpoints Ajoutés (20+)
```
STIX:
  POST /api/stix/import
  GET  /api/stix/export
  POST /api/stix/parse
  GET  /api/stix/validate

TAXII:
  GET  /taxii/
  GET  /taxii/collections/
  GET  /taxii/collections/{id}/objects/
  POST /taxii/collections/{id}/objects/

MISP:
  POST /api/misp/connect
  GET  /api/misp/events
  POST /api/misp/sync
  POST /api/misp/publish
  GET  /api/misp/stats

CVE:
  POST /api/ioc/enrich (CVE type)
```

### Modèles DB Ajoutés
```sql
-- MISP Sync Logs
CREATE TABLE misp_sync_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  synced_at TIMESTAMP,
  imported INT,
  skipped INT,
  errors JSON
);

-- Dark Web Mentions
CREATE TABLE darkweb_mentions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  source VARCHAR,
  content TEXT,
  url VARCHAR,
  found_at TIMESTAMP,
  severity VARCHAR,
  related_iocs JSON
);
```

---

## 📈 RÉSULTATS ATTENDUS

### Après Phase 1 (3 semaines)

```
Score Collecte/Agrégation: 50% → 85%
Score Global MVP:          82% → 88%

Nouveau Capabilities:
✅ Import/Export STIX 2.1
✅ TAXII 2.1 Server (4 collections)
✅ MISP Bi-directional sync
✅ CVE Enrichment (NVD + CIRCL)
✅ 1000+ IOCs/jour depuis MISP
✅ CVE CVSS scoring
✅ Standard industrie respecté
```

### Compétitivité Marché

```
PME:           FORTE (88%) ✅
Startups:      FORTE (88%) ✅
MSSP petits:   MOYENNE (75%) ⚠️
Enterprise:    FAIBLE (60%) ❌
```

**Verdict :** **Prêt pour lancement commercial PME !** 🚀

---

## 🎉 CONCLUSION

### **Avec 3 semaines de travail ($7,600) :**

✅ AntStrike CTI devient **88% compétitif**  
✅ Standards industrie respectés (STIX/TAXII/MISP)  
✅ Collecte multi-sources (7+ sources)  
✅ Prêt pour marché PME  
✅ Différenciateurs uniques (Taranis, Prix)  

### **ROI Estimé :**

```
Développement:        $7,600 (one-time)
Premier client:       $10,000/an (PME)
10 clients an 1:      $100,000/an
ROI:                  13x première année
```

---

**Prochaine étape :** Implémenter STIX/TAXII (Phase 1, Semaine 1) ? 🚀

**Créé :** 19 Octobre 2025  
**Roadmap :** 3 semaines → 88% compétitif  
**Budget :** $7,600 développement




