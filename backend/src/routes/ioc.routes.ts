import { Router } from 'express';
import { IOCController } from '../controllers/ioc.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @swagger
 * /api/ioc/enrich:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Enrichir un IOC (IP, Hash, Domain, URL)
 *     description: |
 *       Enrichit un Indicator of Compromise avec des données de threat intelligence depuis des APIs externes:
 *       - **IP**: AbuseIPDB (reputation) + IPInfo (geolocation)
 *       - **Hash**: VirusTotal (détections antivirus)
 *       - **Domain**: VirusTotal (reputation, phishing, malware)
 *       - **URL**: VirusTotal (reputation, phishing)
 *       
 *       Résultats mis en cache pendant 24h pour optimiser la performance.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IOCEnrichRequest'
 *           examples:
 *             ipExample:
 *               summary: Enrichir une IP
 *               value:
 *                 iocValue: "8.8.8.8"
 *                 iocType: "IP"
 *                 tenantId: "123e4567-e89b-12d3-a456-426614174000"
 *             hashExample:
 *               summary: Enrichir un hash MD5
 *               value:
 *                 iocValue: "44d88612fea8a8f36de82e1278abb02f"
 *                 iocType: "FILE_HASH"
 *                 tenantId: "123e4567-e89b-12d3-a456-426614174000"
 *             domainExample:
 *               summary: Enrichir un domaine
 *               value:
 *                 iocValue: "google.com"
 *                 iocType: "DOMAIN"
 *                 tenantId: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: IOC enrichi avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IOCEnrichResponse'
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Erreur lors de l'enrichissement
 */
router.post('/enrich', IOCController.enrichIOC);

/**
 * @swagger
 * /api/ioc/bulk-enrich:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Enrichir plusieurs IOCs en batch
 *     description: Enrichit plusieurs IOCs en parallèle (max 100 par requête)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [iocs, tenantId]
 *             properties:
 *               iocs:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   type: object
 *                   required: [iocValue, iocType]
 *                   properties:
 *                     iocValue:
 *                       type: string
 *                     iocType:
 *                       type: string
 *                       enum: [IP, DOMAIN, URL, FILE_HASH, EMAIL, CVE]
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: IOCs enrichis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IOCEnrichResponse/properties/data'
 *       400:
 *         description: Trop d'IOCs (max 100)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/bulk-enrich', IOCController.bulkEnrichIOCs);

/**
 * @swagger
 * /api/ioc/extract:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Extraire les IOCs depuis un texte
 *     description: |
 *       Extrait automatiquement les IOCs depuis du texte brut (logs, rapports, articles).
 *       Détecte: IPs, Domains, URLs, Emails, File Hashes (MD5, SHA1, SHA256), CVEs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text, tenantId]
 *             properties:
 *               text:
 *                 type: string
 *                 description: Texte contenant des IOCs
 *                 example: "Suspicious activity from 192.168.1.100 accessing malware.example.com"
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *               enrich:
 *                 type: boolean
 *                 default: false
 *                 description: Enrichir automatiquement les IOCs extraits
 *     responses:
 *       200:
 *         description: IOCs extraits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 iocs:
 *                   type: object
 *                   properties:
 *                     ips:
 *                       type: array
 *                       items:
 *                         type: string
 *                     domains:
 *                       type: array
 *                       items:
 *                         type: string
 *                     urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                     emails:
 *                       type: array
 *                       items:
 *                         type: string
 *                     fileHashes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     cves:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/extract', IOCController.extractIOCs);

/**
 * @swagger
 * /api/ioc:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Liste des IOCs enrichis
 *     description: Récupère tous les IOCs enrichis du tenant avec filtres optionnels
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du tenant
 *       - in: query
 *         name: iocType
 *         schema:
 *           type: string
 *           enum: [IP, DOMAIN, URL, FILE_HASH, EMAIL, CVE]
 *         description: Filtrer par type d'IOC
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 1000
 *         description: Nombre max de résultats
 *     responses:
 *       200:
 *         description: Liste des IOCs enrichis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IOCEnrichResponse/properties/data'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', IOCController.getEnrichedIOCs);

/**
 * @swagger
 * /api/ioc/check-breach:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Vérifier si email a été breached
 *     description: |
 *       Vérifie si une adresse email a été compromise dans des data breaches.
 *       Utilise HaveIBeenPwned, EmailRep.io, et Hunter.io.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "test@adobe.com"
 *     responses:
 *       200:
 *         description: Résultat de la vérification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     breached:
 *                       type: boolean
 *                     breachCount:
 *                       type: integer
 *                     breaches:
 *                       type: array
 *                       items:
 *                         type: object
 *                     reputation:
 *                       type: string
 *                     threatScore:
 *                       type: integer
 *       400:
 *         description: Email manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/check-breach', IOCController.checkBreach);

/**
 * @swagger
 * /api/ioc/email/{email}:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Obtenir détails d'un email enrichi
 *     description: Récupère ou enrichit à la volée une adresse email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         example: "admin@example.com"
 *     responses:
 *       200:
 *         description: Email enrichi
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/email/:email', IOCController.getEmail);

/**
 * @swagger
 * /api/ioc/history/{iocValue}:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Obtenir l'historique d'un IOC
 *     description: Récupère tous les snapshots historiques d'un IOC (90 jours par défaut)
 *     parameters:
 *       - in: path
 *         name: iocValue
 *         required: true
 *         schema:
 *           type: string
 *         example: "8.8.8.8"
 *       - in: query
 *         name: iocType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [IP, DOMAIN, URL, FILE_HASH, EMAIL, CVE]
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *     responses:
 *       200:
 *         description: Historique de l'IOC
 *       400:
 *         description: iocType manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/history/:iocValue', IOCController.getHistory);

/**
 * @swagger
 * /api/ioc/trend/{iocValue}:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Analyser la tendance d'un IOC
 *     description: |
 *       Analyse l'évolution du threat score et de la réputation.
 *       Retourne: tendance (increasing/decreasing/stable), min/max/avg, volatilité.
 *     parameters:
 *       - in: path
 *         name: iocValue
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: iocType
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Analyse de tendance
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/trend/:iocValue', IOCController.getTrend);

/**
 * @swagger
 * /api/ioc/changes:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Changements récents des IOCs
 *     description: |
 *       Détecte les changements significatifs:
 *       - Changements de réputation
 *       - Spikes de threat score (>20 points)
 *       - Drops de threat score
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Liste des changements
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/changes', IOCController.getChanges);

/**
 * @swagger
 * /api/ioc/snapshot:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Forcer snapshot manuel d'un IOC
 *     description: Enregistre immédiatement un snapshot historique
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [iocValue, iocType]
 *             properties:
 *               iocValue:
 *                 type: string
 *               iocType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Snapshot enregistré
 *       400:
 *         description: IOC non trouvé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/snapshot', IOCController.forceSnapshot);

/**
 * @swagger
 * /api/ioc/score/{iocValue}:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Obtenir le threat score détaillé d'un IOC
 *     description: |
 *       Retourne le scoring complet avec:
 *       - Threat score (0-100)
 *       - Confidence (0-100)
 *       - Reputation (clean → malicious)
 *       - Priority (P0-P3)
 *       - Recommendations
 *     parameters:
 *       - in: path
 *         name: iocValue
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: iocType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Threat score détaillé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/score/:iocValue', IOCController.getScore);

/**
 * @swagger
 * /api/ioc/recalculate-scores:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Recalculer tous les threat scores
 *     description: |
 *       Recalcule les scores de tous les IOCs avec l'algorithme actuel.
 *       Utile après mise à jour de l'algorithme de scoring.
 *     responses:
 *       200:
 *         description: Scores recalculés
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/recalculate-scores', IOCController.recalculateScores);

/**
 * @swagger
 * /api/ioc/reputation-stats:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Statistiques par réputation
 *     description: Distribution des IOCs par niveau de réputation
 *     responses:
 *       200:
 *         description: Statistiques
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     byReputation:
 *                       type: object
 *                       properties:
 *                         malicious:
 *                           type: integer
 *                         suspicious:
 *                           type: integer
 *                         questionable:
 *                           type: integer
 *                         low-risk:
 *                           type: integer
 *                         clean:
 *                           type: integer
 *                         unknown:
 *                           type: integer
 *                     percentages:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/reputation-stats', IOCController.getReputationStats);

/**
 * @swagger
 * /api/ioc/pipeline:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Enrichment avec pipeline détaillé
 *     description: |
 *       Exécute le pipeline complet d'enrichissement en 7 étapes:
 *       1. Validation
 *       2. Cache Check
 *       3. Primary Enrichment (APIs)
 *       4. Secondary Enrichment (MISP, Feeds)
 *       5. Threat Scoring
 *       6. Historical Recording
 *       7. Alert Generation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [iocValue, iocType]
 *             properties:
 *               iocValue:
 *                 type: string
 *               iocType:
 *                 type: string
 *               source:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pipeline exécuté
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/pipeline', IOCController.executePipeline);

/**
 * @swagger
 * /api/ioc/correlate/{iocValue}:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Corrélation multi-sources d'un IOC
 *     description: |
 *       Corrèle un IOC à travers toutes les sources:
 *       - Primary enrichment
 *       - MISP events
 *       - OSINT feeds
 *       - Dark Web mentions
 *       - Honeypot logs
 *       - Historical data
 *     parameters:
 *       - in: path
 *         name: iocValue
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: iocType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Corrélation complète
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/correlate/:iocValue', IOCController.correlate);

/**
 * @swagger
 * /api/ioc/related/{iocValue}:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Obtenir IOCs reliés
 *     description: Trouve les IOCs apparaissant dans les mêmes alertes/cases
 *     parameters:
 *       - in: path
 *         name: iocValue
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: IOCs reliés
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/related/:iocValue', IOCController.getRelated);

/**
 * @swagger
 * /api/ioc/bulk-correlate:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Corrélation bulk (max 50 IOCs)
 *     description: Corrèle plusieurs IOCs en parallèle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [iocs]
 *             properties:
 *               iocs:
 *                 type: array
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                     type:
 *                       type: string
 *     responses:
 *       200:
 *         description: Corrélations terminées
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/bulk-correlate', IOCController.bulkCorrelate);

/**
 * @swagger
 * /api/ioc/apply-decay:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Appliquer reputation decay
 *     description: |
 *       Applique la décroissance exponentielle des scores.
 *       Score réduit de 50% après 30 jours (half-life).
 *     responses:
 *       200:
 *         description: Decay appliqué
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/apply-decay', IOCController.applyDecay);

/**
 * @swagger
 * /api/ioc/decay-stats:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Statistiques reputation decay
 *     description: |
 *       Distribution des IOCs par âge:
 *       - Fresh (<7 jours)
 *       - Aging (7-30 jours)
 *       - Stale (30-90 jours)
 *       - Expired (>90 jours)
 *     responses:
 *       200:
 *         description: Statistiques
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/decay-stats', IOCController.getDecayStats);

/**
 * @swagger
 * /api/ioc/needs-refresh:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: IOCs nécessitant refresh
 *     description: Liste des IOCs avec decay >30 jours
 *     parameters:
 *       - in: query
 *         name: maxDays
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: IOCs à refresh
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/needs-refresh', IOCController.getNeedsRefresh);

/**
 * @swagger
 * /api/ioc/auto-refresh:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Auto-refresh IOCs expirés
 *     description: Ré-enrichit automatiquement les IOCs avec decay >30 jours
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxCount:
 *                 type: integer
 *                 default: 50
 *                 maximum: 200
 *     responses:
 *       200:
 *         description: Refresh terminé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/auto-refresh', IOCController.autoRefresh);

/**
 * @swagger
 * /api/ioc/relationship:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Créer relation entre IOCs
 *     description: |
 *       Crée une relation entre 2 IOCs.
 *       
 *       **Types de relations**:
 *       - same_campaign
 *       - same_infrastructure
 *       - same_actor
 *       - same_malware_family
 *       - observed_together
 *       - sequential
 *       - related
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ioc1, ioc2, relationshipType]
 *             properties:
 *               ioc1:
 *                 type: string
 *                 example: "192.168.1.1"
 *               ioc2:
 *                 type: string
 *                 example: "malicious.com"
 *               relationshipType:
 *                 type: string
 *                 enum: [same_campaign, same_infrastructure, same_actor, same_malware_family, observed_together, sequential, related]
 *                 example: "same_campaign"
 *               confidence:
 *                 type: integer
 *                 default: 70
 *                 minimum: 0
 *                 maximum: 100
 *               context:
 *                 type: object
 *                 description: Contexte additionnel (optionnel)
 *     responses:
 *       200:
 *         description: Relation créée
 *       400:
 *         description: Paramètres manquants
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/relationship', IOCController.createRelationship);

/**
 * @swagger
 * /api/ioc/graph/{iocValue}:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Obtenir graphe de relations d'un IOC
 *     description: |
 *       Construit un graphe de relations (BFS) à partir d'un IOC.
 *       Retourne nodes (IOCs) et edges (relations).
 *       
 *       Utilise algorithme BFS avec profondeur configurable.
 *     parameters:
 *       - in: path
 *         name: iocValue
 *         required: true
 *         schema:
 *           type: string
 *         example: "192.168.1.1"
 *       - in: query
 *         name: depth
 *         schema:
 *           type: integer
 *           default: 2
 *           minimum: 1
 *           maximum: 5
 *         description: Profondeur du graphe (nombre de sauts)
 *     responses:
 *       200:
 *         description: Graphe de relations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     nodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           iocValue:
 *                             type: string
 *                           iocType:
 *                             type: string
 *                           threatScore:
 *                             type: integer
 *                           reputation:
 *                             type: string
 *                           degree:
 *                             type: integer
 *                     edges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           source:
 *                             type: string
 *                           target:
 *                             type: string
 *                           relationshipType:
 *                             type: string
 *                           confidence:
 *                             type: integer
 *                           weight:
 *                             type: number
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalNodes:
 *                           type: integer
 *                         totalEdges:
 *                           type: integer
 *                         avgDegree:
 *                           type: number
 *                         clusters:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/graph/:iocValue', IOCController.getGraph);

/**
 * @swagger
 * /api/ioc/auto-detect-relationships:
 *   post:
 *     tags: [IOC Enrichment]
 *     summary: Auto-détecter relations entre IOCs
 *     description: |
 *       Détecte automatiquement les relations en analysant:
 *       - IOCs dans les mêmes alertes
 *       - IOCs dans les mêmes cases
 *       
 *       Crée des relations "observed_together" avec confidence 80%.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxIOCs:
 *                 type: integer
 *                 default: 100
 *     responses:
 *       200:
 *         description: Relations détectées
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/auto-detect-relationships', IOCController.autoDetectRelationships);

/**
 * @swagger
 * /api/ioc/relationship-stats:
 *   get:
 *     tags: [IOC Enrichment]
 *     summary: Statistiques des relations IOC
 *     description: Stats par type de relation et top IOCs connectés
 *     responses:
 *       200:
 *         description: Statistiques
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/relationship-stats', IOCController.getRelationshipStats);

export default router;

