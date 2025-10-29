/**
 * 💎 Diamond Model Service
 * Analyse des intrusions selon le modèle Diamond (Adversary, Capability, Infrastructure, Victim)
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface DiamondModel {
  adversary: AdversaryNode;
  capability: CapabilityNode;
  infrastructure: InfrastructureNode;
  victim: VictimNode;
  meta: DiamondMeta;
}

interface AdversaryNode {
  type: 'known' | 'suspected' | 'unknown';
  name?: string;
  aptGroup?: string;
  country?: string;
  motivation?: string[];
  confidence: number;
}

interface CapabilityNode {
  malwareFamily?: string;
  techniques: string[];
  ttps: string[];
  exploits: string[];
  confidence: number;
}

interface InfrastructureNode {
  ips: string[];
  domains: string[];
  urls: string[];
  infrastructureType?: string;
  hosting?: string;
  confidence: number;
}

interface VictimNode {
  tenantId: string;
  industry?: string;
  size?: string;
  country?: string;
  assets: string[];
  confidence: number;
}

interface DiamondMeta {
  timestamp: string;
  phase: string;
  result: string;
  direction: string;
  methodology: string;
}

export class DiamondModelService {
  /**
   * Construire le modèle Diamond pour une menace
   */
  static async buildDiamondModel(
    tenantId: string,
    threat: {
      id: string;
      iocs: string[];
      behaviors?: string[];
      mitreTechniques?: string[];
      description?: string;
      source?: string;
    }
  ): Promise<DiamondModel> {
    try {
      logger.info(`Building Diamond Model for threat ${threat.id}`);

      // Construire chaque nœud
      const adversary = await this.buildAdversaryNode(threat);
      const capability = this.buildCapabilityNode(threat);
      const infrastructure = this.buildInfrastructureNode(threat);
      const victim = await this.buildVictimNode(tenantId, threat);

      const meta: DiamondMeta = {
        timestamp: new Date().toISOString(),
        phase: this.inferPhase(threat),
        result: 'unknown',
        direction: 'adversary-to-victim',
        methodology: 'automated-analysis'
      };

      const model: DiamondModel = {
        adversary,
        capability,
        infrastructure,
        victim,
        meta
      };

      // Sauvegarder le modèle
      await this.saveDiamondModel(tenantId, threat.id, model);

      logger.info(`Diamond Model built for threat ${threat.id}`);

      return model;
    } catch (error: any) {
      logger.error('Error building Diamond Model:', error.message);
      throw error;
    }
  }

  /**
   * Construire le nœud Adversary
   */
  private static async buildAdversaryNode(threat: any): Promise<AdversaryNode> {
    let type: 'known' | 'suspected' | 'unknown' = 'unknown';
    let name: string | undefined;
    let aptGroup: string | undefined;
    let country: string | undefined;
    const motivation: string[] = [];
    let confidence = 30;

    // Analyser la description pour des mentions d'APT
    if (threat.description) {
      const lowerDesc = threat.description.toLowerCase();
      
      // APT groups connus
      const aptGroups = [
        { name: 'APT28', aliases: ['fancy bear', 'sofacy'], country: 'Russia' },
        { name: 'APT29', aliases: ['cozy bear', 'dukes'], country: 'Russia' },
        { name: 'APT32', aliases: ['ocean lotus'], country: 'Vietnam' },
        { name: 'APT33', aliases: ['elfin'], country: 'Iran' },
        { name: 'APT38', aliases: ['lazarus'], country: 'North Korea' },
        { name: 'APT40', aliases: ['leviathan'], country: 'China' },
        { name: 'APT41', aliases: ['double dragon'], country: 'China' }
      ];

      aptGroups.forEach(apt => {
        if (lowerDesc.includes(apt.name.toLowerCase()) || 
            apt.aliases.some(alias => lowerDesc.includes(alias))) {
          type = 'known';
          aptGroup = apt.name;
          country = apt.country;
          confidence = 85;
        }
      });

      // Motivations
      if (lowerDesc.includes('espionage') || lowerDesc.includes('cyber espionage')) {
        motivation.push('espionage');
      }
      if (lowerDesc.includes('financial') || lowerDesc.includes('ransom')) {
        motivation.push('financial-gain');
      }
      if (lowerDesc.includes('disrupt') || lowerDesc.includes('sabotage')) {
        motivation.push('disruption');
      }
      if (lowerDesc.includes('steal') || lowerDesc.includes('theft')) {
        motivation.push('data-theft');
      }
    }

    // Analyser source
    if (threat.source) {
      const lowerSource = threat.source.toLowerCase();
      if (lowerSource.includes('apt') || lowerSource.includes('group')) {
        type = type === 'unknown' ? 'suspected' : type;
        confidence += 20;
      }
    }

    return {
      type,
      name,
      aptGroup,
      country,
      motivation: motivation.length > 0 ? motivation : undefined,
      confidence: Math.min(confidence, 100)
    };
  }

  /**
   * Construire le nœud Capability
   */
  private static buildCapabilityNode(threat: any): CapabilityNode {
    const techniques: string[] = threat.mitreTechniques || [];
    const ttps: string[] = [];
    const exploits: string[] = [];
    let malwareFamily: string | undefined;
    let confidence = 50;

    // Détecter famille de malware
    if (threat.description) {
      const lowerDesc = threat.description.toLowerCase();
      
      const malwareFamilies = [
        'emotet', 'trickbot', 'ryuk', 'conti', 'lockbit',
        'cobalt strike', 'mimikatz', 'metasploit', 'powershell empire',
        'ransomware', 'trojan', 'backdoor', 'rootkit'
      ];

      malwareFamilies.forEach(family => {
        if (lowerDesc.includes(family)) {
          malwareFamily = family;
          confidence += 25;
        }
      });
    }

    // Extraire comportements comme TTPs
    if (threat.behaviors) {
      ttps.push(...threat.behaviors);
      confidence += 15;
    }

    // Détecter exploits (CVE)
    if (threat.description) {
      const cveMatches = threat.description.match(/CVE-\d{4}-\d{4,}/gi);
      if (cveMatches) {
        exploits.push(...cveMatches);
        confidence += 20;
      }
    }

    return {
      malwareFamily,
      techniques,
      ttps,
      exploits,
      confidence: Math.min(confidence, 100)
    };
  }

  /**
   * Construire le nœud Infrastructure
   */
  private static buildInfrastructureNode(threat: any): InfrastructureNode {
    const ips: string[] = [];
    const domains: string[] = [];
    const urls: string[] = [];
    let confidence = 40;

    if (threat.iocs && threat.iocs.length > 0) {
      threat.iocs.forEach((ioc: string) => {
        // IP
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc)) {
          ips.push(ioc);
          confidence += 10;
        }
        // URL
        else if (ioc.startsWith('http')) {
          urls.push(ioc);
          confidence += 10;
        }
        // Domain
        else if (/^[a-z0-9][a-z0-9-]+\.[a-z]{2,}$/i.test(ioc)) {
          domains.push(ioc);
          confidence += 10;
        }
      });
    }

    let infrastructureType: string | undefined;
    if (ips.length > domains.length) {
      infrastructureType = 'direct-ip';
    } else if (domains.length > 0) {
      infrastructureType = 'domain-based';
    }

    return {
      ips,
      domains,
      urls,
      infrastructureType,
      confidence: Math.min(confidence, 100)
    };
  }

  /**
   * Construire le nœud Victim
   */
  private static async buildVictimNode(tenantId: string, threat: any): Promise<VictimNode> {
    let confidence = 70;

    // Récupérer info du tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const settings = {} as any; // TODO: Implémenter settings depuis TenantConfiguration

    // Assets affectés
    const assets: string[] = [];
    if (threat.affectedAssets) {
      assets.push(...threat.affectedAssets);
      confidence += 15;
    }

    return {
      tenantId,
      industry: settings.industry,
      size: settings.companySize || 'unknown',
      country: settings.country,
      assets,
      confidence: Math.min(confidence, 100)
    };
  }

  /**
   * Inférer la phase de l'attaque
   */
  private static inferPhase(threat: any): string {
    if (!threat.behaviors || threat.behaviors.length === 0) {
      return 'unknown';
    }

    const behaviors = threat.behaviors.join(' ').toLowerCase();

    if (behaviors.includes('scan') || behaviors.includes('reconnaissance')) {
      return 'reconnaissance';
    }
    if (behaviors.includes('exploit') || behaviors.includes('delivery')) {
      return 'exploitation';
    }
    if (behaviors.includes('installation') || behaviors.includes('persistence')) {
      return 'installation';
    }
    if (behaviors.includes('c2') || behaviors.includes('command')) {
      return 'command-and-control';
    }
    if (behaviors.includes('exfiltration') || behaviors.includes('impact')) {
      return 'actions-on-objectives';
    }

    return 'unknown';
  }

  /**
   * Sauvegarder le modèle Diamond
   */
  private static async saveDiamondModel(
    tenantId: string,
    threatId: string,
    model: DiamondModel
  ): Promise<void> {
    try {
      // Stocker Diamond Model dans la description du threat pour l'instant
      // TODO: Créer table dédiée pour Diamond Models
      await prisma.threat.update({
        where: { id: threatId },
        data: {
          description: `${JSON.stringify(model, null, 2)}\n\n---\n\n${(await prisma.threat.findUnique({ where: { id: threatId } }))?.description || ''}`
        }
      });

      logger.info(`Saved Diamond Model for threat ${threatId}`);
    } catch (error: any) {
      logger.warn('Failed to save Diamond Model:', error.message);
    }
  }

  /**
   * Calculer confidence globale
   */
  private static calculateOverallConfidence(model: DiamondModel): number {
    const confidences = [
      model.adversary.confidence,
      model.capability.confidence,
      model.infrastructure.confidence,
      model.victim.confidence
    ];

    return confidences.reduce((a, b) => a + b, 0) / confidences.length / 100;
  }

  /**
   * Analyser les pivots (liens entre différents modèles Diamond)
   */
  static async analyzePivots(
    tenantId: string,
    models: DiamondModel[]
  ): Promise<any> {
    const pivots = {
      adversaryPivots: new Map<string, number>(),
      infrastructurePivots: new Map<string, number>(),
      capabilityPivots: new Map<string, number>()
    };

    // Compter les occurrences
    models.forEach(model => {
      // Adversary pivots
      if (model.adversary.aptGroup) {
        pivots.adversaryPivots.set(
          model.adversary.aptGroup,
          (pivots.adversaryPivots.get(model.adversary.aptGroup) || 0) + 1
        );
      }

      // Infrastructure pivots
      model.infrastructure.ips.forEach(ip => {
        pivots.infrastructurePivots.set(
          ip,
          (pivots.infrastructurePivots.get(ip) || 0) + 1
        );
      });

      model.infrastructure.domains.forEach(domain => {
        pivots.infrastructurePivots.set(
          domain,
          (pivots.infrastructurePivots.get(domain) || 0) + 1
        );
      });

      // Capability pivots
      if (model.capability.malwareFamily) {
        pivots.capabilityPivots.set(
          model.capability.malwareFamily,
          (pivots.capabilityPivots.get(model.capability.malwareFamily) || 0) + 1
        );
      }
    });

    return {
      topAdversaries: Array.from(pivots.adversaryPivots.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      topInfrastructure: Array.from(pivots.infrastructurePivots.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      topCapabilities: Array.from(pivots.capabilityPivots.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    };
  }

  /**
   * Générer rapport Diamond Model
   */
  static generateReport(model: DiamondModel): string {
    let report = '# Diamond Model Analysis\n\n';

    // Adversary
    report += '## 🎯 Adversary\n';
    report += `**Type**: ${model.adversary.type}\n`;
    report += `**Confidence**: ${model.adversary.confidence}%\n`;
    if (model.adversary.aptGroup) {
      report += `**APT Group**: ${model.adversary.aptGroup}\n`;
    }
    if (model.adversary.country) {
      report += `**Attributed Country**: ${model.adversary.country}\n`;
    }
    if (model.adversary.motivation) {
      report += `**Motivation**: ${model.adversary.motivation.join(', ')}\n`;
    }
    report += '\n';

    // Capability
    report += '## 🛠️ Capability\n';
    report += `**Confidence**: ${model.capability.confidence}%\n`;
    if (model.capability.malwareFamily) {
      report += `**Malware Family**: ${model.capability.malwareFamily}\n`;
    }
    if (model.capability.techniques.length > 0) {
      report += `**MITRE Techniques**: ${model.capability.techniques.join(', ')}\n`;
    }
    if (model.capability.exploits.length > 0) {
      report += `**Exploits**: ${model.capability.exploits.join(', ')}\n`;
    }
    report += '\n';

    // Infrastructure
    report += '## 🌐 Infrastructure\n';
    report += `**Confidence**: ${model.infrastructure.confidence}%\n`;
    if (model.infrastructure.infrastructureType) {
      report += `**Type**: ${model.infrastructure.infrastructureType}\n`;
    }
    if (model.infrastructure.ips.length > 0) {
      report += `**IPs**: ${model.infrastructure.ips.length} detected\n`;
    }
    if (model.infrastructure.domains.length > 0) {
      report += `**Domains**: ${model.infrastructure.domains.length} detected\n`;
    }
    report += '\n';

    // Victim
    report += '## 🎯 Victim\n';
    report += `**Confidence**: ${model.victim.confidence}%\n`;
    if (model.victim.industry) {
      report += `**Industry**: ${model.victim.industry}\n`;
    }
    if (model.victim.country) {
      report += `**Country**: ${model.victim.country}\n`;
    }
    if (model.victim.assets.length > 0) {
      report += `**Affected Assets**: ${model.victim.assets.join(', ')}\n`;
    }
    report += '\n';

    // Meta
    report += '## 📊 Metadata\n';
    report += `**Phase**: ${model.meta.phase}\n`;
    report += `**Direction**: ${model.meta.direction}\n`;
    report += `**Timestamp**: ${model.meta.timestamp}\n`;

    return report;
  }

  /**
   * Statistiques Diamond Model pour un tenant
   */
  static async getStats(tenantId: string): Promise<any> {
    const models = await prisma.threatCorrelation.findMany({
      where: {
        tenantId,
        relatedThreatId: 'DIAMOND-MODEL'
      }
    });

    const diamondModels: DiamondModel[] = models.map(m => m.commonIndicators as any);

    const stats = {
      totalModels: models.length,
      adversaryTypes: {} as Record<string, number>,
      avgConfidence: {
        adversary: 0,
        capability: 0,
        infrastructure: 0,
        victim: 0
      },
      topAPTGroups: [] as Array<[string, number]>,
      topMalwareFamilies: [] as Array<[string, number]>
    };

    diamondModels.forEach(model => {
      // Adversary types
      stats.adversaryTypes[model.adversary.type] = 
        (stats.adversaryTypes[model.adversary.type] || 0) + 1;

      // Avg confidence
      stats.avgConfidence.adversary += model.adversary.confidence;
      stats.avgConfidence.capability += model.capability.confidence;
      stats.avgConfidence.infrastructure += model.infrastructure.confidence;
      stats.avgConfidence.victim += model.victim.confidence;
    });

    if (models.length > 0) {
      stats.avgConfidence.adversary /= models.length;
      stats.avgConfidence.capability /= models.length;
      stats.avgConfidence.infrastructure /= models.length;
      stats.avgConfidence.victim /= models.length;
    }

    // Pivots
    const pivots = await this.analyzePivots(tenantId, diamondModels);
    stats.topAPTGroups = pivots.topAdversaries;
    stats.topMalwareFamilies = pivots.topCapabilities;

    return stats;
  }
}




