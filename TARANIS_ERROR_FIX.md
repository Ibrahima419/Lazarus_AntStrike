# 🛠️ Correction Erreurs Taranis 500

## ✅ CORRECTIONS APPLIQUÉES

### **1. Service Taranis Amélioré** 🔧
**Fichier :** `src/services/taranis/taranis-unified-service.ts`

**Corrections :**
- ✅ **Gestion d'erreurs robuste** pour `triggerCollection()`
- ✅ **Fallback automatique** si endpoint principal échoue
- ✅ **Collecte individuelle** si collecte globale échoue
- ✅ **Logs détaillés** pour debugging

### **2. OSINTCollector Amélioré** 🔧
**Fichier :** `components/cti/OSINTCollector.tsx`

**Corrections :**
- ✅ **Messages d'erreur descriptifs** (500, 404, timeout)
- ✅ **Timeout réduit** à 3 secondes
- ✅ **Logs colorés** dans console
- ✅ **Rechargement même en cas d'erreur**

### **3. Dashboard avec Diagnostic** 🩺
**Fichiers créés :**
- ✅ `components/cti/TaranisHealthCheck.tsx`
- ✅ Onglet "Diagnostic" ajouté
- ✅ Alerte visible si Taranis offline

---

## 🚨 **PROBABLE CAUSE DES ERREURS 500**

### **Le serveur Taranis n'est pas démarré !**

L'erreur `POST http://localhost:3001/...` suggère que :
- ❌ Le serveur Taranis sur port **3001** n'est **pas en cours d'exécution**
- ❌ Ou les endpoints de collecte ont changé
- ❌ Ou problème de configuration

---

## 🚀 **SOLUTION IMMEDIATE**

### **Étape 1 : Vérifier Taranis** 
```bash
# Dans votre terminal Ubuntu
curl http://localhost:3001/api/health
```

**Si ça marche :** ✅ Taranis fonctionne
**Si erreur :** ❌ Taranis pas démarré

### **Étape 2A : Démarrer Taranis** (Si pas démarré)
```bash
# Navigation vers Taranis
cd /path/to/taranis

# Démarrage Docker (méthode commune)
docker-compose up -d

# OU démarrage classique
python manage.py runserver 0.0.0.0:3001

# OU selon votre installation
npm start
```

### **Étape 2B : Utiliser le Diagnostic** (Si déjà démarré)
```
1. Dans AntStrike → CTI Platform
2. Cliquer onglet "Diagnostic" 
3. Cliquer "Tester"
4. Voir quels endpoints échouent
```

---

## 🔍 **DIAGNOSTIC DANS L'APP**

### **Nouvel onglet "Diagnostic" disponible !** 🆕

**Fonctionnalités :**
- ✅ **Health Score** Taranis (0-100%)
- ✅ **Test 7 endpoints** automatiquement
- ✅ **Temps de réponse** pour chaque API
- ✅ **Messages d'erreur détaillés**
- ✅ **Recommandations** d'actions

### **Comment accéder :**
```
1. CTI Platform
2. Si ❌ "Offline" visible → Badge rouge en haut
3. Clic onglet "Diagnostic" 
4. Clic "Tester" → Diagnostic complet
```

---

## 📊 **AMÉLIORATION UX**

### **Avant (Erreurs silencieuses)**
```
❌ Erreur 500 dans console
❌ Pas d'info à l'utilisateur
❌ App semble cassée
❌ Pas de solution évidente
```

### **Après (Gestion d'erreur intelligente)** ✅
```
✅ Message d'alerte visible
✅ Bouton "Diagnostic" évident
✅ Test automatique de 7 endpoints
✅ Recommendations d'actions
✅ Fallback automatique
✅ Logs détaillés pour debug
```

---

## 🛠️ **MODES DE FONCTIONNEMENT**

### **Mode Normal** (Taranis OK)
```
🟢 Connected → Données temps réel
├── News items depuis Taranis
├── Stories et campagnes
├── IOCs extraits
└── Géolocalisation automatique
```

### **Mode Dégradé** (Taranis KO)
```
🔴 Offline → Données de démonstration
├── Threat map avec données mockées
├── IOCs de démonstration  
├── Alertes simulées
└── + Message d'alerte + Diagnostic
```

---

## 🧪 **TESTS MAINTENANT**

### **1. Testez l'interface d'abord :**
```bash
npm run dev
```

**Dans l'app :**
1. CTI Platform → Si badge "Offline" visible
2. Clic onglet **"Diagnostic"** (nouveau !)
3. Clic **"Tester"** → Voir les résultats

### **2. Vérifiez Taranis :**
```bash
# Teste si Taranis répond
curl http://localhost:3001/api/health

# Si erreur, démarrer Taranis
cd ~/taranis  # (ou votre chemin Taranis)
docker-compose up -d
# OU
python manage.py runserver 0.0.0.0:3001
```

### **3. Re-testez l'interface :**
Après démarrage Taranis :
1. Retour sur CTI Platform
2. Clic "Réessayer" dans l'alerte
3. Badge devrait passer vert "Live" ✅

---

## 💡 **DEBUG RAPIDE**

### **Si les erreurs 500 persistent :**

**1. Vérifiez les logs Taranis :**
```bash
# Logs Docker
docker logs taranis-app

# Logs Python (si applicable)
tail -f taranis.log
```

**2. Vérifiez la configuration :**
```bash
# Dans taranis-unified-service.ts ligne ~50
const config = {
  baseUrl: 'http://localhost:3001',  // ← Bon port ?
  timeout: 30000
}
```

**3. Testez un endpoint simple :**
```bash
# Test direct API
curl http://localhost:3001/api/config/osint-sources
```

---

## ✅ **MAINTENANT VOUS DEVRIEZ VOIR**

### **Dans CTI Platform :**
```
┌─────────────────────────────────────┐
│ CTI Platform SOC    [🟢 Live] ✅   │ ← Si Taranis OK
│                   [🔴 Offline] ❌  │ ← Si Taranis KO
├─────────────────────────────────────┤
│       SECURITY POSTURE              │
│          87 / 100  🟢              │ ← Hero metric
├─────────────────────────────────────┤
│ 🚀 ACTIONS RAPIDES                  │ ← 8 boutons
│ [🗺️][🔍][📊][🚫][▶️][📥][📤][🔔]  │
├─────────────────────────────────────┤
│ Tabs: Overview | Map | ... |🩺Diag  │ ← Nouveau !
└─────────────────────────────────────┘
```

**Si problème Taranis :**
- 🚨 **Alerte rouge** visible
- 🩺 **Onglet Diagnostic** avec icône ⚠️
- 🔄 **Boutons "Réessayer"**

---

## 🎉 **RÉCAPITULATIF**

✅ **Dashboard optimisé** → UX améliorée  
✅ **Gestion d'erreurs** → Plus de crashes  
✅ **Diagnostic intégré** → Debug facile  
✅ **Fallbacks automatiques** → App robuste  
✅ **Messages clairs** → User-friendly  

**Testez maintenant et dites-moi si les erreurs 500 sont résolues ! 🚀**

Le plus important c'est de **démarrer le serveur Taranis** en premier. Ensuite tout devrait fonctionner parfaitement ! 😊
