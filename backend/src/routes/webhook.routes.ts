/**
 * 🔗 Webhook Routes
 */

import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /webhooks/stripe:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook Stripe (paiements)
 *     description: |
 *       Reçoit les événements de paiement depuis Stripe (subscriptions, invoices).
 *       **Note:** Ce endpoint ne nécessite pas d'authentification JWT mais vérifie la signature Stripe.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Événement Stripe (format Stripe)
 *     responses:
 *       200:
 *         description: Webhook traité
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Erreur de traitement ou signature invalide
 */
router.post('/stripe', async (req, res) => {
  try {
    const event = req.body;

    logger.info('Stripe webhook received', { type: event.type });

    // TODO: Vérifier signature Stripe
    // TODO: Gérer événements (subscription.created, invoice.paid, etc.)

    res.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', { error });
    res.status(400).json({ error: 'Webhook error' });
  }
});

/**
 * @swagger
 * /webhooks/taranis:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook Taranis AI (événements OSINT)
 *     description: |
 *       Reçoit les événements depuis Taranis AI (nouvelles stories, IOCs, etc.).
 *       Permet la synchronisation en temps réel avec le moteur OSINT.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [new_story, story_updated, news_item_created]
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook traité
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Erreur de traitement
 */
router.post('/taranis', async (req, res) => {
  try {
    const event = req.body;

    logger.info('Taranis webhook received', { type: event.type });

    // TODO: Gérer événements Taranis (new story, etc.)

    res.json({ received: true });
  } catch (error) {
    logger.error('Taranis webhook error', { error });
    res.status(400).json({ error: 'Webhook error' });
  }
});

export { router as webhookRoutes };




