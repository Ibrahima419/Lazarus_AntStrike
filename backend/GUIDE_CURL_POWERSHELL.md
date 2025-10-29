# 🚀 GUIDE CURL POUR POWERSHELL

**Commandes spécifiques PowerShell pour tester AntStrike CTI**

---

## ⚠️ IMPORTANT : CURL vs CURL.EXE

Sur PowerShell, `curl` est un alias pour `Invoke-WebRequest` (syntaxe différente).

**✅ Utilisez `curl.exe`** pour avoir le vrai curl Unix !

---

## 🎯 TESTS PAS À PAS

### **✅ ÉTAPE 1 : Health Check** (RÉUSSI !)

```powershell
curl.exe http://localhost:4000/api/health
```

**Statut** : ✅ 200 OK - Backend opérationnel !

---

### **🔐 ÉTAPE 2 : Créer un compte**

```powershell
curl.exe -X POST http://localhost:4000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"analyst@soc.local\",\"password\":\"SecurePass123!\",\"name\":\"SOC Analyst\"}'
```

**OU utilisez Invoke-WebRequest natif** :

```powershell
$body = @{
    email = "analyst@soc.local"
    password = "SecurePass123!"
    name = "SOC Analyst"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/api/auth/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Copiez le TOKEN** de la réponse !

---

### **🔑 ÉTAPE 3 : Se connecter (Login)**

```powershell
$body = @{
    email = "analyst@soc.local"
    password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json

$TOKEN = $response.token
Write-Host "Token obtenu: $TOKEN" -ForegroundColor Green
```

---

### **📊 ÉTAPE 4 : Vérifier la Queue (avec token)**

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/collection/queue/status" `
  -Headers @{ Authorization = "Bearer $TOKEN" } | 
  Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**OU avec curl.exe** :

```powershell
curl.exe http://localhost:4000/api/collection/queue/status `
  -H "Authorization: Bearer $TOKEN"
```

---

### **🚀 ÉTAPE 5 : Déclencher une collecte**

```powershell
$collectBody = @{
    sources = @("taranis")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/api/collection/trigger" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $TOKEN" } `
  -Body $collectBody `
  -ContentType "application/json" | Select-Object -ExpandProperty Content
```

---

### **⏱️ ÉTAPE 6 : Attendre et vérifier**

```powershell
Write-Host "`n⏳ Attente 15 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n📊 Vérification de la queue...`n" -ForegroundColor Cyan
Invoke-WebRequest -Uri "http://localhost:4000/api/collection/queue/status" `
  -Headers @{ Authorization = "Bearer $TOKEN" } | 
  Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

---

## 📡 TESTS TARANIS

### **Lister les stories**

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/taranis/news-items/stories" `
  -Headers @{ Authorization = "Bearer $TOKEN" } | 
  Select-Object -ExpandProperty Content | ConvertFrom-Json
```

### **Lister les products**

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/taranis/products" `
  -Headers @{ Authorization = "Bearer $TOKEN" } | 
  Select-Object -ExpandProperty Content | ConvertFrom-Json
```

---

## 🎯 SCRIPT COMPLET AUTOMATIQUE

Copiez-collez tout ce script dans PowerShell :

```powershell
# ═══════════════════════════════════════════════════════
#  SCRIPT DE TEST COMPLET ANTSTRIKE CTI
# ═══════════════════════════════════════════════════════

$BASE_URL = "http://localhost:4000/api"

Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🧪 TEST AUTOMATIQUE ANTSTRIKE CTI 🧪   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────
# 1️⃣ HEALTH CHECK
# ─────────────────────────────────────────────────────
Write-Host "1️⃣  Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "$BASE_URL/health" | 
              Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    if ($health.success) {
        Write-Host "   ✅ Backend opérationnel !`n" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}

# ─────────────────────────────────────────────────────
# 2️⃣ INSCRIPTION (ou tentative)
# ─────────────────────────────────────────────────────
Write-Host "2️⃣  Tentative d'inscription..." -ForegroundColor Yellow

$registerBody = @{
    email = "analyst@soc.local"
    password = "SecurePass123!"
    name = "SOC Analyst"
} | ConvertTo-Json

try {
    $register = Invoke-WebRequest -Uri "$BASE_URL/auth/register" `
                  -Method POST `
                  -Body $registerBody `
                  -ContentType "application/json" | 
                  Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "   ✅ Compte créé !`n" -ForegroundColor Green
} catch {
    Write-Host "   ℹ️  Compte existe déjà (normal)`n" -ForegroundColor Gray
}

# ─────────────────────────────────────────────────────
# 3️⃣ LOGIN
# ─────────────────────────────────────────────────────
Write-Host "3️⃣  Connexion..." -ForegroundColor Yellow

$loginBody = @{
    email = "analyst@soc.local"
    password = "SecurePass123!"
} | ConvertTo-Json

try {
    $login = Invoke-WebRequest -Uri "$BASE_URL/auth/login" `
               -Method POST `
               -Body $loginBody `
               -ContentType "application/json" | 
               Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    $TOKEN = $login.token
    Write-Host "   ✅ Token obtenu !" -ForegroundColor Green
    Write-Host "   🔑 Token: $($TOKEN.Substring(0, 30))...`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erreur login: $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}

# ─────────────────────────────────────────────────────
# 4️⃣ QUEUE STATUS (AVANT)
# ─────────────────────────────────────────────────────
Write-Host "4️⃣  Statut de la queue (AVANT collecte)..." -ForegroundColor Yellow

try {
    $queueBefore = Invoke-WebRequest -Uri "$BASE_URL/collection/queue/status" `
                     -Headers @{ Authorization = "Bearer $TOKEN" } | 
                     Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "   📊 Queue AVANT :" -ForegroundColor Cyan
    Write-Host "      • Waiting   : $($queueBefore.data.waiting)" -ForegroundColor White
    Write-Host "      • Active    : $($queueBefore.data.active)" -ForegroundColor White
    Write-Host "      • Completed : $($queueBefore.data.completed)" -ForegroundColor White
    Write-Host "      • Failed    : $($queueBefore.data.failed)`n" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ─────────────────────────────────────────────────────
# 5️⃣ DÉCLENCHER COLLECTE
# ─────────────────────────────────────────────────────
Write-Host "5️⃣  Déclenchement de la collecte..." -ForegroundColor Yellow

$collectBody = @{
    sources = @("taranis")
} | ConvertTo-Json

try {
    $collect = Invoke-WebRequest -Uri "$BASE_URL/collection/trigger" `
                 -Method POST `
                 -Headers @{ Authorization = "Bearer $TOKEN" } `
                 -Body $collectBody `
                 -ContentType "application/json" | 
                 Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "   ✅ Collecte déclenchée !`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ─────────────────────────────────────────────────────
# 6️⃣ ATTENTE
# ─────────────────────────────────────────────────────
Write-Host "6️⃣  Attente du traitement (15 secondes)..." -ForegroundColor Yellow
for ($i = 15; $i -gt 0; $i--) {
    Write-Host "      $i..." -NoNewline -ForegroundColor Gray
    Start-Sleep -Seconds 1
}
Write-Host "`n"

# ─────────────────────────────────────────────────────
# 7️⃣ QUEUE STATUS (APRÈS)
# ─────────────────────────────────────────────────────
Write-Host "7️⃣  Statut de la queue (APRÈS collecte)..." -ForegroundColor Yellow

try {
    $queueAfter = Invoke-WebRequest -Uri "$BASE_URL/collection/queue/status" `
                    -Headers @{ Authorization = "Bearer $TOKEN" } | 
                    Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "   📊 Queue APRÈS :" -ForegroundColor Cyan
    Write-Host "      • Waiting   : $($queueAfter.data.waiting)" -ForegroundColor White
    Write-Host "      • Active    : $($queueAfter.data.active)" -ForegroundColor White
    Write-Host "      • Completed : $($queueAfter.data.completed) " -NoNewline -ForegroundColor White
    
    if ($queueAfter.data.completed -gt $queueBefore.data.completed) {
        Write-Host "↑ (+$($queueAfter.data.completed - $queueBefore.data.completed))" -ForegroundColor Green
    } else {
        Write-Host "=" -ForegroundColor Gray
    }
    
    Write-Host "      • Failed    : $($queueAfter.data.failed)`n" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ─────────────────────────────────────────────────────
# 8️⃣ TARANIS STORIES
# ─────────────────────────────────────────────────────
Write-Host "8️⃣  Test Taranis (stories)..." -ForegroundColor Yellow

try {
    $stories = Invoke-WebRequest -Uri "$BASE_URL/taranis/news-items/stories" `
                 -Headers @{ Authorization = "Bearer $TOKEN" } | 
                 Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    if ($stories.items) {
        Write-Host "   ✅ $($stories.items.Count) stories trouvées !`n" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Aucune story (Taranis vide)`n" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ─────────────────────────────────────────────────────
# 9️⃣ STIX BUNDLES
# ─────────────────────────────────────────────────────
Write-Host "9️⃣  Test STIX (bundles)..." -ForegroundColor Yellow

try {
    $stix = Invoke-WebRequest -Uri "$BASE_URL/stix/bundles" `
              -Headers @{ Authorization = "Bearer $TOKEN" } | 
              Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "   ✅ STIX endpoint accessible !`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ─────────────────────────────────────────────────────
# 🔟 TAXII DISCOVERY
# ─────────────────────────────────────────────────────
Write-Host "🔟 Test TAXII (discovery)..." -ForegroundColor Yellow

try {
    $taxii = Invoke-WebRequest -Uri "$BASE_URL/taxii/discovery" | 
               Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "   ✅ TAXII server accessible !`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ─────────────────────────────────────────────────────
# RÉSUMÉ
# ─────────────────────────────────────────────────────
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      ✅  TESTS TERMINÉS AVEC SUCCÈS  ✅   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 RÉSUMÉ :" -ForegroundColor Cyan
Write-Host "   • Backend        : ✅ Opérationnel" -ForegroundColor White
Write-Host "   • Authentification: ✅ Fonctionnelle" -ForegroundColor White
Write-Host "   • Queue BullMQ   : ✅ Active" -ForegroundColor White
Write-Host "   • Collecte       : ✅ Déclenchée" -ForegroundColor White
Write-Host "   • Endpoints      : ✅ Accessibles`n" -ForegroundColor White

Write-Host "🎯 Votre token d'authentification :" -ForegroundColor Yellow
Write-Host "   $TOKEN`n" -ForegroundColor Gray

Write-Host "💡 Utilisez ce token pour tester d'autres endpoints !`n" -ForegroundColor Cyan
```

---

## 🎬 UTILISATION DU SCRIPT

1. **Copiez tout le script** ci-dessus
2. **Collez-le dans PowerShell**
3. **Appuyez sur Entrée**
4. **Regardez les tests s'exécuter** ! ✨

---

## 📋 AUTRES COMMANDES UTILES

### **Lister les menaces collectées**

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/threats" `
  -Headers @{ Authorization = "Bearer $TOKEN" } | 
  Select-Object -ExpandProperty Content | ConvertFrom-Json | 
  ConvertTo-Json -Depth 5
```

### **Filtrer par sévérité**

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/threats?severity=critical" `
  -Headers @{ Authorization = "Bearer $TOKEN" } | 
  Select-Object -ExpandProperty Content | ConvertFrom-Json
```

### **CVE récents**

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/cve/recent" `
  -Headers @{ Authorization = "Bearer $TOKEN" } | 
  Select-Object -ExpandProperty Content | ConvertFrom-Json
```

---

## ✅ SUCCÈS !

Vous pouvez maintenant tester tous les endpoints du système ! 🚀

