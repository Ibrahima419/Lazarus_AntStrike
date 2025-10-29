/**
 * 🔄 NORMALIZATION PIPELINE
 * Normalise toutes les sources vers un format unifié
 * Input: N'importe quelle source (Taranis, MISP, STIX, OSINT)
 * Output: NormalizedThreat (format standard)
 */

import { logger } from '../utils/logger';

export interface NormalizedThreat {
  // Identité
  externalId: string;
  title: string;
  description: string | null;
  
  // Métadonnées
  source: string;
  sourceUrl: string | null;
  publishedAt: Date;
  collectedAt: Date;
  
  // Classification
  type: string;
  severity: string;
  confidence: number;
  
  // Contenu
  rawData: any;
  tags: string[];
  
  // IOCs (rempli par IOCExtractor)
  iocs: any[];
  
  // MITRE ATT&CK (optionnel)
  mitreTactics?: string[];
  mitreTechniques?: string[];
  
  // Scoring (rempli par ThreatScorer)
  threatScore: number;
  relevanceScore: number;
  
  // Déduplication (rempli par DeduplicationEngine)
  fingerprint?: string;
}

export class NormalizationPipeline {
  /**
   * Normaliser n'importe quelle source → Format unifié
   */
  static async normalize(data: any, source: string): Promise<NormalizedThreat> {
    logger.debug(`Normalizing data from ${source}`);
    
    try {
      switch (source.toLowerCase()) {
        case 'taranis':
          return this.normalizeTaranis(data);
        
        case 'misp':
          return this.normalizeMISP(data);
        
        case 'stix':
          return this.normalizeSTIX(data);
        
        case 'osint-feed':
        case 'osint':
          return this.normalizeOSINTFeed(data);
        
        case 'cve':
          return this.normalizeCVE(data);
        
        default:
          logger.warn(`Unknown source: ${source}, using generic normalization`);
          return this.normalizeGeneric(data, source);
      }
    } catch (error: any) {
      logger.error(`Normalization failed for ${source}`, {
        error: error.message,
        data: JSON.stringify(data).substring(0, 200)
      });
      throw new Error(`Normalization failed: ${error.message}`);
    }
  }
  
  /**
   * Normaliser Taranis Story
   */
  private static normalizeTaranis(story: any): NormalizedThreat {
    return {
      externalId: story.id,
      title: story.title || 'Untitled Story',
      description: story.summary || story.description || null,
      
      source: 'Taranis',
      sourceUrl: story.link || null,
      publishedAt: story.published ? new Date(story.published) : new Date(),
      collectedAt: new Date(),
      
      type: this.detectThreatType(story.title, story.summary),
      severity: this.detectSeverity(story),
      confidence: story.relevance || 50,
      
      rawData: story,
      tags: this.extractTaranisTags(story),
      
      iocs: [],
      mitreTactics: [],
      mitreTechniques: [],
      
      threatScore: 0,
      relevanceScore: 0
    };
  }
  
  /**
   * Normaliser MISP Event
   */
  private static normalizeMISP(event: any): NormalizedThreat {
    return {
      externalId: event.id || event.uuid,
      title: event.info || 'Untitled MISP Event',
      description: event.info || null,
      
      source: 'MISP',
      sourceUrl: event.uuid ? `${process.env.MISP_URL}/events/view/${event.uuid}` : null,
      publishedAt: event.date ? new Date(event.date) : new Date(),
      collectedAt: new Date(),
      
      type: this.mapMISPThreatLevel(event.threat_level_id),
      severity: this.mapMISPAnalysis(event.analysis),
      confidence: 70,
      
      rawData: event,
      tags: event.Tag?.map((t: any) => t.name) || [],
      
      // IOCs extraits des attributes MISP
      iocs: this.extractMISPIOCs(event.Attribute || []),
      
      threatScore: 0,
      relevanceScore: 0
    };
  }
  
  /**
   * Normaliser STIX Object
   */
  private static normalizeSTIX(stixObject: any): NormalizedThreat {
    return {
      externalId: stixObject.id,
      title: stixObject.name || stixObject.description?.substring(0, 100) || 'Untitled STIX Object',
      description: stixObject.description || null,
      
      source: 'STIX',
      sourceUrl: null,
      publishedAt: stixObject.created ? new Date(stixObject.created) : new Date(),
      collectedAt: new Date(),
      
      type: stixObject.type || 'unknown',
      severity: this.detectSeverityFromSTIX(stixObject),
      confidence: stixObject.confidence || 50,
      
      rawData: stixObject,
      tags: stixObject.labels || [],
      
      iocs: [],
      
      threatScore: 0,
      relevanceScore: 0
    };
  }
  
  /**
   * Normaliser OSINT Feed item
   */
  private static normalizeOSINTFeed(item: any): NormalizedThreat {
    return {
      externalId: item.id || `osint-${Date.now()}`,
      title: item.title || item.ioc || 'OSINT Feed Item',
      description: item.description || null,
      
      source: item.feedName || 'OSINT Feed',
      sourceUrl: item.url || null,
      publishedAt: item.date ? new Date(item.date) : new Date(),
      collectedAt: new Date(),
      
      type: item.type || 'unknown',
      severity: 'medium',
      confidence: 50,
      
      rawData: item,
      tags: [item.feedName].filter(Boolean),
      
      iocs: item.ioc ? [{ type: item.iocType, value: item.ioc }] : [],
      
      threatScore: 0,
      relevanceScore: 0
    };
  }
  
  /**
   * Normaliser CVE
   */
  private static normalizeCVE(cve: any): NormalizedThreat {
    return {
      externalId: cve.cveId,
      title: `Vulnerability: ${cve.cveId}`,
      description: cve.description || null,
      
      source: 'CVE',
      sourceUrl: `https://nvd.nist.gov/vuln/detail/${cve.cveId}`,
      publishedAt: cve.publishedDate ? new Date(cve.publishedDate) : new Date(),
      collectedAt: new Date(),
      
      type: 'vulnerability',
      severity: cve.severity || 'medium',
      confidence: 90,
      
      rawData: cve,
      tags: ['CVE', cve.cveId],
      
      iocs: [],
      
      threatScore: this.calculateCVEThreatScore(cve),
      relevanceScore: 0
    };
  }
  
  /**
   * Normalisation générique (fallback)
   */
  private static normalizeGeneric(data: any, source: string): NormalizedThreat {
    return {
      externalId: data.id || `${source}-${Date.now()}`,
      title: data.title || data.name || 'Untitled',
      description: data.description || data.summary || null,
      
      source,
      sourceUrl: data.url || data.link || null,
      publishedAt: data.date ? new Date(data.date) : new Date(),
      collectedAt: new Date(),
      
      type: data.type || 'unknown',
      severity: data.severity || 'medium',
      confidence: data.confidence || 50,
      
      rawData: data,
      tags: data.tags || [],
      
      iocs: [],
      
      threatScore: 0,
      relevanceScore: 0
    };
  }
  
  /**
   * Détecter type de menace depuis texte
   */
  private static detectThreatType(title: string = '', description: string = ''): string {
    const text = `${title} ${description}`.toLowerCase();
    
    const typePatterns = {
      'ransomware': ['ransomware', 'crypto-locker', 'lockbit', 'conti'],
      'phishing': ['phishing', 'credential theft', 'fake login'],
      'malware': ['malware', 'trojan', 'backdoor', 'rat'],
      'apt': ['apt', 'advanced persistent threat', 'state-sponsored'],
      'vulnerability': ['cve-', 'vulnerability', 'exploit', 'poc'],
      'ddos': ['ddos', 'denial of service', 'botnet'],
      'data-breach': ['breach', 'leak', 'data dump', 'database'],
      'supply-chain': ['supply chain', 'compromised package'],
      'insider-threat': ['insider', 'malicious employee']
    };
    
    for (const [type, patterns] of Object.entries(typePatterns)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        return type;
      }
    }
    
    return 'unknown';
  }
  
  /**
   * Détecter sévérité
   */
  private static detectSeverity(data: any): string {
    const text = `${data.title || ''} ${data.summary || ''}`.toLowerCase();
    
    // Keywords critiques
    const criticalKeywords = ['zero-day', '0-day', 'critical', 'widespread', 'active exploit'];
    if (criticalKeywords.some(k => text.includes(k))) {
      return 'critical';
    }
    
    // Keywords haute sévérité
    const highKeywords = ['ransomware', 'breach', 'compromised', 'exploit'];
    if (highKeywords.some(k => text.includes(k))) {
      return 'high';
    }
    
    // Flags Taranis
    if (data.important) return 'high';
    
    // Fraîcheur
    if (data.published) {
      const ageInHours = (Date.now() - new Date(data.published).getTime()) / (1000 * 3600);
      if (ageInHours < 6) return 'high'; // < 6h = probablement urgent
    }
    
    return 'medium';
  }
  
  /**
   * Extraire tags Taranis
   */
  private static extractTaranisTags(story: any): string[] {
    const tags: string[] = ['Taranis'];
    
    // Tags story
    if (story.tags && Array.isArray(story.tags)) {
      tags.push(...story.tags);
    }
    
    // Attributes
    if (story.attributes) {
      story.attributes.forEach((attr: any) => {
        if (attr.key) tags.push(attr.key);
      });
    }
    
    // Groups
    if (story.news_item_aggregates) {
      story.news_item_aggregates.forEach((agg: any) => {
        if (agg.source) tags.push(agg.source);
      });
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }
  
  /**
   * Mapper MISP threat level
   */
  private static mapMISPThreatLevel(level: number): string {
    const map: Record<number, string> = {
      1: 'apt',
      2: 'malware',
      3: 'unknown',
      4: 'unknown'
    };
    return map[level] || 'unknown';
  }
  
  /**
   * Mapper MISP analysis
   */
  private static mapMISPAnalysis(analysis: number): string {
    const map: Record<number, string> = {
      0: 'low',     // Initial
      1: 'medium',  // Ongoing
      2: 'high'     // Completed
    };
    return map[analysis] || 'medium';
  }
  
  /**
   * Extraire IOCs depuis MISP attributes
   */
  private static extractMISPIOCs(attributes: any[]): any[] {
    return attributes.map((attr: any) => ({
      type: this.mapMISPAttributeType(attr.type),
      value: attr.value,
      category: attr.category,
      toIds: attr.to_ids || false
    })).filter(ioc => ioc.type !== 'other');
  }
  
  /**
   * Mapper MISP attribute type → IOC type
   */
  private static mapMISPAttributeType(mispType: string): string {
    const map: Record<string, string> = {
      'ip-src': 'IP',
      'ip-dst': 'IP',
      'domain': 'DOMAIN',
      'hostname': 'DOMAIN',
      'url': 'URL',
      'md5': 'FILE_HASH',
      'sha1': 'FILE_HASH',
      'sha256': 'FILE_HASH',
      'email-src': 'EMAIL',
      'email-dst': 'EMAIL'
    };
    return map[mispType] || 'other';
  }
  
  /**
   * Détecter sévérité STIX
   */
  private static detectSeverityFromSTIX(stix: any): string {
    if (stix.severity) return stix.severity;
    if (stix.impact_score >= 8) return 'critical';
    if (stix.impact_score >= 6) return 'high';
    return 'medium';
  }
  
  /**
   * Calculer threat score CVE
   */
  private static calculateCVEThreatScore(cve: any): number {
    let score = 0;
    
    // CVSS score (0-10) → (0-40 points)
    if (cve.cvssScore) {
      score += (cve.cvssScore / 10) * 40;
    }
    
    // Exploit disponible (+30 points)
    if (cve.exploitAvailable) {
      score += 30;
    }
    
    // Patch non disponible (+20 points)
    if (!cve.patchAvailable) {
      score += 20;
    }
    
    // Fraîcheur (récent = +10 points)
    if (cve.publishedDate) {
      const ageInDays = (Date.now() - new Date(cve.publishedDate).getTime()) / (1000 * 86400);
      if (ageInDays < 7) score += 10;
    }
    
    return Math.min(Math.round(score), 100);
  }
}

