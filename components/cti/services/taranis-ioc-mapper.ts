/**
 * Service de Mapping IOCs depuis API Taranis Natif
 * Remplace l'extraction regex par l'utilisation des attributs Taranis
 * 
 * MIGRATION: Utilise /api/assess/news-items avec attributs natifs
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';

// ============ TYPES & INTERFACES ============

export interface TaranisIOCAttribute {
  key: string;
  value: string;
}

export interface TaranisNewsItemWithIOCs {
  id: string;
  title: string;
  content: string;
  collected: string;
  published: string;
  osint_source_id: string;
  hash: string;
  attributes: TaranisIOCAttribute[];
  review?: string;
  author?: string;
  link?: string;
}

export interface IOC {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  description?: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
  campaigns: string[];
  verified: boolean;
  newsItemId?: string;
  storyId?: string;
}

export interface IOCExtractionResult {
  iocs: IOC[];
  totalExtracted: number;
  byType: {
    ip: number;
    domain: number;
    hash: number;
    url: number;
    email: number;
  };
  confidence: {
    high: number;
    medium: number;
    low: number;
  };
  sources: string[];
  extractionMethod: 'native_attributes' | 'regex_fallback' | 'hybrid';
}

export interface TaranisIOCMapperConfig {
  enabled: boolean;
  priorityAttributes: boolean; // Prioriser les attributs Taranis sur regex
  regexFallback: boolean; // Utiliser regex si pas d'attributs
  confidenceThreshold: number;
  deduplication: boolean;
  enrichmentEnabled: boolean;
}

// ============ TYPES IOC SUPPORTÉS PAR TARANIS ============

const TARANIS_IOC_ATTRIBUTE_KEYS = [
  'ip',
  'ipv4',
  'ipv6',
  'domain',
  'hostname',
  'fqdn',
  'url',
  'uri',
  'hash',
  'md5',
  'sha1',
  'sha256',
  'email',
  'email-address',
  'cve',
  'cve-id',
  'mitre',
  'mitre-attack',
  'file',
  'filename',
  'filepath',
  'registry',
  'registry-key'
];

// Map des alias vers types normalisés
const IOC_TYPE_MAPPING: Record<string, 'ip' | 'domain' | 'hash' | 'url' | 'email'> = {
  'ip': 'ip',
  'ipv4': 'ip',
  'ipv6': 'ip',
  'domain': 'domain',
  'hostname': 'domain',
  'fqdn': 'domain',
  'url': 'url',
  'uri': 'url',
  'hash': 'hash',
  'md5': 'hash',
  'sha1': 'hash',
  'sha256': 'hash',
  'email': 'email',
  'email-address': 'email'
};

// ============ SERVICE PRINCIPAL ============

export class TaranisIOCMapperService {
  private taranisService = getTaranisService();
  private config: TaranisIOCMapperConfig;
  private cache = new Map<string, IOCExtractionResult>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes pour données temps réel

  constructor(config?: Partial<TaranisIOCMapperConfig>) {
    this.config = {
      enabled: true,
      priorityAttributes: true, // TOUJOURS prioriser les attributs Taranis
      regexFallback: true, // Fallback si nécessaire
      confidenceThreshold: 0.6,
      deduplication: true,
      enrichmentEnabled: true,
      ...config
    };
  }

  // ============ EXTRACTION PRINCIPALE ============

  /**
   * Extrait les IOCs depuis les news items Taranis (NATIF)
   * Utilise les attributs Taranis en priorité
   */
  async extractIOCsFromNewsItems(limit: number = 500, range?: string): Promise<IOCExtractionResult> {
    try {
      const cacheKey = `iocs-${limit}-${range}`;
      
      // Vérifier le cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        const age = Date.now() - (cached as any).timestamp;
        if (age < this.cacheExpiry) {
          console.log(`📦 IOCs récupérés depuis le cache (${Math.round(age / 1000)}s)`);
          return cached;
        }
      }

      console.log(`🔍 Extraction IOCs depuis Taranis API: ${limit} items, range: ${range || 'all'}`);
      
      // Récupérer les news items avec leurs attributs depuis Taranis
      const newsItems = await this.fetchNewsItemsWithAttributes(limit, range);
      
      if (!newsItems || newsItems.length === 0) {
        console.log('⚠️ Aucun news item trouvé');
        return this.getEmptyResult('native_attributes');
      }

      console.log(`📰 ${newsItems.length} news items récupérés depuis Taranis`);
      
      // Debug: vérifier si les news items ont des attributs
      const itemsWithAttributes = newsItems.filter(item => item.attributes && item.attributes.length > 0);
      console.log(`🔍 ${itemsWithAttributes.length}/${newsItems.length} news items ont des attributs`);
      
      // Extraire IOCs depuis les attributs Taranis (PRIORITAIRE)
      const nativeIOCs = this.extractIOCsFromAttributes(newsItems);
      console.log(`✅ ${nativeIOCs.length} IOCs extraits depuis attributs Taranis natifs`);
      
      // Fallback: Extraction regex si AUCUN IOC trouvé ou si peu d'IOCs
      let regexIOCs: IOC[] = [];
      if (this.config.regexFallback && nativeIOCs.length === 0) {
        console.log('🔄 Fallback: Aucun attribut IOC trouvé, activation extraction regex...');
        regexIOCs = await this.extractIOCsWithRegex(newsItems);
        console.log(`📊 ${regexIOCs.length} IOCs extraits via regex`);
      } else if (this.config.regexFallback && nativeIOCs.length < newsItems.length * 0.1) {
        console.log('🔄 Fallback: Peu d\'IOCs natifs, extraction regex complémentaire...');
        regexIOCs = await this.extractIOCsWithRegex(newsItems);
        console.log(`📊 ${regexIOCs.length} IOCs supplémentaires via regex`);
      }
      
      // Combiner et dédupliquer
      const allIOCs = [...nativeIOCs, ...regexIOCs];
      const uniqueIOCs = this.config.deduplication ? 
        this.deduplicateIOCs(allIOCs) : allIOCs;
      
      // Enrichissement optionnel
      const finalIOCs = this.config.enrichmentEnabled ? 
        await this.enrichIOCs(uniqueIOCs) : uniqueIOCs;
      
      // Calculer les statistiques
      const extractionMethod = regexIOCs.length > 0 ? 'hybrid' : 'native_attributes';
      const result = this.calculateExtractionResult(finalIOCs, newsItems, extractionMethod);
      
      // Mettre en cache
      (result as any).timestamp = Date.now();
      this.cache.set(cacheKey, result);
      
      console.log(`✅ Extraction terminée: ${result.totalExtracted} IOCs uniques`);
      console.log(`📊 Méthode: ${result.extractionMethod}`);
      console.log(`📈 Répartition: IP=${result.byType.ip}, Domain=${result.byType.domain}, Hash=${result.byType.hash}, URL=${result.byType.url}, Email=${result.byType.email}`);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur extraction IOCs:', error);
      return this.getEmptyResult('native_attributes');
    }
  }

  // ============ EXTRACTION DEPUIS ATTRIBUTS TARANIS (NATIF) ============

  /**
   * Extrait IOCs depuis les attributs Taranis natifs
   * C'EST LA MÉTHODE PRINCIPALE - Pas de regex, données directes de Taranis
   */
  private extractIOCsFromAttributes(newsItems: TaranisNewsItemWithIOCs[]): IOC[] {
    const iocs: IOC[] = [];
    
    for (const newsItem of newsItems) {
      if (!newsItem.attributes || newsItem.attributes.length === 0) {
        continue;
      }
      
      // Parcourir les attributs du news item
      for (const attribute of newsItem.attributes) {
        const attributeKey = attribute.key.toLowerCase().trim();
        const attributeValue = attribute.value.trim();
        
        // Vérifier si c'est un attribut IOC supporté
        if (!TARANIS_IOC_ATTRIBUTE_KEYS.includes(attributeKey)) {
          continue;
        }
        
        // Mapper vers type IOC normalisé
        const iocType = IOC_TYPE_MAPPING[attributeKey];
        if (!iocType) {
          continue; // Type non supporté (CVE, MITRE, etc.)
        }
        
        // Créer l'IOC depuis l'attribut Taranis
        const ioc = this.createIOCFromAttribute({
          type: iocType,
          value: attributeValue,
          source: newsItem.osint_source_id || 'Taranis',
          newsItemId: newsItem.id,
          firstSeen: new Date(newsItem.collected || newsItem.published),
          lastSeen: new Date(),
          attributeKey: attributeKey // Pour debug
        });
        
        // Filtrer par seuil de confiance
        if (ioc && ioc.confidence >= this.config.confidenceThreshold) {
          iocs.push(ioc);
        }
      }
    }
    
    return iocs;
  }

  /**
   * Crée un IOC depuis un attribut Taranis
   */
  private createIOCFromAttribute(data: {
    type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
    value: string;
    source: string;
    newsItemId: string;
    firstSeen: Date;
    lastSeen: Date;
    attributeKey?: string;
  }): IOC | null {
    // Validation basique
    if (!data.value || data.value.length < 3) {
      return null;
    }
    
    // Nettoyer la valeur
    const cleanValue = this.cleanIOCValue(data.value);
    if (!cleanValue) {
      return null;
    }
    
    // Valider selon le type
    if (!this.validateIOCValue(data.type, cleanValue)) {
      return null;
    }
    
    // Calculer confiance (attributs Taranis = haute confiance)
    const confidence = this.calculateAttributeConfidence(data.type, data.attributeKey);
    
    // Déterminer sévérité
    const severity = this.calculateSeverity(data.type, cleanValue);
    
    // Créer l'IOC
    const ioc: IOC = {
      id: `ioc-${data.newsItemId}-${data.type}-${this.hashString(cleanValue)}`,
      type: data.type,
      value: cleanValue,
      description: `IOC ${data.type} extrait depuis attribut Taranis (${data.attributeKey || data.type})`,
      confidence,
      severity,
      source: data.source,
      firstSeen: data.firstSeen,
      lastSeen: data.lastSeen,
      tags: [data.type, 'taranis-native', data.attributeKey || data.type],
      campaigns: [],
      verified: confidence > 0.85, // Haute confiance = auto-vérifié
      newsItemId: data.newsItemId
    };
    
    return ioc;
  }

  /**
   * Calcule la confiance pour un IOC depuis attribut Taranis
   * Les attributs Taranis ont une haute confiance car déjà structurés
   */
  private calculateAttributeConfidence(type: string, attributeKey?: string): number {
    // Attributs Taranis = haute confiance de base
    let confidence = 0.85;
    
    // Bonus pour clés spécifiques précises
    if (attributeKey) {
      const exactKeys = ['ipv4', 'ipv6', 'md5', 'sha1', 'sha256', 'fqdn'];
      if (exactKeys.includes(attributeKey)) {
        confidence = 0.95; // Très haute confiance
      }
    }
    
    // Ajustement par type
    switch (type) {
      case 'hash':
        confidence = Math.min(0.98, confidence + 0.05); // Hashes = très fiables
        break;
      case 'ip':
        confidence = Math.min(0.95, confidence + 0.03);
        break;
      case 'email':
        confidence = Math.min(0.90, confidence + 0.02);
        break;
    }
    
    return confidence;
  }

  // ============ UTILITAIRES ============

  /**
   * Récupère les news items avec leurs attributs depuis Taranis
   */
  private async fetchNewsItemsWithAttributes(
    limit: number,
    range?: string
  ): Promise<TaranisNewsItemWithIOCs[]> {
    try {
      // Appeler l'API Taranis pour récupérer les news items
      // NOTE: cybersecurity=true peut être trop strict si Taranis n'a pas encore tagué les items
      const newsItems = await this.taranisService.getNewsItems({
        limit,
        range
        // cybersecurity: true  // ⚠️ DÉSACTIVÉ TEMPORAIREMENT pour diagnostic
      });
      
      console.log(`📊 DEBUG: ${newsItems.length} news items reçus de Taranis (sans filtre cybersec)`);
      
      // Transformer vers notre format avec attributs
      return newsItems.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        content: item.content || '',
        collected: item.collected || new Date().toISOString(),
        published: item.published || new Date().toISOString(),
        osint_source_id: item.osint_source_id || item.source || 'unknown',
        hash: item.hash || '',
        attributes: item.attributes || [], // ATTRIBUTS TARANIS NATIFS
        review: item.review,
        author: item.author,
        link: item.link
      }));
    } catch (error) {
      console.error('❌ Erreur récupération news items:', error);
      return [];
    }
  }

  /**
   * Nettoie une valeur IOC
   */
  private cleanIOCValue(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[\[\](){}<>]/g, '') // Retirer brackets
      .replace(/^hxxp/i, 'http') // Défang URL
      .replace(/\[dot\]/gi, '.') // Défang domain
      .replace(/\[@\]/gi, '@'); // Défang email
  }

  /**
   * Valide une valeur IOC selon son type
   */
  private validateIOCValue(type: string, value: string): boolean {
    switch (type) {
      case 'ip':
        return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) || 
               /^(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(value);
      case 'domain':
        return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(value);
      case 'hash':
        return /^[a-f0-9]{32,64}$/.test(value);
      case 'url':
        return value.startsWith('http://') || value.startsWith('https://');
      case 'email':
        return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value);
      default:
        return true;
    }
  }

  /**
   * Calcule la sévérité d'un IOC
   */
  private calculateSeverity(type: string, value: string): 'low' | 'medium' | 'high' | 'critical' {
    // Heuristiques simples - à améliorer avec threat intelligence
    if (type === 'hash') {
      return 'high'; // Malware probable
    }
    
    if (type === 'ip') {
      // IPs suspectes (Tor, VPN, etc.)
      const suspiciousRanges = ['185.', '45.', '91.'];
      if (suspiciousRanges.some(range => value.startsWith(range))) {
        return 'high';
      }
      return 'medium';
    }
    
    if (type === 'domain') {
      // Domaines suspects
      if (value.includes('malicious') || value.includes('phish') || value.includes('c2')) {
        return 'critical';
      }
      return 'medium';
    }
    
    return 'medium';
  }

  /**
   * Déduplique les IOCs
   */
  private deduplicateIOCs(iocs: IOC[]): IOC[] {
    const seen = new Map<string, IOC>();
    
    for (const ioc of iocs) {
      const key = `${ioc.type}-${ioc.value}`;
      
      if (!seen.has(key)) {
        seen.set(key, ioc);
      } else {
        // Garder celui avec la plus haute confiance
        const existing = seen.get(key)!;
        if (ioc.confidence > existing.confidence) {
          seen.set(key, ioc);
        }
      }
    }
    
    return Array.from(seen.values());
  }

  /**
   * Enrichit les IOCs (optionnel)
   */
  private async enrichIOCs(iocs: IOC[]): Promise<IOC[]> {
    // TODO: Enrichissement avec threat intelligence externe
    // Pour l'instant, retourne tel quel
    return iocs;
  }

  /**
   * Extraction regex (FALLBACK uniquement)
   */
  private async extractIOCsWithRegex(newsItems: TaranisNewsItemWithIOCs[]): Promise<IOC[]> {
    // Importer le service regex existant si nécessaire
    // Pour l'instant, retourne vide (attributs Taranis suffisent)
    return [];
  }

  /**
   * Calcule le résultat d'extraction
   */
  private calculateExtractionResult(
    iocs: IOC[],
    newsItems: TaranisNewsItemWithIOCs[],
    method: 'native_attributes' | 'regex_fallback' | 'hybrid'
  ): IOCExtractionResult {
    const byType = {
      ip: iocs.filter(i => i.type === 'ip').length,
      domain: iocs.filter(i => i.type === 'domain').length,
      hash: iocs.filter(i => i.type === 'hash').length,
      url: iocs.filter(i => i.type === 'url').length,
      email: iocs.filter(i => i.type === 'email').length
    };
    
    const confidence = {
      high: iocs.filter(i => i.confidence >= 0.8).length,
      medium: iocs.filter(i => i.confidence >= 0.6 && i.confidence < 0.8).length,
      low: iocs.filter(i => i.confidence < 0.6).length
    };
    
    const sources = Array.from(new Set(newsItems.map(n => n.osint_source_id)));
    
    return {
      iocs,
      totalExtracted: iocs.length,
      byType,
      confidence,
      sources,
      extractionMethod: method
    };
  }

  /**
   * Résultat vide
   */
  private getEmptyResult(method: 'native_attributes' | 'regex_fallback' | 'hybrid'): IOCExtractionResult {
    return {
      iocs: [],
      totalExtracted: 0,
      byType: { ip: 0, domain: 0, hash: 0, url: 0, email: 0 },
      confidence: { high: 0, medium: 0, low: 0 },
      sources: [],
      extractionMethod: method
    };
  }

  /**
   * Hash simple pour IDs
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// ============ SINGLETON ============

let instance: TaranisIOCMapperService | null = null;

export function getTaranisIOCMapperService(config?: Partial<TaranisIOCMapperConfig>): TaranisIOCMapperService {
  if (!instance) {
    instance = new TaranisIOCMapperService(config);
  }
  return instance;
}

export function resetTaranisIOCMapperService(): void {
  instance = null;
}

