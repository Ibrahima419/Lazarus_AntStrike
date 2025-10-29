/**
 * 🔍 DEDUPLICATION ENGINE
 * Détecte et fusionne les threats en doublon avec fingerprinting intelligent
 */

import * as crypto from 'crypto';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

export class DeduplicationEngine {
  /**
   * Traiter un threat pour détecter doublons
   */
  static async process(threat: any, tenantId: string): Promise<any> {
    // 1. Générer fingerprint unique
    const fingerprint = this.generateFingerprint(threat);
    threat.fingerprint = fingerprint;
    
    // 2. Chercher threat existant avec même fingerprint
    // Note: fingerprint n'est pas dans le schéma Prisma, on cherche par titre similaire
    const normalizedTitle = threat.title?.toLowerCase().substring(0, 50) || '';
    const existing = await prisma.threat.findFirst({
      where: {
        tenantId,
        name: { contains: normalizedTitle, mode: 'insensitive' },
        type: threat.type
      }
    });
    
    if (existing) {
      logger.info('🔍 Duplicate threat detected', {
        existingId: existing.id,
        existingSource: existing.source,
        newSource: threat.source,
        fingerprint
      });
      
      // 3. Merger avec existant
      threat.existingId = existing.id;
      threat.isDuplicate = true;
      
      // Update l'existant
      await this.mergeThreat(existing, threat);
      
      return threat;
    }
    
    // Pas de doublon
    threat.isDuplicate = false;
    return threat;
  }
  
  /**
   * Générer fingerprint unique basé sur contenu
   */
  private static generateFingerprint(threat: any): string {
    // Normaliser le titre
    const normalizedTitle = this.normalizeText(threat.title || '');
    
    // Hash des IOCs principaux (top 5)
    const iocSignature = threat.iocs
      ?.slice(0, 5)
      .map((ioc: any) => `${ioc.type}:${ioc.value}`)
      .sort()
      .join('|') || '';
    
    // Hash du type de menace
    const typeSignature = threat.type || 'unknown';
    
    // Combiner
    const combined = `${normalizedTitle}|${iocSignature}|${typeSignature}`;
    
    // SHA256
    return crypto
      .createHash('sha256')
      .update(combined)
      .digest('hex')
      .substring(0, 16); // 16 premiers chars suffisent
  }
  
  /**
   * Normaliser texte pour comparaison
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, ' ')         // Normaliser espaces
      .trim();
  }
  
  /**
   * Merger threat en doublon avec existant
   */
  private static async mergeThreat(existing: any, newThreat: any): Promise<void> {
    try {
      // Merger IOCs (dédupliquer)
      const mergedIOCs = this.mergeIOCs(existing.iocs, newThreat.iocs);
      
      // Merger tags
      const mergedTags = [...new Set([...existing.tags, ...newThreat.tags])];
      
      // Tracker sources multiples
      const sources = existing.sources || {};
      sources[newThreat.source] = {
        sourceUrl: newThreat.sourceUrl,
        collectedAt: newThreat.collectedAt,
        externalId: newThreat.externalId
      };
      
      // Update existant
      await prisma.threat.update({
        where: { id: existing.id },
        data: {
          // Garder le meilleur nom (plus long = plus détails)
          name: existing.name.length > newThreat.title.length 
            ? existing.name 
            : newThreat.title,
          
          // Concaténer descriptions
          description: this.mergeDescriptions(existing.description, newThreat.description),
          
          // Merger IOCs
          iocs: mergedIOCs,
          
          // Merger tags
          tags: mergedTags,
          
          // Tracker sources multiples (stocké dans description ou tags)
          // sources,
          
          // Update timestamps
          lastSeen: new Date(),
          
          // Augmenter confidence (multiple sources = plus fiable)
          confidence: Math.min(existing.confidence + 10, 100),
          
          // Prendre la sévérité la plus haute
          severity: this.getHighestSeverity(existing.severity, newThreat.severity)
        }
      });
      
      logger.info('✅ Threat merged successfully', {
        threatId: existing.id,
        sources: Object.keys(sources)
      });
      
    } catch (error: any) {
      logger.error('❌ Failed to merge threat', {
        error: error.message,
        existingId: existing.id
      });
    }
  }
  
  /**
   * Merger IOCs en dédupliquant
   */
  private static mergeIOCs(iocs1: any[], iocs2: any[]): any[] {
    const merged = [...iocs1];
    const seen = new Set(
      iocs1.map((ioc: any) => `${ioc.type}:${ioc.value}`)
    );
    
    for (const ioc of iocs2) {
      const key = `${ioc.type}:${ioc.value}`;
      if (!seen.has(key)) {
        merged.push(ioc);
        seen.add(key);
      }
    }
    
    return merged;
  }
  
  /**
   * Merger descriptions
   */
  private static mergeDescriptions(desc1: string | null, desc2: string | null): string | null {
    if (!desc1) return desc2;
    if (!desc2) return desc1;
    
    // Si identiques, garder 1
    if (desc1 === desc2) return desc1;
    
    // Sinon concaténer avec séparateur
    return `${desc1}\n\n---\n\n${desc2}`;
  }
  
  /**
   * Obtenir sévérité la plus haute
   */
  private static getHighestSeverity(sev1: string, sev2: string): string {
    const severityOrder = ['low', 'medium', 'high', 'critical'];
    const index1 = severityOrder.indexOf(sev1);
    const index2 = severityOrder.indexOf(sev2);
    
    return index1 > index2 ? sev1 : sev2;
  }
}

