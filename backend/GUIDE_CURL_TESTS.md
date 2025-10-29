# 🧪 GUIDE COMPLET : TESTER ANTSTRIKE CTI AVEC CURL

**Guide pas à pas pour tester tous les endpoints du système**

---

## 📋 PRÉREQUIS

1. **Backend lancé** : `npm run dev` (port 4000)
2. **Redis actif** : Port 6379
3. **PowerShell** ou **CMD** ouvert

---

## 🚀 ÉTAPE 1 : TESTER LE BACKEND (SANS AUTH)

### **1.1 Health Check**

```bash
curl http://localhost:4000/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T...",
  "uptime": 123.45
}
```

---

## 🔐 ÉTAPE 2 : CRÉER UN UTILISATEUR ET OBTENIR UN TOKEN

### **2.1 Créer un compte de test**

```bash
curl -X POST http://localhost:4000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"analyst@soc.local\",\"password\":\"SecurePass123!\",\"name\":\"SOC Analyst\"}"
```

**Réponse** :
```json
{
  "user": {
    "id": "...",
    "email": "analyst@soc.local",
    "name": "SOC Analyst"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

➡️ **IMPORTANT** : Copiez le `token` pour les prochaines requêtes !

### **2.2 Se connecter (si déjà inscrit)**

```bash
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"analyst@soc.local\",\"password\":\"SecurePass123!\"}"
```

---

## 📡 ÉTAPE 3 : TESTER LA COLLECTE (AVEC TOKEN)

### **3.1 Vérifier le statut de la queue**

```bash
curl http://localhost:4000/api/collection/queue/status ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

**Remplacez** `VOTRE_TOKEN_ICI` par votre token réel !

**Réponse** :
```json
{
  "success": true,
  "data": {
    "waiting": 0,
    "active": 0,
    "completed": 0,
    "failed": 0,
    "delayed": 0
  }
}
```

### **3.2 Obtenir les statistiques de collecte**

```bash
curl http://localhost:4000/api/collection/stats ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **3.3 Health check des sources**

```bash
curl http://localhost:4000/api/collection/health ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **3.4 Déclencher une collecte complète**

```bash
curl -X POST http://localhost:4000/api/collection/trigger ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" ^
  -H "Content-Type: application/json" ^
  -d "{\"sources\":[\"taranis\",\"osint\"]}"
```

**⏱️ Attendez 10-20 secondes**, puis vérifiez la queue à nouveau :

```bash
curl http://localhost:4000/api/collection/queue/status ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **3.5 Collecter uniquement Taranis**

```bash
curl -X POST http://localhost:4000/api/collection/trigger/taranis ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 🔷 ÉTAPE 4 : TESTER STIX

### **4.1 Lister les bundles STIX**

```bash
curl http://localhost:4000/api/stix/bundles ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **4.2 Importer un bundle STIX (exemple)**

```bash
curl -X POST http://localhost:4000/api/stix/import ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"bundle\",\"id\":\"bundle--test-001\",\"objects\":[]}"
```

---

## 🌐 ÉTAPE 5 : TESTER TAXII

### **5.1 Discovery endpoint**

```bash
curl http://localhost:4000/api/taxii/discovery
```

**Pas d'auth nécessaire** (endpoint public TAXII)

### **5.2 Lister les collections**

```bash
curl http://localhost:4000/api/taxii/collections
```

---

## 🔴 ÉTAPE 6 : TESTER MISP

### **6.1 Vérifier la configuration MISP**

```bash
curl http://localhost:4000/api/misp/config ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **6.2 Lister les événements MISP**

```bash
curl http://localhost:4000/api/misp/events ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 🛡️ ÉTAPE 7 : TESTER CVE

### **7.1 Rechercher un CVE**

```bash
curl "http://localhost:4000/api/cve/search?query=apache" ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **7.2 Obtenir les CVE récents**

```bash
curl http://localhost:4000/api/cve/recent ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **7.3 Détails d'un CVE spécifique**

```bash
curl http://localhost:4000/api/cve/CVE-2024-1234 ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **7.4 Statistiques CVE**

```bash
curl http://localhost:4000/api/cve/stats ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 📰 ÉTAPE 8 : TESTER OSINT FEEDS

### **8.1 Lister les feeds configurés**

```bash
curl http://localhost:4000/api/osint-feeds ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **8.2 Ajouter un feed de test**

```bash
curl -X POST http://localhost:4000/api/osint-feeds ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Feed\",\"url\":\"https://example.com/feed\",\"type\":\"json\",\"enabled\":true}"
```

### **8.3 Tester un feed**

```bash
curl -X POST http://localhost:4000/api/osint-feeds/FEED_ID/test ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 📡 ÉTAPE 9 : TESTER TARANIS (140 ENDPOINTS)

### **9.1 Lister les products**

```bash
curl http://localhost:4000/api/taranis/products ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **9.2 Lister les stories**

```bash
curl http://localhost:4000/api/taranis/news-items/stories ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **9.3 Lister les news items**

```bash
curl http://localhost:4000/api/taranis/news-items ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **9.4 Lister les OSINT sources**

```bash
curl http://localhost:4000/api/taranis/osint-sources ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **9.5 Lister les report items**

```bash
curl http://localhost:4000/api/taranis/report-items ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 🕵️ ÉTAPE 10 : TESTER DARK WEB

### **10.1 Lister les mentions**

```bash
curl http://localhost:4000/api/darkweb/mentions ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **10.2 Rechercher des mentions**

```bash
curl "http://localhost:4000/api/darkweb/search?keywords=leak" ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **10.3 Statistiques**

```bash
curl http://localhost:4000/api/darkweb/stats ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 🍯 ÉTAPE 11 : TESTER HONEYPOT

### **11.1 Lister les événements**

```bash
curl http://localhost:4000/api/honeypot/events ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **11.2 Top attackers**

```bash
curl http://localhost:4000/api/honeypot/top-attackers ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **11.3 Statistiques**

```bash
curl http://localhost:4000/api/honeypot/stats ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 📊 ÉTAPE 12 : TESTER THREAT FEEDS

### **12.1 Lister tous les feeds**

```bash
curl http://localhost:4000/api/threat-feeds ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **12.2 Statistiques agrégées**

```bash
curl http://localhost:4000/api/threat-feeds/stats ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 🎯 ÉTAPE 13 : TESTS AVANCÉS

### **13.1 Collecte avec priorité custom**

```bash
curl -X POST http://localhost:4000/api/collection/trigger ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" ^
  -H "Content-Type: application/json" ^
  -d "{\"sources\":[\"taranis\"],\"priority\":90}"
```

### **13.2 Historique des collectes**

```bash
curl http://localhost:4000/api/collection/history ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **13.3 Consulter les menaces collectées**

```bash
curl http://localhost:4000/api/threats ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### **13.4 Filtrer par sévérité**

```bash
curl "http://localhost:4000/api/threats?severity=critical" ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 💡 ASTUCES CURL

### **Format JSON lisible (avec jq)**

Si vous avez `jq` installé :

```bash
curl http://localhost:4000/api/health | jq
```

### **Sauvegarder la réponse dans un fichier**

```bash
curl http://localhost:4000/api/collection/stats ^
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" ^
  -o stats.json
```

### **Voir les headers de réponse**

```bash
curl -i http://localhost:4000/api/health
```

### **Mode verbose (debug)**

```bash
curl -v http://localhost:4000/api/health
```

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### **Erreur 401 Unauthorized**

➡️ Votre token a expiré ou est invalide. Reconnectez-vous :

```bash
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"analyst@soc.local\",\"password\":\"SecurePass123!\"}"
```

### **Erreur 404 Not Found**

➡️ Vérifiez l'URL et que le backend est bien lancé sur le port 4000.

### **Erreur ECONNREFUSED**

➡️ Le backend n'est pas démarré. Lancez `npm run dev` dans `backend/`.

### **Erreur 500 Internal Server Error**

➡️ Consultez les logs du backend pour voir l'erreur détaillée.

---

## 📝 SCRIPT COMPLET DE TEST

Voici un script pour tester tous les endpoints principaux d'un coup :

```powershell
# Variables
$BASE_URL = "http://localhost:4000/api"
$EMAIL = "analyst@soc.local"
$PASSWORD = "SecurePass123!"

# 1. Health check
Write-Host "`n1️⃣ Health Check..." -ForegroundColor Cyan
curl "$BASE_URL/health"

# 2. Login et récupération du token
Write-Host "`n2️⃣ Login..." -ForegroundColor Cyan
$response = curl -X POST "$BASE_URL/auth/login" `
  -H "Content-Type: application/json" `
  -d "{`"email`":`"$EMAIL`",`"password`":`"$PASSWORD`"}" | ConvertFrom-Json

$TOKEN = $response.token
Write-Host "Token obtenu: $TOKEN"

# 3. Queue status
Write-Host "`n3️⃣ Queue Status..." -ForegroundColor Cyan
curl "$BASE_URL/collection/queue/status" `
  -H "Authorization: Bearer $TOKEN"

# 4. Déclencher collecte
Write-Host "`n4️⃣ Déclencher collecte..." -ForegroundColor Cyan
curl -X POST "$BASE_URL/collection/trigger" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d "{`"sources`":[`"taranis`"]}"

# 5. Attendre et vérifier
Write-Host "`n5️⃣ Attente 15 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n6️⃣ Vérification finale..." -ForegroundColor Cyan
curl "$BASE_URL/collection/queue/status" `
  -H "Authorization: Bearer $TOKEN"
```

**Sauvegardez** ce script dans `test-endpoints.ps1` et exécutez-le !

---

## ✅ CHECKLIST DE TEST

- [ ] Health check fonctionne
- [ ] Login réussit et token obtenu
- [ ] Queue status accessible
- [ ] Collecte déclenchée avec succès
- [ ] Taranis endpoints accessibles
- [ ] STIX endpoints testés
- [ ] TAXII discovery fonctionne
- [ ] MISP config accessible
- [ ] CVE search fonctionne
- [ ] OSINT feeds listés
- [ ] Dark Web endpoints OK
- [ ] Honeypot endpoints OK
- [ ] Threat Feeds OK

---

## 📚 RESSOURCES

- **Documentation API** : `http://localhost:4000/api-docs` (Swagger)
- **Code source** : `backend/src/routes/`
- **Logs backend** : Console où `npm run dev` tourne

---

**Bonne exploration ! 🚀**



