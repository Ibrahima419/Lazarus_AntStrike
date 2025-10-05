/**
 * Tests d'intégration pour le BotService avec l'API Taranis
 * Fichier de test pour valider l'intégration
 */

import { getBotService } from './bot-service';
import { BotType } from '../types/bot-types';

/**
 * Classe de test pour le BotService
 */
export class BotServiceTest {
  private botService = getBotService();

  /**
   * Test de connexion à l'API Taranis
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔗 Test de connexion à l\'API Taranis...');
      
      // Test via le service Taranis
      const taranisService = this.botService['taranisService'];
      const isConnected = await taranisService.testConnection();
      
      if (isConnected) {
        console.log('✅ Connexion à l\'API Taranis réussie');
        return true;
      } else {
        console.log('❌ Échec de la connexion à l\'API Taranis');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors du test de connexion:', error);
      return false;
    }
  }

  /**
   * Test de récupération des bots
   */
  async testGetBots(): Promise<boolean> {
    try {
      console.log('🤖 Test de récupération des bots...');
      
      const bots = await this.botService.getBots();
      
      if (Array.isArray(bots)) {
        console.log(`✅ ${bots.length} bots récupérés avec succès`);
        
        // Afficher les détails des premiers bots
        bots.slice(0, 3).forEach((bot, index) => {
          console.log(`  Bot ${index + 1}: ${bot.name} (${bot.type}) - ${bot.status}`);
        });
        
        return true;
      } else {
        console.log('❌ Format de réponse invalide pour les bots');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des bots:', error);
      return false;
    }
  }

  /**
   * Test de récupération des worker bots
   */
  async testGetWorkerBots(): Promise<boolean> {
    try {
      console.log('⚙️ Test de récupération des worker bots...');
      
      const workerBots = await this.botService.getActiveWorkerBots();
      
      if (Array.isArray(workerBots)) {
        console.log(`✅ ${workerBots.length} worker bots récupérés`);
        return true;
      } else {
        console.log('❌ Format de réponse invalide pour les worker bots');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des worker bots:', error);
      return false;
    }
  }

  /**
   * Test de création d'un bot
   */
  async testCreateBot(): Promise<boolean> {
    try {
      console.log('➕ Test de création d\'un bot...');
      
      const botData = {
        name: `Test Bot ${Date.now()}`,
        description: 'Bot de test créé automatiquement',
        type: 'analyzer' as BotType,
        config: {
          enabled: true,
          schedule: '0 */1 * * *', // Toutes les heures
          timeout: 1800,
          retryAttempts: 3,
          retryDelay: 60,
          resources: {
            cpuLimit: 1,
            memoryLimit: 512,
            diskSpace: 50
          },
          parameters: {
            analyzer: {
              analysisTypes: ['sentiment', 'keywords'],
              confidenceThreshold: 0.8,
              batchSize: 100,
              mlModels: ['default'],
              language: 'fr'
            }
          },
          triggers: {
            timeBased: true,
            eventBased: false,
            dataBased: false,
            runAfterCollector: false,
            runAfterAnalyzer: false
          },
          notifications: {
            onSuccess: false,
            onError: true,
            onWarning: true,
            recipients: []
          }
        }
      };
      
      const newBot = await this.botService.createBot(botData);
      
      if (newBot && newBot.id) {
        console.log(`✅ Bot créé avec succès: ${newBot.name} (ID: ${newBot.id})`);
        
        // Nettoyer - supprimer le bot de test
        await this.botService.deleteBot(newBot.id);
        console.log('🧹 Bot de test supprimé');
        
        return true;
      } else {
        console.log('❌ Échec de la création du bot');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création du bot:', error);
      return false;
    }
  }

  /**
   * Test de récupération des news items
   */
  async testGetNewsItems(): Promise<boolean> {
    try {
      console.log('📰 Test de récupération des news items...');
      
      const newsItems = await this.botService.getNewsItemsForProcessing(10);
      
      if (Array.isArray(newsItems)) {
        console.log(`✅ ${newsItems.length} news items récupérés`);
        
        // Afficher les détails des premiers items
        newsItems.slice(0, 2).forEach((item, index) => {
          console.log(`  Item ${index + 1}: ${item.title?.substring(0, 50)}...`);
        });
        
        return true;
      } else {
        console.log('❌ Format de réponse invalide pour les news items');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des news items:', error);
      return false;
    }
  }

  /**
   * Test de récupération des stories
   */
  async testGetStories(): Promise<boolean> {
    try {
      console.log('📖 Test de récupération des stories...');
      
      const stories = await this.botService.getStoriesForAnalysis();
      
      if (Array.isArray(stories)) {
        console.log(`✅ ${stories.length} stories récupérées`);
        
        // Afficher les détails des premières stories
        stories.slice(0, 2).forEach((story, index) => {
          console.log(`  Story ${index + 1}: ${story.title?.substring(0, 50)}...`);
        });
        
        return true;
      } else {
        console.log('❌ Format de réponse invalide pour les stories');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stories:', error);
      return false;
    }
  }

  /**
   * Test de récupération des statistiques
   */
  async testGetStatistics(): Promise<boolean> {
    try {
      console.log('📊 Test de récupération des statistiques...');
      
      const stats = await this.botService.getBotStatistics();
      
      if (stats && stats.overview) {
        console.log('✅ Statistiques récupérées avec succès');
        console.log(`  - Total bots: ${stats.overview.totalBots}`);
        console.log(`  - Bots actifs: ${stats.overview.activeBots}`);
        console.log(`  - Taux de succès moyen: ${stats.overview.avgSuccessRate.toFixed(2)}%`);
        
        return true;
      } else {
        console.log('❌ Format de réponse invalide pour les statistiques');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return false;
    }
  }

  /**
   * Test de récupération des tags
   */
  async testGetTags(): Promise<boolean> {
    try {
      console.log('🏷️ Test de récupération des tags...');
      
      const tags = await this.botService.getAvailableTags();
      
      if (Array.isArray(tags)) {
        console.log(`✅ ${tags.length} tags récupérés`);
        
        // Afficher les premiers tags
        if (tags.length > 0) {
          console.log(`  Premiers tags: ${tags.slice(0, 5).join(', ')}`);
        }
        
        return true;
      } else {
        console.log('❌ Format de réponse invalide pour les tags');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tags:', error);
      return false;
    }
  }

  /**
   * Exécute tous les tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Démarrage des tests d\'intégration BotService...\n');
    
    const tests = [
      { name: 'Connexion API', test: () => this.testConnection() },
      { name: 'Récupération des bots', test: () => this.testGetBots() },
      { name: 'Worker bots', test: () => this.testGetWorkerBots() },
      { name: 'Création de bot', test: () => this.testCreateBot() },
      { name: 'News items', test: () => this.testGetNewsItems() },
      { name: 'Stories', test: () => this.testGetStories() },
      { name: 'Statistiques', test: () => this.testGetStatistics() },
      { name: 'Tags', test: () => this.testGetTags() }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
      try {
        const result = await test.test();
        if (result) {
          passedTests++;
        }
      } catch (error) {
        console.error(`❌ Test "${test.name}" a échoué avec une exception:`, error);
      }
      console.log(''); // Ligne vide entre les tests
    }
    
    console.log('📋 Résumé des tests:');
    console.log(`✅ ${passedTests}/${totalTests} tests réussis`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Tous les tests sont passés avec succès !');
    } else {
      console.log(`⚠️ ${totalTests - passedTests} test(s) ont échoué`);
    }
  }
}

/**
 * Fonction utilitaire pour exécuter les tests depuis la console
 */
export async function runBotServiceTests(): Promise<void> {
  const tester = new BotServiceTest();
  await tester.runAllTests();
}

// Export pour utilisation dans les composants React
export default BotServiceTest;
