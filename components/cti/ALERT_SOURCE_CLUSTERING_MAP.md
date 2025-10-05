# 🗺️ Alert Source Clustering Map - Guide Complet

## 🎯 Vue d'ensemble

La **Alert Source Clustering Map** est une visualisation interactive épique qui combine le meilleur de **D3.js**, **Leaflet** et **Mapbox** pour offrir une expérience analyste SOC exceptionnelle.

## ✨ Fonctionnalités

### **4 Modes de Visualisation**

#### 1. 🌌 **Galaxy View** (D3.js Force Simulation)
- **Simulation gravitationnelle** des sources OSINT
- **Clustering automatique** par type et groupe
- **Bulles interactives** avec taille basée sur alertes
- **Trust score arc** autour de chaque source
- **Pulsation** pour sources actives
- **Drag & drop** pour exploration
- **Zoom/Pan** fluide

**Features:**
- Halos de cluster semi-transparents
- Liens entre sources du même cluster
- Gradients radiaux pour effet 3D
- Badges d'alertes en temps réel
- Animation de pulsation pour sources actives

#### 2. 🌍 **Geographic View** (Leaflet + Mapbox)
- **Carte mondiale** avec markers personnalisés
- **Clustering spatial** automatique
- **2 styles de carte** : Dark / Satellite
- **Markers SVG animés** avec badges d'alertes
- **Cercles de cluster** semi-transparents
- **Stats par région** en overlay

**Features:**
- Custom markers avec gradients
- Tooltips contextuels
- Popup détaillés sur click
- Fly-to animation sur sélection
- Stats géographiques temps réel

#### 3. 🕸️ **Network Graph View** (D3.js Tree Layout)
- **Hiérarchie visuelle** : Root → Clusters → Sources
- **Arbre horizontal** avec liens stylisés
- **Couleurs par type** de cluster
- **Navigation intuitive**

**Features:**
- Layout tree automatique
- Séparation intelligente des nœuds
- Liens courbes (linkHorizontal)
- Click pour détails

#### 4. 🔥 **Heatmap View** (Temporal Activity)
- **Activité sur 24h** heure par heure
- **Top 15 sources** par volume
- **Échelle de couleur** d'intensité
- **Hover pour détails** par cellule
- **Stats agrégées** en footer

**Features:**
- 5 niveaux d'intensité colorés
- Animation hover avec scale
- Indicateur de source active
- Total par source

---

## 📊 Performance Panel

Panel latéral intelligent avec :
- **Source sélectionnée** : Détails complets + actions rapides
- **Top Performers** : 5 meilleures sources par trust score
- **Needs Attention** : 3 sources sous-performantes
- **Recommendations** : Suggestions automatiques

---

## 🚀 Installation

### Dépendances requises :

```bash
npm install d3 @types/d3 leaflet @types/leaflet
```

### Import dans votre composant :

```tsx
import { AlertSourceClusteringMap } from './components/cti/AlertSourceClusteringMap';

function MyDashboard() {
  return (
    <div>
      <AlertSourceClusteringMap />
    </div>
  );
}
```

---

## 💡 Utilisation

### **Intégration Simple**

La map se connecte automatiquement à **Taranis AI** via le service unifié :

```tsx
// Déjà configuré dans AlertSourceClusteringMap.tsx
const service = getTaranisService();

// Charge automatiquement :
// - /assess/osint-sources-list
// - /assess/osint-source-group-list
// - /assess/news-items
```

### **Auto-Refresh**

Par défaut, la map se rafraîchit toutes les **30 secondes** :

```tsx
const [autoRefresh, setAutoRefresh] = useState(true);

// Toggle auto-refresh
<Button onClick={() => setAutoRefresh(!autoRefresh)}>
  {autoRefresh ? 'Disable' : 'Enable'}
</Button>
```

### **Sélection de Source**

Callback automatique lors du click :

```tsx
const [selectedSource, setSelectedSource] = useState<SourceNode | null>(null);

// Dans Galaxy View, Geographic View, etc.
<GalaxyView 
  sources={sources}
  clusters={clusters}
  onSourceSelect={setSelectedSource}
  selectedSource={selectedSource}
/>
```

---

## 🎨 Personnalisation

### **Couleurs par Type**

```tsx
const getClusterColor = (type: string): string => {
  const colors: Record<string, string> = {
    'threat-intel': '#ef4444',  // Rouge
    'social': '#06b6d4',         // Cyan
    'dark-web': '#8b5cf6',       // Violet
    'news': '#f59e0b',           // Orange
    'technical': '#10b981'       // Vert
  };
  return colors[type] || '#3b82f6';
};
```

### **Trust Score Calculation**

```tsx
const calculateTrustScore = (source: any, newsItems: any[]): number => {
  const volumeScore = Math.min(sourceItems.length / 10, 30);
  const recentnessScore = source.enabled ? 20 : 0;
  const typeScore = getTypeScore(source.type);
  const baseScore = 20;
  
  return Math.round(volumeScore + recentnessScore + typeScore + baseScore);
};
```

### **Coordonnées Géographiques**

Pour utiliser de vraies coordonnées :

```tsx
// Dans votre backend Taranis, ajouter un champ 'coordinates'
// Ou utiliser un service de géolocalisation :

const assignCoordinates = async (source: any): Promise<[number, number]> => {
  // Option 1: IP Geolocation API
  const response = await fetch(`https://ipapi.co/${source.url}/json/`);
  const data = await response.json();
  return [data.latitude, data.longitude];
  
  // Option 2: Données statiques par domaine
  // Option 3: GeoIP database local
};
```

---

## 🔧 Configuration Avancée

### **Modifier la Force Simulation (Galaxy View)**

```tsx
const simulation = d3.forceSimulation(sources as any)
  .force('charge', d3.forceManyBody()
    .strength(-300)           // ⬅️ Répulsion entre nœuds
    .distanceMax(400))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide()
    .radius((d: any) => getNodeRadius(d) + 5))  // ⬅️ Collision
  .force('cluster', forceCluster(clusters));    // ⬅️ Attraction vers cluster
```

### **Modifier le Style Leaflet (Geographic View)**

```tsx
// Changer le tile provider
const tileUrl = mapStyle === 'dark' 
  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  // Autres options:
  // Mapbox: 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
  // OpenStreetMap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  // Stamen: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png'
  : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
```

### **Ajouter des Actions Personnalisées**

```tsx
<SourcePerformancePanel 
  sources={sources}
  selectedSource={selectedSource}
  onSourceSelect={setSelectedSource}
/>

// Dans SourcePerformancePanel.tsx, ajouter :
<Button size="sm" onClick={() => handleCustomAction(selectedSource)}>
  <CustomIcon className="w-4 h-4 mr-1" />
  Ma Action Custom
</Button>
```

---

## 📈 Métriques & KPIs

### **Stats Calculées Automatiquement**

```tsx
interface MapStats {
  totalSources: number;        // Nombre total de sources
  activeSources: number;        // Sources actives (status === 'active')
  totalAlerts: number;          // Somme de tous les alertCount
  avgTrustScore: number;        // Moyenne des trustScore
  clustersDetected: number;     // Nombre de clusters
  coverageScore: number;        // Score de couverture (0-100)
}
```

### **Coverage Score Formula**

```tsx
const calculateCoverageScore = (sources: SourceNode[]): number => {
  const activeCount = sources.filter(s => s.status === 'active').length;
  const uniqueTypes = new Set(sources.map(s => s.type)).size;
  
  const volumeScore = Math.min((activeCount / 50) * 50, 50);
  const diversityScore = Math.min((uniqueTypes / 6) * 50, 50);
  
  return Math.round(volumeScore + diversityScore);
};
```

---

## 🎯 Use Cases

### **1. Morning Triage**

```tsx
// Voir immédiatement les sources les plus actives
Galaxy View → Observer les clusters pulsants
Heatmap View → Identifier pics d'activité nocturne
Performance Panel → Review top performers
```

### **2. Investigation Géographique**

```tsx
// Tracer l'origine géographique des menaces
Geographic View → Visualiser distribution mondiale
Stats by Region → Comparer volumes par zone
Click marker → Détails source + actions
```

### **3. Source Hygiene**

```tsx
// Maintenance régulière des sources
Performance Panel → "Needs Attention"
Trust Score < 40 → Investiguer ou désactiver
Coverage Score → Identifier gaps
Recommendations → Actions suggérées
```

### **4. Presentation / Reporting**

```tsx
// Dashboard visuel pour stakeholders
Galaxy View → Impression visuelle forte
Geographic View → Contexte géographique
Heatmap → Tendances temporelles
Export screenshots pour rapports
```

---

## 🐛 Troubleshooting

### **Problème : Sources pas affichées**

```tsx
// Vérifier la connexion Taranis
const connected = await service.testConnection();
console.log('Taranis connected:', connected);

// Vérifier les données
const sources = await service.getOSINTSources();
console.log('Sources loaded:', sources.length);
```

### **Problème : Geographic View ne s'affiche pas**

```tsx
// Vérifier que Leaflet CSS est chargé
import 'leaflet/dist/leaflet.css';

// Vérifier la hauteur du container
<div ref={mapRef} className="w-full h-[700px]" />
```

### **Problème : D3 animations saccadées**

```tsx
// Réduire le nombre de sources affichées
const topSources = sources
  .sort((a, b) => b.alertCount - a.alertCount)
  .slice(0, 50);  // Limiter à 50 sources max

// Ou ajuster la simulation
.force('charge', d3.forceManyBody()
  .strength(-200))  // Réduire la force
```

### **Problème : Memory leak sur auto-refresh**

```tsx
// S'assurer du cleanup
useEffect(() => {
  const interval = setInterval(loadMapData, 30000);
  return () => clearInterval(interval);  // ⬅️ Important !
}, [autoRefresh]);
```

---

## 🚀 Performance Tips

### **1. Virtualisation pour grandes quantités**

```tsx
// Pour > 100 sources, utiliser react-window
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={sources.length}
  itemSize={50}
>
  {({ index, style }) => (
    <SourceItem source={sources[index]} style={style} />
  )}
</FixedSizeList>
```

### **2. Memoization**

```tsx
const memoizedClusters = useMemo(() => 
  clusterSources(sources, groups),
  [sources, groups]
);

const memoizedStats = useMemo(() =>
  calculateStats(sources, newsItems),
  [sources, newsItems]
);
```

### **3. Debouncing pour interactions**

```tsx
import { debounce } from 'lodash';

const debouncedHover = debounce((source) => {
  setHoveredSource(source);
}, 100);
```

---

## 🎓 Concepts Clés

### **Force Simulation (D3.js)**

- **forceMany Body** : Répulsion entre tous les nœuds
- **forceCenter** : Attraction vers le centre du canvas
- **forceCollide** : Évite les overlaps
- **forceCluster** : Attraction vers centre du cluster

### **Leaflet Markers**

- **DivIcon** : Markers HTML/SVG personnalisés
- **CircleMarker** : Cercles stylisés pour clusters
- **Popup** : Info-bulles au click
- **Tooltip** : Info-bulles au hover

### **Trust Score**

Métrique composite :
- **Volume** (30%) : Nombre d'alertes collectées
- **Recentness** (20%) : Source active récemment
- **Type** (30%) : Qualité intrinsèque du type
- **Base** (20%) : Score minimum

---

## 📚 Ressources

- [D3.js Documentation](https://d3js.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [Mapbox Styles](https://docs.mapbox.com/mapbox-gl-js/style-spec/)
- [Force Simulation Examples](https://observablehq.com/@d3/force-directed-graph)

---

## 🤝 Contribution

Pour ajouter une nouvelle vue :

1. Créer `components/cti/map-views/MyView.tsx`
2. Implémenter l'interface commune :
   ```tsx
   interface MyViewProps {
     sources: SourceNode[];
     clusters: SourceCluster[];
     onSourceSelect: (source: SourceNode | null) => void;
     selectedSource: SourceNode | null;
   }
   ```
3. Export dans `map-views/index.ts`
4. Ajouter le TabsTrigger dans `AlertSourceClusteringMap.tsx`

---

## 🎉 Vous êtes prêt !

Lancez la map et brillez devant votre équipe SOC ! 🚀

```bash
npm run dev
# Navigate to: /cti-platform
# Enjoy! 🗺️✨
```

