/**
 * Service d'Extraction d'IOCs
 * Remplace les données mockées par l'extraction réelle depuis les news items Taranis
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';
import { getBotService } from './bot-service';

// ============ TYPES & INTERFACES ============

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
}

export interface IOCExtractorConfig {
  enabled: boolean;
  confidenceThreshold: number;
  extractFromContent: boolean;
  extractFromAttributes: boolean;
  extractFromTags: boolean;
  autoVerify: boolean;
  enrichmentEnabled: boolean;
}

// ============ REGEX PATTERNS ============

const IOC_PATTERNS = {
  // IPv4 addresses
  ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  
  // IPv6 addresses (simplified)
  ipv6: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
  
  // Domains
  domain: /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g,
  
  // File hashes (MD5, SHA1, SHA256)
  hash: /\b(?:[a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})\b/g,
  
  // URLs
  url: /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/gi,
  
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // File paths (Windows/Unix)
  filepath: /(?:[A-Za-z]:)?(?:\\|\/)[\w\\\/\s.-]+\.(?:exe|dll|bat|cmd|scr|com|pif|vbs|js|jar|py|sh|pl|rb|php|asp|aspx|jsp)/gi,
  
  // Registry keys
  registry: /HKEY_[A-Z_]+\\[\\\w\s.-]+/gi,
  
  // CVE identifiers
  cve: /CVE-\d{4}-\d{4,}/gi,
  
  // MITRE ATT&CK techniques
  mitre: /T\d{4}(?:\.\d{3})?/gi
};

// ============ SERVICE PRINCIPAL ============

export class IOCExtractorService {
  private taranisService = getTaranisService();
  private botService = getBotService();
  private config: IOCExtractorConfig;
  private cache = new Map<string, IOC[]>();
  private cacheExpiry = 10 * 60 * 1000; // 10 minutes

  constructor(config?: Partial<IOCExtractorConfig>) {
    this.config = {
      enabled: true,
      confidenceThreshold: 0.7,
      extractFromContent: true,
      extractFromAttributes: true,
      extractFromTags: true,
      autoVerify: false,
      enrichmentEnabled: true,
      ...config
    };
  }

  // ============ EXTRACTION PRINCIPALE ============

  /**
   * Extrait les IOCs depuis les news items Taranis
   */
  async extractIOCsFromNewsItems(limit: number = 100, range: string = '7d'): Promise<IOCExtractionResult> {
    try {
      console.log(`🔍 Extraction d'IOCs depuis ${limit} news items (${range})...`);
      
      // Récupérer les news items depuis Taranis
      const newsItems = await this.taranisService.getNewsItems(limit, { range });
      
      if (!newsItems || newsItems.length === 0) {
        console.log('⚠️ Aucun news item trouvé pour l\'extraction d\'IOCs');
        return this.getEmptyResult();
      }

      console.log(`📰 ${newsItems.length} news items récupérés`);
      
      // Extraire les IOCs de chaque news item
      const allIOCs: IOC[] = [];
      const sources = new Set<string>();
      
      for (const newsItem of newsItems) {
        const iocs = await this.extractIOCsFromNewsItem(newsItem);
        allIOCs.push(...iocs);
        sources.add(newsItem.source || 'Unknown');
      }

      // Dédupliquer et enrichir
      const uniqueIOCs = this.deduplicateIOCs(allIOCs);
      const enrichedIOCs = this.config.enrichmentEnabled ? 
        await this.enrichIOCs(uniqueIOCs) : uniqueIOCs;

      // Calculer les statistiques
      const result = this.calculateExtractionResult(enrichedIOCs, sources);
      
      console.log(`✅ Extraction terminée: ${result.totalExtracted} IOCs uniques extraits`);
      console.log(`📊 Répartition: ${result.byType.ip} IPs, ${result.byType.domain} domains, ${result.byType.hash} hashes, ${result.byType.url} URLs, ${result.byType.email} emails`);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction d\'IOCs:', error);
      return this.getEmptyResult();
    }
  }

  /**
   * Extrait les IOCs d'un news item spécifique
   */
  async extractIOCsFromNewsItem(newsItem: any): Promise<IOC[]> {
    const iocs: IOC[] = [];
    const content = this.getNewsItemContent(newsItem);
    
    if (!content) return iocs;

    // Extraire chaque type d'IOC
    const extractedIOCs = {
      ip: this.extractIPs(content),
      domain: this.extractDomains(content),
      hash: this.extractHashes(content),
      url: this.extractURLs(content),
      email: this.extractEmails(content)
    };

    // Convertir en format IOC
    for (const [type, values] of Object.entries(extractedIOCs)) {
      for (const value of values) {
        const ioc = this.createIOC({
          type: type as any,
          value,
          source: newsItem.source || 'Unknown',
          newsItemId: newsItem.id,
          storyId: newsItem.story_id,
          confidence: this.calculateConfidence(type as any, value, content),
          severity: this.calculateSeverity(type as any, value),
          tags: this.extractTagsFromContent(content, value),
          firstSeen: new Date(newsItem.collected || newsItem.published),
          lastSeen: new Date()
        });
        
        if (ioc.confidence >= this.config.confidenceThreshold) {
          iocs.push(ioc);
        }
      }
    }

    return iocs;
  }

  // ============ EXTRACTION PAR TYPE ============

  /**
   * Extrait les adresses IP
   */
  private extractIPs(content: string): string[] {
    const ips = new Set<string>();
    
    // IPv4
    const ipv4Matches = content.match(IOC_PATTERNS.ip) || [];
    ipv4Matches.forEach(ip => {
      // Filtrer les IPs privées/localhost si nécessaire
      if (!this.isPrivateIP(ip)) {
        ips.add(ip);
      }
    });
    
    // IPv6
    const ipv6Matches = content.match(IOC_PATTERNS.ipv6) || [];
    ipv6Matches.forEach(ip => ips.add(ip));
    
    return Array.from(ips);
  }

  /**
   * Extrait les domaines
   */
  private extractDomains(content: string): string[] {
    const domains = new Set<string>();
    const matches = content.match(IOC_PATTERNS.domain) || [];
    
    matches.forEach(domain => {
      // Filtrer les domaines communs/innocents
      if (!this.isCommonDomain(domain)) {
        domains.add(domain.toLowerCase());
      }
    });
    
    return Array.from(domains);
  }

  /**
   * Extrait les hashes de fichiers
   */
  private extractHashes(content: string): string[] {
    const hashes = new Set<string>();
    const matches = content.match(IOC_PATTERNS.hash) || [];
    
    matches.forEach(hash => {
      // Valider la longueur du hash
      if (hash.length === 32 || hash.length === 40 || hash.length === 64) {
        hashes.add(hash.toLowerCase());
      }
    });
    
    return Array.from(hashes);
  }

  /**
   * Extrait les URLs
   */
  private extractURLs(content: string): string[] {
    const urls = new Set<string>();
    const matches = content.match(IOC_PATTERNS.url) || [];
    
    matches.forEach(url => {
      // Filtrer les URLs suspectes
      if (this.isSuspiciousURL(url)) {
        urls.add(url);
      }
    });
    
    return Array.from(urls);
  }

  /**
   * Extrait les adresses email
   */
  private extractEmails(content: string): string[] {
    const emails = new Set<string>();
    const matches = content.match(IOC_PATTERNS.email) || [];
    
    matches.forEach(email => {
      // Filtrer les emails suspects
      if (this.isSuspiciousEmail(email)) {
        emails.add(email.toLowerCase());
      }
    });
    
    return Array.from(emails);
  }

  // ============ CALCULS DE CONFIDENCE & SÉVÉRITÉ ============

  /**
   * Calcule le niveau de confiance d'un IOC
   */
  private calculateConfidence(type: string, value: string, context: string): number {
    let confidence = 0.5; // Base
    
    // Facteurs de confiance par type
    switch (type) {
      case 'ip':
        confidence += this.isPublicIP(value) ? 0.3 : 0.1;
        confidence += this.hasMaliciousContext(context, value) ? 0.2 : 0;
        break;
        
      case 'domain':
        confidence += this.isSuspiciousDomain(value) ? 0.4 : 0.1;
        confidence += this.hasMaliciousContext(context, value) ? 0.2 : 0;
        break;
        
      case 'hash':
        confidence += 0.4; // Les hashes sont généralement fiables
        confidence += this.hasMaliciousContext(context, value) ? 0.2 : 0;
        break;
        
      case 'url':
        confidence += this.isSuspiciousURL(value) ? 0.4 : 0.1;
        confidence += this.hasMaliciousContext(context, value) ? 0.2 : 0;
        break;
        
      case 'email':
        confidence += this.isSuspiciousEmail(value) ? 0.3 : 0.1;
        confidence += this.hasMaliciousContext(context, value) ? 0.2 : 0;
        break;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Calcule le niveau de sévérité d'un IOC
   */
  private calculateSeverity(type: string, value: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case 'hash':
        return 'high'; // Les hashes sont généralement critiques
      case 'ip':
        return this.isPublicIP(value) ? 'medium' : 'low';
      case 'domain':
        return this.isSuspiciousDomain(value) ? 'high' : 'medium';
      case 'url':
        return this.isSuspiciousURL(value) ? 'high' : 'medium';
      case 'email':
        return this.isSuspiciousEmail(value) ? 'medium' : 'low';
      default:
        return 'medium';
    }
  }

  // ============ MÉTHODES UTILITAIRES ============

  /**
   * Récupère le contenu d'un news item
   */
  private getNewsItemContent(newsItem: any): string {
    let content = '';
    
    if (this.config.extractFromContent && newsItem.content) {
      content += newsItem.content + ' ';
    }
    
    if (this.config.extractFromAttributes && newsItem.attributes) {
      newsItem.attributes.forEach((attr: any) => {
        if (attr.value) {
          content += attr.value + ' ';
        }
      });
    }
    
    if (this.config.extractFromTags && newsItem.tags) {
      newsItem.tags.forEach((tag: any) => {
        if (tag.name) {
          content += tag.name + ' ';
        }
      });
    }
    
    return content.trim();
  }

  /**
   * Crée un objet IOC
   */
  private createIOC(data: {
    type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
    value: string;
    source: string;
    newsItemId?: string;
    storyId?: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    firstSeen: Date;
    lastSeen: Date;
  }): IOC {
    return {
      id: `${data.type}_${data.value}_${Date.now()}`,
      type: data.type,
      value: data.value,
      description: this.generateDescription(data.type, data.value),
      confidence: data.confidence,
      severity: data.severity,
      source: data.source,
      firstSeen: data.firstSeen,
      lastSeen: data.lastSeen,
      tags: data.tags,
      campaigns: [],
      verified: this.config.autoVerify,
      newsItemId: data.newsItemId,
      storyId: data.storyId
    };
  }

  /**
   * Génère une description pour un IOC
   */
  private generateDescription(type: string, value: string): string {
    switch (type) {
      case 'ip':
        return `Adresse IP suspecte: ${value}`;
      case 'domain':
        return `Domaine malveillant: ${value}`;
      case 'hash':
        return `Hash de fichier malveillant: ${value}`;
      case 'url':
        return `URL suspecte: ${value}`;
      case 'email':
        return `Adresse email suspecte: ${value}`;
      default:
        return `IOC de type ${type}: ${value}`;
    }
  }

  /**
   * Déduplique les IOCs
   */
  private deduplicateIOCs(iocs: IOC[]): IOC[] {
    const seen = new Map<string, IOC>();
    
    iocs.forEach(ioc => {
      const key = `${ioc.type}:${ioc.value}`;
      const existing = seen.get(key);
      
      if (!existing || ioc.confidence > existing.confidence) {
        seen.set(key, ioc);
      }
    });
    
    return Array.from(seen.values());
  }

  /**
   * Enrichit les IOCs avec des données externes
   */
  private async enrichIOCs(iocs: IOC[]): Promise<IOC[]> {
    // TODO: Intégrer avec VirusTotal, AbuseIPDB, etc.
    console.log(`🔍 Enrichissement de ${iocs.length} IOCs...`);
    return iocs;
  }

  /**
   * Calcule les statistiques d'extraction
   */
  private calculateExtractionResult(iocs: IOC[], sources: Set<string>): IOCExtractionResult {
    const byType = {
      ip: iocs.filter(ioc => ioc.type === 'ip').length,
      domain: iocs.filter(ioc => ioc.type === 'domain').length,
      hash: iocs.filter(ioc => ioc.type === 'hash').length,
      url: iocs.filter(ioc => ioc.type === 'url').length,
      email: iocs.filter(ioc => ioc.type === 'email').length
    };

    const confidence = {
      high: iocs.filter(ioc => ioc.confidence >= 0.8).length,
      medium: iocs.filter(ioc => ioc.confidence >= 0.6 && ioc.confidence < 0.8).length,
      low: iocs.filter(ioc => ioc.confidence < 0.6).length
    };

    return {
      iocs,
      totalExtracted: iocs.length,
      byType,
      confidence,
      sources: Array.from(sources)
    };
  }

  // ============ MÉTHODES DE VALIDATION ============

  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./
    ];
    
    return privateRanges.some(range => range.test(ip));
  }

  private isPublicIP(ip: string): boolean {
    return !this.isPrivateIP(ip);
  }

  private isCommonDomain(domain: string): boolean {
    const commonDomains = [
      'google.com', 'facebook.com', 'twitter.com', 'linkedin.com',
      'youtube.com', 'amazon.com', 'microsoft.com', 'apple.com',
      'github.com', 'stackoverflow.com', 'wikipedia.org'
    ];
    
    return commonDomains.some(common => domain.includes(common));
  }

  private isSuspiciousDomain(domain: string): boolean {
    const suspiciousPatterns = [
      /bit\.ly|tinyurl|t\.co|goo\.gl|short\.link/i,
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP-like domains
      /[a-z0-9]{20,}\.com/i, // Long random domains
      /malware|virus|trojan|backdoor|keylogger/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(domain));
  }

  private isSuspiciousURL(url: string): boolean {
    const suspiciousPatterns = [
      /\.exe$|\.dll$|\.bat$|\.cmd$|\.scr$/i,
      /malware|virus|trojan|backdoor|keylogger/i,
      /bit\.ly|tinyurl|t\.co|goo\.gl|short\.link/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  private isSuspiciousEmail(email: string): boolean {
    const suspiciousPatterns = [
      /noreply|no-reply|donotreply/i,
      /[0-9]{10,}@/, // Numbers in username
      /temp|fake|test|spam/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(email));
  }

  private hasMaliciousContext(context: string, value: string): boolean {
    const maliciousKeywords = [
      'malware', 'virus', 'trojan', 'backdoor', 'keylogger',
      'ransomware', 'phishing', 'spam', 'botnet', 'c2',
      'command and control', 'exploit', 'vulnerability',
      'attack', 'breach', 'compromise', 'infected'
    ];
    
    const contextLower = context.toLowerCase();
    return maliciousKeywords.some(keyword => contextLower.includes(keyword));
  }

  private extractTagsFromContent(content: string, value: string): string[] {
    const tags: string[] = [];
    const contentLower = content.toLowerCase();
    
    // Tags basés sur le contexte
    if (contentLower.includes('malware')) tags.push('malware');
    if (contentLower.includes('phishing')) tags.push('phishing');
    if (contentLower.includes('ransomware')) tags.push('ransomware');
    if (contentLower.includes('apt')) tags.push('apt');
    if (contentLower.includes('c2')) tags.push('c2');
    if (contentLower.includes('botnet')) tags.push('botnet');
    
    return tags;
  }

  private getEmptyResult(): IOCExtractionResult {
    return {
      iocs: [],
      totalExtracted: 0,
      byType: { ip: 0, domain: 0, hash: 0, url: 0, email: 0 },
      confidence: { high: 0, medium: 0, low: 0 },
      sources: []
    };
  }

  // ============ MÉTHODES PUBLIQUES ============

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<IOCExtractorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.cache.clear(); // Invalider le cache
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): IOCExtractorConfig {
    return { ...this.config };
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ============ INSTANCE SINGLETON ============

let iocExtractorInstance: IOCExtractorService | null = null;

export function getIOCExtractorService(): IOCExtractorService {
  if (!iocExtractorInstance) {
    iocExtractorInstance = new IOCExtractorService();
  }
  return iocExtractorInstance;
}
