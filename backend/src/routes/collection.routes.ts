/**
 * 📡 COLLECTION ROUTES
 * Routes pour gérer la collecte de threat intelligence
 */

import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent authentification
router.use(authenticate);

/**
 * Déclencher collecte complète
 */
router.post('/trigger', CollectionController.triggerCollection);

/**
 * Déclencher collecte d'une source spécifique
 */
router.post('/trigger/:source', CollectionController.triggerSourceCollection);

/**
 * Obtenir statistiques de collecte
 */
router.get('/stats', CollectionController.getStats);

/**
 * Obtenir statut de la queue
 */
router.get('/queue/status', CollectionController.getQueueStatus);

/**
 * Obtenir historique de collecte
 */
router.get('/history', CollectionController.getHistory);

/**
 * Health check des sources
 */
router.get('/health', CollectionController.checkHealth);

export default router;

