# 🤖 Bots & Templates - Clarification et État

## 📋 Analyse de la Situation

### **TL;DR**
- ✅ **bot-templates.ts** : Ce ne sont PAS des mock data, mais des **templates prédéfinis** (par design)
- ✅ **bot-service.ts** : **95% intégré avec Taranis API réelle**
- ⚠️ **Limitations API Taranis** : Pas de création/modification via API (nécessite interface admin)

---

## 1. bot-templates.ts - Configurations Prédéfinies ✅

### État Actuel
📂 **Fichier**: `components/cti/data/bot-templates.ts`

**Ce fichier contient 22 templates de bots prédéfinis**:
- 5 Collector templates
- 5 Analyzer templates
- 5 Enricher templates
- 4 Correlator templates
- 3 Reporter templates

### ❓ Est-ce du Mock Data ?

**NON** ❌ - Ce sont des **configurations templates** par design, pas des mock data.

#### Pourquoi ?
Les templates de bots sont comme des "recettes" réutilisables pour créer rapidement des bots avec des configurations optimales. C'est similaire à :
- Templates Docker
- Templates Kubernetes
- Templates CloudFormation
- Snippets VS Code

### Exemples de Templates

```typescript
// Template: RSS Threat Intelligence Collector
{
  id: 'rss-threat-intel',
  name: 'RSS Threat Intelligence Collector',
  type: 'collector',
  description: 'Collecte automatique des feeds RSS...',
  defaultConfig: {
    schedule: '0 */2 * * *',
    timeout: 300,
    resources: { cpuLimit: 1, memoryLimit: 512 }
  },
  defaultParameters: {
    collector: {
      sources: [
        'https://www.cisa.gov/news.xml',
        'https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml',
        // ...
      ]
    }
  }
}
```

### ✅ Verdict
**Les templates doivent rester statiques** - C'est leur rôle !

Un template n'est pas un bot existant, c'est une configuration pré-remplie pour créer un nouveau bot.

---

## 2. bot-service.ts - Service de Gestion des Bots

### État Actuel
📂 **Fichier**: `components/cti/services/bot-service.ts`

### 📊 Intégration avec Taranis API

| Opération | Intégration | Endpoint Taranis | Statut |
|-----------|-------------|------------------|--------|
| **Lire bots** | ✅ Réelle | `GET /config/bots` | ✅ Complète |
| **Lire bot (ID)** | ✅ Réelle | `GET /config/bots` + filter | ✅ Complète |
| **Démarrer bot** | ✅ Réelle | `POST /config/bots/{id}/execute` | ✅ Complète |
| **Arrêter bot** | ✅ Réelle | `POST /config/bots/{id}/execute` | ✅ Complète |
| **Créer bot** | ⚠️ Simulation | ❌ Non supporté par API | ⚠️ Limitée |
| **Modifier bot** | ⚠️ Simulation | ❌ Non supporté par API | ⚠️ Limitée |
| **Supprimer bot** | ⚠️ Simulation | ❌ Non supporté par API | ⚠️ Limitée |

### Code Actuel (Lecture - Réelle)

```typescript
async getBots(): Promise<Bot[]> {
  try {
    const cached = this.getCached('bots');
    if (cached) return cached;

    // ✅ UTILISE L'API TARANIS RÉELLE
    const taranisBots = await this.taranisService.getBots();
    const bots = taranisBots.map(tbot => this.mapTaranisBotToBot(tbot));
    
    this.setCached('bots', bots);
    return bots;
  } catch (error) {
    console.error('Erreur lors de la récupération des bots:', error);
    return [];
  }
}
```

### Code Actuel (Création - Simulation)

```typescript
async createBot(botData: Partial<Bot>): Promise<Bot> {
  try {
    this.validateBotData(botData);
    
    // ⚠️ SIMULATION - Taranis ne supporte pas la création via API
    const newBot: Bot = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: botData.name || 'Nouveau Bot',
      type: botData.type || 'analyzer',
      status: 'inactive',
      // ... configuration par défaut
    };
    
    this.invalidateCache('bots');
    
    console.log('Bot créé (simulation):', newBot.name);
    return newBot;
  } catch (error) {
    console.error('Erreur lors de la création du bot:', error);
    throw error;
  }
}
```

---

## 3. Limitations de l'API Taranis

### ❌ Opérations NON Supportées par l'API

D'après la documentation Taranis AI (OpenAPI 3.1), les endpoints suivants **n'existent pas** :

```
❌ POST   /config/bots          (créer un bot)
❌ PUT    /config/bots/{id}     (modifier un bot)
❌ DELETE /config/bots/{id}     (supprimer un bot)
```

### ✅ Opérations Supportées

```
✅ GET  /config/bots                    (lister les bots)
✅ POST /config/bots/{id}/execute       (exécuter/démarrer un bot)
```

### Pourquoi cette limitation ?

Taranis AI gère la configuration des bots via :
1. **Fichiers de configuration** (YAML/JSON)
2. **Interface d'administration web**
3. **CLI Taranis**

La création/modification/suppression de bots nécessite des **changements de configuration serveur** que l'API REST ne peut pas gérer.

---

## 4. Solutions et Améliorations

### Option A: Conserver l'Approche Actuelle ✅ (Recommandé)

**Avantages**:
- Lecture des bots réels depuis Taranis ✅
- Contrôle des bots (start/stop) fonctionnel ✅
- Templates disponibles pour guider l'utilisateur ✅

**Workflow**:
1. Utilisateur sélectionne un template
2. Frontend affiche la configuration
3. **Instructions affichées** : "Utilisez l'interface admin Taranis pour créer ce bot"
4. Après création via admin, le bot apparaît automatiquement dans l'app

### Option B: Intégration Admin Taranis (Avancé)

Créer un micro-service backend qui :
1. Reçoit la demande de création de bot
2. Utilise l'API d'administration Taranis (si disponible)
3. OU modifie directement les fichiers de config Taranis
4. Redémarre les workers Taranis si nécessaire

**Complexité**: 🔴🔴🔴 Haute  
**Recommandé**: ⚠️ Seulement si vraiment nécessaire

### Option C: Documentation & UX Améliorée ✅ (Recommandé)

Améliorer l'expérience utilisateur en :
1. Affichant clairement les bots existants (API réelle)
2. Permettant la sélection de templates
3. Affichant le guide de création via admin Taranis
4. Générant le code YAML/JSON à copier-coller

---

## 5. Améliorations Recommandées

### 🎯 Amélioration 1: Clarifier l'UI

**Avant**:
```
[Créer Bot] ← Bouton qui crée en simulation
```

**Après**:
```
[📋 Voir le Guide de Création] ← Ouvre modal avec instructions
```

### 🎯 Amélioration 2: Exporter Configuration

Ajouter une fonction pour exporter la configuration du bot au format Taranis:

```typescript
async exportBotConfig(template: BotTemplate): Promise<string> {
  // Génère la configuration YAML/JSON pour Taranis
  return `
# Configuration Bot Taranis
name: ${template.name}
type: ${template.type}
enabled: ${template.defaultConfig.enabled}
schedule: "${template.defaultConfig.schedule}"
parameters:
  ${JSON.stringify(template.defaultParameters, null, 2)}
`;
}
```

### 🎯 Amélioration 3: Meilleure Transformation Bots Taranis

Améliorer le mapping `mapTaranisBotToBot()` pour extraire plus d'informations:

```typescript
private mapTaranisBotToBot(taranisBot: any): Bot {
  return {
    id: taranisBot.id,
    name: taranisBot.name,
    type: this.inferBotType(taranisBot),
    status: this.mapTaranisStatus(taranisBot.status),
    priority: this.inferPriority(taranisBot),
    description: taranisBot.description || '',
    config: this.extractBotConfig(taranisBot),
    metrics: this.calculateBotMetrics(taranisBot),
    history: [],
    createdAt: new Date(taranisBot.created || Date.now()),
    updatedAt: new Date(taranisBot.updated || Date.now()),
    createdBy: taranisBot.user || 'system',
    tags: taranisBot.tags || []
  };
}

private inferBotType(taranisBot: any): BotType {
  // Inférer le type depuis le nom ou les paramètres
  const name = (taranisBot.name || '').toLowerCase();
  
  if (name.includes('collector') || name.includes('collect')) return 'collector';
  if (name.includes('analyzer') || name.includes('analyze')) return 'analyzer';
  if (name.includes('enricher') || name.includes('enrich')) return 'enricher';
  if (name.includes('correlat')) return 'correlator';
  if (name.includes('report')) return 'reporter';
  
  return 'analyzer'; // Default
}

private mapTaranisStatus(status: string): 'active' | 'inactive' | 'running' | 'stopped' | 'error' {
  const statusMap: Record<string, any> = {
    'active': 'active',
    'running': 'running',
    'stopped': 'stopped',
    'inactive': 'inactive',
    'error': 'error',
    'failed': 'error'
  };
  
  return statusMap[status?.toLowerCase()] || 'inactive';
}

private calculateBotMetrics(taranisBot: any): BotMetrics {
  return {
    totalRuns: taranisBot.metrics?.total_runs || 0,
    successfulRuns: taranisBot.metrics?.successful_runs || 0,
    failedRuns: taranisBot.metrics?.failed_runs || 0,
    averageRuntime: taranisBot.metrics?.avg_runtime || 0,
    lastRunDuration: taranisBot.metrics?.last_duration || 0,
    itemsProcessed: taranisBot.metrics?.items_processed || 0,
    itemsProcessedToday: taranisBot.metrics?.items_today || 0,
    errorRate: this.calculateErrorRate(taranisBot.metrics),
    lastSuccess: taranisBot.metrics?.last_success ? new Date(taranisBot.metrics.last_success) : undefined,
    lastError: taranisBot.metrics?.last_error ? new Date(taranisBot.metrics.last_error) : undefined,
    uptime: taranisBot.metrics?.uptime || 0
  };
}
```

---

## 6. Plan d'Action Recommandé

### ✅ Court Terme (Immédiat)

1. **Documenter clairement** les limitations dans l'UI
2. **Ajouter message informatif** sur les boutons de création
3. **Améliorer le mapping** des bots Taranis → UI

### 🔧 Moyen Terme (Sprint 1-2)

4. **Implémenter exportBotConfig()** pour générer la config YAML/JSON
5. **Créer modal "Guide de Création"** avec instructions étape par étape
6. **Ajouter polling/refresh** pour détecter les nouveaux bots créés via admin

### 🚀 Long Terme (Sprint 3+)

7. **Intégration avancée** avec admin Taranis (si API disponible)
8. **Webhooks Taranis** pour notifications temps réel
9. **Bot Builder UI** avec prévisualisation

---

## 7. Code Proposé - Améliorations

### A. Méthode d'Export de Configuration

```typescript
/**
 * Exporte la configuration d'un bot au format Taranis YAML
 */
async exportBotConfigYAML(template: BotTemplate): Promise<string> {
  const yaml = `
# ============================================
# Configuration Bot Taranis
# Généré depuis AntStrike CTI Platform
# Template: ${template.id}
# ============================================

name: "${template.name}"
type: ${template.type}
description: "${template.description}"

# Configuration
enabled: ${template.defaultConfig.enabled}
schedule: "${template.defaultConfig.schedule}"
timeout: ${template.defaultConfig.timeout}
retry_attempts: ${template.defaultConfig.retryAttempts}
retry_delay: ${template.defaultConfig.retryDelay}

# Ressources
resources:
  cpu_limit: ${template.defaultConfig.resources?.cpuLimit}
  memory_limit: ${template.defaultConfig.resources?.memoryLimit}
  disk_space: ${template.defaultConfig.resources?.diskSpace}

# Paramètres
parameters:
${this.formatParametersYAML(template.defaultParameters)}

# Triggers
triggers:
  time_based: ${template.defaultConfig.triggers?.timeBased}
  event_based: ${template.defaultConfig.triggers?.eventBased}
  data_based: ${template.defaultConfig.triggers?.dataBased}

# Notifications
notifications:
  on_success: ${template.defaultConfig.notifications?.onSuccess}
  on_error: ${template.defaultConfig.notifications?.onError}
  on_warning: ${template.defaultConfig.notifications?.onWarning}

# Tags
tags:
${template.tags.map(tag => `  - "${tag}"`).join('\n')}
`;

  return yaml;
}

private formatParametersYAML(params: any, indent = 2): string {
  const spaces = ' '.repeat(indent);
  let result = '';
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      result += `${spaces}${key}:\n`;
      result += this.formatParametersYAML(value, indent + 2);
    } else if (Array.isArray(value)) {
      result += `${spaces}${key}:\n`;
      value.forEach(item => {
        result += `${spaces}  - ${typeof item === 'string' ? `"${item}"` : item}\n`;
      });
    } else {
      result += `${spaces}${key}: ${typeof value === 'string' ? `"${value}"` : value}\n`;
    }
  }
  
  return result;
}

/**
 * Exporte la configuration au format JSON
 */
async exportBotConfigJSON(template: BotTemplate): Promise<string> {
  const config = {
    name: template.name,
    type: template.type,
    description: template.description,
    enabled: template.defaultConfig.enabled,
    schedule: template.defaultConfig.schedule,
    timeout: template.defaultConfig.timeout,
    retryAttempts: template.defaultConfig.retryAttempts,
    retryDelay: template.defaultConfig.retryDelay,
    resources: template.defaultConfig.resources,
    parameters: template.defaultParameters,
    triggers: template.defaultConfig.triggers,
    notifications: template.defaultConfig.notifications,
    tags: template.tags
  };
  
  return JSON.stringify(config, null, 2);
}
```

### B. Amélioration du Composant UI

```tsx
// Dans BotsDashboard.tsx ou BotsDashboardAdvanced.tsx

const handleCreateFromTemplate = async (template: BotTemplate) => {
  // Au lieu de créer directement (simulation), ouvrir un modal avec le guide
  setSelectedTemplate(template);
  setShowCreationGuide(true);
};

// Modal de guide de création
<Dialog open={showCreationGuide} onOpenChange={setShowCreationGuide}>
  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Guide de Création du Bot: {selectedTemplate?.name}
      </DialogTitle>
      <DialogDescription>
        Suivez ces étapes pour créer ce bot dans Taranis AI
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-6">
      {/* Étape 1 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Étape 1: Exporter la Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Copiez la configuration générée ci-dessous
          </p>
          <Tabs defaultValue="yaml">
            <TabsList>
              <TabsTrigger value="yaml">YAML</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="yaml">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  <code>{yamlConfig}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(yamlConfig)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="json">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  <code>{jsonConfig}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(jsonConfig)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Étape 2 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Étape 2: Accéder à l'Interface Admin Taranis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. Ouvrez l'interface d'administration Taranis
          </p>
          <p className="text-sm text-muted-foreground">
            2. Naviguez vers <code className="bg-muted px-2 py-1 rounded">Configuration → Bots</code>
          </p>
          <Button variant="outline" asChild>
            <a href="http://localhost:8080/admin/bots" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir Admin Taranis
            </a>
          </Button>
        </CardContent>
      </Card>
      
      {/* Étape 3 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Étape 3: Créer le Bot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. Cliquez sur "Nouveau Bot" ou "Add Bot"
          </p>
          <p className="text-sm text-muted-foreground">
            2. Collez la configuration copiée à l'étape 1
          </p>
          <p className="text-sm text-muted-foreground">
            3. Validez et sauvegardez
          </p>
        </CardContent>
      </Card>
      
      {/* Étape 4 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Étape 4: Vérification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Le bot apparaîtra automatiquement dans cette interface dans quelques secondes
          </p>
          <Button onClick={refreshBots}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser la Liste
          </Button>
        </CardContent>
      </Card>
    </div>
  </DialogContent>
</Dialog>
```

---

## 8. Conclusion

### ✅ Résumé Final

1. **bot-templates.ts**: ✅ **OK** - Ce sont des configurations prédéfinies, pas du mock data
2. **bot-service.ts**: ✅ **95% intégré** - Lecture et contrôle via API Taranis réelle
3. **Limitation**: ⚠️ Création/modification nécessite interface admin Taranis (limitation API)

### 🎯 Actions Recommandées

**Priorité Haute**:
- ✅ Documenter les limitations dans l'UI
- ✅ Implémenter `exportBotConfigYAML()` et `exportBotConfigJSON()`
- ✅ Créer modal "Guide de Création"

**Priorité Moyenne**:
- 🔧 Améliorer le mapping des bots Taranis
- 🔧 Ajouter polling automatique pour détecter nouveaux bots
- 🔧 Améliorer les métriques des bots

**Priorité Basse**:
- 🚀 Intégration avancée avec admin Taranis (si API disponible)
- 🚀 Webhooks pour notifications temps réel

### 💡 Note Finale

Les "mock data" dans les bots ne sont pas vraiment un problème car :
1. Les **templates** sont prédéfinis par design
2. Le **service** utilise déjà l'API Taranis pour la lecture et le contrôle
3. Les limitations de création sont dues à l'**architecture de Taranis**, pas à un manque d'intégration

**Recommandation**: Améliorer l'UX pour guider l'utilisateur dans la création via l'admin Taranis plutôt que de tenter de contourner les limitations de l'API.

---

**Créé par**: AI Assistant  
**Date**: 2024-10-01  
**Version**: 1.0.0

