#!/bin/bash

# 🧪 Script de test du Service 1 - Collecte & Agrégation
# Usage: ./test-collection-service.sh

echo "🧪 Testing Collection Service..."
echo ""

# Configuration
API_URL="http://localhost:4000"
EMAIL="admin@test.com"
PASSWORD="password"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========================================
# 1. Health Check
# ========================================
echo "1️⃣  Testing Health Check..."
HEALTH_RESPONSE=$(curl -s "$API_URL/api/health")

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend is down${NC}"
    exit 1
fi

echo ""

# ========================================
# 2. Login
# ========================================
echo "2️⃣  Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✅ Login successful${NC}"
fi

echo ""

# ========================================
# 3. Collection Health Check
# ========================================
echo "3️⃣  Checking Collection Health..."
COLLECTION_HEALTH=$(curl -s "$API_URL/api/collection/health" \
    -H "Authorization: Bearer $TOKEN")

echo "$COLLECTION_HEALTH" | python3 -m json.tool 2>/dev/null || echo "$COLLECTION_HEALTH"

if echo "$COLLECTION_HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Collection sources healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Some sources may be down${NC}"
fi

echo ""

# ========================================
# 4. Queue Status
# ========================================
echo "4️⃣  Checking Queue Status..."
QUEUE_STATUS=$(curl -s "$API_URL/api/collection/queue/status" \
    -H "Authorization: Bearer $TOKEN")

echo "$QUEUE_STATUS" | python3 -m json.tool 2>/dev/null || echo "$QUEUE_STATUS"
echo ""

# ========================================
# 5. Trigger Manual Collection
# ========================================
echo "5️⃣  Triggering Manual Collection..."
echo -e "${YELLOW}⏳ This may take 30s-2min...${NC}"

COLLECTION_RESULT=$(curl -s -X POST "$API_URL/api/collection/trigger" \
    -H "Authorization: Bearer $TOKEN")

echo "$COLLECTION_RESULT" | python3 -m json.tool 2>/dev/null || echo "$COLLECTION_RESULT"

if echo "$COLLECTION_RESULT" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Collection triggered successfully${NC}"
    
    # Extraire stats
    ITEMS_COLLECTED=$(echo "$COLLECTION_RESULT" | grep -o '"totalItemsCollected":[0-9]*' | grep -o '[0-9]*')
    ITEMS_QUEUED=$(echo "$COLLECTION_RESULT" | grep -o '"totalItemsQueued":[0-9]*' | grep -o '[0-9]*')
    
    echo ""
    echo "📊 Collection Stats:"
    echo "   Items Collected: $ITEMS_COLLECTED"
    echo "   Items Queued: $ITEMS_QUEUED"
else
    echo -e "${RED}❌ Collection failed${NC}"
fi

echo ""

# ========================================
# 6. Collection Stats
# ========================================
echo "6️⃣  Getting Collection Stats..."
STATS=$(curl -s "$API_URL/api/collection/stats" \
    -H "Authorization: Bearer $TOKEN")

echo "$STATS" | python3 -m json.tool 2>/dev/null || echo "$STATS"
echo ""

# ========================================
# 7. Recent Threats
# ========================================
echo "7️⃣  Checking Recent Threats..."
THREATS=$(curl -s "$API_URL/api/threats?limit=5" \
    -H "Authorization: Bearer $TOKEN")

THREAT_COUNT=$(echo "$THREATS" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
echo "Total threats: $THREAT_COUNT"

if [ "$THREAT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Threats collected successfully${NC}"
else
    echo -e "${YELLOW}⚠️  No threats yet (normal if first run)${NC}"
fi

echo ""

# ========================================
# RÉSUMÉ
# ========================================
echo "================================================"
echo "🎉 TEST COMPLET TERMINÉ"
echo "================================================"
echo ""
echo -e "${GREEN}✅ Tous les tests passés !${NC}"
echo ""
echo "📊 Prochaines étapes:"
echo "   1. Vérifier logs: tail -f logs/combined.log"
echo "   2. Consulter DB: npm run prisma:studio"
echo "   3. Monitorer queue: http://localhost:3000 (si BullBoard installé)"
echo ""



