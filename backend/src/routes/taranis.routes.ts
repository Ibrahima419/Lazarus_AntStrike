/**
 * 🌐 TARANIS ROUTES - TOUS LES ENDPOINTS RÉELS
 * Routes complètes pour tous les endpoints Taranis AI
 */

import { Router } from 'express';
import { TaranisController } from '../controllers/taranis.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// TOUS LES ENDPOINTS TARANIS NÉCESSITENT UNE AUTHENTIFICATION
// (sauf /auth/login et /auth/method qui sont publics)

// ========================================
// 1. AUTHENTIFICATION
// ========================================

router.post('/auth/login', TaranisController.login); // PUBLIC
router.get('/auth/method', TaranisController.getAuthMethod); // PUBLIC
router.get('/auth/refresh', authenticate, TaranisController.refreshToken);
router.delete('/auth/logout', authenticate, TaranisController.logout);

// ========================================
// 2. UTILISATEURS
// ========================================

router.get('/users', authenticate, TaranisController.getCurrentUser);
router.get('/users/profile', authenticate, TaranisController.getUserProfile);
router.put('/users/profile', authenticate, TaranisController.updateUserProfile);
router.post('/users/profile', authenticate, TaranisController.updateUserProfile);

// ========================================
// 3. DASHBOARD
// ========================================

router.get('/dashboard', authenticate, TaranisController.getDashboard);
router.get('/dashboard/trending-clusters', authenticate, TaranisController.getTrendingClusters);
router.get('/dashboard/story-clusters', authenticate, TaranisController.getStoryClusters);
router.get('/dashboard/cluster/:tag_type', authenticate, TaranisController.getClusterByType);
router.delete('/dashboard/delete-tag/:tag_name', authenticate, TaranisController.deleteTag);
router.get('/dashboard/build-info', authenticate, TaranisController.getBuildInfo);

// ========================================
// 4. ASSESS - STORIES
// ========================================

router.get('/assess/stories', authenticate, TaranisController.getStories);
router.get('/assess/story/:id', authenticate, TaranisController.getStory);
router.put('/assess/story/:id', authenticate, TaranisController.updateStory);
router.patch('/assess/story/:id', authenticate, TaranisController.updateStory);
router.delete('/assess/story/:id', authenticate, TaranisController.deleteStory);
router.post('/assess/story/:connector_id/share', authenticate, TaranisController.shareStory);

// ========================================
// 4.2 ASSESS - NEWS ITEMS
// ========================================

router.get('/assess/news-items', authenticate, TaranisController.getNewsItems);
router.get('/assess/news-items/:id', authenticate, TaranisController.getNewsItem);
router.post('/assess/news-items', authenticate, TaranisController.createNewsItem);
router.put('/assess/news-items/:id', authenticate, TaranisController.updateNewsItem);
router.patch('/assess/news-items/:id', authenticate, TaranisController.updateNewsItem);
router.delete('/assess/news-items/:id', authenticate, TaranisController.deleteNewsItem);
router.put('/assess/news-items/:id/attributes', authenticate, TaranisController.updateNewsItemAttributes);

// ========================================
// 4.3 ASSESS - GROUPEMENT
// ========================================

router.put('/assess/stories/group', authenticate, TaranisController.groupStories);
router.put('/assess/stories/ungroup', authenticate, TaranisController.ungroupStories);
router.put('/assess/news-items/ungroup', authenticate, TaranisController.ungroupNewsItems);
router.post('/assess/stories/botactions', authenticate, TaranisController.executeBotAction);

// ========================================
// 4.4 ASSESS - SOURCES & TAGS
// ========================================

router.get('/assess/osint-source-group-list', authenticate, TaranisController.getOSINTSourceGroups);
router.get('/assess/osint-sources-list', authenticate, TaranisController.getOSINTSourcesList);
router.get('/assess/tags', authenticate, TaranisController.getTags);
router.get('/assess/taglist', authenticate, TaranisController.getTagList);
router.get('/assess/connectors/proposals', authenticate, TaranisController.getConnectorProposals);

// ========================================
// 5. ANALYZE - REPORT ITEMS
// ========================================

router.get('/analyze/report-items', authenticate, TaranisController.getReportItems);
router.get('/analyze/report-items/:id', authenticate, TaranisController.getReportItem);
router.post('/analyze/report-items', authenticate, TaranisController.createReportItem);
router.put('/analyze/report-items/:id', authenticate, TaranisController.updateReportItem);
router.delete('/analyze/report-items/:id', authenticate, TaranisController.deleteReportItem);
router.post('/analyze/report-items/:id/clone', authenticate, TaranisController.cloneReportItem);
router.get('/analyze/report-items/:id/stories', authenticate, TaranisController.getReportItemStories);
router.put('/analyze/report-items/:id/stories', authenticate, TaranisController.setReportItemStories);
router.post('/analyze/report-items/:id/stories', authenticate, TaranisController.addReportItemStories);

// ========================================
// 5.2 ANALYZE - LOCKS
// ========================================

router.get('/analyze/report-items/:id/locks', authenticate, TaranisController.getReportItemLock);
router.put('/analyze/report-items/:id/lock', authenticate, TaranisController.lockReportItem);
router.delete('/analyze/report-items/:id/lock', authenticate, TaranisController.unlockReportItem);

// ========================================
// 5.3 ANALYZE - REPORT TYPES
// ========================================

router.get('/analyze/report-types', authenticate, TaranisController.getReportTypes);

// ========================================
// 6. PUBLISH - PRODUCTS
// ========================================

router.get('/publish/products', authenticate, TaranisController.getProducts);
router.get('/publish/products/:id', authenticate, TaranisController.getProduct);
router.post('/publish/products', authenticate, TaranisController.createProduct);
router.put('/publish/products/:id', authenticate, TaranisController.updateProduct);
router.delete('/publish/products/:id', authenticate, TaranisController.deleteProduct);
router.get('/publish/products/:id/render', authenticate, TaranisController.getProductRender);
router.post('/publish/products/:id/render', authenticate, TaranisController.renderProduct);
router.post('/publish/products/:id/publishers/:publisher_id', authenticate, TaranisController.publishProduct);
router.get('/publish/product-types', authenticate, TaranisController.getProductTypes);

// ========================================
// 7. CONFIG - USERS & ROLES
// ========================================

router.get('/config/users', authenticate, TaranisController.getUsers);
router.get('/config/users/:id', authenticate, TaranisController.getUser);
router.post('/config/users', authenticate, TaranisController.createUser);
router.put('/config/users/:id', authenticate, TaranisController.updateUser);
router.delete('/config/users/:id', authenticate, TaranisController.deleteUser);

router.get('/config/roles', authenticate, TaranisController.getRoles);
router.get('/config/roles/:id', authenticate, TaranisController.getRole);
router.post('/config/roles', authenticate, TaranisController.createRole);
router.put('/config/roles/:id', authenticate, TaranisController.updateRole);
router.delete('/config/roles/:id', authenticate, TaranisController.deleteRole);

router.get('/config/permissions', authenticate, TaranisController.getPermissions);

// ========================================
// 7.2 CONFIG - ORGANIZATIONS
// ========================================

router.get('/config/organizations', authenticate, TaranisController.getOrganizations);
router.get('/config/organizations/:id', authenticate, TaranisController.getOrganization);
router.post('/config/organizations', authenticate, TaranisController.createOrganization);
router.put('/config/organizations/:id', authenticate, TaranisController.updateOrganization);
router.delete('/config/organizations/:id', authenticate, TaranisController.deleteOrganization);

// ========================================
// 7.3 CONFIG - OSINT SOURCES
// ========================================

router.get('/config/osint-sources', authenticate, TaranisController.getOSINTSources);
router.get('/config/osint-sources/:id', authenticate, TaranisController.getOSINTSource);
router.post('/config/osint-sources', authenticate, TaranisController.createOSINTSource);
router.put('/config/osint-sources/:id', authenticate, TaranisController.updateOSINTSource);
router.patch('/config/osint-sources/:id', authenticate, TaranisController.toggleOSINTSource);
router.delete('/config/osint-sources/:id', authenticate, TaranisController.deleteOSINTSource);
router.post('/config/osint-sources/:id/collect', authenticate, TaranisController.collectOSINTSource);
router.post('/config/osint-sources/collect', authenticate, TaranisController.collectAllOSINTSources);
router.get('/config/osint-sources/:id/preview', authenticate, TaranisController.previewOSINTSource);
router.post('/config/osint-sources/:id/preview', authenticate, TaranisController.previewOSINTSource);

// ========================================
// 7.4 CONFIG - OSINT SOURCE GROUPS
// ========================================

router.get('/config/osint-source-groups', authenticate, TaranisController.getOSINTSourceGroupsConfig);
router.get('/config/osint-source-groups/:id', authenticate, TaranisController.getOSINTSourceGroup);
router.post('/config/osint-source-groups', authenticate, TaranisController.createOSINTSourceGroup);
router.put('/config/osint-source-groups/:id', authenticate, TaranisController.updateOSINTSourceGroup);
router.delete('/config/osint-source-groups/:id', authenticate, TaranisController.deleteOSINTSourceGroup);

// ========================================
// 7.5 CONFIG - BOTS
// ========================================

router.get('/config/bots', authenticate, TaranisController.getBots);
router.get('/config/bots/:id', authenticate, TaranisController.getBot);
router.post('/config/bots', authenticate, TaranisController.createBot);
router.put('/config/bots/:id', authenticate, TaranisController.updateBot);
router.delete('/config/bots/:id', authenticate, TaranisController.deleteBot);
router.post('/config/bots/:id/execute', authenticate, TaranisController.executeBot);

// ========================================
// 7.6 CONFIG - WORD LISTS
// ========================================

router.get('/config/word-lists', authenticate, TaranisController.getWordLists);
router.get('/config/word-lists/:id', authenticate, TaranisController.getWordList);
router.post('/config/word-lists', authenticate, TaranisController.createWordList);
router.put('/config/word-lists/:id', authenticate, TaranisController.updateWordList);
router.delete('/config/word-lists/:id', authenticate, TaranisController.deleteWordList);
router.post('/config/word-lists/gather/:id', authenticate, TaranisController.gatherWordList);
router.post('/config/word-lists/gather', authenticate, TaranisController.gatherAllWordLists);

// ========================================
// 8. ASSETS
// ========================================

router.get('/assets', authenticate, TaranisController.getAssets);
router.get('/assets/:id', authenticate, TaranisController.getAsset);
router.post('/assets', authenticate, TaranisController.createAsset);
router.put('/assets/:id', authenticate, TaranisController.updateAsset);
router.delete('/assets/:id', authenticate, TaranisController.deleteAsset);
router.put('/assets/:asset_id/vulnerabilities/:vulnerability_id', authenticate, TaranisController.updateAssetVulnerability);

router.get('/asset-groups', authenticate, TaranisController.getAssetGroups);
router.get('/asset-groups/:id', authenticate, TaranisController.getAssetGroup);
router.post('/asset-groups', authenticate, TaranisController.createAssetGroup);
router.put('/asset-groups/:id', authenticate, TaranisController.updateAssetGroup);
router.delete('/asset-groups/:id', authenticate, TaranisController.deleteAssetGroup);

// ========================================
// 9. ADMIN
// ========================================

router.get('/admin/settings', authenticate, TaranisController.getAdminSettings);
router.put('/admin/settings', authenticate, TaranisController.updateAdminSettings);
router.post('/admin/settings', authenticate, TaranisController.updateAdminSettings);
router.post('/admin/delete-tags', authenticate, TaranisController.deleteAllTags);
router.post('/admin/delete-stories', authenticate, TaranisController.deleteAllStories);
router.post('/admin/clear-queues', authenticate, TaranisController.clearQueues);
router.get('/admin/export-stories', authenticate, TaranisController.exportStories);

// ========================================
// 10. CONNECTORS (CONFLICTS)
// ========================================

router.get('/connectors/conflicts/stories', authenticate, TaranisController.getStoryConflicts);
router.get('/connectors/conflicts/stories/:id', authenticate, TaranisController.getStoryConflict);
router.put('/connectors/conflicts/stories/:id', authenticate, TaranisController.resolveStoryConflict);
router.get('/connectors/conflicts/news-items', authenticate, TaranisController.getNewsItemConflicts);
router.post('/connectors/conflicts/news-items', authenticate, TaranisController.ingestNewsItems);
router.put('/connectors/conflicts/news-items', authenticate, TaranisController.resolveNewsItemConflicts);
router.get('/connectors/story-summary/:id', authenticate, TaranisController.getStorySummary);
router.post('/connectors/conflicts/clear', authenticate, TaranisController.clearAllConflicts);
router.post('/connectors/last-change', authenticate, TaranisController.updateLastChange);

// ========================================
// 11. TASKS
// ========================================

router.get('/tasks/:id', authenticate, TaranisController.getTaskResult);

// ========================================
// 12. SANTÉ
// ========================================

router.get('/isalive', TaranisController.isAlive); // PUBLIC

export default router;
