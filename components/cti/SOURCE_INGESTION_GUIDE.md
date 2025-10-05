# Guide d'Ingestion de Sources Personnalisées - Plateforme CTI

## 🎯 Vue d'ensemble

Le système d'ingestion de sources personnalisées permet aux utilisateurs d'ajouter leurs propres sources de données CTI à la plateforme Taranis. Cette fonctionnalité transforme votre plateforme en un véritable hub centralisé pour tous vos besoins de threat intelligence.

## 🚀 Fonctionnalités Principales

### 1. **Upload de Fichiers** 📁
- **Formats supportés** : CSV, JSON, XML, TXT
- **Drag & Drop** : Interface intuitive pour l'upload
- **Parsing automatique** : Analyse et prévisualisation des données
- **Validation** : Vérification de la structure des données

### 2. **Configuration Avancée** ⚙️
- **Templates prédéfinis** : RSS, API REST, Twitter, Email, Webhook, Database
- **Authentification** : Basic Auth, Bearer Token, API Key, OAuth 2.0
- **Paramètres personnalisés** : Configuration flexible pour chaque source
- **Collecte automatique** : Programmation des collectes

### 3. **Test et Validation** 🧪
- **Tests de connectivité** : Vérification en temps réel
- **Métriques de performance** : Temps de réponse, taux de succès
- **Diagnostics** : Identification des problèmes de configuration
- **Recommandations** : Suggestions d'optimisation

### 4. **Gestion des Sources** 📊
- **Interface unifiée** : Gestion de toutes les sources
- **Filtres et recherche** : Recherche par type, statut, nom
- **Édition en ligne** : Modification des paramètres
- **Monitoring** : Surveillance du statut des sources

## 🔧 Types de Sources Supportées

### **RSS Feeds** 📡
```typescript
{
  type: 'RSS',
  url: 'https://example.com/feed.xml',
  parameters: {
    parseContent: true,
    extractLinks: true,
    language: 'fr'
  }
}
```

### **APIs REST** 🌐
```typescript
{
  type: 'API',
  url: 'https://api.threatintel.com/v1/indicators',
  parameters: {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer token',
      'Content-Type': 'application/json'
    }
  }
}
```

### **Twitter/X** 🐦
```typescript
{
  type: 'TWITTER',
  parameters: {
    apiVersion: 'v2',
    keywords: ['#threatintel', '#malware'],
    includeRetweets: false,
    language: 'fr'
  }
}
```

### **Email** 📧
```typescript
{
  type: 'EMAIL',
  parameters: {
    protocol: 'imap',
    host: 'imap.example.com',
    port: 993,
    ssl: true,
    username: 'user@example.com',
    password: 'password'
  }
}
```

### **Webhooks** 🔗
```typescript
{
  type: 'WEB',
  parameters: {
    method: 'POST',
    contentType: 'application/json',
    validateSignature: true,
    secretKey: 'webhook-secret'
  }
}
```

### **Bases de Données** 🗄️
```typescript
{
  type: 'DATABASE',
  parameters: {
    driver: 'postgresql',
    host: 'db.example.com',
    port: 5432,
    database: 'threatintel',
    ssl: true,
    poolSize: 5
  }
}
```

## 📋 Processus d'Ingestion

### **Étape 1 : Upload de Fichiers**
1. Glissez-déposez vos fichiers ou cliquez pour sélectionner
2. Le système analyse automatiquement le format
3. Prévisualisation des données parsées
4. Configuration des paramètres de collecte

### **Étape 2 : Configuration**
1. Sélection d'un template de source
2. Configuration des paramètres d'authentification
3. Définition des paramètres de collecte
4. Ajout de paramètres personnalisés

### **Étape 3 : Test et Validation**
1. Test de connectivité en temps réel
2. Validation des paramètres
3. Vérification des permissions
4. Test de collecte de données

### **Étape 4 : Activation**
1. Création de la source dans Taranis
2. Activation de la collecte automatique
3. Monitoring des performances
4. Gestion et maintenance

## 🎛️ Interface Utilisateur

### **Onglet Upload de Fichiers**
- Zone de drag & drop
- Liste des fichiers uploadés
- Aperçu des données parsées
- Configuration de base

### **Onglet Configuration**
- Sélection de templates
- Configuration d'authentification
- Paramètres de collecte
- Paramètres personnalisés

### **Onglet Test & Validation**
- Tests de connectivité
- Métriques de performance
- Résultats détaillés
- Recommandations

### **Onglet Gestion**
- Liste des sources
- Filtres et recherche
- Édition en ligne
- Actions de maintenance

## 📊 Métriques et Monitoring

### **Statistiques Globales**
- Nombre total de sources
- Sources actives/inactives
- Taux de succès
- Temps de réponse moyen

### **Métriques par Source**
- Statut de connectivité
- Temps de dernière collecte
- Nombre d'éléments collectés
- Erreurs récentes

### **Alertes et Notifications**
- Sources en échec
- Temps de réponse élevés
- Nouvelles données disponibles
- Recommandations d'optimisation

## 🔒 Sécurité et Authentification

### **Types d'Authentification Supportés**
- **Basic Auth** : Nom d'utilisateur/mot de passe
- **Bearer Token** : Token d'accès
- **API Key** : Clé API avec header personnalisé
- **OAuth 2.0** : Authentification OAuth complète

### **Sécurité des Données**
- Chiffrement des credentials
- Validation des signatures webhook
- Timeout des connexions
- Limitation des tentatives

## 🚀 Utilisation Avancée

### **Collecte Programmé**
```typescript
// Collecte toutes les heures
{
  interval: 3600, // secondes
  retryAttempts: 3,
  timeout: 30
}
```

### **Filtres de Collecte**
```typescript
{
  filters: [
    'category:malware',
    'severity:high',
    'language:fr'
  ]
}
```

### **Transformation de Données**
```typescript
{
  transformations: {
    mapping: {
      'external_id': 'taranis_id',
      'external_title': 'title'
    },
    filters: ['active_only'],
    enrichments: ['geo_location', 'reputation']
  }
}
```

## 🔧 Maintenance et Dépannage

### **Problèmes Courants**
1. **Erreur de connexion** : Vérifier URL et credentials
2. **Timeout** : Augmenter le timeout ou vérifier la connectivité
3. **Parsing échoué** : Vérifier le format des données
4. **Authentification échouée** : Vérifier les tokens et permissions

### **Outils de Diagnostic**
- Tests de connectivité en temps réel
- Logs détaillés des erreurs
- Métriques de performance
- Recommandations automatiques

## 📈 Optimisation des Performances

### **Bonnes Pratiques**
1. **Utiliser des pools de connexions** pour les bases de données
2. **Configurer des timeouts appropriés** selon la source
3. **Implémenter des retry policies** robustes
4. **Monitorer les métriques** de performance

### **Recommandations**
- Collecte par batch pour les grandes sources
- Utilisation de webhooks pour les données temps réel
- Mise en cache des données fréquemment accédées
- Compression des données volumineuses

## 🎯 Cas d'Usage

### **Organisations de Sécurité**
- Intégration de feeds de threat intelligence commerciaux
- Collecte de données depuis des APIs spécialisées
- Import de données depuis des SIEM existants

### **Équipes SOC**
- Monitoring des réseaux sociaux pour les menaces
- Collecte de logs depuis diverses sources
- Intégration avec des outils de sécurité

### **Chercheurs en Sécurité**
- Collecte de données de recherche
- Import de datasets publics
- Partage de découvertes avec la communauté

---

## 🎉 Conclusion

Le système d'ingestion de sources personnalisées transforme votre plateforme CTI en un véritable hub centralisé, capable d'intégrer n'importe quelle source de données de threat intelligence. Avec ses interfaces intuitives, ses outils de validation avancés et ses fonctionnalités de monitoring, vous disposez de tous les outils nécessaires pour construire un écosystème de threat intelligence complet et performant.

**Prêt à commencer ?** Naviguez vers l'onglet "Sources" de votre plateforme CTI et commencez à ingérer vos premières sources personnalisées !
