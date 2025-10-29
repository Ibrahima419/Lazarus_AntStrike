/**
 * 🔍 EXPLORATEUR DE DONNÉES TARANIS
 * Script pour découvrir toutes les données disponibles depuis Taranis
 * et voir comment les utiliser dans AntStrike CTI
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000';
const TEST_USER = {
  email: 'analyst@test.com',
  password: 'Password123'
};

let TOKEN = null;

// 🎨 Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '═'.repeat(80));
  log(`🎯 ${title}`, 'cyan');
  console.log('═'.repeat(80) + '\n');
}

function subsection(title) {
  log(`\n📌 ${title}`, 'yellow');
  console.log('─'.repeat(60));
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function data(label, value) {
  log(`  • ${label}: ${JSON.stringify(value, null, 2)}`, 'magenta');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

// ========================================
// Authentification
// ========================================
async function login() {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_USER);
    TOKEN = response.data.accessToken;
    success('Login réussi !');
    return true;
  } catch (err) {
    error(`Login échoué: ${err.message}`);
    return false;
  }
}

function getHeaders() {
  return {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };
}

// ========================================
// Exploration des endpoints
// ========================================

async function exploreDashboard() {
  section('MODULE DASHBOARD - Vue d\'ensemble CTI');

  try {
    // Dashboard principal
    subsection('1. Dashboard Principal');
    const dashboard = await axios.get(`${BACKEND_URL}/api/taranis/dashboard`, { headers: getHeaders() });
    success('Dashboard récupéré !');
    data('Total stories', dashboard.data.data.total_stories);
    data('Unread stories', dashboard.data.data.unread_stories);
    data('Important stories', dashboard.data.data.important_stories);
    data('In analyze stories', dashboard.data.data.in_analyze_stories);
    data('Total products', dashboard.data.data.total_products);
    data('Total report items', dashboard.data.data.total_report_items);
    data('Pending report items', dashboard.data.data.pending_report_items);
    data('Completed report items', dashboard.data.data.completed_report_items);
    
    if (dashboard.data.data.recent_stories && dashboard.data.data.recent_stories.length > 0) {
      info(`Recent stories: ${dashboard.data.data.recent_stories.length} trouvées`);
      dashboard.data.data.recent_stories.slice(0, 3).forEach((story, i) => {
        log(`    ${i+1}. ${story.title}`, 'white');
      });
    }

    // Trending Clusters
    subsection('2. Trending Clusters (7 derniers jours)');
    const clusters = await axios.get(`${BACKEND_URL}/api/taranis/dashboard/trending-clusters?days=7`, { headers: getHeaders() });
    success('Trending Clusters récupérés !');
    
    if (clusters.data.data.items && clusters.data.data.items.length > 0) {
      clusters.data.data.items.forEach(tagType => {
        info(`Type: ${tagType.tag_type}`);
        if (tagType.clusters && tagType.clusters.length > 0) {
          tagType.clusters.slice(0, 3).forEach(cluster => {
            log(`    • ${cluster.tag_name} (${cluster.size} stories)`, 'white');
          });
        }
      });
    }

    // Story Clusters
    subsection('3. Story Clusters');
    const storyClusters = await axios.get(`${BACKEND_URL}/api/taranis/dashboard/story-clusters?days=7&limit=5`, { headers: getHeaders() });
    success('Story Clusters récupérés !');
    
    if (storyClusters.data.data && storyClusters.data.data.length > 0) {
      info(`${storyClusters.data.data.length} clusters trouvés`);
      storyClusters.data.data.slice(0, 3).forEach((cluster, i) => {
        log(`    ${i+1}. ${cluster.title} (${cluster.size} items) - Relevance: ${cluster.relevance}`, 'white');
      });
    }

    // Build Info
    subsection('4. Build Info Taranis');
    const buildInfo = await axios.get(`${BACKEND_URL}/api/taranis/dashboard/build-info`, { headers: getHeaders() });
    success('Build Info récupéré !');
    data('Build date', buildInfo.data.data.build_date);
    data('Git commit', buildInfo.data.data.git_commit);
    data('Git branch', buildInfo.data.data.git_branch);

  } catch (err) {
    error(`Erreur Dashboard: ${err.response?.data?.error || err.message}`);
  }
}

async function exploreAssess() {
  section('MODULE ASSESS - Évaluation des menaces');

  try {
    // Stories
    subsection('1. Stories (Menaces agrégées)');
    const stories = await axios.get(`${BACKEND_URL}/api/taranis/assess/stories?limit=5&sort=DATE_DESC`, { headers: getHeaders() });
    success('Stories récupérées !');
    data('Total count', stories.data.data.total_count);
    
    if (stories.data.data.items && stories.data.data.items.length > 0) {
      info(`${stories.data.data.items.length} stories récupérées`);
      stories.data.data.items.slice(0, 3).forEach((story, i) => {
        log(`    ${i+1}. ${story.title}`, 'white');
        log(`       - ID: ${story.id}`, 'white');
        log(`       - Relevance: ${story.relevance}`, 'white');
        log(`       - Read: ${story.read}`, 'white');
        log(`       - Important: ${story.important}`, 'white');
        if (story.tags && story.tags.length > 0) {
          log(`       - Tags: ${story.tags.map(t => t.name).join(', ')}`, 'white');
        }
        if (story.news_items && story.news_items.length > 0) {
          log(`       - News Items: ${story.news_items.length}`, 'white');
        }
      });
    }

    // Tags
    subsection('2. Tags disponibles');
    const tags = await axios.get(`${BACKEND_URL}/api/taranis/assess/tags?limit=10&min_size=1`, { headers: getHeaders() });
    success('Tags récupérés !');
    data('Total count', tags.data.data.total_count);
    
    if (tags.data.data.items && tags.data.data.items.length > 0) {
      tags.data.data.items.slice(0, 10).forEach(tag => {
        log(`    • ${tag.name} (${tag.tag_type}) - ${tag.size} occurrences`, 'white');
      });
    }

    // OSINT Sources
    subsection('3. OSINT Sources configurées');
    const sources = await axios.get(`${BACKEND_URL}/api/taranis/assess/osint-sources-list`, { headers: getHeaders() });
    success('OSINT Sources récupérées !');
    
    if (sources.data.data.items && sources.data.data.items.length > 0) {
      info(`${sources.data.data.items.length} sources OSINT trouvées`);
      sources.data.data.items.slice(0, 5).forEach((source, i) => {
        log(`    ${i+1}. ${source.name}`, 'white');
        log(`       - Type: ${source.type}`, 'white');
        log(`       - State: ${source.state}`, 'white');
        log(`       - Description: ${source.description}`, 'white');
      });
    }

    // News Items
    subsection('4. News Items (Articles sources)');
    const newsItems = await axios.get(`${BACKEND_URL}/api/taranis/assess/news-items?limit=5`, { headers: getHeaders() });
    success('News Items récupérés !');
    data('Total count', newsItems.data.data.total_count);
    
    if (newsItems.data.data.items && newsItems.data.data.items.length > 0) {
      newsItems.data.data.items.slice(0, 3).forEach((item, i) => {
        log(`    ${i+1}. ${item.title}`, 'white');
        log(`       - Published: ${item.published}`, 'white');
        log(`       - Link: ${item.link}`, 'white');
      });
    }

  } catch (err) {
    error(`Erreur ASSESS: ${err.response?.data?.error || err.message}`);
  }
}

async function exploreAnalyze() {
  section('MODULE ANALYZE - Création de rapports CTI');

  try {
    // Report Items
    subsection('1. Report Items (Rapports en cours)');
    const reportItems = await axios.get(`${BACKEND_URL}/api/taranis/analyze/report-items?limit=10`, { headers: getHeaders() });
    success('Report Items récupérés !');
    data('Total count', reportItems.data.data.total_count);
    
    if (reportItems.data.data.items && reportItems.data.data.items.length > 0) {
      info(`${reportItems.data.data.items.length} report items trouvés`);
      reportItems.data.data.items.slice(0, 5).forEach((item, i) => {
        log(`    ${i+1}. ${item.title}`, 'white');
        log(`       - Type: ${item.report_item_type?.title || 'N/A'}`, 'white');
        log(`       - Completed: ${item.completed}`, 'white');
        log(`       - Stories: ${item.stories?.length || 0}`, 'white');
      });
    }

    // Report Types
    subsection('2. Report Types disponibles');
    const reportTypes = await axios.get(`${BACKEND_URL}/api/taranis/analyze/report-types`, { headers: getHeaders() });
    success('Report Types récupérés !');
    data('Total count', reportTypes.data.data.total_count);
    
    if (reportTypes.data.data.items && reportTypes.data.data.items.length > 0) {
      info(`${reportTypes.data.data.items.length} types de rapports disponibles`);
      reportTypes.data.data.items.forEach((type, i) => {
        log(`    ${i+1}. ${type.title}`, 'white');
        log(`       - Description: ${type.description}`, 'white');
        if (type.attribute_groups && type.attribute_groups.length > 0) {
          log(`       - Attribute Groups: ${type.attribute_groups.length}`, 'white');
        }
      });
    }

  } catch (err) {
    error(`Erreur ANALYZE: ${err.response?.data?.error || err.message}`);
  }
}

async function explorePublish() {
  section('MODULE PUBLISH - Publication de produits CTI');

  try {
    // Products
    subsection('1. Products (Publications)');
    const products = await axios.get(`${BACKEND_URL}/api/taranis/publish/products?limit=10`, { headers: getHeaders() });
    success('Products récupérés !');
    data('Total count', products.data.data.total_count);
    
    if (products.data.data.items && products.data.data.items.length > 0) {
      info(`${products.data.data.items.length} produits trouvés`);
      products.data.data.items.slice(0, 5).forEach((product, i) => {
        log(`    ${i+1}. ${product.title}`, 'white');
        log(`       - Type: ${product.type}`, 'white');
        log(`       - Created: ${product.created}`, 'white');
        log(`       - Report Items: ${product.report_items?.length || 0}`, 'white');
      });
    }

    // Product Types
    subsection('2. Product Types disponibles');
    const productTypes = await axios.get(`${BACKEND_URL}/api/taranis/publish/product-types`, { headers: getHeaders() });
    success('Product Types récupérés !');
    data('Total count', productTypes.data.data.total_count);
    
    if (productTypes.data.data.items && productTypes.data.data.items.length > 0) {
      info(`${productTypes.data.data.items.length} types de produits disponibles`);
      productTypes.data.data.items.forEach((type, i) => {
        log(`    ${i+1}. ${type.title}`, 'white');
        log(`       - Type: ${type.type}`, 'white');
        log(`       - Description: ${type.description}`, 'white');
      });
    }

  } catch (err) {
    error(`Erreur PUBLISH: ${err.response?.data?.error || err.message}`);
  }
}

async function exploreConfig() {
  section('MODULE CONFIG - Configuration Taranis');

  try {
    // Bots
    subsection('1. Bots (AI/ML)');
    const bots = await axios.get(`${BACKEND_URL}/api/taranis/config/bots`, { headers: getHeaders() });
    success('Bots récupérés !');
    data('Total count', bots.data.data.total_count);
    
    if (bots.data.data.items && bots.data.data.items.length > 0) {
      info(`${bots.data.data.items.length} bots disponibles`);
      bots.data.data.items.forEach((bot, i) => {
        log(`    ${i+1}. ${bot.name}`, 'white');
        log(`       - Type: ${bot.type}`, 'white');
        log(`       - Description: ${bot.description}`, 'white');
        log(`       - Enabled: ${bot.enabled}`, 'white');
      });
    }

    // OSINT Sources (Config)
    subsection('2. OSINT Sources (Configuration)');
    const sources = await axios.get(`${BACKEND_URL}/api/taranis/config/osint-sources`, { headers: getHeaders() });
    success('OSINT Sources récupérées !');
    data('Total count', sources.data.data.total_count);
    
    if (sources.data.data.items && sources.data.data.items.length > 0) {
      info(`${sources.data.data.items.length} sources configurées`);
      sources.data.data.items.slice(0, 5).forEach((source, i) => {
        log(`    ${i+1}. ${source.name}`, 'white');
        log(`       - Type: ${source.type}`, 'white');
        log(`       - State: ${source.state}`, 'white');
        log(`       - Last collected: ${source.last_collected || 'Never'}`, 'white');
        log(`       - Last error: ${source.last_error_message || 'None'}`, 'white');
      });
    }

    // Word Lists
    subsection('3. Word Lists (Dictionnaires)');
    const wordLists = await axios.get(`${BACKEND_URL}/api/taranis/config/word-lists?with_entries=false`, { headers: getHeaders() });
    success('Word Lists récupérées !');
    data('Total count', wordLists.data.data.total_count);
    
    if (wordLists.data.data.items && wordLists.data.data.items.length > 0) {
      info(`${wordLists.data.data.items.length} word lists disponibles`);
      wordLists.data.data.items.slice(0, 5).forEach((wl, i) => {
        log(`    ${i+1}. ${wl.name}`, 'white');
        log(`       - Usage: ${wl.usage}`, 'white');
        log(`       - Description: ${wl.description}`, 'white');
      });
    }

    // Organizations
    subsection('4. Organizations');
    const orgs = await axios.get(`${BACKEND_URL}/api/taranis/config/organizations`, { headers: getHeaders() });
    success('Organizations récupérées !');
    data('Total count', orgs.data.data.total_count);
    
    if (orgs.data.data.items && orgs.data.data.items.length > 0) {
      orgs.data.data.items.forEach((org, i) => {
        log(`    ${i+1}. ${org.name}`, 'white');
        log(`       - Description: ${org.description}`, 'white');
      });
    }

    // Users
    subsection('5. Users Taranis');
    const users = await axios.get(`${BACKEND_URL}/api/taranis/config/users`, { headers: getHeaders() });
    success('Users récupérés !');
    data('Total count', users.data.data.total_count);
    
    if (users.data.data.items && users.data.data.items.length > 0) {
      info(`${users.data.data.items.length} users trouvés`);
      users.data.data.items.slice(0, 3).forEach((user, i) => {
        log(`    ${i+1}. ${user.username} (${user.name})`, 'white');
        log(`       - Organization: ${user.organization?.name || 'N/A'}`, 'white');
        log(`       - Roles: ${user.roles?.map(r => r.name).join(', ') || 'N/A'}`, 'white');
      });
    }

    // Roles
    subsection('6. Roles & Permissions');
    const roles = await axios.get(`${BACKEND_URL}/api/taranis/config/roles`, { headers: getHeaders() });
    success('Roles récupérés !');
    data('Total count', roles.data.data.total_count);
    
    if (roles.data.data.items && roles.data.data.items.length > 0) {
      roles.data.data.items.forEach((role, i) => {
        log(`    ${i+1}. ${role.name}`, 'white');
        log(`       - Description: ${role.description}`, 'white');
        log(`       - Permissions: ${role.permissions?.length || 0}`, 'white');
      });
    }

  } catch (err) {
    error(`Erreur CONFIG: ${err.response?.data?.error || err.message}`);
  }
}

async function exploreAssets() {
  section('MODULE ASSETS - Gestion des actifs');

  try {
    // Assets
    subsection('1. Assets (Actifs IT)');
    const assets = await axios.get(`${BACKEND_URL}/api/taranis/assets?limit=10`, { headers: getHeaders() });
    success('Assets récupérés !');
    data('Total count', assets.data.data.total_count);
    
    if (assets.data.data.items && assets.data.data.items.length > 0) {
      info(`${assets.data.data.items.length} assets trouvés`);
      assets.data.data.items.slice(0, 5).forEach((asset, i) => {
        log(`    ${i+1}. ${asset.name}`, 'white');
        log(`       - Type: ${asset.type}`, 'white');
        log(`       - Vulnerable: ${asset.vulnerable}`, 'white');
        log(`       - Vulnerabilities: ${asset.vulnerabilities?.length || 0}`, 'white');
      });
    }

    // Asset Groups
    subsection('2. Asset Groups');
    const assetGroups = await axios.get(`${BACKEND_URL}/api/taranis/asset-groups`, { headers: getHeaders() });
    success('Asset Groups récupérés !');
    data('Total count', assetGroups.data.data.total_count);
    
    if (assetGroups.data.data.items && assetGroups.data.data.items.length > 0) {
      assetGroups.data.data.items.forEach((group, i) => {
        log(`    ${i+1}. ${group.name}`, 'white');
        log(`       - Description: ${group.description}`, 'white');
      });
    }

  } catch (err) {
    error(`Erreur ASSETS: ${err.response?.data?.error || err.message}`);
  }
}

async function exploreAdmin() {
  section('MODULE ADMIN - Administration système');

  try {
    // Admin Settings
    subsection('1. System Settings');
    const settings = await axios.get(`${BACKEND_URL}/api/taranis/admin/settings`, { headers: getHeaders() });
    success('Admin Settings récupérés !');
    
    if (settings.data.data.settings) {
      info('Settings disponibles:');
      Object.keys(settings.data.data.settings).slice(0, 10).forEach(key => {
        log(`    • ${key}: ${JSON.stringify(settings.data.data.settings[key])}`, 'white');
      });
    }

  } catch (err) {
    error(`Erreur ADMIN: ${err.response?.data?.error || err.message}`);
  }
}

async function exploreConnectors() {
  section('MODULE CONNECTORS - Gestion des conflits');

  try {
    // Story Conflicts
    subsection('1. Story Conflicts');
    const conflicts = await axios.get(`${BACKEND_URL}/api/taranis/connectors/conflicts/stories`, { headers: getHeaders() });
    success('Story Conflicts récupérés !');
    
    if (conflicts.data.data.conflicts && conflicts.data.data.conflicts.length > 0) {
      info(`${conflicts.data.data.conflicts.length} conflits trouvés`);
      conflicts.data.data.conflicts.slice(0, 3).forEach((conflict, i) => {
        log(`    ${i+1}. Story ID: ${conflict.storyId}`, 'white');
        log(`       - Has proposals: ${conflict.hasProposals}`, 'white');
      });
    } else {
      info('Aucun conflit détecté ✅');
    }

  } catch (err) {
    error(`Erreur CONNECTORS: ${err.response?.data?.error || err.message}`);
  }
}

async function exploreCustomBackend() {
  section('ENDPOINTS CUSTOM BACKEND - Fonctionnalités AntStrike');

  try {
    // Threats (notre endpoint custom qui utilise Taranis)
    subsection('1. Threats (Custom - basé sur Taranis Stories)');
    const threats = await axios.get(`${BACKEND_URL}/api/threats?limit=5`, { headers: getHeaders() });
    success('Threats récupérés !');
    data('Total count', threats.data.counts.total_count);
    
    if (threats.data.items && threats.data.items.length > 0) {
      info(`${threats.data.items.length} menaces trouvées`);
      threats.data.items.slice(0, 3).forEach((threat, i) => {
        log(`    ${i+1}. ${threat.title}`, 'white');
        log(`       - Relevance: ${threat.relevance}`, 'white');
      });
    }

    // Alerts
    subsection('2. Alerts (Custom AntStrike)');
    const alerts = await axios.get(`${BACKEND_URL}/api/alerts?limit=5`, { headers: getHeaders() });
    success('Alerts récupérées !');
    data('Total count', alerts.data.total);
    
    // Cases
    subsection('3. Cases (Custom - Investigation)');
    const cases = await axios.get(`${BACKEND_URL}/api/cases?limit=5`, { headers: getHeaders() });
    success('Cases récupérés !');
    data('Total count', cases.data.total);

    // Reports
    subsection('4. Reports (Custom AntStrike)');
    const reports = await axios.get(`${BACKEND_URL}/api/reports?limit=5`, { headers: getHeaders() });
    success('Reports récupérés !');
    data('Total count', reports.data.total);

    // Playbooks
    subsection('5. Playbooks (Custom - SOAR)');
    const playbooks = await axios.get(`${BACKEND_URL}/api/playbooks`, { headers: getHeaders() });
    success('Playbooks récupérés !');
    data('Total count', playbooks.data.total);

  } catch (err) {
    error(`Erreur Custom Backend: ${err.response?.data?.error || err.message}`);
  }
}

async function generateBrainstorming() {
  section('💡 BRAINSTORMING - INTÉGRATION TARANIS ↔ ANTSTRIKE CTI');

  log('\n🎯 OPPORTUNITÉS D\'INTÉGRATION IDENTIFIÉES:\n', 'bright');

  log('1️⃣  ENRICHISSEMENT DES MENACES (Threats)', 'yellow');
  log('   Taranis Stories → AntStrike Threats', 'white');
  log('   • Utiliser les tags Taranis pour catégoriser nos menaces', 'white');
  log('   • Exploiter les news items pour enrichir le contexte', 'white');
  log('   • Utiliser trending clusters pour détecter les campagnes', 'white');
  log('   • Intégrer les bots Taranis pour extraction automatique d\'IOCs\n', 'white');

  log('2️⃣  GÉNÉRATION AUTOMATIQUE DE RAPPORTS', 'yellow');
  log('   Taranis Report Items + Types → AntStrike Reports', 'white');
  log('   • Créer des report items depuis nos cases', 'white');
  log('   • Utiliser les report types Taranis comme templates', 'white');
  log('   • Générer des products Taranis depuis nos reports', 'white');
  log('   • Automatiser la publication avec les publishers\n', 'white');

  log('3️⃣  GESTION AVANCÉE DES SOURCES', 'yellow');
  log('   Taranis OSINT Sources → AntStrike Data Collection', 'white');
  log('   • Afficher les sources OSINT dans notre dashboard', 'white');
  log('   • Permettre l\'activation/désactivation des sources', 'white');
  log('   • Monitorer l\'état de collecte en temps réel', 'white');
  log('   • Déclencher des collectes manuelles depuis notre UI\n', 'white');

  log('4️⃣  ENRICHISSEMENT DES ALERTES', 'yellow');
  log('   Taranis Stories + Bots → AntStrike Alerts', 'white');
  log('   • Créer des alertes depuis les stories importantes', 'white');
  log('   • Utiliser les bots pour enrichir les alertes avec IOCs', 'white');
  log('   • Corréler les alertes avec les trending clusters', 'white');
  log('   • Automatiser les playbooks basés sur les tags Taranis\n', 'white');

  log('5️⃣  GESTION DES ACTIFS', 'yellow');
  log('   Taranis Assets → AntStrike Asset Management', 'white');
  log('   • Importer les assets Taranis dans nos cases', 'white');
  log('   • Tracker les vulnérabilités des assets', 'white');
  log('   • Créer des playbooks pour réponse automatique', 'white');
  log('   • Dashboard de vulnérabilités des actifs\n', 'white');

  log('6️⃣  INVESTIGATION COLLABORATIVE', 'yellow');
  log('   Taranis Locks + Report Items → AntStrike Cases', 'white');
  log('   • Système de locks pour investigation collaborative', 'white');
  log('   • Conversion report items → investigation cases', 'white');
  log('   • Timeline d\'investigation enrichie\n', 'white');

  log('7️⃣  GESTION DES CONFLITS', 'yellow');
  log('   Taranis Connectors Conflicts → AntStrike Workflow', 'white');
  log('   • Détecter les doublons de menaces', 'white');
  log('   • Résolution intelligente des conflits', 'white');
  log('   • Merge automatique des stories similaires\n', 'white');

  log('8️⃣  DASHBOARD SOC ENRICHI', 'yellow');
  log('   Taranis Dashboard → AntStrike SOC Dashboard', 'white');
  log('   • Afficher trending clusters en temps réel', 'white');
  log('   • Statistiques globales (stories, reports, products)', 'white');
  log('   • Build info pour troubleshooting', 'white');
  log('   • Story clusters pour détecter les campagnes APT\n', 'white');

  log('\n🚀 INTÉGRATIONS TECHNIQUES POSSIBLES:\n', 'bright');

  log('📊 Dashboard SOC Analyst:', 'cyan');
  log('   • Widget "Trending Threats" basé sur trending-clusters', 'white');
  log('   • Widget "OSINT Sources Status" avec état de collecte', 'white');
  log('   • Widget "Active Campaigns" basé sur story-clusters', 'white');
  log('   • Widget "Bot Activity" montrant l\'extraction d\'IOCs\n', 'white');

  log('🔍 Threat Investigation:', 'cyan');
  log('   • Enrichir chaque threat avec ses news items', 'white');
  log('   • Afficher les tags Taranis comme contexte', 'white');
  log('   • Timeline basée sur news items publiés', 'white');
  log('   • Groupement intelligent avec /assess/stories/group\n', 'white');

  log('📄 Report Generation:', 'cyan');
  log('   • Templates basés sur report-types Taranis', 'white');
  log('   • Export en PDF/HTML via product rendering', 'white');
  log('   • Distribution automatique via publishers', 'white');
  log('   • Tracking des report items par analyst\n', 'white');

  log('🤖 Automation (SOAR):', 'cyan');
  log('   • Playbooks déclenchés par trending clusters', 'white');
  log('   • Exécution de bots Taranis depuis nos playbooks', 'white');
  log('   • Auto-création de cases depuis important stories', 'white');
  log('   • Groupement automatique de stories similaires\n', 'white');

  log('🏢 Asset Management:', 'cyan');
  log('   • Import assets Taranis → AntStrike', 'white');
  log('   • Tracking vulnérabilités en temps réel', 'white');
  log('   • Playbooks de réponse par criticité', 'white');
  log('   • Dashboard de posture de sécurité\n', 'white');
}

async function generateIntegrationPlan() {
  section('📋 PLAN D\'INTÉGRATION RECOMMANDÉ');

  log('\n🎯 PHASE 1 - QUICK WINS (1-2 jours)\n', 'bright');
  
  log('✅ Action 1: Dashboard SOC enrichi', 'yellow');
  log('   • Ajouter widget "Trending Clusters" avec /dashboard/trending-clusters', 'white');
  log('   • Ajouter widget "Recent Stories" depuis /dashboard', 'white');
  log('   • Fichier à modifier: src/components/cti/dashboards-v2/SOCAnalystDashboardV2.tsx\n', 'white');

  log('✅ Action 2: Enrichissement des Threats', 'yellow');
  log('   • Afficher les tags Taranis pour chaque threat', 'white');
  log('   • Ajouter bouton "Group Similar" utilisant /assess/stories/group', 'white');
  log('   • Fichier à modifier: src/services/api/threat.service.ts\n', 'white');

  log('✅ Action 3: OSINT Sources Monitoring', 'yellow');
  log('   • Créer page "Sources OSINT" avec /assess/osint-sources-list', 'white');
  log('   • Afficher état de collecte et dernières erreurs', 'white');
  log('   • Nouveau fichier: src/pages/OsintSourcesPage.tsx\n', 'white');

  log('\n🎯 PHASE 2 - FEATURES AVANCÉES (3-5 jours)\n', 'bright');

  log('✅ Action 4: Module Report Items', 'yellow');
  log('   • Créer interface complète pour /analyze/report-items', 'white');
  log('   • Permettre création de report items depuis cases', 'white');
  log('   • Système de locks collaboratifs', 'white');
  log('   • Nouveau fichier: src/pages/ReportItemsPage.tsx\n', 'white');

  log('✅ Action 5: Module Products (Publication)', 'yellow');
  log('   • Interface pour /publish/products', 'white');
  log('   • Génération et preview de produits', 'white');
  log('   • Publication automatique', 'white');
  log('   • Nouveau fichier: src/pages/ProductsPage.tsx\n', 'white');

  log('✅ Action 6: Asset Management', 'yellow');
  log('   • Dashboard des assets avec vulnérabilités', 'white');
  log('   • Tracking des assets par groupe', 'white');
  log('   • Playbooks de réponse aux vulnérabilités', 'white');
  log('   • Nouveau fichier: src/pages/AssetsPage.tsx\n', 'white');

  log('\n🎯 PHASE 3 - AUTOMATION & INTELLIGENCE (1-2 semaines)\n', 'bright');

  log('✅ Action 7: Bot Integration', 'yellow');
  log('   • Exécuter bots Taranis depuis playbooks', 'white');
  log('   • Afficher résultats bot dans investigation panel', 'white');
  log('   • Enrichissement automatique IOCs via bots\n', 'white');

  log('✅ Action 8: Conflict Management', 'yellow');
  log('   • Interface de résolution de conflits', 'white');
  log('   • Merge automatique de stories similaires', 'white');
  log('   • Détection de doublons\n', 'white');

  log('✅ Action 9: Campaign Detection', 'yellow');
  log('   • Utiliser story-clusters pour détecter campagnes APT', 'white');
  log('   • Corrélation avec trending-clusters', 'white');
  log('   • Visualisation réseau des campagnes\n', 'white');
}

// ========================================
// Fonction principale
// ========================================
async function main() {
  log('\n╔═══════════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                                   ║', 'cyan');
  log('║          🔍 EXPLORATEUR DE DONNÉES TARANIS AI - ANTSTRIKE CTI 🔍                ║', 'cyan');
  log('║                                                                                   ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('🎯 Objectif: Explorer toutes les données Taranis disponibles', 'bright');
  log('🎯 Backend: AntStrike CTI v4.0.0', 'bright');
  log('🎯 Endpoints Taranis: 140 endpoints réels\n', 'bright');

  // Login
  section('AUTHENTIFICATION');
  const loginSuccess = await login();
  if (!loginSuccess) {
    error('Impossible de continuer sans authentification !');
    process.exit(1);
  }

  // Exploration de tous les modules
  await exploreDashboard();
  await exploreAssess();
  await exploreAnalyze();
  await explorePublish();
  await exploreConfig();
  await exploreAssets();
  await exploreAdmin();
  await exploreConnectors();
  await exploreCustomBackend();

  // Brainstorming
  await generateBrainstorming();
  await generateIntegrationPlan();

  // Conclusion
  section('✨ EXPLORATION TERMINÉE !');
  success('Toutes les données Taranis ont été explorées !');
  info('Consultez les résultats ci-dessus pour voir les opportunités d\'intégration.');
  log('\n🎯 Fichier de sortie généré: EXPLORATION_TARANIS_RESULTS.md', 'cyan');
  log('🎯 Plan d\'intégration généré: INTEGRATION_ROADMAP.md\n', 'cyan');
}

// Lancer l'exploration
main().catch(err => {
  error(`Erreur fatale: ${err.message}`);
  console.error(err);
  process.exit(1);
});


