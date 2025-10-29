# 📚 Référence Complète des Endpoints API Taranis

**Source** : Documentation utilisateur fournie le 2025-10-07  
**Base URL** : `http://192.168.226.1:3000`

---

## 🔴 **IOCs (Indicators of Compromise)**

### 1. News Items avec Attributs (Source principale)

```http
GET /api/assess/news-items
```

**Paramètres optimaux pour IOCs** :
```javascript
{
  limit: 500,              // Max: 1000
  range: '7d',             // '7d', '30d', etc.
  cybersecurity: true,     // ✅ IMPORTANT: Filtrer contenu cybersec
  sort: 'published_desc'   // Plus récents en premier
}
```

**Structure Réponse** :
```json
{
  "total_count": 500,
  "items": [
    {
      "id": "news-uuid",
      "title": "string",
      "content": "string",
      "published": "2024-01-01T00:00:00Z",
      "osint_source_id": "source-id",
      "attributes": [
        {"key": "ioc_ip", "value": "192.168.1.100"},
        {"key": "ioc_hash", "value": "5d41402abc4b2a76b9719d911017c592"},
        {"key": "malware_family", "value": "Emotet"}
      ]
    }
  ]
}
```

**Clés d'attributs IOC** :
- `ioc_ip` - Adresse IP
- `ioc_domain` - Nom de domaine
- `ioc_url` - URL complète
- `ioc_hash`, `ioc_md5`, `ioc_sha256` - Hashes
- `ioc_email` - Adresse email
- `malware_family` - Famille de malware
- `threat_level` - Niveau de menace

---

### 2. Stories avec Attributs (IOCs groupés)

```http
GET /api/assess/stories
```

**Paramètres optimaux** :
```javascript
{
  limit: 200,              // Max: 400
  range: '30d',
  cybersecurity: true,
  exclude_attr: false      // Inclure les attributs
}
```

**Structure Réponse** :
```json
{
  "total_count": 200,
  "items": [
    {
      "id": "story-uuid",
      "title": "APT29 Campaign",
      "news_items": [
        {
          "attributes": [
            {"key": "ioc_domain", "value": "malicious.com"}
          ]
        }
      ],
      "attributes": [
        {"key": "campaign_name", "value": "Operation XYZ"},
        {"key": "ioc_list", "value": "192.168.1.1,evil.com,hash123"}
      ],
      "tags": [
        {"name": "APT29", "tag_type": "threat_actor"}
      ]
    }
  ]
}
```

---

### 3. Story Spécifique (Détails complets)

```http
GET /api/assess/story/{story_id}
```

**Utilisation** : Récupérer tous les IOCs d'une campagne identifiée

---

### 4. Word Lists (IOCs en masse)

```http
GET /api/config/word-lists?usage=ioc&with_entries=true
```

**Réponse** :
```json
{
  "items": [
    {
      "id": 1,
      "name": "Malicious IPs",
      "usage": "ioc_blocklist",
      "entries": ["192.168.1.100", "10.0.0.50"]
    }
  ]
}
```

---

## 🎯 **CAMPAGNES (Threat Campaigns)**

### 1. Trending Clusters (Campagnes émergentes)

```http
GET /api/dashboard/trending-clusters?days=30
```

**Format Nouveau (préféré)** :
```json
{
  "items": [
    {
      "tag_type": "campaign",
      "clusters": [
        {
          "tag_name": "Operation CloudHopper",
          "size": 45,
          "stories": [
            {"id": "story-1", "title": "...", "relevance": 85}
          ]
        }
      ]
    },
    {
      "tag_type": "threat_actor",
      "clusters": [
        {"tag_name": "APT29", "size": 67, "stories": []}
      ]
    }
  ]
}
```

**Format Legacy** :
```json
{
  "campaign": [{"tag_name": "Operation CloudHopper", "size": 45}],
  "threat_actor": [{"tag_name": "APT29", "size": 67}]
}
```

---

### 2. Story Clusters (Groupes de campagnes)

```http
GET /api/dashboard/story-clusters?days=30&limit=20
```

**Réponse** :
```json
[
  {
    "id": "story-cluster-1",
    "title": "APT29 Phishing Campaign",
    "size": 156,
    "created": "2024-01-01T00:00:00Z",
    "updated": "2024-01-15T00:00:00Z",
    "relevance": 95,
    "tags": [
      {"name": "APT29", "tag_type": "threat_actor"},
      {"name": "Phishing", "tag_type": "attack_vector"}
    ]
  }
]
```

---

### 3. Cluster par Type (Détails campagne)

```http
GET /api/dashboard/cluster/{tag_type}
```

**Tag Types pour campagnes** :
- `campaign` - Campagnes identifiées
- `threat_actor` - Acteurs de menace
- `malware_family` - Familles de malware
- `attack_vector` - Vecteurs d'attaque
- `industry` - Industries ciblées
- `country` - Pays ciblés

**Paramètres** :
```javascript
{
  per_page: 50,           // Max: 100
  page: 1,
  sort_by: 'size_desc',   // Trier par taille décroissante
  search: 'APT29'         // Filtrer par nom
}
```

---

### 4. Tags (Identifier les campagnes)

```http
GET /api/assess/tags?min_size=5
```

**Paramètres** :
```javascript
{
  search: 'APT',
  limit: 200,             // Max: 200
  min_size: 5             // Taille minimale du cluster
}
```

**Réponse** :
```json
{
  "items": [
    {"name": "APT29", "tag_type": "threat_actor", "size": 156},
    {"name": "APT Campaign 2024", "tag_type": "campaign", "size": 89}
  ]
}
```

---

### 5. Tag List Simple

```http
GET /api/assess/taglist
```

**Réponse** : Simple liste de noms de tags

---

## 📊 **STRATÉGIES D'EXTRACTION OPTIMALES**

### **Stratégie IOCs (Optimisée)**

```javascript
// 1. Récupérer news items cybersécurité récents
const newsItems = await taranisService.getNewsItems({
  limit: 500,
  range: '7d',
  cybersecurity: true  // ✅ IMPORTANT
});

// 2. Extraire IOCs des attributs
const iocs = [];
newsItems.items.forEach(item => {
  // Priorité 1: Attributs natifs
  item.attributes?.forEach(attr => {
    if (attr.key.startsWith('ioc_')) {
      iocs.push({
        type: attr.key.replace('ioc_', ''),
        value: attr.value,
        source: item.id,
        sourceTitle: item.title,
        date: item.published,
        confidence: 0.9  // Haute confiance car attribut natif
      });
    }
  });
  
  // Priorité 2: Regex sur contenu si pas d'attributs
  if (!item.attributes || item.attributes.length === 0) {
    const extracted = extractIOCsWithRegex(item.content + ' ' + item.title);
    iocs.push(...extracted.map(ioc => ({
      ...ioc,
      source: item.id,
      date: item.published,
      confidence: 0.6  // Confiance moyenne pour regex
    })));
  }
});

// 3. Dédupliquer
const uniqueIOCs = deduplicateByValue(iocs);

// 4. Enrichir (optionnel)
for (const ioc of uniqueIOCs) {
  ioc.enrichment = await enrichIOC(ioc);
}
```

---

### **Stratégie Campagnes (Optimisée)**

```javascript
// 1. Récupérer trending clusters (30 jours)
const trending = await taranisService.getTrendingClusters(30);

// 2. Récupérer story clusters
const storyClusters = await taranisService.getStoryClusters(30, 20);

// 3. Extraire campagnes depuis trending clusters
const campaigns = [];
trending.items?.forEach(tagTypeGroup => {
  if (['campaign', 'threat_actor', 'malware_family'].includes(tagTypeGroup.tag_type)) {
    tagTypeGroup.clusters.forEach(cluster => {
      campaigns.push({
        id: `${tagTypeGroup.tag_type}-${cluster.tag_name}`,
        name: cluster.tag_name,
        type: tagTypeGroup.tag_type,
        size: cluster.size,
        stories: cluster.stories || [],
        status: cluster.size > 50 ? 'active' : 'dormant',
        severity: calculateSeverity(cluster.size, cluster.stories),
        startDate: estimateStartDate(cluster.stories),
        lastActivity: new Date()
      });
    });
  }
});

// 4. Enrichir avec story clusters
storyClusters.forEach(storyCluster => {
  const relatedCampaign = campaigns.find(c => 
    storyCluster.tags?.some(tag => tag.name === c.name)
  );
  
  if (relatedCampaign) {
    relatedCampaign.description = storyCluster.title;
    relatedCampaign.relevance = storyCluster.relevance;
    relatedCampaign.storyCount = storyCluster.size;
  } else {
    // Créer nouvelle campagne depuis story cluster
    campaigns.push(mapStoryClusterToCampaign(storyCluster));
  }
});

// 5. Enrichir avec détails par type
for (const campaign of campaigns) {
  const details = await taranisService.getClusterByType(
    campaign.type,
    { search: campaign.name, per_page: 10 }
  );
  
  campaign.details = details.items[0];
  campaign.relatedStories = details.items[0]?.stories || [];
}

// 6. Extraire IOCs des campagnes
for (const campaign of campaigns) {
  campaign.iocs = [];
  for (const story of campaign.relatedStories) {
    const storyDetail = await taranisService.getStory(story.id);
    campaign.iocs.push(...extractIOCsFromStory(storyDetail));
  }
}
```

---

## 🔧 **OPTIMISATIONS À APPLIQUER**

### 1. **IOCs Manager**
```javascript
// ✅ AJOUTER le paramètre cybersecurity
const newsItems = await this.taranisService.getNewsItems({
  limit: 500,
  range: '7d',
  cybersecurity: true  // ← IMPORTANT
});
```

### 2. **Campaigns Tracker**
```javascript
// ✅ Utiliser le format nouveau des trending clusters
const trending = await this.taranisService.getTrendingClusters(30);

// ✅ Parcourir items.clusters au lieu de l'ancien format
trending.items?.forEach(tagTypeGroup => {
  tagTypeGroup.clusters.forEach(cluster => {
    // Process cluster
  });
});
```

### 3. **Nouvelles Méthodes à Ajouter**

```typescript
// Dans taranis-unified-service.ts

async getClusterByType(tagType: string, params?: {
  per_page?: number;
  page?: number;
  sort_by?: string;
  search?: string;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params?.per_page) queryParams.append('per_page', String(params.per_page));
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.search) queryParams.append('search', params.search);
  
  return await this.makeRequest(
    `/dashboard/cluster/${tagType}?${queryParams.toString()}`
  );
}

async getTags(params?: {
  search?: string;
  limit?: number;
  min_size?: number;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.min_size) queryParams.append('min_size', String(params.min_size));
  
  return await this.makeRequest(
    `/assess/tags?${queryParams.toString()}`
  );
}

async getWordLists(params?: {
  usage?: string;
  with_entries?: boolean;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params?.usage) queryParams.append('usage', params.usage);
  if (params?.with_entries) queryParams.append('with_entries', 'true');
  
  return await this.makeRequest(
    `/config/word-lists?${queryParams.toString()}`
  );
}
```

---

## 📝 **URLs READY-TO-USE**

```bash
# IOCs - News Items (7j, cybersec uniquement)
GET http://192.168.226.1:3000/api/assess/news-items?limit=500&range=7d&cybersecurity=true

# IOCs - Stories (30j, cybersec)
GET http://192.168.226.1:3000/api/assess/stories?limit=200&cybersecurity=true&range=30d

# Campagnes - Trending Clusters (30j)
GET http://192.168.226.1:3000/api/dashboard/trending-clusters?days=30

# Campagnes - Story Clusters (30j, 20 max)
GET http://192.168.226.1:3000/api/dashboard/story-clusters?days=30&limit=20

# Détails Campagne par type
GET http://192.168.226.1:3000/api/dashboard/cluster/campaign?per_page=50&sort_by=size_desc

# Tags pour campagnes (min 5 stories)
GET http://192.168.226.1:3000/api/assess/tags?min_size=5

# Word Lists IOCs
GET http://192.168.226.1:3000/api/config/word-lists?usage=ioc&with_entries=true
```

---

## 🔐 **Authentication**

Tous les endpoints nécessitent:
```http
Authorization: Bearer {jwt_token}
```

Le token est géré automatiquement par `TaranisService.makeRequest()`

---

**Dernière mise à jour** : 2025-10-07  
**Source** : Documentation utilisateur validée

