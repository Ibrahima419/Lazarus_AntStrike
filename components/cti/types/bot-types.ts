/**
 * Types et Interfaces pour le Système de Gestion des Bots
 * Architecture complète pour l'orchestration des bots IA
 */

// ============ TYPES DE BASE ============

export type BotType = 'collector' | 'analyzer' | 'enricher' | 'correlator' | 'reporter';
export type BotStatus = 'active' | 'inactive' | 'running' | 'stopped' | 'error' | 'paused' | 'maintenance';
export type BotPriority = 'low' | 'medium' | 'high' | 'critical';

// ============ INTERFACES PRINCIPALES ============

export interface Bot {
  id: string;
  name: string;
  type: BotType;
  status: BotStatus;
  priority: BotPriority;
  description?: string;
  
  // Configuration
  config: BotConfig;
  
  // Métriques
  metrics: BotMetrics;
  
  // Historique
  history: BotHistoryEntry[];
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

export interface BotConfig {
  // Configuration de base
  enabled: boolean;
  schedule: string; // Cron expression
  timeout: number; // en secondes
  retryAttempts: number;
  retryDelay: number;
  
  // Ressources
  resources: {
    cpuLimit: number;
    memoryLimit: number;
    diskSpace: number;
  };
  
  // Paramètres spécifiques au type
  parameters: BotParameters;
  
  // Déclencheurs
  triggers: {
    timeBased: boolean;
    eventBased: boolean;
    dataBased: boolean;
    runAfterCollector: boolean;
    runAfterAnalyzer: boolean;
  };
  
  // Notifications
  notifications: {
    onSuccess: boolean;
    onError: boolean;
    onWarning: boolean;
    recipients: string[];
  };
}

export interface BotParameters {
  // Collectors
  collector?: {
    sources: string[];
    collectionInterval: number;
    dataTypes: string[];
    filters: string[];
    maxItems: number;
  };
  
  // Analyzers
  analyzer?: {
    analysisTypes: string[];
    confidenceThreshold: number;
    batchSize: number;
    mlModels: string[];
    language: string;
  };
  
  // Enrichers
  enricher?: {
    enrichmentSources: string[];
    enrichmentTypes: string[];
    cacheEnabled: boolean;
    cacheExpiry: number;
    rateLimits: Record<string, number>;
  };
  
  // Correlators
  correlator?: {
    correlationRules: string[];
    timeWindow: number;
    similarityThreshold: number;
    maxCorrelations: number;
  };
  
  // Reporters
  reporter?: {
    reportTypes: string[];
    templateIds: string[];
    recipients: string[];
    schedule: string;
    format: 'pdf' | 'html' | 'json';
  };
}

export interface BotMetrics {
  // Propriétés de niveau supérieur pour compatibilité
  totalProcessed?: number;
  successRate?: number;
  throughput?: number;
  availability?: number;
  
  // Performance
  performance: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    avgProcessingTime: number;
    throughput: number; // items/minute
    lastRun: Date;
    nextRun: Date;
  };
  
  // Ressources
  resources: {
    cpuUsage: number; // %
    memoryUsage: number; // %
    diskUsage: number; // MB
    networkUsage: number; // MB
  };
  
  // Qualité
  quality: {
    accuracy: number; // %
    precision: number; // %
    recall: number; // %
    f1Score: number;
    falsePositiveRate: number; // %
  };
  
  // Opérationnel
  operational: {
    uptime: number; // %
    lastError: Date | null;
    errorCount: number;
    successRate: number; // %
    availability: number; // %
  };
}

export interface BotHistoryEntry {
  id: string;
  timestamp: Date;
  status: 'success' | 'error' | 'warning' | 'info';
  action?: string;
  message: string;
  duration: number;
  itemsProcessed: number;
  details?: any;
}

// ============ TEMPLATES DE BOTS ============

export interface BotTemplate {
  id: string;
  name: string;
  type: BotType;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Configuration par défaut
  defaultConfig: Partial<BotConfig>;
  
  // Paramètres par défaut
  defaultParameters: Partial<BotParameters>;
  
  // Prérequis
  requirements: {
    dependencies: string[];
    permissions: string[];
    resources: {
      minCpu: number;
      minMemory: number;
      minDisk: number;
    };
  };
  
  // Métadonnées
  author: string;
  version: string;
  tags: string[];
  isOfficial: boolean;
}

// ============ PIPELINE ET ORCHESTRATION ============

export interface BotPipeline {
  id: string;
  name: string;
  description: string;
  
  // Étapes du pipeline
  stages: PipelineStage[];
  
  // Configuration globale
  config: {
    enabled: boolean;
    schedule: string;
    maxConcurrency: number;
    timeout: number;
    errorHandling: 'stop' | 'continue' | 'retry';
  };
  
  // Métriques du pipeline
  metrics: {
    totalRuns: number;
    successfulRuns: number;
    avgDuration: number;
    lastRun: Date;
    nextRun: Date;
  };
}

export interface PipelineStage {
  id: string;
  name: string;
  botId: string;
  order: number;
  
  // Conditions d'exécution
  conditions: {
    dependsOn: string[]; // IDs des étapes précédentes
    runIf: 'success' | 'error' | 'always';
    skipIf: string[]; // Conditions de skip
  };
  
  // Configuration spécifique à l'étape
  config: {
    timeout: number;
    retryAttempts: number;
    parallel: boolean;
  };
}

// ============ MONITORING ET ALERTES ============

export interface BotAlert {
  id: string;
  botId: string;
  type: 'error' | 'warning' | 'info' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface BotLog {
  id: string;
  botId: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  details?: any;
  correlationId?: string;
}

// ============ STATISTIQUES ET ANALYTICS ============

export interface BotStatistics {
  // Vue d'ensemble
  overview: {
    totalBots: number;
    activeBots: number;
    runningBots: number;
    errorBots: number;
    totalProcessed: number;
    avgSuccessRate: number;
  };
  
  // Par type
  byType: Record<BotType, {
    count: number;
    successRate: number;
    avgProcessingTime: number;
    totalProcessed: number;
  }>;
  
  // Tendances
  trends: {
    daily: TrendData[];
    weekly: TrendData[];
    monthly: TrendData[];
  };
  
  // Top performers
  topPerformers: {
    byThroughput: Bot[];
    byAccuracy: Bot[];
    byUptime: Bot[];
  };
}

export interface TrendData {
  date: Date;
  value: number;
  metric: string;
}

// ============ TYPES POUR L'UI ============

export interface BotDashboardState {
  selectedBot: Bot | null;
  selectedPipeline: BotPipeline | null;
  viewMode: 'overview' | 'details' | 'pipeline' | 'analytics';
  filters: {
    type: BotType[];
    status: BotStatus[];
    tags: string[];
    dateRange: {
      start: Date;
      end: Date;
    };
  };
  sortBy: 'name' | 'status' | 'lastRun' | 'successRate' | 'throughput';
  sortOrder: 'asc' | 'desc';
}

export interface BotAction {
  type: 'start' | 'stop' | 'restart' | 'pause' | 'resume' | 'update' | 'delete' | 'clone';
  botId: string;
  parameters?: any;
}

// ============ TYPES POUR LES DONNÉES TRAITÉES ============

export interface BotProcessingResult {
  botId: string;
  runId: string;
  startTime: Date;
  endTime: Date;
  status: 'success' | 'error' | 'warning';
  
  // Données traitées
  input: {
    items: number;
    size: number; // bytes
  };
  
  output: {
    items: number;
    size: number; // bytes
    newItems: number;
    updatedItems: number;
  };
  
  // Métriques de qualité
  quality: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  
  // Erreurs et warnings
  errors: BotError[];
  warnings: BotWarning[];
  
  // Détails
  details?: any;
}

export interface BotError {
  code: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stackTrace?: string;
}

export interface BotWarning {
  code: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

// ============ TYPES SPÉCIFIQUES À L'API TARANIS ============

/**
 * Types basés sur les schémas Swagger de Taranis
 */
export interface TaranisBotParameter {
  parameter: {
    description: string;
    id: number;
    key: string;
    name: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN';
  };
  value: string;
}

export interface TaranisBotConfig {
  description: string;
  id: string;
  index: number;
  name: string;
  parameters: TaranisBotParameter[];
  type: string;
}

export interface TaranisBotResponse {
  items: TaranisBotConfig[];
  total_count: number;
}

export interface TaranisNewsItem {
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

export interface TaranisNewsItemAttribute {
  binary_mime_type?: string;
  binary_value?: string;
  id: number;
  key: string;
  value: string;
}

export interface TaranisStory {
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

export interface TaranisStoryTag {
  name: string;
  tag_type: string;
}

export interface TaranisReportItem {
  completed: boolean;
  created: string;
  id: string;
  last_updated: string;
  report_item_type_id: number;
  title: string;
  attribute_groups: string[];
  attributes: TaranisReportItemAttribute[];
  stories: TaranisStory[];
}

export interface TaranisReportItemAttribute {
  description: string;
  group_title: string;
  id: number;
  index: number;
  render_data: string;
  required: boolean;
  title: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'RADIO' | 'ENUM' | 'TEXT' | 'RICH_TEXT' | 'DATE' | 'TIME' | 'DATE_TIME' | 'LINK' | 'ATTACHMENT' | 'TLP' | 'CPE' | 'CVE' | 'CVSS' | 'STORY';
  value: string;
}

export interface TaranisDashboardData {
  latest_collected: string;
  report_items_completed: number;
  report_items_in_progress: number;
  total_database_items: number;
  total_news_items: number;
  total_products: number;
}

export interface TaranisTrendingCluster {
  [key: string]: {
    size: number;
    tags: TaranisClusterTag[];
  };
}

export interface TaranisClusterTag {
  name: string;
  size: number;
  type: string;
}

// ============ EXPORTS ============
// Tous les types sont déjà exportés via les déclarations interface/type ci-dessus
