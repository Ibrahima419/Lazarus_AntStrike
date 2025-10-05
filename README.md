# AntStrike CTI Platform

Une plateforme complète de Cyber Threat Intelligence avec moteur Taranis AI pour la collecte OSINT automatisée et l'enrichissement par intelligence artificielle.

![AntStrike Logo](./AntStrike.svg)

## 🚀 Fonctionnalités

- **Dashboard Exécutif** - Métriques business et ROI de la threat intelligence
- **Gestion des Menaces** - Suivi avancé avec filtrage et corrélation
- **Incidents** - Workflow de réponse avec SLA tracking
- **Intelligence** - Intégration MISP/TAXII/STIX et gestion des IOCs
- **Entités** - Acteurs de menaces, malware et infrastructure
- **Analyse Avancée** - Corrélation automatique et scoring IA
- **Taranis AI** - Moteur OSINT avec bots d'enrichissement
- **Import/Export** - Intégration complète tous formats
- **Reports** - Business intelligence avec justification ROI
- **Settings** - Administration complète de la plateforme

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **UI/UX**: Tailwind CSS 3.3 + Radix UI + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Graphiques**: Recharts
- **Icons**: Lucide React
- **Authentification**: Supabase Auth avec MFA
- **CTI Engine**: Taranis AI pour OSINT et enrichissement

## 📋 Prérequis

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- Supabase CLI (pour le développement local)

## 🚀 Installation et Test Local

### 1. Cloner et installer les dépendances

\`\`\`bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
\`\`\`

### 2. Configuration Supabase (Optionnel pour test)

\`\`\`bash
# Installer Supabase CLI
npm install -g supabase

# Démarrer Supabase local
npm run supabase:start

# Vérifier le statut
npm run supabase:status
\`\`\`

### 3. Configuration des variables d'environnement

Éditer le fichier \`.env\` avec vos configurations :

\`\`\`env
# Pour test local avec données mockées
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG=true

# Pour intégration Supabase réelle
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. Lancer en développement

\`\`\`bash
# Démarrer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:3000
\`\`\`

## 🌐 Déploiement Production

### Option 1: Déploiement Vercel (Recommandé)

\`\`\`bash
# Build de production
npm run build

# Déployer sur Vercel
npx vercel --prod

# Ou connecter votre repo GitHub à Vercel
\`\`\`

### Option 2: Déploiement Netlify

\`\`\`bash
# Build de production
npm run build

# Déployer sur Netlify
npx netlify deploy --prod --dir=dist
\`\`\`

### Option 3: Déploiement Docker

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
\`\`\`

### Option 4: Supabase Edge Functions

\`\`\`bash
# Déployer les fonctions Supabase
npm run deploy

# Ou manuellement
supabase functions deploy make-server-ef314a4f
\`\`\}

## 🔧 Configuration Avancée

### Variables d'environnement de production

\`\`\`env
# Application
VITE_APP_NAME="AntStrike CTI Platform"
VITE_APP_ENVIRONMENT="production"
VITE_ENABLE_MOCK_DATA=false

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Services externes (optionnel)
VITE_MISP_API_KEY=your_misp_key
VITE_VIRUSTOTAL_API_KEY=your_vt_key
VITE_SLACK_WEBHOOK_URL=your_slack_webhook

# Sécurité
VITE_ENABLE_CSP=true
VITE_ENABLE_HSTS=true
\`\`\`

### Configuration NGINX (si nécessaire)

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/antstrike-cti/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass https://your-project.supabase.co/functions/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
\`\`\`

## 📊 Architecture et Performance

### Métriques de Performance

- **Bundle Size**: ~2.5MB (gzipped ~600KB)
- **First Load**: <3s sur 3G
- **Lighthouse Score**: 95+ (Performance/Accessibility/SEO)
- **Core Web Vitals**: Optimisé pour Google

### Optimisations incluses

- **Code Splitting** automatique par route
- **Lazy Loading** des composants lourds
- **Tree Shaking** Tailwind CSS
- **Image Optimization** via Unsplash
- **Service Worker** (optionnel)

## 🔒 Sécurité

### Mesures de sécurité implémentées

- **Content Security Policy** (CSP)
- **HTTPS Strict Transport Security** (HSTS)
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Authentification MFA** via Supabase
- **Session Management** sécurisé
- **Rate Limiting** sur les APIs

### Configuration SSL/TLS

- TLS 1.3 minimum
- Certificats auto-renouvelés (Let's Encrypt)
- HSTS avec preload
- Certificate Transparency monitoring

## 📈 Monitoring et Observabilité

### Métriques disponibles

- **Performance**: Core Web Vitals, load times
- **Business**: ROI CTI, efficiency improvements
- **System**: Resource usage, error rates
- **Security**: Failed logins, anomalies

### Intégrations monitoring

- **Sentry** pour error tracking
- **Vercel Analytics** pour performance
- **Supabase Metrics** pour backend
- **Custom Dashboards** pour métier

## 🧪 Tests et Qualité

\`\`\`bash
# Linter
npm run lint

# Build de test
npm run build

# Preview de production
npm run preview
\`\`\`

### Tests recommandés

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright ou Cypress
- **Performance**: Lighthouse CI
- **Security**: npm audit, Snyk

## 🎯 Roadmap

### Version 2.2 (Q2 2024)
- [ ] Authentification SSO (SAML/OIDC)
- [ ] API GraphQL avancée
- [ ] Notifications temps réel
- [ ] Mobile app (React Native)

### Version 2.3 (Q3 2024)
- [ ] Machine Learning avancé
- [ ] Threat Hunting proactif
- [ ] Marketplace de connecteurs
- [ ] Multi-tenant architecture

## 📞 Support

- **Documentation**: [docs.antstrike.io](https://docs.antstrike.io)
- **Community**: [Discord Server](https://discord.gg/antstrike)
- **Issues**: [GitHub Issues](https://github.com/your-org/antstrike-cti/issues)
- **Enterprise**: contact@antstrike.io

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**AntStrike CTI Platform v2.1.4** - Transforming Threat Intelligence with AI

*Développé avec ❤️ par l'équipe AntStrike*

## 🤖 Intégration Taranis AI

AntStrike CTI intègre le moteur **Taranis AI** pour la collecte OSINT automatisée et l'enrichissement par intelligence artificielle.

### Fonctionnalités Taranis AI intégrées

* **Collecte OSINT Avancée** : Parcours automatique de multiples sources de données pour collecter des articles d'actualité non structurés
* **Analyse IA Améliorée** : Utilise l'Intelligence Artificielle et le Traitement du Langage Naturel pour enrichir automatiquement le contenu collecté
* **Workflow Analyste** : Processus optimisé permettant aux analystes de convertir facilement les actualités non structurées en éléments de rapport structurés
* **Sortie Multi-Format** : Génère une variété de produits finaux, incluant des rapports structurés et des fichiers PDF
* **Publication Seamless** : Facilite la publication sans effort des produits d'intelligence finalisés
* **Intelligence Collaborative** : Support du partage au niveau Story entre instances Taranis AI via MISP

### Architecture Taranis AI

| Type       | Service   | Description                           |
| :--------- | :-------- | :------------------------------------ |
| Frontend   | React     | Interface utilisateur moderne avec TypeScript |
| Backend    | Supabase  | API REST et base de données PostgreSQL |
| Worker     | Taranis   | Collecteurs, bots et présentateurs IA |
| Database   | PostgreSQL| Base de données principale avec support SQLite |

### Exigences Matérielles

Pour utiliser toutes les fonctionnalités NLP : **16 GB RAM, 4 CPU cores et 50GB de stockage**

Sans NLP : **2 GB RAM, 2 CPU cores et 20 GB de stockage**

## 📚 Documentation Taranis AI

- **Documentation Officielle** : [taranis.ai/docs](https://taranis.ai/docs/)
- **Guide de Déploiement** : [Deployment Guide](https://taranis.ai/docs/getting-started/deployment/)
- **OpenAPI Spec** : Spécification REST API disponible dans l'installation

## 🏛️ À Propos de Taranis AI

Ce projet s'inspire de [Taranis3](https://github.com/NCSC-NL/taranis3) et [Taranis-NG](https://github.com/SK-CERT/Taranis-NG/).
Il est publié sous les termes de la [Licence Publique de l'Union Européenne](https://eupl.eu/1.2/en/).

![Co-financed by the Connecting Europe Facility of the European Union](https://ec.europa.eu/inea/sites/default/files/ceflogos/en_horizontal_cef_logo_2.png)
