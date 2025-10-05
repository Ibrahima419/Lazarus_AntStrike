# 🚀 Guide d'Intégration Rapide - Alert Source Clustering Map

## ✅ Ce qui a été créé pour vous

### **Fichiers Principaux**

```
components/cti/
├── AlertSourceClusteringMap.tsx          # ⭐ Composant principal
└── map-views/
    ├── GalaxyView.tsx                    # 🌌 Vue galaxie (D3.js)
    ├── GeographicView.tsx                # 🌍 Vue géographique (Leaflet)
    ├── NetworkGraphView.tsx              # 🕸️ Graphe réseau (D3.js)
    ├── HeatmapView.tsx                   # 🔥 Heatmap temporelle
    ├── SourcePerformancePanel.tsx        # 📊 Panel de performance
    └── index.ts                          # Export central
```

### **Documentation**

```
components/cti/
├── ALERT_SOURCE_CLUSTERING_MAP.md        # 📚 Guide complet
└── MAP_INTEGRATION_GUIDE.md              # 🚀 Ce fichier
```

---

## 🎯 Intégration en 3 étapes

### **Étape 1 : Vérifier les dépendances**

Les packages suivants ont été installés :

```json
{
  "d3": "^7.x.x",
  "@types/d3": "^7.x.x",
  "leaflet": "^1.x.x",
  "@types/leaflet": "^1.x.x"
}
```

Si besoin, réinstallez :

```bash
npm install d3 @types/d3 leaflet @types/leaflet
```

---

### **Étape 2 : Ajouter la route dans votre sidebar**

Dans `components/dashboard-sidebar.tsx` :

```tsx
const menuItems = [
  // ... autres items
  { 
    id: 'source-map', 
    label: 'Source Intelligence Map', 
    icon: Globe  // Importer Globe depuis lucide-react
  },
];
```

---

### **Étape 3 : Ajouter le composant dans App.tsx**

```tsx
import { AlertSourceClusteringMap } from './components/cti/AlertSourceClusteringMap';

// Dans renderContent():
switch (activeTab) {
  // ... autres cases
  
  case 'source-map':
    return <AlertSourceClusteringMap />;
    
  // ... autres cases
}
```

---

## 🎨 Aperçu Visuel

### **Galaxy View** 🌌
```
┌─────────────────────────────────────────────┐
│  🌐 Source Intelligence Map                │
│                                             │
│  [Galaxy] [Geographic] [Network] [Heatmap] │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │    🔵 FeodoTracker (247 alerts)    │   │
│  │         ○ ○ ○                       │   │
│  │    ○         ○                      │   │
│  │  🟢 AlienVault   🟠 Abuse.ch        │   │
│  │         ○ ○                         │   │
│  │    ○         ○                      │   │
│  │         ○                           │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📊 Stats: 47 sources | 42 active | ...    │
└─────────────────────────────────────────────┘
```

### **Geographic View** 🌍
```
┌─────────────────────────────────────────────┐
│  🌍 World Map                               │
│                                             │
│  [Dark Mode] [Satellite] ▼                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   🗺️                                │   │
│  │        📍 New York (15 sources)     │   │
│  │                                     │   │
│  │  📍 Paris          📍 Tokyo         │   │
│  │                                     │   │
│  │        📍 Singapore                 │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### **Heatmap View** 🔥
```
┌─────────────────────────────────────────────┐
│  Source Activity (Last 24h)                │
│                                             │
│  Source           0h 1h 2h 3h ... 23h Total│
│  FeodoTracker     ██ ░░ ██ ░░ ... ░░  247  │
│  AlienVault       ░░ ██ ░░ ██ ... ██  156  │
│  Abuse.ch         ██ ██ ░░ ░░ ... ░░  89   │
│  ...                                        │
└─────────────────────────────────────────────┘
```

---

## 💡 Configuration Recommandée

### **Dans votre .env (si pas déjà fait)**

```env
VITE_TARANIS_API_URL=http://localhost:8080/api
VITE_TARANIS_API_KEY=your_api_key_here
```

### **Authentification Taranis**

Le service se connecte automatiquement avec les credentials par défaut :

```tsx
// Dans taranis-unified-service.ts (déjà configuré)
defaultCredentials: {
  username: 'admin',
  password: 'admin'
}
```

Pour changer les credentials :

```tsx
import { createTaranisService } from './src/services/taranis/taranis-unified-service';

const service = createTaranisService({
  defaultCredentials: {
    username: 'your_username',
    password: 'your_password'
  }
});
```

---

## 🎛️ Customisation Rapide

### **Changer les couleurs**

Dans `AlertSourceClusteringMap.tsx` :

```tsx
const getSourceColor = (type: string): string => {
  const colors: Record<string, string> = {
    'RSS': '#3b82f6',       // ⬅️ Changer ici
    'API': '#10b981',
    'WEB': '#f59e0b',
    'TWITTER': '#06b6d4',
    'EMAIL': '#8b5cf6',
    'manual': '#6b7280'
  };
  return colors[type] || '#3b82f6';
};
```

### **Changer l'intervalle de refresh**

```tsx
// Dans AlertSourceClusteringMap.tsx, ligne ~73
const interval = setInterval(loadMapData, 30000); // ⬅️ 30s par défaut

// Pour 1 minute :
const interval = setInterval(loadMapData, 60000);
```

### **Limiter le nombre de sources affichées**

```tsx
// Dans loadMapData(), après le transform
const sourceNodes: SourceNode[] = osintSources
  .map(/* ... */)
  .sort((a, b) => b.alertCount - a.alertCount)
  .slice(0, 50); // ⬅️ Top 50 seulement
```

---

## 🧪 Test Rapide

### **1. Démarrer l'application**

```bash
npm run dev
```

### **2. Naviguer vers la map**

- Click sur "Source Intelligence Map" dans la sidebar
- Ou naviguer vers : `http://localhost:3000` puis sélectionner l'onglet

### **3. Vérifier la connexion Taranis**

Ouvrir la console navigateur (F12) :

```
Taranis connected: true
Sources loaded: 47
Clusters detected: 5
```

Si erreur :
- Vérifier que Taranis AI tourne sur `http://localhost:8080`
- Vérifier les credentials dans `taranis-unified-service.ts`

---

## 🔥 Features Rapides à Montrer

### **Pour impressionner votre équipe :**

1. **Galaxy View** :
   - Drag & drop des sources
   - Zoom avec molette
   - Hover pour tooltips
   - Click pour détails

2. **Geographic View** :
   - Toggle Dark/Satellite
   - Click marker → Fly to location
   - Hover pour preview

3. **Heatmap** :
   - Voir activité temporelle
   - Identifier pics d'activité
   - Click source pour sélection

4. **Performance Panel** :
   - Top performers en temps réel
   - Sources problématiques
   - Recommendations automatiques

---

## 📊 Endpoints Taranis Utilisés

La map fait automatiquement ces appels :

```tsx
await Promise.all([
  service.getOSINTSources(),         // /assess/osint-sources-list
  service.getOSINTSourceGroups(),    // /assess/osint-source-group-list
  service.getNewsItems(100)          // /assess/news-items?limit=100
]);
```

**Aucune configuration supplémentaire requise** si votre Taranis est configuré !

---

## 🐛 Debugging

### **Sources pas affichées ?**

```tsx
// Dans AlertSourceClusteringMap.tsx, ajouter console.logs:

const loadMapData = async () => {
  try {
    console.log('🔄 Loading map data...');
    
    const sources = await service.getOSINTSources();
    console.log('✅ Sources loaded:', sources.length);
    console.log('📋 Sample source:', sources[0]);
    
    // ...
  } catch (error) {
    console.error('❌ Error loading:', error);
  }
};
```

### **D3/Leaflet errors ?**

```bash
# Réinstaller les types
npm install --save-dev @types/d3 @types/leaflet

# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Map vide (blanc) ?**

Vérifier dans le navigateur :
1. F12 → Console : Voir erreurs JS
2. F12 → Network : Vérifier appels API
3. F12 → Elements : Voir si SVG est rendu

---

## 🎓 Prochaines Étapes

### **Niveau 1 : Basic (Vous êtes ici ✅)**
- ✅ Map fonctionnelle
- ✅ 4 vues interactives
- ✅ Connexion Taranis

### **Niveau 2 : Intermediate**
- [ ] Ajouter filtres personnalisés
- [ ] Exporter les vues en PNG
- [ ] Partager une vue par URL
- [ ] Sauvegarder préférences utilisateur

### **Niveau 3 : Advanced**
- [ ] WebSocket pour updates temps réel
- [ ] ML pour détection d'anomalies
- [ ] Intégration avec MISP/OpenCTI
- [ ] Mobile app version

---

## 🎉 Vous êtes prêt !

Tout est configuré et prêt à l'emploi. La Alert Source Clustering Map va **transformer** votre expérience analyste SOC !

### **Quick Start Checklist**

- [x] Fichiers créés
- [x] Dépendances installées
- [ ] Route ajoutée dans sidebar
- [ ] Composant ajouté dans App.tsx
- [ ] Taranis AI running
- [ ] `npm run dev` lancé
- [ ] Map testée et fonctionnelle

### **Need Help?**

- 📖 Voir `ALERT_SOURCE_CLUSTERING_MAP.md` pour guide complet
- 🔍 Check console navigateur pour errors
- 🧪 Tester connexion Taranis avec `/isalive`

---

**Enjoy et brillez ! 🌟🗺️🚀**

