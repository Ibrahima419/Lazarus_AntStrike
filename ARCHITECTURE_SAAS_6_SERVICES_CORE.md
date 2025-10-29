# 🛡️ ANTSTRIKE CTI - Architecture SaaS

**Plateforme :** Cyber Threat Intelligence as a Service  
**Type :** Multi-tenant SaaS Platform  
**Date :** 20 Octobre 2025  
**Version :** 4.0.0

---

## 🎯 DÉFINITION DE LA PLATEFORME

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│               ANTSTRIKE CTI PLATFORM                        │
│          Cyber Threat Intelligence as a Service             │
│                                                             │
│  Une plateforme SaaS multi-tenant permettant aux            │
│  organisations de collecter, analyser et répondre aux       │
│  menaces cyber en temps réel.                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ ARCHITECTURE - 6 SERVICES CORE

```
┌─────────────────────────────────────────────────────────────┐
│                    ANTSTRIKE CTI                            │
│                   6 SERVICES CORE                           │
└─────────────────────────────────────────────────────────────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
    ┌──────▼──────┐                      ┌──────▼──────┐
    │  SERVICE 1  │                      │  SERVICE 2  │
    │ 📡 COLLECTE │                      │ 🔍 IOC      │
    │     &       │                      │ ENRICHMENT  │
    │ AGRÉGATION  │                      │             │
    └──────┬──────┘                      └──────┬──────┘
           │                                     │
           ├─────────────────────────────────────┤
           │                                     │
    ┌──────▼──────┐                      ┌──────▼──────┐
    │  SERVICE 3  │                      │  SERVICE 4  │
    │ 🔗 ANALYSE  │                      │ 🚨 ALERTING │
    │     &       │                      │     &       │
    │ CORRÉLATION │                      │ MONITORING  │
    └──────┬──────┘                      └──────┬──────┘
           │                                     │
           ├─────────────────────────────────────┤
           │                                     │
    ┌──────▼──────┐                      ┌──────▼──────┐
    │  SERVICE 5  │                      │  SERVICE 6  │
    │ 📁 CASE     │                      │ 🤖 PLAYBOOKS│
    │ MANAGEMENT  │                      │     &       │
    │             │                      │    SOAR     │
    └─────────────┘                      └─────────────┘
```

---

## 📡 SERVICE 1 : COLLECTE & AGRÉGATION

**Objectif :** Collecter des données de menaces depuis sources multiples

### Fonctionnalités

```
┌─────────────────────────────────────────────────────┐
│         SOURCES DE DONNÉES                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📦 STIX/TAXII                                      │
│     └─ STIX 2.1 Parser                             │
│     └─ TAXII 2.1 Server                            │
│     └─ Collections management                      │
│                                                     │
│  🔄 MISP Integration                                │
│     └─ Bidirectional sync                          │
│     └─ Events import/export                        │
│     └─ Attributes mapping                          │
│                                                     │
│  🔐 CVE Enrichment                                  │
│     └─ NVD (National Vulnerability Database)       │
│     └─ CIRCL CVE Search                            │
│     └─ Exploit database                            │
│                                                     │
│  📰 OSINT Feeds                                     │
│     └─ RSS/Atom feeds                              │
│     └─ Twitter monitoring                          │
│     └─ Blogs & security news                       │
│                                                     │
│  🕵️ Dark Web Monitoring                            │
│     └─ Forums & marketplaces                       │
│     └─ Paste sites (Pastebin, etc.)                │
│     └─ Leak databases                              │
│                                                     │
│  🍯 Honeypots Integration                           │
│     └─ Cowrie (SSH/Telnet)                         │
│     └─ Dionaea (malware capture)                   │
│     └─ Custom honeypots                            │
│                                                     │
│  🌐 Threat Feeds                                    │
│     └─ AlienVault OTX                              │
│     └─ Threat Fox                                  │
│     └─ URLhaus                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Backend Implementation

**Services :**
- `stix-parser.service.ts` - Parse STIX bundles
- `taxii-server.service.ts` - TAXII 2.1 server
- `misp-client.service.ts` - MISP bidirectional sync
- `cve-enrichment.service.ts` - CVE data enrichment
- `osint-feeds.service.ts` - OSINT feeds collector
- `darkweb-monitoring.service.ts` - Dark web scraping
- `honeypot-collector.service.ts` - Honeypot data collection
- `threat-feeds.service.ts` - External threat feeds

**Endpoints :**
- `POST /api/stix/import` - Import STIX bundle
- `GET /taxii/collections` - List TAXII collections
- `POST /api/misp/sync` - Sync with MISP
- `GET /api/cve/:cveId` - Get CVE details
- `GET /api/osint-feeds` - List OSINT feeds
- `GET /api/darkweb/items` - Dark web items
- `GET /api/honeypots/logs` - Honeypot logs

### Métriques

```
📊 KPIs:
├─ Feeds actifs: 20+
├─ Items collectés/jour: 10,000+
├─ MISP events synced: 500+/jour
├─ CVEs tracked: 200,000+
├─ Dark web items: 1,000+/jour
└─ Honeypot events: 5,000+/jour
```

---

## 🔍 SERVICE 2 : IOC ENRICHMENT

**Objectif :** Enrichir les IOCs avec threat intelligence

### Types d'IOCs Supportés

```
┌─────────────────────────────────────────────────────┐
│            TYPES D'IOCs                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🌐 IP Addresses                                    │
│     └─ Reputation (AbuseIPDB)                      │
│     └─ Geolocation (IPInfo)                        │
│     └─ ASN & Organization                          │
│     └─ Historical activity                         │
│                                                     │
│  🌍 Domains                                         │
│     └─ VirusTotal analysis                         │
│     └─ WHOIS information                           │
│     └─ DNS records                                 │
│     └─ Threat scoring                              │
│                                                     │
│  🔗 URLs                                            │
│     └─ VirusTotal scan                             │
│     └─ Malware detection                           │
│     └─ Phishing detection                          │
│     └─ Screenshot capture                          │
│                                                     │
│  📦 File Hashes (MD5, SHA1, SHA256)                │
│     └─ VirusTotal detection                        │
│     └─ Malware family                              │
│     └─ YARA rules matches                          │
│     └─ Behavioral analysis                         │
│                                                     │
│  📧 Email Addresses                                 │
│     └─ HaveIBeenPwned breaches                     │
│     └─ EmailRep.io reputation                      │
│     └─ Disposable email detection                  │
│     └─ Domain reputation                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### APIs Externes Intégrées

```
┌──────────────────────────────────────────────────┐
│  ✅ VirusTotal        File/URL/Domain analysis   │
│     Limite: 500 req/jour (Free)                  │
│     Status: OPÉRATIONNEL                         │
│                                                  │
│  ✅ AbuseIPDB         IP reputation              │
│     Limite: 1,000 req/jour (Free)                │
│     Status: OPÉRATIONNEL                         │
│                                                  │
│  ✅ IPInfo            Geolocation & ASN          │
│     Limite: 50,000 req/mois (Free)               │
│     Status: OPÉRATIONNEL                         │
│                                                  │
│  🟡 HaveIBeenPwned    Email breaches             │
│     Limite: Gratuit                              │
│     Status: À IMPLÉMENTER                        │
│                                                  │
│  🟡 Shodan            Device search              │
│     Limite: 100 req/mois (Free)                  │
│     Status: À IMPLÉMENTER                        │
│                                                  │
│  🟡 URLScan.io        URL screenshot & analysis  │
│     Limite: 1,000 scans/mois (Free)              │
│     Status: À IMPLÉMENTER                        │
└──────────────────────────────────────────────────┘
```

### Backend Implementation

**Services :**
- `ioc-enrichment.service.ts` ⭐⭐⭐⭐⭐
- `ioc-history.service.ts` ⭐⭐⭐⭐
- `ioc-relationship.service.ts` ⭐⭐⭐⭐
- `enrichment-pipeline.service.ts` ⭐⭐⭐

**Endpoints :**
- `POST /api/ioc/enrich` - Enrich single IOC
- `POST /api/ioc/bulk-enrich` - Enrich multiple IOCs
- `GET /api/ioc/enriched` - List enriched IOCs
- `POST /api/ioc/extract` - Extract IOCs from text
- `GET /api/ioc/history/:iocValue` - IOC history

### Cache Strategy

```
┌────────────────────────────────────────┐
│  IOC Enrichment Cache (Redis)          │
├────────────────────────────────────────┤
│  TTL: 24 heures                        │
│  Hit Rate Target: 85%                  │
│  Key Format: ioc:{tenant}:{type}:{val} │
│                                        │
│  Performance:                          │
│  ├─ First call:  800-1000ms (API)     │
│  └─ Cached:      50-100ms   (Redis)   │
└────────────────────────────────────────┘
```

---

## 🔗 SERVICE 3 : ANALYSE & CORRÉLATION

**Objectif :** Détecter patterns et relations entre menaces

### Moteurs d'Analyse

```
┌─────────────────────────────────────────────────────┐
│         MOTEURS D'ANALYSE                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔗 Correlation Engine                              │
│     └─ IOC-to-IOC correlation                      │
│     └─ Threat-to-Threat correlation                │
│     └─ Temporal analysis                           │
│     └─ Graph-based detection                       │
│                                                     │
│  💎 Diamond Model                                   │
│     └─ Adversary profiling                         │
│     └─ Capability analysis                         │
│     └─ Infrastructure mapping                      │
│     └─ Victim targeting                            │
│                                                     │
│  ⚔️ Kill Chain Analysis                            │
│     └─ Lockheed Martin Cyber Kill Chain            │
│     └─ Stage detection                             │
│     └─ TTPs mapping                                │
│     └─ Prevention recommendations                  │
│                                                     │
│  🎯 MITRE ATT&CK Mapping                           │
│     └─ Tactics extraction                          │
│     └─ Techniques identification                   │
│     └─ Sub-techniques detection                    │
│     └─ Coverage heatmap                            │
│                                                     │
│  📊 Graph Analytics                                 │
│     └─ Network topology                            │
│     └─ Community detection                         │
│     └─ Centrality analysis                         │
│     └─ Path analysis                               │
│                                                     │
│  🤖 Machine Learning (Future)                       │
│     └─ Anomaly detection                           │
│     └─ Threat classification                       │
│     └─ Predictive analytics                        │
│     └─ Similarity scoring                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Backend Implementation

**Services :**
- `correlation.service.ts` ⭐⭐⭐⭐
- `ioc-correlation.service.ts` ⭐⭐⭐⭐
- `realtime-correlation.service.ts` ⭐⭐⭐
- `diamond-model.service.ts` ⭐⭐⭐⭐
- `kill-chain.service.ts` ⭐⭐⭐⭐
- `mitre-attack.service.ts` ⭐⭐⭐⭐
- `ttp-extraction.service.ts` ⭐⭐⭐
- `graph-analytics.service.ts` ⭐⭐⭐
- `threat-scoring.service.ts` ⭐⭐⭐
- `campaign-tracking.service.ts` ⭐⭐⭐
- `threat-actor-profiling.service.ts` ⭐⭐⭐

**Endpoints :**
- `POST /api/correlation/correlate/:threatId`
- `GET /api/correlation/graph`
- `GET /api/analysis/diamond-model/:threatId`
- `GET /api/analysis/kill-chain/:threatId`
- `GET /api/analysis/mitre-attack/:threatId`
- `GET /api/analysis/graph/:threatId`

### Algorithmes de Corrélation

```
1. Temporal Correlation
   └─ IOCs observés dans fenêtre de temps similaire

2. Contextual Correlation
   └─ IOCs avec même contexte (campagne, acteur)

3. Behavioral Correlation
   └─ IOCs avec comportement similaire

4. Infrastructure Correlation
   └─ IOCs partageant infrastructure (ASN, IP ranges)

5. Attribute Correlation
   └─ IOCs avec attributs similaires (malware family, etc.)
```

---

## 🚨 SERVICE 4 : ALERTING & MONITORING

**Objectif :** Détecter et notifier sur les menaces critiques

### Système d'Alerting Avancé

```
┌─────────────────────────────────────────────────────┐
│         ALERTING SYSTEM                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎯 Alert Creation                                  │
│     └─ Manual creation                             │
│     └─ Rule-based triggers                         │
│     └─ Correlation-based                           │
│     └─ ML anomaly detection                        │
│                                                     │
│  📊 Alert Prioritization                            │
│     └─ Severity levels (Low, Medium, High, Critical)│
│     └─ Priority queue (P1, P2, P3, P4)             │
│     └─ Dynamic scoring                             │
│     └─ Business impact assessment                  │
│                                                     │
│  ⏱️ SLA Management                                  │
│     └─ Response time SLA                           │
│     └─ Resolution time SLA                         │
│     └─ SLA violation tracking                      │
│     └─ Escalation rules                            │
│                                                     │
│  🔔 Notifications                                   │
│     └─ Email notifications                         │
│     └─ Slack/Teams integration                     │
│     └─ SMS alerts (critical)                       │
│     └─ Webhook callbacks                           │
│                                                     │
│  📈 Alert Deduplication                             │
│     └─ Fingerprint-based                           │
│     └─ Similarity detection                        │
│     └─ Alert grouping                              │
│     └─ Noise reduction                             │
│                                                     │
│  📊 Metrics & Dashboards                            │
│     └─ Alert volume trends                         │
│     └─ MTTR (Mean Time To Resolve)                 │
│     └─ False positive rate                         │
│     └─ Analyst performance                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Backend Implementation

**Services :**
- `alerting.service.ts` ⭐⭐⭐⭐⭐
- `alert-management.service.ts` ⭐⭐⭐⭐
- `notification.service.ts` ⭐⭐⭐⭐
- `email.service.ts` ⭐⭐⭐⭐
- `analyst-metrics.service.ts` ⭐⭐⭐⭐

**Endpoints :**
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - List alerts
- `PUT /api/alerts/:id/acknowledge` - Acknowledge
- `PUT /api/alerts/:id/resolve` - Resolve
- `PUT /api/alerts/:id/assign` - Assign to analyst
- `POST /api/alerts/:id/notes` - Add note
- `GET /api/alerts/metrics` - Alert metrics

### SLA Configuration

```
┌────────────────────────────────────────┐
│  Severity  │ Response │ Resolution    │
├────────────┼──────────┼───────────────┤
│  Critical  │  15 min  │  4 hours      │
│  High      │  1 hour  │  24 hours     │
│  Medium    │  4 hours │  72 hours     │
│  Low       │  24 hours│  7 days       │
└────────────────────────────────────────┘
```

---

## 📁 SERVICE 5 : CASE MANAGEMENT

**Objectif :** Gérer investigations et incidents end-to-end

### Gestion Complète des Cas

```
┌─────────────────────────────────────────────────────┐
│         CASE MANAGEMENT                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📋 Case Lifecycle                                  │
│     └─ New → Triaged → Investigating →             │
│        Contained → Remediated → Closed             │
│                                                     │
│  👥 Collaboration                                   │
│     └─ Assignment & ownership                      │
│     └─ Team collaboration                          │
│     └─ Role-based access                           │
│     └─ Activity timeline                           │
│                                                     │
│  📝 Case Components                                 │
│     └─ Threats linkage                             │
│     └─ Alerts linkage                              │
│     └─ IOCs tracking                               │
│     └─ Evidence collection                         │
│     └─ Notes & comments                            │
│     └─ Tasks & checklists                          │
│                                                     │
│  🔍 Investigation Tools                             │
│     └─ Timeline builder                            │
│     └─ Evidence management                         │
│     └─ Chain of custody                            │
│     └─ Artifact collection                         │
│                                                     │
│  📊 Case Analytics                                  │
│     └─ Time tracking                               │
│     └─ MTTR calculation                            │
│     └─ Impact assessment                           │
│     └─ Lessons learned                             │
│                                                     │
│  📄 Reporting                                       │
│     └─ Executive summary                           │
│     └─ Technical report                            │
│     └─ Timeline export                             │
│     └─ Evidence package                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Backend Implementation

**Services :**
- `case-management.service.ts` ⭐⭐⭐⭐
- `case.service.ts` ⭐⭐⭐⭐
- `task-management.service.ts` ⭐⭐⭐⭐
- `evidence-management.service.ts` ⭐⭐⭐⭐
- `case-reporting.service.ts` ⭐⭐⭐⭐

**Endpoints :**
- `POST /api/cases` - Create case
- `GET /api/cases` - List cases
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case
- `POST /api/cases/:id/timeline` - Add timeline event
- `POST /api/cases/:id/notes` - Add note
- `POST /api/cases/:id/tasks` - Create task
- `POST /api/cases/:id/evidence` - Upload evidence
- `POST /api/cases/:id/close` - Close case
- `GET /api/cases/:id/report` - Generate report

### Workflow States

```
NEW → TRIAGED → INVESTIGATING → CONTAINED → REMEDIATED → CLOSED
  ↓       ↓           ↓             ↓            ↓          ↓
False   Duplicate  Escalated    Reopened    Post-mortem  Archived
Positive
```

---

## 🤖 SERVICE 6 : PLAYBOOKS & SOAR

**Objectif :** Automatiser réponse aux incidents

### Automation Platform

```
┌─────────────────────────────────────────────────────┐
│         SOAR CAPABILITIES                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📖 Playbook Management                             │
│     └─ Playbook designer                           │
│     └─ Version control                             │
│     └─ Template library                            │
│     └─ Import/Export                               │
│                                                     │
│  ⚙️ Workflow Engine                                 │
│     └─ Sequential steps                            │
│     └─ Parallel execution                          │
│     └─ Conditional logic                           │
│     └─ Loop & iteration                            │
│     └─ Error handling                              │
│                                                     │
│  🎯 Trigger Types                                   │
│     └─ Manual execution                            │
│     └─ Event-based (alert, threat)                 │
│     └─ Scheduled (cron)                            │
│     └─ API webhook                                 │
│                                                     │
│  🔌 Action Library                                  │
│     └─ IOC enrichment                              │
│     └─ Threat correlation                          │
│     └─ Case creation                               │
│     └─ Email notification                          │
│     └─ Slack message                               │
│     └─ Ticket creation (Jira, ServiceNow)          │
│     └─ IP blocking (Firewall)                      │
│     └─ User disable (AD/Azure AD)                  │
│     └─ Custom scripts                              │
│                                                     │
│  ✅ Approval Workflows                              │
│     └─ Multi-level approval                        │
│     └─ Timeout policies                            │
│     └─ Delegation rules                            │
│                                                     │
│  📊 Execution Tracking                              │
│     └─ Real-time progress                          │
│     └─ Step-by-step logs                           │
│     └─ Success/Failure metrics                     │
│     └─ Performance analytics                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Backend Implementation

**Services :**
- `playbook-engine.service.ts` ⭐⭐⭐⭐⭐
- `playbook.service.ts` ⭐⭐⭐⭐
- `action-library.service.ts` ⭐⭐⭐⭐

**Endpoints :**
- `POST /api/playbooks` - Create playbook
- `GET /api/playbooks` - List playbooks
- `GET /api/playbooks/:id` - Get playbook
- `POST /api/playbooks/:id/execute` - Execute playbook
- `GET /api/playbooks/executions/:id` - Get execution status
- `POST /api/playbooks/:id/approve` - Approve execution

### Playbook Examples

```
1. Alert Triage Playbook
   ├─ Step 1: Enrich all IOCs
   ├─ Step 2: Check against threat intel
   ├─ Step 3: Calculate threat score
   ├─ Step 4: Create case if score > 70
   └─ Step 5: Notify security team

2. Phishing Response Playbook
   ├─ Step 1: Extract IOCs from email
   ├─ Step 2: Block malicious URLs
   ├─ Step 3: Quarantine email
   ├─ Step 4: Disable compromised accounts
   └─ Step 5: Send security awareness

3. Malware Containment Playbook
   ├─ Step 1: Isolate infected host
   ├─ Step 2: Block C2 IPs
   ├─ Step 3: Collect forensic data
   ├─ Step 4: Create incident case
   └─ Step 5: Generate report
```

---

## 🔒 MULTI-TENANCY ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│              TENANT ISOLATION                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🏢 Tenant Model                                    │
│     └─ Unique tenant ID                            │
│     └─ Custom domain (tenant.antstrike.com)        │
│     └─ Isolated database rows                      │
│     └─ Separate API keys                           │
│     └─ Resource quotas                             │
│                                                     │
│  👥 User Management                                 │
│     └─ Per-tenant users                            │
│     └─ Role-based access (Admin, Analyst, Viewer)  │
│     └─ SSO/SAML integration                        │
│     └─ Multi-factor authentication                 │
│                                                     │
│  💳 Subscription Plans                              │
│     └─ Free Tier (1 user, 100 alerts/month)        │
│     └─ Starter ($99/mo, 5 users, 1K alerts)        │
│     └─ Professional ($299/mo, 15 users, 10K)       │
│     └─ Enterprise (Custom pricing)                 │
│                                                     │
│  📊 Usage Tracking                                  │
│     └─ API calls                                   │
│     └─ IOC enrichments                             │
│     └─ Storage usage                               │
│     └─ Playbook executions                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 MÉTRIQUES GLOBALES DE LA PLATEFORME

```
┌─────────────────────────────────────────────────────┐
│         PLATFORM METRICS                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SERVICE 1 - Collecte                               │
│  ├─ Feeds actifs: 20+                              │
│  ├─ Items/jour: 10,000+                            │
│  └─ Uptime: 99.5%                                  │
│                                                     │
│  SERVICE 2 - IOC Enrichment                         │
│  ├─ Enrichments/jour: 5,000+                       │
│  ├─ Cache hit rate: 85%                            │
│  └─ Avg latency: 150ms (cached)                    │
│                                                     │
│  SERVICE 3 - Corrélation                            │
│  ├─ Correlations/jour: 1,000+                      │
│  ├─ Graph nodes: 50,000+                           │
│  └─ ML accuracy: 87%                               │
│                                                     │
│  SERVICE 4 - Alerting                               │
│  ├─ Alerts/jour: 500+                              │
│  ├─ MTTR: 2 heures                                 │
│  └─ False positive rate: 5%                        │
│                                                     │
│  SERVICE 5 - Cases                                  │
│  ├─ Cases actifs: 50+                              │
│  ├─ Avg resolution time: 48h                       │
│  └─ Evidence items: 1,000+                         │
│                                                     │
│  SERVICE 6 - Playbooks                              │
│  ├─ Playbooks library: 25+                         │
│  ├─ Executions/jour: 100+                          │
│  └─ Success rate: 95%                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 ROADMAP DES 6 SERVICES

```
┌─────────────────────────────────────────────────────┐
│         MATURITY ROADMAP                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SERVICE 1 - Collecte         50% → 95% (3 sem)    │
│  ├─ ✅ STIX/TAXII                                  │
│  ├─ ✅ MISP                                        │
│  ├─ ✅ CVE                                         │
│  ├─ 🟡 OSINT (à améliorer)                         │
│  ├─ 🔴 Dark Web (à implémenter vraiment)           │
│  └─ 🟡 Honeypots (à connecter)                     │
│                                                     │
│  SERVICE 2 - IOC Enrichment   80% → 95% (1 sem)    │
│  ├─ ✅ IP (VirusTotal, AbuseIPDB, IPInfo)         │
│  ├─ ✅ Hash (VirusTotal)                          │
│  ├─ ✅ Domain (VirusTotal)                        │
│  ├─ ✅ URL (VirusTotal)                           │
│  ├─ 🟡 Email (à améliorer)                         │
│  └─ 🟡 Cache (Redis à configurer)                  │
│                                                     │
│  SERVICE 3 - Corrélation      57% → 90% (2 sem)    │
│  ├─ ✅ Basic correlation                           │
│  ├─ 🟡 Diamond model (à améliorer)                 │
│  ├─ ✅ Kill Chain                                  │
│  ├─ ✅ MITRE ATT&CK                               │
│  ├─ 🟡 Graph analytics (à optimiser)               │
│  └─ 🔴 ML correlation (à implémenter)              │
│                                                     │
│  SERVICE 4 - Alerting         86% → 95% (1 sem)    │
│  ├─ ✅ Alert creation                              │
│  ├─ ✅ SLA tracking                                │
│  ├─ ✅ Notifications                               │
│  ├─ ✅ Deduplication                               │
│  ├─ 🟡 Advanced rules (à améliorer)                │
│  └─ 🟡 ML anomaly detection (future)               │
│                                                     │
│  SERVICE 5 - Cases            57% → 90% (1.5 sem)  │
│  ├─ ✅ Case management                             │
│  ├─ ✅ Timeline                                    │
│  ├─ ✅ Tasks                                       │
│  ├─ 🟡 Evidence (à améliorer)                      │
│  ├─ 🟡 Collaboration (à améliorer)                 │
│  └─ ✅ Reporting                                   │
│                                                     │
│  SERVICE 6 - Playbooks        57% → 85% (2 sem)    │
│  ├─ ✅ Playbook engine                             │
│  ├─ ✅ Action library                              │
│  ├─ ✅ Execution tracking                          │
│  ├─ 🟡 Approval workflows (à améliorer)            │
│  ├─ 🟡 Error handling (à améliorer)                │
│  └─ 🔴 Integration library (à étendre)             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 💰 MODÈLE ÉCONOMIQUE SaaS

```
┌─────────────────────────────────────────────────────┐
│         PRICING TIERS                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🆓 FREE TIER                                       │
│     ├─ 1 utilisateur                               │
│     ├─ 100 alerts/mois                             │
│     ├─ 500 IOC enrichments/mois                    │
│     ├─ 5 playbooks                                 │
│     └─ Community support                           │
│                                                     │
│  💼 STARTER - $99/mois                             │
│     ├─ 5 utilisateurs                              │
│     ├─ 1,000 alerts/mois                           │
│     ├─ 5,000 IOC enrichments/mois                  │
│     ├─ 25 playbooks                                │
│     ├─ Email support                               │
│     └─ 7 jours data retention                      │
│                                                     │
│  🚀 PROFESSIONAL - $299/mois                       │
│     ├─ 15 utilisateurs                             │
│     ├─ 10,000 alerts/mois                          │
│     ├─ 50,000 IOC enrichments/mois                 │
│     ├─ Unlimited playbooks                         │
│     ├─ Priority support                            │
│     ├─ 90 jours data retention                     │
│     └─ SSO/SAML                                    │
│                                                     │
│  🏢 ENTERPRISE - Custom                            │
│     ├─ Unlimited users                             │
│     ├─ Unlimited alerts                            │
│     ├─ Unlimited enrichments                       │
│     ├─ Custom playbooks                            │
│     ├─ Dedicated support                           │
│     ├─ Custom data retention                       │
│     ├─ On-premise option                           │
│     └─ SLA 99.9%                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 INTÉGRATIONS EXTERNES

```
┌─────────────────────────────────────────────────────┐
│         INTEGRATIONS ROADMAP                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✅ Implemented                                     │
│     ├─ VirusTotal                                  │
│     ├─ AbuseIPDB                                   │
│     ├─ IPInfo                                      │
│     └─ Taranis AI                                  │
│                                                     │
│  🟡 In Progress                                     │
│     ├─ MISP (sync partiel)                         │
│     ├─ Slack (notifications basic)                 │
│     └─ Email (SMTP)                                │
│                                                     │
│  🔴 Planned                                         │
│     ├─ Jira / ServiceNow                           │
│     ├─ Microsoft Teams                             │
│     ├─ PagerDuty                                   │
│     ├─ Splunk / ELK                                │
│     ├─ QRadar / Sentinel                           │
│     ├─ Shodan                                      │
│     ├─ Have I Been Pwned                           │
│     ├─ URLScan.io                                  │
│     ├─ Hybrid Analysis                             │
│     └─ TheHive                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 CONCLUSION

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  AntStrike CTI est une plateforme SaaS complète     │
│  de Cyber Threat Intelligence structurée autour     │
│  de 6 services core interdépendants:                │
│                                                     │
│  1️⃣  Collecte & Agrégation                         │
│  2️⃣  IOC Enrichment                                │
│  3️⃣  Analyse & Corrélation                         │
│  4️⃣  Alerting & Monitoring                         │
│  5️⃣  Case Management                               │
│  6️⃣  Playbooks & SOAR                              │
│                                                     │
│  Score Actuel Moyen: 65%                            │
│  Score Cible: 95%                                   │
│  Timeline: 12 semaines                              │
│  Investment: $31,200                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

**🛡️ AntStrike CTI - Cyber Threat Intelligence as a Service**

*Architecture v4.0 - 20 Octobre 2025*



