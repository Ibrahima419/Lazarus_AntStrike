/**
 * ⛓️ Kill Chain Analysis Service
 * Analyse des menaces selon le modèle Cyber Kill Chain (Lockheed Martin)
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

export enum KillChainPhase {
  RECONNAISSANCE = 'reconnaissance',
  WEAPONIZATION = 'weaponization',
  DELIVERY = 'delivery',
  EXPLOITATION = 'exploitation',
  INSTALLATION = 'installation',
  COMMAND_AND_CONTROL = 'command-and-control',
  ACTIONS_ON_OBJECTIVES = 'actions-on-objectives'
}

interface KillChainMapping {
  phase: KillChainPhase;
  confidence: number;
  indicators: string[];
  mitreMapping: string[];
  recommendations: string[];
}

export class KillChainService {
  /**
   * Analyser une menace selon la Kill Chain
   */
  static async analyzeKillChain(
    tenantId: string,
    threat: {
      id: string;
      iocs: string[];
      behaviors?: string[];
      mitreTechniques?: string[];
      description?: string;
    }
  ): Promise<KillChainMapping[]> {
    try {
      logger.info(`Analyzing kill chain for threat ${threat.id}`);

      const phases: KillChainMapping[] = [];

      // 1. Reconnaissance
      const reconPhase = this.detectReconnaissance(threat);
      if (reconPhase) phases.push(reconPhase);

      // 2. Weaponization
      const weaponPhase = this.detectWeaponization(threat);
      if (weaponPhase) phases.push(weaponPhase);

      // 3. Delivery
      const deliveryPhase = this.detectDelivery(threat);
      if (deliveryPhase) phases.push(deliveryPhase);

      // 4. Exploitation
      const exploitPhase = this.detectExploitation(threat);
      if (exploitPhase) phases.push(exploitPhase);

      // 5. Installation
      const installPhase = this.detectInstallation(threat);
      if (installPhase) phases.push(installPhase);

      // 6. Command & Control
      const c2Phase = this.detectC2(threat);
      if (c2Phase) phases.push(c2Phase);

      // 7. Actions on Objectives
      const actionsPhase = this.detectActions(threat);
      if (actionsPhase) phases.push(actionsPhase);

      // Sauvegarder l'analyse
      await this.saveKillChainAnalysis(tenantId, threat.id, phases);

      logger.info(`Kill chain analysis completed: ${phases.length} phases detected`);

      return phases;
    } catch (error: any) {
      logger.error('Error analyzing kill chain:', error.message);
      return [];
    }
  }

  /**
   * Phase 1: Reconnaissance
   */
  private static detectReconnaissance(threat: any): KillChainMapping | null {
    const indicators: string[] = [];
    const mitreMapping: string[] = [];
    let confidence = 0;

    // MITRE techniques liées
    const reconTechniques = ['T1595', 'T1592', 'T1589', 'T1590', 'T1591', 'T1598'];
    
    if (threat.mitreTechniques) {
      threat.mitreTechniques.forEach((tech: string) => {
        if (reconTechniques.some(rt => tech.startsWith(rt))) {
          mitreMapping.push(tech);
          confidence += 30;
        }
      });
    }

    // Comportements
    const reconBehaviors = ['scan', 'reconnaissance', 'enumeration', 'osint', 'footprinting'];
    if (threat.behaviors) {
      threat.behaviors.forEach((behavior: string) => {
        if (reconBehaviors.some(rb => behavior.toLowerCase().includes(rb))) {
          indicators.push(behavior);
          confidence += 20;
        }
      });
    }

    // Description
    if (threat.description) {
      const lowerDesc = threat.description.toLowerCase();
      if (lowerDesc.includes('scan') || lowerDesc.includes('reconnaissance')) {
        confidence += 15;
      }
    }

    if (confidence === 0) return null;

    return {
      phase: KillChainPhase.RECONNAISSANCE,
      confidence: Math.min(confidence, 100),
      indicators,
      mitreMapping,
      recommendations: [
        'Monitor network scanning activities',
        'Implement honeypots to detect reconnaissance',
        'Block suspicious IP ranges',
        'Enable web application firewall (WAF)'
      ]
    };
  }

  /**
   * Phase 2: Weaponization
   */
  private static detectWeaponization(threat: any): KillChainMapping | null {
    const indicators: string[] = [];
    const mitreMapping: string[] = [];
    let confidence = 0;

    // MITRE techniques
    const weaponTechniques = ['T1587', 'T1588', 'T1608'];
    
    if (threat.mitreTechniques) {
      threat.mitreTechniques.forEach((tech: string) => {
        if (weaponTechniques.some(wt => tech.startsWith(wt))) {
          mitreMapping.push(tech);
          confidence += 30;
        }
      });
    }

    // Comportements
    const weaponBehaviors = ['malware creation', 'exploit', 'payload', 'dropper', 'packer'];
    if (threat.behaviors) {
      threat.behaviors.forEach((behavior: string) => {
        if (weaponBehaviors.some(wb => behavior.toLowerCase().includes(wb))) {
          indicators.push(behavior);
          confidence += 25;
        }
      });
    }

    // IOCs - détection de malware
    if (threat.iocs && threat.iocs.length > 0) {
      const fileHashes = threat.iocs.filter((ioc: string) => 
        /^[a-f0-9]{32,64}$/i.test(ioc)
      );
      if (fileHashes.length > 0) {
        indicators.push(`${fileHashes.length} file hash(es) detected`);
        confidence += 20;
      }
    }

    if (confidence === 0) return null;

    return {
      phase: KillChainPhase.WEAPONIZATION,
      confidence: Math.min(confidence, 100),
      indicators,
      mitreMapping,
      recommendations: [
        'Deploy advanced malware detection',
        'Sandbox analysis for suspicious files',
        'Monitor file reputation services',
        'Implement code signing validation'
      ]
    };
  }

  /**
   * Phase 3: Delivery
   */
  private static detectDelivery(threat: any): KillChainMapping | null {
    const indicators: string[] = [];
    const mitreMapping: string[] = [];
    let confidence = 0;

    // MITRE techniques
    const deliveryTechniques = ['T1566', 'T1091', 'T1189', 'T1190', 'T1199'];
    
    if (threat.mitreTechniques) {
      threat.mitreTechniques.forEach((tech: string) => {
        if (deliveryTechniques.some(dt => tech.startsWith(dt))) {
          mitreMapping.push(tech);
          confidence += 30;
        }
      });
    }

    // Comportements
    const deliveryBehaviors = ['phishing', 'email', 'attachment', 'download', 'usb', 'drive-by'];
    if (threat.behaviors) {
      threat.behaviors.forEach((behavior: string) => {
        if (deliveryBehaviors.some(db => behavior.toLowerCase().includes(db))) {
          indicators.push(behavior);
          confidence += 25;
        }
      });
    }

    // IOCs - URLs et domains
    if (threat.iocs) {
      const urls = threat.iocs.filter((ioc: string) => ioc.startsWith('http'));
      const domains = threat.iocs.filter((ioc: string) => 
        /^[a-z0-9][a-z0-9-]+\.[a-z]{2,}$/i.test(ioc)
      );
      
      if (urls.length > 0 || domains.length > 0) {
        indicators.push(`${urls.length + domains.length} malicious URL/domain(s)`);
        confidence += 20;
      }
    }

    if (confidence === 0) return null;

    return {
      phase: KillChainPhase.DELIVERY,
      confidence: Math.min(confidence, 100),
      indicators,
      mitreMapping,
      recommendations: [
        'Email security gateway with sandboxing',
        'Anti-phishing training for users',
        'Web filtering and URL reputation',
        'Disable macros in Office documents',
        'USB device control policies'
      ]
    };
  }

  /**
   * Phase 4: Exploitation
   */
  private static detectExploitation(threat: any): KillChainMapping | null {
    const indicators: string[] = [];
    const mitreMapping: string[] = [];
    let confidence = 0;

    // MITRE techniques
    const exploitTechniques = ['T1203', 'T1210', 'T1211', 'T1212'];
    
    if (threat.mitreTechniques) {
      threat.mitreTechniques.forEach((tech: string) => {
        if (exploitTechniques.some(et => tech.startsWith(et))) {
          mitreMapping.push(tech);
          confidence += 35;
        }
      });
    }

    // Comportements
    const exploitBehaviors = ['exploit', 'vulnerability', 'cve', 'buffer overflow', 'injection'];
    if (threat.behaviors) {
      threat.behaviors.forEach((behavior: string) => {
        if (exploitBehaviors.some(eb => behavior.toLowerCase().includes(eb))) {
          indicators.push(behavior);
          confidence += 25;
        }
      });
    }

    // Description - CVE
    if (threat.description) {
      const cveMatches = threat.description.match(/CVE-\d{4}-\d{4,}/gi);
      if (cveMatches) {
        indicators.push(`${cveMatches.length} CVE(s) referenced`);
        confidence += 30;
      }
    }

    if (confidence === 0) return null;

    return {
      phase: KillChainPhase.EXPLOITATION,
      confidence: Math.min(confidence, 100),
      indicators,
      mitreMapping,
      recommendations: [
        'Patch management program',
        'Virtual patching for critical systems',
        'Intrusion Prevention System (IPS)',
        'Application whitelisting',
        'Disable unnecessary services'
      ]
    };
  }

  /**
   * Phase 5: Installation
   */
  private static detectInstallation(threat: any): KillChainMapping | null {
    const indicators: string[] = [];
    const mitreMapping: string[] = [];
    let confidence = 0;

    // MITRE techniques
    const installTechniques = ['T1543', 'T1547', 'T1053', 'T1574'];
    
    if (threat.mitreTechniques) {
      threat.mitreTechniques.forEach((tech: string) => {
        if (installTechniques.some(it => tech.startsWith(it))) {
          mitreMapping.push(tech);
          confidence += 30;
        }
      });
    }

    // Comportements
    const installBehaviors = ['persistence', 'installation', 'registry', 'service', 'scheduled task', 'autostart'];
    if (threat.behaviors) {
      threat.behaviors.forEach((behavior: string) => {
        if (installBehaviors.some(ib => behavior.toLowerCase().includes(ib))) {
          indicators.push(behavior);
          confidence += 25;
        }
      });
    }

    if (confidence === 0) return null;

    return {
      phase: KillChainPhase.INSTALLATION,
      confidence: Math.min(confidence, 100),
      indicators,
      mitreMapping,
      recommendations: [
        'Monitor registry changes',
        'Audit scheduled tasks',
        'Application control policies',
        'System integrity monitoring',
        'Restrict service creation'
      ]
    };
  }

  /**
   * Phase 6: Command & Control
   */
  private static detectC2(threat: any): KillChainMapping | null {
    const indicators: string[] = [];
    const mitreMapping: string[] = [];
    let confidence = 0;

    // MITRE techniques
    const c2Techniques = ['T1071', 'T1090', 'T1095', 'T1102', 'T1105', 'T1132', 'T1573'];
    
    if (threat.mitreTechniques) {
      threat.mitreTechniques.forEach((tech: string) => {
        if (c2Techniques.some(ct => tech.startsWith(ct))) {
          mitreMapping.push(tech);
          confidence += 30;
        }
      });
    }

    // Comportements
    const c2Behaviors = ['c2', 'command and control', 'beacon', 'callback', 'exfiltration', 'tunneling'];
    if (threat.behaviors) {
      threat.behaviors.forEach((behavior: string) => {
        if (c2Behaviors.some(cb => behavior.toLowerCase().includes(cb))) {
          indicators.push(behavior);
          confidence += 25;
        }
      });
    }

    // IOCs - IPs suspectes
    if (threat.iocs) {
      const ips = threat.iocs.filter((ioc: string) => 
        /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc)
      );
      if (ips.length > 0) {
        indicators.push(`${ips.length} suspicious IP(s)`);
        confidence += 20;
      }
    }

    if (confidence === 0) return null;

    return {
      phase: KillChainPhase.COMMAND_AND_CONTROL,
      confidence: Math.min(confidence, 100),
      indicators,
      mitreMapping,
      recommendations: [
        'Network traffic analysis',
        'DNS monitoring and filtering',
        'Proxy all outbound traffic',
        'Implement network segmentation',
        'Block suspicious IPs/domains'
      ]
    };
  }

  /**
   * Phase 7: Actions on Objectives
   */
  private static detectActions(threat: any): KillChainMapping | null {
    const indicators: string[] = [];
    const mitreMapping: string[] = [];
    let confidence = 0;

    // MITRE techniques
    const actionTechniques = ['T1485', 'T1486', 'T1489', 'T1490', 'T1491', 'T1498', 'T1499'];
    
    if (threat.mitreTechniques) {
      threat.mitreTechniques.forEach((tech: string) => {
        if (actionTechniques.some(at => tech.startsWith(at))) {
          mitreMapping.push(tech);
          confidence += 35;
        }
      });
    }

    // Comportements
    const actionBehaviors = ['ransomware', 'encryption', 'data destruction', 'exfiltration', 'ddos', 'defacement'];
    if (threat.behaviors) {
      threat.behaviors.forEach((behavior: string) => {
        if (actionBehaviors.some(ab => behavior.toLowerCase().includes(ab))) {
          indicators.push(behavior);
          confidence += 30;
        }
      });
    }

    if (confidence === 0) return null;

    return {
      phase: KillChainPhase.ACTIONS_ON_OBJECTIVES,
      confidence: Math.min(confidence, 100),
      indicators,
      mitreMapping,
      recommendations: [
        'Implement data loss prevention (DLP)',
        'Regular offline backups',
        'Incident response plan',
        'Network segmentation',
        'Privileged access management'
      ]
    };
  }

  /**
   * Sauvegarder l'analyse Kill Chain
   */
  private static async saveKillChainAnalysis(
    tenantId: string,
    threatId: string,
    phases: KillChainMapping[]
  ): Promise<void> {
    try {
      const analysisData = phases.map(p => ({
        phase: p.phase,
        confidence: p.confidence,
        indicators: p.indicators,
        mitreMapping: p.mitreMapping,
        recommendations: p.recommendations
      }));

      // Créer Kill Chain mapping (ignorer si existe)
      await prisma.threatCorrelation.create({
        data: {
          tenantId,
          threatId,
          relatedThreatId: 'KILL-CHAIN',
          confidenceScore: phases.length > 0 ? phases[0].confidence / 100 : 0,
          commonIndicators: analysisData
        }
      }).catch(() => {
        // Ignorer duplicate errors
      });

      logger.info(`Saved kill chain analysis for threat ${threatId}: ${phases.length} phases`);
    } catch (error: any) {
      logger.warn('Failed to save kill chain analysis:', error.message);
    }
  }

  /**
   * Obtenir statistiques Kill Chain pour un tenant
   */
  static async getStats(tenantId: string): Promise<any> {
    const analyses = await prisma.threatCorrelation.findMany({
      where: {
        tenantId,
        relatedThreatId: 'KILL-CHAIN'
      }
    });

    const phaseFrequency: Record<string, number> = {};
    
    analyses.forEach(analysis => {
      const phases = (analysis.commonIndicators as any) || [];
      phases.forEach((phase: any) => {
        phaseFrequency[phase.phase] = (phaseFrequency[phase.phase] || 0) + 1;
      });
    });

    return {
      totalAnalyses: analyses.length,
      phaseDistribution: phaseFrequency,
      avgPhasesPerThreat: analyses.length > 0 
        ? Object.values(phaseFrequency).reduce((a, b) => a + b, 0) / analyses.length 
        : 0
    };
  }

  /**
   * Générer rapport Kill Chain
   */
  static generateReport(phases: KillChainMapping[]): string {
    let report = '# Cyber Kill Chain Analysis\n\n';
    
    phases.forEach((phase, index) => {
      report += `## ${index + 1}. ${phase.phase.replace(/-/g, ' ').toUpperCase()}\n`;
      report += `**Confidence**: ${phase.confidence}%\n\n`;
      
      if (phase.indicators.length > 0) {
        report += '**Indicators**:\n';
        phase.indicators.forEach(ind => report += `- ${ind}\n`);
        report += '\n';
      }
      
      if (phase.mitreMapping.length > 0) {
        report += '**MITRE ATT&CK Techniques**:\n';
        phase.mitreMapping.forEach(tech => report += `- ${tech}\n`);
        report += '\n';
      }
      
      report += '**Recommendations**:\n';
      phase.recommendations.forEach(rec => report += `- ${rec}\n`);
      report += '\n---\n\n';
    });

    return report;
  }
}




