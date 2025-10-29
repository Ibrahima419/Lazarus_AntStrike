# 🗺️ ROADMAP COMPLÈTE - AntStrike CTI à 100%

**Objectif :** Rendre **TOUS les services 100% opérationnels et compétitifs**

**Durée totale :** 8-10 semaines  
**Budget estimé :** $25,000-30,000  
**Score cible :** 82% → **95-98%**

---

## 📋 VUE D'ENSEMBLE

| Service | Score Actuel | Score Cible | Durée | Priorité |
|---------|--------------|-------------|-------|----------|
| 1. Collecte & Agrégation | 50% | **95%** | 3 sem | 🔴 CRITIQUE |
| 2. IOC Enrichment | 80% | **95%** | 1 sem | 🟡 HAUTE |
| 3. Analyse & Corrélation | 57% | **90%** | 2 sem | 🟡 HAUTE |
| 4. Alerting & Monitoring | 86% | **95%** | 1 sem | 🟡 HAUTE |
| 5. Case Management | 57% | **90%** | 1.5 sem | 🟡 HAUTE |
| 6. Playbooks & SOAR | 57% | **85%** | 2 sem | 🟢 MOYENNE |
| 7. Reporting | 86% | **95%** | 1 sem | 🟢 MOYENNE |
| 8. Analytics & Metrics | 67% | **85%** | 1 sem | 🟢 MOYENNE |
| 9. Multi-Tenancy & SaaS | 86% | **95%** | 1 sem | 🟢 MOYENNE |
| 10. API & Intégrations | 71% | **90%** | 1 sem | 🟡 HAUTE |
| 11. Threat Intelligence | 33% | **75%** | 2 sem | 🔴 CRITIQUE |

**TOTAL:** 10-12 semaines de développement

---

## 🚀 SERVICE 1 : COLLECTE & AGRÉGATION (3 semaines)

**Roadmap détaillée :** `ROADMAP_COLLECTE_AGREGATION.md` ✅ CRÉÉ

### Résumé
- ✅ STIX/TAXII (5 jours)
- ✅ MISP Integration (3 jours)
- ✅ CVE Enrichment (2 jours)
- ✅ Dark Web Feeds (3 jours)
- ✅ Honeypots (2 jours)

**Score :** 50% → **95%**

---

## 🔍 SERVICE 2 : IOC ENRICHMENT (1 semaine)

**Score actuel :** 80% ✅ (Déjà bon!)  
**Score cible :** 95%

### Gaps à Combler

#### **Jour 1-2 : Email Enrichment Avancé**

**Fichier :** `backend/src/services/ioc-enrichment.service.ts`

**Améliorer enrichEmail() :**
```typescript
private static async enrichEmail(email: string): Promise<any> {
  const data: any = {
    email,
    reputation: 'unknown',
    breached: false,
    breachCount: 0,
    domain: email.split('@')[1] || null,
    disposable: false,
    freeProvider: false,
    valid: this.isValidEmail(email),
    sources: []
  };

  // 1. Hunter.io (email verification)
  if (process.env.HUNTER_API_KEY) {
    const hunterData = await this.checkHunter(email);
    if (hunterData) {
      data.valid = hunterData.result === 'deliverable';
      data.disposable = hunterData.disposable;
      data.freeProvider = hunterData.free;
      data.sources.push('Hunter.io');
    }
  }

  // 2. HaveIBeenPwned (breaches)
  const hibpData = await this.checkHaveIBeenPwned(email);
  if (hibpData) {
    data.breached = hibpData.length > 0;
    data.breachCount = hibpData.length;
    data.breaches = hibpData.slice(0, 5).map((b: any) => ({
      name: b.Name,
      date: b.BreachDate,
      dataClasses: b.DataClasses
    }));
    data.sources.push('HaveIBeenPwned');
  }

  // 3. EmailRep.io (reputation gratuite)
  const emailRepData = await this.checkEmailRep(email);
  if (emailRepData) {
    data.reputation = emailRepData.reputation;
    data.suspicious = emailRepData.suspicious;
    data.sources.push('EmailRep.io');
  }

  return data;
}

/**
 * HaveIBeenPwned API (Gratuit!)
 */
private static async checkHaveIBeenPwned(email: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
      {
        headers: {
          'User-Agent': 'AntStrike-CTI',
          'hibp-api-key': process.env.HIBP_API_KEY || ''
        },
        timeout: 5000,
        validateStatus: (status) => status < 500
      }
    );

    return response.status === 200 ? response.data : [];
  } catch (error) {
    return [];
  }
}

/**
 * EmailRep.io (Gratuit!)
 */
private static async checkEmailRep(email: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://emailrep.io/${email}`,
      {
        headers: { 'User-Agent': 'AntStrike-CTI' },
        timeout: 5000
      }
    );

    return {
      reputation: response.data.reputation,
      suspicious: response.data.suspicious,
      details: response.data.details
    };
  } catch (error) {
    return null;
  }
}
```

**APIs (Gratuites) :**
- HaveIBeenPwned : Gratuit (avec API key gratuite)
- EmailRep.io : Gratuit (300 req/jour)
- Hunter.io : 50 req/mois gratuit

**Tests :**
- ✅ Email breached (test@adobe.com)
- ✅ Email safe
- ✅ Disposable email detection

**Temps :** 16 heures

---

#### **Jour 3-4 : Contexte Historique IOCs**

**Amélioration :** Garder historique long terme

**Nouveau modèle Prisma :**
```prisma
model IOCHistory {
  id              String   @id @default(uuid())
  tenantId        String
  iocValue        String
  iocType         String
  
  // Snapshot de l'enrichissement
  enrichmentData  Json
  threatScore     Int
  reputation      String
  
  // Tracking
  observedAt      DateTime @default(now())
  source          String?
  
  @@index([tenantId, iocValue, iocType])
  @@index([observedAt])
  @@map("ioc_history")
}
```

**Service :**
```typescript
class IOCHistoryService {
  /**
   * Enregistrer snapshot historique
   */
  static async recordSnapshot(ioc: IOCEnrichment) {
    await prisma.iOCHistory.create({
      data: {
        tenantId: ioc.tenantId,
        iocValue: ioc.iocValue,
        iocType: ioc.iocType,
        enrichmentData: ioc.enrichmentData,
        threatScore: this.extractThreatScore(ioc),
        reputation: this.extractReputation(ioc),
        source: ioc.source
      }
    });
  }

  /**
   * Obtenir historique d'un IOC
   */
  static async getHistory(
    tenantId: string,
    iocValue: string,
    iocType: string,
    days: number = 90
  ) {
    return await prisma.iOCHistory.findMany({
      where: {
        tenantId,
        iocValue,
        iocType,
        observedAt: {
          gte: new Date(Date.now() - days * 86400000)
        }
      },
      orderBy: { observedAt: 'desc' }
    });
  }

  /**
   * Analyse tendance
   */
  static async analyzeTrend(history: IOCHistory[]) {
    const scores = history.map(h => h.threatScore);
    
    return {
      current: scores[0],
      previous: scores[1],
      trend: scores[0] > scores[1] ? 'increasing' : 'decreasing',
      min: Math.min(...scores),
      max: Math.max(...scores),
      avg: scores.reduce((a, b) => a + b, 0) / scores.length
    };
  }
}
```

**Endpoint :**
```
GET /api/ioc/{value}/history?days=90
```

**Temps :** 16 heures

---

#### **Jour 5 : Tests & Validation**

**Tests complets :**
- Email enrichment (3 APIs)
- Historique IOC (90 jours)
- Trend analysis
- Performance

**Temps :** 8 heures

**Résultat :** IOC Enrichment à **95%** ✅

---

## 🧠 


**Score actuel :** 57%  
**Score cible :** 90%

### Semaine 1 : MITRE ATT&CK Integration

#### **Jour 1-2 : MITRE ATT&CK Database**

**Fichier :** `backend/src/services/mitre-attack.service.ts`

**Importer MITRE ATT&CK Matrix :**
```typescript
class MITREAttackService {
  /**
   * Charger MITRE ATT&CK depuis ATT&CK STIX
   */
  static async loadMITREData() {
    // Télécharger depuis GitHub
    const response = await axios.get(
      'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json'
    );

    const bundle = response.data;
    
    // Parser techniques
    const techniques = bundle.objects.filter((o: any) => o.type === 'attack-pattern');
    
    // Sauvegarder en DB
    for (const technique of techniques) {
      await prisma.mITRETechnique.upsert({
        where: { mitreId: technique.external_references[0].external_id },
        update: {
          name: technique.name,
          description: technique.description,
          tactics: technique.kill_chain_phases?.map((p: any) => p.phase_name) || [],
          platforms: technique.x_mitre_platforms || [],
          dataSource: technique.x_mitre_data_sources || [],
          detection: technique.x_mitre_detection || ''
        },
        create: {
          mitreId: technique.external_references[0].external_id,
          name: technique.name,
          description: technique.description,
          tactics: technique.kill_chain_phases?.map((p: any) => p.phase_name) || [],
          platforms: technique.x_mitre_platforms || [],
          dataSource: technique.x_mitre_data_sources || [],
          detection: technique.x_mitre_detection || ''
        }
      });
    }
    
    logger.info(`MITRE ATT&CK loaded: ${techniques.length} techniques`);
  }

  /**
   * Mapper IOCs/Threats → Techniques MITRE
   */
  static async mapToMITRE(threat: Threat): Promise<string[]> {
    const keywords = (threat.title + ' ' + threat.description).toLowerCase();
    
    const techniques = await prisma.mITRETechnique.findMany({
      where: {
        OR: [
          { name: { contains: keywords, mode: 'insensitive' } },
          { description: { contains: keywords, mode: 'insensitive' } }
        ]
      },
      take: 10
    });

    return techniques.map(t => t.mitreId);
  }

  /**
   * Obtenir détails technique
   */
  static async getTechnique(mitreId: string) {
    return await prisma.mITRETechnique.findUnique({
      where: { mitreId }
    });
  }

  /**
   * Techniques par tactique
   */
  static async getTechniquesByTactic(tactic: string) {
    return await prisma.mITRETechnique.findMany({
      where: {
        tactics: { has: tactic }
      }
    });
  }
}
```

**Modèle DB :**
```prisma
model MITRETechnique {
  id            String   @id @default(uuid())
  mitreId       String   @unique  // ex: T1059
  name          String
  description   String   @db.Text
  tactics       String[]  // Initial Access, Execution, etc.
  platforms     String[]  // Windows, Linux, etc.
  dataSource    String[]
  detection     String   @db.Text
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([mitreId])
  @@map("mitre_techniques")
}
```

**Endpoints :**
```
GET  /api/mitre/techniques              - Liste toutes
GET  /api/mitre/techniques/{id}         - Détails
GET  /api/mitre/tactics                 - Liste tactics
GET  /api/mitre/techniques/by-tactic/{tactic}
POST /api/mitre/map-threat              - Mapper threat → techniques
POST /api/mitre/reload                  - Recharger DB MITRE
```

**Tests :**
- ✅ Charger 200+ techniques
- ✅ Mapper threat "ransomware" → T1486, T1490, etc.
- ✅ Search par tactique

**Temps :** 16 heures

---

#### **Jour 3-4 : Threat Actor Profiling**

**Fichier :** `backend/src/services/threat-actor.service.ts`

**Base de données Threat Actors :**
```typescript
class ThreatActorService {
  /**
   * Charger threat actors depuis MITRE
   */
  static async loadThreatActors() {
    // MITRE ATT&CK Groups
    const response = await axios.get(
      'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json'
    );

    const groups = response.data.objects.filter((o: any) => 
      o.type === 'intrusion-set'
    );

    for (const group of groups) {
      await prisma.threatActor.upsert({
        where: { mitreId: this.extractMITREId(group) },
        update: {
          name: group.name,
          aliases: group.aliases || [],
          description: group.description,
          country: this.extractCountry(group),
          motivation: this.extractMotivation(group),
          sophistication: this.extractSophistication(group),
          techniques: this.extractTechniques(group),
          campaigns: []
        },
        create: { /* same */ }
      });
    }
  }

  /**
   * Détecter threat actor depuis IOCs
   */
  static async detectActor(iocs: string[]): Promise<ThreatActor | null> {
    // Comparer IOCs avec known actor IOCs
    const actors = await prisma.threatActor.findMany();
    
    for (const actor of actors) {
      const commonIOCs = this.findCommonIOCs(iocs, actor.knownIOCs);
      if (commonIOCs.length >= 3) {  // Au moins 3 IOCs communs
        return actor;
      }
    }
    
    return null;
  }

  /**
   * Attribution analysis
   */
  static async analyzeAttribution(
    tenantId: string,
    threatId: string
  ): Promise<{
    likelyActors: Array<{actor: ThreatActor, confidence: number}>,
    techniques: string[],
    geolocation: string[]
  }> {
    const threat = await prisma.threat.findUnique({
      where: { id: threatId }
    });

    // Analyser IOCs
    const iocs = threat.iocs || [];
    const actors = await this.detectActor(iocs);

    // Analyser géolocalisation
    const geoData = await this.analyzeGeolocation(iocs);

    // Analyser techniques
    const techniques = await MITREAttackService.mapToMITRE(threat);

    return {
      likelyActors: actors ? [{ actor: actors, confidence: 75 }] : [],
      techniques,
      geolocation: geoData
    };
  }
}
```

**Modèle DB :**
```prisma
model ThreatActor {
  id              String   @id @default(uuid())
  mitreId         String?  @unique  // G0001, G0002, etc.
  name            String
  aliases         String[]
  description     String   @db.Text
  country         String?
  motivation      String[]  // Financial, Espionage, etc.
  sophistication  String   // Novice, Intermediate, Advanced, Expert
  
  // TTPs
  techniques      String[]  // MITRE IDs
  campaigns       String[]
  knownIOCs       Json     @default("[]")
  
  // Activity
  firstSeen       DateTime?
  lastSeen        DateTime?
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([name])
  @@index([country])
  @@map("threat_actors")
}
```

**Endpoints :**
```
GET  /api/threat-actors                - Liste actors
GET  /api/threat-actors/{id}           - Détails
POST /api/threat-actors/detect         - Détecter depuis IOCs
POST /api/threat-actors/attribute      - Attribution analysis
GET  /api/threat-actors/by-country/{country}
POST /api/threat-actors/reload         - Recharger MITRE data
```

**Tests :**
- ✅ Charger 100+ threat actors MITRE
- ✅ Détecter APT28 depuis IOCs connus
- ✅ Attribution analysis complet

**Temps :** 16 heures

---

#### **Jour 5 : ML Threat Scoring (Basique)**

**Fichier :** `backend/src/services/ml-scoring.service.ts`

**Algorithme simple (pas besoin de TensorFlow) :**
```typescript
class MLScoringService {
  /**
   * Calculer threat score avec ML basique
   */
  static calculateThreatScore(ioc: any): number {
    let score = 0;
    const weights = {
      virusTotalDetections: 0.3,
      abuseIPDBReports: 0.25,
      ageOfIOC: 0.15,
      geolocation: 0.1,
      associatedActors: 0.2
    };

    // 1. VirusTotal detections
    if (ioc.fileData?.detections) {
      const ratio = ioc.fileData.detections / ioc.fileData.totalEngines;
      score += ratio * 100 * weights.virusTotalDetections;
    }

    // 2. AbuseIPDB reports
    if (ioc.ipData?.totalReports) {
      const normalized = Math.min(ioc.ipData.totalReports / 100, 1);
      score += normalized * 100 * weights.abuseIPDBReports;
    }

    // 3. Age (older = more suspicious si actif)
    if (ioc.firstSeen) {
      const ageMonths = (Date.now() - new Date(ioc.firstSeen).getTime()) / (30 * 86400000);
      if (ageMonths > 6 && ioc.lastSeen) {
        score += 15 * weights.ageOfIOC;  // IOC ancien mais toujours actif
      }
    }

    // 4. Geolocation (high-risk countries)
    const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
    if (highRiskCountries.includes(ioc.ipData?.country)) {
      score += 20 * weights.geolocation;
    }

    // 5. Associated threat actors
    if (ioc.relatedActors?.length > 0) {
      score += 30 * weights.associatedActors;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Prédire probabilité d'attaque (simple)
   */
  static predictAttackProbability(
    threatHistory: Threat[],
    currentIndicators: IOC[]
  ): number {
    // Analyse basique de patterns
    const recentThreats = threatHistory.filter(t => 
      Date.now() - new Date(t.createdAt).getTime() < 7 * 86400000
    );

    let probability = 0;

    // Pattern 1: Augmentation activité
    if (recentThreats.length > 10) probability += 30;

    // Pattern 2: IOCs critiques
    const criticalIOCs = currentIndicators.filter(i => i.threatScore > 80);
    probability += Math.min(criticalIOCs.length * 5, 40);

    // Pattern 3: Corrélation avec campaigns connues
    const correlatedCampaigns = this.findCorrelatedCampaigns(currentIndicators);
    probability += Math.min(correlatedCampaigns.length * 15, 30);

    return Math.min(Math.round(probability), 100);
  }
}
```

**Endpoint :**
```
POST /api/ml/threat-score      - Calculer score ML
POST /api/ml/predict-attack    - Prédire probabilité
GET  /api/ml/insights          - Insights ML
```

**Tests :**
- ✅ Score 100 IOCs
- ✅ Prédiction cohérente
- ✅ Performance < 100ms

**Temps :** 8 heures

---

**Total Service 3 :** 10 jours (2 semaines)  
**Score final :** 57% → **90%** ✅

---

## 🚨 SERVICE 4 : ALERTING & MONITORING (1 semaine)

**Score actuel :** 86% ✅  
**Score cible :** 95%

### Gaps Mineurs

#### **Jour 1-2 : Escalation Automatique**

**Fichier :** `backend/src/services/alerting.service.ts`

**Ajouter :**
```typescript
class AlertingService {
  /**
   * Vérifier SLA et escalader si dépassé
   */
  static async checkSLAAndEscalate() {
    const overdueAlerts = await prisma.alert.findMany({
      where: {
        status: { in: ['NEW', 'ACKNOWLEDGED'] },
        slaDeadline: { lt: new Date() }
      }
    });

    for (const alert of overdueAlerts) {
      await this.escalateAlert(alert);
    }
  }

  /**
   * Escalader une alerte
   */
  private static async escalateAlert(alert: Alert) {
    // 1. Augmenter priority
    const newPriority = this.increasePriority(alert.priority);
    
    // 2. Notifier manager/admin
    const managers = await prisma.user.findMany({
      where: {
        tenantId: alert.tenantId,
        role: { in: ['ADMIN', 'MANAGER'] }
      }
    });

    for (const manager of managers) {
      await EmailService.sendEscalationAlert(manager.email, alert);
    }

    // 3. Update alert
    await prisma.alert.update({
      where: { id: alert.id },
      data: {
        priority: newPriority,
        status: 'INVESTIGATING',
        escalatedAt: new Date(),
        escalationLevel: (alert.escalationLevel || 0) + 1
      }
    });

    logger.warn(`Alert escalated: ${alert.id} to ${newPriority}`);
  }

  /**
   * 
   * Scheduler SLA check (toutes les 15 min)
   */
  static startSLAMonitoring() {
    setInterval(this.checkSLAAndEscalate, 15 * 60 * 1000);
  }
}
```

**Modèle DB (ajouter) :**
```prisma
model Alert {
  // ... champs existants
  escalatedAt      DateTime?
  escalationLevel  Int       @default(0)
}
```

**Tests :**
- ✅ SLA dépassé → Escalation auto
- ✅ Email envoyé au manager
- ✅ Priority P2 → P1

**Temps :** 16 heures

---

#### **Jour 3-4 : Multi-Channel Notifications**

**Ajouter Slack, Teams, PagerDuty :**

```typescript
class NotificationService {
  /**
   * Envoyer notification multi-channel
   */
  static async sendAlert(
    tenantId: string,
    alert: Alert,
    channels: string[]
  ) {
    const results = await Promise.allSettled(
      channels.map(channel => {
        switch (channel) {
          case 'email':
            return EmailService.sendAlertEmail(tenantId, alert);
          case 'slack':
            return this.sendSlack(tenantId, alert);
          case 'teams':
            return this.sendTeams(tenantId, alert);
          case 'webhook':
            return this.sendWebhook(tenantId, alert);
          case 'pagerduty':
            return this.sendPagerDuty(tenantId, alert);
        }
      })
    );

    return results;
  }

  /**
   * Slack notification
   */
  private static async sendSlack(tenantId: string, alert: Alert) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const slackWebhook = (tenant.settings as any).slack?.webhookUrl;

    if (!slackWebhook) return;

    await axios.post(slackWebhook, {
      text: `🚨 *Alert ${alert.severity}*: ${alert.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${alert.title}*\n${alert.summary}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Severity: ${alert.severity} | Priority: ${alert.priority}`
            }
          ]
        }
      ]
    });
  }

  // ... Similaire pour Teams, PagerDuty, etc.
}
```

**Configuration tenant :**
```json
{
  "notifications": {
    "channels": ["email", "slack"],
    "slack": {
      "webhookUrl": "https://hooks.slack.com/..."
    },
    "teams": {
      "webhookUrl": "https://outlook.office.com/webhook/..."
    }
  }
}
```

**Tests :**
- ✅ Email + Slack simultanés
- ✅ Fallback si échec
- ✅ Template personnalisés

**Temps :** 16 heures

---

#### **Jour 5 : Tests & Documentation**

**Temps :** 8 heures

**Total Service 4 :** 5 jours  
**Score final :** 86% → **95%** ✅

---

## 📁 SERVICE 5 : CASE MANAGEMENT (1.5 semaines)

**Score actuel :** 57%  
**Score cible :** 90%

### Semaine 1

#### **Jour 1-2 : Attachments & Files**

**Nouveau modèle :**
```prisma
model CaseAttachment {
  id          String   @id @default(uuid())
  caseId      String
  case        Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  fileName    String
  fileSize    Int
  fileType    String
  fileUrl     String   // S3, local storage, etc.
  uploadedBy  String
  
  createdAt   DateTime @default(now())
  
  @@index([caseId])
  @@map("case_attachments")
}
```

**Service :**
```typescript
class CaseAttachmentService {
  /**
   * Upload fichier
   */
  static async uploadFile(
    caseId: string,
    userId: string,
    file: Express.Multer.File
  ) {
    // 1. Valider fichier
    if (file.size > 50 * 1024 * 1024) {  // Max 50MB
      throw new Error('File too large');
    }

    // 2. Scanner malware
    const isSafe = await this.scanFile(file);
    if (!isSafe) {
      throw new Error('Malware detected in file');
    }

    // 3. Sauvegarder (local ou S3)
    const fileUrl = await this.saveFile(file);

    // 4. Créer attachment
    return await prisma.caseAttachment.create({
      data: {
        caseId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        fileUrl,
        uploadedBy: userId
      }
    });
  }

  /**
   * Scanner fichier avec VirusTotal
   */
  private static async scanFile(file: Express.Multer.File): Promise<boolean> {
    // Calculer hash
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Vérifier via VirusTotal
    const result = await IOCEnrichmentService.enrichIOC('system', {
      iocValue: hash,
      iocType: 'FILE_HASH'
    });

    return result.fileData?.detections === 0;
  }
}
```

**Endpoints :**
```
POST /api/cases/{id}/attachments       - Upload file
GET  /api/cases/{id}/attachments       - Liste files
GET  /api/cases/{id}/attachments/{fileId}/download
DELETE /api/cases/{id}/attachments/{fileId}
```

**Tests :**
- ✅ Upload PDF, images, logs
- ✅ Scan malware
- ✅ Download sécurisé

**Temps :** 16 heures

---

#### **Jour 3-4 : Case Templates**

**Modèle :**
```prisma
model CaseTemplate {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  name        String
  description String
  category    String   // Ransomware, Phishing, APT, etc.
  
  // Template fields
  fields      Json     // Checklist, questions, etc.
  priority    String
  
  createdAt   DateTime @default(now())
  
  @@map("case_templates")
}
```

**Service :**
```typescript
class CaseTemplateService {
  /**
   * Templates pré-définis
   */
  static getDefaultTemplates() {
    return [
      {
        name: 'Ransomware Investigation',
        category: 'RANSOMWARE',
        fields: [
          { type: 'checklist', label: 'Initial Response', items: [
            'Isolate infected systems',
            'Identify ransomware variant',
            'Check backups availability',
            'Notify stakeholders'
          ]},
          { type: 'text', label: 'Ransom note content' },
          { type: 'text', label: 'Encryption algorithm' },
          { type: 'text', label: 'Payment demand' },
          { type: 'checklist', label: 'Recovery Actions', items: [
            'Restore from backups',
            'Patch vulnerabilities',
            'Update security controls'
          ]}
        ]
      },
      {
        name: 'Phishing Investigation',
        category: 'PHISHING',
        fields: [
          { type: 'email', label: 'Sender address' },
          { type: 'text', label: 'Subject line' },
          { type: 'url', label: 'Malicious URL' },
          { type: 'number', label: 'Users impacted' },
          { type: 'checklist', label: 'Actions', items: [
            'Block sender domain',
            'Quarantine emails',
            'Reset user passwords',
            'Security awareness training'
          ]}
        ]
      }
      // ... 5-10 templates
    ];
  }

  /**
   * Créer case depuis template
   */
  static async createFromTemplate(
    tenantId: string,
    templateId: string,
    data: any
  ) {
    const template = await prisma.caseTemplate.findUnique({
      where: { id: templateId }
    });

    return await CaseService.createCase(tenantId, data.userId, {
      title: data.title || template.name,
      description: template.description,
      priority: template.priority,
      severity: 'HIGH',
      templateData: template.fields
    });
  }
}
```

**Temps :** 16 heures

---

**Total Service 5 :** 8 jours  
**Score final :** 57% → **90%** ✅

---

## 🤖 SERVICE 6 : PLAYBOOKS & SOAR (2 semaines)

**Score actuel :** 57%  
**Score cible :** 85%

### Semaine 1 : Actions Avancées

**Ajouter 30+ actions :**

```typescript
// backend/src/services/playbook-actions.service.ts

class PlaybookActionsService {
  /**
   * Actions disponibles (30+)
   */
  static readonly ACTIONS = {
    // Network
    'block_ip_firewall': this.blockIPFirewall,
    'block_domain_dns': this.blockDomainDNS,
    'isolate_host': this.isolateHost,
    
    // Email
    'quarantine_email': this.quarantineEmail,
    'block_sender': this.blockSender,
    
    // User
    'disable_account': this.disableAccount,
    'reset_password': this.resetPassword,
    'revoke_sessions': this.revokeSessions,
    
    // Threat Intel
    'enrich_ioc': this.enrichIOC,
    'add_to_blacklist': this.addToBlacklist,
    'publish_to_misp': this.publishToMISP,
    
    // Investigation
    'create_case': this.createCase,
    'create_alert': this.createAlert,
    'add_note': this.addNote,
    
    // Notification
    'send_email': this.sendEmail,
    'send_slack': this.sendSlack,
    'send_teams': this.sendTeams,
    'call_pagerduty': this.callPagerDuty,
    
    // Response
    'run_script': this.runScript,
    'api_call': this.apiCall,
    'update_ticket': this.updateTicket,
    
    // Analysis
    'analyze_file': this.analyzeFile,
    'scan_endpoint': this.scanEndpoint,
    'collect_forensics': this.collectForensics
  };

  /**
   * Exécuter action
   */
  static async executeAction(
    action: string,
    params: any,
    context: any
  ): Promise<any> {
    if (!this.ACTIONS[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    logger.info(`Executing playbook action: ${action}`, { params });
    
    try {
      const result = await this.ACTIONS[action](params, context);
      return { success: true, result };
    } catch (error) {
      logger.error(`Action ${action} failed:`, error);
      return { success: false, error: error.message };
    }
  }

  // Implémentation de chaque action...
  private static async blockIPFirewall(params: any, context: any) {
    // Intégration firewall (API)
    // ...
  }
}
```

**Temps :** 3-4 jours (30+ actions)

---

### Semaine 2 : Visual Builder Backend API

**Endpoints pour UI drag-and-drop :**

```
GET  /api/playbooks/actions           - Liste actions disponibles
GET  /api/playbooks/triggers          - Liste triggers
POST /api/playbooks/validate          - Valider playbook
POST /api/playbooks/test              - Test run
GET  /api/playbooks/{id}/executions   - Historique exécutions
```

**Temps :** 3-4 jours

**Total Service 6 :** 2 semaines  
**Score final :** 57% → **85%** ✅

---

## 📊 PLANNING GLOBAL

### Roadmap 10 Semaines

```
Semaines 1-3:  Collecte & Agrégation (50% → 95%)
Semaines 4:    IOC Enrichment (80% → 95%)
Semaines 5-6:  Analyse & Corrélation (57% → 90%)
Semaine 7:     Alerting (86% → 95%)
Semaines 8-9:  Case Management (57% → 90%)
Semaines 10-11: Playbooks SOAR (57% → 85%)

Semaine 12:    Tests, Documentation, Polish
```

---

## 📊 ÉVOLUTION DU SCORE

| Service | Sem 0 | Sem 3 | Sem 6 | Sem 12 |
|---------|-------|-------|-------|--------|
| Collecte | 50% | **95%** | 95% | 95% |
| IOC | 80% | 80% | **95%** | 95% |
| Analyse | 57% | 57% | **90%** | 90% |
| Alerting | 86% | 86% | **95%** | 95% |
| Cases | 57% | 57% | 57% | **90%** |
| Playbooks | 57% | 57% | 57% | **85%** |
| Reporting | 86% | 86% | 86% | **95%** |
| **GLOBAL** | **67%** | **75%** | **82%** | **92%** ✅ |

---

## 💰 BUDGET TOTAL

```
Développement:         152h × $50 = $7,600  (Collecte)
                       40h × $50  = $2,000  (IOC)
                       80h × $50  = $4,000  (Analyse)
                       40h × $50  = $2,000  (Alerting)
                       64h × $50  = $3,200  (Cases)
                       80h × $50  = $4,000  (Playbooks)
                       40h × $50  = $2,000  (Reporting)
                       40h × $50  = $2,000  (Autres)
──────────────────────────────────────────────
TOTAL Développement:   536h = $26,800

APIs (annuel):
  APIs gratuites:             $0
  Dark Web (optionnel):       $0-3,600
──────────────────────────────────────────────
TOTAL PROJET:                 $26,800-30,400
```

---

## 🎯 ROI PROJETÉ

### Année 1

```
Investissement:    $30,000 (dev)
Clients PME:       20 × $10,000 = $200,000
Margin:            60% = $120,000
ROI:               4x première année
```

### Année 2-3

```
Clients PME:       50 × $10,000 = $500,000
Clients Enterprise: 5 × $25,000 = $125,000
Total:             $625,000
Margin:            70% = $437,500
ROI:               15x cumulatif
```

---

## 🎉 CONCLUSION

### **Avec 10-12 semaines de développement :**

✅ **Tous les services à 85-95%**  
✅ **Score global : 92%** (très compétitif)  
✅ **Standards industrie respectés** (STIX, MISP, MITRE)  
✅ **Prêt marché PME + Mid-market**  
✅ **ROI 4x première année**  

### **Phase Critique (Semaines 1-3) :**

**Focus :** STIX/TAXII + MISP + CVE  
**Budget :** $7,600  
**Impact :** 67% → **75%** (déjà vendable PME!)

---

**Voulez-vous que je commence par implémenter STIX/TAXII ? 🚀**

**Créé :** 19 Octobre 2025  
**Roadmap :** 12 semaines → 92% compétitif  
**Budget :** $26,800-30,400

