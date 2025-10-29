import { Router } from 'express';
import { CorrelationController } from '../controllers/correlation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @swagger
 * /api/correlation/campaigns:
 *   get:
 *     tags: [Correlation]
 *     summary: Analyser les campagnes d'attaque
 *     description: Détecte les campagnes coordonnées en corrélant les menaces, IOCs et TTPs
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, 90d]
 *           default: 7d
 *       - in: query
 *         name: minCorrelation
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           default: 0.7
 *           description: Score de corrélation minimum
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
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       confidence:
 *                         type: number
 *                       threatsCount:
 *                         type: integer
 *                       iocsCount:
 *                         type: integer
 *                       firstSeen:
 *                         type: string
 *                         format: date-time
 *                       lastSeen:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/campaigns', CorrelationController.analyzeCampaigns);

/**
 * @swagger
 * /api/correlation/stats:
 *   get:
 *     tags: [Correlation]
 *     summary: Statistiques de corrélation
 *     description: Récupère les métriques du moteur de corrélation
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statistiques de corrélation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCorrelations:
 *                   type: integer
 *                 activeCampaigns:
 *                   type: integer
 *                 avgCorrelationScore:
 *                   type: number
 *                 topTTPs:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', CorrelationController.getCorrelationStats);

/**
 * @swagger
 * /api/correlation/correlate/{threatId}:
 *   post:
 *     tags: [Correlation]
 *     summary: Corréler une menace
 *     description: Lance manuellement l'analyse de corrélation pour une menace spécifique
 *     parameters:
 *       - in: path
 *         name: threatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Corrélation effectuée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 correlations:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/correlate/:threatId', CorrelationController.correlateThreat);

/**
 * @swagger
 * /api/correlation/{threatId}:
 *   get:
 *     tags: [Correlation]
 *     summary: Récupérer les corrélations d'une menace
 *     description: Obtient toutes les menaces corrélées à une menace donnée
 *     parameters:
 *       - in: path
 *         name: threatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Corrélations trouvées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 threat:
 *                   type: object
 *                 correlations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       threat:
 *                         type: object
 *                       score:
 *                         type: number
 *                       commonIOCs:
 *                         type: array
 *                       commonTTPs:
 *                         type: array
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:threatId', CorrelationController.getThreatCorrelations);

export default router;

