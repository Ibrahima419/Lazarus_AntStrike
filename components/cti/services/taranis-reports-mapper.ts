/**
 * Service de Mapping Rapports depuis API Taranis Natif
 * Utilise /api/analyze/report-items et /api/publish/products
 * 
 * MIGRATION: Remplace les rapports mockés par les endpoints natifs
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';

// ============ TYPES & INTERFACES ============

export interface TaranisReportItem {
  id: string;
  title: string;
  created: string;
  updated: string;
  completed: boolean;
  user_id: string;
  report_item_type_id: string;
  remote_user: string | null;
  remote_report_id: string | null;
  remote_report_url: string | null;
  remote_report_sent_on: string | null;
  remote_report_published: boolean;
  remote_report_published_on: string | null;
  title_prefix: string | null;
  attributes: any[];
  news_items_aggregate: {
    total_count: number;
  };
  stories: any[];
}

export interface TaranisProduct {
  id: string;
  created: string;
  updated: string;
  title: string;
  description: string;
  product_type: {
    id: string;
    title: string;
    description: string;
  };
  rendered: boolean;
  rendered_date: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'incident' | 'threat' | 'intelligence' | 'analysis' | 'executive';
  status: 'draft' | 'in_progress' | 'review' | 'published' | 'archived';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdDate: string;
  updatedDate: string;
  publishedDate?: string;
  author: string;
  tags: string[];
  storiesCount: number;
  newsItemsCount: number;
  metadata: {
    reportItemTypeId?: string;
    productTypeId?: string;
    rendered?: boolean;
    fileName?: string;
    remoteUrl?: string;
  };
}

export interface ReportsExtraction {
  reports: Report[];
  totalReports: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  extractionMethod: 'taranis_native' | 'fallback';
  lastUpdate: string;
}

// ============ CACHE ============

interface CachedReports {
  data: ReportsExtraction;
  timestamp: number;
}

let reportsCache: CachedReports | null = null;
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// ============ SERVICE CLASS ============

class TaranisReportsMapperService {
  private taranisService = getTaranisService();

  /**
   * Extrait les rapports depuis /api/analyze/report-items et /api/publish/products
   */
  async extractReportsFromTaranis(): Promise<ReportsExtraction> {
    // Vérifier le cache
    if (reportsCache && Date.now() - reportsCache.timestamp < CACHE_DURATION) {
      console.log('📄 Reports: Utilisation du cache');
      return reportsCache.data;
    }

    console.log('📄 Extraction rapports depuis Taranis /api/analyze + /api/publish...');

    try {
      // Récupérer report items ET products en parallèle
      const [reportItems, products] = await Promise.all([
        this.taranisService.getReportItems({ limit: 200 }),
        this.taranisService.getProducts({ limit: 100 }),
      ]);

      const reports: Report[] = [];
      const byStatus: Record<string, number> = {
        draft: 0,
        in_progress: 0,
        review: 0,
        published: 0,
        archived: 0,
      };
      const byType: Record<string, number> = {
        incident: 0,
        threat: 0,
        intelligence: 0,
        analysis: 0,
        executive: 0,
      };

      // 1. Mapper les Report Items (Analyze phase)
      if (reportItems?.items) {
        for (const item of reportItems.items) {
          const report = this.mapReportItemToReport(item);
          reports.push(report);
          byStatus[report.status]++;
          byType[report.type]++;
        }
      }

      // 2. Mapper les Products (Publish phase - rapports finaux)
      if (products?.items) {
        for (const product of products.items) {
          const report = this.mapProductToReport(product);
          reports.push(report);
          byStatus[report.status]++;
          byType[report.type]++;
        }
      }

      const extraction: ReportsExtraction = {
        reports,
        totalReports: reports.length,
        byStatus,
        byType,
        extractionMethod: 'taranis_native',
        lastUpdate: new Date().toISOString(),
      };

      console.log(`✅ ${extraction.totalReports} rapports extraits (ReportItems: ${reportItems?.total_count || 0}, Products: ${products?.total_count || 0})`);
      console.log(`📊 Par statut: Draft=${byStatus.draft}, InProgress=${byStatus.in_progress}, Published=${byStatus.published}`);

      // Mettre en cache
      reportsCache = {
        data: extraction,
        timestamp: Date.now(),
      };

      return extraction;

    } catch (error) {
      console.error('❌ Erreur extraction rapports:', error);
      return this.createFallbackExtraction();
    }
  }

  /**
   * Mapper un ReportItem Taranis vers notre interface Report
   */
  private mapReportItemToReport(item: TaranisReportItem): Report {
    // Déterminer le statut
    let status: Report['status'] = 'draft';
    if (item.completed) {
      status = 'review'; // Completed = prêt pour review/publish
    } else if (item.stories && item.stories.length > 0) {
      status = 'in_progress'; // A des stories = en cours
    }

    // Déterminer le type depuis report_item_type_id (simplification)
    let type: Report['type'] = 'analysis';
    if (item.title.toLowerCase().includes('incident')) {
      type = 'incident';
    } else if (item.title.toLowerCase().includes('threat')) {
      type = 'threat';
    } else if (item.title.toLowerCase().includes('intelligence')) {
      type = 'intelligence';
    } else if (item.title.toLowerCase().includes('executive')) {
      type = 'executive';
    }

    // Extraire les tags depuis les attributs
    const tags: string[] = item.attributes
      ?.filter(attr => attr.key === 'tag' || attr.key === 'category')
      .map(attr => attr.value) || [];

    return {
      id: `report-${item.id}`,
      title: item.title,
      description: `Report Item créé le ${new Date(item.created).toLocaleDateString()}`,
      type,
      status,
      severity: 'medium', // Par défaut, pourrait être enrichi avec attributs
      createdDate: item.created,
      updatedDate: item.updated,
      publishedDate: item.remote_report_published_on || undefined,
      author: item.remote_user || 'Unknown',
      tags,
      storiesCount: item.stories?.length || 0,
      newsItemsCount: item.news_items_aggregate?.total_count || 0,
      metadata: {
        reportItemTypeId: item.report_item_type_id,
        remoteUrl: item.remote_report_url || undefined,
      },
    };
  }

  /**
   * Mapper un Product Taranis vers notre interface Report
   */
  private mapProductToReport(product: TaranisProduct): Report {
    // Les Products sont des rapports publiés
    const status: Report['status'] = product.rendered ? 'published' : 'review';

    // Déterminer le type depuis product_type
    let type: Report['type'] = 'analysis';
    const productTitle = product.product_type?.title?.toLowerCase() || '';
    if (productTitle.includes('incident')) {
      type = 'incident';
    } else if (productTitle.includes('threat')) {
      type = 'threat';
    } else if (productTitle.includes('intelligence')) {
      type = 'intelligence';
    } else if (productTitle.includes('executive')) {
      type = 'executive';
    }

    return {
      id: `product-${product.id}`,
      title: product.title,
      description: product.description || `Product ${product.product_type?.title || 'Report'}`,
      type,
      status,
      severity: 'medium',
      createdDate: product.created,
      updatedDate: product.updated,
      publishedDate: product.rendered_date || undefined,
      author: 'Taranis AI',
      tags: [product.product_type?.title || 'Product'],
      storiesCount: 0, // Non disponible directement
      newsItemsCount: 0,
      metadata: {
        productTypeId: product.product_type?.id,
        rendered: product.rendered,
        fileName: product.file_name || undefined,
      },
    };
  }

  /**
   * Récupérer un rapport spécifique avec détails complets
   */
  async getReportDetails(reportId: string): Promise<Report | null> {
    try {
      // Déterminer si c'est un report-item ou un product
      if (reportId.startsWith('report-')) {
        const itemId = reportId.replace('report-', '');
        const item = await this.taranisService.getReportItemById(itemId);
        if (item) {
          return this.mapReportItemToReport(item);
        }
      } else if (reportId.startsWith('product-')) {
        const productId = reportId.replace('product-', '');
        const product = await this.taranisService.getProductById(productId);
        if (product) {
          return this.mapProductToReport(product);
        }
      }
      return null;
    } catch (error) {
      console.error(`❌ Erreur récupération rapport ${reportId}:`, error);
      return null;
    }
  }

  /**
   * Rendre un product (générer PDF/HTML)
   */
  async renderProduct(productId: string, format: 'pdf' | 'html' = 'pdf'): Promise<string | null> {
    try {
      console.log(`📄 Rendu du product ${productId} en ${format}...`);
      
      const cleanId = productId.replace('product-', '');
      const renderResult = await this.taranisService.renderProduct(cleanId);

      if (renderResult?.url || renderResult?.file_name) {
        console.log(`✅ Product rendu avec succès`);
        return renderResult.url || renderResult.file_name;
      }

      return null;
    } catch (error) {
      console.error(`❌ Erreur rendu product:`, error);
      return null;
    }
  }

  /**
   * Créer un nouveau report item
   */
  async createReportItem(data: {
    title: string;
    description: string;
    reportItemTypeId: string;
    storyIds?: string[];
  }): Promise<string | null> {
    try {
      console.log(`📝 Création d'un nouveau report item: ${data.title}`);
      
      const response = await this.taranisService.createReportItem({
        title: data.title,
        report_item_type_id: data.reportItemTypeId,
      });

      if (response?.id) {
        // Si on a des stories, les lier
        if (data.storyIds && data.storyIds.length > 0) {
          await this.taranisService.updateReportItemStories(response.id, data.storyIds);
        }

        console.log(`✅ Report item créé (ID: ${response.id})`);
        this.invalidateCache();
        return response.id;
      }

      return null;
    } catch (error) {
      console.error(`❌ Erreur création report item:`, error);
      return null;
    }
  }

  /**
   * Mettre à jour un report item
   */
  async updateReportItem(reportId: string, updates: Partial<{
    title: string;
    completed: boolean;
    attributes: any[];
  }>): Promise<boolean> {
    try {
      const cleanId = reportId.replace('report-', '');
      await this.taranisService.updateReportItem(cleanId, updates);
      this.invalidateCache();
      return true;
    } catch (error) {
      console.error(`❌ Erreur mise à jour report item:`, error);
      return false;
    }
  }

  /**
   * Supprimer un report item
   */
  async deleteReportItem(reportId: string): Promise<boolean> {
    try {
      const cleanId = reportId.replace('report-', '');
      await this.taranisService.deleteReportItem(cleanId);
      this.invalidateCache();
      return true;
    } catch (error) {
      console.error(`❌ Erreur suppression report item:`, error);
      return false;
    }
  }

  /**
   * Obtenir les types de rapports disponibles
   */
  async getReportTypes(): Promise<Array<{ id: string; title: string; description: string }>> {
    try {
      const types = await this.taranisService.getReportItemTypes();
      return types || [];
    } catch (error) {
      console.error('❌ Erreur récupération types de rapports:', error);
      return [];
    }
  }

  /**
   * Obtenir les types de produits disponibles
   */
  async getProductTypes(): Promise<Array<{ id: string; title: string; description: string }>> {
    try {
      const types = await this.taranisService.getProductTypes();
      return types || [];
    } catch (error) {
      console.error('❌ Erreur récupération types de produits:', error);
      return [];
    }
  }

  /**
   * Invalide le cache
   */
  invalidateCache(): void {
    reportsCache = null;
    console.log('🗑️ Cache rapports invalidé');
  }

  /**
   * Crée une extraction de fallback
   */
  private createFallbackExtraction(): ReportsExtraction {
    return {
      reports: [],
      totalReports: 0,
      byStatus: { draft: 0, in_progress: 0, review: 0, published: 0, archived: 0 },
      byType: { incident: 0, threat: 0, intelligence: 0, analysis: 0, executive: 0 },
      extractionMethod: 'fallback',
      lastUpdate: new Date().toISOString(),
    };
  }
}

// ============ SINGLETON EXPORT ============

let reportsMapperInstance: TaranisReportsMapperService | null = null;

export function getTaranisReportsMapperService(): TaranisReportsMapperService {
  if (!reportsMapperInstance) {
    reportsMapperInstance = new TaranisReportsMapperService();
  }
  return reportsMapperInstance;
}

export default getTaranisReportsMapperService;

