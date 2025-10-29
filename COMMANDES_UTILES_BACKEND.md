# 💡 COMMANDES UTILES - BACKEND ANTSTRIKE CTI

**Quick Reference pour le développement quotidien**

---

## 🚀 DÉMARRAGE

### Démarrer le Backend
```powershell
cd backend
npm run dev
```

### Arrêter tous les Node.js (si port occupé)
```powershell
taskkill /F /IM node.exe
```

### Vérifier le Status
```powershell
curl http://localhost:4000/api/health
```

---

## 📚 SWAGGER/OPENAPI

### Ouvrir Swagger UI
```
http://localhost:4000/api/docs
```

### Télécharger le Spec JSON
```powershell
curl http://localhost:4000/api/docs/swagger.json -o openapi-spec.json
```

### Compter les Endpoints
```powershell
(Invoke-RestMethod http://localhost:4000/api/docs/swagger.json).paths.PSObject.Properties.Count
```

### Lister tous les Endpoints
```powershell
(Invoke-RestMethod http://localhost:4000/api/docs/swagger.json).paths.PSObject.Properties.Name
```

---

## 🔐 AUTHENTIFICATION

### Register (Créer Compte)
```powershell
$body = @{
    tenantName = "Ma Société"
    email = "admin@masociete.com"
    name = "Admin Principal"
    password = "MonMotDePasse123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

# Sauvegarder le token
$token = $response.accessToken
$tenantId = $response.user.tenant.id
```

### Login
```powershell
$body = @{
    email = "admin@masociete.com"
    password = "MonMotDePasse123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

$token = $response.accessToken
```

### Utiliser le Token
```powershell
$headers = @{
    Authorization = "Bearer $token"
}
```

---

## 🔍 IOC ENRICHMENT

### Enrichir une IP
```powershell
$body = @{
    iocValue = "8.8.8.8"
    iocType = "IP"
    tenantId = $tenantId
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:4000/api/ioc/enrich" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"

$result.data.enrichmentData.ipData | ConvertTo-Json -Depth 5
```

### Enrichir un Hash (EICAR Test)
```powershell
$body = @{
    iocValue = "44d88612fea8a8f36de82e1278abb02f"
    iocType = "FILE_HASH"
    tenantId = $tenantId
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:4000/api/ioc/enrich" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"

$result.data.enrichmentData.fileData | ConvertTo-Json -Depth 5
```

### Enrichir un Domain
```powershell
$body = @{
    iocValue = "google.com"
    iocType = "DOMAIN"
    tenantId = $tenantId
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:4000/api/ioc/enrich" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

### Enrichir une URL
```powershell
$body = @{
    iocValue = "https://example.com"
    iocType = "URL"
    tenantId = $tenantId
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:4000/api/ioc/enrich" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

### Batch Enrichment (plusieurs IOCs)
```powershell
$body = @{
    iocs = @(
        @{ iocValue = "8.8.8.8"; iocType = "IP" },
        @{ iocValue = "1.1.1.1"; iocType = "IP" },
        @{ iocValue = "google.com"; iocType = "DOMAIN" }
    )
    tenantId = $tenantId
} | ConvertTo-Json -Depth 10

$result = Invoke-RestMethod -Uri "http://localhost:4000/api/ioc/bulk-enrich" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

### Extraire IOCs depuis Texte
```powershell
$body = @{
    text = "Suspicious activity from 192.168.1.100 accessing malware.evil.com and downloading payload.exe (hash: 44d88612fea8a8f36de82e1278abb02f)"
    tenantId = $tenantId
    enrich = $true
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:4000/api/ioc/extract" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"

$result.iocs | ConvertTo-Json
```

### Liste IOCs Enrichis
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:4000/api/ioc?tenantId=$tenantId&limit=10" `
    -Method Get `
    -Headers $headers

$result.data | Select-Object -First 5 | ConvertTo-Json -Depth 3
```

---

## 🚨 ALERTS

### Créer Alerte
```powershell
$body = @{
    tenantId = $tenantId
    title = "Activité Suspecte Détectée"
    description = "Multiple failed login attempts from 203.0.113.10"
    severity = "HIGH"
    source = "IDS/IPS"
    relatedIOCs = @("203.0.113.10")
} | ConvertTo-Json

$alert = Invoke-RestMethod -Uri "http://localhost:4000/api/alerts" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

### Liste Alertes
```powershell
$alerts = Invoke-RestMethod -Uri "http://localhost:4000/api/alerts?tenantId=$tenantId&severity=HIGH&limit=20" `
    -Method Get `
    -Headers $headers
```

### Acquitter Alerte
```powershell
$alertId = "ALERT_ID_HERE"
Invoke-RestMethod -Uri "http://localhost:4000/api/alerts/$alertId/acknowledge" `
    -Method Post `
    -Headers $headers
```

### Résoudre Alerte
```powershell
$body = @{
    resolution = "False positive - système de backup automatique"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/alerts/$alertId/resolve" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

---

## 📁 CASES (Investigation)

### Créer Case
```powershell
$body = @{
    tenantId = $tenantId
    title = "Investigation - Ransomware Attempt"
    description = "Investigating potential ransomware activity"
    priority = "CRITICAL"
    relatedAlerts = @("alert-id-1", "alert-id-2")
} | ConvertTo-Json

$case = Invoke-RestMethod -Uri "http://localhost:4000/api/cases" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

### Ajouter Note d'Investigation
```powershell
$caseId = $case.data.id
$body = @{
    note = "Analyzed C2 communication - confirmed malicious activity"
    author = $response.user.id
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/cases/$caseId/notes" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

### Clôturer Case
```powershell
$body = @{
    resolution = "Ransomware blocked by EDR, systems cleaned"
    recommendations = "Update EDR signatures, train users on phishing"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/cases/$caseId/close" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

---

## 📊 REPORTS

### Générer Rapport Quotidien
```powershell
$body = @{
    tenantId = $tenantId
    type = "DAILY"
    format = "HTML"
    title = "Rapport Quotidien - $(Get-Date -Format 'dd MMM yyyy')"
    sections = @("THREATS", "ALERTS", "IOCS")
} | ConvertTo-Json

$report = Invoke-RestMethod -Uri "http://localhost:4000/api/reports/generate" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"

Write-Host "Rapport généré: $($report.reportId)"
Write-Host "Télécharger: http://localhost:4000$($report.downloadUrl)"
```

### Télécharger Rapport
```powershell
$reportId = $report.reportId
Invoke-WebRequest -Uri "http://localhost:4000/api/reports/$reportId/download" `
    -Headers $headers `
    -OutFile "rapport-$(Get-Date -Format 'yyyyMMdd').html"
```

---

## 🤖 PLAYBOOKS SOAR

### Créer Playbook
```powershell
$body = @{
    tenantId = $tenantId
    name = "Auto-Block Malicious IP"
    description = "Automatically block IPs with high threat score"
    trigger = @{
        type = "IOC_ENRICHED"
        conditions = @{
            iocType = "IP"
            minThreatScore = 80
        }
    }
    actions = @(
        @{
            type = "BLOCK_IP"
            params = @{ firewall = "true" }
        },
        @{
            type = "CREATE_ALERT"
            params = @{ severity = "HIGH" }
        },
        @{
            type = "SEND_EMAIL"
            params = @{ template = "malicious_ip_blocked" }
        }
    )
} | ConvertTo-Json -Depth 10

$playbook = Invoke-RestMethod -Uri "http://localhost:4000/api/playbooks" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

### Exécuter Playbook Manuellement
```powershell
$playbookId = $playbook.data.id
$body = @{
    context = @{
        alertId = "alert-123"
        iocValue = "203.0.113.50"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/playbooks/$playbookId/execute" `
    -Method Post `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
```

---

## 📈 METRICS & ANALYTICS

### Métriques Équipe SOC
```powershell
$metrics = Invoke-RestMethod -Uri "http://localhost:4000/api/metrics/team?tenantId=$tenantId&period=month" `
    -Method Get `
    -Headers $headers

$metrics | ConvertTo-Json -Depth 5
```

### Métriques Analyste Individuel
```powershell
$userId = $response.user.id
$analystMetrics = Invoke-RestMethod -Uri "http://localhost:4000/api/metrics/analyst/$userId?period=week" `
    -Method Get `
    -Headers $headers
```

### Comparer Analystes
```powershell
$userIds = @("user-1", "user-2", "user-3")
$comparison = Invoke-RestMethod -Uri "http://localhost:4000/api/metrics/compare?tenantId=$tenantId&userIds=$($userIds -join ',')" `
    -Method Get `
    -Headers $headers
```

---

## 🔗 CORRELATION

### Détecter Campagnes d'Attaque
```powershell
$campaigns = Invoke-RestMethod -Uri "http://localhost:4000/api/correlation/campaigns?tenantId=$tenantId&timeRange=7d&minCorrelation=0.7" `
    -Method Get `
    -Headers $headers

$campaigns.campaigns | Select-Object name, confidence, threatsCount | Format-Table
```

### Corréler une Menace
```powershell
$threatId = "threat-id-here"
$correlations = Invoke-RestMethod -Uri "http://localhost:4000/api/correlation/correlate/$threatId" `
    -Method Post `
    -Headers $headers
```

---

## 🛠️ DATABASE (Prisma)

### Générer Client Prisma
```bash
npx prisma generate
```

### Ouvrir Prisma Studio (UI Base de Données)
```bash
npx prisma studio
```

### Push Schema vers DB
```bash
npx prisma db push
```

### Créer Migration
```bash
npx prisma migrate dev --name ma_migration
```

### Reset Database (⚠️ DANGER)
```bash
npx prisma migrate reset
```

---

## 🧪 TESTS

### Test Complet (Séquence)
```powershell
# 1. Health check
curl http://localhost:4000/api/health

# 2. Register
$body = @{tenantName="Test"; email="test@test.com"; name="Test"; password="Pass123!"} | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
$token = $auth.accessToken
$tenantId = $auth.user.tenant.id

# 3. Test IOC Enrichment
$body = @{iocValue="8.8.8.8"; iocType="IP"; tenantId=$tenantId} | ConvertTo-Json
$headers = @{Authorization="Bearer $token"}
$ioc = Invoke-RestMethod -Uri "http://localhost:4000/api/ioc/enrich" -Method Post -Body $body -Headers $headers -ContentType "application/json"

# 4. Vérifier résultat
$ioc.data.enrichmentData.ipData.sources
# Devrait afficher: ["AbuseIPDB", "IPInfo"]
```

### Test Performance Cache
```powershell
# Premier appel (APIs externes)
$time1 = Measure-Command {
    $body = @{iocValue="1.1.1.1"; iocType="IP"; tenantId=$tenantId} | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:4000/api/ioc/enrich" -Method Post -Body $body -Headers $headers -ContentType "application/json"
}
Write-Host "Premier appel: $([int]$time1.TotalMilliseconds)ms"

# Deuxième appel (cache)
$time2 = Measure-Command {
    $body = @{iocValue="1.1.1.1"; iocType="IP"; tenantId=$tenantId} | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:4000/api/ioc/enrich" -Method Post -Body $body -Headers $headers -ContentType "application/json"
}
Write-Host "Cache hit: $([int]$time2.TotalMilliseconds)ms ($(100 - [int](($time2.TotalMilliseconds / $time1.TotalMilliseconds) * 100))% plus rapide)"
```

---

## 🔍 DEBUGGING

### Logs Backend
Le backend affiche des logs détaillés dans le terminal où `npm run dev` est lancé.

### Variables d'Environnement
```powershell
# Vérifier .env
Get-Content backend\.env | Select-String "API_KEY|TOKEN"
```

### Vérifier Port
```powershell
netstat -ano | Select-String "4000"
```

### Tuer Processus sur Port
```powershell
# Trouver le PID
netstat -ano | Select-String "4000"

# Tuer le processus (remplacer PID)
taskkill /F /PID 12345
```

---

## 📦 NPM

### Installer Dependencies
```bash
npm install
```

### Mettre à Jour Packages
```bash
npm update
```

### Audit Sécurité
```bash
npm audit
npm audit fix
```

### Lister Scripts Disponibles
```bash
npm run
```

---

## 🐛 DÉPANNAGE

### Problème: "EADDRINUSE: address already in use"
```powershell
taskkill /F /IM node.exe
cd backend
npm run dev
```

### Problème: "Cannot connect to database"
```powershell
# Vérifier PostgreSQL
# Si pas installé, commenter DATABASE_URL dans .env
```

### Problème: "API key not configured"
```powershell
# Vérifier .env
notepad backend\.env
# S'assurer que les clés sont présentes sans guillemets
```

### Problème: "Not allowed by CORS"
```powershell
# Solution déjà appliquée: CORS permissif en dev
# Vérifier que NODE_ENV=development dans .env
```

### Problème: "Module not found"
```bash
cd backend
npm install
npx prisma generate
```

---

## 📊 STATISTIQUES

### Compter Lignes de Code
```powershell
(Get-ChildItem -Path backend\src -Recurse -Include *.ts | Get-Content).Count
```

### Compter Endpoints
```powershell
(Get-ChildItem -Path backend\src\routes -Include *.ts | Select-String "router\.(get|post|put|patch|delete)" | Measure-Object).Count
```

### Taille du Projet
```powershell
(Get-ChildItem -Path backend -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
# Résultat en MB
```

---

## 🎯 WORKFLOW QUOTIDIEN

### Morning Routine
```powershell
# 1. Pull dernières modifications
git pull

# 2. Installer nouvelles deps
cd backend
npm install

# 3. Régénérer Prisma si schema modifié
npx prisma generate

# 4. Démarrer backend
npm run dev

# 5. Vérifier health
curl http://localhost:4000/api/health

# 6. Ouvrir Swagger
# http://localhost:4000/api/docs
```

### Before Commit
```bash
# 1. Linter
npm run lint

# 2. Format
npm run format

# 3. Tests (quand implémentés)
npm test

# 4. Build check
npm run build
```

---

## 🚀 DÉPLOIEMENT

### Build Production
```bash
npm run build
```

### Démarrer Production
```bash
npm start
```

### Variables .env Production
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db
JWT_SECRET=CHANGE_ME_IN_PRODUCTION
# ... etc
```

---

## 📚 DOCUMENTATION

### Générer Documentation
Swagger est auto-généré depuis les annotations dans les routes.

### Exporter Spec OpenAPI
```powershell
curl http://localhost:4000/api/docs/swagger.json -o docs/openapi-spec.json
```

### Générer Client SDK (futur)
```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:4000/api/docs/swagger.json \
  -g typescript-fetch \
  -o clients/typescript
```

---

## 🎉 RÉSUMÉ RAPIDE

```powershell
# Démarrer tout
cd backend && npm run dev

# Tester santé
curl http://localhost:4000/api/health

# Ouvrir doc
start http://localhost:4000/api/docs

# Register + Login + Test IOC
# (Utiliser Swagger UI - plus facile!)
```

---

**Créé:** 19 Octobre 2025  
**Mise à jour:** Automatique (vivant)  
**Status:** ✅ Complet et Testé




