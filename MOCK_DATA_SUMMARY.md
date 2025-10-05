# 🗺️ Résumé Cartographie Mock Data
## AntStrike CTI Platform - Vue d'Ensemble

---

## 📊 Statistiques Globales

```
┌─────────────────────────────────────────────────┐
│  Total Composants avec Mock:        11         │
│  Total Objets Mockés:                ~150      │
│  Bot Templates:                      22        │
│  Services avec Simulation:           1         │
│  Composants avec Données Réelles:    4         │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Carte des Mock Data par Composant

```
components/cti/
│
├── IOCsManager.tsx
│   └── 5 IOCs (IP, Domain, Hash, URL, Email)
│       Status: 🔴 Not Integrated
│
├── CampaignsTracker.tsx
│   └── 4 Campaigns (APT29, Conti, Banking, Supply Chain)
│       Status: 🔴 Not Integrated
│
├── CorrelationEngine.tsx
│   ├── 5 Correlation Rules
│   └── 6 Correlation Results
│       Status: 🔴 Not Integrated
│
├── ReportsBuilder.tsx
│   └── 3 Reports (Campaign, Quarterly, Executive)
│       Status: 🟡 Partial
│
├── InvestigationFlow.tsx
│   └── 2 Investigations (APT29, Ransomware)
│       Status: 🔴 Not Integrated
│
├── ThreatIntelligenceMap.tsx
│   └── 12 Geographic Locations + Threats
│       Status: 🔴 Not Integrated
│
├── StoriesBuilder.tsx
│   └── Auto-connections logic (mockée)
│       Status: 🟢 Real Data + Mock Logic
│
├── AlertSourceClusteringMap.tsx
│   ├── Geo coordinates (mockées)
│   ├── Trust scores (calculés)
│   └── Clustering (algorithme)
│       Status: 🟢 Real Data + Mock Enrichment
│
├── data/bot-templates.ts
│   ├── 5 Collector Templates
│   ├── 5 Analyzer Templates
│   ├── 5 Enricher Templates
│   ├── 4 Correlator Templates
│   └── 3 Reporter Templates
│       Status: 🟡 Templates Only
│
├── services/bot-service.ts
│   └── Simulation: create/update/delete bots
│       Status: 🟡 Partial (Read=Real, Write=Mock)
│
└── map-views/
    ├── HeatmapView.tsx
    │   └── Temporal data generation
    │       Status: 🟢 Real Data
    │
    └── GeographicView.tsx
        └── Geo clustering
            Status: 🟢 Real Data + Mock Coordinates
```

---

## 🔗 Mapping Mock Data → Taranis Endpoints

| Composant | Mock Data | Taranis Endpoint | Action Requise |
|-----------|-----------|------------------|----------------|
| **IOCsManager** | 5 IOCs | `/assess/news-items` + bots | Développer IOC Extractor Bot |
| **CampaignsTracker** | 4 Campaigns | `/assess/stories` | Grouper stories + corrélation |
| **CorrelationEngine** | 11 Rules/Results | `/bots/stories/group` | Développer Correlation Bots |
| **ReportsBuilder** | 3 Reports | `/analyze/report-items`<br>`/publish/products` | Mapper report items → reports |
| **InvestigationFlow** | 2 Investigations | Custom workflow | Développer workflow system |
| **ThreatIntelMap** | 12 Locations | `/assess/news-items` + geo | Intégrer API MaxMind/IP2Loc |
| **AlertSourceMap** | Coordinates | `/assess/osint-sources-list` | API géolocalisation |
| **StoriesBuilder** | Auto-connect | `/assess/stories` | Améliorer algorithme IA |
| **BotTemplates** | 22 Templates | `/config/bots` | Templates statiques OK |
| **BotService** | Create/Update | `/config/bots` (Read only) | Utiliser interface admin |

---

## 📋 Plan d'Intégration - Vue Synthétique

### ✅ Phase 1: Déjà Intégré
```
✅ Sources OSINT           → /assess/osint-sources-list
✅ Groupes de sources      → /assess/osint-source-group-list
✅ News items              → /assess/news-items
✅ Stories                 → /assess/stories
✅ Report items            → /analyze/report-items
✅ Products (rapports)     → /publish/products
✅ Bots (lecture)          → /config/bots
```

### 🔄 Phase 2: En Transformation (Sprint 1-2)
```
🔄 IOCs                    → Extraire depuis news items
🔄 Campagnes               → Grouper stories + IA
🔄 Coordonnées géo         → API MaxMind
🔄 Trust scores            → Calculer depuis métriques
🔄 Clustering              → Algorithme sur données réelles
```

### 🛠️ Phase 3: Développement Custom (Sprint 3+)
```
🛠️ Investigation Flow      → Workflow management
🛠️ Correlation Engine      → Moteur de corrélation
🛠️ Auto-connections        → IA pour liens
🛠️ Threat Intelligence Map → Agrégation géographique
🛠️ Performance monitoring  → Métriques custom
```

---

## 🎯 Top 5 Actions Prioritaires

### 1. **IOC Extraction Bot** 🔴 Haute Priorité
```typescript
// Bot analyzer pour extraire IOCs depuis news items
{
  type: 'analyzer',
  name: 'IOC Extractor',
  input: '/assess/news-items',
  output: 'IOC objects',
  logic: 'Regex + NLP pour IPs, domains, hashes, URLs, emails'
}
```

### 2. **API Géolocalisation** 🔴 Haute Priorité
```typescript
// Intégrer MaxMind GeoIP2
{
  service: 'MaxMind GeoIP2',
  usage: [
    'AlertSourceClusteringMap (source coordinates)',
    'ThreatIntelligenceMap (threat locations)',
    'GeographicView (clustering)'
  ]
}
```

### 3. **Campaign Tracker System** 🟡 Moyenne Priorité
```typescript
// Créer campagnes depuis stories
{
  input: '/assess/stories',
  logic: 'Group by similarity + temporal correlation',
  output: 'Campaign objects',
  features: ['Attribution', 'TTP tracking', 'Timeline']
}
```

### 4. **Correlation Engine Backend** 🟡 Moyenne Priorité
```typescript
// Moteur de corrélation backend
{
  rules: 'Configurable correlation rules',
  types: ['IOC', 'Temporal', 'Geographic', 'Behavioral'],
  output: 'Correlation results',
  storage: 'PostgreSQL or Redis'
}
```

### 5. **Report Generation System** 🟢 Basse Priorité
```typescript
// Génération automatique de rapports
{
  input: '/analyze/report-items',
  templates: 'Predefined report templates',
  output: '/publish/products',
  formats: ['PDF', 'JSON', 'HTML']
}
```

---

## 📊 Matrice de Dépendances Mock

```
IOCsManager ─────────────┐
                         ├──> IOC Extractor Bot (à développer)
CampaignsTracker ────────┤
                         │
CorrelationEngine ───────┼──> Correlation Engine Backend (à développer)
                         │
ReportsBuilder ──────────┼──> Report Generator (à développer)
                         │
InvestigationFlow ───────┼──> Workflow System (à développer)
                         │
ThreatIntelMap ──────────┼──> MaxMind API + Geo Enricher Bot
                         │
AlertSourceMap ──────────┤
                         │
StoriesBuilder ──────────┤
                         │
HeatmapView ─────────────┘──> Taranis API (déjà intégré) ✅
```

---

## 🚦 Statut d'Intégration par Composant

| Composant | Mock % | Real % | Status |
|-----------|--------|--------|--------|
| IOCsManager | 100% | 0% | 🔴 |
| CampaignsTracker | 100% | 0% | 🔴 |
| CorrelationEngine | 100% | 0% | 🔴 |
| ReportsBuilder | 80% | 20% | 🟡 |
| InvestigationFlow | 100% | 0% | 🔴 |
| ThreatIntelMap | 90% | 10% | 🔴 |
| StoriesBuilder | 20% | 80% | 🟢 |
| AlertSourceMap | 30% | 70% | 🟢 |
| BotTemplates | 100% | 0% | 🟡 |
| BotService | 40% | 60% | 🟡 |
| HeatmapView | 10% | 90% | 🟢 |
| GeographicView | 20% | 80% | 🟢 |

**Moyenne globale**: 62% Mock / 38% Real Data

---

## 🎓 Glossaire des Types de Mock

### 🔴 Full Mock
- Toutes les données sont statiques et simulées
- Aucune intégration avec Taranis
- **Composants**: IOCsManager, CampaignsTracker, CorrelationEngine, InvestigationFlow

### 🟡 Partial Mock
- Certaines données viennent de Taranis
- Enrichissement ou transformation mockée
- **Composants**: ReportsBuilder, BotTemplates, BotService

### 🟢 Real Data + Mock Logic
- Données réelles de Taranis
- Logique de traitement/enrichissement custom
- **Composants**: StoriesBuilder, AlertSourceMap, HeatmapView, GeographicView

### 🟢 Fully Integrated
- Données 100% réelles
- Aucune simulation
- **Objectif**: Arriver à 100% pour tous les composants

---

## 📈 Timeline de Migration

```
Sprint 1 (2 semaines)
├── IOC Extractor Bot          [8h]
├── MaxMind API Integration    [5h]
└── Campaign Grouping Logic    [5h]
    Total: 18h

Sprint 2 (2 semaines)
├── Correlation Engine Backend  [13h]
├── Report Generator           [8h]
└── Trust Score Calculator     [3h]
    Total: 24h

Sprint 3 (2 semaines)
├── Investigation Workflow      [13h]
├── Advanced Analytics         [8h]
└── Performance Optimization   [3h]
    Total: 24h

Sprint 4+ (Long terme)
├── IA/ML Features
├── Advanced Correlation
└── Predictive Analytics
```

**Estimation totale**: 66h pour les 3 premiers sprints

---

## 🔧 Outils & Services Requis

### APIs Externes
- ✅ **MaxMind GeoIP2** - Géolocalisation (requis)
- ⚠️ **VirusTotal** - Enrichissement IOC (optionnel)
- ⚠️ **AbuseIPDB** - Réputation IP (optionnel)
- ⚠️ **Shodan** - Intelligence IOC (optionnel)

### Backend Services
- ✅ **PostgreSQL** - Stockage données (existant)
- ⚠️ **Redis** - Cache & real-time (recommandé)
- ⚠️ **Elasticsearch** - Search & analytics (optionnel)

### Bots Taranis à Développer
1. **IOC Extractor Bot** (analyzer)
2. **Geo Enricher Bot** (enricher)
3. **Campaign Tracker Bot** (correlator)
4. **Trust Score Calculator** (analyzer)

---

## 🎯 KPIs de Migration

| KPI | Actuel | Objectif S1 | Objectif S3 | Final |
|-----|--------|-------------|-------------|-------|
| % Real Data | 38% | 55% | 75% | 95%+ |
| Composants Intégrés | 4/11 | 6/11 | 9/11 | 11/11 |
| Endpoints Taranis utilisés | 7/12 | 9/12 | 11/12 | 12/12 |
| Bots Custom développés | 0/4 | 2/4 | 4/4 | 4/4 |
| APIs externes intégrées | 0/4 | 1/4 | 2/4 | 4/4 |

---

## 📞 Contacts & Support

- **Documentation complète**: `MOCK_DATA_CARTOGRAPHY.md`
- **Architecture CTI**: `components/cti/CTI_PLATFORM_ARCHITECTURE.md`
- **Taranis API**: http://localhost:3000/frontend/doc/swagger.json
- **Repository**: GitHub (internal)

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2024-10-01  
**Auteur**: AI Assistant

