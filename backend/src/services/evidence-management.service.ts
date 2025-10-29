/**
 * 🔍 Evidence Management Service
 * Gestion des preuves numériques avec chain of custody
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface EvidenceInput {
  caseId: string;
  type: 'file' | 'log' | 'screenshot' | 'memory_dump' | 'network_capture' | 'other';
  name: string;
  description?: string;
  source?: string;
  sourceSystem?: string;
  tags?: string[];
  category?: string;
}

export class EvidenceManagementService {
  private static storagePath = process.env.EVIDENCE_STORAGE_PATH || './storage/evidence';

  /**
   * Upload evidence
   */
  static async uploadEvidence(
    tenantId: string,
    input: EvidenceInput,
    fileBuffer?: Buffer,
    userId?: string
  ): Promise<any> {
    try {
      logger.info(`Uploading evidence for case: ${input.caseId}`);

      let hash: string | undefined;
      let fileSize: number | undefined;
      let storagePath: string | undefined;

      if (fileBuffer) {
        // Calculer hash SHA256
        hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        fileSize = fileBuffer.length;

        // Sauvegarder fichier
        const fileName = `${hash}_${input.name}`;
        storagePath = path.join(this.storagePath, tenantId, input.caseId, fileName);

        // Créer dossiers si nécessaire
        await fs.mkdir(path.dirname(storagePath), { recursive: true });
        await fs.writeFile(storagePath, fileBuffer);

        logger.info(`File saved: ${storagePath}`);
      }

      const evidence = await prisma.evidence.create({
        data: {
          caseId: input.caseId,
          tenantId,
          type: input.type,
          name: input.name,
          description: input.description,
          fileSize,
          hash,
          storagePath,
          collectedBy: userId || 'system',
          source: input.source,
          sourceSystem: input.sourceSystem,
          tags: input.tags || [],
          category: input.category,
          chainOfCustody: [
            {
              action: 'collected',
              actor: userId || 'system',
              timestamp: new Date().toISOString(),
              location: 'uploaded'
            }
          ]
        }
      });

      logger.info(`Evidence uploaded: ${evidence.id}`);
      return evidence;
    } catch (error: any) {
      logger.error('Error uploading evidence:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir evidence
   */
  static async getEvidence(
    tenantId: string,
    evidenceId: string
  ): Promise<any> {
    return await prisma.evidence.findFirst({
      where: { id: evidenceId, tenantId }
    });
  }

  /**
   * Lister evidence d'un case
   */
  static async listEvidence(
    tenantId: string,
    caseId: string
  ): Promise<any[]> {
    return await prisma.evidence.findMany({
      where: { caseId, tenantId },
      orderBy: { collectedAt: 'desc' }
    });
  }

  /**
   * Vérifier evidence
   */
  static async verifyEvidence(
    tenantId: string,
    evidenceId: string,
    userId: string
  ): Promise<any> {
    try {
      const evidence = await prisma.evidence.findFirst({
        where: { id: evidenceId, tenantId }
      });

      if (!evidence) {
        throw new Error('Evidence not found');
      }

      // Ajouter à chain of custody
      const custody = (evidence.chainOfCustody as any[]) || [];
      custody.push({
        action: 'verified',
        actor: userId,
        timestamp: new Date().toISOString(),
        location: 'verification'
      });

      const updated = await prisma.evidence.update({
        where: { id: evidenceId },
        data: {
          verified: true,
          verifiedBy: userId,
          verifiedAt: new Date(),
          chainOfCustody: custody
        }
      });

      logger.info(`Evidence verified: ${evidenceId}`);
      return updated;
    } catch (error: any) {
      logger.error('Error verifying evidence:', error.message);
      throw error;
    }
  }

  /**
   * Extraire IOCs depuis evidence
   */
  static async extractIOCs(
    tenantId: string,
    evidenceId: string
  ): Promise<any> {
    try {
      const evidence = await prisma.evidence.findFirst({
        where: { id: evidenceId, tenantId }
      });

      if (!evidence) {
        throw new Error('Evidence not found');
      }

      const iocs: any[] = [];

      // Lire contenu du fichier si disponible
      if (evidence.storagePath) {
        try {
          const content = await fs.readFile(evidence.storagePath, 'utf-8');
          
          // Regex pour extraction IOCs
          const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
          const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
          const hashRegex = /\b[a-f0-9]{32,64}\b/gi;
          const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
          const urlRegex = /https?:\/\/[^\s<>"]+/gi;

          // Extraire
          const ips = content.match(ipRegex) || [];
          const domains = content.match(domainRegex) || [];
          const hashes = content.match(hashRegex) || [];
          const emails = content.match(emailRegex) || [];
          const urls = content.match(urlRegex) || [];

          ips.forEach(ip => iocs.push({ type: 'IP', value: ip }));
          domains.forEach(d => iocs.push({ type: 'Domain', value: d }));
          hashes.forEach(h => iocs.push({ type: 'Hash', value: h }));
          emails.forEach(e => iocs.push({ type: 'Email', value: e }));
          urls.forEach(u => iocs.push({ type: 'URL', value: u }));

          // Deduplication
          const uniqueIOCs = Array.from(
            new Map(iocs.map(ioc => [`${ioc.type}:${ioc.value}`, ioc])).values()
          );

          // Sauvegarder dans evidence
          await prisma.evidence.update({
            where: { id: evidenceId },
            data: { extractedIOCs: uniqueIOCs }
          });

          logger.info(`Extracted ${uniqueIOCs.length} IOCs from evidence ${evidenceId}`);
          return uniqueIOCs;
        } catch (readError: any) {
          logger.warn(`Could not read file for IOC extraction: ${readError.message}`);
          return [];
        }
      }

      return iocs;
    } catch (error: any) {
      logger.error('Error extracting IOCs:', error.message);
      throw error;
    }
  }

  /**
   * Stats storage
   */
  static async getStorageStats(tenantId: string): Promise<any> {
    const evidenceList = await prisma.evidence.findMany({
      where: { tenantId },
      select: { fileSize: true, type: true }
    });

    const totalSize = evidenceList.reduce((sum, e) => sum + (e.fileSize || 0), 0);
    const byType: Record<string, number> = {};

    evidenceList.forEach(e => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });

    return {
      totalFiles: evidenceList.length,
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024)),
      byType
    };
  }
}



