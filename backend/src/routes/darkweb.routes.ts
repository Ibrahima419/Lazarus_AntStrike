/**
 * 🕵️ Dark Web Routes
 */

import { Router } from 'express';
import { DarkWebController } from '../controllers/darkweb.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/darkweb/scan:
 *   post:
 *     tags: [Dark Web]
 *     summary: Scanner Dark Web pour mentions
 *     description: |
 *       Lance un scan complet du Dark Web sur:
 *       - **Pastebin** (leaks, credentials)
 *       - **GitHub Gists** (code, configs)
 *       - **Tor Hidden Services** (.onion lists)
 *       - **Telegram Channels** (threat intel)
 *       
 *       Utilise les keywords configurés pour le tenant.
 *     responses:
 *       200:
 *         description: Scan terminé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pastebin:
 *                       type: integer
 *                     github:
 *                       type: integer
 *                     tor:
 *                       type: integer
 *                     telegram:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/scan', DarkWebController.scan);

/**
 * @swagger
 * /api/darkweb/monitor/pastebin:
 *   post:
 *     tags: [Dark Web]
 *     summary: Monitorer Pastebin
 *     description: Recherche mentions sur Pastebin avec keywords spécifiques
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [keywords]
 *             properties:
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["company-name", "domain.com", "email@company.com"]
 *     responses:
 *       200:
 *         description: Mentions trouvées
 *       400:
 *         description: Keywords manquants
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/monitor/pastebin', DarkWebController.monitorPastebin);

/**
 * @swagger
 * /api/darkweb/monitor/github:
 *   post:
 *     tags: [Dark Web]
 *     summary: Monitorer GitHub Gists
 *     description: Recherche code/configs exposés sur GitHub
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [keywords]
 *             properties:
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Mentions trouvées
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/monitor/github', DarkWebController.monitorGitHub);

/**
 * @swagger
 * /api/darkweb/monitor/telegram:
 *   post:
 *     tags: [Dark Web]
 *     summary: Monitorer Telegram channels
 *     description: Surveille channels Telegram CTI publics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [channels]
 *             properties:
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["threatintel", "cybersec", "darkwebintel"]
 *     responses:
 *       200:
 *         description: Mentions trouvées
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/monitor/telegram', DarkWebController.monitorTelegram);

/**
 * @swagger
 * /api/darkweb/mentions:
 *   get:
 *     tags: [Dark Web]
 *     summary: Liste des mentions Dark Web
 *     description: Récupère toutes les mentions détectées
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Liste des mentions
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/mentions', DarkWebController.getMentions);

/**
 * @swagger
 * /api/darkweb/configure:
 *   post:
 *     tags: [Dark Web]
 *     summary: Configurer Dark Web monitoring
 *     description: |
 *       Configure la surveillance Dark Web pour le tenant.
 *       Keywords doivent inclure nom société, domaines, emails clés.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [keywords]
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 default: true
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["acme-corp", "acme.com", "admin@acme.com"]
 *               telegramChannels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["threatintel", "cybersec"]
 *               monitorPastebin:
 *                 type: boolean
 *                 default: true
 *               monitorGitHub:
 *                 type: boolean
 *                 default: true
 *               monitorTor:
 *                 type: boolean
 *                 default: true
 *               autoImport:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Configuration sauvegardée
 *       400:
 *         description: Keywords manquants
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/configure', DarkWebController.configure);

/**
 * @swagger
 * /api/darkweb/stats:
 *   get:
 *     tags: [Dark Web]
 *     summary: Statistiques Dark Web
 *     description: Stats des mentions détectées et sources
 *     responses:
 *       200:
 *         description: Statistiques
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', DarkWebController.getStats);

export default router;




