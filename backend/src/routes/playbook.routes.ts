/**
 * 🤖 Playbook Routes
 * Routes pour les playbooks SOAR
 */

import { Router } from 'express';
import { PlaybookController } from '../controllers/playbook.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/playbooks:
 *   post:
 *     tags: [Playbooks & SOAR]
 *     summary: Créer un playbook
 *     description: Créer un nouveau playbook SOAR
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [response, enrichment, investigation]
 *               trigger:
 *                 type: object
 *               steps:
 *                 type: array
 *               variables:
 *                 type: object
 *     responses:
 *       201:
 *         description: Playbook créé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', PlaybookController.createPlaybook);

/**
 * @swagger
 * /api/playbooks:
 *   get:
 *     tags: [Playbooks & SOAR]
 *     summary: Lister les playbooks
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Liste des playbooks
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', PlaybookController.listPlaybooks);

/**
 * @swagger
 * /api/playbooks/{id}:
 *   get:
 *     tags: [Playbooks & SOAR]
 *     summary: Obtenir un playbook
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du playbook
 *       404:
 *         description: Playbook non trouvé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', PlaybookController.getPlaybook);

/**
 * @swagger
 * /api/playbooks/{id}:
 *   patch:
 *     tags: [Playbooks & SOAR]
 *     summary: Mettre à jour un playbook
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
 *         description: Playbook mis à jour
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/:id', PlaybookController.updatePlaybook);

/**
 * @swagger
 * /api/playbooks/{id}/execute:
 *   post:
 *     tags: [Playbooks & SOAR]
 *     summary: Exécuter un playbook
 *     description: |
 *       Lance l'exécution d'un playbook SOAR.
 *       
 *       **Features**:
 *       - Variable interpolation {{var}}
 *       - Conditional logic (if/else)
 *       - Error handling & retry
 *       - Metrics tracking
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
 *               triggerData:
 *                 type: object
 *               triggeredBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exécution lancée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/execute', PlaybookController.executePlaybook);

/**
 * @swagger
 * /api/playbook-executions:
 *   get:
 *     tags: [Playbooks & SOAR]
 *     summary: Lister les executions
 *     parameters:
 *       - in: query
 *         name: playbookId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Liste des executions
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/executions', PlaybookController.listExecutions);

/**
 * @swagger
 * /api/playbook-executions/{id}:
 *   get:
 *     tags: [Playbooks & SOAR]
 *     summary: Détails execution
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'exécution
 *       404:
 *         description: Execution non trouvée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/executions/:id', PlaybookController.getExecution);

/**
 * @swagger
 * /api/playbook-executions/{id}/cancel:
 *   post:
 *     tags: [Playbooks & SOAR]
 *     summary: Annuler execution
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execution annulée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/executions/:id/cancel', PlaybookController.cancelExecution);

/**
 * @swagger
 * /api/actions:
 *   get:
 *     tags: [Playbooks & SOAR]
 *     summary: Lister les actions SOAR disponibles
 *     description: |
 *       100+ actions automatiques disponibles:
 *       - Network (20): block_ip, block_domain, etc.
 *       - Endpoint (25): isolate_host, kill_process, etc.
 *       - Email (15): block_sender, quarantine_email, etc.
 *       - Cloud (15): block_user, isolate_vm, etc.
 *       - Identity (10): disable_account, reset_mfa, etc.
 *       - Threat Intel (15): enrich_ioc, extract_ttps, etc.
 *       - Notification (10): send_email, send_slack, etc.
 *       - Utility (10): delay, http_request, etc.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des actions
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/actions', PlaybookController.listActions);

/**
 * @swagger
 * /api/actions/categories:
 *   get:
 *     tags: [Playbooks & SOAR]
 *     summary: Lister les catégories d'actions
 *     responses:
 *       200:
 *         description: Liste des catégories
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/actions/categories', PlaybookController.getCategories);

/**
 * @swagger
 * /api/actions/stats:
 *   get:
 *     tags: [Playbooks & SOAR]
 *     summary: Statistiques actions
 *     responses:
 *       200:
 *         description: Stats des actions
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/actions/stats', PlaybookController.getActionStats);

export default router;
