import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface IOCEnrichmentData {
  iocValue: string;
  iocType: 'IP' | 'DOMAIN' | 'URL' | 'FILE_HASH' | 'EMAIL' | 'CVE';
  source?: string;
}

export class IOCEnrichmentService {
  /**
   * Enrichir un IOC avec des données de threat intelligence
   */
  static async enrichIOC(tenantId: string, data: IOCEnrichmentData) {
    try {
      const { iocValue, iocType, source } = data;

      // Vérifier si l'IOC est déjà en cache
      const cached = await this.getCachedEnrichment(tenantId, iocValue, iocType);
      if (cached && this.isCacheValid(cached.observedAt)) {
        logger.info(`IOC enrichment from cache: ${iocValue}`);
        return cached;
      }

      // Enrichir depuis les sources externes
      const enrichmentData = await this.fetchEnrichmentData(iocValue, iocType);

      // Sauvegarder dans IOCHistory
      const enriched = await prisma.iOCHistory.create({
        data: {
          tenantId,
          iocValue,
          iocType,
          enrichmentData,
          threatScore: enrichmentData.threatScore || 0,
          reputation: enrichmentData.reputation || 'unknown',
          source
        }
      });

      logger.info(`IOC enriched: ${iocValue}`);

      // Enregistrer snapshot historique (async, ne pas bloquer)
      this.recordHistoricalSnapshot(enriched).catch(err => 
        logger.warn('Failed to record historical snapshot:', err)
      );

      return enriched;
    } catch (error) {
      logger.error('Erreur enrichissement IOC:', error);
      throw error;
    }
  }

  /**
   * Enregistrer snapshot historique
   */
  private static async recordHistoricalSnapshot(ioc: any): Promise<void> {
    try {
      const { IOCHistoryService } = await import('./ioc-history.service');
      await IOCHistoryService.recordSnapshot(ioc);
    } catch (error) {
      // Silently fail - ne pas bloquer l'enrichissement
    }
  }

  /**
   * Récupérer un IOC enrichi depuis le cache
   */
  private static async getCachedEnrichment(tenantId: string, iocValue: string, iocType: string) {
    try {
      return await prisma.iOCHistory.findFirst({
        where: {
          tenantId,
          iocValue,
          iocType
        },
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Vérifier si le cache est encore valide (24h)
   */
  private static isCacheValid(lastEnriched: Date): boolean {
    const now = new Date();
    const diff = now.getTime() - lastEnriched.getTime();
    const hours = diff / 1000 / 60 / 60;
    return hours < 24; // Cache valide pendant 24h
  }

  /**
   * Récupérer les données d'enrichissement depuis les sources externes
   */
  private static async fetchEnrichmentData(iocValue: string, iocType: string): Promise<any> {
    try {
      const enrichmentData: any = {
        ioc: iocValue,
        type: iocType,
        timestamp: new Date().toISOString(),
        sources: [],
      };

      // Enrichir selon le type d'IOC
      switch (iocType) {
        case 'IP':
          enrichmentData.ipData = await this.enrichIP(iocValue);
          break;
        case 'DOMAIN':
          enrichmentData.domainData = await this.enrichDomain(iocValue);
          break;
        case 'FILE_HASH':
          enrichmentData.fileData = await this.enrichFileHash(iocValue);
          break;
        case 'URL':
          enrichmentData.urlData = await this.enrichURL(iocValue);
          break;
        case 'CVE':
          enrichmentData.cveData = await this.enrichCVE(iocValue);
          break;
        case 'EMAIL':
          enrichmentData.emailData = await this.enrichEmail(iocValue);
          break;
      }

      // Calculer scores avancés
      const { ThreatScoringService } = await import('./threat-scoring.service');
      enrichmentData.threatScore = ThreatScoringService.calculateThreatScore(
        { iocValue, iocType }, 
        enrichmentData
      );
      enrichmentData.confidence = ThreatScoringService.calculateConfidence(enrichmentData);
      enrichmentData.reputation = ThreatScoringService.determineReputation(
        enrichmentData.threatScore, 
        enrichmentData.confidence
      );
      enrichmentData.priority = ThreatScoringService.calculatePriority(
        enrichmentData.threatScore,
        enrichmentData.confidence
      );
      enrichmentData.recommendations = ThreatScoringService.generateRecommendations(
        iocType,
        enrichmentData.threatScore,
        enrichmentData
      );

      return enrichmentData;
    } catch (error) {
      logger.error('Erreur récupération données enrichissement:', error);
      // Retourner des données minimales en cas d'erreur
      return {
        ioc: iocValue,
        type: iocType,
        timestamp: new Date().toISOString(),
        error: 'Enrichment failed',
        sources: [],
      };
    }
  }

  /**
   * Enrichir une adresse IP (via AbuseIPDB, IPInfo, etc.)
   */
  private static async enrichIP(ip: string): Promise<any> {
    try {
      const data: any = {
        ip,
        reputation: 'unknown',
        country: 'Unknown',
        asn: 'Unknown',
        isp: 'Unknown',
        isVPN: false,
        isProxy: false,
        isTor: false,
        threatScore: 0,
        lastSeen: null,
        reports: [],
        sources: []
      };

      // Détecter les IPs privées (pas besoin d'API)
      if (this.isPrivateIP(ip)) {
        data.reputation = 'safe';
        data.threatScore = 0;
        data.country = 'Private Network';
        return data;
      }

      // Paralléliser les appels APIs
      const [abuseData, ipInfoData] = await Promise.allSettled([
        this.checkAbuseIPDB(ip),
        this.checkIPInfo(ip)
      ]);

      // Fusionner données AbuseIPDB
      if (abuseData.status === 'fulfilled' && abuseData.value) {
        Object.assign(data, abuseData.value);
        data.sources.push('AbuseIPDB');
      }

      // Fusionner données IPInfo
      if (ipInfoData.status === 'fulfilled' && ipInfoData.value) {
        Object.assign(data, ipInfoData.value);
        data.sources.push('IPInfo');
      }

      // Déterminer réputation finale
      if (data.threatScore >= 80) {
        data.reputation = 'malicious';
      } else if (data.threatScore >= 50) {
        data.reputation = 'suspicious';
      } else if (data.threatScore > 0) {
        data.reputation = 'potentially_harmful';
      } else {
        data.reputation = 'safe';
      }

      return data;
    } catch (error) {
      logger.error('Erreur enrichissement IP:', error);
      return { ip, error: 'Enrichment failed' };
    }
  }

  /**
   * Vérifier IP via AbuseIPDB
   */
  private static async checkAbuseIPDB(ip: string): Promise<any> {
    try {
      const apiKey = process.env.ABUSEIPDB_API_KEY;
      if (!apiKey) {
        logger.warn('AbuseIPDB API key not configured');
        return null;
      }

      const axios = require('axios');
      const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
        headers: {
          'Key': apiKey,
          'Accept': 'application/json'
        },
        params: {
          ipAddress: ip,
          maxAgeInDays: 90,
          verbose: true
        },
        timeout: 5000
      });

      const result = response.data.data;
      
      return {
        threatScore: result.abuseConfidenceScore || 0,
        totalReports: result.totalReports || 0,
        lastReportedAt: result.lastReportedAt,
        usageType: result.usageType,
        isp: result.isp,
        domain: result.domain,
        country: result.countryCode,
        isWhitelisted: result.isWhitelisted || false,
        isTor: result.isTor || false,
        reports: result.reports?.slice(0, 5) || [] // Limiter à 5 derniers reports
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        logger.warn('AbuseIPDB rate limit atteint');
      } else {
        logger.error('Erreur AbuseIPDB:', error.message);
      }
      return null;
    }
  }

  /**
   * Vérifier IP via IPInfo
   */
  private static async checkIPInfo(ip: string): Promise<any> {
    try {
      const token = process.env.IPINFO_TOKEN;
      if (!token) {
        logger.warn('IPInfo token not configured');
        return null;
      }

      const axios = require('axios');
      const response = await axios.get(`https://ipinfo.io/${ip}`, {
        params: { token },
        timeout: 5000
      });

      const data = response.data;

      return {
        country: data.country,
        city: data.city,
        region: data.region,
        location: data.loc, // "lat,long"
        timezone: data.timezone,
        asn: data.org?.split(' ')[0], // "AS15169 Google LLC" -> "AS15169"
        isp: data.org,
        isProxy: data.privacy?.proxy || false,
        isVPN: data.privacy?.vpn || false,
        isHosting: data.privacy?.hosting || false
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        logger.warn('IPInfo rate limit atteint');
      } else {
        logger.error('Erreur IPInfo:', error.message);
      }
      return null;
    }
  }

  /**
   * Enrichir un domaine (via VirusTotal, URLScan, etc.)
   */
  private static async enrichDomain(domain: string): Promise<any> {
    try {
      const data: any = {
        domain,
        reputation: 'unknown',
        category: 'Unknown',
        rank: null,
        firstSeen: null,
        lastSeen: null,
        threatScore: 0,
        malwareDetected: false,
        phishingDetected: false,
        registrar: 'Unknown',
        creationDate: null,
        sources: []
      };

      // Enrichir via VirusTotal
      const vtData = await this.checkVirusTotalDomain(domain);
      if (vtData) {
        Object.assign(data, vtData);
        data.sources.push('VirusTotal');
      }

      // Déterminer réputation finale
      if (data.threatScore >= 70) {
        data.reputation = 'malicious';
      } else if (data.threatScore >= 40) {
        data.reputation = 'suspicious';
      } else if (data.threatScore > 0) {
        data.reputation = 'potentially_harmful';
      } else {
        data.reputation = 'safe';
      }

      return data;
    } catch (error) {
      logger.error('Erreur enrichissement domaine:', error);
      return { domain, error: 'Enrichment failed' };
    }
  }

  /**
   * Vérifier domaine via VirusTotal
   */
  private static async checkVirusTotalDomain(domain: string): Promise<any> {
    try {
      const apiKey = process.env.VIRUSTOTAL_API_KEY;
      if (!apiKey) {
        logger.warn('VirusTotal API key not configured');
        return null;
      }

      const axios = require('axios');
      const response = await axios.get(`https://www.virustotal.com/api/v3/domains/${domain}`, {
        headers: {
          'x-apikey': apiKey
        },
        timeout: 5000
      });

      const data = response.data.data;
      const attributes = data.attributes;
      const stats = attributes.last_analysis_stats;

      const maliciousCount = (stats.malicious || 0) + (stats.suspicious || 0);
      const totalEngines = Object.values(stats).reduce((a: any, b: any) => a + b, 0) as number;
      const threatScore = totalEngines > 0 ? Math.min(100, (maliciousCount / totalEngines) * 100) : 0;

      return {
        threatScore,
        malwareDetected: maliciousCount > 0,
        phishingDetected: attributes.categories && Object.values(attributes.categories).some((cat: any) => 
          cat.toLowerCase().includes('phishing')
        ),
        category: attributes.categories ? Object.values(attributes.categories)[0] : 'Unknown',
        registrar: attributes.registrar || 'Unknown',
        creationDate: attributes.creation_date ? new Date(attributes.creation_date * 1000).toISOString() : null,
        lastSeen: attributes.last_analysis_date ? new Date(attributes.last_analysis_date * 1000).toISOString() : null,
        reputation: attributes.reputation || 0,
        popularityRank: attributes.popularity_ranks?.Alexa?.rank || null,
        detections: maliciousCount,
        totalEngines,
        tags: attributes.tags?.slice(0, 10) || []
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.info(`Domaine non trouvé dans VirusTotal: ${domain}`);
        return {
          threatScore: 0,
          detections: 0,
          totalEngines: 0
        };
      } else if (error.response?.status === 429) {
        logger.warn('VirusTotal rate limit atteint');
      } else {
        logger.error('Erreur VirusTotal domain:', error.message);
      }
      return null;
    }
  }

  /**
   * Enrichir un hash de fichier (via VirusTotal, Hybrid Analysis, etc.)
   */
  private static async enrichFileHash(hash: string): Promise<any> {
    try {
      const hashType = this.detectHashType(hash);
      const data: any = {
        hash,
        hashType,
        reputation: 'unknown',
        threatScore: 0,
        malicious: false,
        detections: 0,
        totalEngines: 0,
        fileName: null,
        fileType: null,
        fileSize: null,
        firstSeen: null,
        lastSeen: null,
        sources: []
      };

      // Enrichir via VirusTotal
      const vtData = await this.checkVirusTotalFile(hash);
      if (vtData) {
        Object.assign(data, vtData);
        data.sources.push('VirusTotal');
      }

      // Déterminer réputation finale
      if (data.detections > 0) {
        const detectionRate = data.detections / Math.max(data.totalEngines, 1);
        if (detectionRate >= 0.5) {
          data.reputation = 'malicious';
          data.threatScore = Math.min(100, detectionRate * 100);
        } else if (detectionRate >= 0.2) {
          data.reputation = 'suspicious';
          data.threatScore = Math.min(70, detectionRate * 100);
        } else {
          data.reputation = 'potentially_harmful';
          data.threatScore = Math.min(50, detectionRate * 100);
        }
        data.malicious = detectionRate >= 0.2;
      } else {
        data.reputation = 'safe';
        data.threatScore = 0;
      }

      return data;
    } catch (error) {
      logger.error('Erreur enrichissement hash:', error);
      return { hash, error: 'Enrichment failed' };
    }
  }

  /**
   * Vérifier hash via VirusTotal
   */
  private static async checkVirusTotalFile(hash: string): Promise<any> {
    try {
      const apiKey = process.env.VIRUSTOTAL_API_KEY;
      if (!apiKey) {
        logger.warn('VirusTotal API key not configured');
        return null;
      }

      const axios = require('axios');
      const response = await axios.get(`https://www.virustotal.com/api/v3/files/${hash}`, {
        headers: {
          'x-apikey': apiKey
        },
        timeout: 5000
      });

      const data = response.data.data;
      const attributes = data.attributes;
      const stats = attributes.last_analysis_stats;

      return {
        detections: stats.malicious + stats.suspicious,
        totalEngines: Object.values(stats).reduce((a: any, b: any) => a + b, 0) as number,
        fileName: attributes.meaningful_name || attributes.names?.[0],
        fileType: attributes.type_description,
        fileSize: attributes.size,
        firstSeen: attributes.first_submission_date ? new Date(attributes.first_submission_date * 1000).toISOString() : null,
        lastSeen: attributes.last_analysis_date ? new Date(attributes.last_analysis_date * 1000).toISOString() : null,
        md5: attributes.md5,
        sha1: attributes.sha1,
        sha256: attributes.sha256,
        tags: attributes.tags?.slice(0, 10) || [],
        analysisResults: Object.entries(attributes.last_analysis_results || {})
          .filter(([_, result]: any) => result.category !== 'undetected')
          .slice(0, 10)
          .map(([engine, result]: any) => ({
            engine,
            category: result.category,
            result: result.result
          }))
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.info(`Hash non trouvé dans VirusTotal: ${hash}`);
        return {
          detections: 0,
          totalEngines: 0,
          firstSeen: null,
          lastSeen: null
        };
      } else if (error.response?.status === 429) {
        logger.warn('VirusTotal rate limit atteint');
      } else {
        logger.error('Erreur VirusTotal file:', error.message);
      }
      return null;
    }
  }

  /**
   * Enrichir une URL (via URLScan, PhishTank, etc.)
   */
  private static async enrichURL(url: string): Promise<any> {
    try {
      const data: any = {
        url,
        reputation: 'unknown',
        threatScore: 0,
        malicious: false,
        phishing: false,
        category: 'Unknown',
        screenshotUrl: null,
        redirectChain: [],
        technologies: [],
        sources: []
      };

      // Enrichir via VirusTotal
      const vtData = await this.checkVirusTotalURL(url);
      if (vtData) {
        Object.assign(data, vtData);
        data.sources.push('VirusTotal');
      }

      // Déterminer réputation finale
      if (data.threatScore >= 70) {
        data.reputation = 'malicious';
        data.malicious = true;
      } else if (data.threatScore >= 40) {
        data.reputation = 'suspicious';
      } else if (data.threatScore > 0) {
        data.reputation = 'potentially_harmful';
      } else {
        data.reputation = 'safe';
      }

      return data;
    } catch (error) {
      logger.error('Erreur enrichissement URL:', error);
      return { url, error: 'Enrichment failed' };
    }
  }

  /**
   * Vérifier URL via VirusTotal
   */
  private static async checkVirusTotalURL(url: string): Promise<any> {
    try {
      const apiKey = process.env.VIRUSTOTAL_API_KEY;
      if (!apiKey) {
        logger.warn('VirusTotal API key not configured');
        return null;
      }

      const axios = require('axios');
      // Encoder l'URL en base64
      const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
      
      const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
        headers: {
          'x-apikey': apiKey
        },
        timeout: 5000
      });

      const data = response.data.data;
      const attributes = data.attributes;
      const stats = attributes.last_analysis_stats;

      const maliciousCount = (stats.malicious || 0) + (stats.suspicious || 0);
      const totalEngines = Object.values(stats).reduce((a: any, b: any) => a + b, 0) as number;
      const threatScore = totalEngines > 0 ? Math.min(100, (maliciousCount / totalEngines) * 100) : 0;

      return {
        threatScore,
        malicious: maliciousCount > 5, // Au moins 5 détections
        phishing: attributes.categories && Object.values(attributes.categories).some((cat: any) => 
          cat.toLowerCase().includes('phishing')
        ),
        category: attributes.categories ? Object.values(attributes.categories)[0] : 'Unknown',
        lastAnalysisDate: attributes.last_analysis_date ? new Date(attributes.last_analysis_date * 1000).toISOString() : null,
        detections: maliciousCount,
        totalEngines,
        title: attributes.title || null,
        tags: attributes.tags?.slice(0, 10) || [],
        redirectChain: attributes.redirection_chain || []
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.info(`URL non trouvée dans VirusTotal: ${url}`);
        // Soumettre l'URL pour analyse
        await this.submitURLToVirusTotal(url);
        return {
          threatScore: 0,
          detections: 0,
          totalEngines: 0,
          pending: true
        };
      } else if (error.response?.status === 429) {
        logger.warn('VirusTotal rate limit atteint');
      } else {
        logger.error('Erreur VirusTotal URL:', error.message);
      }
      return null;
    }
  }

  /**
   * Soumettre URL à VirusTotal pour analyse
   */
  private static async submitURLToVirusTotal(url: string): Promise<void> {
    try {
      const apiKey = process.env.VIRUSTOTAL_API_KEY;
      if (!apiKey) return;

      const axios = require('axios');
      const FormData = require('form-data');
      const form = new FormData();
      form.append('url', url);

      await axios.post('https://www.virustotal.com/api/v3/urls', form, {
        headers: {
          ...form.getHeaders(),
          'x-apikey': apiKey
        },
        timeout: 5000
      });

      logger.info(`URL soumise à VirusTotal pour analyse: ${url}`);
    } catch (error: any) {
      logger.error('Erreur soumission URL VirusTotal:', error.message);
    }
  }

  /**
   * Enrichir une CVE (via NVD, MITRE, etc.)
   */
  private static async enrichCVE(cve: string): Promise<any> {
    try {
      return {
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
      };
    } catch (error) {
      logger.error('Erreur enrichissement CVE:', error);
      return { cve, error: 'Enrichment failed' };
    }
  }

  /**
   * Enrichir une adresse email (via Hunter.io, HaveIBeenPwned, etc.)
   */
  /**
   * Enrichir Email (HaveIBeenPwned + EmailRep + Hunter.io)
   */
  private static async enrichEmail(email: string): Promise<any> {
    try {
      logger.info(`Enriching email: ${email}`);

      const data: any = {
        email,
        domain: email.split('@')[1] || null,
        valid: this.isValidEmail(email),
        breached: false,
        reputation: 'unknown',
        sources: []
      };

      // Validation basique
      if (!data.valid) {
        return { ...data, error: 'Invalid email format' };
      }

      // Paralléliser les appels API
      const [hibpData, emailRepData, hunterData] = await Promise.allSettled([
        this.checkHaveIBeenPwned(email),
        this.checkEmailRep(email),
        this.checkHunterIO(email)
      ]);

      // Merger données HaveIBeenPwned
      if (hibpData.status === 'fulfilled' && hibpData.value) {
        data.breached = hibpData.value.breached;
        data.breaches = hibpData.value.breaches;
        data.breachCount = hibpData.value.breachCount || 0;
        data.sources.push('HaveIBeenPwned');
      }

      // Merger données EmailRep
      if (emailRepData.status === 'fulfilled' && emailRepData.value) {
        data.reputation = emailRepData.value.reputation;
        data.suspicious = emailRepData.value.suspicious;
        data.references = emailRepData.value.references;
        data.details = emailRepData.value.details;
        data.sources.push('EmailRep');
      }

      // Merger données Hunter.io
      if (hunterData.status === 'fulfilled' && hunterData.value) {
        data.validation = hunterData.value;
        data.disposable = hunterData.value.disposable;
        data.webmail = hunterData.value.webmail;
        data.sources.push('Hunter.io');
      }

      // Calculer threat score email
      data.threatScore = this.calculateEmailThreatScore(data);

      // Déterminer réputation finale
      if (!data.reputation || data.reputation === 'unknown') {
        data.reputation = this.determineEmailReputation(data);
      }

      return data;
    } catch (error) {
      logger.error('Erreur enrichissement email:', error);
      return { email, error: 'Enrichment failed' };
    }
  }

  /**
   * Check HaveIBeenPwned (breach detection)
   */
  private static async checkHaveIBeenPwned(email: string): Promise<any> {
    try {
      const apiKey = process.env.HIBP_API_KEY;
      
      if (!apiKey) {
        logger.warn('HaveIBeenPwned API key not configured');
        return null;
      }

      const response = await axios.get(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
        {
          headers: {
            'hibp-api-key': apiKey,
            'user-agent': 'AntStrike-CTI/1.0'
          },
          timeout: 5000
        }
      );

      const breaches = response.data;

      return {
        breached: true,
        breachCount: breaches.length,
        breaches: breaches.map((b: any) => ({
          name: b.Name,
          domain: b.Domain,
          breachDate: b.BreachDate,
          pwned: b.PwnCount,
          dataClasses: b.DataClasses
        }))
      };
    } catch (error: any) {
      // 404 = email not breached
      if (error.response?.status === 404) {
        return { breached: false, breachCount: 0, breaches: [] };
      }
      
      logger.warn('HaveIBeenPwned check failed:', error.message);
      return null;
    }
  }

  /**
   * Check EmailRep.io (reputation)
   */
  private static async checkEmailRep(email: string): Promise<any> {
    try {
      const apiKey = process.env.EMAILREP_API_KEY;
      
      if (!apiKey) {
        logger.warn('EmailRep API key not configured');
        return null;
      }

      const response = await axios.get(
        `https://emailrep.io/${encodeURIComponent(email)}`,
        {
          headers: { 'Key': apiKey },
          timeout: 5000
        }
      );

      const data = response.data;

      return {
        reputation: data.reputation, // high, medium, low, none
        suspicious: data.suspicious,
        references: data.references,
        details: {
          malicious: data.details?.malicious_activity || false,
          credentialsLeaked: data.details?.credentials_leaked || false,
          dataBreaches: data.details?.data_breach || false,
          spam: data.details?.spam || false,
          domainReputation: data.details?.domain_reputation
        }
      };
    } catch (error: any) {
      logger.warn('EmailRep check failed:', error.message);
      return null;
    }
  }

  /**
   * Check Hunter.io (validation)
   */
  private static async checkHunterIO(email: string): Promise<any> {
    try {
      const apiKey = process.env.HUNTER_API_KEY;
      
      if (!apiKey) {
        logger.warn('Hunter.io API key not configured');
        return null;
      }

      const response = await axios.get(
        'https://api.hunter.io/v2/email-verifier',
        {
          params: { email, api_key: apiKey },
          timeout: 5000
        }
      );

      const data = response.data.data;

      return {
        status: data.status, // valid, invalid, accept_all, unknown
        score: data.score, // 0-100
        regexp: data.regexp,
        gibberish: data.gibberish,
        disposable: data.disposable,
        webmail: data.webmail,
        mxRecords: data.mx_records,
        smtp: data.smtp_server,
        smtpCheck: data.smtp_check
      };
    } catch (error: any) {
      logger.warn('Hunter.io check failed:', error.message);
      return null;
    }
  }

  /**
   * Calculer threat score pour email
   */
  private static calculateEmailThreatScore(emailData: any): number {
    let score = 0;

    // Breaches
    if (emailData.breached) {
      score += Math.min(emailData.breachCount * 15, 50);
    }

    // Reputation
    const repScores: Record<string, number> = {
      'high': 10,
      'medium': 30,
      'low': 60,
      'none': 80
    };
    score += repScores[emailData.reputation] || 0;

    // Suspicious activities
    if (emailData.suspicious) score += 25;

    // Details
    if (emailData.details?.malicious) score += 30;
    if (emailData.details?.credentialsLeaked) score += 25;
    if (emailData.details?.dataBreaches) score += 20;
    if (emailData.details?.spam) score += 15;

    // Disposable email
    if (emailData.disposable || emailData.validation?.disposable) {
      score += 40;
    }

    // Hunter validation
    if (emailData.validation?.status === 'invalid') {
      score += 20;
    }

    return Math.min(score, 100);
  }

  /**
   * Déterminer réputation email
   */
  private static determineEmailReputation(emailData: any): string {
    const score = emailData.threatScore || 0;

    if (score >= 80) return 'malicious';
    if (score >= 60) return 'suspicious';
    if (score >= 40) return 'questionable';
    if (score >= 20) return 'low-risk';
    return 'clean';
  }

  /**
   * Récupérer tous les IOCs enrichis d'un tenant
   */
  static async getEnrichedIOCs(tenantId: string, filters?: {
    iocType?: string;
    limit?: number;
  }) {
    try {
      const where: any = { tenantId };
      if (filters?.iocType) where.iocType = filters.iocType;

      const iocs = await prisma.iOCHistory.findMany({
        where,
        orderBy: { observedAt: 'desc' },
        take: filters?.limit || 100
      });

      return iocs;
    } catch (error) {
      logger.error('Erreur récupération IOCs enrichis:', error);
      throw error;
    }
  }

  /**
   * Extraire les IOCs depuis un texte (via Taranis AI Bot)
   */
  static async extractIOCsFromText(text: string): Promise<any> {
    try {
      const iocs = {
        ips: this.extractIPs(text),
        domains: this.extractDomains(text),
        urls: this.extractURLs(text),
        emails: this.extractEmails(text),
        fileHashes: this.extractFileHashes(text),
        cves: this.extractCVEs(text),
      };

      return iocs;
    } catch (error) {
      logger.error('Erreur extraction IOCs:', error);
      throw error;
    }
  }

  // ========== Méthodes utilitaires ==========

  private static isPrivateIP(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127
    );
  }

  private static detectHashType(hash: string): string {
    const length = hash.length;
    if (length === 32) return 'MD5';
    if (length === 40) return 'SHA1';
    if (length === 64) return 'SHA256';
    if (length === 128) return 'SHA512';
    return 'UNKNOWN';
  }

  private static isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private static extractIPs(text: string): string[] {
    const regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    return [...new Set(text.match(regex) || [])];
  }

  private static extractDomains(text: string): string[] {
    const regex = /\b[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}\b/gi;
    return [...new Set(text.match(regex) || [])];
  }

  private static extractURLs(text: string): string[] {
    const regex = /https?:\/\/[^\s]+/g;
    return [...new Set(text.match(regex) || [])];
  }

  private static extractEmails(text: string): string[] {
    const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return [...new Set(text.match(regex) || [])];
  }

  private static extractFileHashes(text: string): string[] {
    const regex = /\b[A-Fa-f0-9]{32,128}\b/g;
    return [...new Set(text.match(regex) || [])];
  }

  private static extractCVEs(text: string): string[] {
    const regex = /CVE-\d{4}-\d{4,7}/gi;
    return [...new Set(text.match(regex) || [])];
  }
}


