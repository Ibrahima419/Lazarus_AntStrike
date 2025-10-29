/**
 * 🚨 Alert Routes
 * Routes pour la gestion avancée des alertes
 */

import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     tags: [Alerting & Monitoring]
 *     summary: Créer une alerte
 *     description: |
 *       Créer une nouvelle alerte avec gestion SLA automatique.
 *       
 *       **Deduplication**: Fingerprint automatique (24h window)
 *       
 *       **SLA automatique** (par priority):
 *       - P1: Response 15min, Resolution 4h
 *       - P2: Response 30min, Resolution 8h
 *       - P3: Response 1h, Resolution 24h
 *       - P4: Response 4h, Resolution 48h
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, severity]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Multiple failed login attempts detected"
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               priority:
 *                 type: string
 *                 enum: [P1, P2, P3, P4]
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               source:
 *                 type: string
 *               threatId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alerte créée
 *       200:
 *         description: Duplicate détecté
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', AlertController.createAlert);

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Lister les alertes
 *     description: Liste avec filtres avancés et pagination
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Liste des alertes
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', AlertController.listAlerts);

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Obtenir une alerte
 *     description: Détails complets avec notes, historique, SLA status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'alerte
 *       404:
 *         description: Alerte non trouvée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', AlertController.getAlert);

/**
 * @swagger
 * /api/alerts/{id}:
 *   patch:
 *     tags: [Alerting & Monitoring]
 *     summary: Mettre à jour une alerte
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
 *         description: Alerte mise à jour
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/:id', AlertController.updateAlert);

/**
 * @swagger
 * /api/alerts/{id}/acknowledge:
 *   post:
 *     tags: [Alerting & Monitoring]
 *     summary: Acquitter une alerte
 *     description: Change status new → acknowledged
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alerte acquittée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/acknowledge', AlertController.acknowledge);

/**
 * @swagger
 * /api/alerts/{id}/assign:
 *   post:
 *     tags: [Alerting & Monitoring]
 *     summary: Assigner une alerte
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
 *             required: [assignee]
 *             properties:
 *               assignee:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alerte assignée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/assign', AlertController.assign);

/**
 * @swagger
 * /api/alerts/{id}/resolve:
 *   post:
 *     tags: [Alerting & Monitoring]
 *     summary: Résoudre une alerte
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
 *               resolution:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alerte résolue
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/resolve', AlertController.resolve);

/**
 * @swagger
 * /api/alerts/{id}/close:
 *   post:
 *     tags: [Alerting & Monitoring]
 *     summary: Clôturer une alerte
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alerte clôturée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/close', AlertController.close);

/**
 * @swagger
 * /api/alerts/{id}/notes:
 *   post:
 *     tags: [Alerting & Monitoring]
 *     summary: Ajouter une note
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
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note ajoutée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/notes', AlertController.addNote);

/**
 * @swagger
 * /api/alerts/{id}/history:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Obtenir historique
 *     description: Audit trail complet de l'alerte
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historique de l'alerte
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id/history', AlertController.getHistory);

/**
 * @swagger
 * /api/alerts/bulk:
 *   post:
 *     tags: [Alerting & Monitoring]
 *     summary: Opérations bulk
 *     description: |
 *       Opérations en masse sur plusieurs alertes.
 *       
 *       **Operations supportées**:
 *       - acknowledge
 *       - assign
 *       - resolve
 *       - close
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [alertIds, operation]
 *             properties:
 *               alertIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               operation:
 *                 type: string
 *                 enum: [acknowledge, assign, resolve, close]
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Opération effectuée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/bulk', AlertController.bulkOperation);

/**
 * @swagger
 * /api/alerts/stats:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Statistiques alertes
 *     description: |
 *       Stats complètes:
 *       - Total, par severity, par status, par priority
 *       - SLA violations
 *       - MTTA (Mean Time To Acknowledge)
 *       - MTTR (Mean Time To Resolve)
 *     responses:
 *       200:
 *         description: Statistiques
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', AlertController.getStats);

/**
 * @swagger
 * /api/sla/violations:
 *   get:
 *     tags: [Alerting & Monitoring]
 *     summary: Violations SLA
 *     description: Liste des alertes ayant violé leur SLA
 *     responses:
 *       200:
 *         description: Liste violations
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/sla/violations', AlertController.getSLAViolations);

/**
 * @swagger
 * /api/sla/check:
 *   post:
 *     tags: [Alerting & Monitoring]
 *     summary: Vérifier violations SLA
 *     description: Force une vérification SLA et marque les violations
 *     responses:
 *       200:
 *         description: Vérification effectuée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/sla/check', AlertController.checkSLA);

export default router;
