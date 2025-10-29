/**
 * 🎯 Campaign Tracking Service
 * Suivi et analyse des campagnes d'attaque (APT, ransomware, etc.)
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface CampaignInput {
  name: string;
  description?: string;
  threatActor?: string;
  motivation?: string;
  sophistication?: 'low' | 'medium' | 'high' | 'advanced' | 'unknown';
  country?: string;
  targetSectors?: string[];
  targetCountries?: string[];
  targetAssets?: string[];
  iocs?: string[];
  tags?: string[];
  confidence?: number;
}

interface CampaignActivity {
  campaignId: string;
  activityType: 'ioc_observed' | 'ttp_detected' | 'victim_added' | 'target_updated';
  data: any;
  timestamp: Date;
}

export class CampaignTrackingService {
  /**
   * Créer une nouvelle campagne
   */
  static async createCampaign(
    tenantId: string,
    input: CampaignInput
  ): Promise<any> {
    try {
      logger.info(`Creating campaign: ${input.name}`);

      const campaign = await prisma.campaign.create({
        data: {
          tenantId,
          name: input.name,
          description: input.description,
          threatActor: input.threatActor,
          motivation: input.motivation,
          sophistication: input.sophistication || 'unknown',
          country: input.country,
          targetSectors: input.targetSectors || [],
          targetCountries: input.targetCountries || [],
          targetAssets: input.targetAssets || [],
          iocs: input.iocs || [],
          tags: input.tags || [],
          confidence: input.confidence || 50,
          status: 'active'
        }
      });

      logger.info(`Campaign created: ${campaign.id}`);
      return campaign;
    } catch (error: any) {
      logger.error('Error creating campaign:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir une campagne par ID
   */
  static async getCampaign(
    tenantId: string,
    campaignId: string
  ): Promise<any> {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        tenantId
      },
      include: {
        ttps: {
          orderBy: { confidence: 'desc' }
        }
      }
    });

    if (!campaign) {
      return null;
    }

    // Calculer métriques
    const metrics = await this.calculateCampaignMetrics(tenantId, campaignId);

    return {
      ...campaign,
      metrics
    };
  }

  /**
   * Lister les campagnes
   */
  static async listCampaigns(
    tenantId: string,
    filters?: {
      status?: string;
      threatActor?: string;
      minConfidence?: number;
    }
  ): Promise<any[]> {
    const where: any = { tenantId };

    if (filters?.status) where.status = filters.status;
    if (filters?.threatActor) where.threatActor = filters.threatActor;
    if (filters?.minConfidence) {
      where.confidence = { gte: filters.minConfidence };
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        ttps: true
      },
      orderBy: { lastSeen: 'desc' }
    });

    return campaigns;
  }

  /**
   * Mettre à jour une campagne
   */
  static async updateCampaign(
    tenantId: string,
    campaignId: string,
    updates: Partial<CampaignInput>
  ): Promise<any> {
    try {
      const campaign = await prisma.campaign.updateMany({
        where: {
          id: campaignId,
          tenantId
        },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      logger.info(`Campaign updated: ${campaignId}`);
      return campaign;
    } catch (error: any) {
      logger.error('Error updating campaign:', error.message);
      throw error;
    }
  }

  /**
   * Ajouter IOC à une campagne
   */
  static async addIOC(
    tenantId: string,
    campaignId: string,
    ioc: string
  ): Promise<any> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const currentIOCs = (campaign.iocs as string[]) || [];
      
      if (currentIOCs.includes(ioc)) {
        return { message: 'IOC already exists', added: false };
      }

      const updated = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          iocs: [...currentIOCs, ioc],
          lastSeen: new Date()
        }
      });

      logger.info(`IOC added to campaign ${campaignId}: ${ioc}`);
      return { campaign: updated, added: true };
    } catch (error: any) {
      logger.error('Error adding IOC:', error.message);
      throw error;
    }
  }

  /**
   * Lier un TTP à une campagne
   */
  static async linkTTP(
    tenantId: string,
    campaignId: string,
    ttpId: string
  ): Promise<any> {
    try {
      // Vérifier que la campagne existe
      const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Lier le TTP
      const ttp = await prisma.tTP.update({
        where: { id: ttpId },
        data: {
          campaignId
        }
      });

      // Mettre à jour lastSeen
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { lastSeen: new Date() }
      });

      logger.info(`TTP ${ttpId} linked to campaign ${campaignId}`);
      return ttp;
    } catch (error: any) {
      logger.error('Error linking TTP:', error.message);
      throw error;
    }
  }

  /**
   * Auto-détecter campagnes depuis IOCs/TTPs
   */
  static async autoDetectCampaign(
    tenantId: string,
    data: {
      iocs?: string[];
      ttps?: string[]; // TTP IDs
      threatActor?: string;
    }
  ): Promise<any> {
    try {
      logger.info('Auto-detecting campaign from IOCs/TTPs');

      // Chercher campagnes existantes avec overlap
      const existingCampaigns = await prisma.campaign.findMany({
        where: { tenantId, status: 'active' },
        include: { ttps: true }
      });

      const matches: any[] = [];

      for (const campaign of existingCampaigns) {
        let score = 0;
        const reasons: string[] = [];

        // Match IOCs
        if (data.iocs && data.iocs.length > 0) {
          const campaignIOCs = (campaign.iocs as string[]) || [];
          const commonIOCs = data.iocs.filter(ioc => campaignIOCs.includes(ioc));
          
          if (commonIOCs.length > 0) {
            score += commonIOCs.length * 20;
            reasons.push(`${commonIOCs.length} IOC(s) commun(s)`);
          }
        }

        // Match TTPs
        if (data.ttps && data.ttps.length > 0) {
          const campaignTTPIds = campaign.ttps.map(t => t.id);
          const commonTTPs = data.ttps.filter(ttpId => campaignTTPIds.includes(ttpId));
          
          if (commonTTPs.length > 0) {
            score += commonTTPs.length * 30;
            reasons.push(`${commonTTPs.length} TTP(s) commun(s)`);
          }
        }

        // Match Threat Actor
        if (data.threatActor && campaign.threatActor === data.threatActor) {
          score += 40;
          reasons.push('Même threat actor');
        }

        if (score >= 50) {
          matches.push({
            campaign,
            score,
            reasons
          });
        }
      }

      // Trier par score
      matches.sort((a, b) => b.score - a.score);

      return {
        found: matches.length > 0,
        matches: matches.slice(0, 5), // Top 5
        suggestion: matches.length > 0 
          ? `${matches.length} campagne(s) potentielle(s) détectée(s)`
          : 'Aucune campagne existante ne correspond - créer nouvelle campagne ?'
      };
    } catch (error: any) {
      logger.error('Error auto-detecting campaign:', error.message);
      throw error;
    }
  }

  /**
   * Calculer métriques d'une campagne
   */
  static async calculateCampaignMetrics(
    tenantId: string,
    campaignId: string
  ): Promise<any> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
        include: { ttps: true }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const iocs = (campaign.iocs as string[]) || [];
      const ttps = campaign.ttps;

      // Durée de la campagne
      const durationMs = campaign.lastSeen.getTime() - campaign.firstSeen.getTime();
      const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

      // TTPs par tactic
      const tacticDistribution: Record<string, number> = {};
      ttps.forEach(ttp => {
        tacticDistribution[ttp.tactic] = (tacticDistribution[ttp.tactic] || 0) + 1;
      });

      // Confidence moyenne TTPs
      const avgTTPConfidence = ttps.length > 0
        ? Math.round(ttps.reduce((sum, t) => sum + t.confidence, 0) / ttps.length)
        : 0;

      // Coverage MITRE ATT&CK
      const uniqueTactics = new Set(ttps.map(t => t.tacticId)).size;
      const coverageScore = Math.round((uniqueTactics / 12) * 100);

      // Sophistication score
      const sophisticationMap = {
        low: 20,
        medium: 40,
        high: 60,
        advanced: 80,
        unknown: 30
      };
      const sophisticationScore = sophisticationMap[campaign.sophistication as keyof typeof sophisticationMap] || 30;

      return {
        duration: {
          days: durationDays,
          firstSeen: campaign.firstSeen,
          lastSeen: campaign.lastSeen
        },
        iocCount: iocs.length,
        ttpCount: ttps.length,
        tacticDistribution,
        avgTTPConfidence,
        coverageScore,
        sophisticationScore,
        victimCount: campaign.victimCount,
        targetSectors: (campaign.targetSectors as string[]) || [],
        targetCountries: (campaign.targetCountries as string[]) || []
      };
    } catch (error: any) {
      logger.error('Error calculating campaign metrics:', error.message);
      throw error;
    }
  }

  /**
   * Corréler campagnes (similarité)
   */
  static async correlateCampaigns(
    tenantId: string,
    campaignId: string
  ): Promise<any[]> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
        include: { ttps: true }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const otherCampaigns = await prisma.campaign.findMany({
        where: {
          tenantId,
          id: { not: campaignId }
        },
        include: { ttps: true }
      });

      const correlations: any[] = [];

      for (const other of otherCampaigns) {
        let similarity = 0;
        const commonFactors: string[] = [];

        // IOCs communs
        const campaignIOCs = (campaign.iocs as string[]) || [];
        const otherIOCs = (other.iocs as string[]) || [];
        const commonIOCs = campaignIOCs.filter(ioc => otherIOCs.includes(ioc));
        
        if (commonIOCs.length > 0) {
          similarity += commonIOCs.length * 15;
          commonFactors.push(`${commonIOCs.length} IOC(s) commun(s)`);
        }

        // TTPs communs (par technique ID)
        const campaignTechniques = campaign.ttps.map(t => t.techniqueId);
        const otherTechniques = other.ttps.map(t => t.techniqueId);
        const commonTechniques = campaignTechniques.filter(t => otherTechniques.includes(t));
        
        if (commonTechniques.length > 0) {
          similarity += commonTechniques.length * 20;
          commonFactors.push(`${commonTechniques.length} technique(s) commune(s)`);
        }

        // Même threat actor
        if (campaign.threatActor && campaign.threatActor === other.threatActor) {
          similarity += 30;
          commonFactors.push('Même threat actor');
        }

        // Même motivation
        if (campaign.motivation && campaign.motivation === other.motivation) {
          similarity += 10;
          commonFactors.push('Même motivation');
        }

        // Mêmes secteurs ciblés
        const targetSectors1 = (campaign.targetSectors as string[]) || [];
        const targetSectors2 = (other.targetSectors as string[]) || [];
        const commonSectors = targetSectors1.filter(s => targetSectors2.includes(s));
        
        if (commonSectors.length > 0) {
          similarity += commonSectors.length * 5;
          commonFactors.push(`${commonSectors.length} secteur(s) ciblé(s) en commun`);
        }

        if (similarity >= 30) {
          correlations.push({
            campaign: {
              id: other.id,
              name: other.name,
              threatActor: other.threatActor,
              status: other.status
            },
            similarity,
            commonFactors
          });
        }
      }

      // Trier par similarité
      correlations.sort((a, b) => b.similarity - a.similarity);

      return correlations;
    } catch (error: any) {
      logger.error('Error correlating campaigns:', error.message);
      throw error;
    }
  }

  /**
   * Générer rapport de campagne
   */
  static async generateCampaignReport(
    tenantId: string,
    campaignId: string
  ): Promise<string> {
    try {
      const campaign = await this.getCampaign(tenantId, campaignId);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const correlations = await this.correlateCampaigns(tenantId, campaignId);

      let report = `# 🎯 Rapport Campagne: ${campaign.name}\n\n`;
      report += `**ID**: ${campaign.id}\n`;
      report += `**Status**: ${campaign.status}\n`;
      report += `**Confidence**: ${campaign.confidence}%\n\n`;

      // Attribution
      report += `## 🕵️ Attribution\n\n`;
      if (campaign.threatActor) report += `**Threat Actor**: ${campaign.threatActor}\n`;
      if (campaign.motivation) report += `**Motivation**: ${campaign.motivation}\n`;
      if (campaign.country) report += `**Pays**: ${campaign.country}\n`;
      report += `**Sophistication**: ${campaign.sophistication}\n\n`;

      // Timeline
      report += `## ⏰ Timeline\n\n`;
      report += `- **First Seen**: ${campaign.firstSeen.toISOString()}\n`;
      report += `- **Last Seen**: ${campaign.lastSeen.toISOString()}\n`;
      report += `- **Durée**: ${campaign.metrics.duration.days} jour(s)\n\n`;

      // Scope
      report += `## 🎯 Scope\n\n`;
      report += `- **Victimes**: ${campaign.victimCount}\n`;
      report += `- **IOCs**: ${campaign.metrics.iocCount}\n`;
      report += `- **TTPs**: ${campaign.metrics.ttpCount}\n`;
      report += `- **Coverage MITRE**: ${campaign.metrics.coverageScore}%\n\n`;

      // Targets
      if (campaign.metrics.targetSectors.length > 0) {
        report += `### Secteurs Ciblés\n`;
        campaign.metrics.targetSectors.forEach((s: string) => {
          report += `- ${s}\n`;
        });
        report += `\n`;
      }

      if (campaign.metrics.targetCountries.length > 0) {
        report += `### Pays Ciblés\n`;
        campaign.metrics.targetCountries.forEach((c: string) => {
          report += `- ${c}\n`;
        });
        report += `\n`;
      }

      // TTPs
      report += `## 🔬 Tactics & Techniques\n\n`;
      const tactics = campaign.metrics.tacticDistribution;
      Object.entries(tactics).forEach(([tactic, count]) => {
        report += `- **${tactic}**: ${count} technique(s)\n`;
      });
      report += `\n**Confidence Moyenne**: ${campaign.metrics.avgTTPConfidence}%\n\n`;

      // Correlations
      if (correlations.length > 0) {
        report += `## 🔗 Campagnes Corrélées\n\n`;
        correlations.slice(0, 5).forEach(corr => {
          report += `### ${corr.campaign.name} (${corr.similarity}% similarité)\n`;
          corr.commonFactors.forEach((f: string) => {
            report += `- ${f}\n`;
          });
          report += `\n`;
        });
      }

      // Description
      if (campaign.description) {
        report += `## 📝 Description\n\n${campaign.description}\n\n`;
      }

      report += `---\n`;
      report += `*Rapport généré le ${new Date().toISOString()}*\n`;

      return report;
    } catch (error: any) {
      logger.error('Error generating campaign report:', error.message);
      throw error;
    }
  }

  /**
   * Stats globales campagnes
   */
  static async getStats(tenantId: string): Promise<any> {
    const total = await prisma.campaign.count({ where: { tenantId } });

    const byStatus = await prisma.campaign.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true
    });

    const topThreatActors = await prisma.campaign.groupBy({
      by: ['threatActor'],
      where: { tenantId, threatActor: { not: null } },
      _count: true,
      orderBy: { _count: { threatActor: 'desc' } },
      take: 10
    });

    const bySophistication = await prisma.campaign.groupBy({
      by: ['sophistication'],
      where: { tenantId },
      _count: true
    });

    return {
      total,
      byStatus: byStatus.map(s => ({
        status: s.status,
        count: s._count
      })),
      topThreatActors: topThreatActors.map(t => ({
        threatActor: t.threatActor,
        count: t._count
      })),
      bySophistication: bySophistication.map(s => ({
        sophistication: s.sophistication,
        count: s._count
      }))
    };
  }
}



