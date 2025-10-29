/**
 * 🍯 Honeypot Routes
 */

import { Router } from 'express';
import { HoneypotController } from '../controllers/honeypot.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/honeypots/supported:
 *   get:
 *     tags: [Honeypots]
 *     summary: Liste des honeypots supportés
 *     description: |
 *       Retourne les types de honeypots intégrables:
 *       - **Cowrie** (SSH/Telnet)
 *       - **Dionaea** (Multi-protocol)
 *       - **T-Pot** (All-in-one)
 *       - **Custom** (Format JSON personnalisé)
 *     responses:
 *       200:
 *         description: Liste des honeypots supportés
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/supported', HoneypotController.getSupportedTypes);

/**
 * @swagger
 * /api/honeypots/configure:
 *   post:
 *     tags: [Honeypots]
 *     summary: Configurer honeypots
 *     description: Configure les honeypots à surveiller pour le tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [honeypots]
 *             properties:
 *               honeypots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id, name, url, type]
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "honeypot-1"
 *                     name:
 *                       type: string
 *                       example: "SSH Honeypot 1"
 *                     url:
 *                       type: string
 *                       example: "http://honeypot1.local:8080"
 *                     type:
 *                       type: string
 *                       enum: [cowrie, dionaea, tpot, custom]
 *                     enabled:
 *                       type: boolean
 *                       default: true
 *                     authToken:
 *                       type: string
 *                       description: Token auth (optionnel)
 *     responses:
 *       200:
 *         description: Configuration sauvegardée
 *       400:
 *         description: Honeypots array manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/configure', HoneypotController.configure);

/**
 * @swagger
 * /api/honeypots/import:
 *   post:
 *     tags: [Honeypots]
 *     summary: Importer logs depuis honeypots
 *     description: |
 *       Collecte les logs de tous les honeypots configurés.
 *       Analyse les attaques et crée automatiquement:
 *       - IOCs pour IPs avec >5 tentatives
 *       - Alertes pour IPs avec >50 tentatives
 *     responses:
 *       200:
 *         description: Import terminé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     honeypots:
 *                       type: integer
 *                     totalLogs:
 *                       type: integer
 *                     iocsCreated:
 *                       type: integer
 *                     alertsCreated:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/import', HoneypotController.importAll);

/**
 * @swagger
 * /api/honeypots/stats:
 *   get:
 *     tags: [Honeypots]
 *     summary: Statistiques honeypots
 *     description: Stats des attaques détectées par honeypots
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
 *                     totalAttacks:
 *                       type: integer
 *                     uniqueIPs:
 *                       type: integer
 *                     topAttackers:
 *                       type: array
 *                       items:
 *                         type: object
 *                     topPorts:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', HoneypotController.getStats);

export default router;




