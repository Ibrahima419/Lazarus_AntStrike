# Architecture du Système d'Ingestion de Sources CTI

## 🏗️ Vue d'ensemble de l'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLATEFORME CTI ENTERPRISE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   FRONTEND      │    │   BACKEND       │    │  DATABASE   │ │
│  │   (React)       │    │   (Taranis)     │    │(PostgreSQL) │ │
│  │                 │    │                 │    │             │ │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────┐ │ │
│  │ │CTIDashboard │ │◄──►│ │API Endpoints│ │◄──►│ │Sources  │ │ │
│  │ │             │ │    │ │             │ │    │ │NewsItems│ │ │
│  │ │┌───────────┐│ │    │ │┌───────────┐│ │    │ │Reports  │ │ │
│  │ ││SourceIng. ││ │    │ ││Collectors ││ │    │ │Bots     │ │ │
│  │ ││Manager    ││ │    │ ││           ││ │    │ │         │ │ │
│  │ │└───────────┘│ │    │ │└───────────┘│ │    │ └─────────┘ │ │
│  │ └─────────────┘ │    │ └─────────────┘ │    │             │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │
                    ┌─────────────────┐
                    │  SOURCES EXTERNES │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │RSS Feeds    │ │
                    │ │APIs REST    │ │
                    │ │Databases    │ │
                    │ │Webhooks     │ │
                    │ │Files (CSV)  │ │
                    │ │Social Media │ │
                    │ │Email        │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

## 🔄 Flux de Données

### 1. **Ingestion de Sources**
```
Utilisateur → Interface → Configuration → Taranis API → Base de Données
     │              │           │              │              │
     ▼              ▼           ▼              ▼              ▼
  Upload de      Validation  Templates    Endpoints      Storage
  fichiers       des données  prédéfinis   REST         des configs
```

### 2. **Collecte Automatique**
```
Planificateur → Collecteur → Source Externe → Parser → Enrichisseur → Stockage
     │              │             │            │          │            │
     ▼              ▼             ▼            ▼          ▼            ▼
  Cron Jobs     HTTP/DB      APIs/RSS/      Validation  Corrélation  NewsItems
                Clients      Webhooks       & Parsing   & Enrichment & Reports
```

### 3. **Test et Validation**
```
Interface → Testeur → Validateur → Connecteur → Source → Résultat
     │         │          │           │          │         │
     ▼         ▼          ▼           ▼          ▼         ▼
  Bouton    Orchestr.  Auth Check  HTTP Test  External   Success/
   Test     Tests      & Config    & Parse    Source     Error
```

## 🧩 Composants Principaux

### **Frontend (React/TypeScript)**

#### `SourceIngestionManager`
- **Rôle** : Orchestrateur principal
- **Responsabilités** :
  - Coordination des sous-composants
  - Gestion de l'état global
  - Communication avec l'API Taranis
  - Affichage des statistiques

#### `SourceUploader`
- **Rôle** : Gestionnaire d'upload de fichiers
- **Responsabilités** :
  - Drag & drop de fichiers
  - Parsing automatique (CSV, JSON, XML)
  - Prévisualisation des données
  - Validation du format

#### `SourceConfigurator`
- **Rôle** : Configurationur de sources personnalisées
- **Responsabilités** :
  - Templates de sources prédéfinies
  - Configuration d'authentification
  - Paramètres de collecte
  - Paramètres personnalisés

#### `SourceTester`
- **Rôle** : Testeur et validateur de sources
- **Responsabilités** :
  - Tests de connectivité
  - Validation des paramètres
  - Métriques de performance
  - Diagnostics d'erreurs

#### `SourceManager`
- **Rôle** : Gestionnaire des sources existantes
- **Responsabilités** :
  - Liste et filtrage des sources
  - Édition en ligne
  - Activation/désactivation
  - Suppression avec confirmation

### **Backend (Taranis API)**

#### Endpoints Principaux
```
POST   /config/osint-sources          # Créer une source
GET    /config/osint-sources          # Lister les sources
PUT    /config/osint-sources/{id}     # Modifier une source
DELETE /config/osint-sources/{id}     # Supprimer une source
POST   /config/osint-sources/{id}/collect  # Tester une source
GET    /assess/news-items             # Récupérer les données collectées
```

#### Types de Sources Supportées
- **RSS** : Flux RSS/Atom
- **API** : APIs REST avec authentification
- **DATABASE** : Bases de données (PostgreSQL, MySQL, etc.)
- **EMAIL** : IMAP/POP3
- **WEB** : Webhooks et scraping
- **TWITTER** : API Twitter/X
- **MANUAL** : Upload de fichiers

### **Base de Données (PostgreSQL)**

#### Tables Principales
- **osint_sources** : Configuration des sources
- **news_items** : Données collectées
- **source_groups** : Groupement des sources
- **collection_logs** : Historique des collectes
- **source_metrics** : Métriques de performance

## 🔧 Configuration et Paramètres

### **Structure d'une Source**
```typescript
interface OSINTSourceConfig {
  id: string;                    // Identifiant unique
  name: string;                  // Nom de la source
  type: SourceType;              // Type de source
  url?: string;                  // URL/Endpoint
  enabled: boolean;              // Statut actif/inactif
  groupId?: string;              // Groupe d'appartenance
  parameters?: {                 // Paramètres spécifiques
    auth?: AuthConfig;           // Configuration d'auth
    collection?: CollectionConfig; // Configuration de collecte
    custom?: Record<string, any>;  // Paramètres personnalisés
  };
}
```

### **Configuration d'Authentification**
```typescript
interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  clientId?: string;
  clientSecret?: string;
}
```

### **Configuration de Collecte**
```typescript
interface CollectionConfig {
  enabled: boolean;
  interval: number;              // Intervalle en secondes
  retryAttempts: number;         // Nombre de tentatives
  timeout: number;               // Timeout en secondes
  batchSize: number;             // Taille des lots
  filters?: string[];            // Filtres de collecte
}
```

## 📊 Monitoring et Métriques

### **Métriques Collectées**
- **Performance** : Temps de réponse, débit
- **Fiabilité** : Taux de succès, erreurs
- **Volume** : Nombre d'éléments collectés
- **Qualité** : Validation des données

### **Alertes et Notifications**
- Sources en échec
- Temps de réponse élevés
- Nouvelles données disponibles
- Recommandations d'optimisation

## 🔒 Sécurité

### **Authentification et Autorisation**
- Chiffrement des credentials
- Validation des signatures webhook
- Timeout des connexions
- Limitation des tentatives

### **Protection des Données**
- Validation des entrées utilisateur
- Sanitisation des données
- Audit des accès
- Sauvegarde des configurations

## 🚀 Déploiement et Maintenance

### **Environnements**
- **Développement** : Tests et développement
- **Staging** : Tests d'intégration
- **Production** : Environnement de production

### **Monitoring**
- Logs détaillés
- Métriques en temps réel
- Alertes automatiques
- Tableaux de bord

### **Maintenance**
- Mise à jour des sources
- Optimisation des performances
- Résolution des problèmes
- Sauvegarde des données

---

Cette architecture modulaire et extensible permet une intégration facile de nouvelles sources de données tout en maintenant une interface utilisateur cohérente et des performances optimales.
