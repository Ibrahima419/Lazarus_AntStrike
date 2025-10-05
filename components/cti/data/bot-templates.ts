/**
 * Templates de Bots Prédéfinis
 * Collection de configurations prêtes à l'emploi pour différents types de bots
 */

import { BotTemplate, BotType } from '../types/bot-types';

// ============ TEMPLATES COLLECTORS ============

export const collectorTemplates: BotTemplate[] = [
  {
    id: 'rss-threat-intel',
    name: 'RSS Threat Intelligence Collector',
    type: 'collector',
    description: 'Collecte automatique des feeds RSS de threat intelligence depuis les sources officielles',
    category: 'Threat Intelligence',
    difficulty: 'beginner',
    
    defaultConfig: {
      enabled: true,
      schedule: '0 */2 * * *', // Toutes les 2h
      timeout: 300,
      retryAttempts: 3,
      retryDelay: 60,
      resources: {
        cpuLimit: 1,
        memoryLimit: 512,
        diskSpace: 100
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
    },
    
    defaultParameters: {
      collector: {
        sources: [
          'https://www.cisa.gov/news.xml',
          'https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml',
          'https://www.ssi.gouv.fr/feed/',
          'https://www.cert.ssi.gouv.fr/feed/'
        ],
        collectionInterval: 7200, // 2h en secondes
        dataTypes: ['news', 'alerts', 'advisories', 'threat-reports'],
        filters: ['cybersecurity', 'threat', 'malware', 'vulnerability'],
        maxItems: 1000
      }
    },
    
    requirements: {
      dependencies: ['feedparser', 'requests'],
      permissions: ['read:feeds'],
      resources: {
        minCpu: 0.5,
        minMemory: 256,
        minDisk: 50
      }
    },
    
    author: 'AntStrike Team',
    version: '1.0.0',
    tags: ['rss', 'threat-intelligence', 'official-sources'],
    isOfficial: true
  },
  
  {
    id: 'api-virustotal',
    name: 'VirusTotal API Collector',
    type: 'collector',
    description: 'Collecte des données de réputation et d\'analyse depuis l\'API VirusTotal',
    category: 'Malware Intelligence',
    difficulty: 'intermediate',
    
    defaultConfig: {
      enabled: true,
      schedule: '0 */1 * * *', // Toutes les heures
      timeout: 600,
      retryAttempts: 5,
      retryDelay: 30,
      resources: {
        cpuLimit: 2,
        memoryLimit: 1024,
        diskSpace: 200
      },
      triggers: {
        timeBased: true,
        eventBased: true,
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
    },
    
    defaultParameters: {
      collector: {
        sources: ['https://www.virustotal.com/vtapi/v2/'],
        collectionInterval: 3600, // 1h
        dataTypes: ['file-reports', 'url-reports', 'domain-reports', 'ip-reports'],
        filters: ['malicious', 'suspicious', 'clean'],
        maxItems: 500
      }
    },
    
    requirements: {
      dependencies: ['virustotal-api', 'requests'],
      permissions: ['read:api', 'write:cache'],
      resources: {
        minCpu: 1,
        minMemory: 512,
        minDisk: 100
      }
    },
    
    author: 'AntStrike Team',
    version: '1.0.0',
    tags: ['api', 'virustotal', 'malware', 'reputation'],
    isOfficial: true
  },
  
  {
    id: 'social-monitoring',
    name: 'Social Media Threat Monitor',
    type: 'collector',
    description: 'Monitoring des réseaux sociaux pour détecter les discussions sur les menaces',
    category: 'OSINT',
    difficulty: 'advanced',
    
    defaultConfig: {
      enabled: true,
      schedule: '*/15 * * * *', // Toutes les 15min
      timeout: 180,
      retryAttempts: 3,
      retryDelay: 45,
      resources: {
        cpuLimit: 3,
        memoryLimit: 2048,
        diskSpace: 500
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
    },
    
    defaultParameters: {
      collector: {
        sources: ['twitter', 'reddit', 'telegram'],
        collectionInterval: 900, // 15min
        dataTypes: ['posts', 'comments', 'mentions'],
        filters: ['#threatintel', '#malware', '#ransomware', '#phishing'],
        maxItems: 2000
      }
    },
    
    requirements: {
      dependencies: ['tweepy', 'praw', 'telethon'],
      permissions: ['read:social', 'write:cache'],
      resources: {
        minCpu: 2,
        minMemory: 1024,
        minDisk: 200
      }
    },
    
    author: 'AntStrike Team',
    version: '1.0.0',
    tags: ['social-media', 'osint', 'monitoring', 'real-time'],
    isOfficial: true
  }
];

// ============ TEMPLATES ANALYZERS ============

export const analyzerTemplates: BotTemplate[] = [
  {
    id: 'ioc-extractor',
    name: 'IOC Extraction Bot',
    type: 'analyzer',
    description: 'Extraction automatique des indicateurs de compromission (IOCs) depuis le contenu textuel',
    category: 'IOC Processing',
    difficulty: 'intermediate',
    
    defaultConfig: {
      enabled: true,
      schedule: 'run_after_collector',
      timeout: 600,
      retryAttempts: 3,
      retryDelay: 30,
      resources: {
        cpuLimit: 4,
        memoryLimit: 2048,
        diskSpace: 100
      },
      triggers: {
        timeBased: false,
        eventBased: true,
        dataBased: false,
        runAfterCollector: true,
        runAfterAnalyzer: false
      },
      notifications: {
        onSuccess: false,
        onError: true,
        onWarning: true,
        recipients: []
      }
    },
    
    defaultParameters: {
      analyzer: {
        analysisTypes: ['ioc-extraction', 'entity-recognition'],
        confidenceThreshold: 0.8,
        batchSize: 100,
        mlModels: ['ioc-extractor-v2', 'ner-model'],
        language: 'fr,en'
      }
    },
    
    requirements: {
      dependencies: ['spacy', 'regex', 'ipaddress'],
      permissions: ['read:content', 'write:iocs'],
      resources: {
        minCpu: 2,
        minMemory: 1024,
        minDisk: 50
      }
    },
    
    author: 'AntStrike Team',
    version: '2.1.0',
    tags: ['ioc', 'extraction', 'nlp', 'regex'],
    isOfficial: true
  },
  
  {
    id: 'threat-classifier',
    name: 'Threat Classification Bot',
    type: 'analyzer',
    description: 'Classification automatique des menaces par type, sévérité et catégorie',
    category: 'Threat Analysis',
    difficulty: 'advanced',
    
    defaultConfig: {
      enabled: true,
      schedule: 'run_after_extraction',
      timeout: 900,
      retryAttempts: 2,
      retryDelay: 60,
      resources: {
        cpuLimit: 6,
        memoryLimit: 4096,
        diskSpace: 200
      },
      triggers: {
        timeBased: false,
        eventBased: true,
        dataBased: false,
        runAfterCollector: false,
        runAfterAnalyzer: true
      },
      notifications: {
        onSuccess: false,
        onError: true,
        onWarning: true,
        recipients: []
      }
    },
    
    defaultParameters: {
      analyzer: {
        analysisTypes: ['threat-classification', 'severity-assessment', 'category-tagging'],
        confidenceThreshold: 0.85,
        batchSize: 50,
        mlModels: ['threat-classifier-v3', 'severity-predictor'],
        language: 'fr,en'
      }
    },
    
    requirements: {
      dependencies: ['scikit-learn', 'tensorflow', 'transformers'],
      permissions: ['read:threats', 'write:classifications'],
      resources: {
        minCpu: 4,
        minMemory: 2048,
        minDisk: 100
      }
    },
    
    author: 'AntStrike Team',
    version: '3.0.0',
    tags: ['classification', 'ml', 'threats', 'severity'],
    isOfficial: true
  },
  
  {
    id: 'story-grouper',
    name: 'Story Grouping Bot',
    type: 'analyzer',
    description: 'Regroupement intelligent d\'histoires connexes basé sur la similarité sémantique',
    category: 'Content Analysis',
    difficulty: 'advanced',
    
    defaultConfig: {
      enabled: true,
      schedule: '0 */4 * * *', // Toutes les 4h
      timeout: 1800,
      retryAttempts: 2,
      retryDelay: 120,
      resources: {
        cpuLimit: 8,
        memoryLimit: 8192,
        diskSpace: 500
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
    },
    
    defaultParameters: {
      analyzer: {
        analysisTypes: ['similarity-analysis', 'clustering', 'grouping'],
        confidenceThreshold: 0.7,
        batchSize: 200,
        mlModels: ['sentence-transformer', 'clustering-model'],
        language: 'fr,en'
      }
    },
    
    requirements: {
      dependencies: ['sentence-transformers', 'scikit-learn', 'faiss'],
      permissions: ['read:stories', 'write:groups'],
      resources: {
        minCpu: 6,
        minMemory: 4096,
        minDisk: 200
      }
    },
    
    author: 'AntStrike Team',
    version: '2.0.0',
    tags: ['clustering', 'similarity', 'stories', 'nlp'],
    isOfficial: true
  }
];

// ============ TEMPLATES ENRICHERS ============

export const enricherTemplates: BotTemplate[] = [
  {
    id: 'geo-enricher',
    name: 'Geographic Enricher',
    type: 'enricher',
    description: 'Enrichissement géographique des adresses IP avec données de localisation',
    category: 'Geographic Intelligence',
    difficulty: 'beginner',
    
    defaultConfig: {
      enabled: true,
      schedule: 'run_after_analysis',
      timeout: 300,
      retryAttempts: 5,
      retryDelay: 15,
      resources: {
        cpuLimit: 2,
        memoryLimit: 1024,
        diskSpace: 100
      },
      triggers: {
        timeBased: false,
        eventBased: true,
        dataBased: false,
        runAfterCollector: false,
        runAfterAnalyzer: true
      },
      notifications: {
        onSuccess: false,
        onError: true,
        onWarning: true,
        recipients: []
      }
    },
    
    defaultParameters: {
      enricher: {
        enrichmentSources: ['MaxMind', 'IP2Location', 'GeoIP2'],
        enrichmentTypes: ['geolocation', 'isp', 'asn', 'timezone'],
        cacheEnabled: true,
        cacheExpiry: 86400, // 24h
        rateLimits: {
          'MaxMind': 1000,
          'IP2Location': 500,
          'GeoIP2': 2000
        }
      }
    },
    
    requirements: {
      dependencies: ['geoip2', 'requests'],
      permissions: ['read:ips', 'write:geo-data'],
      resources: {
        minCpu: 1,
        minMemory: 512,
        minDisk: 50
      }
    },
    
    author: 'AntStrike Team',
    version: '1.0.0',
    tags: ['geolocation', 'ip', 'enrichment', 'cache'],
    isOfficial: true
  },
  
  {
    id: 'reputation-enricher',
    name: 'Reputation Enricher',
    type: 'enricher',
    description: 'Enrichissement de réputation pour IPs, domaines et URLs',
    category: 'Reputation Intelligence',
    difficulty: 'intermediate',
    
    defaultConfig: {
      enabled: true,
      schedule: 'run_after_geo',
      timeout: 600,
      retryAttempts: 3,
      retryDelay: 30,
      resources: {
        cpuLimit: 3,
        memoryLimit: 2048,
        diskSpace: 200
      },
      triggers: {
        timeBased: false,
        eventBased: true,
        dataBased: false,
        runAfterCollector: false,
        runAfterAnalyzer: true
      },
      notifications: {
        onSuccess: false,
        onError: true,
        onWarning: true,
        recipients: []
      }
    },
    
    defaultParameters: {
      enricher: {
        enrichmentSources: ['VirusTotal', 'AbuseIPDB', 'Talos', 'Shodan'],
        enrichmentTypes: ['reputation', 'category', 'confidence', 'last-seen'],
        cacheEnabled: true,
        cacheExpiry: 43200, // 12h
        rateLimits: {
          'VirusTotal': 4,
          'AbuseIPDB': 1000,
          'Talos': 100,
          'Shodan': 1
        }
      }
    },
    
    requirements: {
      dependencies: ['virustotal-api', 'abuseipdb', 'shodan'],
      permissions: ['read:indicators', 'write:reputation'],
      resources: {
        minCpu: 2,
        minMemory: 1024,
        minDisk: 100
      }
    },
    
    author: 'AntStrike Team',
    version: '1.0.0',
    tags: ['reputation', 'virustotal', 'abuseipdb', 'shodan'],
    isOfficial: true
  }
];

// ============ TEMPLATES CORRELATORS ============

export const correlatorTemplates: BotTemplate[] = [
  {
    id: 'threat-correlator',
    name: 'Threat Correlation Bot',
    type: 'correlator',
    description: 'Corrélation automatique des menaces et détection de campagnes',
    category: 'Threat Correlation',
    difficulty: 'advanced',
    
    defaultConfig: {
      enabled: true,
      schedule: '0 */6 * * *', // Toutes les 6h
      timeout: 3600,
      retryAttempts: 2,
      retryDelay: 300,
      resources: {
        cpuLimit: 8,
        memoryLimit: 8192,
        diskSpace: 1000
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
    },
    
    defaultParameters: {
      correlator: {
        correlationRules: ['temporal', 'geographic', 'technical', 'behavioral'],
        timeWindow: 168, // 7 jours en heures
        similarityThreshold: 0.8,
        maxCorrelations: 1000
      }
    },
    
    requirements: {
      dependencies: ['networkx', 'scikit-learn', 'pandas'],
      permissions: ['read:threats', 'write:correlations'],
      resources: {
        minCpu: 6,
        minMemory: 4096,
        minDisk: 500
      }
    },
    
    author: 'AntStrike Team',
    version: '2.0.0',
    tags: ['correlation', 'campaigns', 'analysis', 'ml'],
    isOfficial: true
  }
];

// ============ TEMPLATES REPORTERS ============

export const reporterTemplates: BotTemplate[] = [
  {
    id: 'daily-threat-report',
    name: 'Daily Threat Report Generator',
    type: 'reporter',
    description: 'Génération automatique de rapports quotidiens de threat intelligence',
    category: 'Reporting',
    difficulty: 'intermediate',
    
    defaultConfig: {
      enabled: true,
      schedule: '0 8 * * *', // Tous les jours à 8h
      timeout: 1800,
      retryAttempts: 2,
      retryDelay: 300,
      resources: {
        cpuLimit: 4,
        memoryLimit: 4096,
        diskSpace: 500
      },
      triggers: {
        timeBased: true,
        eventBased: false,
        dataBased: false,
        runAfterCollector: false,
        runAfterAnalyzer: false
      },
      notifications: {
        onSuccess: true,
        onError: true,
        onWarning: true,
        recipients: ['analysts@company.com', 'ciso@company.com']
      }
    },
    
    defaultParameters: {
      reporter: {
        reportTypes: ['daily-summary', 'threat-landscape', 'ioc-report'],
        templateIds: ['daily-template', 'threat-template'],
        recipients: ['analysts@company.com', 'ciso@company.com'],
        schedule: '0 8 * * *',
        format: 'pdf'
      }
    },
    
    requirements: {
      dependencies: ['jinja2', 'weasyprint', 'matplotlib'],
      permissions: ['read:all-data', 'write:reports'],
      resources: {
        minCpu: 2,
        minMemory: 2048,
        minDisk: 200
      }
    },
    
    author: 'AntStrike Team',
    version: '1.0.0',
    tags: ['reporting', 'daily', 'pdf', 'automation'],
    isOfficial: true
  }
];

// ============ COLLECTION COMPLÈTE ============

export const allBotTemplates: BotTemplate[] = [
  ...collectorTemplates,
  ...analyzerTemplates,
  ...enricherTemplates,
  ...correlatorTemplates,
  ...reporterTemplates
];

// ============ FONCTIONS UTILITAIRES ============

export function getTemplatesByType(type: BotType): BotTemplate[] {
  return allBotTemplates.filter(template => template.type === type);
}

export function getTemplateById(id: string): BotTemplate | undefined {
  return allBotTemplates.find(template => template.id === id);
}

export function getTemplatesByCategory(category: string): BotTemplate[] {
  return allBotTemplates.filter(template => template.category === category);
}

export function getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): BotTemplate[] {
  return allBotTemplates.filter(template => template.difficulty === difficulty);
}

export function getOfficialTemplates(): BotTemplate[] {
  return allBotTemplates.filter(template => template.isOfficial);
}
