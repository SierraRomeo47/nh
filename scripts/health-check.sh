#!/bin/bash
# Health check script for all Nautilus Horizon services
# Usage: ./scripts/health-check.sh [base-url]

BASE_URL=${1:-"http://localhost:8080"}

echo "Health Check for Nautilus Horizon Services"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check health endpoint
check_health() {
    local service=$1
    local endpoint=$2
    local url="$BASE_URL$endpoint"
    
    echo -n "Checking $service... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ Healthy (200)${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy ($response)${NC}"
        return 1
    fi
}

# Check gateway root
check_health "Gateway" "/"

# Check individual service health endpoints (if exposed)
# Note: These may not be directly accessible through gateway
# Adjust based on your nginx configuration

echo ""
echo "Service-specific health checks:"
check_health "Auth" "/auth/health"
check_health "Vessels" "/vessels/health"
check_health "Voyages" "/voyages/health"
check_health "Compliance" "/compliance/health"
check_health "Compliance-Ledger" "/compliance-ledger/health"
check_health "Trading" "/trading/health"
check_health "Insurance" "/insurance/health"
check_health "Master-Data" "/master-data/health"

echo ""
echo "Health check complete!"

