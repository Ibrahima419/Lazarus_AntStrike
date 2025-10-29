/**
 * 🎯 Threat Routes
 */

import { Router } from 'express';
import { ThreatController } from '../controllers/threat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/threats:
 *   get:
 *     tags: [Threats]
 *     summary: Liste des menaces détectées
 *     description: Récupère toutes les menaces avec filtres optionnels
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, INVESTIGATING, MITIGATED, RESOLVED]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Liste des menaces
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
router.get('/', ThreatController.getThreats);

/**
 * @swagger
 * /api/threats/search:
 *   get:
 *     tags: [Threats]
 *     summary: Rechercher des menaces
 *     description: Recherche full-text dans les menaces (titre, description, IOCs, TTPs)
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/search', ThreatController.searchThreats);

/**
 * @swagger
 * /api/threats/{id}:
 *   get:
 *     tags: [Threats]
 *     summary: Détails d'une menace
 *     description: Récupère les informations complètes d'une menace (IOCs, TTPs, contexte)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de la menace
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 severity:
 *                   type: string
 *                 iocs:
 *                   type: array
 *                 ttps:
 *                   type: array
 *                 mitreAttack:
 *                   type: array
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', ThreatController.getThreat);

/**
 * @swagger
 * /api/threats/{id}:
 *   put:
 *     tags: [Threats]
 *     summary: Mettre à jour une menace
 *     description: Modifie les informations d'une menace (statut, severity, notes)
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
 *               status:
 *                 type: string
 *                 enum: [NEW, INVESTIGATING, MITIGATED, RESOLVED]
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Menace mise à jour
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:id', ThreatController.updateThreat);

export { router as threatRoutes };




