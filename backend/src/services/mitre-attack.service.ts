/**
 * 🎯 MITRE ATT&CK Service
 * Mapping des menaces avec le framework MITRE ATT&CK
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface MITRETechnique {
  id: string;
  attackId: string;
  name: string;
  description: string;
  tactics: string[];
  platforms: string[];
  dataSource: string[];
  mitigations: string[];
  detections: string[];
  url: string;
}

interface MITRETactic {
  id: string;
  attackId: string;
  name: string;
  description: string;
  url: string;
}

interface AttackPattern {
  technique: MITRETechnique;
  confidence: number;
  evidence: string[];
}

export class MITREAttackService {
  private static readonly ATTACK_API_URL = 'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master';
  private static readonly ENTERPRISE_ATTACK_URL = `${this.ATTACK_API_URL}/enterprise-attack/enterprise-attack.json`;
  
  // Cache en mémoire (à déplacer vers Redis en production)
  private static cache: {
    techniques: Map<string, MITRETechnique>;
    tactics: Map<string, MITRETactic>;
    lastUpdate: Date | null;
  } = {
    techniques: new Map(),
    tactics: new Map(),
    lastUpdate: null
  };

  /**
   * Charger la base MITRE ATT&CK depuis GitHub
   */
  static async loadAttackData(): Promise<void> {
    try {
      // Vérifier si cache valide (rafraîchir toutes les 24h)
      if (this.cache.lastUpdate) {
        const hoursSinceUpdate = (Date.now() - this.cache.lastUpdate.getTime()) / 3600000;
        if (hoursSinceUpdate < 24 && this.cache.techniques.size > 0) {
          logger.info('MITRE ATT&CK cache still valid');
          return;
        }
      }

      logger.info('Loading MITRE ATT&CK data from GitHub...');

      const response = await axios.get(this.ENTERPRISE_ATTACK_URL, {
        timeout: 30000
      });

      const stixBundle = response.data;
      const objects = stixBundle.objects || [];

      // Parser techniques
      const techniques = objects.filter((obj: any) => obj.type === 'attack-pattern');
      techniques.forEach((tech: any) => {
        const attackId = tech.external_references?.[0]?.external_id || tech.id;
        
        this.cache.techniques.set(attackId, {
          id: tech.id,
          attackId,
          name: tech.name,
          description: tech.description || '',
          tactics: tech.kill_chain_phases?.map((kc: any) => kc.phase_name) || [],
          platforms: tech.x_mitre_platforms || [],
          dataSource: tech.x_mitre_data_sources || [],
          mitigations: [], // À remplir depuis relations
          detections: [], // À remplir depuis relations
          url: tech.external_references?.[0]?.url || `https://attack.mitre.org/techniques/${attackId}`
        });
      });

      // Parser tactics
      const tactics = objects.filter((obj: any) => obj.type === 'x-mitre-tactic');
      tactics.forEach((tactic: any) => {
        const attackId = tactic.external_references?.[0]?.external_id || tactic.id;
        
        this.cache.tactics.set(attackId, {
          id: tactic.id,
          attackId,
          name: tactic.name,
          description: tactic.description || '',
          url: tactic.external_references?.[0]?.url || `https://attack.mitre.org/tactics/${attackId}`
        });
      });

      this.cache.lastUpdate = new Date();

      logger.info(`MITRE ATT&CK data loaded: ${this.cache.techniques.size} techniques, ${this.cache.tactics.size} tactics`);
    } catch (error: any) {
      logger.error('Error loading MITRE ATT&CK data:', error.message);
      
      // Si échec, utiliser données minimales
      if (this.cache.techniques.size === 0) {
        this.loadFallbackData();
      }
    }
  }

  /**
   * Données de fallback si GitHub inaccessible
   */
  private static loadFallbackData(): void {
    logger.warn('Using fallback MITRE ATT&CK data');

    // Top 20 techniques les plus communes
    const fallbackTechniques = [
      { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'execution' },
      { id: 'T1055', name: 'Process Injection', tactic: 'defense-evasion' },
      { id: 'T1071', name: 'Application Layer Protocol', tactic: 'command-and-control' },
      { id: 'T1105', name: 'Ingress Tool Transfer', tactic: 'command-and-control' },
      { id: 'T1053', name: 'Scheduled Task/Job', tactic: 'execution' },
      { id: 'T1047', name: 'Windows Management Instrumentation', tactic: 'execution' },
      { id: 'T1036', name: 'Masquerading', tactic: 'defense-evasion' },
      { id: 'T1027', name: 'Obfuscated Files or Information', tactic: 'defense-evasion' },
      { id: 'T1566', name: 'Phishing', tactic: 'initial-access' },
      { id: 'T1204', name: 'User Execution', tactic: 'execution' },
      { id: 'T1082', name: 'System Information Discovery', tactic: 'discovery' },
      { id: 'T1083', name: 'File and Directory Discovery', tactic: 'discovery' },
      { id: 'T1090', name: 'Proxy', tactic: 'command-and-control' },
      { id: 'T1021', name: 'Remote Services', tactic: 'lateral-movement' },
      { id: 'T1560', name: 'Archive Collected Data', tactic: 'collection' },
      { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'impact' },
      { id: 'T1489', name: 'Service Stop', tactic: 'impact' },
      { id: 'T1490', name: 'Inhibit System Recovery', tactic: 'impact' },
      { id: 'T1570', name: 'Lateral Tool Transfer', tactic: 'lateral-movement' },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'persistence' }
    ];

    fallbackTechniques.forEach(tech => {
      this.cache.techniques.set(tech.id, {
        id: tech.id,
        attackId: tech.id,
        name: tech.name,
        description: `MITRE ATT&CK technique ${tech.id}`,
        tactics: [tech.tactic],
        platforms: ['Windows', 'Linux', 'macOS'],
        dataSource: [],
        mitigations: [],
        detections: [],
        url: `https://attack.mitre.org/techniques/${tech.id}`
      });
    });
  }

  /**
   * Mapper IOCs/Threats vers techniques MITRE
   */
  static async mapThreatToAttack(
    tenantId: string,
    threat: {
      id: string;
      type: string;
      indicators: string[];
      description?: string;
      behaviors?: string[];
    }
  ): Promise<AttackPattern[]> {
    try {
      // S'assurer que les données sont chargées
      if (this.cache.techniques.size === 0) {
        await this.loadAttackData();
      }

      const patterns: AttackPattern[] = [];

      // Analyser comportements
      if (threat.behaviors && threat.behaviors.length > 0) {
        const behaviorPatterns = this.mapBehaviorsToTechniques(threat.behaviors);
        patterns.push(...behaviorPatterns);
      }

      // Analyser description
      if (threat.description) {
        const descPatterns = this.mapDescriptionToTechniques(threat.description);
        patterns.push(...descPatterns);
      }

      // Analyser type de menace
      const typePatterns = this.mapThreatTypeToTechniques(threat.type);
      patterns.push(...typePatterns);

      // Déduplication et tri par confidence
      const uniquePatterns = this.deduplicatePatterns(patterns);
      uniquePatterns.sort((a, b) => b.confidence - a.confidence);

      // Sauvegarder mapping
      await this.saveThreatMapping(tenantId, threat.id, uniquePatterns);

      logger.info(`Mapped threat ${threat.id} to ${uniquePatterns.length} MITRE techniques`);

      return uniquePatterns;
    } catch (error: any) {
      logger.error('Error mapping threat to MITRE ATT&CK:', error.message);
      return [];
    }
  }

  /**
   * Mapper comportements → techniques
   */
  private static mapBehaviorsToTechniques(behaviors: string[]): AttackPattern[] {
    const patterns: AttackPattern[] = [];

    const behaviorMap: Record<string, { techniqueId: string; confidence: number }> = {
      // Execution
      'powershell': { techniqueId: 'T1059.001', confidence: 90 },
      'cmd': { techniqueId: 'T1059.003', confidence: 85 },
      'bash': { techniqueId: 'T1059.004', confidence: 85 },
      'script': { techniqueId: 'T1059', confidence: 75 },
      
      // Persistence
      'scheduled task': { techniqueId: 'T1053', confidence: 90 },
      'registry': { techniqueId: 'T1547', confidence: 85 },
      'service': { techniqueId: 'T1543', confidence: 85 },
      
      // Defense Evasion
      'obfuscation': { techniqueId: 'T1027', confidence: 80 },
      'masquerade': { techniqueId: 'T1036', confidence: 85 },
      'process injection': { techniqueId: 'T1055', confidence: 90 },
      
      // Discovery
      'reconnaissance': { techniqueId: 'T1082', confidence: 70 },
      'network scan': { techniqueId: 'T1046', confidence: 85 },
      'enumerate': { techniqueId: 'T1083', confidence: 75 },
      
      // Lateral Movement
      'remote desktop': { techniqueId: 'T1021.001', confidence: 90 },
      'smb': { techniqueId: 'T1021.002', confidence: 85 },
      'ssh': { techniqueId: 'T1021.004', confidence: 85 },
      
      // C2
      'http': { techniqueId: 'T1071.001', confidence: 70 },
      'dns': { techniqueId: 'T1071.004', confidence: 75 },
      'encrypted channel': { techniqueId: 'T1573', confidence: 80 },
      
      // Exfiltration
      'data transfer': { techniqueId: 'T1041', confidence: 75 },
      'exfiltration': { techniqueId: 'T1048', confidence: 85 },
      
      // Impact
      'ransomware': { techniqueId: 'T1486', confidence: 95 },
      'encryption': { techniqueId: 'T1486', confidence: 80 },
      'data destruction': { techniqueId: 'T1485', confidence: 90 },
      'service stop': { techniqueId: 'T1489', confidence: 85 }
    };

    behaviors.forEach(behavior => {
      const lowerBehavior = behavior.toLowerCase();
      
      Object.keys(behaviorMap).forEach(key => {
        if (lowerBehavior.includes(key)) {
          const mapping = behaviorMap[key];
          const technique = this.cache.techniques.get(mapping.techniqueId);
          
          if (technique) {
            patterns.push({
              technique,
              confidence: mapping.confidence,
              evidence: [behavior]
            });
          }
        }
      });
    });

    return patterns;
  }

  /**
   * Mapper description → techniques
   */
  private static mapDescriptionToTechniques(description: string): AttackPattern[] {
    const patterns: AttackPattern[] = [];
    const lowerDesc = description.toLowerCase();

    // Mots-clés pour techniques communes
    const keywords = {
      'phishing': 'T1566',
      'spearphishing': 'T1566.001',
      'malicious attachment': 'T1566.001',
      'credential dumping': 'T1003',
      'mimikatz': 'T1003',
      'lateral movement': 'T1021',
      'remote execution': 'T1047',
      'wmi': 'T1047',
      'brute force': 'T1110',
      'password spray': 'T1110.003'
    };

    Object.entries(keywords).forEach(([keyword, techniqueId]) => {
      if (lowerDesc.includes(keyword)) {
        const technique = this.cache.techniques.get(techniqueId);
        if (technique) {
          patterns.push({
            technique,
            confidence: 70,
            evidence: [`Description contains: ${keyword}`]
          });
        }
      }
    });

    return patterns;
  }

  /**
   * Mapper type de menace → techniques
   */
  private static mapThreatTypeToTechniques(type: string): AttackPattern[] {
    const patterns: AttackPattern[] = [];
    const lowerType = type.toLowerCase();

    const typeMap: Record<string, string[]> = {
      'ransomware': ['T1486', 'T1490', 'T1489'],
      'malware': ['T1059', 'T1055', 'T1027'],
      'phishing': ['T1566', 'T1204'],
      'apt': ['T1071', 'T1090', 'T1027'],
      'trojan': ['T1059', 'T1055', 'T1071'],
      'backdoor': ['T1071', 'T1105', 'T1573']
    };

    Object.entries(typeMap).forEach(([key, techniqueIds]) => {
      if (lowerType.includes(key)) {
        techniqueIds.forEach(techniqueId => {
          const technique = this.cache.techniques.get(techniqueId);
          if (technique) {
            patterns.push({
              technique,
              confidence: 60,
              evidence: [`Threat type: ${type}`]
            });
          }
        });
      }
    });

    return patterns;
  }

  /**
   * Déduplication des patterns
   */
  private static deduplicatePatterns(patterns: AttackPattern[]): AttackPattern[] {
    const map = new Map<string, AttackPattern>();

    patterns.forEach(pattern => {
      const existing = map.get(pattern.technique.attackId);
      
      if (existing) {
        // Merger evidence et prendre confidence max
        existing.confidence = Math.max(existing.confidence, pattern.confidence);
        existing.evidence.push(...pattern.evidence);
      } else {
        map.set(pattern.technique.attackId, pattern);
      }
    });

    return Array.from(map.values());
  }

  /**
   * Sauvegarder mapping threat → MITRE
   */
  private static async saveThreatMapping(
    tenantId: string,
    threatId: string,
    patterns: AttackPattern[]
  ): Promise<void> {
    try {
      // Sauvegarder dans DB (JSON dans commonIndicators pour simplification)
      const mappingData = patterns.map(p => ({
        techniqueId: p.technique.attackId,
        techniqueName: p.technique.name,
        tactics: p.technique.tactics,
        confidence: p.confidence,
        evidence: p.evidence
      }));

      // Créer ou mettre à jour correlation avec mapping MITRE
      // Créer mapping MITRE (ignorer si existe)
      await prisma.threatCorrelation.create({
        data: {
          tenantId,
          threatId,
          relatedThreatId: 'MITRE-ATTACK',
          confidenceScore: patterns.length > 0 ? patterns[0].confidence / 100 : 0,
          commonIndicators: mappingData
        }
      }).catch(() => {
        // Update si existe
        prisma.threatCorrelation.updateMany({
          where: {
            tenantId,
            threatId,
            relatedThreatId: 'MITRE-ATTACK'
          },
          data: {
            confidenceScore: patterns.length > 0 ? patterns[0].confidence / 100 : 0,
            commonIndicators: mappingData
          }
        });
      });

      logger.info(`Saved MITRE mapping for threat ${threatId}: ${patterns.length} techniques`);
    } catch (error: any) {
      logger.warn('Failed to save MITRE mapping:', error.message);
    }
  }

  /**
   * Obtenir technique par ID
   */
  static async getTechnique(techniqueId: string): Promise<MITRETechnique | null> {
    if (this.cache.techniques.size === 0) {
      await this.loadAttackData();
    }

    return this.cache.techniques.get(techniqueId) || null;
  }

  /**
   * Rechercher techniques par nom/description
   */
  static async searchTechniques(query: string): Promise<MITRETechnique[]> {
    if (this.cache.techniques.size === 0) {
      await this.loadAttackData();
    }

    const lowerQuery = query.toLowerCase();
    const results: MITRETechnique[] = [];

    this.cache.techniques.forEach(technique => {
      if (
        technique.name.toLowerCase().includes(lowerQuery) ||
        technique.description.toLowerCase().includes(lowerQuery) ||
        technique.attackId.toLowerCase().includes(lowerQuery)
      ) {
        results.push(technique);
      }
    });

    return results.slice(0, 50); // Limiter à 50 résultats
  }

  /**
   * Obtenir techniques par tactic
   */
  static async getTechniquesByTactic(tacticName: string): Promise<MITRETechnique[]> {
    if (this.cache.techniques.size === 0) {
      await this.loadAttackData();
    }

    const results: MITRETechnique[] = [];

    this.cache.techniques.forEach(technique => {
      if (technique.tactics.includes(tacticName.toLowerCase())) {
        results.push(technique);
      }
    });

    return results;
  }

  /**
   * Statistiques MITRE pour un tenant
   */
  static async getStats(tenantId: string): Promise<any> {
    const mappings = await prisma.threatCorrelation.findMany({
      where: {
        tenantId,
        relatedThreatId: 'MITRE-ATTACK'
      }
    });

    const techniqueFrequency: Record<string, number> = {};
    const tacticFrequency: Record<string, number> = {};

    mappings.forEach(mapping => {
      const techniques = (mapping.commonIndicators as any) || [];
      techniques.forEach((tech: any) => {
        techniqueFrequency[tech.techniqueId] = (techniqueFrequency[tech.techniqueId] || 0) + 1;
        
        tech.tactics?.forEach((tactic: string) => {
          tacticFrequency[tactic] = (tacticFrequency[tactic] || 0) + 1;
        });
      });
    });

    // Top 10 techniques
    const topTechniques = Object.entries(techniqueFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id, count]) => ({ id, count, name: this.cache.techniques.get(id)?.name }));

    // Top tactics
    const topTactics = Object.entries(tacticFrequency)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));

    return {
      totalMappings: mappings.length,
      uniqueTechniques: Object.keys(techniqueFrequency).length,
      topTechniques,
      topTactics,
      coveragePercent: Math.round((Object.keys(techniqueFrequency).length / this.cache.techniques.size) * 100)
    };
  }
}




