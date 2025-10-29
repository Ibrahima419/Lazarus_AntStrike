/**
 * 🔬 Analysis Routes
 * Routes unifiées pour analyse et corrélation
 */

import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';
import { TTPController } from '../controllers/ttp.controller';
import { CampaignController } from '../controllers/campaign.controller';
import { ThreatActorController } from '../controllers/threat-actor.controller';
import { GraphController } from '../controllers/graph.controller';
import { PredictiveController } from '../controllers/predictive.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/analysis/complete:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Analyse complète d'une menace
 *     description: |
 *       Effectue une analyse complète combinant:
 *       - **MITRE ATT&CK Mapping** (techniques utilisées)
 *       - **Cyber Kill Chain** (phases de l'attaque)
 *       - **Diamond Model** (Adversary, Capability, Infrastructure, Victim)
 *       
 *       Génère automatiquement des rapports détaillés pour chaque framework.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, type]
 *             properties:
 *               id:
 *                 type: string
 *                 example: "threat-12345"
 *               type:
 *                 type: string
 *                 example: "ransomware"
 *                 enum: [malware, ransomware, phishing, apt, trojan, backdoor]
 *               iocs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.1", "malicious.com", "http://evil.com/payload"]
 *               behaviors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["powershell execution", "data encryption", "lateral movement"]
 *               description:
 *                 type: string
 *                 example: "Ransomware campaign using PowerShell for execution"
 *               source:
 *                 type: string
 *                 example: "Threat Intelligence Report"
 *               affectedAssets:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["server-01", "workstation-23"]
 *     responses:
 *       200:
 *         description: Analyse complète réussie
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
 *                     threatId:
 *                       type: string
 *                     mitre:
 *                       type: object
 *                       properties:
 *                         techniques:
 *                           type: array
 *                           items:
 *                             type: object
 *                         count:
 *                           type: integer
 *                     killChain:
 *                       type: object
 *                       properties:
 *                         phases:
 *                           type: array
 *                           items:
 *                             type: object
 *                         count:
 *                           type: integer
 *                         report:
 *                           type: string
 *                           description: Rapport Markdown
 *                     diamond:
 *                       type: object
 *                       properties:
 *                         model:
 *                           type: object
 *                         report:
 *                           type: string
 *                           description: Rapport Markdown
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/complete', AnalysisController.completeAnalysis);

/**
 * @swagger
 * /api/analysis/kill-chain:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Analyse Cyber Kill Chain
 *     description: |
 *       Analyse une menace selon le modèle Cyber Kill Chain (Lockheed Martin).
 *       
 *       **7 Phases**:
 *       1. Reconnaissance
 *       2. Weaponization
 *       3. Delivery
 *       4. Exploitation
 *       5. Installation
 *       6. Command & Control
 *       7. Actions on Objectives
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *               iocs:
 *                 type: array
 *                 items:
 *                   type: string
 *               behaviors:
 *                 type: array
 *                 items:
 *                   type: string
 *               mitreTechniques:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analyse Kill Chain réussie
 *       400:
 *         description: Threat ID manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/kill-chain', AnalysisController.analyzeKillChain);

/**
 * @swagger
 * /api/analysis/diamond:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Analyse Diamond Model
 *     description: |
 *       Analyse une intrusion selon le modèle Diamond (4 nœuds).
 *       
 *       **4 Nœuds**:
 *       - **Adversary**: Attaquant (APT, motivation, pays)
 *       - **Capability**: Capacités (malware, techniques, exploits)
 *       - **Infrastructure**: Infrastructure (IPs, domaines, C2)
 *       - **Victim**: Victime (industrie, assets affectés)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *               iocs:
 *                 type: array
 *                 items:
 *                   type: string
 *               behaviors:
 *                 type: array
 *                 items:
 *                   type: string
 *               mitreTechniques:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               source:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analyse Diamond Model réussie
 *       400:
 *         description: Threat ID manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/diamond', AnalysisController.analyzeDiamond);

/**
 * @swagger
 * /api/analysis/stats:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Statistiques d'analyse
 *     description: |
 *       Statistiques complètes pour le tenant:
 *       - **MITRE ATT&CK**: Top techniques, tactics, coverage
 *       - **Kill Chain**: Distribution phases, fréquence
 *       - **Diamond Model**: Types adversaires, pivots, confidence
 *     responses:
 *       200:
 *         description: Statistiques d'analyse
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
 *                     mitre:
 *                       type: object
 *                     killChain:
 *                       type: object
 *                     diamond:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', AnalysisController.getStats);

// ===================================
// TTP EXTRACTION ROUTES
// ===================================

/**
 * @swagger
 * /api/analysis/extract-ttp:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Extraire TTPs depuis texte
 *     description: |
 *       Extraction automatique de Tactics, Techniques & Procedures depuis du texte libre.
 *       Utilise NLP + 1000+ patterns MITRE ATT&CK.
 *       
 *       **Modes**:
 *       - **Extraction seule**: text uniquement
 *       - **Extraction + Save**: text + sourceId + sourceType
 *       
 *       **Confidence**: 50-95 (save si >= 70)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Attackers used PowerShell to execute malicious code and establish persistence via scheduled tasks"
 *               sourceId:
 *                 type: string
 *                 example: "alert-123"
 *               sourceType:
 *                 type: string
 *                 enum: [alert, threat, case, manual]
 *                 example: "alert"
 *     responses:
 *       200:
 *         description: TTPs extraits
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
 *                     ttps:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tactic:
 *                             type: string
 *                           tacticId:
 *                             type: string
 *                           technique:
 *                             type: string
 *                           techniqueId:
 *                             type: string
 *                           confidence:
 *                             type: integer
 *                           evidence:
 *                             type: array
 *                             items:
 *                               type: string
 *                     stats:
 *                       type: object
 *       400:
 *         description: Texte manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/extract-ttp', TTPController.extractTTP);

/**
 * @swagger
 * /api/analysis/ttp/{sourceId}:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Obtenir TTPs d'une entité
 *     description: Récupère les TTPs extraits pour une alerte, menace ou case
 *     parameters:
 *       - in: path
 *         name: sourceId
 *         required: true
 *         schema:
 *           type: string
 *         example: "alert-123"
 *       - in: query
 *         name: sourceType
 *         schema:
 *           type: string
 *           enum: [alert, threat, case]
 *         description: Type de source (optionnel, cherche dans tous si absent)
 *     responses:
 *       200:
 *         description: Liste des TTPs
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/ttp/:sourceId', TTPController.getTTPs);

/**
 * @swagger
 * /api/analysis/ttp-timeline/{sourceId}:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Timeline TTPs (Kill Chain order)
 *     description: |
 *       Timeline des TTPs ordonnés selon le Cyber Kill Chain.
 *       Groupés par tactic avec metrics (count, avgConfidence).
 *       Coverage score indique % de tactics couvertes (max 12).
 *     parameters:
 *       - in: path
 *         name: sourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timeline reconstituée
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
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tactic:
 *                             type: string
 *                           techniques:
 *                             type: array
 *                           count:
 *                             type: integer
 *                           avgConfidence:
 *                             type: integer
 *                     totalTactics:
 *                       type: integer
 *                     totalTechniques:
 *                       type: integer
 *                     coverageScore:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/ttp-timeline/:sourceId', TTPController.getTTPTimeline);

/**
 * @swagger
 * /api/analysis/ttp-stats:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Statistiques TTPs du tenant
 *     description: |
 *       Statistiques globales:
 *       - Total TTPs extraits
 *       - Distribution par tactic
 *       - Top 10 techniques
 *       - Confidence moyenne
 *     responses:
 *       200:
 *         description: Statistiques TTPs
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/ttp-stats', TTPController.getStats);

// ===================================
// CAMPAIGN TRACKING ROUTES
// ===================================

/**
 * @swagger
 * /api/analysis/campaign:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Créer une campagne d'attaque
 *     description: |
 *       Créer et suivre une campagne d'attaque (APT, ransomware, etc.).
 *       
 *       **Champs clés**:
 *       - **name**: Nom de la campagne
 *       - **threatActor**: APT28, Lazarus, etc.
 *       - **sophistication**: low, medium, high, advanced
 *       - **targets**: secteurs, pays, assets ciblés
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Operation Aurora"
 *               description:
 *                 type: string
 *                 example: "Sophisticated APT campaign targeting tech companies"
 *               threatActor:
 *                 type: string
 *                 example: "APT28"
 *               motivation:
 *                 type: string
 *                 example: "espionage"
 *               sophistication:
 *                 type: string
 *                 enum: [low, medium, high, advanced, unknown]
 *                 example: "advanced"
 *               country:
 *                 type: string
 *                 example: "Russia"
 *               targetSectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Technology", "Finance"]
 *               targetCountries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["USA", "UK", "France"]
 *               iocs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.1", "evil.com"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["apt", "ransomware"]
 *               confidence:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 85
 *     responses:
 *       201:
 *         description: Campagne créée
 *       400:
 *         description: Nom manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/campaign', CampaignController.createCampaign);

/**
 * @swagger
 * /api/analysis/campaigns:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Lister les campagnes
 *     description: Obtenir toutes les campagnes avec filtres optionnels
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, dormant, ended]
 *         description: Filtrer par statut
 *       - in: query
 *         name: threatActor
 *         schema:
 *           type: string
 *         description: Filtrer par threat actor
 *       - in: query
 *         name: minConfidence
 *         schema:
 *           type: integer
 *         description: Confidence minimale
 *     responses:
 *       200:
 *         description: Liste des campagnes
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/campaigns', CampaignController.listCampaigns);

/**
 * @swagger
 * /api/analysis/campaign/{id}:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Obtenir une campagne
 *     description: |
 *       Obtenir détails complets d'une campagne avec métriques:
 *       - Durée (first/last seen)
 *       - IOCs et TTPs
 *       - Coverage MITRE ATT&CK
 *       - Targets (secteurs, pays)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la campagne
 *       404:
 *         description: Campagne non trouvée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/campaign/:id', CampaignController.getCampaign);

/**
 * @swagger
 * /api/analysis/campaign/{id}:
 *   patch:
 *     tags: [Analysis & Correlation]
 *     summary: Mettre à jour une campagne
 *     description: Modifier les attributs d'une campagne existante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, dormant, ended]
 *               confidence:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Campagne mise à jour
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/campaign/:id', CampaignController.updateCampaign);

/**
 * @swagger
 * /api/analysis/campaign/{id}/ioc:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Ajouter IOC à une campagne
 *     description: Lier un nouvel IOC à une campagne existante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ioc]
 *             properties:
 *               ioc:
 *                 type: string
 *                 example: "malicious.com"
 *     responses:
 *       200:
 *         description: IOC ajouté
 *       400:
 *         description: IOC manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/campaign/:id/ioc', CampaignController.addIOC);

/**
 * @swagger
 * /api/analysis/campaign/{id}/ttp:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Lier TTP à une campagne
 *     description: Associer un TTP existant à une campagne
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ttpId]
 *             properties:
 *               ttpId:
 *                 type: string
 *                 example: "ttp-123"
 *     responses:
 *       200:
 *         description: TTP lié
 *       400:
 *         description: ttpId manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/campaign/:id/ttp', CampaignController.linkTTP);

/**
 * @swagger
 * /api/analysis/campaign/auto-detect:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Auto-détecter campagnes
 *     description: |
 *       Détection automatique de campagnes existantes depuis IOCs/TTPs.
 *       
 *       **Scoring**:
 *       - IOC commun: +20 points
 *       - TTP commun: +30 points
 *       - Même threat actor: +40 points
 *       
 *       **Seuil**: 50 points minimum
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iocs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.1", "evil.com"]
 *               ttps:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["ttp-123", "ttp-456"]
 *               threatActor:
 *                 type: string
 *                 example: "APT28"
 *     responses:
 *       200:
 *         description: Campagnes détectées
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
 *                     found:
 *                       type: boolean
 *                     matches:
 *                       type: array
 *                       items:
 *                         type: object
 *                     suggestion:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/campaign/auto-detect', CampaignController.autoDetect);

/**
 * @swagger
 * /api/analysis/campaign/{id}/correlate:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Corréler campagnes similaires
 *     description: |
 *       Trouve les campagnes similaires basées sur:
 *       - IOCs communs (+15 pts/IOC)
 *       - Techniques communes (+20 pts/technique)
 *       - Même threat actor (+30 pts)
 *       - Même motivation (+10 pts)
 *       - Secteurs ciblés communs (+5 pts/secteur)
 *       
 *       **Seuil**: 30 points minimum
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campagnes corrélées
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/campaign/:id/correlate', CampaignController.correlateCampaigns);

/**
 * @swagger
 * /api/analysis/campaign/{id}/report:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Générer rapport de campagne
 *     description: |
 *       Rapport complet en Markdown:
 *       - Attribution (threat actor, motivation, pays)
 *       - Timeline (first/last seen, durée)
 *       - Scope (victimes, IOCs, TTPs, coverage)
 *       - Targets (secteurs, pays)
 *       - TTPs par tactic
 *       - Campagnes corrélées
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rapport généré
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
 *                     report:
 *                       type: string
 *                       description: Rapport en Markdown
 *                     format:
 *                       type: string
 *                       example: "markdown"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/campaign/:id/report', CampaignController.generateReport);

/**
 * @swagger
 * /api/analysis/campaign-stats:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Statistiques globales campagnes
 *     description: |
 *       Stats tenant:
 *       - Total campagnes
 *       - Distribution par statut
 *       - Top threat actors
 *       - Distribution sophistication
 *     responses:
 *       200:
 *         description: Statistiques campagnes
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/campaign-stats', CampaignController.getStats);

// ===================================
// THREAT ACTOR PROFILING ROUTES
// ===================================

/**
 * @swagger
 * /api/analysis/threat-actor:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Créer un profil threat actor
 *     description: |
 *       Créer et gérer le profil d'un acteur de menace (APT, cybercriminel, hacktivist).
 *       
 *       **Types**:
 *       - **apt**: Advanced Persistent Threat
 *       - **cybercrime**: Cybercriminalité organisée
 *       - **hacktivist**: Hacktivisme
 *       - **insider**: Menace interne
 *       - **nation_state**: État-nation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "APT28"
 *               aliases:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Fancy Bear", "Sofacy", "Sednit"]
 *               type:
 *                 type: string
 *                 enum: [apt, cybercrime, hacktivist, insider, nation_state, unknown]
 *                 example: "apt"
 *               country:
 *                 type: string
 *                 example: "Russia"
 *               sponsorship:
 *                 type: string
 *                 enum: [state, criminal, independent, unknown]
 *                 example: "state"
 *               motivation:
 *                 type: string
 *                 enum: [espionage, financial, sabotage, ideology, revenge, unknown]
 *                 example: "espionage"
 *               sophistication:
 *                 type: string
 *                 enum: [low, medium, high, advanced, unknown]
 *                 example: "advanced"
 *               targetSectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Government", "Military", "Defense"]
 *               targetCountries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["USA", "UK", "France"]
 *               tools:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["X-Agent", "Sofacy", "Komplex"]
 *               malwareFamilies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Zebrocy", "CHOPSTICK"]
 *               description:
 *                 type: string
 *               sources:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Profil créé
 *       400:
 *         description: Nom manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/threat-actor', ThreatActorController.createProfile);

/**
 * @swagger
 * /api/analysis/threat-actors:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Lister les threat actors
 *     description: Obtenir tous les profils avec filtres optionnels
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [apt, cybercrime, hacktivist, insider, nation_state]
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, dormant, inactive]
 *       - in: query
 *         name: threatLevel
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *     responses:
 *       200:
 *         description: Liste des threat actors
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/threat-actors', ThreatActorController.listProfiles);

/**
 * @swagger
 * /api/analysis/threat-actor/{id}:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Obtenir un profil threat actor
 *     description: |
 *       Profil complet avec:
 *       - Identification et attribution
 *       - TTPs observés
 *       - Campagnes liées
 *       - Infrastructure connue
 *       - Arsenal (tools, malware)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil complet
 *       404:
 *         description: Threat actor non trouvé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/threat-actor/:id', ThreatActorController.getProfile);

/**
 * @swagger
 * /api/analysis/threat-actor/{id}:
 *   patch:
 *     tags: [Analysis & Correlation]
 *     summary: Mettre à jour un profil
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/threat-actor/:id', ThreatActorController.updateProfile);

/**
 * @swagger
 * /api/analysis/threat-actor/{id}/infrastructure:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Ajouter infrastructure connue
 *     description: Ajouter IP, domaine ou email à l'infrastructure connue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, value]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ip, domain, email]
 *                 example: "domain"
 *               value:
 *                 type: string
 *                 example: "malicious-apt28.com"
 *     responses:
 *       200:
 *         description: Infrastructure ajoutée
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/threat-actor/:id/infrastructure', ThreatActorController.addInfrastructure);

/**
 * @swagger
 * /api/analysis/threat-actor/attribution:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Attribution automatique
 *     description: |
 *       Attribution intelligente depuis indicateurs.
 *       
 *       **Scoring**:
 *       - IOC d'infrastructure: +25 pts/IOC
 *       - TTP caractéristique: +20 pts/TTP
 *       - Malware signature: +20 pts/famille
 *       - Tool utilisé: +15 pts/outil
 *       - Secteur ciblé: +10 pts/secteur
 *       - Origine géographique: +15 pts
 *       
 *       **Seuil**: 40 points minimum
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iocs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.1", "evil.com"]
 *               ttps:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["T1566.001", "T1059.001"]
 *               tools:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Mimikatz", "Cobalt Strike"]
 *               malware:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Zebrocy", "CHOPSTICK"]
 *               targetSectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Government"]
 *               country:
 *                 type: string
 *                 example: "Russia"
 *     responses:
 *       200:
 *         description: Attribution résultats
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
 *                     found:
 *                       type: boolean
 *                     matches:
 *                       type: array
 *                     primarySuspect:
 *                       type: object
 *                     suggestion:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/threat-actor/attribution', ThreatActorController.autoAttribution);

/**
 * @swagger
 * /api/analysis/threat-actor/compare:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Comparer deux threat actors
 *     description: |
 *       Analyse comparative détaillée:
 *       - Similarités (pays, motivation, TTPs, secteurs)
 *       - Différences
 *       - Score de similarité (0-100)
 *       - Verdict (liés ou non)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [actorId1, actorId2]
 *             properties:
 *               actorId1:
 *                 type: string
 *               actorId2:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comparaison complète
 *       400:
 *         description: IDs manquants
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/threat-actor/compare', ThreatActorController.compareActors);

/**
 * @swagger
 * /api/analysis/threat-actor/{id}/report:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Générer rapport de profil
 *     description: |
 *       Rapport complet en Markdown:
 *       - Identification (nom, aliases, type)
 *       - Attribution (pays, sponsorship, motivation)
 *       - Timeline d'activité
 *       - Targets (secteurs, pays, technologies)
 *       - TTPs observés (top 10)
 *       - Arsenal (outils, malware)
 *       - Infrastructure connue
 *       - Campagnes liées
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rapport généré
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/threat-actor/:id/report', ThreatActorController.generateReport);

/**
 * @swagger
 * /api/analysis/threat-actor-stats:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Statistiques threat actors
 *     description: |
 *       Stats globales:
 *       - Total actors
 *       - Distribution par type
 *       - Top 10 pays
 *       - Distribution threat level
 *       - Nombre d'acteurs actifs
 *     responses:
 *       200:
 *         description: Statistiques globales
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/threat-actor-stats', ThreatActorController.getStats);

// ===================================
// GRAPH ANALYTICS ROUTES
// ===================================

/**
 * @swagger
 * /api/analysis/graph/build:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Construire un graphe CTI
 *     description: |
 *       Construit un graphe de relations depuis une entité centrale.
 *       
 *       **Types d'entités**:
 *       - **ioc**: Indicator of Compromise
 *       - **threat**: Menace
 *       - **actor**: Threat Actor
 *       - **campaign**: Campagne d'attaque
 *       - **ttp**: Tactic, Technique & Procedure
 *       
 *       **Profondeur (depth)**:
 *       - 1: Nœuds directement connectés
 *       - 2: Nœuds à 2 sauts (recommandé)
 *       - 3+: Graphe très large
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityId, entityType]
 *             properties:
 *               entityId:
 *                 type: string
 *                 example: "campaign-123"
 *               entityType:
 *                 type: string
 *                 enum: [ioc, threat, actor, campaign, ttp]
 *                 example: "campaign"
 *               depth:
 *                 type: integer
 *                 default: 2
 *                 example: 2
 *     responses:
 *       200:
 *         description: Graphe construit
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
 *                           type:
 *                             type: string
 *                           label:
 *                             type: string
 *                           metadata:
 *                             type: object
 *                     edges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           source:
 *                             type: string
 *                           target:
 *                             type: string
 *                           type:
 *                             type: string
 *                           weight:
 *                             type: number
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/graph/build', GraphController.buildGraph);

/**
 * @swagger
 * /api/analysis/graph/{entityType}/{entityId}:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Obtenir le graphe d'une entité
 *     description: Raccourci pour construire le graphe via GET
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ioc, threat, actor, campaign, ttp]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: depth
 *         schema:
 *           type: integer
 *           default: 2
 *     responses:
 *       200:
 *         description: Graphe de l'entité
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/graph/:entityType/:entityId', GraphController.getGraph);

/**
 * @swagger
 * /api/analysis/graph/centrality/pagerank:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Calculer PageRank (influence)
 *     description: |
 *       Algorithme PageRank pour identifier les nœuds les plus influents.
 *       
 *       **Interprétation**:
 *       - Score élevé = Nœud central/influent
 *       - Rank 1 = Nœud le plus influent
 *       
 *       **Paramètres**:
 *       - **iterations**: 20 par défaut
 *       - **dampingFactor**: 0.85 par défaut
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [graph]
 *             properties:
 *               graph:
 *                 type: object
 *                 description: Graphe obtenu via /graph/build
 *                 properties:
 *                   nodes:
 *                     type: array
 *                   edges:
 *                     type: array
 *               iterations:
 *                 type: integer
 *                 default: 20
 *               dampingFactor:
 *                 type: number
 *                 default: 0.85
 *     responses:
 *       200:
 *         description: Scores PageRank
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
 *                     type: object
 *                     properties:
 *                       nodeId:
 *                         type: string
 *                       score:
 *                         type: number
 *                       rank:
 *                         type: integer
 *       400:
 *         description: Graphe invalide
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/graph/centrality/pagerank', GraphController.calculatePageRank);

/**
 * @swagger
 * /api/analysis/graph/centrality/betweenness:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Calculer Betweenness Centrality (brokers)
 *     description: |
 *       Identifie les nœuds "intermédiaires" (brokers) dans le réseau.
 *       
 *       **Interprétation**:
 *       - Score élevé = Nœud passage obligé entre autres nœuds
 *       - Utile pour identifier points de contrôle/vulnérabilité
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [graph]
 *             properties:
 *               graph:
 *                 type: object
 *                 properties:
 *                   nodes:
 *                     type: array
 *                   edges:
 *                     type: array
 *     responses:
 *       200:
 *         description: Scores Betweenness
 *       400:
 *         description: Graphe invalide
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/graph/centrality/betweenness', GraphController.calculateBetweenness);

/**
 * @swagger
 * /api/analysis/graph/communities:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Détecter communautés (clusters)
 *     description: |
 *       Détection automatique de communautés via algorithme Louvain.
 *       
 *       **Interprétation**:
 *       - Groupe les nœuds fortement connectés
 *       - Densité = % connexions vs maximum possible
 *       - Utile pour identifier sous-campagnes, clusters APT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [graph]
 *             properties:
 *               graph:
 *                 type: object
 *                 properties:
 *                   nodes:
 *                     type: array
 *                   edges:
 *                     type: array
 *     responses:
 *       200:
 *         description: Communautés détectées
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nodes:
 *                         type: array
 *                         items:
 *                           type: string
 *                       size:
 *                         type: integer
 *                       density:
 *                         type: number
 *                 count:
 *                   type: integer
 *       400:
 *         description: Graphe invalide
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/graph/communities', GraphController.detectCommunities);

/**
 * @swagger
 * /api/analysis/graph/shortest-path:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Plus court chemin (Dijkstra)
 *     description: |
 *       Trouve le plus court chemin entre deux nœuds via algorithme Dijkstra.
 *       
 *       **Utilité**:
 *       - Tracer liens entre entités distantes
 *       - Identifier chaînes d'attaque
 *       - Comprendre propagation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [graph, sourceId, targetId]
 *             properties:
 *               graph:
 *                 type: object
 *                 properties:
 *                   nodes:
 *                     type: array
 *                   edges:
 *                     type: array
 *               sourceId:
 *                 type: string
 *                 example: "actor:apt28"
 *               targetId:
 *                 type: string
 *                 example: "campaign:operation-aurora"
 *     responses:
 *       200:
 *         description: Chemin trouvé (ou null)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     path:
 *                       type: array
 *                       items:
 *                         type: string
 *                     distance:
 *                       type: number
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/graph/shortest-path', GraphController.findShortestPath);

/**
 * @swagger
 * /api/analysis/graph/influence/{entityType}/{entityId}:
 *   get:
 *     tags: [Analysis & Correlation]
 *     summary: Calculer influence d'une entité
 *     description: |
 *       Score d'influence combinant plusieurs métriques:
 *       - **PageRank**: Influence générale
 *       - **Betweenness**: Rôle d'intermédiaire
 *       - **Degree**: Nombre de connexions
 *       
 *       **Score final (0-100)**:
 *       - 80-100: Très influent
 *       - 60-79: Influent
 *       - 40-59: Moyennement influent
 *       - 0-39: Peu influent
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ioc, threat, actor, campaign, ttp]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Métriques d'influence
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
 *                     entityId:
 *                       type: string
 *                     entityType:
 *                       type: string
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         pagerank:
 *                           type: number
 *                         pagerankRank:
 *                           type: integer
 *                         betweenness:
 *                           type: number
 *                         betweennessRank:
 *                           type: integer
 *                         degree:
 *                           type: integer
 *                         influenceScore:
 *                           type: integer
 *                     networkSize:
 *                       type: integer
 *                     connectionCount:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/graph/influence/:entityType/:entityId', GraphController.calculateInfluence);

// ===================================
// PREDICTIVE ANALYTICS ROUTES (ML)
// ===================================

/**
 * @swagger
 * /api/analysis/predict/threat-severity:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Prédire sévérité d'une menace (ML)
 *     description: |
 *       Machine Learning pour prédire la sévérité réelle d'une menace.
 *       
 *       **Modèle ML**:
 *       - Features: IOCs, TTPs, similarité campagnes, type
 *       - Scoring: 0-100 points
 *       - Output: low, medium, high, critical
 *       
 *       **Facteurs analysés**:
 *       - Nombre d'IOCs (jusqu'à +30 pts)
 *       - TTPs avancés (jusqu'à +25 pts)
 *       - Similarité campagnes critiques (+20 pts)
 *       - Type haut risque (+15 pts)
 *       - Confidence sources (+10 pts)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [threatId]
 *             properties:
 *               threatId:
 *                 type: string
 *                 example: "threat-123"
 *     responses:
 *       200:
 *         description: Prédiction effectuée
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
 *                     threatId:
 *                       type: string
 *                     threatType:
 *                       type: string
 *                     predictedSeverity:
 *                       type: string
 *                       enum: [low, medium, high, critical]
 *                     confidence:
 *                       type: integer
 *                       description: Confidence de la prédiction (0-100)
 *                     factors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Facteurs ayant influencé la prédiction
 *                     recommendation:
 *                       type: string
 *                       description: Recommandation d'action
 *       400:
 *         description: threatId manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/predict/threat-severity', PredictiveController.predictThreatSeverity);

/**
 * @swagger
 * /api/analysis/predict/campaign-evolution:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Prédire évolution d'une campagne (ML)
 *     description: |
 *       Machine Learning pour prédire la prochaine phase d'une campagne.
 *       
 *       **Cyber Kill Chain**:
 *       1. Reconnaissance
 *       2. Weaponization
 *       3. Delivery
 *       4. Exploitation
 *       5. Installation
 *       6. Command & Control
 *       7. Actions on Objectives
 *       
 *       **Facteurs analysés**:
 *       - Phases actuelles observées
 *       - Status campagne (active/dormant)
 *       - Activité récente (jours depuis lastSeen)
 *       - Confidence globale
 *       
 *       **Probabilité**:
 *       - Calculée dynamiquement (10-95%)
 *       - Timeframe estimé (24h à 4 semaines)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [campaignId]
 *             properties:
 *               campaignId:
 *                 type: string
 *                 example: "campaign-123"
 *     responses:
 *       200:
 *         description: Prédiction effectuée
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
 *                     campaignId:
 *                       type: string
 *                     currentStatus:
 *                       type: string
 *                     predictedNextPhase:
 *                       type: string
 *                       example: "Command & Control"
 *                     probability:
 *                       type: integer
 *                       description: Probabilité (10-95%)
 *                     timeframe:
 *                       type: string
 *                       example: "24-48 heures"
 *                     indicators:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Indicateurs à surveiller
 *       400:
 *         description: campaignId manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/predict/campaign-evolution', PredictiveController.predictCampaignEvolution);

/**
 * @swagger
 * /api/analysis/predict/next-ttp:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Prédire prochains TTPs (ML)
 *     description: |
 *       Machine Learning pour prédire les prochaines techniques utilisées.
 *       
 *       **Algorithme**:
 *       - Analyse 50 campagnes similaires
 *       - Identifie séquences TTP communes
 *       - Calcule probabilités basées sur patterns
 *       
 *       **Utilité**:
 *       - Anticipation des prochaines actions
 *       - Préparation défensive
 *       - Priorisation surveillance
 *       
 *       **Output**: Top 5 TTPs probables
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [campaignId]
 *             properties:
 *               campaignId:
 *                 type: string
 *                 example: "campaign-123"
 *     responses:
 *       200:
 *         description: Prédictions TTPs
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
 *                     type: object
 *                     properties:
 *                       nextTTP:
 *                         type: string
 *                         example: "T1059.001"
 *                       probability:
 *                         type: integer
 *                         description: Probabilité (10-95%)
 *                       basedOn:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: TTPs actuels utilisés pour prédiction
 *                       relatedCampaigns:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Campagnes ayant utilisé ce pattern
 *                 count:
 *                   type: integer
 *       400:
 *         description: campaignId manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/predict/next-ttp', PredictiveController.predictNextTTP);

/**
 * @swagger
 * /api/analysis/detect-anomalies:
 *   post:
 *     tags: [Analysis & Correlation]
 *     summary: Détecter anomalies (ML)
 *     description: |
 *       Machine Learning pour détecter comportements anormaux.
 *       
 *       **Types d'anomalies**:
 *       - **activity_pattern**: Durée/fréquence inhabituelle
 *       - **ttp_unusual**: TTPs non-standards
 *       - **target_unusual**: Cibles atypiques
 *       
 *       **Scoring**:
 *       - Anomaly Score: 0-100
 *       - Baseline vs Current
 *       - % Deviation
 *       
 *       **Utilité**:
 *       - Early warning
 *       - Détection évolution campagne
 *       - Identification pivots stratégiques
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityType, entityId]
 *             properties:
 *               entityType:
 *                 type: string
 *                 enum: [campaign, actor, threat]
 *                 example: "campaign"
 *               entityId:
 *                 type: string
 *                 example: "campaign-123"
 *     responses:
 *       200:
 *         description: Anomalies détectées
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
 *                     type: object
 *                     properties:
 *                       entityId:
 *                         type: string
 *                       entityType:
 *                         type: string
 *                       anomalyType:
 *                         type: string
 *                       anomalyScore:
 *                         type: integer
 *                         description: Score d'anomalie (0-100)
 *                       baseline:
 *                         type: object
 *                         description: Valeurs baseline attendues
 *                       current:
 *                         type: object
 *                         description: Valeurs actuelles observées
 *                       deviation:
 *                         type: integer
 *                         description: % de déviation
 *                 count:
 *                   type: integer
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/detect-anomalies', PredictiveController.detectAnomalies);

export default router;

