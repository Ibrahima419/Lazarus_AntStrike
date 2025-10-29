import { Router } from 'express';
import { MetricsController } from '../controllers/metrics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @swagger
 * /api/metrics/team:
 *   get:
 *     tags: [Metrics]
 *     summary: Métriques de l'équipe SOC
 *     description: Récupère les métriques agrégées de toute l'équipe d'analystes
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Métriques de l'équipe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAlerts:
 *                   type: integer
 *                 totalCases:
 *                   type: integer
 *                 avgResponseTime:
 *                   type: number
 *                   description: Temps de réponse moyen en minutes
 *                 slaCompliance:
 *                   type: number
 *                   description: Pourcentage de respect des SLA
 *                 topAnalysts:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/team', MetricsController.getTeamMetrics);

/**
 * @swagger
 * /api/metrics/compare:
 *   get:
 *     tags: [Metrics]
 *     summary: Comparer les analystes
 *     description: Compare les performances de plusieurs analystes
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: userIds
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         description: IDs des analystes à comparer
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter]
 *           default: month
 *     responses:
 *       200:
 *         description: Comparaison des analystes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       alertsHandled:
 *                         type: integer
 *                       avgResponseTime:
 *                         type: number
 *                       accuracy:
 *                         type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/compare', MetricsController.compareAnalysts);

/**
 * @swagger
 * /api/metrics/aggregated:
 *   get:
 *     tags: [Metrics]
 *     summary: Métriques agrégées globales
 *     description: Récupère toutes les métriques du tenant en un seul appel
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Métriques agrégées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team:
 *                   type: object
 *                 threats:
 *                   type: object
 *                 incidents:
 *                   type: object
 *                 performance:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/aggregated', MetricsController.getAggregatedMetrics);

/**
 * @swagger
 * /api/metrics/analyst/{userId}:
 *   get:
 *     tags: [Metrics]
 *     summary: Métriques d'un analyste
 *     description: Récupère les performances individuelles d'un analyste
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           default: month
 *     responses:
 *       200:
 *         description: Métriques de l'analyste
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 alertsHandled:
 *                   type: integer
 *                 casesCreated:
 *                   type: integer
 *                 avgResponseTime:
 *                   type: number
 *                 falsePositiveRate:
 *                   type: number
 *                 productivity:
 *                   type: number
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/analyst/:userId', MetricsController.getAnalystMetrics);

/**
 * @swagger
 * /api/metrics/analyst/{userId}/aggregated:
 *   get:
 *     tags: [Metrics]
 *     summary: Métriques agrégées d'un analyste
 *     description: Vue complète des performances d'un analyste sur toutes les périodes
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Métriques agrégées de l'analyste
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/analyst/:userId/aggregated', MetricsController.getAggregatedMetrics);

/**
 * @swagger
 * /api/metrics/analyst/{userId}/update:
 *   post:
 *     tags: [Metrics]
 *     summary: Mettre à jour les métriques quotidiennes
 *     description: Met à jour manuellement les métriques d'un analyste (normalement fait automatiquement)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               metrics:
 *                 type: object
 *     responses:
 *       200:
 *         description: Métriques mises à jour
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/analyst/:userId/update', MetricsController.updateDailyMetrics);

export default router;

