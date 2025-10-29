/**
 * 📡 TAXII 2.1 Routes
 * Conformes au standard TAXII 2.1 (OASIS)
 */

import { Router } from 'express';
import { TAXIIController } from '../controllers/taxii.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// TAXII Discovery (public ou authentifié selon config)
router.get('/', TAXIIController.getDiscovery);

// Routes protégées
router.use(authenticate);

/**
 * @swagger
 * /taxii/:
 *   get:
 *     tags: [STIX/TAXII]
 *     summary: TAXII 2.1 Discovery
 *     description: Discovery endpoint conforme au standard TAXII 2.1
 *     security: []
 *     responses:
 *       200:
 *         description: TAXII Discovery response
 *         content:
 *           application/taxii+json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "AntStrike CTI TAXII Server"
 *                 description:
 *                   type: string
 *                 contact:
 *                   type: string
 *                 api_roots:
 *                   type: array
 *                   items:
 *                     type: string
 */

/**
 * @swagger
 * /taxii/collections:
 *   get:
 *     tags: [STIX/TAXII]
 *     summary: Liste des collections TAXII
 *     description: |
 *       Retourne les collections TAXII 2.1 disponibles:
 *       - **indicators**: IOCs (IP, Domain, Hash, etc.)
 *       - **threats**: Malware, Threat Actors
 *       - **campaigns**: Campagnes d'attaque
 *       - **attack-patterns**: MITRE ATT&CK
 *     responses:
 *       200:
 *         description: Liste des collections
 *         content:
 *           application/taxii+json:
 *             schema:
 *               type: object
 *               properties:
 *                 collections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       can_read:
 *                         type: boolean
 *                       can_write:
 *                         type: boolean
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/collections', TAXIIController.getCollections);

/**
 * @swagger
 * /taxii/collections/{collectionId}:
 *   get:
 *     tags: [STIX/TAXII]
 *     summary: Informations sur une collection
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [indicators, threats, campaigns, attack-patterns]
 *         example: "indicators"
 *     responses:
 *       200:
 *         description: Détails de la collection
 *       404:
 *         description: Collection non trouvée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/collections/:collectionId', TAXIIController.getCollection);

/**
 * @swagger
 * /taxii/collections/{collectionId}/objects:
 *   get:
 *     tags: [STIX/TAXII]
 *     summary: Récupérer objects STIX d'une collection
 *     description: |
 *       Endpoint TAXII 2.1 pour récupérer les objects STIX.
 *       Supporte pagination et filtres conformes au standard.
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "indicators"
 *       - in: query
 *         name: added_after
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Timestamp RFC3339 (filter objects added after)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 1000
 *         description: Nombre max d'objects
 *       - in: query
 *         name: next
 *         schema:
 *           type: string
 *         description: Pagination cursor
 *     responses:
 *       200:
 *         description: TAXII Envelope avec objects STIX
 *         content:
 *           application/taxii+json:
 *             schema:
 *               type: object
 *               properties:
 *                 more:
 *                   type: boolean
 *                   description: Plus d'objects disponibles
 *                 objects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: STIX 2.1 Object
 *       404:
 *         description: Collection non trouvée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/collections/:collectionId/objects', TAXIIController.getObjects);

/**
 * @swagger
 * /taxii/collections/{collectionId}/objects:
 *   post:
 *     tags: [STIX/TAXII]
 *     summary: Ajouter objects STIX à une collection
 *     description: |
 *       Push STIX objects vers une collection TAXII.
 *       Conforme au standard TAXII 2.1.
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "indicators"
 *     requestBody:
 *       required: true
 *       content:
 *         application/taxii+json:
 *           schema:
 *             type: object
 *             required: [objects]
 *             properties:
 *               objects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: STIX 2.1 Object
 *     responses:
 *       202:
 *         description: Objects acceptés pour traitement
 *         content:
 *           application/taxii+json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Status ID pour suivi
 *                 status:
 *                   type: string
 *                   example: "complete"
 *                 success_count:
 *                   type: integer
 *                 failure_count:
 *                   type: integer
 *       400:
 *         description: Collection read-only ou données invalides
 *       404:
 *         description: Collection non trouvée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/collections/:collectionId/objects', TAXIIController.addObjects);

/**
 * @swagger
 * /taxii/status/{statusId}:
 *   get:
 *     tags: [STIX/TAXII]
 *     summary: Statut d'une opération TAXII
 *     description: Récupère le statut d'une opération POST (ajout d'objects)
 *     parameters:
 *       - in: path
 *         name: statusId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Status de l'opération
 *         content:
 *           application/taxii+json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, complete]
 *                 success_count:
 *                   type: integer
 *                 failure_count:
 *                   type: integer
 *       404:
 *         description: Status non trouvé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/status/:statusId', TAXIIController.getStatus);

/**
 * @swagger
 * /taxii/stats:
 *   get:
 *     tags: [STIX/TAXII]
 *     summary: Statistiques TAXII (non-standard)
 *     description: Statistiques du serveur TAXII (endpoint custom AntStrike)
 *     responses:
 *       200:
 *         description: Statistiques
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
 *                     collections:
 *                       type: integer
 *                     indicators:
 *                       type: integer
 *                     campaigns:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', TAXIIController.getStats);

export default router;




