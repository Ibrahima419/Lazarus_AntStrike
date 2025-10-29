/**
 * 📊 Advanced Reporting Service
 * Génération de rapports avancés CTI (Executive, Technical, Tactical)
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  severity?: string[];
  type?: string[];
  status?: string[];
}

interface ExecutiveReport {
  period: string;
  summary: {
    totalThreats: number;
    criticalThreats: number;
    activeСampaigns: number;
    topThreatActors: string[];
    riskScore: number;
  };
  trends: any;
  topThreats: any[];
  recommendations: string[];
  generatedAt: Date;
}

interface TechnicalReport {
  period: string;
  iocAnalysis: any;
  ttpBreakdown: any;
  campaignDetails: any[];
  vulnerabilities: any[];
  mitigations: string[];
  generatedAt: Date;
}

interface TacticalReport {
  period: string;
  activeThreats: any[];
  iocs: any[];
  ttps: any[];
  hunting: any;
  actionItems: string[];
  generatedAt: Date;
}

export class AdvancedReportingService {
  /**
   * Générer rapport Executive (Management)
   */
  static async generateExecutiveReport(
    tenantId: string,
    filters: ReportFilter = {}
  ): Promise<ExecutiveReport> {
    try {
      logger.info('Generating executive report');

      const period = this.formatPeriod(filters.startDate, filters.endDate);

      // Calculer métriques principales
      const summary = await this.calculateExecutiveSummary(tenantId, filters);

      // Analyser tendances
      const trends = await this.analyzeTrends(tenantId, filters);

      // Top menaces
      const topThreats = await this.getTopThreats(tenantId, filters, 10);

      // Recommandations stratégiques
      const recommendations = this.generateExecutiveRecommendations(summary, trends);

      return {
        period,
        summary,
        trends,
        topThreats,
        recommendations,
        generatedAt: new Date()
      };
    } catch (error: any) {
      logger.error('Error generating executive report:', error.message);
      throw error;
    }
  }

  /**
   * Générer rapport Technical (SOC/Analysts)
   */
  static async generateTechnicalReport(
    tenantId: string,
    filters: ReportFilter = {}
  ): Promise<TechnicalReport> {
    try {
      logger.info('Generating technical report');

      const period = this.formatPeriod(filters.startDate, filters.endDate);

      // Analyse IOCs
      const iocAnalysis = await this.analyzeIOCs(tenantId, filters);

      // Breakdown TTPs
      const ttpBreakdown = await this.analyzeTTPs(tenantId, filters);

      // Détails campagnes
      const campaignDetails = await this.getCampaignDetails(tenantId, filters);

      // Vulnerabilités
      const vulnerabilities = await this.getVulnerabilities(tenantId, filters);

      // Mitigations techniques
      const mitigations = this.generateTechnicalMitigations(
        ttpBreakdown,
        vulnerabilities
      );

      return {
        period,
        iocAnalysis,
        ttpBreakdown,
        campaignDetails,
        vulnerabilities,
        mitigations,
        generatedAt: new Date()
      };
    } catch (error: any) {
      logger.error('Error generating technical report:', error.message);
      throw error;
    }
  }

  /**
   * Générer rapport Tactical (Hunt Teams)
   */
  static async generateTacticalReport(
    tenantId: string,
    filters: ReportFilter = {}
  ): Promise<TacticalReport> {
    try {
      logger.info('Generating tactical report');

      const period = this.formatPeriod(filters.startDate, filters.endDate);

      // Menaces actives
      const activeThreats = await this.getActiveThreats(tenantId, filters);

      // IOCs actionnables
      const iocs = await this.getActionableIOCs(tenantId, filters);

      // TTPs observés
      const ttps = await this.getObservedTTPs(tenantId, filters);

      // Queries de hunting
      const hunting = this.generateHuntingQueries(ttps);

      // Action items
      const actionItems = this.generateActionItems(activeThreats, iocs, ttps);

      return {
        period,
        activeThreats,
        iocs,
        ttps,
        hunting,
        actionItems,
        generatedAt: new Date()
      };
    } catch (error: any) {
      logger.error('Error generating tactical report:', error.message);
      throw error;
    }
  }

  /**
   * Générer rapport Markdown complet
   */
  static async generateMarkdownReport(
    tenantId: string,
    type: 'executive' | 'technical' | 'tactical',
    filters: ReportFilter = {}
  ): Promise<string> {
    try {
      logger.info(`Generating ${type} markdown report`);

      switch (type) {
        case 'executive':
          return await this.formatExecutiveMarkdown(tenantId, filters);
        case 'technical':
          return await this.formatTechnicalMarkdown(tenantId, filters);
        case 'tactical':
          return await this.formatTacticalMarkdown(tenantId, filters);
        default:
          throw new Error(`Invalid report type: ${type}`);
      }
    } catch (error: any) {
      logger.error('Error generating markdown report:', error.message);
      throw error;
    }
  }

  /**
   * Calculer résumé executive
   */
  private static async calculateExecutiveSummary(
    tenantId: string,
    filters: ReportFilter
  ): Promise<any> {
    const where: any = { tenantId };
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    // Total menaces
    const totalThreats = await prisma.threat.count({ where });

    // Menaces critiques
    const criticalThreats = await prisma.threat.count({
      where: { ...where, severity: 'critical' }
    });

    // Campagnes actives
    const activeðíampaigns = await prisma.campaign.count({
      where: { ...where, status: 'active' }
    });

    // Top threat actors
    const topActors = await prisma.threatActor.findMany({
      where: { tenantId, status: 'active' },
      orderBy: { confidence: 'desc' },
      take: 5,
      select: { name: true }
    });

    // Risk score (0-100)
    const riskScore = this.calculateRiskScore({
      totalThreats,
      criticalThreats,
      activeðíampaigns
    });

    return {
      totalThreats,
      criticalThreats,
      activeðíampaigns,
      topThreatActors: topActors.map(a => a.name),
      riskScore
    };
  }

  /**
   * Calculer risk score
   */
  private static calculateRiskScore(data: any): number {
    let score = 0;

    // Menaces critiques
    if (data.criticalThreats > 10) score += 40;
    else if (data.criticalThreats > 5) score += 30;
    else if (data.criticalThreats > 0) score += 20;

    // Campagnes actives
    if (data.activeCampaigns > 5) score += 30;
    else if (data.activeCampaigns > 2) score += 20;
    else if (data.activeCampaigns > 0) score += 10;

    // Total menaces
    if (data.totalThreats > 100) score += 30;
    else if (data.totalThreats > 50) score += 20;
    else if (data.totalThreats > 10) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Analyser tendances
   */
  private static async analyzeTrends(
    tenantId: string,
    filters: ReportFilter
  ): Promise<any> {
    // Menaces par jour (7 derniers jours)
    const threatsByDay: Record<string, number> = {};
    
    // Menaces par type
    const threatsByType = await prisma.threat.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: true
    });

    // Menaces par sévérité
    const threatsBySeverity = await prisma.threat.groupBy({
      by: ['severity'],
      where: { tenantId },
      _count: true
    });

    return {
      threatsByDay,
      threatsByType: threatsByType.map(t => ({
        type: t.type,
        count: t._count
      })),
      threatsBySeverity: threatsBySeverity.map(t => ({
        severity: t.severity,
        count: t._count
      }))
    };
  }

  /**
   * Obtenir top menaces
   */
  private static async getTopThreats(
    tenantId: string,
    filters: ReportFilter,
    limit: number
  ): Promise<any[]> {
    const threats = await prisma.threat.findMany({
      where: { tenantId },
      orderBy: [
        { severity: 'desc' },
        { confidence: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        type: true,
        severity: true,
        confidence: true,
        status: true
      }
    });

    return threats;
  }

  /**
   * Générer recommandations executive
   */
  private static generateExecutiveRecommendations(
    summary: any,
    trends: any
  ): string[] {
    const recommendations: string[] = [];

    if (summary.riskScore >= 70) {
      recommendations.push('URGENT: Risk score élevé - Renforcer la posture de sécurité immédiatement');
    }

    if (summary.criticalThreats > 5) {
      recommendations.push('Prioriser la remédiation des menaces critiques');
    }

    if (summary.activeCampaigns > 3) {
      recommendations.push('Augmenter la surveillance des campagnes actives');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintenir la posture de sécurité actuelle');
      recommendations.push('Continuer le monitoring proactif');
    }

    return recommendations;
  }

  /**
   * Analyser IOCs
   */
  private static async analyzeIOCs(
    tenantId: string,
    filters: ReportFilter
  ): Promise<any> {
    // IOCs par type depuis IOC History
    const iocsByType: Record<string, number> = {
      'IP': 0,
      'Domain': 0,
      'URL': 0,
      'Hash': 0,
      'Email': 0
    };

    const iocHistory = await prisma.iOCHistory.findMany({
      where: { tenantId },
      take: 1000
    });

    iocHistory.forEach(ioc => {
      const type = ioc.iocType;
      if (iocsByType[type] !== undefined) {
        iocsByType[type]++;
      }
    });

    // IOCs par reputation
    const iocsByReputation = await prisma.iOCHistory.groupBy({
      by: ['reputation'],
      where: { tenantId },
      _count: true
    });

    return {
      total: iocHistory.length,
      byType: iocsByType,
      byReputation: iocsByReputation.map(i => ({
        reputation: i.reputation,
        count: i._count
      }))
    };
  }

  /**
   * Analyser TTPs
   */
  private static async analyzeTTPs(
    tenantId: string,
    filters: ReportFilter
  ): Promise<any> {
    const ttps = await prisma.tTP.findMany({
      where: { tenantId }
    });

    // Par tactic
    const byTactic: Record<string, number> = {};
    ttps.forEach(ttp => {
      byTactic[ttp.tactic] = (byTactic[ttp.tactic] || 0) + 1;
    });

    // Top techniques
    const techniqueCount: Record<string, number> = {};
    ttps.forEach(ttp => {
      techniqueCount[ttp.techniqueId] = (techniqueCount[ttp.techniqueId] || 0) + 1;
    });

    const topTechniques = Object.entries(techniqueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ techniqueId: id, count }));

    return {
      total: ttps.length,
      byTactic,
      topTechniques
    };
  }

  /**
   * Obtenir détails campagnes
   */
  private static async getCampaignDetails(
    tenantId: string,
    filters: ReportFilter
  ): Promise<any[]> {
    const campaigns = await prisma.campaign.findMany({
      where: { tenantId, status: 'active' },
      include: { ttps: true },
      take: 20
    });

    return campaigns.map(c => ({
      id: c.id,
      name: c.name,
      threatActor: c.threatActor,
      status: c.status,
      confidence: c.confidence,
      ttpCount: c.ttps.length,
      firstSeen: c.firstSeen,
      lastSeen: c.lastSeen
    }));
  }

  /**
   * Obtenir vulnérabilités
   */
  private static async getVulnerabilities(
    tenantId: string,
    filters: ReportFilter
  ): Promise<any[]> {
    const cves = await prisma.cVEVulnerability.findMany({
      where: { tenantId },
      orderBy: { cvssScore: 'desc' },
      take: 20,
      select: {
        cveId: true,
        severity: true,
        cvssScore: true,
        exploitAvailable: true,
        patchAvailable: true
      }
    });

    return cves;
  }

  /**
   * Générer mitigations techniques
   */
  private static generateTechnicalMitigations(
    ttpBreakdown: any,
    vulnerabilities: any[]
  ): string[] {
    const mitigations: string[] = [];

    // Mitigations basées sur TTPs
    if (ttpBreakdown.byTactic['Initial Access']) {
      mitigations.push('Renforcer la détection phishing et accès initial');
    }
    if (ttpBreakdown.byTactic['Lateral Movement']) {
      mitigations.push('Segmenter le réseau et limiter mouvements latéraux');
    }
    if (ttpBreakdown.byTactic['Exfiltration']) {
      mitigations.push('Monitorer trafic sortant et bloquer exfiltration');
    }

    // Mitigations basées sur CVEs
    const criticalCVEs = vulnerabilities.filter(v => v.severity === 'critical');
    if (criticalCVEs.length > 0) {
      mitigations.push(`Patcher ${criticalCVEs.length} CVEs critiques immédiatement`);
    }

    return mitigations;
  }

  /**
   * Obtenir menaces actives
   */
  private static async getActiveThreats(
    tenantId: string,
    filters: ReportFilter
  ): Promise<any[]> {
    const threats = await prisma.threat.findMany({
      where: { tenantId, status: 'new' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        type: true,
        severity: true,
        confidence: true,
        iocs: true
      }
    });

    return threats;
  }

  /**
   * Obtenir IOCs actionnables
   */
  private static async getActionableIOCs(
    tenantId: string,
    filters: ReportFilter
  ): Promise<any[]> {
    const iocs = await prisma.iOCHistory.findMany({
      where: {
        tenantId,
        reputation: { in: ['malicious', 'suspicious'] },
        threatScore: { gte: 70 }
      },
      orderBy: { observedAt: 'desc' },
      take: 100,
      select: {
        iocValue: true,
        iocType: true,
        reputation: true,
        threatScore: true
      }
    });

    return iocs;
  }

  /**
   * Obtenir TTPs observés
   */
  private static async getObservedTTPs(
    tenantId: string,
    filters: ReportFilter
  ): Promise<any[]> {
    const ttps = await prisma.tTP.findMany({
      where: { tenantId },
      orderBy: { detectedAt: 'desc' },
      take: 50,
      select: {
        techniqueId: true,
        technique: true,
        tactic: true,
        confidence: true,
        evidence: true
      }
    });

    return ttps;
  }

  /**
   * Générer queries de hunting
   */
  private static generateHuntingQueries(ttps: any[]): any {
    const queries: any[] = [];

    // Queries basées sur TTPs observés
    const uniqueTechniques = [...new Set(ttps.map(t => t.techniqueId))];
    
    uniqueTechniques.slice(0, 5).forEach(techId => {
      queries.push({
        technique: techId,
        query: `Hunt for ${techId} indicators in logs`,
        priority: 'high'
      });
    });

    return {
      queries,
      count: queries.length
    };
  }

  /**
   * Générer action items
   */
  private static generateActionItems(
    threats: any[],
    iocs: any[],
    ttps: any[]
  ): string[] {
    const items: string[] = [];

    if (threats.length > 10) {
      items.push(`Investiguer ${threats.length} menaces actives`);
    }

    if (iocs.length > 0) {
      items.push(`Bloquer ${iocs.length} IOCs malicieux`);
    }

    if (ttps.length > 0) {
      items.push(`Chasser ${ttps.length} TTPs observés dans l'environnement`);
    }

    return items;
  }

  /**
   * Format period string
   */
  private static formatPeriod(startDate?: Date, endDate?: Date): string {
    if (!startDate && !endDate) return 'All time';
    if (!endDate) return `From ${startDate!.toISOString().split('T')[0]}`;
    if (!startDate) return `Until ${endDate.toISOString().split('T')[0]}`;
    return `${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`;
  }

  /**
   * Formater rapport Executive en Markdown
   */
  private static async formatExecutiveMarkdown(
    tenantId: string,
    filters: ReportFilter
  ): Promise<string> {
    const report = await this.generateExecutiveReport(tenantId, filters);

    let md = `# 📊 Executive Threat Intelligence Report\n\n`;
    md += `**Period**: ${report.period}\n`;
    md += `**Generated**: ${report.generatedAt.toISOString()}\n\n`;

    md += `## 🎯 Executive Summary\n\n`;
    md += `- **Total Threats**: ${report.summary.totalThreats}\n`;
    md += `- **Critical Threats**: ${report.summary.criticalThreats}\n`;
    const activeCampaignsCount = (report.summary as any).activeCampaigns || (report.summary as any).activeðíampaigns || 0;
    md += `- **Active Campaigns**: ${activeCampaignsCount}\n`;
    md += `- **Risk Score**: ${report.summary.riskScore}/100\n\n`;

    if (report.summary.topThreatActors.length > 0) {
      md += `### Top Threat Actors\n`;
      report.summary.topThreatActors.forEach((actor: string) => {
        md += `- ${actor}\n`;
      });
      md += `\n`;
    }

    md += `## 📈 Trends\n\n`;
    md += `### Threats by Type\n`;
    report.trends.threatsByType.forEach((t: any) => {
      md += `- **${t.type}**: ${t.count}\n`;
    });
    md += `\n`;

    md += `## 🔥 Top Threats\n\n`;
    report.topThreats.forEach((threat: any, i: number) => {
      md += `${i + 1}. **${threat.name}** (${threat.severity})\n`;
      md += `   - Type: ${threat.type}\n`;
      md += `   - Confidence: ${threat.confidence}%\n\n`;
    });

    md += `## 💡 Recommendations\n\n`;
    report.recommendations.forEach((rec: string) => {
      md += `- ${rec}\n`;
    });

    return md;
  }

  /**
   * Formater rapport Technical en Markdown
   */
  private static async formatTechnicalMarkdown(
    tenantId: string,
    filters: ReportFilter
  ): Promise<string> {
    const report = await this.generateTechnicalReport(tenantId, filters);

    let md = `# 🔬 Technical Threat Intelligence Report\n\n`;
    md += `**Period**: ${report.period}\n`;
    md += `**Generated**: ${report.generatedAt.toISOString()}\n\n`;

    md += `## 📍 IOC Analysis\n\n`;
    md += `**Total IOCs**: ${report.iocAnalysis.total}\n\n`;
    md += `### By Type\n`;
    Object.entries(report.iocAnalysis.byType).forEach(([type, count]) => {
      md += `- **${type}**: ${count}\n`;
    });
    md += `\n`;

    md += `## 🎯 TTP Breakdown\n\n`;
    md += `**Total TTPs**: ${report.ttpBreakdown.total}\n\n`;
    md += `### Top Techniques\n`;
    report.ttpBreakdown.topTechniques.forEach((tech: any, i: number) => {
      md += `${i + 1}. **${tech.techniqueId}** (${tech.count} occurrences)\n`;
    });
    md += `\n`;

    md += `## 🛡️ Mitigations\n\n`;
    report.mitigations.forEach((mit: string) => {
      md += `- ${mit}\n`;
    });

    return md;
  }

  /**
   * Formater rapport Tactical en Markdown
   */
  private static async formatTacticalMarkdown(
    tenantId: string,
    filters: ReportFilter
  ): Promise<string> {
    const report = await this.generateTacticalReport(tenantId, filters);

    let md = `# 🎯 Tactical Threat Intelligence Report\n\n`;
    md += `**Period**: ${report.period}\n`;
    md += `**Generated**: ${report.generatedAt.toISOString()}\n\n`;

    md += `## ⚠️ Active Threats (${report.activeThreats.length})\n\n`;
    report.activeThreats.slice(0, 10).forEach((threat: any, i: number) => {
      md += `${i + 1}. **${threat.name}** (${threat.severity})\n`;
    });
    md += `\n`;

    md += `## 🔍 Actionable IOCs (${report.iocs.length})\n\n`;
    report.iocs.slice(0, 20).forEach((ioc: any) => {
      md += `- \`${ioc.iocValue}\` (${ioc.iocType}) - ${ioc.reputation}\n`;
    });
    md += `\n`;

    md += `## ✅ Action Items\n\n`;
    report.actionItems.forEach((item: string) => {
      md += `- [ ] ${item}\n`;
    });

    return md;
  }
}



