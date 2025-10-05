# 🗺️ Cartographie Complète des Données Mockées
## AntStrike CTI Platform

> **Date**: 2024-10-01  
> **Version**: 1.0  
> **Objectif**: Cartographier toutes les données simulées/mockées du projet pour faciliter l'intégration avec l'API Taranis réelle

---

## 📊 Vue d'Ensemble

### Résumé Statistique
- **Total de composants avec mock data**: 11
- **Total de fichiers de templates**: 1 (bot-templates.ts)
- **Total de services avec mock**: 1 (bot-service.ts)
- **Types de données mockées**: IOCs, Campagnes, Rapports, Stories, Investigations, Corrélations, Threats, Bots, Sources

---

## 🔍 Cartographie Détaillée

### 1. **IOCsManager.tsx** 📍
**Localisation**: `components/cti/IOCsManager.tsx`  
**Lignes**: 52-127

#### Données Mockées
```typescript
const mockIOCs: IOC[] = [...]
```

#### Structure
- **5 IOCs** de démonstration
- **Types**: IP, Domain, Hash, URL, Email
- **Sévérités**: Critical, High, Medium

#### Exemples
| Type | Valeur | Sévérité | Confidence | Status |
|------|--------|----------|------------|--------|
| IP | 192.168.1.100 | High | 0.95 | Verified |
| Domain | malicious-domain.com | Critical | 0.87 | Verified |
| Hash | a1b2c3d4e5f6... | High | 0.92 | Non-vérifié |
| URL | https://suspicious-site.com/payload.exe | High | 0.89 | Verified |
| Email | attacker@malicious-domain.com | Medium | 0.78 | Non-vérifié |

#### Champs Mock
- `id`: Identifiant unique (ex: 'ioc-001')
- `type`: Type d'IOC (ip/domain/hash/url/email)
- `value`: Valeur de l'IOC
- `description`: Description de la menace
- `confidence`: Score de confiance (0.0-1.0)
- `severity`: Niveau de sévérité
- `source`: Source de l'IOC (OSINT/TI/Sandbox/etc)
- `firstSeen`/`lastSeen`: Dates d'observation
- `tags`: Tags de classification
- `campaigns`: Campagnes liées
- `verified`: Statut de vérification

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/assess/news-items` + bot analysis  
⚠️ **Action requise**: Extraire les IOCs depuis les news items via les bots analyzers

---

### 2. **CampaignsTracker.tsx** 🎯
**Localisation**: `components/cti/CampaignsTracker.tsx`  
**Lignes**: 71-157

#### Données Mockées
```typescript
const mockCampaigns: Campaign[] = [...]
```

#### Structure
- **4 Campagnes** de démonstration
- **Threat Actors**: APT29, Conti, Unknown, Nation-State
- **Statuts**: Active, Dormant

#### Exemples
| Campaign | Threat Actor | Severity | Victims | Status |
|----------|--------------|----------|---------|--------|
| Russian APT Infrastructure | APT29 | Critical | 42 | Active |
| Ransomware Healthcare Blitz | Conti | High | 23 | Active |
| Banking Trojan Distribution | Unknown | Medium | 156 | Dormant |
| Supply Chain Compromise | Nation-State | Critical | 8 | Active |

#### Champs Mock
- `id`: Identifiant unique
- `name`: Nom de la campagne
- `description`: Description détaillée
- `threatActor`: Acteur de menace
- `status`: Statut (active/dormant/terminated)
- `severity`: Niveau de criticité
- `startDate`/`lastActivity`: Timeline
- `targets`: Industries/organisations ciblées
- `iocs`: Liste des IOCs
- `ttp`: MITRE ATT&CK TTPs
- `countries`: Pays affectés
- `industries`: Industries ciblées
- `victimCount`: Nombre de victimes
- `attackVectors`: Vecteurs d'attaque
- `attribution`: Attribution avec niveau de confiance

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/assess/stories` + `/assess/news-items`  
⚠️ **Action requise**: Créer des stories depuis les news items groupés, enrichir avec l'analyse de corrélation

---

### 3. **CorrelationEngine.tsx** 🔗
**Localisation**: `components/cti/CorrelationEngine.tsx`  
**Lignes**: 76-188

#### Données Mockées
```typescript
const mockRules: CorrelationRule[] = [...]
const mockResults: CorrelationResult[] = [...]
```

#### Structure
- **5 Règles de corrélation**
- **6 Résultats de corrélation**

#### Exemples de Règles
| Règle | Type | Confidence | Matches | Status |
|-------|------|------------|---------|--------|
| IOC Fingerprinting | IOC | 0.92 | 45 | Active |
| Temporal Clustering | Temporal | 0.85 | 23 | Active |
| Geographic Clustering | Geographic | 0.78 | 31 | Active |
| Behavioral Similarity | Behavioral | 0.94 | 12 | Testing |
| Attribution Analysis | Attribution | 0.87 | 18 | Active |

#### Exemples de Résultats
- Corrélations entre IOCs (IP + Domain + Campaign)
- Corrélations temporelles (attaques dans une fenêtre de 24h)
- Corrélations géographiques (même région)
- Corrélations comportementales (TTPs similaires)

#### Champs Mock - Rules
- `id`: Identifiant de la règle
- `name`: Nom de la règle
- `description`: Description
- `type`: Type de corrélation
- `confidence`: Niveau de confiance
- `status`: Statut (active/inactive/testing)
- `matches`: Nombre de correspondances
- `falsePositives`: Nombre de faux positifs
- `lastRun`: Dernière exécution

#### Champs Mock - Results
- `id`: Identifiant du résultat
- `ruleId`: Règle qui a généré le résultat
- `elements`: Éléments corrélés
- `confidence`: Niveau de confiance
- `strength`: Force de la corrélation
- `type`: Type de corrélation
- `description`: Description
- `timestamp`: Horodatage
- `verified`: Statut de vérification

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/bots/stories/group` + custom correlation logic  
⚠️ **Action requise**: Implémenter la logique de corrélation côté backend avec les bots Taranis

---

### 4. **ReportsBuilder.tsx** 📄
**Localisation**: `components/cti/ReportsBuilder.tsx`  
**Lignes**: 63-150

#### Données Mockées
```typescript
const mockReports: Report[] = [...]
```

#### Structure
- **3 Rapports** de démonstration
- **Types**: Campaign, Quarterly Trend, Executive Summary
- **Statuts**: Published, Draft, Review

#### Exemples
| Rapport | Type | Status | Severity | Date |
|---------|------|--------|----------|------|
| APT29 Campaign Analysis | Campaign | Published | Critical | 2024-01-15 |
| Ransomware Trends Q4 2023 | Quarterly | Published | High | 2024-01-14 |
| Executive Threat Briefing January 2024 | Executive | Draft | Medium | 2024-01-13 |

#### Champs Mock
- `id`: Identifiant unique
- `title`: Titre du rapport
- `description`: Description
- `type`: Type de rapport
- `status`: Statut (draft/review/published/archived)
- `severity`: Niveau de criticité
- `author`: Auteur
- `createdDate`/`updatedDate`/`publishedDate`: Dates
- `tags`: Tags de classification
- `content`: Contenu du rapport
- `executiveSummary`: Résumé exécutif
- `keyFindings`: Principales découvertes
- `recommendations`: Recommandations
- `iocs`: IOCs liés
- `ttp`: TTPs MITRE ATT&CK
- `references`: Références
- `audience`: Audience cible

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/analyze/report-items` + `/publish/products`  
⚠️ **Action requise**: Générer des rapports depuis les report items Taranis, utiliser les templates de publication

---

### 5. **InvestigationFlow.tsx** 🔍
**Localisation**: `components/cti/InvestigationFlow.tsx`  
**Lignes**: 54-121

#### Données Mockées
```typescript
const mockInvestigations: Investigation[] = [...]
```

#### Structure
- **2 Investigations** de démonstration
- **Statuts**: In-Progress, Open
- **Étapes**: Multiple steps par investigation

#### Exemples
| Investigation | Priority | Status | Assignee | Steps |
|---------------|----------|--------|----------|-------|
| APT29 Campaign Investigation | Critical | In-Progress | John Doe | 3 steps |
| Ransomware Campaign Analysis | High | Open | Mike Johnson | 1 step |

#### Champs Mock - Investigations
- `id`: Identifiant unique
- `title`: Titre de l'investigation
- `description`: Description
- `priority`: Priorité (low/medium/high/critical)
- `status`: Statut (open/in-progress/completed/closed)
- `assignee`: Personne assignée
- `createdDate`/`updatedDate`: Dates
- `steps`: Liste des étapes
- `findings`: Découvertes
- `tags`: Tags

#### Champs Mock - Steps
- `id`: Identifiant de l'étape
- `title`: Titre de l'étape
- `description`: Description
- `status`: Statut (pending/in-progress/completed)
- `assignee`: Personne assignée
- `findings`: Découvertes de l'étape
- `evidence`: Preuves collectées

#### Intégration Taranis
🔗 **Endpoint Taranis**: Custom workflow avec `/assess/stories` + `/analyze/report-items`  
⚠️ **Action requise**: Créer un système de workflow custom, pas directement supporté par Taranis

---

### 6. **ThreatIntelligenceMap.tsx** 🌍
**Localisation**: `components/cti/ThreatIntelligenceMap.tsx`  
**Lignes**: 59-203

#### Données Mockées
```typescript
const threatLocationsData: ThreatLocation[] = [...]
```

#### Structure
- **12 Localisations géographiques**
- **Régions**: North America, Asia, Europe, Middle East, Latin America, Africa, Oceania
- **Pays**: USA, China, Russia, Iran, UK, Germany, Israel, Brazil, Mexico, Nigeria, Australia, France

#### Exemples
| Pays | Région | Threats Count | Severity | Coord |
|------|--------|---------------|----------|-------|
| United States | North America | 245 | High | [-95.71, 37.09] |
| China | Asia | 189 | High | [104.19, 35.86] |
| Russia | Europe | 167 | Critical | [105.31, 61.52] |
| Iran | Middle East | 134 | High | [53.68, 32.42] |

#### Champs Mock - ThreatLocation
- `id`: Identifiant unique
- `country`: Nom du pays
- `region`: Région géographique
- `coordinates`: [longitude, latitude]
- `threatCount`: Nombre de menaces
- `severity`: Niveau de sévérité
- `threats`: Liste des menaces détaillées
- `lastUpdate`: Dernière mise à jour

#### Champs Mock - ThreatData
- `id`: Identifiant de la menace
- `title`: Titre de la menace
- `type`: Type (APT/Ransomware/Espionage/etc)
- `severity`: Niveau de criticité
- `confidence`: Score de confiance
- `source`: Source de l'info
- `timestamp`: Horodatage
- `description`: Description

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/assess/news-items` + enrichissement géographique  
⚠️ **Action requise**: Extraire les données géographiques depuis le contenu des news items (NLP/géolocalisation), enrichir avec des APIs externes (MaxMind, IP2Location)

---

### 7. **AlertSourceClusteringMap.tsx** 🗺️
**Localisation**: `components/cti/AlertSourceClusteringMap.tsx`  
**Lignes**: 103-149

#### Données Mockées
```typescript
// Pas de données mockées directement, mais transformation des données réelles
const sourceNodes: SourceNode[] = osintSources.map(...)
const coordinates = assignCoordinates(source); // Mock coordinates
```

#### Structure
- **Transformation de données Taranis réelles**
- **Coordonnées géographiques mockées** (en attendant API géo)
- **Clustering intelligent des sources**

#### Fonctions avec Mock Logic
1. **`assignCoordinates(source)`** (ligne 113)
   - Assigne des coordonnées géographiques mockées aux sources
   - Basé sur le type de source ou région estimée

2. **`calculateTrustScore(source, newsItems)`** (ligne 105)
   - Calcule un trust score basé sur les métriques
   - Algorithme de scoring custom

3. **`clusterSources(sourceNodes, osintSourceGroups)`** (ligne 136)
   - Clustering intelligent des sources OSINT
   - Basé sur les groupes Taranis et similarités

4. **`calculateCoverageScore(sourceNodes)`** (ligne 148)
   - Score de couverture géographique/thématique
   - Algorithme custom

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/assess/osint-sources-list` + `/assess/osint-source-group-list` + `/assess/news-items`  
✅ **Statut**: Partiellement intégré avec données réelles  
⚠️ **Action requise**: Intégrer une vraie API de géolocalisation (MaxMind, IP2Location)

---

### 8. **StoriesBuilder.tsx** 📚
**Localisation**: `components/cti/StoriesBuilder.tsx`  
**Lignes**: 60-121

#### Données Mockées
```typescript
// Pas de mock data directe - utilise l'API Taranis
const storiesData = await service.getStories();
```

#### Structure
- **Utilise les stories Taranis réelles**
- **Auto-connections mockées** (ligne 103)

#### Fonctions avec Mock Logic
1. **`createAutoConnections(elements)`** (ligne 103)
   - Crée des connexions automatiques entre éléments
   - Basé sur les tags similaires
   - Logique de corrélation custom

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/assess/stories` + `/assess/news-items`  
✅ **Statut**: Intégré avec données réelles  
⚠️ **Action requise**: Améliorer l'algorithme de corrélation automatique

---

### 9. **Bots System** 🤖
**Localisation**: `components/cti/data/bot-templates.ts` + `components/cti/services/bot-service.ts`

#### A. **bot-templates.ts** (Lignes: 1-655)

##### Données Mockées
```typescript
export const allBotTemplates: BotTemplate[] = [
  ...collectorTemplates,    // 5 templates
  ...analyzerTemplates,     // 5 templates
  ...enricherTemplates,     // 5 templates
  ...correlatorTemplates,   // 4 templates
  ...reporterTemplates      // 3 templates
];
```

##### Structure
- **22 Templates de bots** au total
- **5 Catégories**: Collector, Analyzer, Enricher, Correlator, Reporter

##### Exemples de Templates

###### Collectors (5)
1. **RSS Threat Intelligence Collector**
   - Sources: CISA, NCSC UK, ANSSI France
   - Interval: 2h
   - Data types: news, alerts, advisories

2. **VirusTotal API Collector**
   - API: VirusTotal
   - Rate limit aware
   - IOC enrichment

3. **Twitter Threat Monitoring**
   - Platform: Twitter API v2
   - Keywords: threat intelligence
   - Real-time streaming

4. **MISP Feed Collector**
   - Source: MISP instances
   - Sync interval: 1h
   - IOC collection

5. **Web Scraper Advanced**
   - Custom selectors
   - Javascript rendering
   - Multi-source

###### Analyzers (5)
1. **Malware Analysis Bot**
   - File analysis
   - Hash correlation
   - Yara rules

2. **Phishing Detector**
   - URL analysis
   - Brand detection
   - Screenshot analysis

3. **APT Attribution Analyzer**
   - TTP matching
   - Actor profiling
   - MITRE mapping

4. **Vulnerability Analyzer**
   - CVE tracking
   - CVSS scoring
   - Patch availability

5. **Sentiment Analyzer**
   - NLP analysis
   - Risk scoring
   - Trend detection

###### Enrichers (5)
1. **VirusTotal Enricher**
2. **Shodan IOC Enricher**
3. **WHOIS Domain Enricher**
4. **GeoIP Enricher**
5. **MITRE ATT&CK Enricher**

###### Correlators (4)
1. **IOC Correlation Bot**
2. **Temporal Correlation Bot**
3. **Campaign Tracker Bot**
4. **TTP Pattern Matcher**

###### Reporters (3)
1. **Daily Threat Report**
2. **Executive Briefing Generator**
3. **Incident Report Builder**

#### B. **bot-service.ts** (Lignes: 57-672)

##### Données Mockées
```typescript
async createBot(botData: Partial<Bot>): Promise<Bot> {
  // Simulation de création
  const newBot: Bot = {
    id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: botData.name || 'Nouveau Bot',
    type: botData.type || 'analyzer',
    status: 'inactive',
    // ... configuration par défaut
  };
  return newBot;
}
```

##### Structure
- **Service complet pour les bots**
- **Création/Update/Delete en simulation** (Taranis API ne supporte pas)
- **Actions**: start, stop, pause, resume (via `/config/bots/{bot_id}/execute`)

##### Méthodes avec Mock
1. **`createBot()`** - Crée un bot (simulation)
2. **`updateBot()`** - Met à jour un bot (simulation)
3. **`deleteBot()`** - Supprime un bot (simulation)

##### Méthodes Réelles (Taranis API)
1. **`getAllBots()`** - GET `/config/bots`
2. **`getBotById()`** - GET `/config/bots/{id}`
3. **`executeBot()`** - POST `/config/bots/{bot_id}/execute`

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/config/bots` + `/config/bots/{bot_id}/execute`  
✅ **Statut**: Lecture intégrée avec API réelle  
⚠️ **Action requise**: Création/modification/suppression doivent être faites via l'interface admin Taranis (pas d'API)

---

### 10. **HeatmapView.tsx** 🔥
**Localisation**: `components/cti/map-views/HeatmapView.tsx`  
**Ligne**: 49

#### Données Mockées
```typescript
// Mock data generation basée sur source metrics
```

#### Structure
- **Génération de heatmap temporelle**
- **24 heures de données** (activité par heure)
- **Basé sur les métriques de sources**

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/assess/osint-sources-list` + analysis des timestamps  
✅ **Statut**: Génération depuis données réelles  
⚠️ **Action requise**: Améliorer l'agrégation temporelle

---

### 11. **GeographicView.tsx** 🌐
**Localisation**: `components/cti/map-views/GeographicView.tsx`

#### Données Mockées
- **Coordonnées géographiques** des sources (mockées)
- **Clustering géographique** (algorithme custom)

#### Structure
- **Carte Leaflet + Mapbox**
- **Markers pour chaque source**
- **Clustering automatique**

#### Intégration Taranis
🔗 **Endpoint Taranis**: `/assess/osint-sources-list`  
⚠️ **Action requise**: API de géolocalisation pour coordonnées réelles

---

## 🔄 Plan d'Intégration avec Taranis API

### Phase 1: Données Directement Disponibles ✅
Ces données sont déjà disponibles via l'API Taranis:
- ✅ **Sources OSINT** → `/assess/osint-sources-list`
- ✅ **Groupes de sources** → `/assess/osint-source-group-list`
- ✅ **News items** → `/assess/news-items`
- ✅ **Stories** → `/assess/stories`
- ✅ **Report items** → `/analyze/report-items`
- ✅ **Products (rapports)** → `/publish/products`
- ✅ **Bots** → `/config/bots`

### Phase 2: Données Nécessitant Transformation 🔄
Ces données nécessitent une transformation/enrichissement:
- 🔄 **IOCs** → Extraire depuis news items via bots analyzers
- 🔄 **Campagnes** → Créer depuis stories groupées + corrélation
- 🔄 **Corrélations** → Implémenter logique custom avec bots
- 🔄 **Coordonnées géo** → Enrichir avec API externe (MaxMind)
- 🔄 **Trust scores** → Calculer depuis métriques sources
- 🔄 **Clustering** → Algorithme custom sur données réelles

### Phase 3: Fonctionnalités Custom 🛠️
Ces fonctionnalités nécessitent un développement custom:
- 🛠️ **Investigation Flow** → Workflow management custom
- 🛠️ **Threat Intelligence Map** → Agrégation géographique
- 🛠️ **Correlation Engine** → Moteur de corrélation avancé
- 🛠️ **Auto-connections** → IA pour lier les éléments
- 🛠️ **Performance monitoring** → Métriques custom

---

## 📋 Checklist d'Intégration

### Priorité 1 (Haute) 🔴
- [ ] Remplacer IOCs mockés par extraction depuis news items
- [ ] Implémenter clustering géographique réel (API MaxMind)
- [ ] Créer système de campagnes depuis stories Taranis
- [ ] Intégrer trust score calculation avec métriques réelles

### Priorité 2 (Moyenne) 🟡
- [ ] Développer correlation engine backend
- [ ] Implémenter auto-connections intelligentes
- [ ] Créer système de génération de rapports depuis report items
- [ ] Intégrer enrichissement IOC (VirusTotal, Shodan, etc.)

### Priorité 3 (Basse) 🟢
- [ ] Développer investigation workflow system
- [ ] Améliorer heatmap temporelle avec données historiques
- [ ] Ajouter analytics avancés pour performance monitoring
- [ ] Implémenter système de templates de rapports

---

## 🎯 Recommendations

### 1. **Architecture de Transition**
```
┌─────────────────┐
│   Frontend      │
│  (React/TS)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service Layer  │ ← Couche d'abstraction pour transition
│  (Taranis API)  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ Taranis│ │  Custom  │
│  API   │ │  Logic   │
└────────┘ └──────────┘
```

### 2. **Migration Progressive**
- **Étape 1**: Identifier toutes les sources de mock data (✅ FAIT)
- **Étape 2**: Mapper aux endpoints Taranis correspondants
- **Étape 3**: Implémenter les transformations nécessaires
- **Étape 4**: Développer la logique custom manquante
- **Étape 5**: Tests d'intégration et validation

### 3. **Services Externes Recommandés**
- **GeoIP**: MaxMind GeoIP2 ou IP2Location
- **IOC Enrichment**: VirusTotal, AbuseIPDB, Shodan
- **Threat Intel**: MISP, OpenCTI, AlienVault OTX
- **NLP**: spaCy, NLTK pour extraction d'entités

### 4. **Bots Taranis à Développer**
1. **IOC Extractor Bot** (analyzer)
   - Extrait les IOCs depuis news items
   - Enrichit avec APIs externes
   - Stocke dans report items

2. **Campaign Tracker Bot** (correlator)
   - Corrèle les stories en campagnes
   - Track les évolutions
   - Attribution automatique

3. **Geo Enricher Bot** (enricher)
   - Enrichit les sources avec coordonnées
   - Analyse géographique du contenu
   - Mapping pays/régions

4. **Trust Score Calculator Bot** (analyzer)
   - Calcule trust score des sources
   - Basé sur métriques historiques
   - Learning over time

---

## 📊 Métriques de Mock Data

### Par Composant
| Composant | Mock Items | Mock Types | Integration Status |
|-----------|-----------|------------|-------------------|
| IOCsManager | 5 | IOC objects | 🔴 Not integrated |
| CampaignsTracker | 4 | Campaign objects | 🔴 Not integrated |
| CorrelationEngine | 11 | Rules + Results | 🔴 Not integrated |
| ReportsBuilder | 3 | Report objects | 🟡 Partial |
| InvestigationFlow | 2 | Investigation objects | 🔴 Not integrated |
| ThreatIntelligenceMap | 12 | Location + Threats | 🔴 Not integrated |
| AlertSourceClusteringMap | 0 | Functions only | 🟢 Real data |
| StoriesBuilder | 0 | Functions only | 🟢 Real data |
| BotTemplates | 22 | Bot templates | 🟡 Templates only |
| BotService | 0 | Simulation methods | 🟡 Partial |
| HeatmapView | Dynamic | Time-series data | 🟢 Real data |

### Légende Status
- 🟢 **Real data**: Utilise déjà les données Taranis réelles
- 🟡 **Partial**: Partiellement intégré, nécessite enrichissement
- 🔴 **Not integrated**: Entièrement mocké, nécessite intégration

---

## 🚀 Action Items

### Immédiat (Sprint 1)
1. **Développer le service d'extraction d'IOCs**
   - Parser les news items
   - Extraire IPs, domains, hashes, URLs
   - Stocker dans la structure IOC

2. **Intégrer API de géolocalisation**
   - Choisir provider (MaxMind recommandé)
   - Implémenter dans AlertSourceClusteringMap
   - Enrichir ThreatIntelligenceMap

3. **Créer le système de campagnes**
   - Grouper stories similaires
   - Tracker évolution temporelle
   - Attribution automatique

### Court Terme (Sprint 2-3)
4. **Développer Correlation Engine**
   - Implémenter rules engine
   - Stocker les résultats
   - Interface de configuration

5. **Système de génération de rapports**
   - Templates de rapports
   - Génération automatique
   - Export PDF/JSON

6. **Investigation Workflow**
   - State machine pour investigations
   - Steps management
   - Evidence tracking

### Long Terme (Sprint 4+)
7. **IA & Machine Learning**
   - Auto-classification des threats
   - Prédiction de campagnes
   - Scoring automatique

8. **Analytics Avancés**
   - Dashboards custom
   - KPIs métier
   - Reporting automatisé

---

## 📚 Ressources

### Documentation Taranis
- [Taranis API Swagger](http://localhost:3000/frontend/doc/swagger.json)
- [Taranis GitHub](https://github.com/SK-CERT/Taranis-NG)

### APIs Externes Recommandées
- [MaxMind GeoIP2](https://www.maxmind.com/en/geoip2-services-and-databases)
- [VirusTotal API](https://developers.virustotal.com/reference)
- [AbuseIPDB API](https://www.abuseipdb.com/api)
- [Shodan API](https://developer.shodan.io/)
- [MISP API](https://www.misp-project.org/openapi/)

### Outils de Développement
- [D3.js](https://d3js.org/) - Visualisations
- [Leaflet](https://leafletjs.com/) - Cartes
- [Recharts](https://recharts.org/) - Graphiques
- [React Query](https://tanstack.com/query) - Data fetching

---

## 🏁 Conclusion

Ce document cartographie **11 composants principaux** utilisant des données mockées, avec un total de **~150+ objets mockés** et **22 bot templates**.

**Prochaine étape**: Commencer l'intégration progressive en suivant le plan d'action ci-dessus, en priorisant les IOCs et la géolocalisation.

---

**Auteur**: AI Assistant  
**Date de dernière mise à jour**: 2024-10-01  
**Version**: 1.0.0

