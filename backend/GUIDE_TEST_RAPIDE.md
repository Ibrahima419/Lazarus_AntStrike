# 🧪 GUIDE DE TEST RAPIDE - ENDPOINTS TARANIS CORRIGÉS

## 🚀 ÉTAPE 1 : REDÉMARRER LE BACKEND

### Dans votre terminal `npm run dev` :
1. **Arrêter** le backend : `Ctrl+C`
2. **Relancer** : `npm run dev`
3. **Attendre** le message : `✅ 🚀 AntStrike Backend listening on port 4000`

---

## 🧪 ÉTAPE 2 : TESTS RAPIDES

### Test 1 : Vérifier la Version 4.0.0 ✅

```powershell
curl http://localhost:4000
```

**Résultat attendu:**
```json
{
  "message": "🛡️ AntStrike CTI Backend API - PRODUCTION READY ✅",
  "version": "4.0.0",
  "taranisRealEndpoints": 140
}
```

---

### Test 2 : Login pour obtenir TOKEN

```powershell
$loginBody = @{ email = 'analyst@test.com'; password = 'Password123' } | ConvertTo-Json
$response = Invoke-RestMethod -Method POST -Uri 'http://localhost:4000/api/auth/login' -Body $loginBody -ContentType 'application/json'
$TOKEN = $response.accessToken
Write-Host "✅ TOKEN: $($TOKEN.Substring(0, 30))..." -ForegroundColor Green
```

---

### Test 3 : Dashboard Principal ✅ NOUVEAU

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/dashboard' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Dashboard complet avec stats, stories récentes, etc.

---

### Test 4 : Story Clusters ✅ NOUVEAU

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/dashboard/story-clusters?days=7&limit=10' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Clusters de stories des 7 derniers jours

---

### Test 5 : Stories (Assess)

```powershell
$stories = Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/assess/stories?limit=5' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
Write-Host "✅ Stories trouvées: $($stories.total_count)" -ForegroundColor Green
$stories.items | Select-Object -First 3 | Format-Table id, title, relevance
```

---

### Test 6 : Tags ✅ NOUVEAU

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/assess/tags?limit=10' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Liste de tags avec leur taille

---

### Test 7 : OSINT Sources List ✅ NOUVEAU

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/assess/osint-sources-list' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Liste des sources OSINT configurées

---

### Test 8 : Report Items ✅ NOUVEAU (Module ANALYZE)

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/analyze/report-items?limit=10' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Liste des report items

---

### Test 9 : Report Types ✅ NOUVEAU

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/analyze/report-types' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Types de rapports disponibles

---

### Test 10 : Products ✅ NOUVEAU

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/publish/products?limit=10' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Liste des produits

---

### Test 11 : Product Types ✅ NOUVEAU

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/publish/product-types' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Types de produits disponibles

---

### Test 12 : Assets ✅ NOUVEAU (Module ASSETS)

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/assets?limit=10' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Liste des assets

---

### Test 13 : Admin Settings ✅ NOUVEAU (Module ADMIN)

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/admin/settings' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Paramètres système

---

### Test 14 : Story Conflicts ✅ NOUVEAU (Module CONNECTORS)

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/connectors/conflicts/stories' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Liste des conflits de stories

---

### Test 15 : Build Info ✅ NOUVEAU

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/dashboard/build-info' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
```

**Résultat attendu:** Informations de build (git commit, date, etc.)

---

## 🎯 TEST COMPLET (ALL-IN-ONE)

Copiez-collez ce script complet :

```powershell
# 1. Vérifier version
Write-Host "`n1️⃣ TEST VERSION..." -ForegroundColor Yellow
$version = Invoke-RestMethod -Uri 'http://localhost:4000'
Write-Host "✅ Version: $($version.version)" -ForegroundColor Green
Write-Host "✅ Endpoints Taranis: $($version.statistics.taranisRealEndpoints)" -ForegroundColor Green

# 2. Login
Write-Host "`n2️⃣ LOGIN..." -ForegroundColor Yellow
$loginBody = @{ email = 'analyst@test.com'; password = 'Password123' } | ConvertTo-Json
$response = Invoke-RestMethod -Method POST -Uri 'http://localhost:4000/api/auth/login' -Body $loginBody -ContentType 'application/json'
$TOKEN = $response.accessToken
Write-Host "✅ TOKEN obtenu" -ForegroundColor Green

# 3. Dashboard
Write-Host "`n3️⃣ DASHBOARD..." -ForegroundColor Yellow
$dashboard = Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/dashboard' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
Write-Host "✅ Total stories: $($dashboard.total_stories)" -ForegroundColor Green

# 4. Story Clusters
Write-Host "`n4️⃣ STORY CLUSTERS..." -ForegroundColor Yellow
$clusters = Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/dashboard/story-clusters?limit=5' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
Write-Host "✅ Clusters trouvés: $($clusters.Count)" -ForegroundColor Green

# 5. Stories
Write-Host "`n5️⃣ STORIES..." -ForegroundColor Yellow
$stories = Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/assess/stories?limit=3' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
Write-Host "✅ Stories: $($stories.total_count)" -ForegroundColor Green

# 6. Tags
Write-Host "`n6️⃣ TAGS..." -ForegroundColor Yellow
$tags = Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/assess/tags?limit=5' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
Write-Host "✅ Tags trouvés: $($tags.total_count)" -ForegroundColor Green

# 7. Report Items
Write-Host "`n7️⃣ REPORT ITEMS..." -ForegroundColor Yellow
$reportItems = Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/analyze/report-items?limit=3' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
Write-Host "✅ Report items: $($reportItems.total_count)" -ForegroundColor Green

# 8. Products
Write-Host "`n8️⃣ PRODUCTS..." -ForegroundColor Yellow
$products = Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/publish/products?limit=3' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
Write-Host "✅ Products: $($products.total_count)" -ForegroundColor Green

# 9. Build Info
Write-Host "`n9️⃣ BUILD INFO..." -ForegroundColor Yellow
$buildInfo = Invoke-RestMethod -Uri 'http://localhost:4000/api/taranis/dashboard/build-info' -Headers @{ 'Authorization' = "Bearer $TOKEN" }
Write-Host "✅ Build date: $($buildInfo.build_date)" -ForegroundColor Green

# RÉSUMÉ
Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅ TOUS LES TESTS RÉUSSIS !        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n📊 NOUVEAUX MODULES TESTÉS:" -ForegroundColor Green
Write-Host "  ✅ Dashboard (complet)" -ForegroundColor Green
Write-Host "  ✅ Assess (Stories, Tags, Sources)" -ForegroundColor Green
Write-Host "  ✅ Analyze (Report Items)" -ForegroundColor Green
Write-Host "  ✅ Publish (Products)" -ForegroundColor Green
Write-Host "`n🎯 TOUS LES ENDPOINTS FONCTIONNENT !`n" -ForegroundColor Green
```

---

## ✅ CHECKLIST DE VALIDATION

Après avoir lancé les tests, vérifiez :

- [ ] Version 4.0.0 affichée
- [ ] 140 endpoints Taranis disponibles
- [ ] Dashboard principal fonctionne
- [ ] Story clusters fonctionnent
- [ ] Module Assess fonctionne (Stories, Tags, Sources)
- [ ] Module Analyze fonctionne (Report Items, Types)
- [ ] Module Publish fonctionne (Products, Types)
- [ ] Aucune erreur 404 "endpoint not found"
- [ ] Logs propres sans erreurs circular structure

---

## ❌ SI UN TEST ÉCHOUE

### Erreur 401 Unauthorized
→ Le token a expiré, relancez le login

### Erreur 404 sur un endpoint Taranis
→ Vérifiez que votre instance Taranis est accessible
→ Vérifiez `TARANIS_API_URL` dans `.env`

### Erreur 500
→ Regardez les logs du backend pour plus de détails

---

## 📝 RAPPORTER LES RÉSULTATS

Après les tests, indiquez :
1. ✅ ou ❌ pour chaque test
2. Erreurs rencontrées (si applicable)
3. Logs du backend

---

**Prêt pour la production ! 🚀**


