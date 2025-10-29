/**
 * 🕵️ Dark Web Monitoring Service
 * Surveillance du Dark Web pour mentions, leaks et IOCs
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface DarkWebMention {
  id: string;
  tenantId: string;
  source: string;
  title: string;
  content: string;
  url: string;
  foundAt: Date;
  severity: string;
  relatedIOCs: string[];
  keywords: string[];
}

interface PastebinEntry {
  key: string;
  title: string;
  content: string;
  date: number;
  url: string;
}

export class DarkWebMonitoringService {
  /**
   * Monitorer Pastebin pour mentions
   */
  static async monitorPastebin(
    tenantId: string,
    keywords: string[]
  ): Promise<DarkWebMention[]> {
    try {
      logger.info(`Monitoring Pastebin for keywords: ${keywords.join(', ')}`);

      const mentions: DarkWebMention[] = [];

      // Pastebin Scraping API (limite gratuite)
      // Note: API officielle payante, utilisation scraping public
      const response = await axios.get('https://scrape.pastebin.com/api_scraping.php', {
        params: {
          limit: 100
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'AntStrike-CTI/1.0'
        }
      }).catch(() => {
        // Fallback: utiliser archive publique
        return axios.get('https://pastebin.com/archive', { timeout: 10000 });
      });

      // Parser les pastes récents
      const pastes = this.parsePastebinResponse(response.data);

      // Filtrer par keywords
      for (const paste of pastes) {
        const matchedKeywords = keywords.filter(kw => 
          paste.title?.toLowerCase().includes(kw.toLowerCase()) ||
          paste.content?.toLowerCase().includes(kw.toLowerCase())
        );

        if (matchedKeywords.length > 0) {
          const iocs = this.extractIOCsFromText(paste.content);
          const severity = this.calculateSeverity(paste.content, iocs);

          mentions.push({
            id: paste.key,
            tenantId,
            source: 'Pastebin',
            title: paste.title || 'Untitled',
            content: paste.content.substring(0, 1000), // Limiter taille
            url: `https://pastebin.com/${paste.key}`,
            foundAt: new Date(paste.date * 1000),
            severity,
            relatedIOCs: iocs,
            keywords: matchedKeywords
          });
        }
      }

      logger.info(`Pastebin monitoring: ${mentions.length} mentions found`);

      // Sauvegarder mentions
      for (const mention of mentions) {
        await this.saveMention(mention);
        
        // Créer alerte si critique
        if (mention.severity === 'CRITICAL' || mention.severity === 'HIGH') {
          await this.createAlertFromMention(mention);
        }
      }

      return mentions;
    } catch (error: any) {
      logger.error('Error monitoring Pastebin:', error.message);
      return [];
    }
  }

  /**
   * Monitorer GitHub Gists
   */
  static async monitorGitHubGists(
    tenantId: string,
    keywords: string[]
  ): Promise<DarkWebMention[]> {
    try {
      logger.info(`Monitoring GitHub Gists for keywords: ${keywords.join(', ')}`);

      const mentions: DarkWebMention[] = [];

      // GitHub API publique (pas de clé requise pour lecture)
      for (const keyword of keywords.slice(0, 3)) { // Limiter à 3 keywords
        try {
          const response = await axios.get(
            `https://api.github.com/search/code`,
            {
              params: {
                q: `${keyword} in:file`,
                sort: 'indexed',
                order: 'desc',
                per_page: 20
              },
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'AntStrike-CTI/1.0'
              },
              timeout: 10000
            }
          );

          const items = response.data.items || [];

          for (const item of items) {
            // Récupérer contenu du fichier
            const content = await this.fetchGistContent(item.url);
            
            if (content) {
              const iocs = this.extractIOCsFromText(content);
              const severity = this.calculateSeverity(content, iocs);

              mentions.push({
                id: item.sha,
                tenantId,
                source: 'GitHub Gist',
                title: item.name || 'Untitled',
                content: content.substring(0, 1000),
                url: item.html_url,
                foundAt: new Date(),
                severity,
                relatedIOCs: iocs,
                keywords: [keyword]
              });
            }
          }

          // Rate limiting GitHub API
          await this.sleep(2000);

        } catch (error: any) {
          logger.warn(`GitHub search failed for "${keyword}":`, error.message);
        }
      }

      logger.info(`GitHub Gists monitoring: ${mentions.length} mentions found`);

      // Sauvegarder
      for (const mention of mentions) {
        await this.saveMention(mention);
        
        if (mention.severity === 'CRITICAL' || mention.severity === 'HIGH') {
          await this.createAlertFromMention(mention);
        }
      }

      return mentions;
    } catch (error: any) {
      logger.error('Error monitoring GitHub Gists:', error.message);
      return [];
    }
  }

  /**
   * Monitorer listes Tor Hidden Services
   */
  static async monitorTorLists(tenantId: string): Promise<DarkWebMention[]> {
    try {
      logger.info('Monitoring Tor Hidden Services lists');

      const mentions: DarkWebMention[] = [];

      // Sources publiques de .onion
      const torLists = [
        'https://raw.githubusercontent.com/alecmuffett/real-world-onion-sites/master/README.md',
        'https://raw.githubusercontent.com/s-rah/onionscan/master/README.md'
      ];

      for (const url of torLists) {
        try {
          const response = await axios.get(url, { timeout: 10000 });
          const onionLinks = this.extractOnionLinks(response.data);

          if (onionLinks.length > 0) {
            mentions.push({
              id: `tor-${Date.now()}`,
              tenantId,
              source: 'Tor Hidden Services',
              title: `${onionLinks.length} .onion sites found`,
              content: onionLinks.join('\n'),
              url,
              foundAt: new Date(),
              severity: 'INFO',
              relatedIOCs: onionLinks,
              keywords: ['tor', 'onion']
            });
          }

          await this.sleep(1000);
        } catch (error: any) {
          logger.warn(`Failed to fetch Tor list ${url}:`, error.message);
        }
      }

      logger.info(`Tor monitoring: ${mentions.length} lists processed`);

      for (const mention of mentions) {
        await this.saveMention(mention);
      }

      return mentions;
    } catch (error: any) {
      logger.error('Error monitoring Tor lists:', error.message);
      return [];
    }
  }

  /**
   * Monitorer Telegram channels CTI (via RSS/Scraping)
   */
  static async monitorTelegramChannels(
    tenantId: string,
    channels: string[]
  ): Promise<DarkWebMention[]> {
    try {
      logger.info(`Monitoring Telegram channels: ${channels.join(', ')}`);

      const mentions: DarkWebMention[] = [];

      // Telegram public preview (pas d'API requise)
      for (const channel of channels) {
        try {
          const response = await axios.get(
            `https://t.me/s/${channel}`,
            {
              timeout: 10000,
              headers: { 'User-Agent': 'Mozilla/5.0' }
            }
          );

          // Parser HTML pour extraire posts récents
          const posts = this.parseTelegramHTML(response.data);

          for (const post of posts.slice(0, 10)) { // 10 derniers posts
            const iocs = this.extractIOCsFromText(post.content);
            
            if (iocs.length > 0) {
              mentions.push({
                id: `tg-${channel}-${post.id}`,
                tenantId,
                source: `Telegram @${channel}`,
                title: post.title || `Post from @${channel}`,
                content: post.content.substring(0, 1000),
                url: `https://t.me/${channel}/${post.id}`,
                foundAt: new Date(post.date),
                severity: 'MEDIUM',
                relatedIOCs: iocs,
                keywords: [channel]
              });
            }
          }

          await this.sleep(2000);
        } catch (error: any) {
          logger.warn(`Telegram channel ${channel} failed:`, error.message);
        }
      }

      logger.info(`Telegram monitoring: ${mentions.length} mentions found`);

      for (const mention of mentions) {
        await this.saveMention(mention);
      }

      return mentions;
    } catch (error: any) {
      logger.error('Error monitoring Telegram:', error.message);
      return [];
    }
  }

  /**
   * Import complet Dark Web
   */
  static async importAll(tenantId: string): Promise<any> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      const settings = ({} as Record<string, any>);
      const dwConfig = settings.darkWebMonitoring || {};

      const keywords = dwConfig.keywords || [tenant?.name.toLowerCase()];
      const telegramChannels = dwConfig.telegramChannels || ['threatintel', 'cybersec'];

      logger.info(`Starting Dark Web monitoring for tenant ${tenantId}`);

      // Import parallèle
      const [pastebinMentions, gistMentions, torMentions, telegramMentions] = await Promise.allSettled([
        this.monitorPastebin(tenantId, keywords),
        this.monitorGitHubGists(tenantId, keywords),
        this.monitorTorLists(tenantId),
        this.monitorTelegramChannels(tenantId, telegramChannels)
      ]);

      const results = {
        pastebin: pastebinMentions.status === 'fulfilled' ? pastebinMentions.value.length : 0,
        github: gistMentions.status === 'fulfilled' ? gistMentions.value.length : 0,
        tor: torMentions.status === 'fulfilled' ? torMentions.value.length : 0,
        telegram: telegramMentions.status === 'fulfilled' ? telegramMentions.value.length : 0
      };

      const total = Object.values(results).reduce((a, b) => a + b, 0);

      logger.info(`Dark Web monitoring completed: ${total} total mentions`, results);

      return { total, ...results };
    } catch (error: any) {
      logger.error('Error in Dark Web monitoring:', error.message);
      throw error;
    }
  }

  // ========== Helpers ==========

  /**
   * Parser réponse Pastebin
   */
  private static parsePastebinResponse(data: any): PastebinEntry[] {
    // Simplifié - à améliorer selon format réel
    try {
      if (Array.isArray(data)) {
        return data.map((entry: any) => ({
          key: entry.key || entry.id,
          title: entry.title || '',
          content: entry.scrape_url ? '' : entry.content || '',
          date: entry.date || Date.now() / 1000,
          url: entry.full_url || `https://pastebin.com/${entry.key}`
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Fetch contenu Gist
   */
  private static async fetchGistContent(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraire liens .onion
   */
  private static extractOnionLinks(text: string): string[] {
    const onionRegex = /[a-z2-7]{16,56}\.onion/gi;
    const matches = text.match(onionRegex) || [];
    return [...new Set(matches)];
  }

  /**
   * Parser HTML Telegram
   */
  private static parseTelegramHTML(html: string): Array<{ id: string; title: string; content: string; date: string }> {
    // Simplifié - extraction basique
    const posts: Array<{ id: string; title: string; content: string; date: string }> = [];
    
    // Regex pour extraire posts (basique)
    const postRegex = /<div class="tgme_widget_message_text"[^>]*>([\s\S]*?)<\/div>/gi;
    const matches = html.matchAll(postRegex);

    let index = 0;
    for (const match of matches) {
      const content = match[1].replace(/<[^>]+>/g, '').trim();
      if (content.length > 20) {
        posts.push({
          id: `${index++}`,
          title: '',
          content,
          date: new Date().toISOString()
        });
      }
    }

    return posts;
  }

  /**
   * Extraire IOCs depuis texte
   */
  private static extractIOCsFromText(text: string): string[] {
    const iocs: string[] = [];

    // IPs
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    const ips = text.match(ipRegex) || [];
    iocs.push(...ips.filter(ip => this.isValidIP(ip)));

    // Domains
    const domainRegex = /\b[a-z0-9][a-z0-9-]*\.[a-z]{2,}\b/gi;
    const domains = text.match(domainRegex) || [];
    iocs.push(...domains.slice(0, 20)); // Limiter

    // File hashes (MD5, SHA1, SHA256)
    const hashRegex = /\b[a-f0-9]{32,64}\b/gi;
    const hashes = text.match(hashRegex) || [];
    iocs.push(...hashes.slice(0, 10));

    // Email addresses
    const emailRegex = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
    const emails = text.match(emailRegex) || [];
    iocs.push(...emails.slice(0, 10));

    // CVEs
    const cveRegex = /CVE-\d{4}-\d{4,}/gi;
    const cves = text.match(cveRegex) || [];
    iocs.push(...cves);

    return [...new Set(iocs)]; // Unique
  }

  /**
   * Valider IP
   */
  private static isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  }

  /**
   * Calculer sévérité
   */
  private static calculateSeverity(content: string, iocs: string[]): string {
    const lowerContent = content.toLowerCase();
    
    // Mots-clés critiques
    const criticalKeywords = ['breach', 'leak', 'dump', 'database', 'credentials', 'passwords'];
    const highKeywords = ['ransomware', 'exploit', 'vulnerability', 'backdoor'];
    const mediumKeywords = ['malware', 'phishing', 'suspicious'];

    if (criticalKeywords.some(kw => lowerContent.includes(kw))) {
      return 'CRITICAL';
    }
    if (highKeywords.some(kw => lowerContent.includes(kw))) {
      return 'HIGH';
    }
    if (mediumKeywords.some(kw => lowerContent.includes(kw)) || iocs.length > 5) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Sauvegarder mention dans DB
   */
  private static async saveMention(mention: DarkWebMention): Promise<void> {
    try {
      // Créer dans audit_logs pour simplification (ou créer table dédiée)
      // TODO: Créer table auditLog
      logger.info('Dark web monitoring action logged', {
        data: {
          tenantId: mention.tenantId,
          userId: null,
          action: 'DARKWEB_MENTION_DETECTED',
          resource: mention.source,
          details: {
            id: mention.id,
            title: mention.title,
            content: mention.content,
            url: mention.url,
            severity: mention.severity,
            relatedIOCs: mention.relatedIOCs,
            keywords: mention.keywords
          },
          ipAddress: null,
          userAgent: null,
          timestamp: mention.foundAt
        }
      });

      logger.info(`Dark Web mention saved: ${mention.id}`);
    } catch (error: any) {
      logger.warn('Failed to save Dark Web mention:', error.message);
    }
  }

  /**
   * Créer alerte depuis mention
   */
  private static async createAlertFromMention(mention: DarkWebMention): Promise<void> {
    try {
      const { AlertingService } = await import('./alerting.service');

      await AlertingService.createAlert({
        tenantId: mention.tenantId,
        storyId: `darkweb-${mention.id}`,
        severity: mention.severity as any,
        priority: mention.severity === 'CRITICAL' ? 'P0' : 'P1',
        category: 'DATA_BREACH',
        title: `Dark Web Mention: ${mention.title}`,
        summary: `Found on ${mention.source}: ${mention.content.substring(0, 200)}`,
        iocs: mention.relatedIOCs,
        affectedAssets: [],
        recommendedActions: [
          'Verify if data is legitimate',
          'Check for credential exposure',
          'Review related IOCs',
          'Initiate incident response if confirmed'
        ]
      });

      logger.info(`Alert created for Dark Web mention: ${mention.id}`);
    } catch (error: any) {
      logger.warn('Failed to create alert from Dark Web mention:', error.message);
    }
  }

  /**
   * Statistiques Dark Web
   */
  static async getStats(tenantId: string): Promise<any> {
    // TODO: Créer table auditLog pour audit trail
    const mentions: any[] = [];

    const bySeverity: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    mentions.forEach((mention: any) => {
      const details = mention.details as any;
      bySeverity[details.severity] = (bySeverity[details.severity] || 0) + 1;
      bySource[details.source || 'Unknown'] = (bySource[details.source || 'Unknown'] || 0) + 1;
    });

    return {
      totalMentions: mentions.length,
      bySeverity,
      bySource,
      recentMentions: mentions.slice(0, 10).map(m => ({
        id: (m.details as any).id,
        title: (m.details as any).title,
        source: (m.details as any).source,
        severity: (m.details as any).severity,
        foundAt: m.timestamp
      }))
    };
  }

  /**
   * Configurer Dark Web monitoring
   */
  static async configure(
    tenantId: string,
    config: {
      enabled: boolean;
      keywords: string[];
      telegramChannels?: string[];
      monitorPastebin?: boolean;
      monitorGitHub?: boolean;
      monitorTor?: boolean;
      autoImport?: boolean;
    }
  ): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = ({} as Record<string, any>);
    settings.darkWebMonitoring = {
      enabled: config.enabled,
      keywords: config.keywords,
      telegramChannels: config.telegramChannels || [],
      monitorPastebin: config.monitorPastebin !== false,
      monitorGitHub: config.monitorGitHub !== false,
      monitorTor: config.monitorTor !== false,
      autoImport: config.autoImport || false,
      lastConfigUpdate: new Date().toISOString()
    };

    // TODO: Sauvegarder settings dans TenantConfiguration
    logger.info('Dark Web settings would be saved', { settings });

    logger.info(`Dark Web monitoring configured for tenant ${tenantId}`);
  }

  /**
   * Helper: Sleep
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}




