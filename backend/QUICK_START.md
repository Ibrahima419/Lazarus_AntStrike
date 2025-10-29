# 🚀 BACKEND - DÉMARRAGE RAPIDE (5 MINUTES)

## ✅ Option 1 : Docker (RECOMMANDÉ - Le plus rapide)

```bash
# 1. Lancer PostgreSQL + Redis via Docker Compose
cd backend
docker-compose up -d

# ✅ PostgreSQL prêt sur localhost:5432
# ✅ Redis prêt sur localhost:6379

# 2. Installer dépendances
npm install

# 3. Créer .env
cp ENV_EXAMPLE.md .env
# Garder DATABASE_URL par défaut (déjà configuré pour Docker)

# 4. Générer Prisma Client + Migrations
npm run prisma:generate
npm run prisma:migrate

# 5. Lancer backend
npm run dev

# ✅ Backend sur http://localhost:4000
```

---

## ✅ Option 2 : PostgreSQL Local (Windows)

### A. Installer PostgreSQL

**Via Chocolatey (Recommandé)**
```powershell
choco install postgresql
```

**Ou télécharger :**
https://www.postgresql.org/download/windows/

### B. Créer Database

```powershell
# Se connecter à PostgreSQL
psql -U postgres

# Dans psql:
CREATE DATABASE antstrike_cti;
\l
\q
```

### C. Setup Backend

```bash
cd backend

# 1. Installer dépendances
npm install

# 2. Créer .env
New-Item -Path .env -ItemType File

# 3. Éditer .env (notepad .env)
# Remplacer password par votre password PostgreSQL :
DATABASE_URL="postgresql://postgres:VOTRE_PASSWORD@localhost:5432/antstrike_cti?schema=public"

# 4. Générer Prisma Client
npm run prisma:generate

# 5. Migrations
npm run prisma:migrate

# 6. Lancer dev
npm run dev
```

---

## 🧪 Tester l'API

```bash
# Health Check
curl http://localhost:4000/api/health

# Devrait retourner:
# {"status":"ok","timestamp":"...","services":{"database":"connected"}}
```

---

## 📊 Prisma Studio (Explorer Database)

```bash
npm run prisma:studio

# → http://localhost:5555
# Interface graphique pour voir vos tables
```

---

## 🔧 Commandes Utiles

```bash
# Dev avec auto-reload
npm run dev

# Build production
npm run build

# Lancer production
npm start

# Regénérer Prisma Client (après modif schema)
npm run prisma:generate

# Nouvelle migration
npm run prisma:migrate

# Reset database (⚠️ SUPPRIME TOUTES DONNÉES)
npx prisma migrate reset
```

---

## ⚠️ Troubleshooting

### Erreur: "Can't reach database server"

**Solution Docker:**
```bash
docker ps  # Vérifier containers running
docker-compose down
docker-compose up -d
```

**Solution Local:**
```powershell
# Windows - Vérifier service PostgreSQL
Get-Service postgresql*

# Si arrêté
Start-Service postgresql-x64-15  # ou votre version
```

### Erreur: "Port 4000 already in use"

```bash
# Changer port dans .env
PORT=4001
```

### Erreur: "Module not found"

```bash
rm -rf node_modules
npm install
```

---

## 🎯 PROCHAINE ÉTAPE

**Une fois le backend démarré avec succès :**

1. ✅ Backend écoute sur http://localhost:4000
2. ✅ Database connectée
3. ✅ Prisma tables créées

**Connecter le frontend :**
```bash
# Dans le frontend, créer .env
VITE_API_URL=http://localhost:4000/api

# Le frontend pourra appeler :
# - GET  /api/threats
# - POST /api/alerts
# - etc.
```

---

## 📝 Variables d'Environnement Essentielles

```bash
# Backend .env minimal
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/antstrike_cti"
TARANIS_API_URL="http://localhost:8080"
JWT_SECRET="dev-secret-change-in-prod"
FRONTEND_URL="http://localhost:3000"
```

---

## ✅ CHECKLIST AVANT PRODUCTION

```
✅ Changer JWT_SECRET (256 bits random)
✅ Configurer SENDGRID_API_KEY
✅ Configurer STRIPE_SECRET_KEY
✅ Configurer SENTRY_DSN
✅ DATABASE_URL avec credentials sécurisées
✅ CORS configuré pour production domain
✅ Rate limiting activé
✅ HTTPS only (production)
```

---

**🎉 C'est tout ! Vous êtes prêt !**

Si erreurs, voir `README.md` complet ou demander de l'aide.




