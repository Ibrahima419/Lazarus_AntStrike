/**
 * 🎯 MITRE ATT&CK Routes
 */

import { Router } from 'express';
import { MITREController } from '../controllers/mitre.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes protégées
router.use(authenticate);

/**
 * @swagger
 * /api/mitre/load:
 *   post:
 *     tags: [MITRE ATT&CK]
 *     summary: Charger/Rafraîchir données MITRE ATT&CK
 *     description: |
 *       Télécharge la dernière version du framework MITRE ATT&CK depuis GitHub.
 *       Cache les données pour 24h. Contient ~600 techniques et ~14 tactics.
 *     responses:
 *       200:
 *         description: Données chargées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/load', MITREController.loadData);

/**
 * @swagger
 * /api/mitre/map-threat:
 *   post:
 *     tags: [MITRE ATT&CK]
 *     summary: Mapper une menace vers techniques MITRE
 *     description: |
 *       Analyse automatique d'une menace pour identifier les techniques MITRE ATT&CK utilisées.
 *       Basé sur comportements, IOCs, et description.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, type]
 *             properties:
 *               id:
 *                 type: string
 *                 example: "threat-12345"
 *                 description: ID de la menace
 *               type:
 *                 type: string
 *                 example: "ransomware"
 *                 enum: [malware, ransomware, phishing, apt, trojan, backdoor]
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.1", "malicious.com"]
 *               description:
 *                 type: string
 *                 example: "Ransomware encrypting files with data exfiltration"
 *               behaviors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["powershell execution", "scheduled task creation", "data encryption"]
 *                 description: Comportements observés
 *     responses:
 *       200:
 *         description: Mapping réussi
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
 *                     threatId:
 *                       type: string
 *                     techniques:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           technique:
 *                             type: object
 *                             properties:
 *                               attackId:
 *                                 type: string
 *                                 example: "T1486"
 *                               name:
 *                                 type: string
 *                                 example: "Data Encrypted for Impact"
 *                               tactics:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               url:
 *                                 type: string
 *                           confidence:
 *                             type: number
 *                             example: 90
 *                           evidence:
 *                             type: array
 *                             items:
 *                               type: string
 *                     count:
 *                       type: integer
 *       400:
 *         description: Paramètres manquants
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/map-threat', MITREController.mapThreat);

/**
 * @swagger
 * /api/mitre/technique/{id}:
 *   get:
 *     tags: [MITRE ATT&CK]
 *     summary: Obtenir détails d'une technique
 *     description: Récupère informations complètes sur une technique MITRE ATT&CK
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "T1486"
 *         description: Technique ID (ex: T1486, T1059.001)
 *     responses:
 *       200:
 *         description: Détails de la technique
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
 *                     id:
 *                       type: string
 *                     attackId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     tactics:
 *                       type: array
 *                       items:
 *                         type: string
 *                     platforms:
 *                       type: array
 *                       items:
 *                         type: string
 *                     dataSource:
 *                       type: array
 *                       items:
 *                         type: string
 *                     url:
 *                       type: string
 *       400:
 *         description: Technique non trouvée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/technique/:id', MITREController.getTechnique);

/**
 * @swagger
 * /api/mitre/search:
 *   get:
 *     tags: [MITRE ATT&CK]
 *     summary: Rechercher techniques
 *     description: Recherche fulltext dans nom, description et ID des techniques
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: "credential"
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Résultats de recherche (max 50)
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
 *                 count:
 *                   type: integer
 *       400:
 *         description: Query manquante
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/search', MITREController.searchTechniques);

/**
 * @swagger
 * /api/mitre/tactics/{tacticName}/techniques:
 *   get:
 *     tags: [MITRE ATT&CK]
 *     summary: Obtenir techniques par tactic
 *     description: |
 *       Liste toutes les techniques d'une tactic MITRE ATT&CK.
 *       
 *       **Tactics disponibles**:
 *       - reconnaissance
 *       - resource-development
 *       - initial-access
 *       - execution
 *       - persistence
 *       - privilege-escalation
 *       - defense-evasion
 *       - credential-access
 *       - discovery
 *       - lateral-movement
 *       - collection
 *       - command-and-control
 *       - exfiltration
 *       - impact
 *     parameters:
 *       - in: path
 *         name: tacticName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [reconnaissance, resource-development, initial-access, execution, persistence, privilege-escalation, defense-evasion, credential-access, discovery, lateral-movement, collection, command-and-control, exfiltration, impact]
 *         example: "execution"
 *     responses:
 *       200:
 *         description: Liste des techniques
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/tactics/:tacticName/techniques', MITREController.getTechniquesByTactic);

/**
 * @swagger
 * /api/mitre/stats:
 *   get:
 *     tags: [MITRE ATT&CK]
 *     summary: Statistiques MITRE pour le tenant
 *     description: |
 *       Analyse des techniques MITRE ATT&CK détectées dans les menaces du tenant.
 *       Fournit top techniques, top tactics, et coverage.
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
 *                     totalMappings:
 *                       type: integer
 *                       description: Nombre total de mappings threat → MITRE
 *                     uniqueTechniques:
 *                       type: integer
 *                       description: Nombre de techniques uniques détectées
 *                     topTechniques:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           count:
 *                             type: integer
 *                       description: Top 10 techniques les plus fréquentes
 *                     topTactics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           count:
 *                             type: integer
 *                       description: Tactics par fréquence
 *                     coveragePercent:
 *                       type: integer
 *                       description: "% de techniques MITRE couvertes"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', MITREController.getStats);

export default router;




