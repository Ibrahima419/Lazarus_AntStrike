# 🗺️ Mapping Endpoints Taranis ↔️ Données Mockées
## AntStrike CTI Platform - Guide d'Intégration API

> **Date**: 2025-10-04  
> **Version**: 1.0  
> **Base URL**: `/api` (Taranis)

---

## 📋 Table des Matières

1. [Endpoints Disponibles](#endpoints-disponibles)
2. [Mapping par Composant](#mapping-par-composant)
3. [Endpoints Manquants](#endpoints-manquants)
4. [Plan d'Implémentation](#plan-dimplémentation)

---

## 🔗 Endpoints Disponibles

### **1. Authentication** 🔐

| Méthode | Endpoint | Description | Usage |
|---------|----------|-------------|-------|
| `POST` | `/auth/login` | Authentification utilisateur | ✅ Intégré |
| `GET` | `/auth/refresh` | Rafraîchir le token JWT | ✅ Intégré |
| `DELETE` | `/auth/logout` | Déconnexion | ✅ Intégré |

---

### **2. News Items (Assess)** 📰

| Méthode | Endpoint | Description | Mapping Mock Data |
|---------|----------|-------------|-------------------|
| `GET` | `/assess/news-items` | Récupérer news items | ✅ **IOCsManager** (extraire IOCs) |
| `GET` | `/assess/news-items/{id}` | Détail d'un news item | ✅ **ThreatIntelMap** (géolocalisation) |
| `PUT` | `/assess/news-items/{id}` | Modifier news item | 🔄 Mise à jour données |
| `DELETE` | `/assess/news-items/{id}` | Supprimer news item | 🔄 Gestion lifecycle |

**Paramètres disponibles:**
- `search`: Recherche textuelle
- `filter`: Filtrage par critères
- `sort`: Tri des résultats
- `offset`/`limit`: Pagination
- `range`: Plage temporelle
- `read`: Status de lecture
- `important`: Items importants
- `relevant`: Items pertinents

**Structure Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "author": "string",
      "source": "string",
      "osint_source_id": "string",
      "published": "string",
      "collected": "string",
      "link": "string",
      "hash": "string",
      "language": "string",
      "review": "string",
      "story_id": "string",
      "attributes": [
        {
          "id": 0,
          "key": "string",
          "value": "string",
          "binary_mime_type": "string",
          "binary_value": "string"
        }
      ]
    }
  ],
  "total_count": 0
}
```

---

### **3. Stories (Assess)** 📚

| Méthode | Endpoint | Description | Mapping Mock Data |
|---------|----------|-------------|-------------------|
| `GET` | `/assess/stories` | Récupérer stories | ✅ **CampaignsTracker** |
| `GET` | `/assess/stories/{id}` | Détail d'une story | ✅ **StoriesBuilder** |
| `PUT` | `/assess/stories/{id}` | Modifier story | 🔄 Mise à jour |
| `DELETE` | `/assess/stories/{id}` | Supprimer story | 🔄 Gestion |
| `PUT` | `/bots/stories/group` | Grouper news items → story | ✅ **CampaignsTracker** |

**Paramètres disponibles:**
- `search`: Recherche
- `filter`: Filtrage
- `sort`: Tri
- `offset`/`limit`: Pagination
- `range`: Plage temporelle

**Structure Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "created": "string",
      "last_change": "string",
      "read": true,
      "important": true,
      "likes": 0,
      "dislikes": 0,
      "in_reports_count": 0,
      "comments": "string",
      "tags": [
        {
          "name": "string",
          "tag_type": "string"
        }
      ],
      "news_items": [...]
    }
  ],
  "total_count": 0
}
```

---

### **4. OSINT Sources** 🔍

| Méthode | Endpoint | Description | Mapping Mock Data |
|---------|----------|-------------|-------------------|
| `GET` | `/config/osint-sources` | Liste des sources OSINT | ✅ **AlertSourceMap** |
| `GET` | `/config/osint-sources/{id}` | Détail source | ✅ **GeographicView** |
| `POST` | `/config/osint-sources` | Ajouter source | 🔄 Config |
| `PUT` | `/config/osint-sources/{id}` | Modifier source | 🔄 Config |
| `DELETE` | `/config/osint-sources/{id}` | Supprimer source | 🔄 Config |
| `POST` | `/config/osint-sources/{id}/collect` | Collecter depuis une source | 🔄 Trigger collection |
| `POST` | `/config/osint-sources/collect` | Collecter toutes sources | 🔄 Trigger global |

**Structure Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "type": "string",
      "parameters": [
        {
          "parameter": {
            "id": 0,
            "key": "string",
            "name": "string",
            "type": "STRING",
            "description": "string"
          },
          "value": "string"
        }
      ]
    }
  ],
  "total_count": 0
}
```

---

### **5. OSINT Source Groups** 📦

| Méthode | Endpoint | Description | Mapping Mock Data |
|---------|----------|-------------|-------------------|
| `GET` | `/config/osint-source-groups` | Liste groupes | ✅ **AlertSourceMap** |
| `POST` | `/config/osint-source-groups` | Créer groupe | 🔄 Config |
| `PUT` | `/config/osint-source-groups/{id}` | Modifier groupe | 🔄 Config |
| `DELETE` | `/config/osint-source-groups/{id}` | Supprimer groupe | 🔄 Config |

**Structure Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "default": true,
      "osint_sources": ["string"],
      "word_lists": [0]
    }
  ],
  "total_count": 0
}
```

---

### **6. Bots** 🤖

| Méthode | Endpoint | Description | Mapping Mock Data |
|---------|----------|-------------|-------------------|
| `GET` | `/config/bots` | Liste des bots | ✅ **BotTemplates** |
| `GET` | `/config/bots/{id}` | Détail bot | ✅ **BotsDashboard** |
| `POST` | `/config/bots` | Créer bot | ✅ **BotService.createBot()** |
| `PUT` | `/config/bots/{id}` | Modifier bot | ✅ **BotService.updateBot()** |
| `DELETE` | `/config/bots/{id}` | Supprimer bot | ✅ **BotService.deleteBot()** |
| `POST` | `/config/bots/{id}/execute` | Exécuter bot | ✅ **BotService.executeBot()** |
| `GET` | `/worker/bots` | Liste bots (worker) | ✅ Alternative |

**Structure Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "type": "string",
      "index": 0,
      "parameters": [
        {
          "parameter": {
            "id": 0,
            "key": "string",
            "name": "string",
            "type": "STRING",
            "description": "string"
          },
          "value": "string"
        }
      ]
    }
  ],
  "total_count": 0
}
```

---

### **7. Report Items (Analyze)** 📄

| Méthode | Endpoint | Description | Mapping Mock Data |
|---------|----------|-------------|-------------------|
| `GET` | `/analyze/report-items` | Liste report items | ✅ **ReportsBuilder** |
| `GET` | `/analyze/report-items/{id}` | Détail report item | ✅ **ReportsBuilder** |
| `POST` | `/analyze/report-items` | Créer report item | 🔄 Création rapports |
| `PUT` | `/analyze/report-items/{id}` | Modifier report item | 🔄 Mise à jour |
| `DELETE` | `/analyze/report-items/{id}` | Supprimer report item | 🔄 Gestion |
| `POST` | `/analyze/report-items/{id}/clone` | Cloner report item | 🔄 Duplication |
| `PUT` | `/analyze/report-items/{id}/lock` | Verrouiller | 🔄 Collaboration |
| `DELETE` | `/analyze/report-items/{id}/lock` | Déverrouiller | 🔄 Collaboration |

**Paramètres disponibles:**
- `search`: Recherche
- `completed`: Filtrer par statut
- `range`: Plage temporelle
- `sort`: Tri
- `group`: Grouper par type
- `offset`/`limit`: Pagination

**Structure Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "report_item_type_id": 0,
      "completed": true,
      "created": "2025-10-04T...",
      "last_updated": "2025-10-04T...",
      "attribute_groups": ["string"],
      "attributes": [
        {
          "id": 0,
          "title": "string",
          "description": "string",
          "type": "STRING",
          "value": "string",
          "required": true,
          "index": 0
        }
      ],
      "stories": [...]
    }
  ],
  "total_count": 0
}
```

---

### **8. Products (Publish)** 📤

| Méthode | Endpoint | Description | Mapping Mock Data |
|---------|----------|-------------|-------------------|
| `GET` | `/publish/products` | Liste produits | ✅ **ReportsBuilder** |
| `GET` | `/publish/products/{id}` | Détail produit | ✅ **ReportsBuilder** |
| `PUT` | `/publish/products/{id}` | Modifier produit | 🔄 Mise à jour |
| `DELETE` | `/publish/products/{id}` | Supprimer produit | 🔄 Gestion |
| `POST` | `/publish/products/{id}/render` | Générer produit | 🔄 Génération PDF/HTML |
| `GET` | `/publish/products/{id}/render` | Télécharger produit | 🔄 Download |
| `POST` | `/publish/products/{id}/publishers/{pub_id}` | Publier | 🔄 Publication |

**Structure Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "product_type_id": 0,
      "report_items": ["string"]
    }
  ],
  "total_count": 0
}
```

---

### **9. Dashboard** 📊

| Méthode | Endpoint | Description | Mapping Mock Data |
|---------|----------|-------------|-------------------|
| `GET` | `/dashboard` | Stats dashboard | ✅ **CTIDashboard** |
| `GET` | `/dashboard/trending-clusters` | Clusters tendances | ✅ **ThreatMap** |

**Structure Response:**
```json
{
  "total_news_items": 0,
  "total_database_items": 0,
  "total_products": 0,
  "report_items_completed": 0,
  "report_items_in_progress": 0,
  "latest_collected": "2025-10-04T..."
}
```

---

### **10. Workers & Queue** ⚙️

| Méthode | Endpoint | Description | Usage |
|---------|----------|-------------|-------|
| `GET` | `/config/workers` | Liste workers connectés | 🔄 Monitoring |
| `GET` | `/config/workers/queue-status` | Status queue RabbitMQ | 🔄 Monitoring |

---

### **11. Tags** 🏷️

| Méthode | Endpoint | Description | Mapping Mock Data |
|---------|----------|-------------|-------------------|
| `GET` | `/worker/tags` | Liste tous les tags | ✅ **StoriesBuilder** |
| `PUT` | `/worker/tags` | Mettre à jour tags | 🔄 Tagging |

---

### **12. Attributes** 🔧

| Méthode | Endpoint | Description | Usage |
|---------|----------|-------------|-------|
| `GET` | `/config/attributes` | Liste attributs | 🔄 Configuration |
| `POST` | `/config/attributes` | Créer attribut | 🔄 Configuration |
| `PUT` | `/config/attributes/{id}` | Modifier attribut | 🔄 Configuration |
| `DELETE` | `/config/attributes/{id}` | Supprimer attribut | 🔄 Configuration |

---

### **13. Word Lists** 📝

| Méthode | Endpoint | Description | Usage |
|---------|----------|-------------|-------|
| `GET` | `/config/word-lists` | Liste wordlists | 🔄 Filtrage |
| `POST` | `/config/word-lists` | Créer wordlist | 🔄 Configuration |
| `PUT` | `/config/word-lists/{id}` | Modifier wordlist | 🔄 Configuration |
| `POST` | `/config/word-lists/gather/{id}` | Collecter wordlist | 🔄 Enrichissement |

---

## 🎯 Mapping par Composant Mock → Endpoints

### **1. IOCsManager.tsx** (100% Mock)

**Données mockées:**
- 5 IOCs (IP, Domain, Hash, URL, Email)

**Endpoints à utiliser:**

```typescript
// EXTRACTION IOCs depuis News Items
GET /assess/news-items
GET /bots/news-item?limit={date}
PUT /bots/news-item/{id}/attributes

// WORKFLOW
1. Récupérer news items
2. Extraire IOCs avec bot analyzer (à développer)
3. Stocker dans report items avec attributs custom
```

**Stratégie d'intégration:**
```typescript
// 1. Créer un bot analyzer "IOC Extractor"
POST /config/bots
{
  "name": "IOC Extractor",
  "type": "analyzer",
  "description": "Extract IOCs from news items"
}

// 2. Récupérer news items
GET /assess/news-items?limit=100&range=7d

// 3. Parser content pour extraire IOCs
// Regex patterns pour: IP, Domain, Hash, URL, Email

// 4. Stocker dans report items
POST /analyze/report-items
{
  "title": "IOC Analysis",
  "report_item_type_id": 1,
  "attributes": [
    {
      "key": "ioc_type",
      "value": "IP"
    },
    {
      "key": "ioc_value",
      "value": "192.168.1.100"
    },
    {
      "key": "confidence",
      "value": "0.95"
    }
  ]
}
```

**Status:** 🔴 À développer (Bot Analyzer requis)

---

### **2. CampaignsTracker.tsx** (100% Mock)

**Données mockées:**
- 4 Campaigns (APT29, Conti, etc.)

**Endpoints à utiliser:**

```typescript
// GROUPER Stories en Campaigns
GET /assess/stories
PUT /bots/stories/group
GET /assess/news-items

// WORKFLOW
1. Récupérer stories similaires
2. Grouper par correlation (TTP, temps, géo)
3. Créer report item "Campaign"
```

**Stratégie d'intégration:**
```typescript
// 1. Récupérer stories
GET /assess/stories?range=30d&sort=last_change

// 2. Grouper stories similaires
PUT /bots/stories/group
{
  "news_item_ids": ["id1", "id2", "id3"]
}

// 3. Créer campaign report item
POST /analyze/report-items
{
  "title": "APT29 Campaign",
  "report_item_type_id": 2, // Campaign type
  "stories": ["story_id_1", "story_id_2"],
  "attributes": [
    {
      "key": "threat_actor",
      "value": "APT29"
    },
    {
      "key": "victim_count",
      "value": "47"
    },
    {
      "key": "ttp",
      "value": "T1566.001,T1055"
    }
  ]
}
```

**Status:** 🔴 À développer (Logique de groupement requise)

---

### **3. CorrelationEngine.tsx** (100% Mock)

**Données mockées:**
- 5 Règles de corrélation
- 6 Résultats de corrélation

**Endpoints à utiliser:**

```typescript
// CORRELATION via Bots
GET /config/bots
POST /config/bots/{id}/execute
GET /assess/news-items
GET /assess/stories

// WORKFLOW
1. Créer bots correlators
2. Définir règles de corrélation
3. Exécuter corrélation
4. Stocker résultats
```

**Stratégie d'intégration:**
```typescript
// 1. Créer bot correlator
POST /config/bots
{
  "name": "IOC Co-occurrence Correlator",
  "type": "correlator",
  "parameters": [
    {
      "parameter": {"key": "correlation_type"},
      "value": "ioc"
    },
    {
      "parameter": {"key": "confidence_threshold"},
      "value": "0.85"
    }
  ]
}

// 2. Exécuter corrélation
POST /config/bots/{bot_id}/execute

// 3. Récupérer résultats (stockés dans report items)
GET /analyze/report-items?filter=correlation_results
```

**Status:** 🔴 À développer (Bots Correlators requis)

---

### **4. ReportsBuilder.tsx** (80% Mock)

**Données mockées:**
- 3 Rapports

**Endpoints à utiliser:**

```typescript
// RAPPORTS
GET /analyze/report-items
POST /analyze/report-items
GET /publish/products
POST /publish/products/{id}/render
GET /analyze/report-types

// WORKFLOW déjà partiellement intégré
```

**Stratégie d'intégration:**
```typescript
// 1. Lister report items
GET /analyze/report-items?completed=true

// 2. Créer product (rapport final)
POST /publish/products
{
  "title": "APT29 Campaign Analysis",
  "description": "Detailed analysis...",
  "product_type_id": 1,
  "report_items": ["item_id_1", "item_id_2"]
}

// 3. Générer PDF/HTML
POST /publish/products/{product_id}/render

// 4. Télécharger
GET /publish/products/{product_id}/render
```

**Status:** 🟡 Partiellement intégré (améliorer templates)

---

### **5. InvestigationFlow.tsx** (100% Mock)

**Données mockées:**
- 2 Investigations avec steps

**Endpoints à utiliser:**

```typescript
// WORKFLOW CUSTOM avec Report Items
POST /analyze/report-items (pour investigation)
PUT /analyze/report-items/{id} (pour steps)
PUT /analyze/report-items/{id}/lock (collaboration)

// WORKFLOW
1. Créer report item "Investigation"
2. Ajouter steps comme attributs
3. Lier stories/news items
```

**Stratégie d'intégration:**
```typescript
// 1. Créer investigation
POST /analyze/report-items
{
  "title": "APT29 Investigation",
  "report_item_type_id": 3, // Investigation type
  "completed": false,
  "attributes": [
    {
      "key": "priority",
      "value": "critical"
    },
    {
      "key": "status",
      "value": "in-progress"
    },
    {
      "key": "assignee",
      "value": "John Doe"
    },
    {
      "key": "steps",
      "value": JSON.stringify([
        {
          "id": "step-1",
          "title": "IOC Collection",
          "status": "completed",
          "findings": ["IP found", "Hash collected"]
        }
      ])
    }
  ],
  "stories": ["story_id_1"]
}

// 2. Verrouiller pendant édition
PUT /analyze/report-items/{id}/lock

// 3. Mettre à jour
PUT /analyze/report-items/{id}

// 4. Déverrouiller
DELETE /analyze/report-items/{id}/lock
```

**Status:** 🔴 À développer (Workflow custom requis)

---

### **6. ThreatIntelligenceMap.tsx** (90% Mock)

**Données mockées:**
- 12 Localisations géographiques
- Threats par pays

**Endpoints à utiliser:**

```typescript
// DONNÉES + ENRICHISSEMENT GEO
GET /assess/news-items
GET /dashboard/trending-clusters
GET /assess/stories

// WORKFLOW
1. Récupérer news items
2. Extraire localisations (NLP/APIs externes)
3. Agréger par pays/région
4. Calculer threat count
```

**Stratégie d'intégration:**
```typescript
// 1. Récupérer tous news items
GET /assess/news-items?limit=1000&range=30d

// 2. Extraire pays mentionnés (NLP)
// Utiliser APIs externes:
// - MaxMind GeoIP2 pour IPs
// - NLP pour extraction entités géographiques

// 3. Créer bot enricher
POST /config/bots
{
  "name": "Geographic Enricher",
  "type": "enricher",
  "description": "Add geographic metadata"
}

// 4. Stocker coordonnées dans attributes
PUT /bots/news-item/{id}/attributes
{
  "key": "geo_location",
  "value": JSON.stringify({
    "country": "Russia",
    "coordinates": [105.31, 61.52]
  })
}

// 5. Agréger par pays
// Frontend: groupBy(newsItems, 'attributes.geo_location.country')
```

**Status:** 🔴 À développer (API Géo + Bot Enricher requis)

---

### **7. AlertSourceClusteringMap.tsx** (30% Mock)

**Données mockées:**
- Coordonnées géo mockées
- Trust scores calculés

**Endpoints à utiliser:**

```typescript
// DÉJÀ INTÉGRÉ
GET /config/osint-sources
GET /config/osint-source-groups
GET /assess/news-items

// ENRICHISSEMENT requis
// - Coordonnées géographiques (API externe)
// - Trust score calculation (algorithme custom)
```

**Stratégie d'intégration:**
```typescript
// 1. Récupérer sources
GET /config/osint-sources

// 2. Pour chaque source, obtenir coordonnées
// Via API externe (MaxMind, IP2Location)
const geoData = await geoIPService.lookup(source.parameters.find(p => p.parameter.key === 'url').value);

// 3. Calculer trust score
const trustScore = calculateTrustScore({
  newsItemsCount: newsItems.filter(ni => ni.osint_source_id === source.id).length,
  averageQuality: ...,
  falsePositiveRate: ...
});

// 4. Stocker dans state local ou cache
```

**Status:** 🟢 Partiellement intégré (ajout API géo requis)

---

### **8. StoriesBuilder.tsx** (20% Mock)

**Données mockées:**
- Auto-connections entre éléments

**Endpoints à utiliser:**

```typescript
// DÉJÀ INTÉGRÉ
GET /assess/stories
PUT /bots/stories/group
GET /worker/tags

// AMÉLIORATION
// - Algorithme de corrélation IA
// - Auto-connections intelligentes
```

**Status:** 🟢 Intégré (amélioration algo possible)

---

### **9. BotTemplates (bot-templates.ts)** (100% Mock)

**Données mockées:**
- 22 Templates de bots

**Endpoints à utiliser:**

```typescript
// CRÉATION BOTS depuis templates
POST /config/bots
GET /config/bots
GET /config/parameters

// WORKFLOW
1. Templates statiques OK
2. Créer bots via API depuis templates
```

**Stratégie d'intégration:**
```typescript
// Templates restent statiques (OK)
// Utiliser templates pour créer bots via API

import { allBotTemplates } from './bot-templates';

// Créer bot depuis template
const createBotFromTemplate = async (template: BotTemplate) => {
  const response = await fetch('/api/config/bots', {
    method: 'POST',
    body: JSON.stringify({
      name: template.name,
      description: template.description,
      type: template.category.toLowerCase(),
      parameters: template.configuration.map(config => ({
        parameter: {
          key: config.key,
          name: config.label,
          type: config.type.toUpperCase()
        },
        value: config.defaultValue
      }))
    })
  });
  return response.json();
};
```

**Status:** 🟡 Templates OK (création API à implémenter)

---

### **10. BotService (bot-service.ts)** (40% Mock)

**Méthodes mockées:**
- `createBot()` - Simulation
- `updateBot()` - Simulation
- `deleteBot()` - Simulation

**Méthodes réelles:**
- `getAllBots()` - API
- `getBotById()` - API
- `executeBot()` - API

**Endpoints à utiliser:**

```typescript
// DÉJÀ UTILISÉ
GET /config/bots
GET /config/bots/{id}
POST /config/bots/{id}/execute

// À INTÉGRER
POST /config/bots (pour createBot)
PUT /config/bots/{id} (pour updateBot)
DELETE /config/bots/{id} (pour deleteBot)
```

**Stratégie d'intégration:**
```typescript
// Remplacer méthodes mockées par vraies calls API

// AVANT (Mock)
async createBot(botData: Partial<Bot>): Promise<Bot> {
  const newBot: Bot = {
    id: `bot_${Date.now()}`,
    name: botData.name || 'Nouveau Bot',
    // ... simulation
  };
  return newBot;
}

// APRÈS (Real)
async createBot(botData: Partial<Bot>): Promise<Bot> {
  const response = await this.apiClient.post('/config/bots', {
    name: botData.name,
    description: botData.description,
    type: botData.type,
    parameters: botData.parameters
  });
  return response.data;
}

// Idem pour updateBot et deleteBot
```

**Status:** 🟡 Partiellement intégré (CRUD à compléter)

---

## ❌ Endpoints Manquants (Non disponibles dans Taranis)

### **1. IOC Extraction API**
```
❌ GET /iocs
❌ POST /iocs
❌ GET /iocs/{id}
```
**Solution:** Créer bot analyzer custom

---

### **2. Campaign Tracking API**
```
❌ GET /campaigns
❌ POST /campaigns
❌ GET /campaigns/{id}
```
**Solution:** Utiliser report items + groupement stories

---

### **3. Correlation Results API**
```
❌ GET /correlations
❌ POST /correlations/rules
❌ GET /correlations/results
```
**Solution:** Créer bots correlators custom

---

### **4. Investigation Workflow API**
```
❌ GET /investigations
❌ POST /investigations
❌ PUT /investigations/{id}/steps
```
**Solution:** Utiliser report items avec attributs custom

---

### **5. Geographic Enrichment API**
```
❌ POST /enrich/geolocation
❌ GET /threats/by-country
```
**Solution:** Intégrer API externe (MaxMind) + bot enricher

---

## 🚀 Plan d'Implémentation

### **Phase 1: APIs Directes** (Sprint 1 - 2 semaines)

#### ✅ **Déjà fait:**
- Auth (login/logout/refresh)
- News items (lecture)
- Stories (lecture)
- Sources OSINT (lecture)
- Bots (lecture + execute)
- Report items (lecture)
- Products (lecture)
- Dashboard (stats)

#### 🔄 **À compléter:**
1. **Bot CRUD complet**
   ```typescript
   // bot-service.ts
   async createBot() → POST /config/bots
   async updateBot() → PUT /config/bots/{id}
   async deleteBot() → DELETE /config/bots/{id}
   ```
   **Temps:** 2h

2. **Report Items CRUD complet**
   ```typescript
   // reports-service.ts
   async createReport() → POST /analyze/report-items
   async updateReport() → PUT /analyze/report-items/{id}
   async deleteReport() → DELETE /analyze/report-items/{id}
   ```
   **Temps:** 2h

3. **Products CRUD complet**
   ```typescript
   // publish-service.ts
   async generateProduct() → POST /publish/products/{id}/render
   async downloadProduct() → GET /publish/products/{id}/render
   ```
   **Temps:** 2h

**Total Phase 1:** 6h

---

### **Phase 2: Extraction & Enrichissement** (Sprint 2 - 3 semaines)

#### 1. **IOC Extractor Bot** 🔴 Haute priorité
```typescript
// Créer bot analyzer
POST /config/bots
{
  "name": "IOC Extractor",
  "type": "analyzer",
  "description": "Extract IOCs from news items"
}

// Parser news items
const extractIOCs = (content: string) => {
  const iocs = {
    ips: content.match(IP_REGEX),
    domains: content.match(DOMAIN_REGEX),
    hashes: content.match(HASH_REGEX),
    urls: content.match(URL_REGEX),
    emails: content.match(EMAIL_REGEX)
  };
  return iocs;
};

// Stocker dans report items
POST /analyze/report-items
```
**Temps:** 8h

#### 2. **API Géolocalisation** 🔴 Haute priorité
```typescript
// Intégrer MaxMind GeoIP2
import { Reader } from '@maxmind/geoip2-node';

const geoIPService = {
  async lookup(ip: string) {
    const reader = await Reader.open('/path/to/GeoLite2-City.mmdb');
    const response = reader.city(ip);
    return {
      country: response.country?.names.en,
      city: response.city?.names.en,
      coordinates: [
        response.location?.longitude,
        response.location?.latitude
      ]
    };
  }
};

// Créer bot enricher
POST /config/bots
{
  "name": "Geographic Enricher",
  "type": "enricher"
}

// Enrichir news items
PUT /bots/news-item/{id}/attributes
```
**Temps:** 5h

#### 3. **Campaign Tracker** 🟡 Moyenne priorité
```typescript
// Grouper stories similaires
const groupStoriesToCampaign = async (stories: Story[]) => {
  // Algorithme de clustering
  const clusters = clusterByTTP(stories);
  
  for (const cluster of clusters) {
    // Grouper via API
    await PUT /bots/stories/group
    
    // Créer campaign report item
    await POST /analyze/report-items
  }
};
```
**Temps:** 5h

**Total Phase 2:** 18h

---

### **Phase 3: Corrélation & Workflow** (Sprint 3 - 3 semaines)

#### 1. **Correlation Engine** 🟡 Moyenne priorité
```typescript
// Créer bots correlators
const correlationBots = [
  {
    name: "IOC Co-occurrence",
    type: "correlator",
    logic: correlatByIOCCooccurrence
  },
  {
    name: "Temporal Correlation",
    type: "correlator",
    logic: correlateByTime
  },
  {
    name: "Geographic Clustering",
    type: "correlator",
    logic: correlateByGeo
  }
];

// Créer via API
for (const bot of correlationBots) {
  await POST /config/bots
}

// Exécuter périodiquement
setInterval(async () => {
  for (const bot of bots) {
    await POST /config/bots/{bot.id}/execute
  }
}, 3600000); // Every hour
```
**Temps:** 13h

#### 2. **Investigation Workflow** 🟢 Basse priorité
```typescript
// Utiliser report items comme investigations
const createInvestigation = async (data) => {
  await POST /analyze/report-items
  {
    title: data.title,
    report_item_type_id: INVESTIGATION_TYPE_ID,
    attributes: [
      {
        key: "steps",
        value: JSON.stringify(data.steps)
      },
      {
        key: "priority",
        value: data.priority
      },
      {
        key: "status",
        value: data.status
      }
    ]
  }
};

// State machine pour steps
class InvestigationStateMachine {
  async nextStep() { ... }
  async addEvidence() { ... }
  async complete() { ... }
}
```
**Temps:** 13h

**Total Phase 3:** 26h

---

## 📊 Récapitulatif Final

### **Endpoints Taranis Utilisables**

| Catégorie | Endpoints | Status |
|-----------|-----------|--------|
| Auth | 3 | ✅ 100% |
| News Items | 4+ | ✅ 80% |
| Stories | 5+ | ✅ 80% |
| OSINT Sources | 7+ | ✅ 100% |
| Source Groups | 4 | ✅ 100% |
| Bots | 6 | 🟡 60% |
| Report Items | 8+ | 🟡 50% |
| Products | 7 | 🟡 40% |
| Dashboard | 2 | ✅ 100% |
| Tags | 2 | ✅ 100% |
| Workers | 2 | ✅ 100% |
| Config | 20+ | 🟡 50% |
| **TOTAL** | **70+ endpoints** | **🟡 75%** |

### **Timeline Total**

```
Phase 1: 6h     (APIs directes)
Phase 2: 18h    (Extraction & Enrichissement)
Phase 3: 26h    (Corrélation & Workflow)
─────────────────────────────────────────
TOTAL:   50h    (~2 mois à mi-temps)
```

### **Priorités**

1. 🔴 **Haute** (14j): IOC Extraction + API Géo + Bot CRUD
2. 🟡 **Moyenne** (14j): Campaign Tracker + Correlation Engine
3. 🟢 **Basse** (14j): Investigation Workflow + Advanced Analytics

---

## 📚 Ressources

### **Documentation**
- [Taranis Swagger](http://localhost:3000/frontend/doc/swagger.json)
- [Taranis GitHub](https://github.com/SK-CERT/Taranis-NG)

### **APIs Externes**
- [MaxMind GeoIP2](https://www.maxmind.com/en/geoip2-services-and-databases)
- [VirusTotal](https://developers.virustotal.com/)
- [AbuseIPDB](https://www.abuseipdb.com/api)

### **Outils**
- React Query (data fetching)
- Axios (HTTP client)
- Zod (validation)

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-10-04  
**Auteur:** AI Assistant

