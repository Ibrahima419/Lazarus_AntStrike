/**
 * 🔍 CVE Routes
 */

import { Router } from 'express';
import { CVEController } from '../controllers/cve.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/cve/enrich:
 *   post:
 *     tags: [CVE]
 *     summary: Enrichir un CVE
 *     description: |
 *       Enrichit un CVE avec données de NVD (NIST) et CIRCL.
 *       Récupère: CVSS score, severity, description, CWE, CPE, références, exploits disponibles.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cveId]
 *             properties:
 *               cveId:
 *                 type: string
 *                 example: "CVE-2024-1234"
 *                 description: Identifiant CVE (format CVE-YYYY-NNNNN)
 *     responses:
 *       200:
 *         description: CVE enrichi
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
 *                     id:
 *                       type: string
 *                     cveId:
 *                       type: string
 *                     severity:
 *                       type: string
 *                       enum: [CRITICAL, HIGH, MEDIUM, LOW, NONE, UNKNOWN]
 *                     cvssScore:
 *                       type: number
 *                       example: 9.8
 *                     description:
 *                       type: string
 *                     published:
 *                       type: string
 *                       format: date-time
 *                     enrichmentData:
 *                       type: object
 *                       properties:
 *                         cvssVector:
 *                           type: string
 *                         cwe:
 *                           type: array
 *                           items:
 *                             type: string
 *                         exploitAvailable:
 *                           type: boolean
 *                         affectedProducts:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: CVE ID manquant ou format invalide
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/enrich', CVEController.enrichCVE);

/**
 * @swagger
 * /api/cve/bulk-enrich:
 *   post:
 *     tags: [CVE]
 *     summary: Enrichir plusieurs CVEs
 *     description: Enrichit jusqu'à 100 CVEs en une seule requête (traitement en arrière-plan)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cveIds]
 *             properties:
 *               cveIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["CVE-2024-1234", "CVE-2024-5678", "CVE-2023-9999"]
 *                 maxItems: 100
 *     responses:
 *       200:
 *         description: Enrichissement terminé
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
 *                     skipped:
 *                       type: integer
 *                     errors:
 *                       type: integer
 *       400:
 *         description: CVE IDs array requis (max 100)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/bulk-enrich', CVEController.bulkEnrich);

/**
 * @swagger
 * /api/cve/search:
 *   get:
 *     tags: [CVE]
 *     summary: Rechercher CVEs récents depuis NVD
 *     description: |
 *       Recherche les CVEs publiés récemment dans la base NVD.
 *       Utile pour découvrir nouvelles vulnérabilités.
 *     parameters:
 *       - in: query
 *         name: lastDays
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Nombre de jours à récupérer
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *         description: Filtrer par sévérité
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Mot-clé de recherche
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 2000
 *     responses:
 *       200:
 *         description: Liste des CVEs trouvés
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/search', CVEController.searchRecent);

/**
 * @swagger
 * /api/cve/import-recent:
 *   post:
 *     tags: [CVE]
 *     summary: Importer CVEs récents automatiquement
 *     description: |
 *       Recherche et importe automatiquement les CVEs récents depuis NVD.
 *       Idéal pour mise à jour quotidienne.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastDays:
 *                 type: integer
 *                 default: 7
 *               severity:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *               limit:
 *                 type: integer
 *                 default: 50
 *                 maximum: 200
 *     responses:
 *       200:
 *         description: CVEs importés
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/import-recent', CVEController.importRecent);

/**
 * @swagger
 * /api/cve:
 *   get:
 *     tags: [CVE]
 *     summary: Liste des CVEs enrichis
 *     description: Liste paginée des CVEs du tenant
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
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Liste des CVEs
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
/**
 * @swagger
 * /api/cve/stats:
 *   get:
 *     tags: [CVE]
 *     summary: Statistiques CVE
 *     description: Stats et distribution des CVEs par sévérité
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
 *                     bySeverity:
 *                       type: object
 *                       properties:
 *                         CRITICAL:
 *                           type: integer
 *                         HIGH:
 *                           type: integer
 *                         MEDIUM:
 *                           type: integer
 *                         LOW:
 *                           type: integer
 *                     recentCount:
 *                       type: integer
 *                       description: CVEs des 30 derniers jours
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', CVEController.getStats);

router.get('/', CVEController.listCVEs);

/**
 * @swagger
 * /api/cve/{cveId}:
 *   get:
 *     tags: [CVE]
 *     summary: Obtenir détails d'un CVE
 *     description: Récupère un CVE enrichi (ou l'enrichit à la volée si non présent)
 *     parameters:
 *       - in: path
 *         name: cveId
 *         required: true
 *         schema:
 *           type: string
 *         example: "CVE-2024-1234"
 *     responses:
 *       200:
 *         description: Détails du CVE
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:cveId', CVEController.getCVE);

export default router;




