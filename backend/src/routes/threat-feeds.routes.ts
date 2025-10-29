/**
 * 🎯 Threat Feeds Routes
 */

import { Router } from 'express';
import { ThreatFeedsController } from '../controllers/threat-feeds.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/threat-feeds:
 *   get:
 *     tags: [Threat Feeds]
 *     summary: Liste des threat feeds disponibles
 *     description: |
 *       Retourne les feeds de threat intelligence commerciaux (gratuits):
 *       - **AlienVault OTX**: 19M+ pulses, 100K+ contributors
 *       - **MalwareBazaar**: 1M+ malware samples
 *       - **ThreatFox**: IOCs from malware researchers
 *       - **URLhaus**: Malware distribution URLs
 *     responses:
 *       200:
 *         description: Liste des feeds
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', ThreatFeedsController.listFeeds);

/**
 * @swagger
 * /api/threat-feeds/sync:
 *   post:
 *     tags: [Threat Feeds]
 *     summary: Synchroniser tous les threat feeds
 *     description: |
 *       Importe les IOCs depuis tous les feeds activés:
 *       - AlienVault OTX (pulses récents)
 *       - MalwareBazaar (100 derniers samples)
 *       - ThreatFox (7 derniers jours)
 *       - URLhaus (200 URLs récentes)
 *     responses:
 *       200:
 *         description: Sync terminée
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
 *                     alienVaultOTX:
 *                       type: object
 *                       properties:
 *                         imported:
 *                           type: integer
 *                         skipped:
 *                           type: integer
 *                     malwareBazaar:
 *                       type: object
 *                     threatFox:
 *                       type: object
 *                     urlhaus:
 *                       type: object
 *                     total:
 *                       type: object
 *                       properties:
 *                         imported:
 *                           type: integer
 *                         skipped:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/sync', ThreatFeedsController.syncAll);

/**
 * @swagger
 * /api/threat-feeds/sync/otx:
 *   post:
 *     tags: [Threat Feeds]
 *     summary: Synchroniser AlienVault OTX
 *     description: |
 *       Importe les pulses récents depuis AlienVault OTX.
 *       Nécessite OTX_API_KEY dans .env (gratuit).
 *     responses:
 *       200:
 *         description: Sync OTX terminée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/sync/otx', ThreatFeedsController.syncOTX);

/**
 * @swagger
 * /api/threat-feeds/sync/malwarebazaar:
 *   post:
 *     tags: [Threat Feeds]
 *     summary: Synchroniser MalwareBazaar
 *     description: Importe les 100 derniers malware samples (hashes)
 *     responses:
 *       200:
 *         description: Sync MalwareBazaar terminée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/sync/malwarebazaar', ThreatFeedsController.syncMalwareBazaar);

/**
 * @swagger
 * /api/threat-feeds/configure:
 *   post:
 *     tags: [Threat Feeds]
 *     summary: Configurer threat feeds
 *     description: Active/désactive les feeds et configure auto-sync
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
 *               autoSync:
 *                 type: boolean
 *                 default: true
 *               syncInterval:
 *                 type: integer
 *                 default: 24
 *                 description: Intervalle en heures
 *               feeds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["alienvault-otx", "malwarebazaar", "threatfox", "urlhaus"]
 *     responses:
 *       200:
 *         description: Configuration sauvegardée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/configure', ThreatFeedsController.configure);

/**
 * @swagger
 * /api/threat-feeds/stats:
 *   get:
 *     tags: [Threat Feeds]
 *     summary: Statistiques threat feeds
 *     description: Stats par feed et historique sync
 *     responses:
 *       200:
 *         description: Statistiques
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', ThreatFeedsController.getStats);

export default router;




