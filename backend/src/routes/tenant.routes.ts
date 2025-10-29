/**
 * 🏢 Tenant Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     tags: [Tenants]
 *     summary: Liste des tenants (Admin seulement)
 *     description: Récupère tous les tenants (réservé aux super-admins)
 *     responses:
 *       200:
 *         description: Liste des tenants
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
 *       403:
 *         description: Accès refusé (non super-admin)
 */
router.get('/', async (req, res) => {
  res.json({ message: 'List tenants - TODO' });
});

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     tags: [Tenants]
 *     summary: Détails d'un tenant
 *     description: Récupère les informations complètes d'un tenant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails du tenant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 plan:
 *                   type: string
 *                   enum: [TRIAL, STARTER, BUSINESS, ENTERPRISE]
 *                 status:
 *                   type: string
 *                   enum: [TRIAL, ACTIVE, SUSPENDED, CANCELLED]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 settings:
 *                   type: object
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', async (req, res) => {
  res.json({ message: 'Get tenant - TODO' });
});

/**
 * @swagger
 * /api/tenants/{id}:
 *   put:
 *     tags: [Tenants]
 *     summary: Mettre à jour un tenant
 *     description: Modifie les paramètres d'un tenant (Admin seulement)
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
 *               name:
 *                 type: string
 *               settings:
 *                 type: object
 *               branding:
 *                 type: object
 *     responses:
 *       200:
 *         description: Tenant mis à jour
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Accès refusé (non admin du tenant)
 */
router.put('/:id', async (req, res) => {
  res.json({ message: 'Update tenant - TODO' });
});

export { router as tenantRoutes };




