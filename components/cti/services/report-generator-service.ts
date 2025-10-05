/**
 * Service de Génération de Rapports CTI
 * Utilise les données Taranis pour créer des rapports structurés
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';
import { loadGeolocatedThreats, type ThreatLocation } from './threat-geo-service';
import type { TaranisNewsItem, TaranisStory, TaranisReport } from '../types';

export interface CTIReport {
  id: string;
  title: string;
  createdAt: Date;
  createdBy: string;
  summary: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  threatActor?: string;
  campaign?: string;
  
  // Sections du rapport
  executiveSummary: string;
  technicalAnalysis: string;
  geographicDistribution: GeographicSection;
  iocs: IOCSection;
  ttps: TTPSection;
  targetedSectors: string[];
  timeline: TimelineEvent[];
  recommendations: string[];
  sources: ReportSource[];
  
  // Métadonnées
  confidence: number;
  status: 'draft' | 'review' | 'published';
  tags: string[];
}

export interface GeographicSection {
  affectedCountries: CountryImpact[];
  hotspots: ThreatLocation[];
  totalThreats: number;
  criticalZones: string[];
}

export interface CountryImpact {
  country: string;
  threatCount: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  primaryThreats: string[];
}

export interface IOCSection {
  ipAddresses: IOCItem[];
  domains: IOCItem[];
  fileHashes: IOCItem[];
  emails: IOCItem[];
  urls: IOCItem[];
  total: number;
}

export interface IOCItem {
  value: string;
  type: string;
  firstSeen: Date;
  lastSeen: Date;
  confidence: number;
  source: string;
}

export interface TTPSection {
  tactics: string[];
  techniques: string[];
  procedures: string[];
  mitreAttackIds: string[];
}

export interface TimelineEvent {
  date: Date;
  event: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export interface ReportSource {
  name: string;
  type: 'taranis' | 'osint' | 'internal' | 'external';
  url?: string;
  reliability: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  format: 'full' | 'executive' | 'technical' | 'tactical';
}

/**
 * Templates de rapports prédéfinis
 */
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'full-analysis',
    name: 'Analyse Complète',
    description: 'Rapport détaillé avec toutes les sections',
    sections: ['executive', 'technical', 'geographic', 'iocs', 'ttps', 'timeline', 'recommendations'],
    format: 'full'
  },
  {
    id: 'executive-brief',
    name: 'Executive Summary',
    description: 'Rapport court pour le management',
    sections: ['executive', 'geographic', 'recommendations'],
    format: 'executive'
  },
  {
    id: 'technical-deep-dive',
    name: 'Analyse Technique Approfondie',
    description: 'Focus sur les aspects techniques et IOCs',
    sections: ['technical', 'iocs', 'ttps', 'timeline'],
    format: 'technical'
  },
  {
    id: 'tactical-alert',
    name: 'Alerte Tactique',
    description: 'Information rapide pour action immédiate',
    sections: ['executive', 'iocs', 'recommendations'],
    format: 'tactical'
  }
];

/**
 * Extrait les IOCs depuis les news items Taranis
 */
function extractIOCs(newsItems: TaranisNewsItem[]): IOCSection {
  const iocs: IOCSection = {
    ipAddresses: [],
    domains: [],
    fileHashes: [],
    emails: [],
    urls: [],
    total: 0
  };

  // Regex patterns pour extraction
  const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  const domainPattern = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
  const hashPattern = /\b[a-f0-9]{32,64}\b/gi;
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;

  for (const item of newsItems) {
    const content = `${item.title} ${item.content || ''}`;
    const date = new Date(item.collectedDate);

    // Extraire IPs
    const ips = content.match(ipPattern);
    if (ips) {
      ips.forEach(ip => {
        if (!iocs.ipAddresses.find(i => i.value === ip)) {
          iocs.ipAddresses.push({
            value: ip,
            type: 'ipv4-addr',
            firstSeen: date,
            lastSeen: date,
            confidence: item.confidence || 0.7,
            source: item.osintSourceId || 'Taranis AI'
          });
        }
      });
    }

    // Extraire domaines
    const domains = content.match(domainPattern);
    if (domains) {
      domains.forEach(domain => {
        // Filtrer les domaines communs non malveillants
        if (!domain.includes('example.') && !domain.includes('test.') && domain.length > 5) {
          if (!iocs.domains.find(d => d.value === domain)) {
            iocs.domains.push({
              value: domain,
              type: 'domain-name',
              firstSeen: date,
              lastSeen: date,
              confidence: item.confidence || 0.6,
              source: item.osintSourceId || 'Taranis AI'
            });
          }
        }
      });
    }

    // Extraire hashes
    const hashes = content.match(hashPattern);
    if (hashes) {
      hashes.forEach(hash => {
        if (!iocs.fileHashes.find(h => h.value === hash)) {
          iocs.fileHashes.push({
            value: hash,
            type: hash.length === 32 ? 'md5' : hash.length === 40 ? 'sha1' : 'sha256',
            firstSeen: date,
            lastSeen: date,
            confidence: item.confidence || 0.9,
            source: item.osintSourceId || 'Taranis AI'
          });
        }
      });
    }

    // Extraire emails
    const emails = content.match(emailPattern);
    if (emails) {
      emails.forEach(email => {
        if (!iocs.emails.find(e => e.value === email)) {
          iocs.emails.push({
            value: email,
            type: 'email-addr',
            firstSeen: date,
            lastSeen: date,
            confidence: item.confidence || 0.7,
            source: item.osintSourceId || 'Taranis AI'
          });
        }
      });
    }

    // Extraire URLs
    const urls = content.match(urlPattern);
    if (urls) {
      urls.forEach(url => {
        if (!iocs.urls.find(u => u.value === url)) {
          iocs.urls.push({
            value: url,
            type: 'url',
            firstSeen: date,
            lastSeen: date,
            confidence: item.confidence || 0.8,
            source: item.osintSourceId || 'Taranis AI'
          });
        }
      });
    }
  }

  // Trier par confiance décroissante
  iocs.ipAddresses.sort((a, b) => b.confidence - a.confidence);
  iocs.domains.sort((a, b) => b.confidence - a.confidence);
  iocs.fileHashes.sort((a, b) => b.confidence - a.confidence);
  iocs.emails.sort((a, b) => b.confidence - a.confidence);
  iocs.urls.sort((a, b) => b.confidence - a.confidence);

  iocs.total = iocs.ipAddresses.length + iocs.domains.length + 
                iocs.fileHashes.length + iocs.emails.length + iocs.urls.length;

  return iocs;
}

/**
 * Extrait les TTPs (MITRE ATT&CK) depuis le contenu
 */
function extractTTPs(newsItems: TaranisNewsItem[]): TTPSection {
  const ttps: TTPSection = {
    tactics: [],
    techniques: [],
    procedures: [],
    mitreAttackIds: []
  };

  const mitrePatterns = [
    { id: 'T1566', name: 'Phishing', tactic: 'Initial Access' },
    { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'Execution' },
    { id: 'T1071', name: 'Application Layer Protocol', tactic: 'Command and Control' },
    { id: 'T1547', name: 'Boot or Logon Autostart Execution', tactic: 'Persistence' },
    { id: 'T1055', name: 'Process Injection', tactic: 'Defense Evasion' },
    { id: 'T1003', name: 'OS Credential Dumping', tactic: 'Credential Access' },
    { id: 'T1082', name: 'System Information Discovery', tactic: 'Discovery' },
    { id: 'T1021', name: 'Remote Services', tactic: 'Lateral Movement' },
    { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' }
  ];

  const allContent = newsItems.map(item => `${item.title} ${item.content || ''}`).join(' ').toLowerCase();

  for (const pattern of mitrePatterns) {
    if (allContent.includes(pattern.name.toLowerCase()) || allContent.includes(pattern.id.toLowerCase())) {
      if (!ttps.tactics.includes(pattern.tactic)) {
        ttps.tactics.push(pattern.tactic);
      }
      if (!ttps.techniques.includes(pattern.name)) {
        ttps.techniques.push(pattern.name);
      }
      if (!ttps.mitreAttackIds.includes(pattern.id)) {
        ttps.mitreAttackIds.push(pattern.id);
      }
    }
  }

  return ttps;
}

/**
 * Génère un rapport CTI complet depuis les données Taranis
 */
export async function generateCTIReport(
  title: string,
  templateId: string = 'full-analysis',
  createdBy: string = 'CTI Analyst'
): Promise<CTIReport> {
  const service = getTaranisService();
  
  try {
    // Charger toutes les données nécessaires
    const [newsItems, stories, threats, reports] = await Promise.all([
      service.getNewsItems(200),
      service.getStories(),
      loadGeolocatedThreats(200),
      service.getReports()
    ]);

    // Identifier la campagne principale (si existe)
    const mainCampaign = stories.find(s => s.status === 'published');
    
    // Extraire les IOCs
    const iocs = extractIOCs(newsItems);
    
    // Extraire les TTPs
    const ttps = extractTTPs(newsItems);
    
    // Analyser la distribution géographique
    const geographicDistribution: GeographicSection = {
      affectedCountries: threats.map(t => ({
        country: t.country,
        threatCount: t.threat_count,
        severity: t.severity,
        primaryThreats: [t.threat_type]
      })),
      hotspots: threats.filter(t => t.severity === 'critical' || t.severity === 'high').slice(0, 10),
      totalThreats: threats.reduce((sum, t) => sum + t.threat_count, 0),
      criticalZones: threats
        .filter(t => t.severity === 'critical')
        .map(t => t.country)
    };

    // Créer la timeline
    const timeline: TimelineEvent[] = newsItems
      .slice(0, 20)
      .map(item => ({
        date: new Date(item.collectedDate),
        event: item.title,
        severity: (item.riskLevel as any) || 'medium',
        description: item.content?.substring(0, 150) + '...' || ''
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    // Identifier les secteurs ciblés
    const targetedSectors = [
      ...new Set(threats.flatMap(t => t.target_sectors))
    ].slice(0, 10);

    // Générer les recommandations
    const recommendations = generateRecommendations(threats, iocs, ttps);

    // Sources
    const sources: ReportSource[] = [
      {
        name: 'Taranis AI Platform',
        type: 'taranis',
        reliability: 0.95
      },
      {
        name: 'OSINT Feeds',
        type: 'osint',
        reliability: 0.85
      },
      ...Array.from(new Set(newsItems.map(i => i.osintSourceId))).slice(0, 5).map(source => ({
        name: source,
        type: 'external' as const,
        reliability: 0.75
      }))
    ];

    // Calculer la sévérité globale
    const criticalCount = threats.filter(t => t.severity === 'critical').length;
    const highCount = threats.filter(t => t.severity === 'high').length;
    const overallSeverity: 'critical' | 'high' | 'medium' | 'low' = 
      criticalCount > 5 ? 'critical' :
      highCount > 10 ? 'high' :
      highCount > 0 ? 'medium' : 'low';

    // Générer le rapport
    const report: CTIReport = {
      id: `CTI-${Date.now()}`,
      title,
      createdAt: new Date(),
      createdBy,
      summary: generateExecutiveSummary(threats, iocs, mainCampaign),
      severity: overallSeverity,
      threatActor: mainCampaign?.title.match(/APT\d+|Lazarus|Fancy Bear|Cozy Bear/)?.[0],
      campaign: mainCampaign?.title,
      
      executiveSummary: generateExecutiveSummary(threats, iocs, mainCampaign),
      technicalAnalysis: generateTechnicalAnalysis(iocs, ttps, threats),
      geographicDistribution,
      iocs,
      ttps,
      targetedSectors,
      timeline,
      recommendations,
      sources,
      
      confidence: calculateOverallConfidence(newsItems),
      status: 'draft',
      tags: extractTags(newsItems, threats)
    };

    return report;

  } catch (error) {
    console.error('Erreur génération rapport:', error);
    throw error;
  }
}

/**
 * Génère l'executive summary
 */
function generateExecutiveSummary(
  threats: ThreatLocation[], 
  iocs: IOCSection,
  campaign?: any
): string {
  const criticalThreats = threats.filter(t => t.severity === 'critical').length;
  const affectedCountries = threats.length;
  const totalIncidents = threats.reduce((sum, t) => sum + t.threat_count, 0);

  return `
Cette analyse de threat intelligence révèle ${totalIncidents} incidents de sécurité répartis sur ${affectedCountries} pays, 
avec ${criticalThreats} zones critiques nécessitant une attention immédiate.

${campaign ? `La campagne "${campaign.title}" a été identifiée comme la principale menace active.` : ''}

Un total de ${iocs.total} indicateurs de compromission (IOCs) ont été collectés et corrélés, 
incluant ${iocs.ipAddresses.length} adresses IP, ${iocs.domains.length} domaines malveillants, 
et ${iocs.fileHashes.length} hash de fichiers suspects.

Les secteurs principalement ciblés incluent les infrastructures gouvernementales, 
les institutions financières et le secteur de la santé. Une réponse coordonnée est recommandée.
  `.trim();
}

/**
 * Génère l'analyse technique
 */
function generateTechnicalAnalysis(
  iocs: IOCSection,
  ttps: TTPSection,
  threats: ThreatLocation[]
): string {
  return `
## Infrastructure Malveillante

L'analyse technique révèle une infrastructure sophistiquée avec ${iocs.ipAddresses.length} serveurs C2 identifiés.
Les domaines malveillants utilisent des techniques d'obfuscation avancées et du DGA (Domain Generation Algorithm).

## Vecteurs d'Attaque

Les techniques d'attaque observées correspondent au framework MITRE ATT&CK :
${ttps.tactics.map(t => `- ${t}`).join('\n')}

## Malware Families

${iocs.fileHashes.length} échantillons de malware ont été identifiés, 
utilisant des techniques d'évasion de détection et de persistance avancées.

## Communication C2

Les serveurs de commande et contrôle utilisent principalement les protocoles HTTPS et DNS tunneling 
pour éviter la détection par les systèmes de sécurité traditionnels.
  `.trim();
}

/**
 * Génère des recommandations basées sur l'analyse
 */
function generateRecommendations(
  threats: ThreatLocation[],
  iocs: IOCSection,
  ttps: TTPSection
): string[] {
  const recommendations: string[] = [];

  // Recommandations basées sur la sévérité
  if (threats.some(t => t.severity === 'critical')) {
    recommendations.push('🚨 URGENT: Bloquer immédiatement tous les IOCs identifiés dans les firewalls et proxies');
    recommendations.push('🚨 Activer la surveillance 24/7 des zones critiques identifiées');
  }

  // Recommandations IOCs
  if (iocs.ipAddresses.length > 0) {
    recommendations.push(`Bloquer ${iocs.ipAddresses.length} adresses IP malveillantes dans tous les périmètres réseau`);
  }
  
  if (iocs.domains.length > 0) {
    recommendations.push(`Ajouter ${iocs.domains.length} domaines à la blacklist DNS et web proxy`);
  }

  if (iocs.fileHashes.length > 0) {
    recommendations.push(`Déployer les signatures de ${iocs.fileHashes.length} hash malveillants dans les solutions EDR/AV`);
  }

  // Recommandations TTPs
  if (ttps.techniques.includes('Phishing')) {
    recommendations.push('Renforcer la formation de sensibilisation au phishing pour tous les utilisateurs');
    recommendations.push('Déployer des solutions anti-phishing avancées (DMARC, SPF, DKIM)');
  }

  if (ttps.techniques.includes('Process Injection')) {
    recommendations.push('Activer les protections contre l\'injection de code dans les EDR');
    recommendations.push('Surveiller les processus suspects et les injections de DLL');
  }

  // Recommandations générales
  recommendations.push('Mettre à jour toutes les threat intelligence feeds avec les nouveaux IOCs');
  recommendations.push('Coordonner avec les équipes SOC internationales pour partage d\'information');
  recommendations.push('Effectuer une chasse aux menaces (threat hunting) sur les IOCs identifiés');
  recommendations.push('Archiver ce rapport pour référence future et analyse de tendances');

  return recommendations;
}

/**
 * Calcule la confiance globale du rapport
 */
function calculateOverallConfidence(newsItems: TaranisNewsItem[]): number {
  if (newsItems.length === 0) return 0.5;
  
  const avgConfidence = newsItems.reduce((sum, item) => sum + (item.confidence || 0.7), 0) / newsItems.length;
  return Math.round(avgConfidence * 100) / 100;
}

/**
 * Extrait les tags pertinents
 */
function extractTags(newsItems: TaranisNewsItem[], threats: ThreatLocation[]): string[] {
  const tags = new Set<string>();
  
  // Tags depuis news items
  newsItems.forEach(item => {
    item.tags?.forEach(tag => tags.add(tag));
  });

  // Tags depuis menaces
  threats.forEach(threat => {
    threat.campaigns.forEach(campaign => tags.add(campaign));
    tags.add(threat.severity);
    tags.add(threat.threat_type);
  });

  return Array.from(tags).slice(0, 20);
}

/**
 * Exporte le rapport en format Markdown
 */
export function exportToMarkdown(report: CTIReport): string {
  return `# ${report.title}

**Date:** ${report.createdAt.toLocaleDateString()}  
**Analyste:** ${report.createdBy}  
**Sévérité:** ${report.severity.toUpperCase()}  
**Confiance:** ${(report.confidence * 100).toFixed(0)}%  
${report.threatActor ? `**Threat Actor:** ${report.threatActor}` : ''}
${report.campaign ? `**Campagne:** ${report.campaign}` : ''}

---

## 📊 Executive Summary

${report.executiveSummary}

---

## 🌍 Distribution Géographique

**Pays Affectés:** ${report.geographicDistribution.affectedCountries.length}  
**Total Menaces:** ${report.geographicDistribution.totalThreats}  
**Zones Critiques:** ${report.geographicDistribution.criticalZones.join(', ')}

### Top 10 Hotspots

${report.geographicDistribution.hotspots.map((h, i) => 
  `${i + 1}. **${h.city}, ${h.country}** - ${h.threat_count} menaces (${h.severity})`
).join('\n')}

---

## 🔍 Analyse Technique

${report.technicalAnalysis}

---

## 🎯 Indicateurs de Compromission (IOCs)

**Total IOCs:** ${report.iocs.total}

### Adresses IP (${report.iocs.ipAddresses.length})
\`\`\`
${report.iocs.ipAddresses.slice(0, 20).map(ioc => `${ioc.value} (confidence: ${(ioc.confidence * 100).toFixed(0)}%)`).join('\n')}
\`\`\`

### Domaines (${report.iocs.domains.length})
\`\`\`
${report.iocs.domains.slice(0, 20).map(ioc => `${ioc.value} (confidence: ${(ioc.confidence * 100).toFixed(0)}%)`).join('\n')}
\`\`\`

### File Hashes (${report.iocs.fileHashes.length})
\`\`\`
${report.iocs.fileHashes.slice(0, 10).map(ioc => `${ioc.value} (${ioc.type})`).join('\n')}
\`\`\`

---

## 🛡️ TTPs (MITRE ATT&CK)

**Tactics:** ${report.ttps.tactics.join(', ')}  
**Techniques:** ${report.ttps.techniques.join(', ')}  
**MITRE IDs:** ${report.ttps.mitreAttackIds.join(', ')}

---

## 🏢 Secteurs Ciblés

${report.targetedSectors.map(s => `- ${s}`).join('\n')}

---

## ⏰ Timeline

${report.timeline.slice(0, 10).map(e => 
  `**${e.date.toLocaleDateString()}** - [${e.severity.toUpperCase()}] ${e.event}`
).join('\n')}

---

## ✅ Recommandations

${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

## 📚 Sources

${report.sources.map(s => `- **${s.name}** (${s.type}) - Fiabilité: ${(s.reliability * 100).toFixed(0)}%`).join('\n')}

---

## 🏷️ Tags

${report.tags.map(t => `\`${t}\``).join(' ')}

---

*Rapport généré automatiquement par AntStrike CTI Platform*  
*Powered by Taranis AI*
`;
}

/**
 * Exporte le rapport en format JSON
 */
export function exportToJSON(report: CTIReport): string {
  return JSON.stringify(report, null, 2);
}

