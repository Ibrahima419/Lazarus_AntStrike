/**
 * 📊 Report Routes
 */

import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     tags: [Reports]
 *     summary: Liste des rapports générés
 *     description: Récupère tous les rapports du tenant
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DAILY, WEEKLY, MONTHLY, INCIDENT, CUSTOM]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Liste des rapports
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', ReportController.getReports);

/**
 * @swagger
 * /api/reports/generate:
 *   post:
 *     tags: [Reports]
 *     summary: Générer un rapport
 *     description: |
 *       Génère un rapport CTI personnalisé avec les données sélectionnées.
 *       Formats disponibles: HTML, JSON, CSV, PDF
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tenantId, type, format]
 *             properties:
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, INCIDENT, CUSTOM]
 *                 description: Type de rapport
 *               format:
 *                 type: string
 *                 enum: [HTML, JSON, CSV, PDF]
 *                 default: HTML
 *               title:
 *                 type: string
 *                 description: Titre du rapport
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     format: date
 *                   to:
 *                     type: string
 *                     format: date
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [THREATS, ALERTS, IOCS, CASES, METRICS]
 *                 description: Sections à inclure
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: Destinataires email (optionnel)
 *           examples:
 *             dailyReport:
 *               summary: Rapport quotidien
 *               value:
 *                 tenantId: "123e4567-e89b-12d3-a456-426614174000"
 *                 type: "DAILY"
 *                 format: "HTML"
 *                 title: "Rapport Quotidien - 19 Oct 2025"
 *                 sections: ["THREATS", "ALERTS", "IOCS"]
 *             incidentReport:
 *               summary: Rapport d'incident
 *               value:
 *                 tenantId: "123e4567-e89b-12d3-a456-426614174000"
 *                 type: "INCIDENT"
 *                 format: "PDF"
 *                 title: "Incident #1234 - Ransomware Attack"
 *                 sections: ["ALERTS", "IOCS", "CASES", "METRICS"]
 *     responses:
 *       201:
 *         description: Rapport généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reportId:
 *                   type: string
 *                   format: uuid
 *                 downloadUrl:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Erreur lors de la génération
 */
router.post('/generate', ReportController.generateReport);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: Détails d'un rapport
 *     description: Récupère les métadonnées et le contenu d'un rapport
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails du rapport
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
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     type:
 *                       type: string
 *                     format:
 *                       type: string
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                     content:
 *                       type: object
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', ReportController.getReport);

/**
 * @swagger
 * /api/reports/{id}/download:
 *   get:
 *     tags: [Reports]
 *     summary: Télécharger un rapport
 *     description: Télécharge le fichier du rapport (HTML, PDF, CSV, JSON)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Fichier du rapport
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id/download', ReportController.downloadReport);

export { router as reportRoutes };




