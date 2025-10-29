# 🚀 SERVICE 1 : COLLECTE & AGRÉGATION - Quick Start

**Objectif :** Démarrer le service de collecte en 10 minutes  
**Date :** 20 Octobre 2025

---

## ✅ CE QUI A ÉTÉ CRÉÉ

### Nouveaux Services (6 fichiers)

```
backend/src/services/
├─ collection-orchestrator.service.ts  ⭐ Chef d'orchestre
├─ normalization-pipeline.service.ts   ⭐ Normalisation
├─ deduplication-engine.service.ts     ⭐ Déduplication
├─ threat-scorer.service.ts            ⭐ Scoring intelligent
├─ ioc-extractor.service.ts            ⭐ Extraction IOCs
└─ [existants: taranis, misp, osint, cve...]

backend/src/queues/
└─ collection.queue.ts                 ⭐ BullMQ Queue

backend/src/schedulers/
└─ collection.scheduler.ts             ⭐ Cron jobs

backend/src/controllers/
└─ collection.controller.ts            ⭐ API Controller

backend/src/routes/
└─ collection.routes.ts                ⭐ API Routes
```

---

## 🔧 CONFIGURATION NÉCESSAIRE

### 1. Variables d'Environnement

Ajoutez à votre `.env` :

```bash
# Redis (OBLIGATOIRE pour Queue)
REDIS_URL=redis://localhost:6379

# Taranis (Déjà configuré normalement)
TARANIS_API_URL=http://localhost:8080
TARANIS_USERNAME=admin
TARANIS_PASSWORD=admin

# MISP (Optionnel)
MISP_URL=https://misp.local
MISP_API_KEY=your-key

# Collection
ENABLE_COLLECTION_SCHEDULER=true
```

### 2. Installer Redis

**Option A: Docker (Recommandé)**
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**Option B: Local (Windows)**
```bash
# Télécharger depuis: https://github.com/microsoftarchive/redis/releases
# Ou utiliser WSL2
```

**Option C: Cloud (Upstash - Gratuit)**
```
1. Créer compte sur https://upstash.com
2. Créer database Redis
3. Copier REDIS_URL dans .env
```

---

## 🚀 DÉMARRAGE

### Étape 1 : Installer Dépendances (Si pas fait)

```bash
cd backend
npm install
```

**Dépendances nécessaires :** (Déjà dans package.json ✅)
- `bullmq` - Queue system
- `ioredis` - Redis client
- `node-cron` - Scheduler

### Étape 2 : Démarrer Redis

```bash
# Vérifier que Redis tourne
redis-cli ping
# Devrait répondre: PONG
```

### Étape 3 : Démarrer Backend

```bash
npm run dev
```

**Logs attendus :**
```
✅ Collection schedulers enabled
✅ Full collection scheduled (every 6 hours)
✅ Taranis collection scheduled (every hour)
✅ Queue cleaning scheduled (daily at 2:00 AM)
✅ Collection worker ready
🚀 AntStrike Backend listening on port 4000
   Collection Worker: Active
```

---

## 🧪 TESTER LE SERVICE 1

### Test 1 : Health Check

```bash
curl http://localhost:4000/api/collection/health
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "taranis": { "status": "healthy" },
    "misp": { "status": "healthy" },
    "osint": { "status": "healthy" },
    "queue": { "status": "healthy" }
  },
  "overall": "healthy"
}
```

### Test 2 : Déclencher Collecte Manuelle

```bash
# Login d'abord
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Copier le token
TOKEN="eyJhbGc..."

# Déclencher collecte
curl -X POST http://localhost:4000/api/collection/trigger \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Collection completed",
  "data": {
    "duration": "3245ms",
    "totalItemsCollected": 45,
    "totalItemsQueued": 45,
    "successRate": "100%",
    "results": [
      {
        "source": "Taranis",
        "status": "success",
        "itemsCollected": 23,
        "itemsQueued": 23
      },
      {
        "source": "MISP",
        "status": "success",
        "itemsCollected": 15,
        "itemsQueued": 15
      }
    ]
  }
}
```

### Test 3 : Vérifier Queue

```bash
curl http://localhost:4000/api/collection/queue/status \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "waiting": 5,
    "active": 10,
    "completed": 30,
    "failed": 0,
    "delayed": 0,
    "total": 15
  }
}
```

### Test 4 : Voir Threats Collectés

```bash
curl http://localhost:4000/api/threats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 WORKFLOW COMPLET

```
1. TRIGGER (Auto ou Manuel)
   ↓
2. ORCHESTRATOR
   ├─> Taranis API
   ├─> MISP API
   ├─> OSINT Feeds
   └─> CVE Feeds
   ↓
3. QUEUE (BullMQ)
   └─> 45 jobs créés
   ↓
4. WORKER (10 concurrent)
   ├─> Job 1: Normalize Taranis story
   ├─> Job 2: Normalize MISP event
   ├─> Job 3: Extract IOCs
   ├─> ...
   └─> Job 45: Score & Save
   ↓
5. PIPELINE (Pour chaque job)
   ├─ NORMALIZE    → Format unifié
   ├─ EXTRACT IOCs → IPs, Domains, etc.
   ├─ DEDUPLICATE  → Merge si existe
   ├─ SCORE        → Threat score 0-100
   └─ SAVE         → PostgreSQL (si score > 30)
   ↓
6. DATABASE
   └─> Threats table enrichie
```

---

## 🎯 ENDPOINTS DISPONIBLES

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/collection/trigger` | POST | Déclencher collecte complète |
| `/api/collection/trigger/:source` | POST | Collecter source spécifique |
| `/api/collection/stats` | GET | Stats de collecte |
| `/api/collection/queue/status` | GET | Statut de la queue |
| `/api/collection/history` | GET | Historique collecte |
| `/api/collection/health` | GET | Health check sources |

---

## 🔧 CONFIGURATION AVANCÉE

### Personnaliser le Scheduler

Éditez `backend/src/schedulers/collection.scheduler.ts` :

```typescript
// Collecte complète
cron.schedule('0 */6 * * *', ...);  // Toutes les 6h
// Modifier en:
cron.schedule('0 */2 * * *', ...);  // Toutes les 2h

// Collecte Taranis
cron.schedule('0 * * * *', ...);    // Toutes les heures
// Modifier en:
cron.schedule('*/30 * * * *', ...); // Toutes les 30 min
```

### Ajuster Scoring Threshold

Éditez `backend/src/queues/collection.queue.ts` :

```typescript
// Ligne ~85
if (scored.threatScore >= 30) { // Threshold
  // Changer en:
  if (scored.threatScore >= 50) { // Plus sélectif
```

### Augmenter Workers

Éditez `backend/src/queues/collection.queue.ts` :

```typescript
// Ligne ~110
concurrency: 10, // 10 workers
// Changer en:
concurrency: 20, // 20 workers (si machine puissante)
```

---

## 📊 MONITORING

### Vérifier Logs

```bash
# Logs en temps réel
npm run dev

# Chercher logs de collecte
grep "collection" logs/combined.log

# Chercher erreurs
grep "ERROR" logs/error.log
```

### Dashboard Redis (BullMQ Board)

```bash
# Installer BullMQ Board
npm install -g bullmq-board

# Lancer
bullmq-board
# Ouvrir: http://localhost:3000
```

### Métriques Prisma Studio

```bash
npm run prisma:studio
# Ouvrir: http://localhost:5555
# Voir table: threats
```

---

## 🐛 TROUBLESHOOTING

### Erreur: "Redis connection failed"

```bash
# Vérifier Redis
redis-cli ping

# Si pas de réponse:
docker start redis
# ou
redis-server
```

### Erreur: "Taranis authentication failed"

```bash
# Vérifier Taranis est up
curl http://localhost:8080/api/isalive

# Tester login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### Queue bloquée (jobs stuck)

```bash
# Nettoyer la queue via API
curl -X DELETE http://localhost:4000/api/collection/queue/clean \
  -H "Authorization: Bearer $TOKEN"
```

### Pas de threats collectés

```bash
# 1. Vérifier logs worker
# Chercher: "Threat filtered out"

# 2. Baisser threshold
# Dans collection.queue.ts:
if (scored.threatScore >= 10) { // Au lieu de 30

# 3. Vérifier Taranis a des stories
curl http://localhost:8080/api/assess/stories \
  -H "Authorization: Bearer $TARANIS_TOKEN"
```

---

## 📈 PERFORMANCE ATTENDUE

```
┌──────────────────────────────────────────┐
│ Collecte complète (6h)                   │
├──────────────────────────────────────────┤
│ Sources:       4 (Taranis, MISP, OSINT)  │
│ Items bruts:   ~200                      │
│ Items queued:  200                       │
│ Processing:    2-5 minutes               │
│ Threats sauvés: ~50-80 (après filtrage)  │
│ Doublons:      ~20-30%                   │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Performance Worker                       │
├──────────────────────────────────────────┤
│ Job duration:  500-1500ms                │
│ Throughput:    40-60 jobs/min            │
│ Success rate:  95%+                      │
│ Retry rate:    < 5%                      │
└──────────────────────────────────────────┘
```

---

## 🎯 PROCHAINES ÉTAPES

### Maintenant (Jour 1)
1. ✅ Démarrer Redis
2. ✅ Tester health check
3. ✅ Déclencher collecte manuelle
4. ✅ Vérifier threats dans DB

### Cette Semaine
1. ⏳ Configurer feeds OSINT supplémentaires
2. ⏳ Ajuster scoring threshold
3. ⏳ Monitorer performance
4. ⏳ Créer dashboard Grafana

### Ce Mois
1. 📅 Ajouter sources Dark Web
2. 📅 Connecter honeypots
3. 📅 Implémenter ML scoring
4. 📅 A/B testing des thresholds

---

## 📚 DOCUMENTATION TECHNIQUE

### Architecture Détaillée
Voir: `ARCHITECTURE_SAAS_6_SERVICES_CORE.md`

### Code Source
- **Orchestrator:** `src/services/collection-orchestrator.service.ts`
- **Queue:** `src/queues/collection.queue.ts`
- **Pipeline:** `src/services/normalization-pipeline.service.ts`
- **Scorer:** `src/services/threat-scorer.service.ts`

---

## ✅ CHECKLIST DE VALIDATION

```
□ Redis installé et running
□ Taranis accessible (localhost:8080)
□ Backend démarré sans erreurs
□ Health check retourne "healthy"
□ Collecte manuelle fonctionne
□ Threats créés dans DB
□ Queue processing visible dans logs
□ Worker traite jobs avec succès
□ Pas d'erreurs dans logs/error.log
□ Dashboard Prisma montre données
```

---

**🛡️ AntStrike CTI - Service 1 Ready!**



