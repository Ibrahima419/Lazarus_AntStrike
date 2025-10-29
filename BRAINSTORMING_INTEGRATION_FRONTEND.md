# 🎨 BRAINSTORMING : INTÉGRATION SERVICE COLLECTE DANS LE FRONTEND

**Date** : 21 Octobre 2025  
**Objectif** : Intégrer le Service 1 (Collecte & Agrégation) dans le frontend React existant

---

## 📊 ANALYSE DU FRONTEND EXISTANT

### **Architecture Actuelle**

```
Frontend React + TypeScript
├── Pages
│   ├── Login/Register (Auth)
│   ├── Reports
│   └── App (Dashboard principal)
├── Components
│   ├── CTI Dashboard Widgets (Taranis)
│   │   ├── LatestStoriesWidget
│   │   ├── TaranisStatsOverviewWidget
│   │   ├── NewsItemsTimelineWidget
│   │   └── IOCAnalysisWidget
│   └── SOC Components
│       ├── InvestigationPanel
│       ├── PlaybookPanel
│       └── ThreatCorrelationPanel
├── Services API
│   ├── threat.service.ts
│   ├── alert.service.ts
│   ├── case.service.ts
│   └── taranis-api-service.ts
├── Hooks (React Query)
│   ├── use-threats.ts
│   ├── use-alerts.ts
│   └── use-ioc.ts
└── State Management
    └── auth.store.ts (Zustand)
```

### **Pattern Actuel**

1. **Service API** (axios) → Appels backend
2. **Hook React Query** → Cache + refetch auto
3. **Component** → Affichage UI

Exemple :
```typescript
// 1. Service
threat.service.ts → apiClient.get('/threats')

// 2. Hook
use-threats.ts → useQuery(['threats'])

// 3. Component
ThreatCard.tsx → const { data } = useThreats()
```

---

## 🎯 STRATÉGIE D'INTÉGRATION SERVICE 1

### **Approche : Modulaire et Progressive**

Créer un **nouveau module "Collection"** qui s'intègre dans l'architecture existante.

---

## 📦 MODULES À CRÉER

### **1. SERVICES API** (Nouveaux fichiers)

```typescript
// src/services/api/collection.service.ts
export const collectionService = {
  triggerCollection(sources?: string[]) → POST /collection/trigger
  getQueueStatus() → GET /collection/queue/status
  getStats() → GET /collection/stats
  getHistory() → GET /collection/history
  getHealth() → GET /collection/health
}

// src/services/api/stix.service.ts
export const stixService = {
  importBundle(bundle) → POST /stix/import
  exportBundle() → GET /stix/export
  validateBundle(bundle) → POST /stix/validate
  parseBundle(bundle) → POST /stix/parse
}

// src/services/api/taxii.service.ts
export const taxiiService = {
  getDiscovery() → GET /taxii/
  getCollections() → GET /taxii/collections
  getCollection(id) → GET /taxii/collections/:id
  getObjects(collectionId, filters) → GET /taxii/collections/:id/objects
  addObjects(collectionId, objects) → POST /taxii/collections/:id/objects
  getStats() → GET /taxii/stats
}

// src/services/api/misp.service.ts
export const mispService = {
  configure(config) → POST /misp/configure
  testConnection(config) → POST /misp/test
  getEvents() → GET /misp/events
  syncIOCs(eventIds) → POST /misp/sync
  getStats() → GET /misp/stats
}

// src/services/api/cve.service.ts
export const cveService = {
  searchCVEs(query, severity) → GET /cve/search
  getCVE(cveId) → GET /cve/:cveId
  enrichCVE(cveId) → POST /cve/enrich
  bulkEnrich(cveIds[]) → POST /cve/bulk-enrich
  importRecent() → POST /cve/import-recent
  getStats() → GET /cve/stats
  listCVEs(filters) → GET /cve/
}

// src/services/api/darkweb.service.ts
export const darkwebService = {
  getMentions() → GET /darkweb/mentions
  configure(config) → POST /darkweb/configure
  monitorPastebin(keywords) → POST /darkweb/monitor/pastebin
  scan(query) → POST /darkweb/scan
  getStats() → GET /darkweb/stats
}

// src/services/api/honeypot.service.ts
export const honeypotService = {
  getSupportedTypes() → GET /honeypots/supported
  configure(honeypots) → POST /honeypots/configure
  importLogs() → POST /honeypots/import
  getStats() → GET /honeypots/stats
}
```

---

### **2. HOOKS REACT QUERY** (Nouveaux fichiers)

```typescript
// src/hooks/use-collection.ts
export const useQueueStatus = () → useQuery(['collection', 'queue'])
export const useCollectionStats = () → useQuery(['collection', 'stats'])
export const useCollectionHistory = () → useQuery(['collection', 'history'])
export const useCollectionHealth = () → useQuery(['collection', 'health'])
export const useTriggerCollection = () → useMutation(collectionService.trigger)

// src/hooks/use-stix.ts
export const useSTIXBundles = () → useQuery(['stix', 'bundles'])
export const useImportSTIX = () → useMutation(stixService.importBundle)
export const useExportSTIX = () → useQuery(['stix', 'export'])

// src/hooks/use-taxii.ts
export const useTAXIICollections = () → useQuery(['taxii', 'collections'])
export const useTAXIIObjects = (collectionId) → useQuery(['taxii', 'objects', id])
export const useTAXIIStats = () → useQuery(['taxii', 'stats'])

// src/hooks/use-cve.ts
export const useCVEStats = () → useQuery(['cve', 'stats'])
export const useCVESearch = (query) → useQuery(['cve', 'search', query])
export const useEnrichCVE = () → useMutation(cveService.enrichCVE)
export const useImportRecentCVEs = () → useMutation(cveService.importRecent)

// src/hooks/use-darkweb.ts
export const useDarkWebMentions = () → useQuery(['darkweb', 'mentions'])
export const useDarkWebStats = () → useQuery(['darkweb', 'stats'])
export const useDarkWebScan = () → useMutation(darkwebService.scan)

// src/hooks/use-honeypots.ts
export const useHoneypotStats = () → useQuery(['honeypots', 'stats'])
export const useHoneypotTypes = () → useQuery(['honeypots', 'supported'])
export const useConfigureHoneypots = () → useMutation(honeypotService.configure)
```

---

### **3. COMPOSANTS UI** (Widgets Dashboard)

#### **Dashboard Principal : "Collection Hub"**

```typescript
// components/cti/collection/CollectionDashboard.tsx
<CollectionDashboard>
  <CollectionOverview />    // Stats générales
  <SourceHealthCards />     // Status des 10 sources
  <QueueMonitor />          // BullMQ Queue temps réel
  <RecentCollections />     // Historique collectes
</CollectionDashboard>
```

#### **Widgets Spécialisés**

```typescript
// components/cti/collection/widgets/

1. CollectionOverviewWidget.tsx
   - Total items collectés (24h, 7j, 30j)
   - Graphique en temps réel
   - Taux de succès par source
   - Prochaine collecte automatique

2. SourceHealthWidget.tsx
   - 10 cartes (une par source)
   - Status: ✅ Healthy / ⚠️ Degraded / ❌ Down
   - Dernière collecte
   - Bouton "Test Connection"

3. QueueMonitorWidget.tsx
   - Jobs en attente
   - Jobs en cours
   - Jobs complétés
   - Jobs échoués
   - Progression en temps réel

4. STIXManagerWidget.tsx
   - Import bundle (drag & drop)
   - Export bundle (bouton)
   - Liste des bundles importés
   - Indicateurs STIX (tableau)

5. TAXIIServerWidget.tsx
   - 4 collections TAXII
   - Objets par collection
   - Add objects (formulaire)
   - Discovery info

6. MISPSyncWidget.tsx
   - Config MISP (formulaire)
   - Test connexion (bouton)
   - Sync events (bouton)
   - Stats sync (dernière sync, total)

7. CVEIntelligenceWidget.tsx
   - Search CVE (barre de recherche)
   - Stats CVE (51 CVEs, par sévérité)
   - Import recent (bouton)
   - Liste CVEs avec enrichissement

8. DarkWebMonitorWidget.tsx
   - Mentions récentes
   - Configure keywords
   - Scan (formulaire)
   - Stats (total mentions)

9. HoneypotsWidget.tsx
   - Types supportés (Cowrie, Dionaea, T-Pot)
   - Configure (formulaire)
   - Import logs (bouton)
   - Stats attaques

10. OSINTFeedsWidget.tsx
    - Liste des feeds
    - Add feed (formulaire)
    - Stats (items collectés)
```

---

## 🎨 PROPOSITION DE PAGE "COLLECTION HUB"

### **Layout**

```
┌─────────────────────────────────────────────────────────┐
│ 🛡️ AntStrike CTI - Collection Hub                      │
│ ───────────────────────────────────────────────────────│
│ [Trigger Collection] [Refresh] [Settings]              │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ 📊 OVERVIEW                                             │
│ ┌─────────┬─────────┬─────────┬─────────┐              │
│ │ 640     │ 51      │ 4       │ 2       │              │
│ │ Stories │ CVEs    │ STIX    │ Dark    │              │
│ └─────────┴─────────┴─────────┴─────────┘              │
│                                                          │
│ [Graphique ligne : Collectes 7 derniers jours]         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ 🌐 SOURCES HEALTH (10 sources)                          │
│ ┌──────────┬──────────┬──────────┬──────────┐          │
│ │ Taranis  │ MISP     │ STIX     │ TAXII    │          │
│ │ ✅ OK    │ ❌ Down  │ ✅ OK    │ ✅ OK    │          │
│ │ 2.6s ago │ Not cfg  │ 4 bundles│ 7 colls  │          │
│ └──────────┴──────────┴──────────┴──────────┘          │
│ ┌──────────┬──────────┬──────────┬──────────┐          │
│ │ CVE      │ OSINT    │ DarkWeb  │ Honeypot │          │
│ │ ✅ OK    │ ✅ OK    │ ✅ OK    │ ✅ OK    │          │
│ │ 51 CVEs  │ 0 feeds  │ 2 ment.  │ 4 types  │          │
│ └──────────┴──────────┴──────────┴──────────┘          │
│ ┌──────────┬──────────┐                                │
│ │ ThreatF  │ Queue    │                                │
│ │ ✅ OK    │ ✅ OK    │                                │
│ │ 2 feeds  │ 0 pending│                                │
│ └──────────┴──────────┘                                │
└─────────────────────────────────────────────────────────┘
┌──────────────────┬──────────────────────────────────────┐
│ 📋 QUEUE MONITOR │ 📜 HISTORY (Last 10 collections)    │
│                  │                                      │
│ Waiting:   0     │ 1. Taranis - 16:00:00 - 0 items     │
│ Active:    0     │ 2. Full    - 15:57:30 - 0 items     │
│ Completed: 0     │ 3. OSINT   - 15:57:31 - 0 items     │
│ Failed:    2     │ 4. Taranis - 15:11:17 - 0 items     │
│                  │ 5. ...                              │
│ [View Details]   │ [Load More]                         │
└──────────────────┴──────────────────────────────────────┘
```

---

## 🚀 PLAN D'IMPLÉMENTATION

### **PHASE 1 : Services API (1-2h)**

Créer 7 nouveaux fichiers de services :

1. `src/services/api/collection.service.ts`
2. `src/services/api/stix.service.ts`
3. `src/services/api/taxii.service.ts`
4. `src/services/api/misp.service.ts`
5. `src/services/api/cve.service.ts`
6. `src/services/api/darkweb.service.ts`
7. `src/services/api/honeypot.service.ts`

**Pattern à suivre** : Comme `threat.service.ts`

---

### **PHASE 2 : Hooks React Query (1-2h)**

Créer 7 nouveaux hooks :

1. `src/hooks/use-collection.ts`
2. `src/hooks/use-stix.ts`
3. `src/hooks/use-taxii.ts`
4. `src/hooks/use-misp.ts`
5. `src/hooks/use-cve.ts`
6. `src/hooks/use-darkweb.ts`
7. `src/hooks/use-honeypots.ts`

**Pattern à suivre** : Comme `use-threats.ts`

---

### **PHASE 3 : Composants Widgets (3-4h)**

Créer dans `src/components/cti/collection/widgets/` :

1. **CollectionOverviewWidget.tsx**
   - Stats générales
   - Graphique collectes
   - Bouton "Trigger Collection"

2. **SourceHealthCardsWidget.tsx**
   - 10 cartes sources
   - Status + last collection
   - Test buttons

3. **QueueMonitorWidget.tsx**
   - Stats BullMQ en temps réel
   - Progression bar
   - Logs récents

4. **STIXManagerWidget.tsx**
   - Import/Export STIX
   - Liste bundles
   - Visualiseur indicateurs

5. **TAXIIServerWidget.tsx**
   - Collections TAXII
   - Objects browser
   - Add objects form

6. **CVEDashboardWidget.tsx**
   - Search CVE
   - Stats (51 CVEs, distribution)
   - Import recent button
   - Liste enrichis

7. **DarkWebMonitorWidget.tsx**
   - Mentions récentes
   - Configure monitors
   - Scan form

8. **HoneypotsWidget.tsx**
   - Types supportés
   - Configure form
   - Stats attaques

---

### **PHASE 4 : Page Collection Hub (1-2h)**

Créer `src/pages/CollectionHub.tsx` :

```typescript
import { CollectionOverviewWidget } from '../components/cti/collection/widgets/CollectionOverviewWidget';
import { SourceHealthCardsWidget } from '../components/cti/collection/widgets/SourceHealthCardsWidget';
import { QueueMonitorWidget } from '../components/cti/collection/widgets/QueueMonitorWidget';
import { useCollectionStats, useQueueStatus, useCollectionHealth } from '../hooks/use-collection';

export function CollectionHub() {
  const { data: stats } = useCollectionStats();
  const { data: queueStatus } = useQueueStatus();
  const { data: health } = useCollectionHealth();
  
  return (
    <div className="p-6 space-y-6">
      <CollectionOverviewWidget stats={stats} queue={queueStatus} />
      <SourceHealthCardsWidget health={health} />
      <div className="grid grid-cols-2 gap-6">
        <QueueMonitorWidget status={queueStatus} />
        <CollectionHistoryWidget />
      </div>
    </div>
  );
}
```

---

### **PHASE 5 : Navigation (30min)**

Ajouter dans la **Sidebar** :

```typescript
// SidebarV2.tsx
const menuItems = [
  { id: 'soc-analyst', label: 'SOC Dashboard', icon: Shield },
  { id: 'collection', label: 'Collection Hub', icon: Database }, // NOUVEAU !
  { id: 'threat-intel', label: 'Threat Intel', icon: Target },
  // ...
];
```

Ajouter route dans **AppRoutes.tsx** :

```typescript
import { CollectionHub } from './pages/CollectionHub';

// Dans App.tsx renderContent()
if (activeView === 'collection') {
  return <CollectionHub />;
}
```

---

## 🎨 DESIGN RECOMMENDATIONS

### **Couleurs par Source**

```typescript
const sourceColors = {
  taranis: 'bg-blue-600',
  misp: 'bg-red-600',
  stix: 'bg-purple-600',
  taxii: 'bg-indigo-600',
  cve: 'bg-orange-600',
  osint: 'bg-green-600',
  darkweb: 'bg-gray-800',
  honeypots: 'bg-yellow-600',
  threatFeeds: 'bg-cyan-600',
  queue: 'bg-pink-600'
};
```

### **Status Icons**

```typescript
const statusIcons = {
  healthy: '✅',
  degraded: '⚠️',
  unhealthy: '❌',
  unknown: '❓'
};
```

---

## 📊 FONCTIONNALITÉS CLÉS À IMPLÉMENTER

### **1. Trigger Collection**

```typescript
<Button onClick={() => triggerCollection.mutate(['taranis'])}>
  🚀 Déclencher Collecte Taranis
</Button>

<Button onClick={() => triggerCollection.mutate()}>
  🌐 Collecte Complète (Toutes Sources)
</Button>
```

### **2. Real-Time Queue Monitor**

```typescript
// Auto-refresh toutes les 5 secondes
const { data: queue } = useQueueStatus({
  refetchInterval: 5000
});

<QueueProgressBar
  waiting={queue.waiting}
  active={queue.active}
  completed={queue.completed}
  failed={queue.failed}
/>
```

### **3. STIX Import/Export**

```typescript
<STIXDropzone
  onDrop={(file) => importSTIX.mutate(file)}
  accept=".json"
/>

<Button onClick={() => exportSTIX()}>
  📦 Export STIX Bundle
</Button>
```

### **4. CVE Auto-Enrichment**

```typescript
<Button onClick={() => importRecentCVEs.mutate()}>
  🔄 Importer 50 CVEs récents
</Button>

// Afficher progression
{importRecentCVEs.isLoading && (
  <Progress value={progress} max={50} />
)}
```

---

## 🔄 WORKFLOW UTILISATEUR

### **Scénario 1 : Analyste SOC démarre sa journée**

1. **Ouvre "Collection Hub"**
2. **Voit les stats** :
   - 640 stories Taranis
   - 51 CVEs enrichis
   - 4 bundles STIX
   - 2 mentions Dark Web
3. **Vérifie la santé** :
   - Taranis ✅
   - MISP ❌ (non configuré)
   - Autres ✅
4. **Déclenche collecte manuelle** :
   - Clique "Trigger Taranis"
   - Voit la progression dans Queue Monitor
   - Reçoit notification "0 nouvelles menaces"
5. **Consulte les CVEs** :
   - Clique "Import Recent"
   - 50 CVEs importés en 2min
   - Voit distribution : 5 CRITICAL, 25 HIGH

---

### **Scénario 2 : Import STIX depuis MISP**

1. **Ouvre "STIX Manager"**
2. **Drag & drop** fichier `misp-bundle.json`
3. **Système valide** automatiquement
4. **Parse** et extrait :
   - 25 indicateurs IP
   - 10 domaines
   - 5 hash MD5
5. **Import** dans la DB
6. **Notification** : "25 IOCs importés avec succès"

---

### **Scénario 3 : Configuration MISP**

1. **Ouvre "MISP Config"**
2. **Remplit formulaire** :
   - URL : https://misp.company.com
   - API Key : ***
   - Auto-sync : ON
3. **Test connexion** → ✅ Success
4. **Sauvegarde**
5. **Trigger sync** → 100 events MISP importés

---

## 🛠️ TECHNOLOGIES & LIBRAIRIES

### **Nouveautés à ajouter**

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",    // Déjà présent
    "axios": "^1.6.0",                     // Déjà présent
    "recharts": "^2.10.0",                 // Graphiques
    "react-dropzone": "^14.2.0",           // Drag & drop STIX
    "react-json-view": "^1.21.3",          // Visualiser JSON STIX
    "date-fns": "^3.0.0",                  // Dates
    "lucide-react": "^0.300.0"             // Icons (déjà présent)
  }
}
```

---

## 📋 CHECKLIST D'INTÉGRATION

### **Backend → Frontend Mapping**

| Backend Endpoint | Frontend Service | Hook | Widget |
|------------------|------------------|------|--------|
| `POST /collection/trigger` | `collectionService.trigger()` | `useTriggerCollection()` | CollectionOverview |
| `GET /collection/queue/status` | `collectionService.getQueueStatus()` | `useQueueStatus()` | QueueMonitor |
| `GET /collection/stats` | `collectionService.getStats()` | `useCollectionStats()` | CollectionOverview |
| `GET /collection/health` | `collectionService.getHealth()` | `useCollectionHealth()` | SourceHealthCards |
| `POST /stix/import` | `stixService.importBundle()` | `useImportSTIX()` | STIXManager |
| `GET /stix/export` | `stixService.exportBundle()` | `useExportSTIX()` | STIXManager |
| `GET /taxii/collections` | `taxiiService.getCollections()` | `useTAXIICollections()` | TAXIIServer |
| `GET /cve/stats` | `cveService.getStats()` | `useCVEStats()` | CVEIntelligence |
| `POST /cve/import-recent` | `cveService.importRecent()` | `useImportRecentCVEs()` | CVEIntelligence |
| `GET /darkweb/mentions` | `darkwebService.getMentions()` | `useDarkWebMentions()` | DarkWebMonitor |
| `GET /honeypots/stats` | `honeypotService.getStats()` | `useHoneypotStats()` | Honeypots |

---

## 🎯 ÉTAPES SUIVANTES

### **Option A : Développement Complet** (2-3 jours)
1. ✅ Créer les 7 services API
2. ✅ Créer les 7 hooks
3. ✅ Créer les 10 widgets
4. ✅ Créer la page Collection Hub
5. ✅ Intégrer dans la navigation

### **Option B : MVP Rapide** (4-6h)
1. ✅ Créer 3 services essentiels (collection, cve, stix)
2. ✅ Créer 3 hooks
3. ✅ Créer 3 widgets basiques
4. ✅ Page Collection Hub simplifiée
5. ✅ Navigation

### **Option C : Widget par Widget** (itératif)
1. ✅ Semaine 1 : Collection + Queue Monitor
2. ✅ Semaine 2 : STIX + TAXII
3. ✅ Semaine 3 : CVE + Dark Web
4. ✅ Semaine 4 : MISP + Honeypots + Polish

---

## 💡 RECOMMANDATION

**Option B (MVP Rapide)** pour avoir quelque chose de fonctionnel rapidement, puis itérer.

**Commencer par** :
1. `collection.service.ts` + `use-collection.ts`
2. `CollectionOverviewWidget.tsx`
3. `SourceHealthCardsWidget.tsx`
4. `QueueMonitorWidget.tsx`
5. Page `CollectionHub.tsx`

Cela permettra de :
- ✅ Déclencher des collectes depuis le frontend
- ✅ Voir le statut en temps réel
- ✅ Monitorer la queue BullMQ
- ✅ Vérifier la santé des sources

---

## 🎨 MOCKUPS VISUELS (à créer)

1. **Collection Hub Overview** - Dashboard principal
2. **STIX Manager** - Import/Export interface
3. **CVE Intelligence** - Search + Stats
4. **Dark Web Monitor** - Mentions + Scan

---

**PRÊT À COMMENCER L'IMPLÉMENTATION ?** 🚀

**Quelle option préférez-vous ?**
- A : Développement complet (2-3 jours)
- B : MVP rapide (4-6h)
- C : Widget par widget (itératif)



