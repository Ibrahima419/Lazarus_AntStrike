# 🚀 DÉMARRAGE SERVICE 1 - Commandes Exactes

**Objectif :** Faire fonctionner le Service 1 en **10 minutes**  
**Date :** 20 Octobre 2025

---

## ✅ CE QUI A ÉTÉ IMPLÉMENTÉ

```
✅ 10 nouveaux fichiers créés dans backend/
✅ Architecture moderne event-driven
✅ Queue BullMQ configurée
✅ 6 nouveaux endpoints API
✅ Schedulers automatiques
✅ Scripts de test
```

---

## 🔧 ÉTAPE 1 : INSTALLER REDIS (5 minutes)

### Option A : Docker (Le plus simple)

```powershell
# Windows PowerShell
docker pull redis:7-alpine
docker run -d -p 6379:6379 --name antstrike-redis redis:7-alpine

# Vérifier
docker ps | findstr redis
```

### Option B : Upstash Cloud (Gratuit)

```
1. Aller sur: https://upstash.com
2. Créer compte (GitHub login)
3. Create Database → Redis
4. Copier "REDIS_URL"
5. Ajouter dans backend/.env:
   REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
```

### Tester Redis

```powershell
# Si Docker local
docker exec -it antstrike-redis redis-cli ping
# Doit afficher: PONG

# Si Upstash, tester depuis backend:
cd backend
npm run test-redis
```

---

## 🔧 ÉTAPE 2 : CONFIGURATION .env (2 minutes)

Ouvrez `backend/.env` et ajoutez/vérifiez :

```bash
# Redis (OBLIGATOIRE pour Queue)
REDIS_URL=redis://localhost:6379

# Taranis (Déjà configuré normalement)
TARANIS_API_URL=http://localhost:8080
TARANIS_USERNAME=admin
TARANIS_PASSWORD=admin

# Collection
ENABLE_COLLECTION_SCHEDULER=true

# Database (Déjà configuré)
DATABASE_URL=postgresql://...
```

---

## 🔧 ÉTAPE 3 : INSTALLER DÉPENDANCES (1 minute)

```powershell
cd backend

# Vérifier que BullMQ est dans package.json
npm list bullmq
# Si pas installé:
npm install bullmq ioredis

# Rebuild TypeScript
npm run build
```

---

## 🚀 ÉTAPE 4 : DÉMARRER LE BACKEND (1 minute)

```powershell
cd backend
npm run dev
```

### Logs Attendus (Succès) ✅

```
✅ Collection schedulers enabled
✅ Full collection scheduled (every 6 hours)
✅ Taranis collection scheduled (every hour)
✅ Queue cleaning scheduled (daily at 2:00 AM)
✅ Collection worker ready
🚀 AntStrike Backend listening on port 4000
   Environment: development
   Frontend URL: http://localhost:3000
   Taranis API: http://localhost:8080
   Collection Worker: Active ✅
```

### Si Erreurs ❌

**Erreur : "Cannot connect to Redis"**
```powershell
# Vérifier Redis
docker ps | findstr redis

# Si pas running:
docker start antstrike-redis
```

**Erreur : "Module bullmq not found"**
```powershell
npm install bullmq ioredis
```

**Erreur : "Taranis connection failed"**
```powershell
# Vérifier Taranis
curl http://localhost:8080/api/isalive

# Si down, pas grave, collecte continuera sans Taranis
```

---

## 🧪 ÉTAPE 5 : TESTER (1 minute)

### Test Automatique (Recommandé)

```powershell
cd backend
.\test-collection-service.ps1
```

**Résultat attendu :**
```
1️⃣  Testing Health Check...
✅ Backend is healthy

2️⃣  Logging in...
✅ Login successful

3️⃣  Checking Collection Health...
✅ Collection sources healthy

4️⃣  Checking Queue Status...
{
  "waiting": 0,
  "active": 0,
  "completed": 0
}

5️⃣  Triggering Manual Collection...
⏳ This may take 30s-2min...
✅ Collection triggered successfully

📊 Collection Stats:
   Items Collected: 45
   Items Queued: 45
   Success Rate: 100%
   Duration: 3245ms

6️⃣  Getting Collection Stats...
✅ Stats retrieved

7️⃣  Checking Recent Threats...
Total threats: 15
✅ Threats collected successfully

🎉 TEST COMPLET TERMINÉ
✅ Tous les tests passés !
```

### Test Manuel (Alternatif)

```powershell
# 1. Health check
curl http://localhost:4000/api/collection/health

# 2. Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body '{"email":"admin@test.com","password":"password"}' -ContentType "application/json"
$TOKEN = $loginResponse.token

# 3. Trigger collection
Invoke-RestMethod -Uri "http://localhost:4000/api/collection/trigger" -Method Post -Headers @{"Authorization"="Bearer $TOKEN"}
```

---

## 📊 ÉTAPE 6 : VÉRIFIER RÉSULTATS (2 minutes)

### Option 1 : Prisma Studio (UI)

```powershell
cd backend
npm run prisma:studio
# Ouvre: http://localhost:5555

# Naviguer vers table: threats
# Vous devriez voir les threats collectés
```

### Option 2 : API

```powershell
# Liste threats
curl http://localhost:4000/api/threats?limit=10 -H "Authorization: Bearer $TOKEN"

# Stats
curl http://localhost:4000/api/collection/stats -H "Authorization: Bearer $TOKEN"
```

### Option 3 : Logs

```powershell
# Logs en temps réel
Get-Content backend/logs/combined.log -Tail 50 -Wait

# Chercher:
# ✅ Job completed
# ✅ Threat created
# ✅ Collection completed
```

---

## 🎯 CHECKLIST COMPLÈTE

```
Préparation:
□ Redis installé (Docker ou Upstash)
□ .env configuré (REDIS_URL)
□ Dependencies installées (npm install)

Démarrage:
□ Redis running (docker ps)
□ Backend démarré (npm run dev)
□ Logs montrent "Collection worker ready"

Test:
□ Script test exécuté (test-collection-service.ps1)
□ Collection triggered avec succès
□ Threats créés dans DB

Validation:
□ Prisma Studio montre threats
□ API /api/threats retourne data
□ Queue stats montrent completed jobs
□ Pas d'erreurs dans logs/error.log
```

---

## 🔄 WORKFLOW QUOTIDIEN

### Collecte Automatique (Pas d'action requise)

```
✅ 00:00 - Collecte complète #1
✅ 06:00 - Collecte complète #2
✅ 12:00 - Collecte complète #3
✅ 18:00 - Collecte complète #4

+ Toutes les heures: Taranis rapid collection
```

### Monitoring (5 min/jour)

```powershell
# Matin (08:00):
# 1. Check stats
curl http://localhost:4000/api/collection/stats -H "Authorization: Bearer $TOKEN"

# 2. Check health
curl http://localhost:4000/api/collection/health -H "Authorization: Bearer $TOKEN"

# 3. Review recent threats (via Frontend)
# http://localhost:3000/threats
```

---

## 🎉 VOUS ÊTES PRÊT !

Si tous les tests passent, votre **Service 1 est opérationnel** ! 🚀

```
┌──────────────────────────────────────────┐
│  ✅ Service 1 : COLLECTE & AGRÉGATION    │
│     Status: PRODUCTION READY             │
│                                          │
│  Capacités:                              │
│  ├─ Collecte auto toutes les 6h         │
│  ├─ 4 sources (Taranis, MISP, OSINT)    │
│  ├─ Processing async (10 workers)       │
│  ├─ Déduplication intelligente          │
│  ├─ Scoring 0-100                       │
│  └─ APIs complètes                      │
│                                          │
│  Prêt pour vos clients SOC ! 🎯         │
└──────────────────────────────────────────┘
```

---

## 📞 BESOIN D'AIDE ?

### Logs

```powershell
# Voir erreurs
Get-Content backend/logs/error.log -Tail 50

# Voir tout
Get-Content backend/logs/combined.log -Tail 100 -Wait
```

### Debug Mode

```powershell
# .env
LOG_LEVEL=debug

# Redémarrer
npm run dev
```

### Support

Consultez :
- `backend/SERVICE_1_README.md` - Doc technique
- `backend/SERVICE_1_QUICK_START.md` - Guide rapide
- `SERVICE_1_IMPLEMENTATION_COMPLETE.md` - Vue d'ensemble

---

**🛡️ AntStrike CTI - Prêt à Collecter !**



