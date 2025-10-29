/**
 * 📚 Swagger/OpenAPI Configuration
 * Documentation interactive de l'API AntStrike CTI
 */

import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AntStrike CTI Backend API',
    version: '4.0.0',
    description: `
# 🛡️ AntStrike CTI Backend API

API Backend pour la plateforme AntStrike CTI (Cyber Threat Intelligence).

## 🚀 Fonctionnalités

- **Authentification JWT** : Register, Login, Refresh tokens
- **IOC Enrichment** : IP, Hash, Domain, URL avec APIs réelles (VirusTotal, AbuseIPDB, IPInfo)
- **Multi-Tenancy** : Isolation complète des données par tenant
- **Alerting** : Création, gestion et tracking des alertes de sécurité
- **Case Management** : Investigation structurée des incidents
- **Playbooks SOAR** : Automatisation des réponses aux menaces
- **Reporting** : Génération de rapports (HTML, JSON, CSV)
- **Analytics** : Métriques et statistiques SOC
- **Correlation** : Détection de campagnes d'attaque
- **Taranis AI** : 140 endpoints natifs intégrés

## 🔑 Authentification

La plupart des endpoints nécessitent un token JWT dans le header :

\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

Pour obtenir un token :
1. Créer un compte : **POST /api/auth/register**
2. Se connecter : **POST /api/auth/login**
3. Utiliser l'accessToken dans tous les appels

## 📊 APIs d'Enrichissement

- **VirusTotal** : Hash, URL, Domain (500 req/jour gratuit)
- **AbuseIPDB** : IP Reputation (1,000 req/jour gratuit)
- **IPInfo** : Geolocation (50,000 req/mois gratuit)

## ⚡ Performance

- Cache 24h sur enrichissement IOC
- Premier appel : ~800-1200ms
- Cache hit : ~75ms (99% plus rapide)

## 🎯 Score MVP : 89%

193 endpoints disponibles (53 custom + 140 Taranis)
    `,
    contact: {
      name: 'AntStrike CTI Support',
      email: 'support@antstrike-cti.com'
    },
    license: {
      name: 'Propriétaire',
      url: 'https://antstrike-cti.com/license'
    }
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Serveur de développement'
    },
    {
      url: 'https://api-staging.antstrike-cti.com',
      description: 'Serveur de staging'
    },
    {
      url: 'https://api.antstrike-cti.com',
      description: 'Serveur de production'
    }
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check et status du serveur'
    },
    {
      name: 'Authentication',
      description: 'Authentification JWT (Register, Login, Refresh)'
    },
    {
      name: 'IOC Enrichment',
      description: 'Enrichissement d\'Indicators of Compromise (IP, Hash, Domain, URL)'
    },
    {
      name: 'STIX/TAXII',
      description: 'Support STIX 2.1 et serveur TAXII 2.1 pour partage CTI'
    },
    {
      name: 'MISP',
      description: 'Intégration bi-directionnelle avec MISP (Malware Information Sharing Platform)'
    },
    {
      name: 'CVE',
      description: 'Enrichissement CVE avec NVD (NIST) et CIRCL (Luxembourg)'
    },
    {
      name: 'MITRE ATT&CK',
      description: 'Mapping des menaces avec le framework MITRE ATT&CK (~600 techniques, 14 tactics)'
    },
    {
      name: 'Analysis & Correlation',
      description: 'Analyse complète des menaces (MITRE ATT&CK + Cyber Kill Chain + Diamond Model)'
    },
    {
      name: 'OSINT Feeds',
      description: 'Feeds OSINT automatisés (Abuse.ch, PhishTank, Blocklist.de, etc.) - 8 sources gratuites'
    },
    {
      name: 'Threat Feeds',
      description: 'Threat Intelligence Feeds (AlienVault OTX, MalwareBazaar, ThreatFox, URLhaus)'
    },
    {
      name: 'Dark Web',
      description: 'Surveillance Dark Web (Pastebin, GitHub, Tor, Telegram) - Détection leaks et mentions'
    },
    {
      name: 'Honeypots',
      description: 'Intégration honeypots (Cowrie, Dionaea, T-Pot) - Collecte IOCs propriétaires'
    },
    {
      name: 'Alerts',
      description: 'Gestion des alertes de sécurité'
    },
    {
      name: 'Cases',
      description: 'Case Management - Investigation d\'incidents'
    },
    {
      name: 'Playbooks',
      description: 'Playbooks SOAR - Automatisation de réponse'
    },
    {
      name: 'Reports',
      description: 'Génération et gestion de rapports'
    },
    {
      name: 'Correlation',
      description: 'Détection de corrélations et campagnes'
    },
    {
      name: 'Metrics',
      description: 'Métriques et analytics SOC'
    },
    {
      name: 'Taranis',
      description: 'Endpoints Taranis AI natifs (OSINT, Assessment, Analyze, Publish)'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtenu via /api/auth/login ou /api/auth/register'
      }
    },
    schemas: {
      // Auth Schemas
      RegisterRequest: {
        type: 'object',
        required: ['tenantName', 'email', 'name', 'password'],
        properties: {
          tenantName: { type: 'string', example: 'Acme Corp', description: 'Nom de l\'organisation' },
          email: { type: 'string', format: 'email', example: 'admin@acme.com' },
          name: { type: 'string', example: 'John Doe' },
          password: { type: 'string', format: 'password', minLength: 8, example: 'SecurePass123!' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@acme.com' },
          password: { type: 'string', format: 'password', example: 'SecurePass123!' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', description: 'JWT access token (8h)' },
          refreshToken: { type: 'string', description: 'JWT refresh token (7 jours)' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'ANALYST', 'VIEWER'] },
              tenant: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  plan: { type: 'string', enum: ['TRIAL', 'STARTER', 'BUSINESS', 'ENTERPRISE'] },
                  status: { type: 'string', enum: ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] }
                }
              }
            }
          }
        }
      },
      
      // IOC Schemas
      IOCEnrichRequest: {
        type: 'object',
        required: ['iocValue', 'iocType', 'tenantId'],
        properties: {
          iocValue: { type: 'string', example: '8.8.8.8', description: 'Valeur de l\'IOC' },
          iocType: { type: 'string', enum: ['IP', 'DOMAIN', 'URL', 'FILE_HASH', 'EMAIL', 'CVE'], example: 'IP' },
          tenantId: { type: 'string', format: 'uuid' },
          source: { type: 'string', example: 'Manual Investigation', description: 'Source optionnelle' }
        }
      },
      IOCEnrichResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              tenantId: { type: 'string', format: 'uuid' },
              iocValue: { type: 'string', example: '8.8.8.8' },
              iocType: { type: 'string', example: 'IP' },
              enrichmentData: {
                type: 'object',
                description: 'Données d\'enrichissement (varie selon le type)',
                example: {
                  ip: '8.8.8.8',
                  country: 'US',
                  city: 'Mountain View',
                  asn: 'AS15169',
                  isp: 'Google LLC',
                  reputation: 'safe',
                  threatScore: 0,
                  sources: ['AbuseIPDB', 'IPInfo']
                }
              },
              lastEnriched: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      
      // Alert Schemas
      CreateAlertRequest: {
        type: 'object',
        required: ['storyId', 'severity', 'priority', 'category', 'title'],
        properties: {
          storyId: { type: 'string', example: 'story-123', description: 'ID de la story Taranis' },
          severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'], example: 'HIGH' },
          priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'], example: 'P1', description: 'P0=Critical, P1=High, P2=Medium, P3=Low' },
          category: { type: 'string', enum: ['VULNERABILITY', 'MALWARE', 'RANSOMWARE', 'PHISHING', 'APT', 'DATA_BREACH', 'DENIAL_OF_SERVICE', 'INSIDER_THREAT', 'SUPPLY_CHAIN', 'OTHER'], example: 'MALWARE' },
          title: { type: 'string', example: 'Suspicious IP Activity Detected' },
          summary: { type: 'string', example: 'Multiple failed login attempts from unknown IP' },
          iocs: { type: 'array', items: { type: 'string' }, example: ['8.8.8.8', '192.168.1.100'] },
          affectedAssets: { type: 'array', items: { type: 'string' } },
          recommendedActions: { type: 'array', items: { type: 'string' } }
        }
      },
      
      // Error Schema
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              status: { type: 'integer', example: 400 },
              message: { type: 'string', example: 'Missing required fields' },
              stack: { type: 'string', description: 'Stack trace (dev only)' }
            }
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Token manquant ou invalide',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: {
                status: 401,
                message: 'No token provided'
              }
            }
          }
        }
      },
      NotFoundError: {
        description: 'Ressource non trouvée',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: {
                status: 404,
                message: 'Resource not found'
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: [
    __dirname + '/../routes/*.ts',
    __dirname + '/../controllers/*.ts',
    __dirname + '/../server.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);

