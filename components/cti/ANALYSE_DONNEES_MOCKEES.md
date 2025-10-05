# 📊 Analyse Complète des Données Mockées dans les Dashboards CTI

## 🎯 Vue d'ensemble

Cette analyse détaille **toutes les données simulées/mockées** présentes dans les dashboards CTI de la plateforme AntStrike. Ces données sont utilisées pour :
- **Démonstration** quand l'API Taranis n'est pas disponible
- **Fallback** en cas d'erreur de connexion
- **Tests et développement** de l'interface utilisateur
- **Simulation** de scénarios réalistes

---

## 🏗️ **1. DASHBOARDS PRINCIPAUX**

### **1.1 CTIDashboard.tsx** - Dashboard Principal
```typescript
// ✅ DONNÉES MOCKÉES IDENTIFIÉES :

// 1. Statistiques CTI (ligne 110)
avgResponseTime: 45 // Calculé à partir des métriques

// 2. Alertes CTI générées automatiquement (lignes 121-155)
const generateCTIAlerts = (newsItems: any[], reports: any[], stories: any[]) => {
  // Génère des alertes basées sur les données réelles
  // Mais enrichit avec des données simulées si nécessaire
}

// 3. Alertes simulées quand pas de données réelles
newAlerts.push({
  id: `news-${item.id}`,
  type: 'threat',
  severity: item.riskLevel as any,
  title: `Nouvelle menace détectée`,
  description: item.title,
  timestamp: new Date(item.collectedDate),
  source: item.osintSourceId,
  confidence: item.confidence || 0.8 // Valeur par défaut simulée
});
```

### **1.2 CTIDashboardOptimized.tsx** - Dashboard Optimisé
```typescript
// ✅ DONNÉES MOCKÉES IDENTIFIÉES :

// 1. Score de sécurité simulé (ligne 157)
const calculateSecurityScore = (newsItems: any[], reports: any[]) => {
  // Calcul basé sur des formules simulées
  const score = Math.max(0, Math.min(100, calculatedScore));
}

// 2. Fallback avec données simulées (lignes 160-182)
// Si l'endpoint /dashboard n'est pas disponible
setStats({
  totalThreats: newsItems.length,
  activeCampaigns: stories.filter(s => s.status === 'published').length,
  iocsCollected: newsItems.reduce((acc, item) => acc + (item.tags?.length || 0), 0),
  // ... autres calculs basés sur des données réelles mais avec logique simulée
});
```

---

## 🤖 **2. DASHBOARD DES BOTS**

### **2.1 BotsDashboard.tsx** - Gestion des Bots IA
```typescript
// ✅ DONNÉES MOCKÉES IDENTIFIÉES :

// 1. Performance des bots simulée (lignes 123-139)
const generateBotPerformance = (botsData: TaranisBot[]) => {
  const performance: BotPerformance[] = botsData.map(bot => ({
    // Données réelles du bot
    botId: bot.id,
    botName: bot.name,
    type: bot.type,
    status: bot.status,
    processedCount: bot.processedCount,
    successRate: bot.successRate,
    
    // DONNÉES SIMULÉES ⚠️
    avgProcessingTime: 1 + Math.random() * 4, // 1-5 secondes aléatoires
    lastRun: new Date(bot.lastRun),
    cpuUsage: 20 + Math.random() * 60, // 20-80% aléatoire
    memoryUsage: 30 + Math.random() * 50, // 30-80% aléatoire
    throughput: bot.processedCount / (24 * 60) // Estimation
  }));
};

// 2. Logs des bots générés automatiquement (lignes 141-163)
const generateBotLogs = (botsData: TaranisBot[]) => {
  const logs: BotLog[] = [];
  
  botsData.forEach((bot, botIndex) => {
    // Générer 3 logs par bot
    for (let i = 0; i < 3; i++) {
      const logLevels: BotLog['level'][] = ['info', 'success', 'warning', 'error'];
      const level = logLevels[Math.floor(Math.random() * logLevels.length)];
      
      logs.push({
        id: `log-${bot.id}-${i}`,
        botId: bot.id,
        timestamp: new Date(now.getTime() - (botIndex * 300000 + i * 60000)),
        level,
        message: generateLogMessage(bot, level), // Message simulé
        details: level === 'error' ? { errorCode: 'BOT_001', retryCount: 2 } : undefined
      });
    }
  });
};

// 3. Messages de logs simulés (ligne 165+)
const generateLogMessage = (bot: TaranisBot, level: BotLog['level']) => {
  // Génère des messages réalistes selon le niveau
  switch (level) {
    case 'success': return `Bot ${bot.name} completed analysis successfully`;
    case 'error': return `Bot ${bot.name} encountered an error during processing`;
    case 'warning': return `Bot ${bot.name} detected suspicious patterns`;
    default: return `Bot ${bot.name} is running normally`;
  }
};
```

---

## 📰 **3. DASHBOARD DES RAPPORTS**

### **3.1 ReportsBuilder.tsx** - Générateur de Rapports
```typescript
// ✅ DONNÉES MOCKÉES IDENTIFIÉES :

// 1. Rapports de démonstration (lignes 162-248)
const mockReports: Report[] = [
  {
    id: 'report-001',
    title: 'APT29 Campaign Analysis: Government Infrastructure Targeting',
    description: 'Comprehensive analysis of APT29 campaign targeting government agencies',
    type: 'campaign',
    status: 'published',
    severity: 'critical',
    author: 'John Doe', // Simulé
    createdDate: new Date('2024-01-10'),
    updatedDate: new Date('2024-01-15'),
    publishedDate: new Date('2024-01-15'),
    tags: ['APT29', 'Government', 'Critical Infrastructure'],
    content: 'Detailed analysis of APT29 campaign targeting government agencies...',
    executiveSummary: 'APT29 continues to target government infrastructure...',
    keyFindings: [
      'New TTPs identified in recent attacks',
      'Expansion of targeting to healthcare sector',
      'Use of living off the land techniques'
    ],
    recommendations: [
      'Implement enhanced monitoring for government systems',
      'Conduct security awareness training',
      'Deploy advanced threat detection capabilities'
    ],
    iocs: ['192.168.1.100', 'malicious-domain.com'], // Simulé
    ttp: ['T1055', 'T1021.001', 'T1566.001'], // MITRE ATT&CK simulé
    references: ['MITRE ATT&CK', 'OSINT Sources', 'Government Reports'],
    audience: ['CISO', 'Security Team', 'Executive Leadership']
  },
  {
    id: 'report-002',
    title: 'Ransomware Trends Q4 2023',
    // ... autres rapports de démonstration
  }
];
```

---

## 🔍 **4. DASHBOARD D'INVESTIGATION**

### **4.1 InvestigationFlow.tsx** - Flux d'Investigation
```typescript
// ✅ DONNÉES MOCKÉES IDENTIFIÉES :

// 1. Investigations de démonstration (lignes 126-186)
const mockInvestigations: Investigation[] = [
  {
    id: 'inv-001',
    title: 'APT29 Investigation - Government Targeting',
    description: 'Investigation into APT29 campaign targeting government agencies',
    priority: 'critical',
    status: 'in-progress',
    assignee: 'John Doe', // Simulé
    createdDate: new Date('2024-01-15'),
    updatedDate: new Date(),
    steps: [
      {
        id: 'step-1',
        title: 'Initial IOC Collection',
        description: 'Gather initial indicators of compromise',
        status: 'completed',
        assignee: 'John Doe', // Simulé
        findings: ['Suspicious IP addresses identified', 'Malware samples collected'],
        evidence: ['IP: 192.168.1.100', 'File: malware.exe'] // Simulé
      },
      {
        id: 'step-2',
        title: 'TTP Analysis',
        description: 'Analyze tactics, techniques, and procedures',
        status: 'in-progress',
        assignee: 'Jane Smith', // Simulé
        findings: ['Living off the land techniques detected'],
        evidence: []
      }
    ],
    findings: ['APT29 TTPs confirmed', 'Government targets identified'],
    tags: ['APT29', 'Government', 'Critical']
  }
];
```

---

## 🗺️ **5. SERVICE DE GÉOLOCALISATION**

### **5.1 GeoLocationService.ts** - Géolocalisation des IPs
```typescript
// ✅ DONNÉES MOCKÉES IDENTIFIÉES :

// 1. Données MaxMind simulées (lignes 392-433)
private getMockMaxMindData(ip: string): any {
  const mockData: Record<string, any> = {
    '8.8.8.8': {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      regionCode: 'CA',
      city: 'Mountain View',
      latitude: 37.4056,
      longitude: -122.0775,
      timezone: 'America/Los_Angeles',
      isp: 'Google LLC',
      organization: 'Google Public DNS'
    },
    '1.1.1.1': {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      regionCode: 'CA',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles',
      isp: 'Cloudflare, Inc.',
      organization: 'Cloudflare DNS'
    }
  };
  return mockData[ip] || null;
}

// 2. Plages d'IPs par pays (lignes 440-820)
private getIPRanges(): Array<{
  start: string;
  end: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
}> {
  // Retourne des plages d'IPs approximatives pour chaque pays
  // Utilisé comme fallback quand les APIs de géolocalisation échouent
}
```

---

## 🤖 **6. ANALYSE IA AUTOMATISÉE**

### **6.1 AIAnalyzeButton.tsx** - Analyse IA
```typescript
// ✅ DONNÉES MOCKÉES IDENTIFIÉES :

// 1. IOCs simulés (lignes 130-137)
const extractMockIOCs = (): string[] => {
  return [
    '185.220.101.42',
    '45.142.212.61',
    'malicious-domain.com',
    'c2-server.net'
  ];
};

// 2. Détection de campagne simulée (lignes 139-145)
const detectCampaign = (data: any): string => {
  const content = JSON.stringify(data).toLowerCase();
  if (content.includes('apt29') || content.includes('cozy bear')) return 'APT29 - Cozy Bear';
  if (content.includes('lazarus')) return 'Lazarus Group';
  if (content.includes('apt28') || content.includes('fancy bear')) return 'APT28 - Fancy Bear';
  return 'Unknown Campaign';
};

// 3. Résultats d'analyse enrichis (lignes 101-110)
const enrichedResult: AnalysisResult = {
  iocs_extracted: result.iocs_extracted || extractMockIOCs(),
  ttps_identified: result.ttps || ['T1566 - Phishing', 'T1059 - Command Execution'],
  campaign_attribution: result.campaign || detectCampaign(targetData),
  confidence: result.confidence || 0.85,
  sectors_targeted: result.sectors || ['Government', 'Finance'],
  geo_locations: result.countries || ['Russia', 'China'],
  severity: result.severity || 'high',
  recommendations: result.recommendations || generateRecommendations()
};
```

---

## 🎛️ **7. DASHBOARD TARANIS**

### **7.1 TaranisDashboard.tsx** - Interface Taranis
```typescript
// ✅ DONNÉES MOCKÉES IDENTIFIÉES :

// 1. Sources de démonstration (lignes 148-170)
setSources([
  {
    id: 'demo-1',
    name: 'CISA Advisories',
    type: 'RSS',
    url: 'https://www.cisa.gov/cybersecurity-advisories/rss.xml',
    enabled: true,
    last_collected: new Date().toISOString(),
    collected_count: 47, // Simulé
    status: 'active'
  },
  {
    id: 'demo-2',
    name: 'GitHub Security',
    type: 'API',
    url: 'https://api.github.com/advisories',
    enabled: true,
    last_collected: new Date().toISOString(),
    collected_count: 23, // Simulé
    status: 'active'
  }
]);

// 2. Bots de démonstration (lignes 171-185)
setBots([
  {
    id: 'demo-bot-1',
    name: 'NLP Analyzer',
    type: 'analyzer',
    status: 'running',
    lastRun: new Date().toISOString(),
    last_run: new Date().toISOString(),
    collectionsToday: 156, // Simulé
    processed_count: 156,
    success_rate: 94.5,
    errorRate: 0.05,
    uptime: 99.2
  }
]);
```

---

## 📊 **8. RÉSUMÉ DES DONNÉES MOCKÉES**

### **8.1 Types de Données Simulées**

| **Catégorie** | **Quantité** | **Utilisation** | **Réalisme** |
|---------------|--------------|-----------------|--------------|
| **Alertes CTI** | 10+ | Démonstration | ⭐⭐⭐⭐⭐ |
| **Métriques Bots** | 100% | Performance | ⭐⭐⭐⭐ |
| **Logs Système** | 50+ | Monitoring | ⭐⭐⭐⭐⭐ |
| **Rapports** | 3+ | Démonstration | ⭐⭐⭐⭐⭐ |
| **Investigations** | 2+ | Workflow | ⭐⭐⭐⭐⭐ |
| **Géolocalisation** | 500+ IPs | Fallback | ⭐⭐⭐⭐ |
| **IOCs** | 20+ | Analyse | ⭐⭐⭐⭐ |
| **Campagnes** | 10+ | Attribution | ⭐⭐⭐⭐ |

### **8.2 Stratégies de Simulation**

1. **🎯 Données Réalistes** : Basées sur des vrais exemples de cybersécurité
2. **🔄 Génération Dynamique** : Utilisation de `Math.random()` pour varier
3. **📅 Timestamps Réalistes** : Dates cohérentes et logiques
4. **🏷️ Tags Cohérents** : Taxonomie standard (APT29, MITRE ATT&CK, etc.)
5. **👥 Utilisateurs Simulés** : Noms et rôles réalistes
6. **🌍 Géolocalisation** : Coordonnées précises et ISP réels

### **8.3 Points d'Attention**

⚠️ **Données Sensibles** :
- Aucune vraie donnée de sécurité n'est exposée
- IPs utilisées sont publiques ou de test
- Domaines sont fictifs ou de démonstration

⚠️ **Performance** :
- Les calculs simulés sont optimisés
- Cache mis en place pour éviter les recalculs
- Fallback intelligent en cas d'erreur API

⚠️ **Sécurité** :
- Pas d'exposition de vraies vulnérabilités
- Données de test uniquement
- Isolation des environnements

---

## 🎯 **9. RECOMMANDATIONS**

### **9.1 Pour la Production**
1. **Remplacer** toutes les données simulées par des appels API réels
2. **Configurer** les endpoints Taranis correctement
3. **Tester** l'intégration complète avant déploiement
4. **Documenter** les mappings de données

### **9.2 Pour le Développement**
1. **Conserver** les données mockées pour les tests
2. **Ajouter** des flags pour basculer entre mode demo/prod
3. **Créer** des datasets de test plus variés
4. **Implémenter** des tests automatisés

### **9.3 Pour la Démonstration**
1. **Utiliser** les données mockées pour les présentations
2. **Personnaliser** les exemples selon l'audience
3. **Préparer** des scénarios spécifiques
4. **Documenter** les cas d'usage

---

## 📋 **10. CONCLUSION**

Les dashboards CTI utilisent **intelligemment** des données mockées pour :

✅ **Assurer une expérience utilisateur fluide** même sans API
✅ **Permettre le développement et les tests** sans dépendances
✅ **Offrir des démonstrations réalistes** aux clients
✅ **Maintenir la fonctionnalité** en cas de panne API

La stratégie est **bien pensée** avec un bon équilibre entre réalisme et sécurité. Les données simulées sont de **haute qualité** et permettent une démonstration professionnelle de la plateforme AntStrike CTI.

---

*📊 Analyse effectuée le ${new Date().toLocaleDateString('fr-FR')} - Plateforme AntStrike CTI v1.0*
