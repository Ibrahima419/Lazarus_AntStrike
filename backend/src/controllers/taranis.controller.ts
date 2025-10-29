/**
 * 🌐 TARANIS CONTROLLER - TOUS LES ENDPOINTS RÉELS
 * Controller complet exposant tous les endpoints Taranis AI
 */

import { Request, Response } from 'express';
import { TaranisService } from '../services/taranis.service';
import { logger } from '../utils/logger';

/**
 * Helper pour gérer les erreurs Taranis proprement
 */
function handleError(error: any, res: Response, context: string) {
  const status = error.response?.status || 500;
  const message = error.message || 'Unknown error';
  
  logger.error(`Taranis ${context}:`, { 
    status, 
    url: error.config?.url,
    message 
  });
  
  res.status(status).json({ success: false, error: message });
}

export class TaranisController {
  
  // ========================================
  // 1. AUTHENTIFICATION
  // ========================================

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const data = await TaranisService.login(username, password);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Login');
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const data = await TaranisService.refreshToken();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Refresh Token');
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const data = await TaranisService.logout();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Logout');
    }
  }

  static async getAuthMethod(req: Request, res: Response) {
    try {
      const data = await TaranisService.getAuthMethod();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Auth Method');
    }
  }

  // ========================================
  // 2. UTILISATEURS
  // ========================================

  static async getCurrentUser(req: Request, res: Response) {
    try {
      const data = await TaranisService.getCurrentUser();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Current User');
    }
  }

  static async getUserProfile(req: Request, res: Response) {
    try {
      const data = await TaranisService.getUserProfile();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get User Profile');
    }
  }

  static async updateUserProfile(req: Request, res: Response) {
    try {
      const data = await TaranisService.updateUserProfile(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update User Profile');
    }
  }

  // ========================================
  // 3. DASHBOARD
  // ========================================

  static async getDashboard(req: Request, res: Response) {
    try {
      const data = await TaranisService.getDashboard();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Dashboard');
    }
  }

  static async getTrendingClusters(req: Request, res: Response) {
    try {
      const data = await TaranisService.getTrendingClusters(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Trending Clusters');
    }
  }

  static async getStoryClusters(req: Request, res: Response) {
    try {
      const data = await TaranisService.getStoryClusters(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Story Clusters');
    }
  }

  static async getClusterByType(req: Request, res: Response) {
    try {
      const { tag_type } = req.params;
      const data = await TaranisService.getClusterByType(tag_type, req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Cluster By Type');
    }
  }

  static async deleteTag(req: Request, res: Response) {
    try {
      const { tag_name } = req.params;
      const data = await TaranisService.deleteTag(tag_name);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Tag');
    }
  }

  static async getBuildInfo(req: Request, res: Response) {
    try {
      const data = await TaranisService.getBuildInfo();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Build Info');
    }
  }

  // ========================================
  // 4. ASSESS - STORIES
  // ========================================

  static async getStories(req: Request, res: Response) {
    try {
      const data = await TaranisService.getStories(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Stories');
    }
  }

  static async getStory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getStory(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Story');
    }
  }

  static async updateStory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateStory(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Story');
    }
  }

  static async deleteStory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteStory(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Story');
    }
  }

  static async shareStory(req: Request, res: Response) {
    try {
      const { connector_id } = req.params;
      const { story_ids } = req.body;
      const data = await TaranisService.shareStory(connector_id, story_ids);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Share Story');
    }
  }

  // ========================================
  // 4.2 ASSESS - NEWS ITEMS
  // ========================================

  static async getNewsItems(req: Request, res: Response) {
    try {
      const data = await TaranisService.getNewsItems(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get News Items');
    }
  }

  static async getNewsItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getNewsItem(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get News Item');
    }
  }

  static async createNewsItem(req: Request, res: Response) {
    try {
      const data = await TaranisService.createNewsItem(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create News Item');
    }
  }

  static async updateNewsItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateNewsItem(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update News Item');
    }
  }

  static async deleteNewsItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteNewsItem(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete News Item');
    }
  }

  static async updateNewsItemAttributes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateNewsItemAttributes(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update News Item Attributes');
    }
  }

  // ========================================
  // 4.3 ASSESS - GROUPEMENT
  // ========================================

  static async groupStories(req: Request, res: Response) {
    try {
      const data = await TaranisService.groupStories(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Group Stories');
    }
  }

  static async ungroupStories(req: Request, res: Response) {
    try {
      const data = await TaranisService.ungroupStories(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Ungroup Stories');
    }
  }

  static async ungroupNewsItems(req: Request, res: Response) {
    try {
      const data = await TaranisService.ungroupNewsItems(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Ungroup News Items');
    }
  }

  static async executeBotAction(req: Request, res: Response) {
    try {
      const { bot_id, story_id } = req.body;
      const data = await TaranisService.executeBotAction(bot_id, story_id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Execute Bot Action');
    }
  }

  // ========================================
  // 4.4 ASSESS - SOURCES & TAGS
  // ========================================

  static async getOSINTSourceGroups(req: Request, res: Response) {
    try {
      const data = await TaranisService.getOSINTSourceGroups();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get OSINT Source Groups');
    }
  }

  static async getOSINTSourcesList(req: Request, res: Response) {
    try {
      const data = await TaranisService.getOSINTSourcesList();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get OSINT Sources List');
    }
  }

  static async getTags(req: Request, res: Response) {
    try {
      const data = await TaranisService.getTags(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Tags');
    }
  }

  static async getTagList(req: Request, res: Response) {
    try {
      const data = await TaranisService.getTagList(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Tag List');
    }
  }

  static async getConnectorProposals(req: Request, res: Response) {
    try {
      const data = await TaranisService.getConnectorProposals();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Connector Proposals');
    }
  }

  // ========================================
  // 5. ANALYZE - REPORT ITEMS
  // ========================================

  static async getReportItems(req: Request, res: Response) {
    try {
      const data = await TaranisService.getReportItems(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Report Items');
    }
  }

  static async getReportItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getReportItem(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Report Item');
    }
  }

  static async createReportItem(req: Request, res: Response) {
    try {
      const data = await TaranisService.createReportItem(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create Report Item');
    }
  }

  static async updateReportItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateReportItem(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Report Item');
    }
  }

  static async deleteReportItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteReportItem(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Report Item');
    }
  }

  static async cloneReportItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.cloneReportItem(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Clone Report Item');
    }
  }

  static async getReportItemStories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getReportItemStories(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Report Item Stories');
    }
  }

  static async setReportItemStories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.setReportItemStories(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Set Report Item Stories');
    }
  }

  static async addReportItemStories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.addReportItemStories(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Add Report Item Stories');
    }
  }

  // ========================================
  // 5.2 ANALYZE - LOCKS
  // ========================================

  static async getReportItemLock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getReportItemLock(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Report Item Lock');
    }
  }

  static async lockReportItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.lockReportItem(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Lock Report Item');
    }
  }

  static async unlockReportItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.unlockReportItem(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Unlock Report Item');
    }
  }

  // ========================================
  // 5.3 ANALYZE - REPORT TYPES
  // ========================================

  static async getReportTypes(req: Request, res: Response) {
    try {
      const data = await TaranisService.getReportTypes();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Report Types');
    }
  }

  // ========================================
  // 6. PUBLISH - PRODUCTS
  // ========================================

  static async getProducts(req: Request, res: Response) {
    try {
      const data = await TaranisService.getProducts(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Products');
    }
  }

  static async getProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getProduct(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Product');
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const data = await TaranisService.createProduct(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create Product');
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateProduct(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Product');
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteProduct(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Product');
    }
  }

  static async getProductRender(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getProductRender(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Product Render');
    }
  }

  static async renderProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.renderProduct(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Render Product');
    }
  }

  static async publishProduct(req: Request, res: Response) {
    try {
      const { id, publisher_id } = req.params;
      const data = await TaranisService.publishProduct(id, publisher_id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Publish Product');
    }
  }

  static async getProductTypes(req: Request, res: Response) {
    try {
      const data = await TaranisService.getProductTypes();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Product Types');
    }
  }

  // ========================================
  // 7. CONFIG - USERS & ROLES
  // ========================================

  static async getUsers(req: Request, res: Response) {
    try {
      const data = await TaranisService.getUsers(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Users');
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getUser(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get User');
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const data = await TaranisService.createUser(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create User');
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateUser(parseInt(id), req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update User');
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteUser(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete User');
    }
  }

  static async getRoles(req: Request, res: Response) {
    try {
      const data = await TaranisService.getRoles(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Roles');
    }
  }

  static async getRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getRole(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Role');
    }
  }

  static async createRole(req: Request, res: Response) {
    try {
      const data = await TaranisService.createRole(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create Role');
    }
  }

  static async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateRole(parseInt(id), req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Role');
    }
  }

  static async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteRole(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Role');
    }
  }

  static async getPermissions(req: Request, res: Response) {
    try {
      const data = await TaranisService.getPermissions();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Permissions');
    }
  }

  // ========================================
  // 7.2 CONFIG - ORGANIZATIONS
  // ========================================

  static async getOrganizations(req: Request, res: Response) {
    try {
      const data = await TaranisService.getOrganizations(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Organizations');
    }
  }

  static async getOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getOrganization(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Organization');
    }
  }

  static async createOrganization(req: Request, res: Response) {
    try {
      const data = await TaranisService.createOrganization(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create Organization');
    }
  }

  static async updateOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateOrganization(parseInt(id), req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Organization');
    }
  }

  static async deleteOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteOrganization(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Organization');
    }
  }

  // ========================================
  // 7.3 CONFIG - OSINT SOURCES
  // ========================================

  static async getOSINTSources(req: Request, res: Response) {
    try {
      const data = await TaranisService.getOSINTSources(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get OSINT Sources');
    }
  }

  static async getOSINTSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getOSINTSource(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get OSINT Source');
    }
  }

  static async createOSINTSource(req: Request, res: Response) {
    try {
      const data = await TaranisService.createOSINTSource(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create OSINT Source');
    }
  }

  static async updateOSINTSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateOSINTSource(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update OSINT Source');
    }
  }

  static async toggleOSINTSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { state } = req.body;
      const data = await TaranisService.toggleOSINTSource(id, state);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Toggle OSINT Source');
    }
  }

  static async deleteOSINTSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { force } = req.query;
      const data = await TaranisService.deleteOSINTSource(id, force === 'true');
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete OSINT Source');
    }
  }

  static async collectOSINTSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.collectOSINTSource(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Collect OSINT Source');
    }
  }

  static async collectAllOSINTSources(req: Request, res: Response) {
    try {
      const data = await TaranisService.collectAllOSINTSources();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Collect All OSINT Sources');
    }
  }

  static async previewOSINTSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.previewOSINTSource(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Preview OSINT Source');
    }
  }

  // ========================================
  // 7.4 CONFIG - OSINT SOURCE GROUPS
  // ========================================

  static async getOSINTSourceGroupsConfig(req: Request, res: Response) {
    try {
      const data = await TaranisService.getOSINTSourceGroupsConfig();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get OSINT Source Groups Config');
    }
  }

  static async getOSINTSourceGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getOSINTSourceGroup(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get OSINT Source Group');
    }
  }

  static async createOSINTSourceGroup(req: Request, res: Response) {
    try {
      const data = await TaranisService.createOSINTSourceGroup(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create OSINT Source Group');
    }
  }

  static async updateOSINTSourceGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateOSINTSourceGroup(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update OSINT Source Group');
    }
  }

  static async deleteOSINTSourceGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteOSINTSourceGroup(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete OSINT Source Group');
    }
  }

  // Continuez avec CONFIG - BOTS, WORD LISTS, ASSETS, ADMIN, CONNECTORS...
  // (Je continue dans le prochain message car le fichier est très long)

  // ========================================
  // 7.5 CONFIG - BOTS
  // ========================================

  static async getBots(req: Request, res: Response) {
    try {
      const data = await TaranisService.getBots();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Bots');
    }
  }

  static async getBot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getBot(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Bot');
    }
  }

  static async createBot(req: Request, res: Response) {
    try {
      const data = await TaranisService.createBot(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create Bot');
    }
  }

  static async updateBot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateBot(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Bot');
    }
  }

  static async deleteBot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteBot(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Bot');
    }
  }

  static async executeBot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.executeBot(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Execute Bot');
    }
  }

  // ========================================
  // 7.6 CONFIG - WORD LISTS
  // ========================================

  static async getWordLists(req: Request, res: Response) {
    try {
      const data = await TaranisService.getWordLists(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Word Lists');
    }
  }

  static async getWordList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getWordList(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Word List');
    }
  }

  static async createWordList(req: Request, res: Response) {
    try {
      const data = await TaranisService.createWordList(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create Word List');
    }
  }

  static async updateWordList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateWordList(parseInt(id), req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Word List');
    }
  }

  static async deleteWordList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteWordList(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Word List');
    }
  }

  static async gatherWordList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.gatherWordList(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Gather Word List');
    }
  }

  static async gatherAllWordLists(req: Request, res: Response) {
    try {
      const data = await TaranisService.gatherAllWordLists();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Gather All Word Lists');
    }
  }

  // ========================================
  // 8. ASSETS
  // ========================================

  static async getAssets(req: Request, res: Response) {
    try {
      const data = await TaranisService.getAssets(req.query as any);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Assets');
    }
  }

  static async getAsset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getAsset(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Asset');
    }
  }

  static async createAsset(req: Request, res: Response) {
    try {
      const data = await TaranisService.createAsset(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create Asset');
    }
  }

  static async updateAsset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateAsset(parseInt(id), req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Asset');
    }
  }

  static async deleteAsset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteAsset(parseInt(id));
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Asset');
    }
  }

  static async updateAssetVulnerability(req: Request, res: Response) {
    try {
      const { asset_id, vulnerability_id } = req.params;
      const { solved } = req.body;
      const data = await TaranisService.updateAssetVulnerability(
        parseInt(asset_id), 
        vulnerability_id, 
        solved
      );
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Asset Vulnerability');
    }
  }

  static async getAssetGroups(req: Request, res: Response) {
    try {
      const data = await TaranisService.getAssetGroups();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Asset Groups');
    }
  }

  static async getAssetGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getAssetGroup(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Asset Group');
    }
  }

  static async createAssetGroup(req: Request, res: Response) {
    try {
      const data = await TaranisService.createAssetGroup(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Create Asset Group');
    }
  }

  static async updateAssetGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.updateAssetGroup(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Asset Group');
    }
  }

  static async deleteAssetGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.deleteAssetGroup(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete Asset Group');
    }
  }

  // ========================================
  // 9. ADMIN
  // ========================================

  static async getAdminSettings(req: Request, res: Response) {
    try {
      const data = await TaranisService.getAdminSettings();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Admin Settings');
    }
  }

  static async updateAdminSettings(req: Request, res: Response) {
    try {
      const data = await TaranisService.updateAdminSettings(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Admin Settings');
    }
  }

  static async deleteAllTags(req: Request, res: Response) {
    try {
      const data = await TaranisService.deleteAllTags();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete All Tags');
    }
  }

  static async deleteAllStories(req: Request, res: Response) {
    try {
      const data = await TaranisService.deleteAllStories();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Delete All Stories');
    }
  }

  static async clearQueues(req: Request, res: Response) {
    try {
      const data = await TaranisService.clearQueues();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Clear Queues');
    }
  }

  static async exportStories(req: Request, res: Response) {
    try {
      const { metadata } = req.query;
      const data = await TaranisService.exportStories(metadata === 'true');
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Export Stories');
    }
  }

  // ========================================
  // 10. CONNECTORS (CONFLICTS)
  // ========================================

  static async getStoryConflicts(req: Request, res: Response) {
    try {
      const data = await TaranisService.getStoryConflicts();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Story Conflicts');
    }
  }

  static async getStoryConflict(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getStoryConflict(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Story Conflict');
    }
  }

  static async resolveStoryConflict(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.resolveStoryConflict(id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Resolve Story Conflict');
    }
  }

  static async getNewsItemConflicts(req: Request, res: Response) {
    try {
      const data = await TaranisService.getNewsItemConflicts();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get News Item Conflicts');
    }
  }

  static async ingestNewsItems(req: Request, res: Response) {
    try {
      const data = await TaranisService.ingestNewsItems(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Ingest News Items');
    }
  }

  static async resolveNewsItemConflicts(req: Request, res: Response) {
    try {
      const data = await TaranisService.resolveNewsItemConflicts(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Resolve News Item Conflicts');
    }
  }

  static async getStorySummary(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getStorySummary(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Story Summary');
    }
  }

  static async clearAllConflicts(req: Request, res: Response) {
    try {
      const data = await TaranisService.clearAllConflicts();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Clear All Conflicts');
    }
  }

  static async updateLastChange(req: Request, res: Response) {
    try {
      const data = await TaranisService.updateLastChange(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Update Last Change');
    }
  }

  // ========================================
  // 11. TASKS
  // ========================================

  static async getTaskResult(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await TaranisService.getTaskResult(id);
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Get Task Result');
    }
  }

  // ========================================
  // 12. SANTÉ
  // ========================================

  static async isAlive(req: Request, res: Response) {
    try {
      const data = await TaranisService.isAlive();
      res.json({ success: true, data });
    } catch (error: any) {
      handleError(error, res, 'Is Alive');
    }
  }
}
