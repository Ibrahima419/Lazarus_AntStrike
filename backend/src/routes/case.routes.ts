import { Router } from 'express';
import { CaseController } from '../controllers/case.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @swagger
 * /api/cases/stats:
 *   get:
 *     tags: [Cases]
 *     summary: Statistiques des cases
 *     description: Récupère les métriques et statistiques des investigations
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statistiques des cases
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', CaseController.getCaseStats);

/**
 * @swagger
 * /api/cases:
 *   get:
 *     tags: [Cases]
 *     summary: Liste des cases d'investigation
 *     description: Récupère toutes les cases avec filtres optionnels
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *     responses:
 *       200:
 *         description: Liste des cases
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', CaseController.getCases);

/**
 * @swagger
 * /api/cases:
 *   post:
 *     tags: [Cases]
 *     summary: Créer une case d'investigation
 *     description: Crée une nouvelle case pour investiguer un incident
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tenantId, title, priority]
 *             properties:
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               assignedTo:
 *                 type: string
 *                 format: uuid
 *               relatedAlerts:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Case créée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', CaseController.createCase);

/**
 * @swagger
 * /api/cases/{id}:
 *   get:
 *     tags: [Cases]
 *     summary: Détails d'une case
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de la case
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', CaseController.getCaseById);

/**
 * @swagger
 * /api/cases/{id}:
 *   patch:
 *     tags: [Cases]
 *     summary: Modifier une case
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *     responses:
 *       200:
 *         description: Case modifiée
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/:id', CaseController.updateCase);

/**
 * @swagger
 * /api/cases/{id}/notes:
 *   post:
 *     tags: [Cases]
 *     summary: Ajouter une note d'investigation
 *     description: Ajoute une note de progression sur la case
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [note]
 *             properties:
 *               note:
 *                 type: string
 *               author:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Note ajoutée
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/notes', CaseController.addInvestigationNote);

/**
 * @swagger
 * /api/cases/{id}/close:
 *   post:
 *     tags: [Cases]
 *     summary: Clôturer une case
 *     description: Ferme la case avec résolution et recommandations
 *     parameters:
 *       - in: path
 *         name: id
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
 *               resolution:
 *                 type: string
 *               recommendations:
 *                 type: string
 *     responses:
 *       200:
 *         description: Case clôturée
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/close', CaseController.closeCase);

export default router;

