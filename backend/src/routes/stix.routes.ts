/**
 * 📦 STIX Routes
 */

import { Router } from 'express';
import { STIXController } from '../controllers/stix.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/stix/import:
 *   post:
 *     tags: [STIX/TAXII]
 *     summary: Importer un STIX bundle
 *     description: |
 *       Importe un bundle STIX 2.1 et extrait les IOCs pour enrichissement.
 *       Supporte: Indicators, Threats, Campaigns, Attack Patterns
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bundle]
 *             properties:
 *               bundle:
 *                 type: object
 *                 description: STIX 2.1 Bundle
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: "bundle"
 *                   id:
 *                     type: string
 *                     example: "bundle--12345"
 *                   objects:
 *                     type: array
 *                     items:
 *                       type: object
 *     responses:
 *       201:
 *         description: Bundle importé
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
 *                     imported:
 *                       type: integer
 *                     skipped:
 *                       type: integer
 *                     errors:
 *                       type: integer
 *       400:
 *         description: Bundle invalide
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/import', STIXController.importBundle);

/**
 * @swagger
 * /api/stix/import/file:
 *   post:
 *     tags: [STIX/TAXII]
 *     summary: Importer fichier STIX
 *     description: Importe un fichier JSON STIX 2.1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fileContent]
 *             properties:
 *               fileContent:
 *                 type: string
 *                 description: Contenu JSON du fichier STIX
 *     responses:
 *       201:
 *         description: Fichier importé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/import/file', STIXController.importFile);

/**
 * @swagger
 * /api/stix/parse:
 *   post:
 *     tags: [STIX/TAXII]
 *     summary: Parser STIX bundle (sans importer)
 *     description: Parse et retourne le contenu d'un bundle STIX sans l'importer dans la DB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bundle]
 *             properties:
 *               bundle:
 *                 type: object
 *     responses:
 *       200:
 *         description: Bundle parsé
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
 *                     indicators:
 *                       type: array
 *                     threats:
 *                       type: array
 *                     campaigns:
 *                       type: array
 *                     total:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/parse', STIXController.parseBundle);

/**
 * @swagger
 * /api/stix/validate:
 *   post:
 *     tags: [STIX/TAXII]
 *     summary: Valider STIX bundle
 *     description: Vérifie qu'un bundle STIX est conforme au standard 2.1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bundle]
 *             properties:
 *               bundle:
 *                 type: object
 *     responses:
 *       200:
 *         description: Résultat validation
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
 *                     valid:
 *                       type: boolean
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/validate', STIXController.validateBundle);

/**
 * @swagger
 * /api/stix/export:
 *   get:
 *     tags: [STIX/TAXII]
 *     summary: Exporter IOCs en STIX bundle
 *     description: Exporte les IOCs du tenant au format STIX 2.1
 *     parameters:
 *       - in: query
 *         name: iocTypes
 *         schema:
 *           type: string
 *           example: "IP,DOMAIN,FILE_HASH"
 *         description: Types d'IOC à exporter (séparés par virgule)
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: STIX bundle généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: STIX 2.1 Bundle
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/export', STIXController.exportBundle);

/**
 * @swagger
 * /api/stix/export/iocs:
 *   post:
 *     tags: [STIX/TAXII]
 *     summary: Exporter IOCs spécifiques en STIX
 *     description: Crée un bundle STIX avec les IOCs sélectionnés
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [iocIds]
 *             properties:
 *               iocIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["uuid1", "uuid2"]
 *     responses:
 *       200:
 *         description: Bundle STIX créé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/export/iocs', STIXController.exportIOCs);

export default router;




