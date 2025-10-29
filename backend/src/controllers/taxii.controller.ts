/**
 * 📡 TAXII 2.1 Controller
 */

import { Request, Response, NextFunction } from 'express';
import { TAXIIServerService } from '../services/taxii-server.service';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export class TAXIIController {
  /**
   * GET /taxii/
   * Discovery endpoint
   */
  static async getDiscovery(req: Request, res: Response, next: NextFunction) {
    try {
      const discovery = TAXIIServerService.getDiscovery();
      
      res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
      res.json(discovery);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /taxii/collections/
   * Liste des collections
   */
  static async getCollections(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      
      const collections = await TAXIIServerService.getCollections(tenantId);
      
      res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
      res.json(collections);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /taxii/collections/{id}/
   * Informations sur une collection
   */
  static async getCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { collectionId } = req.params;

      const collection = await TAXIIServerService.getCollection(tenantId, collectionId);

      if (!collection) {
        throw new NotFoundError('Collection not found');
      }

      res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
      res.json(collection);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /taxii/collections/{id}/objects/
   * Récupérer objects d'une collection
   */
  static async getObjects(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { collectionId } = req.params;

      const params = {
        added_after: req.query.added_after as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        next: req.query.next as string,
        match: req.query.match ? JSON.parse(req.query.match as string) : undefined
      };

      const envelope = await TAXIIServerService.getObjects(tenantId, collectionId, params);

      res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
      res.json(envelope);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /taxii/collections/{id}/objects/
   * Ajouter objects à une collection
   */
  static async addObjects(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { collectionId } = req.params;

      // Vérifier permissions write
      const canWrite = await TAXIIServerService.checkCollectionPermissions(
        tenantId,
        collectionId,
        'write'
      );

      if (!canWrite) {
        throw new BadRequestError('Collection is read-only');
      }

      const envelope = req.body;

      if (!envelope.objects || !Array.isArray(envelope.objects)) {
        throw new BadRequestError('Envelope must contain objects array');
      }

      const status = await TAXIIServerService.addObjects(tenantId, collectionId, envelope);

      res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
      res.status(202).json(status);  // 202 Accepted
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /taxii/status/{id}/
   * Statut d'une opération
   */
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;
      const { statusId } = req.params;

      const status = await TAXIIServerService.getStatus(tenantId, statusId);

      res.setHeader('Content-Type', 'application/taxii+json;version=2.1');
      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /taxii/stats
   * Statistiques TAXII (non standard, pour admin)
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tenantId;

      const stats = await TAXIIServerService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}




