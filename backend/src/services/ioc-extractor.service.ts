/**
 * 🔍 IOC EXTRACTOR
 * Extrait intelligemment les IOCs (Indicators of Compromise) depuis n'importe quel texte
 * Supporte: IPs, Domains, URLs, Hashes, Emails, etc.
 */

import { logger } from '../utils/logger';

export interface ExtractedIOC {
  type: 'IP' | 'DOMAIN' | 'URL' | 'FILE_HASH' | 'EMAIL' | 'CVE' | 'BITCOIN' | 'OTHER';
  value: string;
  context?: string; // Texte autour de l'IOC
  confidence: number; // 0-100
}

export class IOCExtractor {
  /**
   * Extraire tous les IOCs depuis un threat normalisé
   */
  static async extract(threat: any): Promise<ExtractedIOC[]> {
    const allText = this.extractAllText(threat);
    
    logger.debug('Extracting IOCs from text', {
      source: threat.source,
      textLength: allText.length
    });
    
    const iocs: ExtractedIOC[] = [];
    
    // Extraire chaque type d'IOC
    iocs.push(...this.extractIPs(allText));
    iocs.push(...this.extractDomains(allText));
    iocs.push(...this.extractURLs(allText));
    iocs.push(...this.extractHashes(allText));
    iocs.push(...this.extractEmails(allText));
    iocs.push(...this.extractCVEs(allText));
    iocs.push(...this.extractBitcoinAddresses(allText));
    
    // Dédupliquer
    const unique = this.deduplicateIOCs(iocs);
    
    // Filtrer faux positifs
    const validated = this.filterFalsePositives(unique);
    
    logger.info(`Extracted ${validated.length} IOCs`, {
      source: threat.source,
      breakdown: this.getBreakdown(validated)
    });
    
    return validated;
  }
  
  /**
   * Extraire tout le texte pertinent
   */
  private static extractAllText(threat: any): string {
    const parts = [
      threat.title,
      threat.description,
      JSON.stringify(threat.rawData)
    ].filter(Boolean);
    
    return parts.join('\n');
  }
  
  /**
   * Extraire IPs (IPv4)
   */
  private static extractIPs(text: string): ExtractedIOC[] {
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const matches = text.match(ipRegex) || [];
    
    return matches
      .filter(ip => this.isValidIP(ip))
      .map(ip => ({
        type: 'IP' as const,
        value: ip,
        confidence: 90
      }));
  }
  
  /**
   * Extraire domaines
   */
  private static extractDomains(text: string): ExtractedIOC[] {
    // Pattern plus strict pour éviter faux positifs
    const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
    const matches = text.match(domainRegex) || [];
    
    return matches
      .map(domain => domain.toLowerCase())
      .filter(domain => this.isValidDomain(domain))
      .map(domain => ({
        type: 'DOMAIN' as const,
        value: domain,
        confidence: 85
      }));
  }
  
  /**
   * Extraire URLs
   */
  private static extractURLs(text: string): ExtractedIOC[] {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
    const matches = text.match(urlRegex) || [];
    
    return matches.map(url => ({
      type: 'URL' as const,
      value: url,
      confidence: 95
    }));
  }
  
  /**
   * Extraire hashes (MD5, SHA1, SHA256)
   */
  private static extractHashes(text: string): ExtractedIOC[] {
    const hashes: ExtractedIOC[] = [];
    
    // MD5 (32 hex chars)
    const md5Regex = /\b[a-f0-9]{32}\b/gi;
    const md5Matches = text.match(md5Regex) || [];
    hashes.push(...md5Matches.map(hash => ({
      type: 'FILE_HASH' as const,
      value: hash.toLowerCase(),
      confidence: 90
    })));
    
    // SHA1 (40 hex chars)
    const sha1Regex = /\b[a-f0-9]{40}\b/gi;
    const sha1Matches = text.match(sha1Regex) || [];
    hashes.push(...sha1Matches.map(hash => ({
      type: 'FILE_HASH' as const,
      value: hash.toLowerCase(),
      confidence: 90
    })));
    
    // SHA256 (64 hex chars)
    const sha256Regex = /\b[a-f0-9]{64}\b/gi;
    const sha256Matches = text.match(sha256Regex) || [];
    hashes.push(...sha256Matches.map(hash => ({
      type: 'FILE_HASH' as const,
      value: hash.toLowerCase(),
      confidence: 95
    })));
    
    return hashes;
  }
  
  /**
   * Extraire emails
   */
  private static extractEmails(text: string): ExtractedIOC[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = text.match(emailRegex) || [];
    
    return matches
      .map(email => email.toLowerCase())
      .filter(email => this.isValidEmail(email))
      .map(email => ({
        type: 'EMAIL' as const,
        value: email,
        confidence: 80
      }));
  }
  
  /**
   * Extraire CVEs
   */
  private static extractCVEs(text: string): ExtractedIOC[] {
    const cveRegex = /CVE-\d{4}-\d{4,}/gi;
    const matches = text.match(cveRegex) || [];
    
    return matches.map(cve => ({
      type: 'CVE' as const,
      value: cve.toUpperCase(),
      confidence: 100
    }));
  }
  
  /**
   * Extraire adresses Bitcoin
   */
  private static extractBitcoinAddresses(text: string): ExtractedIOC[] {
    // Bitcoin addresses (simplified)
    const btcRegex = /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g;
    const matches = text.match(btcRegex) || [];
    
    return matches.map(btc => ({
      type: 'BITCOIN' as const,
      value: btc,
      confidence: 85
    }));
  }
  
  /**
   * Valider IP
   */
  private static isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    // Vérifier chaque octet
    for (const part of parts) {
      const num = parseInt(part);
      if (isNaN(num) || num < 0 || num > 255) return false;
    }
    
    // Filtrer IPs privées et réservées
    const firstOctet = parseInt(parts[0]);
    if (firstOctet === 0 || firstOctet === 10 || firstOctet === 127) return false;
    if (firstOctet === 172 && parseInt(parts[1]) >= 16 && parseInt(parts[1]) <= 31) return false;
    if (firstOctet === 192 && parseInt(parts[1]) === 168) return false;
    
    return true;
  }
  
  /**
   * Valider domaine
   */
  private static isValidDomain(domain: string): boolean {
    // Filtrer domaines communs (faux positifs)
    const blacklist = [
      'example.com',
      'localhost.localdomain',
      'test.com',
      'example.org',
      'domain.com',
      'your-domain.com',
      'yourdomain.com'
    ];
    
    if (blacklist.includes(domain)) return false;
    
    // Filtrer extensions suspectes (souvent faux positifs)
    const suspiciousExtensions = ['.local', '.internal', '.test', '.invalid'];
    if (suspiciousExtensions.some(ext => domain.endsWith(ext))) return false;
    
    // Doit avoir au moins 1 point
    if (!domain.includes('.')) return false;
    
    // TLD doit avoir au moins 2 chars
    const tld = domain.split('.').pop();
    if (!tld || tld.length < 2) return false;
    
    return true;
  }
  
  /**
   * Valider email
   */
  private static isValidEmail(email: string): boolean {
    // Basique: doit avoir @ et domaine valide
    const [, domain] = email.split('@');
    return domain ? this.isValidDomain(domain) : false;
  }
  
  /**
   * Dédupliquer IOCs
   */
  private static deduplicateIOCs(iocs: ExtractedIOC[]): ExtractedIOC[] {
    const seen = new Set<string>();
    const unique: ExtractedIOC[] = [];
    
    for (const ioc of iocs) {
      const key = `${ioc.type}:${ioc.value}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(ioc);
      }
    }
    
    return unique;
  }
  
  /**
   * Filtrer faux positifs
   */
  private static filterFalsePositives(iocs: ExtractedIOC[]): ExtractedIOC[] {
    return iocs.filter(ioc => {
      // Filtrer IPs de documentation
      if (ioc.type === 'IP') {
        const docIPs = ['192.0.2.', '198.51.100.', '203.0.113.']; // RFC 5737
        if (docIPs.some(prefix => ioc.value.startsWith(prefix))) return false;
      }
      
      // Filtrer domaines trop courts
      if (ioc.type === 'DOMAIN' && ioc.value.length < 4) return false;
      
      // Filtrer hashes trop communs (00000..., ffffff...)
      if (ioc.type === 'FILE_HASH') {
        if (/^0+$/.test(ioc.value)) return false;
        if (/^f+$/.test(ioc.value)) return false;
      }
      
      return true;
    });
  }
  
  /**
   * Obtenir breakdown par type
   */
  private static getBreakdown(iocs: ExtractedIOC[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    for (const ioc of iocs) {
      breakdown[ioc.type] = (breakdown[ioc.type] || 0) + 1;
    }
    
    return breakdown;
  }
  
  /**
   * Extraire avec contexte (pour analyse ultérieure)
   */
  static extractWithContext(text: string, windowSize: number = 50): ExtractedIOC[] {
    // TODO: Implémenter extraction avec contexte
    // Utile pour ML/NLP plus tard
    return [];
  }
}

