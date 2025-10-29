# 🔑 GUIDE : Obtenir les Clés API Gratuites pour IOC Enrichment

**Temps estimé:** 15-20 minutes  
**Coût:** 0€ (tous free tier)

---

## 1️⃣ VIRUSTOTAL API (Hash, URL, Domain)

### **Pourquoi VirusTotal ?**
✅ Base de données la plus complète (70+ antivirus)  
✅ Analyse fichiers, URLs, domaines, IPs  
✅ Free tier : **500 requêtes/jour** (largement suffisant pour MVP)  
✅ Utilisé par Google, Microsoft, Fortune 500

### **Inscription (2 minutes)**

1. **Aller sur:** https://www.virustotal.com/gui/join-us
2. **Créer compte** avec votre email
3. **Vérifier email**
4. **Aller dans Profile** → https://www.virustotal.com/gui/user/YOUR_USERNAME/apikey
5. **Copier votre API Key**

```
Exemple de clé:
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### **Limites Free Tier**
```
✅ 500 requêtes/jour
✅ 4 requêtes/minute
✅ Accès à toutes les APIs
❌ Pas de recherche avancée
❌ Pas de téléchargement samples
```

**Pour MVP:** ✅ Largement suffisant !

---

## 2️⃣ ABUSEIPDB API (IP Reputation)

### **Pourquoi AbuseIPDB ?**
✅ Base de données communautaire d'IPs malveillantes  
✅ Scoring de réputation 0-100  
✅ Free tier : **1000 requêtes/jour**  
✅ Données en temps réel

### **Inscription (2 minutes)**

1. **Aller sur:** https://www.abuseipdb.com/register
2. **Créer compte** avec votre email
3. **Vérifier email**
4. **Aller dans API** → https://www.abuseipdb.com/account/api
5. **Créer nouvelle clé** (Create Key)
6. **Copier votre API Key**

```
Exemple de clé:
1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### **Limites Free Tier**
```
✅ 1000 requêtes/jour
✅ Données complètes
✅ Historique 30 jours
❌ Pas de bulk checking
```

**Pour MVP:** ✅ Parfait !

---

## 3️⃣ IPINFO API (Geolocation, ASN)

### **Pourquoi IPInfo ?**
✅ Géolocalisation précise  
✅ Informations ASN/ISP  
✅ Free tier : **50,000 requêtes/mois** (!!)  
✅ Pas de carte de crédit requise

### **Inscription (1 minute)**

1. **Aller sur:** https://ipinfo.io/signup
2. **Créer compte** avec votre email
3. **Vérifier email**
4. **Dashboard automatique** → https://ipinfo.io/account
5. **Copier votre Access Token**

```
Exemple de token:
abc123def456
```

### **Limites Free Tier**
```
✅ 50,000 requêtes/MOIS (1,666/jour!)
✅ Geolocation complète
✅ ASN, ISP, Organization
✅ Timezone, Carrier
❌ Pas de données privacy/VPN
```

**Pour MVP:** ✅ Excellent !

---

## 4️⃣ NVD API (CVE Data) - OPTIONNEL

### **Pourquoi NVD ?**
✅ Base de données officielle CVE (NIST)  
✅ Gratuit, pas de limite  
✅ Données CVSS, CWE, références

### **Inscription (1 minute)**

1. **Aller sur:** https://nvd.nist.gov/developers/request-an-api-key
2. **Remplir formulaire** (email + organisation)
3. **Recevoir clé par email** (instantané)

```
Exemple de clé:
12345678-1234-1234-1234-123456789012
```

### **Limites**
```
Sans clé: 5 requêtes/30 secondes
Avec clé: 50 requêtes/30 secondes
```

**Pour MVP:** 🟡 Utile mais moins critique

---

# 📝 CONFIGURATION .ENV

Une fois toutes les clés obtenues, ajoutez-les dans `backend/.env` :

```bash
# ===================================
# IOC ENRICHMENT APIs
# ===================================

# VirusTotal (Hash, URL, Domain)
VIRUSTOTAL_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# AbuseIPDB (IP Reputation)
ABUSEIPDB_API_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# IPInfo (Geolocation, ASN)
IPINFO_TOKEN=abc123def456

# NVD (CVE Data) - Optionnel
NVD_API_KEY=12345678-1234-1234-1234-123456789012

# Cache TTL (en secondes)
IOC_CACHE_TTL=86400  # 24 heures
```

---

# ✅ VÉRIFICATION

### **Test VirusTotal**
```bash
curl -H "x-apikey: VOTRE_CLE" \
  "https://www.virustotal.com/api/v3/files/44d88612fea8a8f36de82e1278abb02f"
```

### **Test AbuseIPDB**
```bash
curl -H "Key: VOTRE_CLE" \
  "https://api.abuseipdb.com/api/v2/check?ipAddress=8.8.8.8"
```

### **Test IPInfo**
```bash
curl "https://ipinfo.io/8.8.8.8?token=VOTRE_TOKEN"
```

### **Test NVD**
```bash
curl "https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2021-44228"
```

**Si tous retournent des données JSON:** ✅ Vous êtes prêt !

---

# 💰 COÛTS SI VOUS SCALEZ

### **Gratuit jusqu'à :**
```
VirusTotal:   500 req/jour    = 15,000/mois
AbuseIPDB:    1,000 req/jour  = 30,000/mois
IPInfo:       50,000/mois
NVD:          Illimité (avec clé)
```

### **Si vous dépassez les limites :**

| Service | Plan Payant | Prix |
|---------|-------------|------|
| **VirusTotal** | Premium | $600/mois (15,000 req/jour) |
| **AbuseIPDB** | Basic | $20/mois (3,000 req/jour) |
| **IPInfo** | Standard | $99/mois (250,000 req) |
| **NVD** | Gratuit | $0 |

**Pour 10 clients actifs:** Gratuit suffit largement  
**Pour 100+ clients:** Budget ~$150-200/mois

---

# 🎯 RÉSUMÉ RAPIDE

```bash
1. ✅ VirusTotal      → https://virustotal.com/gui/join-us
2. ✅ AbuseIPDB       → https://abuseipdb.com/register
3. ✅ IPInfo          → https://ipinfo.io/signup
4. 🟡 NVD (optionnel) → https://nvd.nist.gov/developers/request-an-api-key

Temps total: 10 minutes
Coût: 0€
```

**Prochaine étape:** Implémenter ces APIs dans le code ! 🚀



