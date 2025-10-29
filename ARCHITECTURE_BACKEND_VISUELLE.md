# 🏗️ ARCHITECTURE BACKEND - Vue Visuelle

**Date :** 20 Octobre 2025  
**Projet :** AntStrike CTI Backend  
**Version :** 4.0.0

---

## 📐 ARCHITECTURE ACTUELLE

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Frontend │  │  Mobile  │  │   CLI    │  │ Webhook  │       │
│  │  React   │  │   App    │  │   Tool   │  │ Consumer │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
                      ▼
        ┌─────────────────────────────────┐
        │     API GATEWAY / NGINX         │
        │  - Rate Limiting                │
        │  - Load Balancing               │
        │  - SSL Termination              │
        └─────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS SERVER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARES                           │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │  │
│  │  │ Helmet │ │  CORS  │ │  JWT   │ │ Logger │           │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     ROUTES (23)                          │  │
│  │  /api/auth  /api/threats  /api/alerts  /api/cases       │  │
│  │  /api/ioc   /api/playbooks  /api/correlation            │  │
│  │  /api/taranis  /api/stix  /api/misp  /api/cve           │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                           │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │                CONTROLLERS (27)                          │  │
│  │  Validation → Business Logic → Response                  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                           │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │                  SERVICES (46)                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │  │
│  │  │IOC Enrichment│ │   Alerting   │  │Case Management │ │  │
│  │  └─────────────┘  └──────────────┘  └────────────────┘ │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │  │
│  │  │ Correlation │  │   Playbook   │  │   Reporting    │ │  │
│  │  └─────────────┘  └──────────────┘  └────────────────┘ │  │
│  └──────────────────┬───────────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌────────────────┐          ┌────────────────┐
│   PostgreSQL   │          │  External APIs │
│  (Prisma ORM)  │          │  - VirusTotal  │
│   40+ Tables   │          │  - AbuseIPDB   │
│  Multi-Tenant  │          │  - IPInfo      │
└────────────────┘          │  - Taranis AI  │
                            └────────────────┘
```

---

## 🔄 FLUX DE DONNÉES - IOC Enrichment

### Scénario : Enrichir une adresse IP

```
┌─────────┐
│ Client  │ POST /api/ioc/enrich
│ Frontend│ { iocValue: "8.8.8.8", iocType: "IP" }
└────┬────┘
     │
     ▼
┌────────────────────────────────────────────────┐
│         Middleware Stack                       │
│  1. JWT Validation ✓                           │
│  2. Tenant Extraction (tenantId)               │
│  3. Rate Limiting (100 req/min)                │
│  4. Input Validation (Zod schema)              │
└────┬────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────┐
│         IOC Controller                         │
│  - Log request                                 │
│  - Call IOCEnrichmentService                   │
└────┬────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────┐
│      IOCEnrichmentService.enrich()             │
│                                                │
│  1. Check Cache (Redis - 24h TTL)             │
│     ├─ HIT  → Return cached data (50ms) ✓     │
│     └─ MISS → Continue to step 2               │
│                                                │
│  2. Parallel API Calls:                        │
│     ┌─────────────────────────────────────┐   │
│     │ AbuseIPDB API                       │   │
│     │ GET /api/v2/check?ipAddress=8.8.8.8│   │
│     │ Response: {                         │   │
│     │   abuseConfidenceScore: 0,          │   │
│     │   usageType: "Data Center",         │   │
│     │   isWhitelisted: true               │   │
│     │ }                                   │   │
│     └─────────────────────────────────────┘   │
│     ┌─────────────────────────────────────┐   │
│     │ IPInfo API                          │   │
│     │ GET /8.8.8.8                        │   │
│     │ Response: {                         │   │
│     │   country: "US",                    │   │
│     │   org: "Google LLC",                │   │
│     │   city: "Mountain View"             │   │
│     │ }                                   │   │
│     └─────────────────────────────────────┘   │
│                                                │
│  3. Aggregate Results:                         │
│     {                                          │
│       iocValue: "8.8.8.8",                     │
│       iocType: "IP",                           │
│       threatScore: 0,                          │
│       reputation: "clean",                     │
│       country: "US",                           │
│       org: "Google LLC",                       │
│       abuseConfidenceScore: 0,                 │
│       sources: ["AbuseIPDB", "IPInfo"]         │
│     }                                          │
│                                                │
│  4. Cache Result (Redis - 24h)                 │
│  5. Save to IOCHistory (PostgreSQL)            │
└────┬────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────┐
│         Response to Client                     │
│  Status: 200 OK                                │
│  Duration: 850ms (first call)                  │
│           75ms (cached)                        │
└────────────────────────────────────────────────┘
```

---

## 📦 SCHÉMA BASE DE DONNÉES

### Relations Principales

```
┌─────────────┐
│   Tenant    │ (1 tenant = 1 organisation)
└──────┬──────┘
       │
       ├──────┐
       │      │
       ▼      ▼
  ┌─────┐  ┌──────────┐
  │User │  │ Threats  │
  └─────┘  └────┬─────┘
                │
       ┌────────┼────────┐
       │        │        │
       ▼        ▼        ▼
  ┌────────┐ ┌──────┐ ┌──────────────┐
  │ Alerts │ │Cases │ │Correlations  │
  └────┬───┘ └───┬──┘ └──────────────┘
       │         │
       │    ┌────┼────┐
       │    │    │    │
       ▼    ▼    ▼    ▼
  ┌─────────────────────┐
  │   CaseToAlert       │ (Many-to-Many)
  │   CaseToThreat      │
  └─────────────────────┘
```

### Tables par Module

```
📊 CORE (6 tables)
├─ Tenant
├─ User
├─ TenantConfiguration
├─ AuditLog (à créer)
├─ Metric (à créer)
└─ Report

🔍 THREAT INTELLIGENCE (10 tables)
├─ Threat
├─ ThreatCorrelation
├─ ThreatActor
├─ Campaign
├─ TTP
├─ IOCHistory
├─ IOCRelationship
├─ STIXBundle
├─ MISPEvent
└─ CVEVulnerability

🚨 ALERTING & CASES (12 tables)
├─ Alert
├─ AlertNote
├─ AlertHistory
├─ Case
├─ CaseTimeline
├─ CaseNote
├─ CaseTask
├─ Evidence
├─ CaseToThreat
└─ CaseToAlert

🤖 AUTOMATION (5 tables)
├─ Rule
├─ Workflow
├─ Playbook
├─ PlaybookExecution
└─ PlaybookStepExecution

📡 DATA COLLECTION (5 tables)
├─ Feed
├─ OSINTFeed
├─ DarkWebItem
├─ HoneypotLog
└─ TAXIICollection

🔌 INTEGRATIONS (1 table)
├─ Integration
```

---

## 🚀 FLUX - Création d'Alerte Automatique

### Détection → Alerte → Playbook → Notification

```
┌──────────────────────┐
│  1. TRIGGER EVENT    │
│  - IOC détecté       │
│  - Score > 70        │
│  - Type: Malware     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  2. AlertingService.createAlert()    │
│                                      │
│  const alert = {                     │
│    title: "Malware IOC Detected",    │
│    severity: "high",                 │
│    status: "open",                   │
│    priority: "P1",                   │
│    iocs: ["hash:abc123..."],         │
│    threatId: "threat-uuid",          │
│    slaResponseTime: 3600 // 1h       │
│  }                                   │
│                                      │
│  await prisma.alert.create(...)      │
└──────┬───────────────────────────────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌──────────────────┐      ┌────────────────────┐
│ 3a. Event Bus    │      │ 3b. Database       │
│ emit('alert:new')│      │ Alert créé         │
└──────┬───────────┘      │ AlertHistory créé  │
       │                  └────────────────────┘
       │
       ├──────┬──────┬──────┬───────┐
       │      │      │      │       │
       ▼      ▼      ▼      ▼       ▼
  ┌────────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌──────────┐
  │Playbook│ │Notify│ │Metrics │ │WebSock │ │Correlation│
  │Trigger │ │Email │ │Update  │ │Emit    │ │Auto      │
  └────┬───┘ └──────┘ └────────┘ └────────┘ └──────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 4. PlaybookEngine.execute()          │
│                                      │
│  Playbook: "alert_triage"            │
│                                      │
│  Steps:                              │
│  ┌────────────────────────────────┐ │
│  │ 1. Enrich all IOCs             │ │
│  │    → IOCEnrichmentService      │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 2. Check threat actor          │ │
│  │    → ThreatActorService        │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 3. Create case if critical     │ │
│  │    → CaseManagementService     │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 4. Assign to analyst           │ │
│  │    → User assignment           │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 5. Send Slack notification     │ │
│  │    → NotificationService       │ │
│  └────────────────────────────────┘ │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────┐
│ 5. OUTPUTS           │
│ - Case créé          │
│ - Email envoyé       │
│ - Slack notifié      │
│ - WebSocket updated  │
│ - SLA timer started  │
└──────────────────────┘
```

**⏱️ Temps total :** 2-5 secondes

---

## 🔐 ARCHITECTURE SÉCURITÉ

### Multi-Tenancy & Isolation

```
┌─────────────────────────────────────────────────┐
│              Request Pipeline                   │
└─────────────────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────┐
│  1. JWT Token Extraction                         │
│                                                  │
│  Authorization: Bearer eyJhbGc...               │
│                                                  │
│  Decoded: {                                      │
│    userId: "user-123",                           │
│    tenantId: "tenant-abc",  ← CRUCIAL            │
│    role: "analyst",                              │
│    exp: 1697800000                               │
│  }                                               │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│  2. Tenant Context Injection                     │
│                                                  │
│  req.user = decoded                              │
│  req.tenantId = decoded.tenantId                 │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│  3. Database Query Filtering                     │
│                                                  │
│  ❌ DANGEREUX:                                   │
│  const alerts = await prisma.alert.findMany()    │
│                                                  │
│  ✅ CORRECT:                                     │
│  const alerts = await prisma.alert.findMany({    │
│    where: { tenantId: req.tenantId }  ← TOUJOURS │
│  })                                              │
└──────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  4. Row-Level Security Check                    │
│                                                 │
│  GET /api/alerts/alert-xyz                      │
│                                                 │
│  const alert = await prisma.alert.findUnique({  │
│    where: { id: "alert-xyz" }                   │
│  })                                             │
│                                                 │
│  if (alert.tenantId !== req.tenantId) {         │
│    throw new ForbiddenError()  // 403           │
│  }                                              │
└─────────────────────────────────────────────────┘
```

### Middleware Chain

```
Request
  │
  ├─► 1. Helmet                (Security headers)
  │      ├─ Content-Security-Policy
  │      ├─ X-Frame-Options: DENY
  │      └─ X-XSS-Protection
  │
  ├─► 2. CORS                  (Cross-origin)
  │      ├─ Allowed origins: [frontend URLs]
  │      └─ Credentials: true
  │
  ├─► 3. Rate Limiting         (100 req/min)
  │      ├─ Per IP
  │      ├─ Per Tenant
  │      └─ Per API Key
  │
  ├─► 4. Body Parser           (JSON/URL-encoded)
  │      └─ Size limit: 10MB
  │
  ├─► 5. JWT Authentication    (Protected routes)
  │      ├─ Token validation
  │      ├─ Expiry check
  │      └─ User/Tenant extraction
  │
  ├─► 6. Request Logging       (Winston)
  │      ├─ Method, URL, IP
  │      ├─ User, Tenant
  │      └─ Response time
  │
  └─► 7. Route Handler         (Controller)
```

---

## ⚡ ARCHITECTURE PERFORMANCE

### Stratégie de Cache (à implémenter)

```
┌─────────────────────────────────────────────────┐
│                CLIENT REQUEST                   │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           L1 Cache - Memory (ms)                │
│  - Config tenant (1h TTL)                       │
│  - User permissions (15min TTL)                 │
│  - Frequently accessed data                     │
│                                                 │
│  Hit Rate Target: 95%                           │
└─────────────────┬───────────────────────────────┘
                  │ MISS
┌─────────────────▼───────────────────────────────┐
│           L2 Cache - Redis (10-50ms)            │
│  - IOC enrichment (24h TTL)                     │
│  - Threat correlations (1h TTL)                 │
│  - API responses (configurable)                 │
│  - Session data                                 │
│                                                 │
│  Hit Rate Target: 80%                           │
└─────────────────┬───────────────────────────────┘
                  │ MISS
┌─────────────────▼───────────────────────────────┐
│           Database - PostgreSQL (50-200ms)      │
│  - Indexed queries                              │
│  - Connection pooling (max 20)                  │
│  - Read replicas (future)                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           External APIs (500-2000ms)            │
│  - VirusTotal                                   │
│  - AbuseIPDB                                    │
│  - IPInfo                                       │
│                                                 │
│  ⚠️ Rate limited, cache OBLIGATOIRE             │
└─────────────────────────────────────────────────┘
```

### Query Optimization

```sql
-- ❌ LENT (N+1 queries)
SELECT * FROM alerts WHERE tenant_id = 'abc';
-- 100 alerts returned
-- Then for each alert:
SELECT * FROM threats WHERE id = alert.threat_id; -- ×100
SELECT * FROM cases WHERE id = ... -- ×100

-- ✅ RAPIDE (1 query avec joins)
SELECT 
  a.*,
  t.id as threat_id, t.name as threat_name,
  c.id as case_id, c.title as case_title
FROM alerts a
LEFT JOIN threats t ON a.threat_id = t.id
LEFT JOIN case_alerts ca ON a.id = ca.alert_id
LEFT JOIN cases c ON ca.case_id = c.id
WHERE a.tenant_id = 'abc'
LIMIT 100;
```

### Background Jobs Architecture

```
┌──────────────────────────────────────────────────┐
│            API Request (sync)                    │
│  POST /api/ioc/bulk-enrich                       │
│  { iocs: [1000 IOCs] }                           │
│                                                  │
│  Response (immediate):                           │
│  { jobId: "job-123", status: "queued" }          │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│         BullMQ Queue (Redis-backed)              │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ Job 1: enrich IP 1.2.3.4    [pending]     │ │
│  │ Job 2: enrich Hash abc...   [pending]     │ │
│  │ Job 3: enrich Domain x.com  [active]      │ │
│  │ Job 4: enrich IP 5.6.7.8    [active]      │ │
│  │ ...                                        │ │
│  │ Job 1000: enrich URL ...    [pending]     │ │
│  └────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│        Worker Pool (10 concurrent workers)       │
│                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Worker 1 │ │Worker 2 │ │Worker 3 │ ... × 10  │
│  │ BUSY    │ │ BUSY    │ │ IDLE    │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                  │
│  Processing:                                     │
│  - Fetch IOC from queue                          │
│  - Call enrichment APIs                          │
│  - Store result in DB                            │
│  - Mark job as completed                         │
│  - Emit WebSocket update                         │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│            Results Storage                       │
│                                                  │
│  Database: IOCHistory table                      │
│  Cache: Redis (for quick retrieval)              │
│  WebSocket: Real-time updates to client          │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│          Client Polling (or WebSocket)           │
│  GET /api/jobs/job-123/status                    │
│                                                  │
│  {                                               │
│    jobId: "job-123",                             │
│    status: "processing",                         │
│    progress: 45,   // 450/1000 completed         │
│    completedJobs: 450,                           │
│    totalJobs: 1000                               │
│  }                                               │
└──────────────────────────────────────────────────┘
```

**⚡ Avantages :**
- API response immédiate (50ms)
- Processing asynchrone
- Retry automatique si échec
- Scalable (add more workers)
- Rate limiting respecté

---

## 🔄 ARCHITECTURE ÉVOLUÉE (FUTURE)

### Microservices Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     API GATEWAY                            │
│  - Kong / Traefik / Custom Express                         │
│  - Authentication centralisée                              │
│  - Rate limiting global                                    │
│  - Request routing                                         │
│  - Load balancing                                          │
└───────────────────┬────────────────────────────────────────┘
                    │
     ┌──────────────┼──────────────┬─────────────┐
     │              │              │             │
     ▼              ▼              ▼             ▼
┌─────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐
│  Auth   │  │    IOC    │  │ Alerting │  │  Cases   │
│ Service │  │  Service  │  │ Service  │  │ Service  │
│         │  │           │  │          │  │          │
│ - Login │  │ - Enrich  │  │ - Create │  │ - Manage │
│ - JWT   │  │ - Cache   │  │ - SLA    │  │ - Tasks  │
│ - RBAC  │  │ - History │  │ - Notify │  │ - Notes  │
└────┬────┘  └─────┬─────┘  └────┬─────┘  └────┬─────┘
     │            │              │             │
     └────────────┼──────────────┼─────────────┘
                  │              │
     ┌────────────┼──────────────┼────────────┐
     │            │              │            │
     ▼            ▼              ▼            ▼
┌────────────────────────────────────────────────┐
│              MESSAGE BUS (Kafka/RabbitMQ)      │
│                                                │
│  Topics:                                       │
│  - alert.created                               │
│  - ioc.enriched                                │
│  - threat.detected                             │
│  - case.updated                                │
└───────────────┬────────────────────────────────┘
                │
     ┌──────────┼──────────┬─────────────┐
     │          │          │             │
     ▼          ▼          ▼             ▼
┌──────────┐ ┌───────┐ ┌─────────┐ ┌────────────┐
│Correlation│ │Playbook│ │Reporting│ │ Analytics  │
│  Service  │ │Service │ │ Service │ │  Service   │
│           │ │        │ │         │ │            │
│ - Auto    │ │ - SOAR │ │ - PDF   │ │ - Metrics  │
│ - ML      │ │ - Exec │ │ - CSV   │ │ - Trends   │
│ - Graph   │ │ - Workflow│ │ - HTML│ │ - Dashboard│
└─────┬─────┘ └───┬────┘ └────┬────┘ └─────┬──────┘
      │           │           │            │
      └───────────┴───────────┴────────────┘
                  │
     ┌────────────┼────────────┬─────────────┐
     │            │            │             │
     ▼            ▼            ▼             ▼
┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
│PostgreSQL│ │  Redis   │ │ Elastic│ │  MinIO   │
│ (OLTP)   │ │ (Cache)  │ │(Search)│ │ (Files)  │
└──────────┘ └──────────┘ └────────┘ └──────────┘
```

### Event-Driven avec Kafka

```
┌────────────────────────────────────────────────┐
│              KAFKA CLUSTER                     │
│                                                │
│  Topic: threats                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Message 1: {                             │ │
│  │   eventType: "threat.detected",          │ │
│  │   threatId: "threat-123",                │ │
│  │   severity: "high",                      │ │
│  │   iocs: [...],                           │ │
│  │   timestamp: "2025-10-20T10:30:00Z"      │ │
│  │ }                                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Consumers:                                    │
│  ┌────────────────┐                           │
│  │ Alerting Svc   │ → Create Alert            │
│  │ Correlation Svc│ → Auto-correlate          │
│  │ Analytics Svc  │ → Update metrics          │
│  │ Reporting Svc  │ → Generate report         │
│  │ Notification Svc│→ Send email              │
│  └────────────────┘                           │
└────────────────────────────────────────────────┘
```

**Avantages :**
- ✅ Scalabilité horizontale infinie
- ✅ Fault tolerance (un service down ≠ tout down)
- ✅ Deployment indépendant
- ✅ Technology flexibility
- ✅ Team autonomy

**Inconvénients :**
- ❌ Complexité opérationnelle
- ❌ Distributed tracing requis
- ❌ Data consistency challenges
- ❌ Infrastructure costs

---

## 📊 MONITORING & OBSERVABILITY

### Metrics Stack

```
┌────────────────────────────────────────────────┐
│            APPLICATION CODE                    │
│                                                │
│  logger.info('API call', { duration: 150 })    │
│  metrics.increment('api.requests', tags)       │
│  Sentry.captureException(error)                │
└───────────────┬────────────────────────────────┘
                │
     ┌──────────┼──────────┬─────────────┐
     │          │          │             │
     ▼          ▼          ▼             ▼
┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│ Winston │ │Prometheus│ │ Sentry │ │ Datadog │
│ (Logs)  │ │(Metrics) │ │(Errors)│ │ (APM)   │
└────┬────┘ └────┬─────┘ └────┬───┘ └────┬─────┘
     │           │            │          │
     ▼           ▼            ▼          ▼
┌─────────────────────────────────────────────────┐
│         Aggregation & Visualization             │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │          Grafana Dashboard              │   │
│  │  ┌──────────────┐  ┌─────────────────┐ │   │
│  │  │ API Latency  │  │ Error Rate      │ │   │
│  │  │ p50: 120ms   │  │ 0.05%           │ │   │
│  │  │ p95: 450ms   │  │ Stable ✓        │ │   │
│  │  │ p99: 1200ms  │  │                 │ │   │
│  │  └──────────────┘  └─────────────────┘ │   │
│  │  ┌──────────────┐  ┌─────────────────┐ │   │
│  │  │ Cache Hit    │  │ Queue Depth     │ │   │
│  │  │ 87%          │  │ 245 jobs        │ │   │
│  │  └──────────────┘  └─────────────────┘ │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │          Alerting Rules                 │   │
│  │  - API p95 > 2s → Slack alert           │   │
│  │  - Error rate > 1% → PagerDuty          │   │
│  │  - Queue depth > 1000 → Email           │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Distributed Tracing

```
User Request: GET /api/threats/threat-123
│
├─► Span 1: HTTP Request           [150ms total]
│   ├─► Span 2: JWT Validation     [5ms]
│   ├─► Span 3: Database Query     [80ms]
│   │   ├─► Span 4: Prisma Client  [75ms]
│   │   └─► Span 5: Postgres       [70ms]
│   ├─► Span 6: Enrichment API     [50ms]
│   │   └─► Span 7: VirusTotal     [45ms]
│   └─► Span 8: Response Format    [15ms]
```

---

## 🎯 CONCLUSION

Cette architecture backend est :

✅ **Solide** : Structure modulaire claire  
✅ **Scalable** : Multi-tenancy, cache, jobs  
✅ **Sécurisée** : JWT, RBAC, input validation  
✅ **Maintenable** : TypeScript, Prisma ORM, tests  

**Prochaines étapes recommandées :**

1. **Court terme (1 mois)** : Tests + Monitoring
2. **Moyen terme (3 mois)** : Performance + Cache
3. **Long terme (6 mois)** : Microservices

---

**🛡️ AntStrike CTI - Enterprise-Grade Threat Intelligence**

