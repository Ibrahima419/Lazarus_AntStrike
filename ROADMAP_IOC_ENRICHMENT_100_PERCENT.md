# 🎯 ROADMAP - IOC ENRICHMENT 100%

**Objectif**: Passer de 75% → **100%** de compétitivité  
**Durée**: 1 semaine (40 heures)  
**Budget**: $2,000 développement + $0/an APIs

---

## 📊 ÉTAT ACTUEL (75%)

### ✅ Déjà Implémenté

| Fonctionnalité | Status | Score |
|----------------|--------|-------|
| IP Enrichment (AbuseIPDB + IPInfo) | ✅ | 100% |
| File Hash (VirusTotal) | ✅ | 100% |
| Domain (VirusTotal) | ✅ | 100% |
| URL (VirusTotal) | ✅ | 100% |
| Cache 24h | ✅ | 100% |
| Bulk enrichment | ✅ | 90% |

### ❌ Gaps Critiques

| Fonctionnalité | Status | Impact |
|----------------|--------|--------|
| Email Enrichment | ❌ | 🔴 CRITIQUE |
| IOC Historical Tracking | ❌ | 🔴 CRITIQUE |
| Threat Score Calculation | ⚠️ Basique | 🟡 HAUTE |
| Enrichment Pipeline | ⚠️ Simple | 🟡 HAUTE |
| Multi-source Correlation | ❌ | 🟡 HAUTE |
| Reputation Decay | ❌ | 🟢 MOYENNE |
| IOC Relationships | ❌ | 🟢 MOYENNE |

---

## 🗓️ ROADMAP DÉTAILLÉE

### **JOUR 1-2 : Email Enrichment** 🔴

**Priorité**: CRITIQUE - Type IOC manquant

#### Fichier
`backend/src/services/ioc-enrichment.service.ts` (ajouter méthode)

#### APIs à Intégrer

**1. HaveIBeenPwned (HIBP)**
```typescript
private static async checkHIBP(email: string): Promise<any> {
  try {
    const apiKey = process.env.HIBP_API_KEY; // Gratuit
    
    const response = await axios.get(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${email}`,
      {
        headers: {
          'hibp-api-key': apiKey,
          'user-agent': 'AntStrike-CTI'
        },
        timeout: 5000
      }
    );

    return {
      breached: true,
      breaches: response.data.map((b: any) => ({
        name: b.Name,
        domain: b.Domain,
        breachDate: b.BreachDate,
        dataClasses: b.DataClasses
      })),
      breachCount: response.data.length
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { breached: false, breaches: [] };
    }
    return null;
  }
}
```

**2. EmailRep.io**
```typescript
private static async checkEmailRep(email: string): Promise<any> {
  try {
    const apiKey = process.env.EMAILREP_API_KEY; // Gratuit 300/jour
    
    const response = await axios.get(
      `https://emailrep.io/${email}`,
      {
        headers: { 'Key': apiKey },
        timeout: 5000
      }
    );

    const data = response.data;
    
    return {
      reputation: data.reputation, // high, medium, low, none
      suspicious: data.suspicious,
      references: data.references,
      details: {
        malicious: data.details?.malicious_activity,
        credentialsLeaked: data.details?.credentials_leaked,
        dataBreaches: data.details?.data_breach,
        spam: data.details?.spam,
        domainReputation: data.details?.domain_reputation
      }
    };
  } catch (error) {
    return null;
  }
}
```

**3. Hunter.io (Email Verification)**
```typescript
private static async checkHunterIO(email: string): Promise<any> {
  try {
    const apiKey = process.env.HUNTER_API_KEY; // 50 req/mois gratuit
    
    const response = await axios.get(
      'https://api.hunter.io/v2/email-verifier',
      {
        params: { email, api_key: apiKey },
        timeout: 5000
      }
    );

    const data = response.data.data;
    
    return {
      status: data.status, // valid, invalid, accept_all, unknown
      score: data.score, // 0-100
      regexp: data.regexp,
      gibberish: data.gibberish,
      disposable: data.disposable,
      webmail: data.webmail,
      mxRecords: data.mx_records,
      smtp: data.smtp_server,
      smtpCheck: data.smtp_check
    };
  } catch (error) {
    return null;
  }
}
```

#### Méthode principale
```typescript
private static async enrichEmail(email: string): Promise<any> {
  try {
    const data: any = {
      email,
      breached: false,
      reputation: 'unknown',
      sources: []
    };

    // Paralléliser les appels
    const [hibpData, emailRepData, hunterData] = await Promise.allSettled([
      this.checkHIBP(email),
      this.checkEmailRep(email),
      this.checkHunterIO(email)
    ]);

    // Merger données
    if (hibpData.status === 'fulfilled' && hibpData.value) {
      data.breached = hibpData.value.breached;
      data.breaches = hibpData.value.breaches;
      data.sources.push('HaveIBeenPwned');
    }

    if (emailRepData.status === 'fulfilled' && emailRepData.value) {
      data.reputation = emailRepData.value.reputation;
      data.suspicious = emailRepData.value.suspicious;
      data.details = emailRepData.value.details;
      data.sources.push('EmailRep');
    }

    if (hunterData.status === 'fulfilled' && hunterData.value) {
      data.validation = hunterData.value;
      data.sources.push('Hunter.io');
    }

    // Score final
    data.threatScore = this.calculateEmailThreatScore(data);

    return data;
  } catch (error) {
    logger.error('Email enrichment error:', error);
    return { email, error: 'Enrichment failed' };
  }
}
```

#### Endpoints
```
POST /api/ioc/enrich          (déjà existe, ajouter support EMAIL)
POST /api/ioc/check-breach    (vérifier si email breached)
GET  /api/ioc/email/:email    (détails email)
```

#### Configuration .env
```bash
HIBP_API_KEY=your_hibp_key_here          # Gratuit
EMAILREP_API_KEY=your_emailrep_key       # Gratuit 300/jour
HUNTER_API_KEY=your_hunter_key           # Gratuit 50/mois
```

#### Tests
- ✅ Email breached (test@adobe.com)
- ✅ Email safe
- ✅ Disposable email detection
- ✅ Corporate email validation

**Temps estimé**: 16 heures  
**Complexité**: 🟡 Moyenne

---

### **JOUR 3 : IOC Historical Tracking** 🔴

**Priorité**: CRITIQUE - Tendances et évolution

#### Nouveau Modèle Prisma

```prisma
model IOCHistory {
  id              String   @id @default(uuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  iocValue        String
  iocType         String
  
  // Snapshot de l'enrichissement
  enrichmentData  Json
  threatScore     Int      @default(0)
  reputation      String   @default("unknown")
  
  // Tracking
  observedAt      DateTime @default(now())
  source          String?
  
  @@index([tenantId, iocValue, iocType])
  @@index([observedAt])
  @@map("ioc_history")
}
```

#### Service
`backend/src/services/ioc-history.service.ts`

```typescript
export class IOCHistoryService {
  /**
   * Enregistrer snapshot historique
   */
  static async recordSnapshot(ioc: any): Promise<void> {
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
   * Analyser tendance
   */
  static async analyzeTrend(history: any[]) {
    const scores = history.map(h => h.threatScore);
    
    return {
      current: scores[0] || 0,
      previous: scores[1] || 0,
      trend: scores[0] > scores[1] ? 'increasing' : 'decreasing',
      min: Math.min(...scores),
      max: Math.max(...scores),
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      volatility: this.calculateVolatility(scores)
    };
  }

  /**
   * Calculer volatilité
   */
  private static calculateVolatility(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => 
      sum + Math.pow(score - avg, 2), 0
    ) / scores.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Détecter changements significatifs
   */
  static async detectChanges(
    tenantId: string,
    iocValue: string,
    iocType: string
  ): Promise<any> {
    const history = await this.getHistory(tenantId, iocValue, iocType, 30);
    
    if (history.length < 2) return null;

    const current = history[0];
    const previous = history[1];

    const changes: any[] = [];

    // Changement de réputation
    if (current.reputation !== previous.reputation) {
      changes.push({
        type: 'reputation_change',
        from: previous.reputation,
        to: current.reputation,
        timestamp: current.observedAt
      });
    }

    // Augmentation threat score significative (>20 points)
    if (current.threatScore - previous.threatScore > 20) {
      changes.push({
        type: 'threat_score_spike',
        from: previous.threatScore,
        to: current.threatScore,
        delta: current.threatScore - previous.threatScore
      });
    }

    return changes.length > 0 ? changes : null;
  }
}
```

#### Endpoints
```
GET  /api/ioc/history/:iocValue       - Historique IOC
GET  /api/ioc/trend/:iocValue         - Analyse tendance
GET  /api/ioc/changes                 - Changements récents
POST /api/ioc/snapshot                - Forcer snapshot
```

#### Intégration
Modifier `IOCEnrichmentService.enrichIOC()` pour enregistrer snapshot après chaque enrichissement.

**Temps estimé**: 8 heures

---

### **JOUR 4 : Advanced Threat Scoring** 🟡

**Priorité**: HAUTE - Score unique multi-sources

#### Algorithme de Scoring Avancé

```typescript
class ThreatScoringService {
  /**
   * Calculer score de menace global (0-100)
   */
  static calculateThreatScore(ioc: any, enrichmentData: any): number {
    let score = 0;
    const weights = {
      virusTotal: 0.25,
      abuseIPDB: 0.25,
      ipInfo: 0.10,
      misp: 0.15,
      osint: 0.10,
      honeypot: 0.10,
      darkweb: 0.05
    };

    // VirusTotal
    if (enrichmentData.fileData?.detections) {
      const detectionRate = enrichmentData.fileData.detections / 
                           (enrichmentData.fileData.totalEngines || 1);
      score += detectionRate * 100 * weights.virusTotal;
    }

    if (enrichmentData.domainData?.malicious) {
      score += 100 * weights.virusTotal;
    }

    // AbuseIPDB
    if (enrichmentData.ipData?.abuseScore) {
      score += enrichmentData.ipData.abuseScore * weights.abuseIPDB;
    }

    // IPInfo (géo-risque)
    if (enrichmentData.ipData?.country) {
      const riskyCountries = ['CN', 'RU', 'KP', 'IR'];
      if (riskyCountries.includes(enrichmentData.ipData.country)) {
        score += 20 * weights.ipInfo;
      }
    }

    // MISP
    if (enrichmentData.misp?.eventId) {
      score += 60 * weights.misp; // Présence MISP = haute confidence
    }

    // OSINT Feeds
    if (ioc.source?.startsWith('OSINT Feed')) {
      score += 40 * weights.osint;
    }

    // Honeypot
    if (enrichmentData.honeypot?.attackCount) {
      const attacks = Math.min(enrichmentData.honeypot.attackCount, 100);
      score += attacks * weights.honeypot;
    }

    // Dark Web mention
    if (enrichmentData.darkweb?.mentioned) {
      score += 50 * weights.darkweb;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculer niveau de confiance (0-100)
   */
  static calculateConfidence(enrichmentData: any): number {
    let confidence = 30; // Base

    const sources = enrichmentData.sources || [];
    
    // +15 par source fiable
    confidence += sources.length * 15;

    // +10 si données récentes (<7 jours)
    if (enrichmentData.lastUpdate) {
      const daysSince = (Date.now() - new Date(enrichmentData.lastUpdate).getTime()) / 86400000;
      if (daysSince < 7) confidence += 10;
    }

    // +20 si MISP
    if (enrichmentData.misp) confidence += 20;

    // +10 si honeypot
    if (enrichmentData.honeypot) confidence += 10;

    return Math.min(confidence, 100);
  }

  /**
   * Déterminer réputation finale
   */
  static determineReputation(score: number, confidence: number): string {
    if (confidence < 40) return 'unknown';
    
    if (score >= 80) return 'malicious';
    if (score >= 60) return 'suspicious';
    if (score >= 40) return 'questionable';
    if (score >= 20) return 'low-risk';
    return 'clean';
  }
}
```

#### Endpoints
```
GET  /api/ioc/score/:iocValue          - Threat score détaillé
POST /api/ioc/recalculate-scores       - Recalculer tous les scores
GET  /api/ioc/reputation-stats         - Stats par réputation
```

**Temps estimé**: 8 heures

---

### **JOUR 5 : Enrichment Pipeline Avancé** 🟡

**Priorité**: HAUTE - Orchestration multi-sources

#### Architecture Pipeline

```typescript
class EnrichmentPipelineService {
  /**
   * Pipeline d'enrichissement complet
   */
  static async enrichIOCPipeline(
    tenantId: string,
    ioc: { iocValue: string; iocType: string }
  ): Promise<any> {
    const pipeline = {
      stages: [],
      duration: 0,
      success: true
    };

    const startTime = Date.now();

    try {
      // Stage 1: Validation
      pipeline.stages.push(await this.stageValidation(ioc));

      // Stage 2: Cache Check
      const cached = await this.stageCacheCheck(tenantId, ioc);
      pipeline.stages.push(cached);
      if (cached.hit) {
        return cached.data;
      }

      // Stage 3: Primary Enrichment (APIs externes)
      pipeline.stages.push(await this.stagePrimaryEnrichment(ioc));

      // Stage 4: Secondary Enrichment (MISP, Feeds)
      pipeline.stages.push(await this.stageSecondaryEnrichment(tenantId, ioc));

      // Stage 5: Threat Scoring
      pipeline.stages.push(await this.stageThreatScoring(ioc));

      // Stage 6: Historical Recording
      pipeline.stages.push(await this.stageHistoricalRecording(tenantId, ioc));

      // Stage 7: Alert Generation (si critique)
      pipeline.stages.push(await this.stageAlertGeneration(tenantId, ioc));

      pipeline.duration = Date.now() - startTime;

      return {
        success: true,
        pipeline,
        data: ioc
      };
    } catch (error: any) {
      pipeline.success = false;
      pipeline.duration = Date.now() - startTime;
      logger.error('Enrichment pipeline error:', error);
      throw error;
    }
  }

  // Stages individuels
  private static async stageValidation(ioc: any) {
    return {
      stage: 'validation',
      status: 'success',
      duration: 5,
      result: { valid: true }
    };
  }

  private static async stageCacheCheck(tenantId: string, ioc: any) {
    const existing = await prisma.iOCEnrichment.findFirst({
      where: {
        tenantId,
        iocValue: ioc.iocValue,
        iocType: ioc.iocType
      }
    });

    const cacheValid = existing && this.isCacheValid(existing.lastEnriched);

    return {
      stage: 'cache_check',
      status: 'success',
      duration: 10,
      hit: cacheValid,
      data: existing
    };
  }

  // ... autres stages
}
```

#### Endpoints
```
POST /api/ioc/pipeline                - Enrichment avec pipeline détaillé
GET  /api/ioc/pipeline/status/:id     - Statut pipeline async
```

**Temps estimé**: 8 heures

---

### **JOUR 6 : Multi-Source Correlation** 🟡

**Priorité**: HAUTE - Corrélation entre sources

#### Service
`backend/src/services/ioc-correlation.service.ts`

```typescript
export class IOCCorrelationService {
  /**
   * Corréler IOC à travers toutes les sources
   */
  static async correlateIOC(
    tenantId: string,
    iocValue: string,
    iocType: string
  ): Promise<any> {
    const correlation = {
      ioc: { value: iocValue, type: iocType },
      sources: [],
      relatedIOCs: [],
      confidence: 0,
      verdict: 'unknown'
    };

    // 1. Source primaire (enrichment actuel)
    const primary = await prisma.iOCEnrichment.findFirst({
      where: { tenantId, iocValue, iocType }
    });

    if (primary) {
      correlation.sources.push({
        type: 'primary_enrichment',
        data: primary.enrichmentData,
        confidence: 90
      });
    }

    // 2. MISP events
    const mispEvents = await this.findInMISP(tenantId, iocValue);
    if (mispEvents.length > 0) {
      correlation.sources.push({
        type: 'misp',
        count: mispEvents.length,
        confidence: 85
      });
    }

    // 3. OSINT Feeds
    const osintMatches = await this.findInOSINT(tenantId, iocValue);
    if (osintMatches.length > 0) {
      correlation.sources.push({
        type: 'osint_feeds',
        feeds: osintMatches,
        confidence: 70
      });
    }

    // 4. Dark Web mentions
    const darkwebMentions = await this.findInDarkWeb(tenantId, iocValue);
    if (darkwebMentions.length > 0) {
      correlation.sources.push({
        type: 'darkweb',
        mentions: darkwebMentions,
        confidence: 60
      });
    }

    // 5. Honeypot logs
    const honeypotHits = await this.findInHoneypots(tenantId, iocValue);
    if (honeypotHits.length > 0) {
      correlation.sources.push({
        type: 'honeypot',
        attacks: honeypotHits,
        confidence: 95
      });
    }

    // 6. IOCs reliés (même campagne, même infra)
    const related = await this.findRelatedIOCs(tenantId, iocValue);
    correlation.relatedIOCs = related;

    // Calculer confidence globale
    correlation.confidence = this.calculateCorrelationConfidence(correlation.sources);

    // Verdict final
    correlation.verdict = this.determineVerdict(correlation);

    return correlation;
  }

  /**
   * Trouver IOCs reliés
   */
  private static async findRelatedIOCs(
    tenantId: string,
    iocValue: string
  ): Promise<any[]> {
    // Chercher dans les mêmes alertes
    const alerts = await prisma.alert.findMany({
      where: {
        tenantId,
        iocs: {
          has: iocValue
        }
      },
      select: { iocs: true }
    });

    const relatedIOCs = new Set<string>();
    alerts.forEach(alert => {
      alert.iocs.forEach(ioc => {
        if (ioc !== iocValue) relatedIOCs.add(ioc);
      });
    });

    return Array.from(relatedIOCs);
  }

  /**
   * Calculer confidence de corrélation
   */
  private static calculateCorrelationConfidence(sources: any[]): number {
    if (sources.length === 0) return 0;
    
    const avgConfidence = sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length;
    const sourceBonus = Math.min(sources.length * 5, 25);
    
    return Math.min(avgConfidence + sourceBonus, 100);
  }

  /**
   * Déterminer verdict
   */
  private static determineVerdict(correlation: any): string {
    const sourceCount = correlation.sources.length;
    const confidence = correlation.confidence;

    if (sourceCount >= 3 && confidence >= 80) return 'confirmed_malicious';
    if (sourceCount >= 2 && confidence >= 70) return 'likely_malicious';
    if (sourceCount >= 1 && confidence >= 50) return 'suspicious';
    if (sourceCount >= 1) return 'unknown';
    return 'insufficient_data';
  }
}
```

#### Endpoints
```
GET  /api/ioc/correlate/:iocValue      - Corrélation complète
GET  /api/ioc/related/:iocValue        - IOCs reliés
POST /api/ioc/bulk-correlate           - Corrélation bulk
```

**Temps estimé**: 8 heures

---

### **JOUR 7 : Reputation Decay & Relationships** 🟢

**Priorité**: MOYENNE - Affinement

#### Reputation Decay

```typescript
class ReputationDecayService {
  /**
   * Appliquer decay au threat score
   */
  static applyDecay(
    originalScore: number,
    daysSinceObservation: number
  ): number {
    // Décroissance exponentielle
    // Score réduit de 50% après 30 jours
    const decayRate = 0.023; // -2.3% par jour
    const decayedScore = originalScore * Math.exp(-decayRate * daysSinceObservation);
    
    return Math.max(Math.round(decayedScore), 0);
  }

  /**
   * Mettre à jour scores avec decay
   */
  static async updateScoresWithDecay(tenantId: string) {
    const iocs = await prisma.iOCEnrichment.findMany({
      where: { tenantId }
    });

    let updated = 0;

    for (const ioc of iocs) {
      const daysSince = (Date.now() - ioc.lastEnriched.getTime()) / 86400000;
      
      if (daysSince > 7) {
        const enrichData = ioc.enrichmentData as any;
        const originalScore = enrichData.threatScore || 50;
        const newScore = this.applyDecay(originalScore, daysSince);

        if (newScore !== originalScore) {
          enrichData.threatScore = newScore;
          enrichData.decayApplied = true;
          
          await prisma.iOCEnrichment.update({
            where: { id: ioc.id },
            data: { enrichmentData: enrichData }
          });

          updated++;
        }
      }
    }

    logger.info(`Reputation decay applied: ${updated} IOCs updated`);
    return updated;
  }
}
```

#### IOC Relationships

```typescript
class IOCRelationshipService {
  /**
   * Créer relation entre IOCs
   */
  static async createRelationship(
    tenantId: string,
    ioc1: string,
    ioc2: string,
    relationshipType: 'same_campaign' | 'same_infrastructure' | 'same_actor' | 'related',
    confidence: number
  ) {
    await prisma.iOCRelationship.create({
      data: {
        tenantId,
        ioc1,
        ioc2,
        relationshipType,
        confidence,
        detectedAt: new Date()
      }
    });
  }

  /**
   * Obtenir graphe de relations
   */
  static async getRelationshipGraph(
    tenantId: string,
    iocValue: string,
    depth: number = 2
  ) {
    // BFS pour construire graphe
    const graph = {
      nodes: [],
      edges: []
    };

    // À implémenter avec récursion limitée
    return graph;
  }
}
```

#### Nouveau Modèle Prisma

```prisma
model IOCRelationship {
  id                String   @id @default(uuid())
  tenantId          String
  
  ioc1              String
  ioc2              String
  relationshipType  String
  confidence        Int      @default(50)
  
  detectedAt        DateTime @default(now())
  
  @@index([tenantId, ioc1])
  @@index([tenantId, ioc2])
  @@map("ioc_relationships")
}
```

#### Endpoints
```
POST /api/ioc/relationship            - Créer relation
GET  /api/ioc/graph/:iocValue         - Graphe de relations
GET  /api/ioc/decay-stats              - Stats decay
POST /api/ioc/apply-decay              - Appliquer decay manuel
```

**Temps estimé**: 8 heures

---

## 📊 IMPACT SUR LE SCORE

### Après Toutes les Améliorations

| Fonctionnalité | Avant | Après | Gain |
|----------------|-------|-------|------|
| **IP Enrichment** | 100% | 100% | - |
| **Hash Enrichment** | 100% | 100% | - |
| **Domain Enrichment** | 100% | 100% | - |
| **URL Enrichment** | 100% | 100% | - |
| **Email Enrichment** | 0% | 100% | +100% |
| **Historical Tracking** | 0% | 100% | +100% |
| **Threat Scoring** | 60% | 100% | +40% |
| **Pipeline Orchestration** | 50% | 100% | +50% |
| **Multi-Source Correlation** | 30% | 100% | +70% |
| **Reputation Decay** | 0% | 90% | +90% |
| **IOC Relationships** | 0% | 80% | +80% |

**Score IOC Enrichment**: 75% → **100%** ✅

---

## ⏱️ PLANNING

### Timeline

```
Jour 1-2: Email Enrichment (HIBP + EmailRep + Hunter)
Jour 3:   IOC Historical Tracking
Jour 4:   Advanced Threat Scoring
Jour 5:   Enrichment Pipeline
Jour 6:   Multi-Source Correlation
Jour 7:   Reputation Decay + Relationships

Total: 7 jours (1 semaine)
```

---

## 💰 BUDGET

### Développement
```
Email Enrichment:        16h × $50/h = $800
Historical Tracking:     8h × $50/h  = $400
Threat Scoring:          8h × $50/h  = $400
Pipeline:                8h × $50/h  = $400
Correlation:             8h × $50/h  = $400
Decay + Relations:       8h × $50/h  = $400
Tests + Doc:             8h × $50/h  = $400
─────────────────────────────────────────
TOTAL:                   64h         = $3,200
```

### APIs (Annuel)
```
HaveIBeenPwned:    $0 (gratuit avec clé)
EmailRep.io:       $0 (gratuit 300/jour)
Hunter.io:         $0 (gratuit 50/mois)
─────────────────────────────────────────
TOTAL APIs:        $0/an ✅
```

---

## 📦 LIVRABLES

### Services Créés/Modifiés (5)
- ✅ `ioc-enrichment.service.ts` (méthode enrichEmail)
- ✅ `ioc-history.service.ts` (nouveau)
- ✅ `threat-scoring.service.ts` (nouveau)
- ✅ `enrichment-pipeline.service.ts` (nouveau)
- ✅ `ioc-correlation.service.ts` (nouveau)

### Modèles DB (2)
- ✅ `IOCHistory` (snapshots historiques)
- ✅ `IOCRelationship` (relations entre IOCs)

### Endpoints Ajoutés (12+)
```
Email:
  POST /api/ioc/check-breach
  GET  /api/ioc/email/:email

Historical:
  GET  /api/ioc/history/:iocValue
  GET  /api/ioc/trend/:iocValue
  GET  /api/ioc/changes

Scoring:
  GET  /api/ioc/score/:iocValue
  POST /api/ioc/recalculate-scores

Correlation:
  GET  /api/ioc/correlate/:iocValue
  GET  /api/ioc/related/:iocValue
  POST /api/ioc/bulk-correlate

Relationships:
  POST /api/ioc/relationship
  GET  /api/ioc/graph/:iocValue
```

---

## 🎯 RÉSULTATS ATTENDUS

### Après 1 Semaine

```
Score IOC Enrichment:    75% → 100% (+25%)
Score Global AntStrike:  90% → 92% (+2%)

Nouvelles Capacités:
✅ Email enrichment (3 sources)
✅ Historical tracking (90 jours)
✅ Advanced threat scoring (multi-source)
✅ Pipeline orchestration (7 stages)
✅ Multi-source correlation
✅ Reputation decay automatique
✅ IOC relationship graph
✅ 12+ nouveaux endpoints
```

### Compétitivité

| Plateforme | Email | History | Scoring | Correlation |
|------------|-------|---------|---------|-------------|
| **AntStrike** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% |
| Recorded Future | ✅ | ✅ | ✅ | ✅ |
| Anomali | ✅ | ✅ | ⚠️ | ✅ |
| ThreatConnect | ✅ | ✅ | ✅ | ✅ |

**Verdict**: **100% compétitif avec leaders** ✅

---

## 🎉 CONCLUSION

### Avec 1 Semaine ($3,200)

✅ IOC Enrichment → **100%**  
✅ 5 types IOC supportés (IP, Hash, Domain, URL, Email)  
✅ 7 stages d'enrichissement  
✅ Multi-source correlation  
✅ Historical tracking  
✅ Graphe de relations  
✅ **$0/an** APIs (100% gratuit)  

### ROI

```
Développement:     $3,200 (one-time)
Valeur ajoutée:    Feature Premium ($2,000+/client/an)
5 clients:         $10,000/an valeur
ROI:               3x première année
```

---

**Prochaine étape**: Implémenter Email Enrichment (Jour 1-2) ? 🚀

**Créé**: 19 Octobre 2025  
**Roadmap**: 1 semaine → 100% complet  
**Budget**: $3,200 développement + $0/an APIs




