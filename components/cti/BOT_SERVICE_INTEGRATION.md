# Intégration BotService avec l'API Taranis

## Vue d'ensemble

Le `BotService` a été mis à jour pour s'intégrer parfaitement avec l'API Taranis basée sur la documentation Swagger fournie. Cette intégration permet une gestion complète des bots IA dans la plateforme CTI.

## Endpoints Taranis Utilisés

### Configuration des Bots (`/config/bots`)
- `GET /config/bots` - Récupérer tous les bots configurés
- `POST /config/bots` - Créer un nouveau bot
- `PUT /config/bots/{bot_id}` - Mettre à jour un bot existant
- `DELETE /config/bots/{bot_id}` - Supprimer un bot
- `POST /config/bots/{bot_id}/execute` - Exécuter un bot à la demande

### Worker Bots (`/worker/bots`)
- `GET /worker/bots` - Récupérer les bots en cours d'exécution

### Enrichissement et Analyse (`/bots/`)
- `GET /bots/news-item` - Récupérer tous les news items
- `PUT /bots/news-item/{news_item_id}/attributes` - Enrichir un news item
- `PUT /bots/stories/group` - Grouper des news items en stories

### Worker Tags (`/worker/tags`)
- `GET /worker/tags` - Récupérer tous les tags disponibles
- `PUT /worker/tags` - Mettre à jour les tags

## Nouvelles Fonctionnalités

### 1. Gestion Complète des Bots
```typescript
// Récupérer tous les bots
const bots = await botService.getBots();

// Récupérer les bots actifs via worker
const activeBots = await botService.getActiveWorkerBots();

// Créer un nouveau bot
const newBot = await botService.createBot({
  name: 'Mon Bot IA',
  type: 'analyzer',
  description: 'Bot d\'analyse automatique'
});

// Exécuter un bot
const success = await botService.executeBot('bot-id', parameters);
```

### 2. Enrichissement des News Items
```typescript
// Enrichir un news item avec les bots d'analyse
const enriched = await botService.enrichNewsItem('news-item-id', {
  sentiment: 'positive',
  keywords: ['cybersecurity', 'threat'],
  confidence: 0.85
});
```

### 3. Groupement de Stories avec IA
```typescript
// Grouper des news items en stories
const grouped = await botService.groupStoriesWithAI([
  'news-item-1',
  'news-item-2',
  'news-item-3'
]);
```

### 4. Récupération des Données pour Analyse
```typescript
// Récupérer les news items pour traitement
const newsItems = await botService.getNewsItemsForProcessing(100);

// Récupérer les stories pour analyse
const stories = await botService.getStoriesForAnalysis();

// Récupérer les tags disponibles
const tags = await botService.getAvailableTags();
```

## Types TypeScript

### Types Taranis Spécifiques
Le fichier `bot-types.ts` a été étendu avec des types spécifiques à l'API Taranis :

```typescript
interface TaranisBotConfig {
  description: string;
  id: string;
  index: number;
  name: string;
  parameters: TaranisBotParameter[];
  type: string;
}

interface TaranisNewsItem {
  attributes: TaranisNewsItemAttribute[];
  author: string;
  collected: string;
  content: string;
  hash: string;
  id: string;
  language: string;
  last_change: string;
  link: string;
  osint_source_id: string;
  published: string;
  review: string;
  source: string;
  story_id?: string;
  title: string;
  updated: string;
}

interface TaranisStory {
  comments: string;
  created: string;
  description: string;
  dislikes: number;
  id: string;
  important: boolean;
  in_reports_count: number;
  last_change: string;
  likes: number;
  news_items: TaranisNewsItem[];
  read: boolean;
  tags: TaranisStoryTag[];
  title: string;
}
```

## Tests d'Intégration

### Composant de Test
Un composant React `BotServiceTestComponent` a été créé pour tester l'intégration :

```typescript
import { BotServiceTestComponent } from './components/cti/BotServiceTestComponent';

// Utilisation dans votre application
<BotServiceTestComponent />
```

### Tests Automatisés
La classe `BotServiceTest` fournit des tests automatisés :

```typescript
import { runBotServiceTests } from './services/bot-service-test';

// Exécuter tous les tests
await runBotServiceTests();
```

### Tests Inclus
- ✅ Test de connexion à l'API Taranis
- ✅ Récupération des bots configurés
- ✅ Récupération des worker bots
- ✅ Création et suppression d'un bot de test
- ✅ Récupération des news items
- ✅ Récupération des stories
- ✅ Récupération des statistiques
- ✅ Récupération des tags disponibles

## Configuration

### Variables d'Environnement
Assurez-vous que les variables suivantes sont configurées :

```env
VITE_TARANIS_API_URL=http://localhost:8080/api
VITE_TARANIS_API_KEY=your-api-key-here
```

### Authentification
Le service utilise l'authentification JWT de Taranis :
- Login automatique avec les credentials par défaut
- Gestion automatique du refresh des tokens
- Stockage sécurisé des tokens dans localStorage

## Utilisation dans l'Application

### 1. Import du Service
```typescript
import { getBotService } from './services/bot-service';

const botService = getBotService();
```

### 2. Intégration avec React
```typescript
import React, { useEffect, useState } from 'react';
import { Bot } from './types/bot-types';

const BotDashboard: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  
  useEffect(() => {
    const loadBots = async () => {
      const botList = await getBotService().getBots();
      setBots(botList);
    };
    
    loadBots();
  }, []);
  
  return (
    <div>
      {bots.map(bot => (
        <div key={bot.id}>
          <h3>{bot.name}</h3>
          <p>Type: {bot.type} | Status: {bot.status}</p>
        </div>
      ))}
    </div>
  );
};
```

### 3. Gestion des Erreurs
```typescript
try {
  const result = await botService.executeBot('bot-id');
  if (result) {
    console.log('Bot exécuté avec succès');
  }
} catch (error) {
  console.error('Erreur lors de l\'exécution du bot:', error);
  // Gestion de l'erreur dans l'UI
}
```

## Monitoring et Logs

### Historique des Bots
Chaque bot maintient un historique de ses exécutions :
```typescript
const history = await botService.getBotHistory('bot-id', 50);
```

### Statistiques Globales
```typescript
const stats = await botService.getBotStatistics();
console.log(`Total bots: ${stats.overview.totalBots}`);
console.log(`Bots actifs: ${stats.overview.activeBots}`);
```

### Cache et Performance
- Cache automatique avec expiration (5 minutes)
- Invalidation intelligente du cache
- Retry automatique en cas d'erreur réseau

## Sécurité

### Authentification
- Utilisation de JWT pour l'authentification
- Refresh automatique des tokens
- Gestion des erreurs 401

### Validation des Données
- Validation des paramètres avant envoi à l'API
- Sanitisation des entrées utilisateur
- Gestion des erreurs de validation

## Développement et Debug

### Logs Détaillés
Le service fournit des logs détaillés pour le debugging :
```typescript
// Les logs sont automatiquement générés pour :
// - Connexions API
// - Créations/modifications de bots
// - Exécutions de bots
// - Erreurs et exceptions
```

### Tests de Connexion
```typescript
// Vérifier la connexion à l'API
const isConnected = await taranisService.testConnection();
if (!isConnected) {
  console.error('Impossible de se connecter à l\'API Taranis');
}
```

## Conclusion

L'intégration du `BotService` avec l'API Taranis fournit une interface complète et robuste pour la gestion des bots IA dans la plateforme CTI. Elle inclut :

- ✅ Gestion complète CRUD des bots
- ✅ Exécution à la demande des bots
- ✅ Enrichissement automatique des données
- ✅ Groupement intelligent des stories
- ✅ Monitoring et statistiques
- ✅ Tests d'intégration automatisés
- ✅ Types TypeScript complets
- ✅ Gestion d'erreurs robuste
- ✅ Cache et performance optimisés

Cette intégration permet une orchestration efficace des bots IA pour l'analyse de la cyber-menace dans la plateforme AntStrike CTI.
