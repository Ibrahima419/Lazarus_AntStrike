/**
 * Service d'Actions CTI
 * Fonctions pour tous les boutons d'action rapide du dashboard SOC
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';
import { loadGeolocatedThreats } from './threat-geo-service';

export interface BlockIOCsResult {
  blocked: number;
  failed: number;
  details: string[];
}

export interface PlaybookResult {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  steps: PlaybookStep[];
}

export interface PlaybookStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

export interface ExportResult {
  format: string;
  filename: string;
  count: number;
  downloadUrl?: string;
}

/**
 * Bloque automatiquement les IOCs identifiés
 */
export async function blockIOCs(): Promise<BlockIOCsResult> {
  console.log('🚫 Lancement blocage IOCs...');
  
  try {
    // Charger les menaces géolocalisées pour obtenir les IOCs
    const threats = await loadGeolocatedThreats(50);
    
    // Simuler extraction d'IOCs depuis les menaces
    const iocs = extractIOCsFromThreats(threats);
    
    console.log(`🎯 ${iocs.length} IOCs à bloquer identifiés`);
    
    // Simuler le blocage (en production: intégration firewall, proxy, etc.)
    const blockResults = await Promise.all(
      iocs.slice(0, 20).map(async (ioc, index) => { // Max 20 pour la démo
        // Simulation d'appel API firewall
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        // 90% de succès simulé
        const success = Math.random() > 0.1;
        return {
          ioc,
          success,
          message: success ? `✅ ${ioc} bloqué` : `❌ Échec blocage ${ioc}`
        };
      })
    );
    
    const blocked = blockResults.filter(r => r.success).length;
    const failed = blockResults.filter(r => !r.success).length;
    
    const result: BlockIOCsResult = {
      blocked,
      failed,
      details: blockResults.map(r => r.message)
    };
    
    console.log(`✅ Blocage terminé : ${blocked} bloqués, ${failed} échecs`);
    return result;
    
  } catch (error) {
    console.error('❌ Erreur blocage IOCs:', error);
    throw new Error('Impossible de bloquer les IOCs : ' + error);
  }
}

/**
 * Lance un playbook de réponse automatique
 */
export async function runSecurityPlaybook(type: 'apt-response' | 'ransomware-response' | 'phishing-response' = 'apt-response'): Promise<PlaybookResult> {
  console.log(`▶️ Lancement playbook: ${type}`);
  
  const playbooks = {
    'apt-response': {
      name: 'APT Response Playbook',
      steps: [
        { name: 'Identifier IOCs', status: 'pending' as const },
        { name: 'Bloquer IPs malveillantes', status: 'pending' as const },
        { name: 'Analyser TTPs', status: 'pending' as const },
        { name: 'Notifier équipe', status: 'pending' as const },
        { name: 'Créer rapport incident', status: 'pending' as const }
      ]
    },
    'ransomware-response': {
      name: 'Ransomware Response Playbook',
      steps: [
        { name: 'Isoler systèmes infectés', status: 'pending' as const },
        { name: 'Bloquer domaines C2', status: 'pending' as const },
        { name: 'Vérifier sauvegardes', status: 'pending' as const },
        { name: 'Contacter juridique', status: 'pending' as const }
      ]
    },
    'phishing-response': {
      name: 'Phishing Response Playbook', 
      steps: [
        { name: 'Bloquer domaines phishing', status: 'pending' as const },
        { name: 'Mettre à jour filtres email', status: 'pending' as const },
        { name: 'Formation utilisateurs', status: 'pending' as const }
      ]
    }
  };

  const selectedPlaybook = playbooks[type];
  const playbookId = `PB-${Date.now()}`;
  
  // Simuler l'exécution étape par étape
  for (let i = 0; i < selectedPlaybook.steps.length; i++) {
    const step = selectedPlaybook.steps[i];
    console.log(`⏳ Exécution: ${step.name}`);
    
    step.status = 'running';
    
    // Simulation du temps d'exécution
    const executionTime = 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    // 95% de succès
    step.status = Math.random() > 0.05 ? 'completed' : 'failed';
    step.duration = Math.round(executionTime);
    
    console.log(`${step.status === 'completed' ? '✅' : '❌'} ${step.name} - ${step.duration}ms`);
  }

  const result: PlaybookResult = {
    id: playbookId,
    name: selectedPlaybook.name,
    status: selectedPlaybook.steps.every(s => s.status === 'completed') ? 'completed' : 'failed',
    steps: selectedPlaybook.steps
  };
  
  console.log(`🎯 Playbook ${result.status === 'completed' ? 'terminé avec succès' : 'échoué'}`);
  return result;
}

/**
 * Exporte les IOCs au format choisi
 */
export async function exportIOCs(format: 'json' | 'csv' | 'stix' = 'json'): Promise<ExportResult> {
  console.log(`📥 Export IOCs en format ${format}...`);
  
  try {
    const threats = await loadGeolocatedThreats(100);
    const iocs = extractIOCsFromThreats(threats);
    
    let content = '';
    let filename = '';
    
    switch (format) {
      case 'json':
        content = JSON.stringify({
          export_date: new Date().toISOString(),
          source: 'AntStrike CTI Platform',
          total_iocs: iocs.length,
          iocs: iocs.map(ioc => ({
            value: ioc,
            type: detectIOCType(ioc),
            confidence: 0.8,
            first_seen: new Date().toISOString(),
            tags: ['antstrike', 'cti']
          }))
        }, null, 2);
        filename = `antstrike-iocs-${Date.now()}.json`;
        break;
        
      case 'csv':
        content = 'IOC,Type,Confidence,First_Seen,Tags\n';
        content += iocs.map(ioc => 
          `${ioc},${detectIOCType(ioc)},0.8,${new Date().toISOString()},antstrike;cti`
        ).join('\n');
        filename = `antstrike-iocs-${Date.now()}.csv`;
        break;
        
      case 'stix':
        content = JSON.stringify({
          type: 'bundle',
          id: `bundle--${generateUUID()}`,
          spec_version: '2.1',
          objects: iocs.map(ioc => ({
            type: 'indicator',
            id: `indicator--${generateUUID()}`,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            pattern: `[${detectIOCType(ioc)} = '${ioc}']`,
            labels: ['malicious-activity'],
            confidence: 80
          }))
        }, null, 2);
        filename = `antstrike-iocs-${Date.now()}.stix`;
        break;
    }
    
    // Déclencher le téléchargement
    const blob = new Blob([content], { 
      type: format === 'json' || format === 'stix' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const result: ExportResult = {
      format,
      filename,
      count: iocs.length,
      downloadUrl: url
    };
    
    console.log(`✅ Export ${format} terminé: ${iocs.length} IOCs`);
    return result;
    
  } catch (error) {
    console.error('❌ Erreur export IOCs:', error);
    throw error;
  }
}

/**
 * Partage les données threat intel avec l'équipe
 */
export async function shareIntelligence(method: 'email' | 'slack' | 'teams' = 'email'): Promise<boolean> {
  console.log(`📤 Partage intel via ${method}...`);
  
  try {
    const threats = await loadGeolocatedThreats(10);
    const criticalThreats = threats.filter(t => t.severity === 'critical' || t.severity === 'high');
    
    const summary = `
🔴 INTELLIGENCE CRITIQUE - ${new Date().toLocaleDateString()}

${criticalThreats.length} menaces critiques identifiées :

${criticalThreats.map((threat, i) => 
  `${i + 1}. ${threat.city}, ${threat.country} - ${threat.threat_count} incidents (${threat.threat_type})`
).join('\n')}

IOCs identifiés : ${criticalThreats.reduce((sum, t) => sum + t.iocs, 0)}
Secteurs ciblés : ${[...new Set(criticalThreats.flatMap(t => t.target_sectors))].slice(0, 5).join(', ')}

---
Rapport généré par AntStrike CTI Platform
    `;
    
    switch (method) {
      case 'email':
        const subject = encodeURIComponent('🔴 INTELLIGENCE CRITIQUE - Menaces Actives');
        const body = encodeURIComponent(summary);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        break;
        
      case 'slack':
        // En production : intégration webhook Slack
        navigator.clipboard.writeText(summary);
        alert('📋 Contenu copié ! Collez dans votre channel Slack.');
        break;
        
      case 'teams':
        // En production : intégration Microsoft Teams
        navigator.clipboard.writeText(summary);
        alert('📋 Contenu copié ! Collez dans votre chat Teams.');
        break;
    }
    
    console.log(`✅ Partage ${method} initié`);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur partage intel:', error);
    return false;
  }
}

/**
 * Crée une alerte custom pour l'équipe SOC
 */
export async function createCustomAlert(
  title: string = 'Nouvelle Alerte CTI',
  severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
): Promise<string> {
  console.log(`🔔 Création alerte: ${title} (${severity})`);
  
  // Simuler création d'alerte
  const alertId = `ALERT-${Date.now()}`;
  
  const alertData = {
    id: alertId,
    title,
    severity,
    created_at: new Date().toISOString(),
    created_by: 'CTI Analyst',
    description: `Alerte générée depuis AntStrike CTI Platform`,
    status: 'active'
  };
  
  // En production : envoyer à votre système d'alertes (SIEM, etc.)
  console.log('📨 Alerte créée:', alertData);
  
  // Notification visuelle
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`🔔 ${title}`, {
      body: `Alerte ${severity} créée dans CTI Platform`,
      icon: '/favicon.ico'
    });
  }
  
  console.log(`✅ Alerte créée avec ID: ${alertId}`);
  return alertId;
}

/**
 * Lance une investigation sur une alerte spécifique
 */
export async function investigateAlert(alertId: string, alertTitle: string): Promise<boolean> {
  console.log(`🔍 Investigation lancée: ${alertTitle}`);
  
  try {
    // Créer un "case" d'investigation simulé
    const investigationData = {
      case_id: `INV-${Date.now()}`,
      alert_id: alertId,
      title: `Investigation: ${alertTitle}`,
      created_at: new Date().toISOString(),
      assigned_to: 'CTI Analyst',
      priority: 'high',
      status: 'in_progress',
      tasks: [
        'Analyser les IOCs',
        'Identifier l\'infrastructure',
        'Corréler avec campagnes connues',
        'Évaluer l\'impact',
        'Proposer des mitigations'
      ]
    };
    
    // En production : créer un ticket dans votre système
    console.log('📋 Investigation créée:', investigationData);
    
    // Ouvrir l'onglet investigation avec les détails
    window.dispatchEvent(new CustomEvent('cti:open-investigation', {
      detail: investigationData
    }));
    
    console.log('✅ Investigation lancée avec succès');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur investigation:', error);
    return false;
  }
}

/**
 * Bloque une alerte spécifique
 */
export async function blockAlert(alertId: string, alertTitle: string): Promise<boolean> {
  console.log(`🚫 Blocage alerte: ${alertTitle}`);
  
  try {
    // Extraire les IOCs de l'alerte
    const iocs = extractIOCsFromText(alertTitle);
    
    if (iocs.length === 0) {
      console.warn('⚠️ Aucun IOC détecté dans l\'alerte');
      return false;
    }
    
    // Bloquer les IOCs trouvés
    console.log(`🎯 Blocage de ${iocs.length} IOCs de l'alerte...`);
    
    for (const ioc of iocs) {
      // Simulation blocage
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(`✅ ${ioc} bloqué`);
    }
    
    // Marquer l'alerte comme traitée
    console.log(`🎯 Alerte ${alertId} marquée comme traitée`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur blocage alerte:', error);
    return false;
  }
}

// ========== FONCTIONS UTILITAIRES ==========

/**
 * Extrait les IOCs depuis les menaces géolocalisées
 */
function extractIOCsFromThreats(threats: any[]): string[] {
  const iocs: string[] = [];
  
  // Simuler extraction d'IOCs depuis les campagnes
  const campaigns = threats.flatMap(t => t.campaigns || []);
  
  // Générer des IOCs réalistes basés sur les campagnes
  const iocsTemplates = [
    '185.220.101.',
    '203.0.113.',
    'malicious-domain',
    'evil-server',
    'apt-infrastructure',
    'c2-server'
  ];
  
  campaigns.forEach(campaign => {
    // Générer 2-5 IOCs par campagne
    const count = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const template = iocsTemplates[Math.floor(Math.random() * iocsTemplates.length)];
      if (template.includes('.')) {
        // IP
        iocs.push(`${template}${Math.floor(Math.random() * 255)}`);
      } else {
        // Domain
        iocs.push(`${template}-${Math.floor(Math.random() * 1000)}.com`);
      }
    }
  });
  
  return [...new Set(iocs)]; // Unique
}

/**
 * Détecte le type d'IOC
 */
function detectIOCType(ioc: string): string {
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc)) return 'ipv4-addr';
  if (/^[a-f0-9]{32}$/i.test(ioc)) return 'file-hash-md5';
  if (/^[a-f0-9]{40}$/i.test(ioc)) return 'file-hash-sha1';
  if (/^[a-f0-9]{64}$/i.test(ioc)) return 'file-hash-sha256';
  if (/@/.test(ioc)) return 'email-addr';
  if (/^https?:\/\//.test(ioc)) return 'url';
  return 'domain-name';
}

/**
 * Extrait les IOCs depuis un texte
 */
function extractIOCsFromText(text: string): string[] {
  const iocs: string[] = [];
  
  // Regex pour IPs
  const ipMatches = text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
  if (ipMatches) iocs.push(...ipMatches);
  
  // Regex pour domaines
  const domainMatches = text.match(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi);
  if (domainMatches) {
    iocs.push(...domainMatches.filter(d => 
      !d.includes('example.') && 
      !d.includes('test.') && 
      d.length > 5
    ));
  }
  
  return [...new Set(iocs)];
}

/**
 * Génère un UUID simple
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Demande permission notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}
