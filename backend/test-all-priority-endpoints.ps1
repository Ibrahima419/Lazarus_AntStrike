# Test automatique des endpoints prioritaires
# Usage: .\test-all-priority-endpoints.ps1

$BASE_URL = "http://localhost:4000"
$TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzOGNlYmFlZC0xMGM0LTQ5ZWItYWM5MC1kMDc5NzFhYjliZWMiLCJ0ZW5hbnRJZCI6IjczM2U0NGMwLTNiNTMtNDFhYS05MTFmLTg4YTRmYjJiYTdkZiIsImlhdCI6MTc2MTA1OTMyOCwiZXhwIjoxNzYxMDg4MTI4fQ.93RO6Hryo-2OEFsGl2FbZr49awWcifEdMIow2UZZbvQ"

$results = @()
$tested = 0
$success = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    $script:tested++
    Write-Host "`n[$script:tested] Testing: $Name" -ForegroundColor Cyan
    Write-Host "    URL: $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = @{ Authorization = "Bearer $TOKEN" }
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201 -or $response.StatusCode -eq 202) {
            Write-Host "    OK ($($response.StatusCode))" -ForegroundColor Green
            $script:success++
            return @{ Name = $Name; Status = "OK"; Code = $response.StatusCode }
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "404") {
            Write-Host "    NOT FOUND (404)" -ForegroundColor Red
            $script:failed++
            return @{ Name = $Name; Status = "404"; Code = 404 }
        }
        elseif ($errorMsg -match "500") {
            Write-Host "    SERVER ERROR (500)" -ForegroundColor Red
            $script:failed++
            return @{ Name = $Name; Status = "500"; Code = 500 }
        }
        elseif ($errorMsg -match "401") {
            Write-Host "    UNAUTHORIZED (401)" -ForegroundColor Yellow
            $script:failed++
            return @{ Name = $Name; Status = "401"; Code = 401 }
        }
        else {
            Write-Host "    ERROR" -ForegroundColor Red
            $script:failed++
            return @{ Name = $Name; Status = "Error"; Code = 0 }
        }
    }
}

Write-Host "`n================================================" -ForegroundColor Magenta
Write-Host "  TEST AUTOMATIQUE : 20 ENDPOINTS PRIORITAIRES" -ForegroundColor Magenta
Write-Host "================================================`n" -ForegroundColor Magenta

# COLLECTION
Write-Host "`n-------- COLLECTION ORCHESTRATOR --------" -ForegroundColor Yellow
$results += Test-Endpoint "Collection Stats" "$BASE_URL/api/collection/stats"
$results += Test-Endpoint "Collection Health" "$BASE_URL/api/collection/health"
$results += Test-Endpoint "Collection History" "$BASE_URL/api/collection/history"
$results += Test-Endpoint "Trigger Taranis" "$BASE_URL/api/collection/trigger/taranis" "POST" @{}

# TAXII
Write-Host "`n-------- TAXII 2.1 SERVER --------" -ForegroundColor Yellow
$results += Test-Endpoint "TAXII Discovery" "$BASE_URL/taxii/"
$results += Test-Endpoint "TAXII Collection Details" "$BASE_URL/taxii/collections/indicators"
$results += Test-Endpoint "TAXII Objects" "$BASE_URL/taxii/collections/indicators/objects"
$results += Test-Endpoint "TAXII Stats" "$BASE_URL/taxii/stats"

# STIX
Write-Host "`n-------- STIX 2.1 --------" -ForegroundColor Yellow
$stixBundle = @{ type = "bundle"; id = "bundle--test"; objects = @() }
$results += Test-Endpoint "STIX Validate" "$BASE_URL/api/stix/validate" "POST" $stixBundle
$results += Test-Endpoint "STIX Import" "$BASE_URL/api/stix/import" "POST" $stixBundle

# THREAT FEEDS
Write-Host "`n-------- THREAT FEEDS --------" -ForegroundColor Yellow
$results += Test-Endpoint "Threat Feeds List" "$BASE_URL/api/threat-feeds"
$results += Test-Endpoint "Threat Feeds Stats" "$BASE_URL/api/threat-feeds/stats"

# OSINT FEEDS
Write-Host "`n-------- OSINT FEEDS --------" -ForegroundColor Yellow
$feed = @{ name = "Test Feed"; url = "https://example.com/feed.json"; type = "json"; enabled = $true }
$results += Test-Endpoint "OSINT Create Feed" "$BASE_URL/api/osint-feeds" "POST" $feed

# DARK WEB
Write-Host "`n-------- DARK WEB MONITORING --------" -ForegroundColor Yellow
$results += Test-Endpoint "Dark Web Search" "$BASE_URL/api/darkweb/search?keywords=ransomware"

# TARANIS EXTRA
Write-Host "`n-------- TARANIS MODULES EXTRA --------" -ForegroundColor Yellow
$results += Test-Endpoint "Product Types" "$BASE_URL/api/taranis/publish/product-types"
$results += Test-Endpoint "Report Types" "$BASE_URL/api/taranis/analyze/report-types"
$results += Test-Endpoint "Roles" "$BASE_URL/api/taranis/config/roles"

# RESULTATS
Write-Host "`n`n================================================" -ForegroundColor Green
Write-Host "             RESULTATS FINAUX" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "STATISTIQUES :" -ForegroundColor Cyan
Write-Host "   Endpoints testes    : $tested" -ForegroundColor White
$successRate = if($tested -gt 0){[math]::Round($success/$tested*100,1)}else{0}
$failRate = if($tested -gt 0){[math]::Round($failed/$tested*100,1)}else{0}
Write-Host "   Succes              : $success ($successRate%)" -ForegroundColor Green
Write-Host "   Echecs              : $failed ($failRate%)`n" -ForegroundColor Red

Write-Host "DETAILS :" -ForegroundColor Cyan
$results | ForEach-Object {
    $statusDisplay = $_.Status.PadRight(8)
    Write-Host "   $statusDisplay $($_.Name)" -ForegroundColor White
}

Write-Host "`nTest automatique termine !`n" -ForegroundColor Green



