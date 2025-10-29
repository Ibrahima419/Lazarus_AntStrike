# 🔍 Diagnostic Taranis - Absence de Données

**Date** : 2025-10-07  
**Problème** : `⚠️ Aucun news item trouvé`

---

## 🎯 **ANALYSE DU PROBLÈME**

### **Logs Observés**
```
taranis-ioc-mapper.ts:162 🔍 Extraction IOCs depuis Taranis API: 500 items, range: 7d
taranis-ioc-mapper.ts:168 ⚠️ Aucun news item trouvé
IOCsManager.tsx:105 ⚠️ Aucun IOC trouvé dans les news items récents
```

### **Cause Probable**
L'API Taranis retourne `0` news items, ce qui signifie :
1. **Aucune source OSINT configurée** OU
2. **Sources OSINT non actives** OU
3. **Aucune collecte de données effectuée** OU
4. **Le filtre `cybersecurity=true` est trop strict** (aucun item tagué)

---

## 🔧 **SOLUTIONS PROPOSÉES**

### **Solution 1 : Désactiver temporairement le filtre cybersecurity**

**Fichier** : `components/cti/services/taranis-ioc-mapper.ts`

**Ligne 369-374** :
```typescript
// AVANT (trop strict)
const newsItems = await this.taranisService.getNewsItems({
  limit,
  range,
  cybersecurity: true  // Peut exclure tous les items si pas tagués
});

// APRÈS (pour diagnostic)
const newsItems = await this.taranisService.getNewsItems({
  limit,
  range
  // cybersecurity: true  // Désactivé temporairement
});
```

**Résultat attendu** : Si des news items existent, ils seront récupérés

---

### **Solution 2 : Vérifier la configuration Taranis côté serveur**

#### **A. Vérifier les Sources OSINT**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/assess/osint-sources-list"
```

**Attendu** :
```json
{
  "total_count": 5,
  "items": [
    {
      "id": "source-1",
      "name": "Bleeping Computer",
      "enabled": true,
      "last_collected": "2024-01-07T...",
      "collected_count": 1234
    }
  ]
}
```

**Si `total_count: 0`** → **Aucune source configurée**

---

#### **B. Vérifier les Bots Collecteurs**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/config/bots"
```

**Attendu** :
```json
{
  "total_count": 3,
  "items": [
    {
      "id": "bot-1",
      "name": "RSS Collector",
      "type": "collector",
      "enabled": true,
      "status": "running"
    }
  ]
}
```

**Si tous `enabled: false` ou `status: "stopped"`** → **Aucune collecte active**

---

#### **C. Vérifier les News Items (sans filtre)**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/assess/news-items?limit=10"
```

**Si `total_count: 0`** → **Base de données vide**

---

#### **D. Lancer une Collecte Manuelle**

```bash
# Lister les sources
curl -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/assess/osint-sources"

# Lancer collecte sur une source
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/config/osint-sources/{source_id}/collect"

# Ou lancer collecte sur toutes les sources
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/config/osint-sources/collect"
```

---

### **Solution 3 : Configuration Taranis AI (Interface Web)**

Si vous avez accès à l'interface web Taranis (http://192.168.226.1:3000), configurez :

#### **1. Ajouter des Sources OSINT**

**Menu** : Configuration → OSINT Sources

**Sources recommandées pour cybersécurité** :
- Bleeping Computer (RSS)
- The Hacker News (RSS)
- KrebsOnSecurity (RSS)
- CERT-FR (RSS)
- US-CERT (RSS)
- SecurityWeek (RSS)
- Threatpost (RSS)

**Configuration type** :
```
Name: Bleeping Computer
Type: RSS
URL: https://www.bleepingcomputer.com/feed/
Enabled: ✅ Yes
Collection Interval: 1 hour
Tags: cybersecurity, news
```

---

#### **2. Activer les Bots Collecteurs**

**Menu** : Configuration → Bots

**Bots requis** :
- **RSS Collector Bot** : Collecte depuis feeds RSS
- **Content Analyzer Bot** : Analyse contenu et extrait IOCs
- **Tagging Bot** : Tag automatique (cybersecurity, malware, etc.)

**Action** : Activer tous les bots et démarrer la collecte

---

#### **3. Attendre la Première Collecte**

Après configuration, attendez **5-10 minutes** pour que :
1. Les sources soient interrogées
2. Les news items soient téléchargés
3. Les bots analysent le contenu
4. Les tags soient appliqués

---

## 🧪 **TESTS DE DIAGNOSTIC**

### **Test 1 : API Taranis fonctionne-t-elle ?**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/dashboard"
```

**Attendu** : Réponse JSON avec des stats (même si vides)

---

### **Test 2 : Y a-t-il des données (n'importe lesquelles) ?**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/assess/news-items?limit=1"
```

**Si `total_count > 0`** → Le problème vient du filtre `cybersecurity`  
**Si `total_count = 0`** → Taranis n'a aucune donnée

---

### **Test 3 : Les sources sont-elles configurées ?**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/assess/osint-sources-list"
```

**Si liste vide** → Configurer des sources via interface web

---

### **Test 4 : Les bots tournent-ils ?**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://192.168.226.1:3000/api/config/bots" | jq '.items[] | {name, enabled, status}'
```

**Si tous disabled ou stopped** → Activer via interface web

---

## 📊 **SCÉNARIOS POSSIBLES**

### **Scénario A : Installation Fraîche de Taranis**

**Symptômes** :
- ✅ API répond (status 200)
- ❌ `total_count: 0` partout
- ❌ Aucune source OSINT configurée

**Solution** :
1. Configurer sources OSINT via interface web
2. Activer bots collecteurs
3. Attendre 10 minutes
4. Réessayer

**Temps estimé** : 10-15 minutes

---

### **Scénario B : Filtre cybersecurity trop strict**

**Symptômes** :
- ✅ `news-items` sans filtre retourne des données
- ❌ `news-items?cybersecurity=true` retourne 0

**Solution** :
1. Désactiver filtre `cybersecurity` temporairement
2. Ou attendre que le bot de tagging fonctionne
3. Ou tagger manuellement des items

**Temps estimé** : Immédiat

---

### **Scénario C : Sources configurées mais inactives**

**Symptômes** :
- ✅ Sources existent dans la liste
- ❌ `collected_count: 0`
- ❌ `last_collected: null`

**Solution** :
1. Vérifier que sources sont `enabled: true`
2. Lancer collecte manuelle via API
3. Vérifier logs serveur Taranis pour erreurs

**Temps estimé** : 5 minutes

---

### **Scénario D : Bots désactivés**

**Symptômes** :
- ✅ Sources collectent des données
- ❌ Aucun attribut IOC extrait
- ❌ Aucun tag appliqué

**Solution** :
1. Activer tous les bots (Configuration → Bots)
2. Relancer analyse sur items existants
3. Attendre traitement

**Temps estimé** : 10-15 minutes

---

## 🎯 **CORRECTIF APPLIQUÉ**

**Fichier** : `components/cti/services/taranis-ioc-mapper.ts`  
**Ligne 369-378**

**Changement** :
```typescript
// Désactivation temporaire du filtre cybersecurity pour diagnostic
const newsItems = await this.taranisService.getNewsItems({
  limit,
  range
  // cybersecurity: true  // ⚠️ DÉSACTIVÉ TEMPORAIREMENT
});

console.log(`📊 DEBUG: ${newsItems.length} news items reçus de Taranis (sans filtre cybersec)`);
```

**Objectif** : Voir si Taranis a des données (n'importe lesquelles)

---

## 📋 **PROCHAINES ÉTAPES**

### **Étape 1 : Recharger l'Application**
```
Ctrl + Shift + R
```

### **Étape 2 : Observer les Nouveaux Logs**
```
📊 DEBUG: [X] news items reçus de Taranis (sans filtre cybersec)
```

**Si X > 0** → Le filtre `cybersecurity` était trop strict  
**Si X = 0** → Taranis n'a aucune donnée (configurer sources)

---

### **Étape 3 : Si X = 0, Configurer Taranis**

1. **Accéder à l'interface web** : http://192.168.226.1:3000
2. **Menu** : Configuration → OSINT Sources
3. **Ajouter** : Bleeping Computer, The Hacker News, etc.
4. **Activer** : Configuration → Bots → Activer tous
5. **Attendre** : 10 minutes pour première collecte

---

### **Étape 4 : Si X > 0, Analyser la Qualité**

```javascript
// Dans la console navigateur
// Vérifier si des attributs IOC sont présents
newsItems.forEach(item => {
  if (item.attributes && item.attributes.length > 0) {
    console.log('Item avec attributs:', item.title, item.attributes);
  }
});
```

**Si aucun attribut IOC** → Les bots d'analyse ne tournent pas

---

## 🔐 **CONFIGURATION MINIMALE RECOMMANDÉE**

### **Sources OSINT (Minimum 5)**
1. Bleeping Computer
2. The Hacker News
3. KrebsOnSecurity
4. CERT-FR
5. US-CERT

### **Bots (Tous activés)**
1. RSS Collector Bot
2. Content Analyzer Bot
3. IOC Extractor Bot
4. Tagging Bot

### **Paramètres**
- Collection Interval: 1 hour
- Retention: 90 days
- Auto-tagging: Enabled

---

## ✅ **CHECKLIST DE VÉRIFICATION**

- [ ] API Taranis répond (status 200)
- [ ] Au moins 5 sources OSINT configurées
- [ ] Sources sont `enabled: true`
- [ ] Au moins 1 collecte effectuée (`collected_count > 0`)
- [ ] Bots collecteurs activés et running
- [ ] Bots analyseurs activés et running
- [ ] News items présents dans la base (`total_count > 0`)
- [ ] Au moins quelques items ont des attributs
- [ ] Au moins quelques items ont des tags

---

**Une fois la configuration Taranis complète, l'extraction d'IOCs et la détection de campagnes fonctionneront automatiquement !** 🚀

---

**Dernière mise à jour** : 2025-10-07  
**Status** : ⚠️ ATTENTE CONFIGURATION TARANIS

