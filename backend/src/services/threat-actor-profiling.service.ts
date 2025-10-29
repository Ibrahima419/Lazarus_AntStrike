/**
 * 🕵️ Threat Actor Profiling Service
 * Profilage avancé des acteurs de menace (APT, cybercriminels, hacktivistes)
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface ThreatActorInput {
  name: string;
  aliases?: string[];
  type?: 'apt' | 'cybercrime' | 'hacktivist' | 'insider' | 'nation_state' | 'unknown';
  country?: string;
  sponsorship?: 'state' | 'criminal' | 'independent' | 'unknown';
  motivation?: 'espionage' | 'financial' | 'sabotage' | 'ideology' | 'revenge' | 'unknown';
  sophistication?: 'low' | 'medium' | 'high' | 'advanced' | 'unknown';
  targetSectors?: string[];
  targetCountries?: string[];
  targetTech?: string[];
  tools?: string[];
  malwareFamilies?: string[];
  description?: string;
  sources?: string[];
  tags?: string[];
}

interface AttributionInput {
  iocs?: string[];
  ttps?: string[];
  tools?: string[];
  malware?: string[];
  targetSectors?: string[];
  country?: string;
}

export class ThreatActorProfilingService {
  /**
   * Créer un profil Threat Actor
   */
  static async createProfile(
    tenantId: string,
    input: ThreatActorInput
  ): Promise<any> {
    try {
      logger.info(`Creating threat actor profile: ${input.name}`);

      const actor = await prisma.threatActor.create({
        data: {
          tenantId,
          name: input.name,
          aliases: input.aliases || [],
          type: input.type || 'unknown',
          country: input.country,
          sponsorship: input.sponsorship,
          motivation: input.motivation,
          sophistication: input.sophistication || 'unknown',
          targetSectors: input.targetSectors || [],
          targetCountries: input.targetCountries || [],
          targetTech: input.targetTech || [],
          tools: input.tools || [],
          malwareFamilies: input.malwareFamilies || [],
          description: input.description,
          sources: input.sources || [],
          tags: input.tags || [],
          status: 'active'
        }
      });

      logger.info(`Threat actor profile created: ${actor.id}`);
      return actor;
    } catch (error: any) {
      logger.error('Error creating threat actor profile:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir un profil
   */
  static async getProfile(
    tenantId: string,
    actorId: string
  ): Promise<any> {
    const actor = await prisma.threatActor.findFirst({
      where: { id: actorId, tenantId }
    });

    if (!actor) {
      return null;
    }

    // Enrichir avec campagnes liées
    const campaigns = await prisma.campaign.findMany({
      where: {
        tenantId,
        threatActor: actor.name
      },
      select: {
        id: true,
        name: true,
        status: true,
        firstSeen: true,
        lastSeen: true,
        confidence: true
      }
    });

    // Enrichir avec TTPs observés
    const ttps = await prisma.tTP.findMany({
      where: {
        tenantId,
        campaign: {
          threatActor: actor.name
        }
      },
      select: {
        tactic: true,
        technique: true,
        techniqueId: true,
        confidence: true
      },
      distinct: ['techniqueId'],
      orderBy: { confidence: 'desc' },
      take: 20
    });

    return {
      ...actor,
      relatedCampaigns: campaigns,
      observedTTPs: ttps,
      campaignCount: campaigns.length,
      ttpCount: ttps.length
    };
  }

  /**
   * Lister les threat actors
   */
  static async listProfiles(
    tenantId: string,
    filters?: {
      type?: string;
      country?: string;
      status?: string;
      threatLevel?: string;
    }
  ): Promise<any[]> {
    const where: any = { tenantId };

    if (filters?.type) where.type = filters.type;
    if (filters?.country) where.country = filters.country;
    if (filters?.status) where.status = filters.status;
    if (filters?.threatLevel) where.threatLevel = filters.threatLevel;

    const actors = await prisma.threatActor.findMany({
      where,
      orderBy: { lastSeen: 'desc' }
    });

    return actors;
  }

  /**
   * Mettre à jour un profil
   */
  static async updateProfile(
    tenantId: string,
    actorId: string,
    updates: Partial<ThreatActorInput>
  ): Promise<any> {
    try {
      const actor = await prisma.threatActor.updateMany({
        where: { id: actorId, tenantId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      logger.info(`Threat actor updated: ${actorId}`);
      return actor;
    } catch (error: any) {
      logger.error('Error updating threat actor:', error.message);
      throw error;
    }
  }

  /**
   * Ajouter infrastructure (IPs, domaines, emails)
   */
  static async addInfrastructure(
    tenantId: string,
    actorId: string,
    type: 'ip' | 'domain' | 'email',
    value: string
  ): Promise<any> {
    try {
      const actor = await prisma.threatActor.findFirst({
        where: { id: actorId, tenantId }
      });

      if (!actor) {
        throw new Error('Threat actor not found');
      }

      let field: 'knownIPs' | 'knownDomains' | 'knownEmails';
      if (type === 'ip') field = 'knownIPs';
      else if (type === 'domain') field = 'knownDomains';
      else field = 'knownEmails';

      const currentValues = (actor[field] as string[]) || [];
      
      if (currentValues.includes(value)) {
        return { message: 'Infrastructure already exists', added: false };
      }

      const updated = await prisma.threatActor.update({
        where: { id: actorId },
        data: {
          [field]: [...currentValues, value],
          lastSeen: new Date()
        }
      });

      logger.info(`Infrastructure added to ${actor.name}: ${type} = ${value}`);
      return { actor: updated, added: true };
    } catch (error: any) {
      logger.error('Error adding infrastructure:', error.message);
      throw error;
    }
  }

  /**
   * Attribution automatique depuis IOCs/TTPs
   */
  static async autoAttribution(
    tenantId: string,
    data: AttributionInput
  ): Promise<any> {
    try {
      logger.info('Auto-attribution threat actor from indicators');

      const actors = await prisma.threatActor.findMany({
        where: { tenantId, status: 'active' }
      });

      const matches: any[] = [];

      for (const actor of actors) {
        let score = 0;
        const evidence: string[] = [];

        // Match IOCs (IPs, domaines, emails)
        if (data.iocs && data.iocs.length > 0) {
          const knownIPs = (actor.knownIPs as string[]) || [];
          const knownDomains = (actor.knownDomains as string[]) || [];
          const knownEmails = (actor.knownEmails as string[]) || [];
          
          const allInfra = [...knownIPs, ...knownDomains, ...knownEmails];
          const commonIOCs = data.iocs.filter(ioc => allInfra.includes(ioc));
          
          if (commonIOCs.length > 0) {
            score += commonIOCs.length * 25;
            evidence.push(`${commonIOCs.length} IOC(s) d'infrastructure connu(s)`);
          }
        }

        // Match TTPs
        if (data.ttps && data.ttps.length > 0) {
          const preferredTTPs = (actor.preferredTTPs as string[]) || [];
          const commonTTPs = data.ttps.filter(ttp => preferredTTPs.includes(ttp));
          
          if (commonTTPs.length > 0) {
            score += commonTTPs.length * 20;
            evidence.push(`${commonTTPs.length} TTP(s) caractéristique(s)`);
          }
        }

        // Match Tools
        if (data.tools && data.tools.length > 0) {
          const actorTools = (actor.tools as string[]) || [];
          const commonTools = data.tools.filter(tool => 
            actorTools.some(t => t.toLowerCase().includes(tool.toLowerCase()))
          );
          
          if (commonTools.length > 0) {
            score += commonTools.length * 15;
            evidence.push(`${commonTools.length} outil(s) utilisé(s)`);
          }
        }

        // Match Malware
        if (data.malware && data.malware.length > 0) {
          const malwareFamilies = (actor.malwareFamilies as string[]) || [];
          const commonMalware = data.malware.filter(m => 
            malwareFamilies.some(mf => mf.toLowerCase().includes(m.toLowerCase()))
          );
          
          if (commonMalware.length > 0) {
            score += commonMalware.length * 20;
            evidence.push(`${commonMalware.length} famille(s) de malware`);
          }
        }

        // Match Target Sectors
        if (data.targetSectors && data.targetSectors.length > 0) {
          const actorSectors = (actor.targetSectors as string[]) || [];
          const commonSectors = data.targetSectors.filter(s => actorSectors.includes(s));
          
          if (commonSectors.length > 0) {
            score += commonSectors.length * 10;
            evidence.push(`${commonSectors.length} secteur(s) ciblé(s) habituel(s)`);
          }
        }

        // Match Country
        if (data.country && actor.country === data.country) {
          score += 15;
          evidence.push('Même origine géographique');
        }

        if (score >= 40) {
          matches.push({
            actor: {
              id: actor.id,
              name: actor.name,
              type: actor.type,
              country: actor.country,
              sophistication: actor.sophistication,
              confidence: actor.confidence
            },
            attributionScore: score,
            evidence,
            confidence: this.calculateAttributionConfidence(score)
          });
        }
      }

      // Trier par score
      matches.sort((a, b) => b.attributionScore - a.attributionScore);

      return {
        found: matches.length > 0,
        matches: matches.slice(0, 5), // Top 5
        primarySuspect: matches.length > 0 ? matches[0] : null,
        suggestion: matches.length > 0 
          ? `Attribution probable: ${matches[0].actor.name} (${matches[0].attributionScore} points)`
          : 'Aucun threat actor connu ne correspond aux indicateurs'
      };
    } catch (error: any) {
      logger.error('Error auto-attribution:', error.message);
      throw error;
    }
  }

  /**
   * Calculer confidence d'attribution
   */
  private static calculateAttributionConfidence(score: number): string {
    if (score >= 100) return 'très élevée';
    if (score >= 80) return 'élevée';
    if (score >= 60) return 'moyenne';
    if (score >= 40) return 'faible';
    return 'très faible';
  }

  /**
   * Comparer deux threat actors
   */
  static async compareActors(
    tenantId: string,
    actorId1: string,
    actorId2: string
  ): Promise<any> {
    try {
      const [actor1, actor2] = await Promise.all([
        this.getProfile(tenantId, actorId1),
        this.getProfile(tenantId, actorId2)
      ]);

      if (!actor1 || !actor2) {
        throw new Error('One or both actors not found');
      }

      const comparison: any = {
        actors: [
          { id: actor1.id, name: actor1.name },
          { id: actor2.id, name: actor2.name }
        ],
        similarities: [],
        differences: []
      };

      // Comparer attributs
      if (actor1.country === actor2.country && actor1.country) {
        comparison.similarities.push(`Même pays: ${actor1.country}`);
      } else if (actor1.country && actor2.country) {
        comparison.differences.push(`Pays différents: ${actor1.country} vs ${actor2.country}`);
      }

      if (actor1.motivation === actor2.motivation && actor1.motivation) {
        comparison.similarities.push(`Même motivation: ${actor1.motivation}`);
      }

      if (actor1.sophistication === actor2.sophistication) {
        comparison.similarities.push(`Même niveau: ${actor1.sophistication}`);
      }

      // Comparer TTPs
      const ttps1 = actor1.observedTTPs.map((t: any) => t.techniqueId);
      const ttps2 = actor2.observedTTPs.map((t: any) => t.techniqueId);
      const commonTTPs = ttps1.filter((t: string) => ttps2.includes(t));
      
      if (commonTTPs.length > 0) {
        comparison.similarities.push(`${commonTTPs.length} TTP(s) commune(s)`);
        comparison.commonTTPs = commonTTPs;
      }

      // Comparer secteurs ciblés
      const sectors1 = (actor1.targetSectors as string[]) || [];
      const sectors2 = (actor2.targetSectors as string[]) || [];
      const commonSectors = sectors1.filter(s => sectors2.includes(s));
      
      if (commonSectors.length > 0) {
        comparison.similarities.push(`${commonSectors.length} secteur(s) ciblé(s) en commun`);
        comparison.commonSectors = commonSectors;
      }

      // Score de similarité
      const similarityScore = this.calculateSimilarityScore(actor1, actor2);
      comparison.similarityScore = similarityScore;
      comparison.verdict = similarityScore >= 60 
        ? 'Très similaires - Possiblement liés'
        : similarityScore >= 40
        ? 'Similaires - Mérite investigation'
        : 'Différents';

      return comparison;
    } catch (error: any) {
      logger.error('Error comparing actors:', error.message);
      throw error;
    }
  }

  /**
   * Calculer score de similarité
   */
  private static calculateSimilarityScore(actor1: any, actor2: any): number {
    let score = 0;

    if (actor1.country === actor2.country && actor1.country) score += 20;
    if (actor1.motivation === actor2.motivation && actor1.motivation) score += 15;
    if (actor1.sophistication === actor2.sophistication) score += 10;

    // TTPs
    const ttps1 = actor1.observedTTPs?.map((t: any) => t.techniqueId) || [];
    const ttps2 = actor2.observedTTPs?.map((t: any) => t.techniqueId) || [];
    const commonTTPs = ttps1.filter((t: string) => ttps2.includes(t));
    score += Math.min(commonTTPs.length * 5, 30);

    // Secteurs
    const sectors1 = (actor1.targetSectors as string[]) || [];
    const sectors2 = (actor2.targetSectors as string[]) || [];
    const commonSectors = sectors1.filter((s: string) => sectors2.includes(s));
    score += Math.min(commonSectors.length * 3, 15);

    // Tools
    const tools1 = (actor1.tools as string[]) || [];
    const tools2 = (actor2.tools as string[]) || [];
    const commonTools = tools1.filter((t: string) => tools2.includes(t));
    score += Math.min(commonTools.length * 2, 10);

    return Math.min(score, 100);
  }

  /**
   * Générer rapport de profil
   */
  static async generateProfileReport(
    tenantId: string,
    actorId: string
  ): Promise<string> {
    try {
      const actor = await this.getProfile(tenantId, actorId);

      if (!actor) {
        throw new Error('Threat actor not found');
      }

      let report = `# 🕵️ Profil Threat Actor: ${actor.name}\n\n`;
      
      // Aliases
      const aliases = (actor.aliases as string[]) || [];
      if (aliases.length > 0) {
        report += `**Aliases**: ${aliases.join(', ')}\n`;
      }
      report += `**Type**: ${actor.type}\n`;
      report += `**Status**: ${actor.status}\n`;
      report += `**Confidence**: ${actor.confidence}%\n`;
      report += `**Threat Level**: ${actor.threatLevel}\n\n`;

      // Attribution
      report += `## 🌍 Attribution\n\n`;
      if (actor.country) report += `**Pays**: ${actor.country}\n`;
      if (actor.sponsorship) report += `**Sponsorship**: ${actor.sponsorship}\n`;
      if (actor.motivation) report += `**Motivation**: ${actor.motivation}\n`;
      report += `**Sophistication**: ${actor.sophistication}\n\n`;

      // Timeline
      report += `## ⏰ Timeline\n\n`;
      report += `- **First Seen**: ${actor.firstSeen.toISOString()}\n`;
      report += `- **Last Seen**: ${actor.lastSeen.toISOString()}\n\n`;

      // Targets
      const targetSectors = (actor.targetSectors as string[]) || [];
      const targetCountries = (actor.targetCountries as string[]) || [];
      const targetTech = (actor.targetTech as string[]) || [];
      
      report += `## 🎯 Targets\n\n`;
      if (targetSectors.length > 0) {
        report += `### Secteurs\n`;
        targetSectors.forEach(s => report += `- ${s}\n`);
        report += `\n`;
      }
      if (targetCountries.length > 0) {
        report += `### Pays\n`;
        targetCountries.forEach(c => report += `- ${c}\n`);
        report += `\n`;
      }
      if (targetTech.length > 0) {
        report += `### Technologies\n`;
        targetTech.forEach(t => report += `- ${t}\n`);
        report += `\n`;
      }

      // TTPs
      if (actor.observedTTPs && actor.observedTTPs.length > 0) {
        report += `## 🔬 TTPs Observés (${actor.ttpCount})\n\n`;
        actor.observedTTPs.slice(0, 10).forEach((ttp: any) => {
          report += `- **${ttp.techniqueId}**: ${ttp.technique} (${ttp.tactic}) - Confidence: ${ttp.confidence}%\n`;
        });
        if (actor.ttpCount > 10) {
          report += `\n*... et ${actor.ttpCount - 10} autres techniques*\n`;
        }
        report += `\n`;
      }

      // Tools & Malware
      const tools = (actor.tools as string[]) || [];
      const malware = (actor.malwareFamilies as string[]) || [];
      
      if (tools.length > 0 || malware.length > 0) {
        report += `## 🛠️ Arsenal\n\n`;
        if (tools.length > 0) {
          report += `### Outils\n`;
          tools.forEach(t => report += `- ${t}\n`);
          report += `\n`;
        }
        if (malware.length > 0) {
          report += `### Malware\n`;
          malware.forEach(m => report += `- ${m}\n`);
          report += `\n`;
        }
      }

      // Infrastructure
      const ips = (actor.knownIPs as string[]) || [];
      const domains = (actor.knownDomains as string[]) || [];
      const emails = (actor.knownEmails as string[]) || [];
      
      if (ips.length > 0 || domains.length > 0 || emails.length > 0) {
        report += `## 🌐 Infrastructure\n\n`;
        if (ips.length > 0) {
          report += `**IPs**: ${ips.length} connue(s)\n`;
        }
        if (domains.length > 0) {
          report += `**Domaines**: ${domains.length} connu(s)\n`;
        }
        if (emails.length > 0) {
          report += `**Emails**: ${emails.length} connu(s)\n`;
        }
        report += `\n`;
      }

      // Campagnes
      if (actor.relatedCampaigns && actor.relatedCampaigns.length > 0) {
        report += `## 🎯 Campagnes Liées (${actor.campaignCount})\n\n`;
        actor.relatedCampaigns.forEach((camp: any) => {
          report += `- **${camp.name}** (${camp.status}) - Confidence: ${camp.confidence}%\n`;
        });
        report += `\n`;
      }

      // Description
      if (actor.description) {
        report += `## 📝 Description\n\n${actor.description}\n\n`;
      }

      // Sources
      const sources = (actor.sources as string[]) || [];
      if (sources.length > 0) {
        report += `## 📚 Sources\n\n`;
        sources.forEach(s => report += `- ${s}\n`);
        report += `\n`;
      }

      report += `---\n`;
      report += `*Rapport généré le ${new Date().toISOString()}*\n`;

      return report;
    } catch (error: any) {
      logger.error('Error generating profile report:', error.message);
      throw error;
    }
  }

  /**
   * Stats globales
   */
  static async getStats(tenantId: string): Promise<any> {
    const total = await prisma.threatActor.count({ where: { tenantId } });

    const byType = await prisma.threatActor.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: true
    });

    const byCountry = await prisma.threatActor.groupBy({
      by: ['country'],
      where: { tenantId, country: { not: null } },
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 10
    });

    const byThreatLevel = await prisma.threatActor.groupBy({
      by: ['threatLevel'],
      where: { tenantId },
      _count: true
    });

    const activeCount = await prisma.threatActor.count({
      where: { tenantId, status: 'active' }
    });

    return {
      total,
      active: activeCount,
      byType: byType.map(t => ({
        type: t.type,
        count: t._count
      })),
      byCountry: byCountry.map(c => ({
        country: c.country,
        count: c._count
      })),
      byThreatLevel: byThreatLevel.map(t => ({
        threatLevel: t.threatLevel,
        count: t._count
      }))
    };
  }
}



