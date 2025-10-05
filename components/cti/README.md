# Plateforme CTI Enterprise - AntStrike CTI

## 🚀 Vue d'ensemble

Cette plateforme CTI (Cyber Threat Intelligence) exploite **TOUT** le potentiel de Taranis AI pour fournir une solution enterprise complète de threat intelligence.

## 🏗️ Architecture

### Modules Principaux

1. **CTIDashboard** - Dashboard principal unifié
2. **ThreatIntelligenceMap** - Visualisation géospatiale des menaces
3. **StoriesBuilder** - Créateur d'histoires de menaces interactif
4. **OSINTCollector** - Collecteur OSINT avancé avec visualisations temps réel
5. **BotsDashboard** - Gestion avancée des bots IA Taranis
6. **InvestigationFlow** - Workflow d'investigation CTI structuré
7. **CorrelationEngine** - Moteur de corrélation et d'analyse
8. **IOCsManager** - Gestionnaire d'Indicators of Compromise
9. **CampaignsTracker** - Suivi des campagnes de menaces
10. **ReportsBuilder** - Générateur de rapports CTI

## 🎯 Fonctionnalités

### Investigation & Analyse
- **Workflow d'investigation** structuré avec étapes et assignations
- **Corrélation automatique** des éléments de CTI
- **Analyse comportementale** et attribution des menaces
- **Visualisation de réseau** des corrélations

### Intelligence & IOCs
- **Gestion complète des IOCs** (IP, Domain, URL, Hash, Email, File)
- **Suivi des campagnes** de menaces avec métriques détaillées
- **Attribution des threat actors** avec niveaux de confiance
- **Analyse géographique** et sectorielle

### OSINT & Collection
- **Collecte automatisée** depuis 100+ sources OSINT
- **Visualisations temps réel** des performances de collecte
- **Gestion des sources** avec monitoring et contrôle
- **Métriques de qualité** et taux de succès

### IA & Bots
- **Monitoring des bots IA** Taranis en temps réel
- **Gestion des performances** et métriques de traitement
- **Logs détaillés** et alertes de santé
- **Configuration et contrôle** des bots

### Rapports & Documentation
- **Générateur de rapports** interactif avec templates
- **Export multi-formats** (PDF, Word, JSON)
- **Collaboration** et workflow d'approbation
- **Historique des versions** et traçabilité

## 🔧 Utilisation

### Installation
```bash
# Les composants sont déjà intégrés dans le projet
# Aucune installation supplémentaire requise
```

### Intégration
```tsx
import { CTIDashboard } from './components/cti/CTIDashboard';

// Utilisation dans votre application
<CTIDashboard />
```

### Configuration
La plateforme utilise automatiquement le service Taranis unifié :
- Authentification automatique
- Gestion des erreurs robuste
- Cache intelligent
- Retry automatique

## 📊 Métriques & KPIs

### Dashboard Principal
- **Total Threats** : Nombre total de menaces détectées
- **Active Campaigns** : Campagnes actives en cours
- **IOCs Collected** : Indicateurs de compromission collectés
- **Stories Created** : Histoires de menaces créées
- **Bots Active** : Bots IA actifs
- **Sources Monitored** : Sources OSINT surveillées
- **Critical Alerts** : Alertes critiques
- **Avg Response Time** : Temps de réponse moyen

### Métriques par Module
Chaque module fournit ses propres métriques spécialisées :
- **OSINT** : Taux de collecte, qualité des données, performance des sources
- **Bots** : Throughput, taux de succès, utilisation CPU/Mémoire
- **IOCs** : Types, sévérité, taux de vérification
- **Campaigns** : Durée, victimes, attribution, TTPs

## 🔒 Sécurité

- **Authentification JWT** avec refresh automatique
- **Gestion des permissions** granulaires
- **Audit trail** complet des actions
- **Chiffrement** des données sensibles
- **Isolation** des environnements

## 🚀 Évolutions Futures

### Phase 2
- [ ] Intégration avec d'autres plateformes CTI (MISP, OpenCTI)
- [ ] API REST complète pour intégrations externes
- [ ] Machine Learning avancé pour la détection de patterns
- [ ] Mobile app pour alertes et notifications

### Phase 3
- [ ] Analyse prédictive des menaces
- [ ] Automatisation des réponses aux incidents
- [ ] Intégration avec les SIEM/SOAR
- [ ] Marketplace de sources OSINT

## 🤝 Contribution

Cette plateforme est conçue pour être extensible et modulaire. Chaque composant peut être utilisé indépendamment ou intégré dans d'autres applications.

## 📞 Support

Pour toute question ou support technique, consultez la documentation Taranis AI ou contactez l'équipe de développement.
