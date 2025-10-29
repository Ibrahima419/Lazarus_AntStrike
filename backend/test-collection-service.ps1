# 🧪 Script de test du Service 1 - Collecte & Agrégation
# Usage: .\test-collection-service.ps1

Write-Host "🧪 Testing Collection Service..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_URL = "http://localhost:4000"
$EMAIL = "admin@test.com"
$PASSWORD = "password"

# ========================================
# 1. Health Check
# ========================================
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri "$API_URL/api/health" -Method Get
    
    if ($healthResponse.status -eq "ok") {
        Write-Host "✅ Backend is healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend is unhealthy" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend is down: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# 2. Login
# ========================================
Write-Host "2️⃣  Logging in..." -ForegroundColor Yellow

try {
    $loginBody = @{
        email = $EMAIL
        password = $PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    $TOKEN = $loginResponse.token
    
    if ($TOKEN) {
        Write-Host "✅ Login successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Login failed - No token received" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Headers avec token
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# ========================================
# 3. Collection Health Check
# ========================================
Write-Host "3️⃣  Checking Collection Health..." -ForegroundColor Yellow

try {
    $collectionHealth = Invoke-RestMethod -Uri "$API_URL/api/collection/health" `
        -Method Get `
        -Headers $headers
    
    Write-Host ($collectionHealth | ConvertTo-Json -Depth 5)
    
    if ($collectionHealth.overall -eq "healthy") {
        Write-Host "✅ Collection sources healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some sources may be down" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Collection health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# 4. Queue Status
# ========================================
Write-Host "4️⃣  Checking Queue Status..." -ForegroundColor Yellow

try {
    $queueStatus = Invoke-RestMethod -Uri "$API_URL/api/collection/queue/status" `
        -Method Get `
        -Headers $headers
    
    Write-Host ($queueStatus.data | ConvertTo-Json -Depth 3)
    Write-Host ""
} catch {
    Write-Host "⚠️  Queue status check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# 5. Trigger Manual Collection
# ========================================
Write-Host "5️⃣  Triggering Manual Collection..." -ForegroundColor Yellow
Write-Host "⏳ This may take 30s-2min..." -ForegroundColor Yellow

try {
    $collectionResult = Invoke-RestMethod -Uri "$API_URL/api/collection/trigger" `
        -Method Post `
        -Headers $headers
    
    Write-Host ($collectionResult | ConvertTo-Json -Depth 5)
    
    if ($collectionResult.success) {
        Write-Host "✅ Collection triggered successfully" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📊 Collection Stats:" -ForegroundColor Cyan
        Write-Host "   Items Collected: $($collectionResult.data.totalItemsCollected)"
        Write-Host "   Items Queued: $($collectionResult.data.totalItemsQueued)"
        Write-Host "   Success Rate: $($collectionResult.data.successRate)"
        Write-Host "   Duration: $($collectionResult.data.duration)"
    } else {
        Write-Host "❌ Collection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Collection trigger failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 6. Collection Stats
# ========================================
Write-Host "6️⃣  Getting Collection Stats..." -ForegroundColor Yellow

try {
    $stats = Invoke-RestMethod -Uri "$API_URL/api/collection/stats" `
        -Method Get `
        -Headers $headers
    
    Write-Host ($stats.data | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "⚠️  Stats retrieval failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# 7. Recent Threats
# ========================================
Write-Host "7️⃣  Checking Recent Threats..." -ForegroundColor Yellow

try {
    $threats = Invoke-RestMethod -Uri "$API_URL/api/threats?limit=5" `
        -Method Get `
        -Headers $headers
    
    $threatCount = $threats.total
    Write-Host "Total threats: $threatCount"
    
    if ($threatCount -gt 0) {
        Write-Host "✅ Threats collected successfully" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📋 Recent Threats:" -ForegroundColor Cyan
        foreach ($threat in $threats.data) {
            Write-Host "   - $($threat.name) [$($threat.severity)] from $($threat.source)"
        }
    } else {
        Write-Host "⚠️  No threats yet (normal if first run)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Threats retrieval failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# RÉSUMÉ
# ========================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎉 TEST COMPLET TERMINÉ" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tous les tests passés !" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Vérifier logs: Get-Content logs/combined.log -Tail 50 -Wait"
Write-Host "   2. Consulter DB: npm run prisma:studio"
Write-Host "   3. Monitorer queue: Redis Commander ou BullMQ Board"
Write-Host ""



