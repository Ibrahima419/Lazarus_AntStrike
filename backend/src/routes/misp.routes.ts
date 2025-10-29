/**
 * 🔗 MISP Routes
 */

import { Router } from 'express';
import { MISPController } from '../controllers/misp.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/misp/configure:
 *   post:
 *     tags: [MISP]
 *     summary: Configurer MISP pour le tenant
 *     description: |
 *       Configure la connexion à une instance MISP (Malware Information Sharing Platform).
 *       Permet la synchronisation bi-directionnelle des IOCs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url, apiKey]
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://misp.example.com"
 *                 description: URL de l'instance MISP
 *               apiKey:
 *                 type: string
 *                 example: "YOUR_MISP_API_KEY"
 *                 description: Clé API MISP (Authkey)
 *               enabled:
 *                 type: boolean
 *                 default: true
 *               autoSync:
 *                 type: boolean
 *                 default: false
 *                 description: Synchronisation automatique toutes les heures
 *               syncInterval:
 *                 type: integer
 *                 default: 3600
 *                 description: Intervalle de sync en secondes
 *               verifySsl:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: MISP configuré
 *       400:
 *         description: Paramètres invalides ou connexion échouée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/configure', MISPController.configure);

/**
 * @swagger
 * /api/misp/test:
 *   post:
 *     tags: [MISP]
 *     summary: Tester connexion MISP
 *     description: Vérifie que la connexion à MISP fonctionne
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url, apiKey]
 *             properties:
 *               url:
 *                 type: string
 *               apiKey:
 *                 type: string
 *               verifySsl:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Résultat du test
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 connected:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/test', MISPController.testConnection);

/**
 * @swagger
 * /api/misp/events:
 *   get:
 *     tags: [MISP]
 *     summary: Récupérer events MISP
 *     description: Liste les events publiés récents depuis l'instance MISP configurée
 *     parameters:
 *       - in: query
 *         name: lastDays
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Nombre de jours à récupérer
 *     responses:
 *       200:
 *         description: Liste des events MISP
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
 *                 count:
 *                   type: integer
 *       400:
 *         description: MISP non configuré
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/events', MISPController.getEvents);

/**
 * @swagger
 * /api/misp/attributes:
 *   get:
 *     tags: [MISP]
 *     summary: Récupérer attributes MISP (IOCs)
 *     description: Liste les attributes/IOCs depuis MISP avec filtres
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           example: "ip-src"
 *         description: Type MISP (ip-src, domain, url, md5, etc.)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: "Network activity"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1000
 *           maximum: 10000
 *     responses:
 *       200:
 *         description: Liste des attributes
 *       400:
 *         description: MISP non configuré
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/attributes', MISPController.getAttributes);

/**
 * @swagger
 * /api/misp/sync:
 *   post:
 *     tags: [MISP]
 *     summary: Synchroniser IOCs MISP → AntStrike
 *     description: |
 *       Importe les IOCs depuis MISP vers AntStrike CTI.
 *       Peut être lancé manuellement ou automatiquement (si autoSync activé).
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastDays:
 *                 type: integer
 *                 default: 7
 *                 description: Récupérer IOCs des X derniers jours
 *               types:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["IP", "DOMAIN", "FILE_HASH"]
 *                 description: Types d'IOCs à importer (optionnel)
 *               autoEnrich:
 *                 type: boolean
 *                 default: true
 *                 description: Enrichir IOCs avec APIs externes (VirusTotal, etc.)
 *     responses:
 *       200:
 *         description: Synchronisation terminée
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
 *                     imported:
 *                       type: integer
 *                       description: IOCs importés
 *                     skipped:
 *                       type: integer
 *                       description: IOCs déjà existants
 *                     errors:
 *                       type: integer
 *                       description: Erreurs rencontrées
 *       400:
 *         description: MISP non configuré
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/sync', MISPController.syncIOCs);

/**
 * @swagger
 * /api/misp/publish:
 *   post:
 *     tags: [MISP]
 *     summary: Publier IOCs AntStrike → MISP
 *     description: |
 *       Publie les IOCs sélectionnés sur l'instance MISP configurée.
 *       Crée un nouvel event MISP avec les IOCs en attributes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [iocIds]
 *             properties:
 *               iocIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["uuid1", "uuid2", "uuid3"]
 *                 description: IDs des IOCs à publier
 *               eventInfo:
 *                 type: string
 *                 example: "Suspicious IPs from investigation #1234"
 *                 description: Titre de l'event MISP (optionnel)
 *     responses:
 *       200:
 *         description: IOCs publiés
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
 *                     eventId:
 *                       type: string
 *                     published:
 *                       type: integer
 *       400:
 *         description: MISP non configuré ou IOCs invalides
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/publish', MISPController.publishIOCs);

/**
 * @swagger
 * /api/misp/stats:
 *   get:
 *     tags: [MISP]
 *     summary: Statistiques synchronisation MISP
 *     description: Récupère les stats et l'historique des synchronisations MISP
 *     responses:
 *       200:
 *         description: Statistiques MISP
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
 *                     enabled:
 *                       type: boolean
 *                     url:
 *                       type: string
 *                     autoSync:
 *                       type: boolean
 *                     lastSync:
 *                       type: string
 *                       format: date-time
 *                     totalImported:
 *                       type: integer
 *                     totalSkipped:
 *                       type: integer
 *                     syncHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', MISPController.getStats);

export default router;




