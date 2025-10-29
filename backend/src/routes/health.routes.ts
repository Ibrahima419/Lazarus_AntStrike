/**
 * 💚 Health Routes
 * Routes pour le monitoring de santé de la plateforme
 */

import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Status global de santé
 *     description: |
 *       Health check complet de la plateforme:
 *       - Database connectivity
 *       - External APIs
 *       - System resources
 *       - Background jobs
 *       
 *       **Status**:
 *       - healthy: Tout OK
 *       - degraded: Problèmes mineurs
 *       - unhealthy: Problèmes critiques
 *     responses:
 *       200:
 *         description: Plateforme healthy ou degraded
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
 *                     overall:
 *                       type: string
 *                       enum: [healthy, degraded, unhealthy]
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                     uptime:
 *                       type: number
 *                     version:
 *                       type: string
 *       503:
 *         description: Plateforme unhealthy
 */
router.get('/', HealthController.getHealth);

/**
 * @swagger
 * /api/metrics/system:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Métriques système
 *     description: |
 *       Métriques système en temps réel:
 *       - CPU usage (%)
 *       - Memory usage (%)
 *       - Load average
 *       - Uptime
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques système
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/metrics/system', authenticate, HealthController.getSystemMetrics);

/**
 * @swagger
 * /api/metrics/api:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Métriques API
 *     description: |
 *       Métriques API:
 *       - Requests/minute
 *       - Average response time
 *       - Error rate
 *       - Active connections
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques API
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/metrics/api', authenticate, HealthController.getAPIMetrics);

/**
 * @swagger
 * /api/metrics/database:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Métriques Database
 *     description: |
 *       Métriques database:
 *       - Record counts par table
 *       - Total records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques database
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/metrics/database', authenticate, HealthController.getDatabaseMetrics);

/**
 * @swagger
 * /api/uptime:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Uptime stats
 *     description: |
 *       Statistiques d'uptime:
 *       - Seconds, minutes, hours, days
 *       - Formatted string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats uptime
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/uptime', authenticate, HealthController.getUptime);

export default router;
