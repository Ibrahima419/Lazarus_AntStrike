# 🚀 Guide Rapide - Gestion des Sources CTI

## ✅ FONCTIONNALITÉ RÉINTÉGRÉE !

La fonctionnalité **Gérer Sources** est maintenant accessible dans votre CTI Platform !

---

## 📍 **Comment Accéder**

### **Méthode 1 : Depuis Overview**
```
1. CTI Platform → Overview
2. Scroll vers "Modules Quick Access"
3. Cliquer sur la carte "Gérer Sources" 
   (icône Database)
```

### **Méthode 2 : Depuis Onglets**
```
1. CTI Platform
2. Cliquer onglet "Sources" 
   (entre OSINT et AI Bots)
```

---

## 🎯 **Fonctionnalités Disponibles**

### **Tab 1 : Upload** 📁
**Ajouter des sources via fichiers**

**Formats supportés :**
- ✅ CSV (IOCs en liste)
- ✅ JSON (format structuré)
- ✅ XML (feeds complexes)
- ✅ TXT (liste simple)

**Utilisation :**
```
1. Tab "Upload"
2. Drag & Drop votre fichier
   OU Clic "Browse" pour sélectionner
3. Prévisualisation des données
4. Clic "Import" → Source ajoutée !
```

**Exemple CSV :**
```csv
type,value,description,severity
ip,185.220.101.42,Tor Exit Node,high
domain,malicious-site.com,Phishing,critical
hash,44d88612fea8a8f36de82e1278abb02f,Emotet,critical
```

### **Tab 2 : Configure** ⚙️
**Configurer sources automatiques**

**Types de sources :**
- 🌐 **API REST** - API threat intel externes
- 📡 **RSS Feed** - Flux RSS de sécurité
- 🐦 **Twitter/X** - Hashtags threat intel
- 📧 **Email** - Alertes par email
- 🔗 **Webhook** - Notifications temps réel
- 🗄️ **Database** - Connexion BD externe

**Exemple : Ajouter AlienVault OTX**
```
1. Tab "Configure"
2. Template: "API REST"
3. Remplir:
   - Name: AlienVault OTX
   - URL: https://otx.alienvault.com/api/v1/pulses/subscribed
   - Auth Type: API Key
   - API Key: [votre clé]
4. Clic "Test Connection"
5. Si OK → Clic "Save Source"
```

**Exemple : Ajouter RSS Feed**
```
1. Template: "RSS Feed"
2. Remplir:
   - Name: URLhaus Recent
   - URL: https://urlhaus.abuse.ch/rss/
   - Parse Content: ✅
   - Extract Links: ✅
3. Clic "Test Connection"
4. Clic "Save Source"
```

### **Tab 3 : Test** 🧪
**Tester vos sources configurées**

**Fonctionnalités :**
- ✅ Test de connectivité
- ✅ Temps de réponse
- ✅ Validation données
- ✅ Diagnostic problèmes

**Utilisation :**
```
1. Tab "Test"
2. Sélectionner une source
3. Clic "Run Test"
4. Voir résultats :
   - Connectivité : OK/KO
   - Response time : XXms
   - Data quality : Valid/Invalid
5. Si problème → Recommandations affichées
```

### **Tab 4 : Manage** 📊
**Gérer toutes vos sources**

**Actions disponibles :**
- 👁️ **View** - Voir détails source
- ✏️ **Edit** - Modifier configuration
- 🗑️ **Delete** - Supprimer source
- ▶️/⏸️ **Enable/Disable** - Activer/Désactiver
- 🔄 **Refresh** - Collecter maintenant

**Filtres :**
- Type (RSS, API, etc.)
- Statut (Active, Inactive)
- Recherche par nom/URL

---

## 🌐 **Sources Recommandées à Ajouter**

### **1. AlienVault OTX** (IOCs complets)
```
Type: API REST
URL: https://otx.alienvault.com/api/v1/pulses/subscribed
Auth: API Key (gratuit après inscription)
Collecte: Toutes les heures
```

### **2. URLhaus** (URLs malveillantes)
```
Type: RSS
URL: https://urlhaus.abuse.ch/rss/
Auth: Aucune
Collecte: Toutes les 30 minutes
```

### **3. Feodo Tracker** (Botnet C2 IPs)
```
Type: CSV
URL: https://feodotracker.abuse.ch/downloads/ipblocklist.csv
Auth: Aucune
Collecte: Toutes les 6 heures
```

### **4. MalwareBazaar** (Malware hashes)
```
Type: API REST
URL: https://mb-api.abuse.ch/api/v1/
Auth: API Key (gratuit)
Collecte: Toutes les heures
```

### **5. ThreatFox** (IOCs récents)
```
Type: API REST
URL: https://threatfox-api.abuse.ch/api/v1/
Auth: Aucune
Collecte: Toutes les 30 minutes
```

---

## 🧪 **TESTER AVEC DES IOCS CRITIQUES**

### **Option 1 : Upload Fichier CSV**

**Créez ce fichier `test-iocs.csv` :**
```csv
type,value,description,severity,source
ip,185.220.101.42,Tor Exit Node - APT29,critical,Manual
ip,45.142.212.61,Cobalt Strike C2,critical,Manual
domain,update-check-system.com,Phishing Campaign,high,Manual
domain,secure-verify-account.net,Credential Theft,high,Manual
hash,44d88612fea8a8f36de82e1278abb02f,Emotet Malware,critical,VirusTotal
hash,3395856ce81f2b7382dee72602f798b642f14140,Cobalt Strike Beacon,critical,Manual
url,http://malicious-site.com/payload.exe,Malware Distribution,critical,Manual
email,phishing@fake-bank.com,Phishing Email,medium,Manual
```

**Import :**
```
1. Sources → Upload
2. Drag & Drop test-iocs.csv
3. Prévisualisation → 8 IOCs détectés
4. Clic "Import"
5. IOCs apparaissent dans Intelligence → IOCs
```

### **Option 2 : Configurer Source Auto**

**AlienVault OTX (Inscription gratuite requise) :**
```
1. Aller sur https://otx.alienvault.com
2. Créer compte gratuit
3. Settings → API Key → Copier
4. Dans AntStrike:
   - Sources → Configure
   - Template: API REST
   - Name: AlienVault OTX
   - URL: https://otx.alienvault.com/api/v1/pulses/subscribed
   - Auth Type: API Key
   - Header: X-OTX-API-KEY
   - Value: [votre clé]
5. Test → Save → Enable
6. IOCs collectés automatiquement !
```

### **Option 3 : Source RSS Simple (Aucune Auth)**

**URLhaus (Immédiat, aucune clé requise) :**
```
1. Sources → Configure
2. Template: RSS Feed
3. Configuration:
   - Name: URLhaus Recent
   - URL: https://urlhaus.abuse.ch/rss/
   - Parse Content: ON
   - Extract Links: ON
   - Language: Auto
4. Test → OK
5. Save → Enable
6. Collecte automatique toutes les 30min
```

---

## 📊 **Workflow Complet**

### **Scénario : Ajouter Source URLhaus**

**Étape 1 : Accès (5 secondes)**
```
CTI Platform → Sources
```

**Étape 2 : Configuration (30 secondes)**
```
1. Tab "Configure"
2. Template: "RSS Feed"
3. Name: URLhaus Recent
4. URL: https://urlhaus.abuse.ch/rss/
5. Options: Parse Content ✅
```

**Étape 3 : Test (10 secondes)**
```
1. Clic "Test Connection"
2. Résultat: ✅ Connection OK (234ms)
3. Data Preview: 50 URLs malveillantes
```

**Étape 4 : Activation (5 secondes)**
```
1. Clic "Save Source"
2. Toggle "Enable" → ON
3. Source active ! ✅
```

**Étape 5 : Collecte (Auto)**
```
Collecte automatique démarre
↓
IOCs apparaissent dans Intelligence → IOCs
↓
Visible sur Threat Map
↓
Utilisable dans Reports
```

**Total : 50 secondes pour source complète ! 🚀**

---

## 🎯 **Accès Rapide aux Fonctionnalités**

### **Dans CTI Platform :**

```
┌─────────────────────────────────────────────┐
│ CTI Platform                                │
├─────────────────────────────────────────────┤
│ Tabs: Overview | Map | ... | 🗄️ Sources    │ ← NOUVEAU !
└─────────────────────────────────────────────┘

Overview → Modules Quick Access
├── [Intelligence]
├── [🗄️ Gérer Sources] ← NOUVEAU !
├── [OSINT]
└── [AI Analysis]
```

---

## 📚 **Documentation Complète**

**Fichiers disponibles dans `/components/cti/` :**
- `SOURCE_INGESTION_GUIDE.md` - Guide complet
- `SOURCE_ARCHITECTURE.md` - Architecture technique
- `SourceUploader.tsx` - Composant upload
- `SourceConfigurator.tsx` - Composant configuration
- `SourceTester.tsx` - Composant test
- `SourceManager.tsx` - Composant gestion

---

## 🎉 **RÉSUMÉ**

### **Vous pouvez maintenant :**

✅ **Ajouter sources personnalisées** (Upload fichiers)  
✅ **Configurer sources auto** (RSS, API, Twitter, etc.)  
✅ **Tester sources** (Connectivité, performance)  
✅ **Gérer sources** (Activer, modifier, supprimer)  
✅ **Collecter IOCs** automatiquement  
✅ **Voir IOCs** dans Intelligence Dashboard  
✅ **Visualiser** sur Threat Map  
✅ **Exporter** pour SIEM  
✅ **Générer rapports** avec IOCs collectés  

### **Accès Facile :**
- Onglet **"Sources"** dans navigation principale
- Carte **"Gérer Sources"** dans Overview
- 4 sous-onglets (Upload, Configure, Test, Manage)

---

**🚀 La fonctionnalité est COMPLÈTEMENT réintégrée et accessible ! Testez maintenant !**

