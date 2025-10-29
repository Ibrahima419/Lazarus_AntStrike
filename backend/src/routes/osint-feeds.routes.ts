/**
 * 📡 OSINT Feeds Routes
 */

import { Router } from 'express';
import { OSINTFeedsController } from '../controllers/osint-feeds.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/osint-feeds:
 *   get:
 *     tags: [OSINT Feeds]
 *     summary: Liste des feeds OSINT disponibles
 *     description: |
 *       Retourne tous les feeds OSINT publics configurés dans la plateforme.
 *       
 *       **8 Feeds gratuits inclus**:
 *       - **Abuse.ch Feodo Tracker**: Botnet C2 IPs
 *       - **Abuse.ch URLhaus**: Malware URLs
 *       - **Abuse.ch ThreatFox**: Mixed IOCs
 *       - **Blocklist.de**: Attack IPs
 *       - **Emerging Threats**: Compromised IPs
 *       - **PhishTank**: Phishing URLs
 *       - **Tor Exit Nodes**: Anonymization IPs
 *       - **SSL Blacklist**: Malicious SSL IPs
 *     responses:
 *       200:
 *         description: Liste des feeds
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
 *                         type: string
 *                       name:
 *                         type: string
 *                       url:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [ip, domain, url, hash, mixed]
 *                       format:
 *                         type: string
 *                       updateFrequency:
 *                         type: integer
 *                         description: Minutes
 *                       enabled:
 *                         type: boolean
 *                       description:
 *                         type: string
 *                 count:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', OSINTFeedsController.listFeeds);

/**
 * @swagger
 * /api/osint-feeds/import:
 *   post:
 *     tags: [OSINT Feeds]
 *     summary: Import manuel de tous les feeds actifs
 *     description: |
 *       Lance l'import manuel de tous les feeds OSINT activés.
 *       Peut importer plusieurs milliers d'IOCs.
 *       
 *       **⚠️ Opération longue**: Peut prendre 2-5 minutes selon les feeds.
 *     responses:
 *       200:
 *         description: Import terminé
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
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           feedId:
 *                             type: string
 *                           feedName:
 *                             type: string
 *                           imported:
 *                             type: integer
 *                           skipped:
 *                             type: integer
 *                           errors:
 *                             type: integer
 *                     summary:
 *                       type: object
 *                       properties:
 *                         feedsProcessed:
 *                           type: integer
 *                         totalImported:
 *                           type: integer
 *                         totalSkipped:
 *                           type: integer
 *                         totalErrors:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/import', OSINTFeedsController.importAll);

/**
 * @swagger
 * /api/osint-feeds/import/{feedId}:
 *   post:
 *     tags: [OSINT Feeds]
 *     summary: Import manuel d'un feed spécifique
 *     description: Importe les IOCs d'un seul feed OSINT
 *     parameters:
 *       - in: path
 *         name: feedId
 *         required: true
 *         schema:
 *           type: string
 *         example: "abuse-ch-feodotracker"
 *     responses:
 *       200:
 *         description: Feed importé
 *       400:
 *         description: Feed non trouvé ou désactivé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/import/:feedId', OSINTFeedsController.importFeed);

/**
 * @swagger
 * /api/osint-feeds/configure:
 *   post:
 *     tags: [OSINT Feeds]
 *     summary: Configurer les feeds OSINT
 *     description: |
 *       Configure l'import automatique des feeds OSINT pour le tenant.
 *       Permet d'activer/désactiver auto-import et sélectionner feeds.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 default: true
 *               autoImport:
 *                 type: boolean
 *                 default: true
 *                 description: Import automatique quotidien
 *               importInterval:
 *                 type: integer
 *                 default: 24
 *                 description: Intervalle en heures (1-24)
 *               selectedFeeds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs des feeds à importer (tous si omis)
 *     responses:
 *       200:
 *         description: Configuration sauvegardée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/configure', OSINTFeedsController.configure);

/**
 * @swagger
 * /api/osint-feeds/stats:
 *   get:
 *     tags: [OSINT Feeds]
 *     summary: Statistiques des feeds OSINT
 *     description: Stats et historique des imports de feeds
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
 *                     availableFeeds:
 *                       type: integer
 *                     activeFeeds:
 *                       type: integer
 *                     totalIOCsFromFeeds:
 *                       type: integer
 *                     lastImport:
 *                       type: object
 *                       nullable: true
 *                     topFeeds:
 *                       type: array
 *                       items:
 *                         type: object
 *                     importHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', OSINTFeedsController.getStats);

export default router;




