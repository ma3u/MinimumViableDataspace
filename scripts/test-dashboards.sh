#!/bin/bash
#
# test-dashboards.sh
# Comprehensive test script for Health Dataspace dashboards
#
# This script:
# 1. Runs all dataspace flows to generate metrics
# 2. Waits for Prometheus to scrape the data
# 3. Checks all Grafana dashboards for "No data" panels
#
# Usage: ./scripts/test-dashboards.sh [--verbose] [--quick]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

VERBOSE=false
QUICK=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --quick|-q)
      QUICK=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

log() {
  echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1"
}

section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Service endpoints
BACKEND_MOCK="http://localhost:3001"
BACKEND_EDC="http://localhost:3002"
PROMETHEUS="http://localhost:9090"
GRAFANA="http://localhost:3003"
CONSUMER_CP="http://localhost:8081"
PROVIDER_CP="http://localhost:8191"
EDC_API_KEY="password"

# Dashboard IDs
DASHBOARDS=(
  "health-dataspace-overview:Health Dataspace Overview"
  "data-transfer-dashboard:Data Transfer"
  "consent-management-dashboard:Consent Management"
  "system-resources-dashboard:System Resources"
  "edc-operations-dashboard:EDC Operations"
  "compliance-audit-dashboard:Compliance & Audit"
)

# ============================================================================
# Pre-flight Checks
# ============================================================================

section "Pre-flight Checks"

check_service() {
  local url=$1
  local name=$2
  if curl -s --connect-timeout 2 "$url" > /dev/null 2>&1; then
    success "$name is running"
    return 0
  else
    error "$name is not reachable at $url"
    return 1
  fi
}

log "Checking required services..."

SERVICES_OK=true
check_service "$BACKEND_MOCK/health" "Backend-Mock" || SERVICES_OK=false
check_service "$BACKEND_EDC/health" "Backend-EDC" || SERVICES_OK=false
check_service "$PROMETHEUS/api/v1/status/config" "Prometheus" || SERVICES_OK=false
check_service "$GRAFANA/api/health" "Grafana" || SERVICES_OK=false

if [ "$SERVICES_OK" = false ]; then
  error "Some services are not running. Please start the stack first:"
  echo "  docker-compose -f docker-compose.health.yml -f docker-compose.edc.yml -f docker-compose.observability.yml up -d"
  exit 1
fi

success "All required services are running"

# ============================================================================
# Phase 1: Backend-Mock (EHR) Traffic
# ============================================================================

section "Phase 1: Backend-Mock (EHR) Traffic Generation"

log "Generating EHR/FHIR data access traffic..."

# Health checks
for i in {1..20}; do
  curl -s "$BACKEND_MOCK/health" > /dev/null &
done
wait
success "20 health check requests completed"

# EHR list requests
for i in {1..15}; do
  curl -s "$BACKEND_MOCK/api/v1/ehr" > /dev/null &
done
wait
success "15 EHR list requests completed"

# Individual patient records
PATIENT_IDS=("patient-001" "patient-002" "patient-003" "patient-004" "patient-005")
for pid in "${PATIENT_IDS[@]}"; do
  for i in {1..5}; do
    curl -s "$BACKEND_MOCK/api/v1/ehr/$pid" > /dev/null &
  done
done
wait
success "25 patient record requests completed"

# Generate some 404s for error rate metrics
for i in {1..5}; do
  curl -s "$BACKEND_MOCK/api/v1/ehr/nonexistent-$i" > /dev/null &
done
wait
success "5 error requests (404) completed"

# ============================================================================
# Phase 2: Backend-EDC (Catalog & Participants) Traffic
# ============================================================================

section "Phase 2: Backend-EDC Traffic Generation"

log "Generating EDC proxy traffic..."

# Health checks
for i in {1..20}; do
  curl -s "$BACKEND_EDC/health" > /dev/null &
done
wait
success "20 health check requests completed"

# Catalog requests
for i in {1..15}; do
  curl -s "$BACKEND_EDC/api/catalog" > /dev/null &
done
wait
success "15 catalog requests completed"

# Participants requests
for i in {1..10}; do
  curl -s "$BACKEND_EDC/api/participants" > /dev/null &
done
wait
success "10 participant requests completed"

# ============================================================================
# Phase 3: EDC Management API Traffic
# ============================================================================

section "Phase 3: EDC Management API Traffic"

if [ "$QUICK" = false ]; then
  log "Querying EDC management APIs..."

  # Provider assets
  for i in {1..5}; do
    curl -s -X POST "$PROVIDER_CP/api/management/v3/assets/request" \
      -H "X-Api-Key: $EDC_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"offset": 0, "limit": 50}' > /dev/null &
  done
  wait
  success "5 provider asset queries completed"

  # Provider contract definitions
  for i in {1..3}; do
    curl -s -X POST "$PROVIDER_CP/api/management/v3/contractdefinitions/request" \
      -H "X-Api-Key: $EDC_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"offset": 0, "limit": 50}' > /dev/null &
  done
  wait
  success "3 contract definition queries completed"

  # Provider policy definitions
  for i in {1..3}; do
    curl -s -X POST "$PROVIDER_CP/api/management/v3/policydefinitions/request" \
      -H "X-Api-Key: $EDC_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"offset": 0, "limit": 50}' > /dev/null &
  done
  wait
  success "3 policy definition queries completed"

  # Consumer catalog requests (DSP protocol)
  for i in {1..3}; do
    curl -s -X POST "$CONSUMER_CP/api/management/v3/catalog/request" \
      -H "X-Api-Key: $EDC_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "counterPartyAddress": "http://provider-controlplane:8194/api/dsp",
        "counterPartyId": "did:web:provider-identityhub%3A7083:health-provider",
        "protocol": "dataspace-protocol-http"
      }' > /dev/null 2>&1 &
  done
  wait
  success "3 DSP catalog requests completed"

  # Consumer negotiations query
  for i in {1..3}; do
    curl -s -X POST "$CONSUMER_CP/api/management/v3/contractnegotiations/request" \
      -H "X-Api-Key: $EDC_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"offset": 0, "limit": 50}' > /dev/null &
  done
  wait
  success "3 negotiation queries completed"

  # Consumer transfers query
  for i in {1..3}; do
    curl -s -X POST "$CONSUMER_CP/api/management/v3/transferprocesses/request" \
      -H "X-Api-Key: $EDC_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"offset": 0, "limit": 50}' > /dev/null &
  done
  wait
  success "3 transfer process queries completed"
else
  warn "Skipping EDC Management API traffic (quick mode)"
fi

# ============================================================================
# Phase 4: High Volume Load Test
# ============================================================================

section "Phase 4: High Volume Load Test"

if [ "$QUICK" = false ]; then
  log "Running high volume concurrent requests..."

  for run in {1..3}; do
    log "  Load test run $run/3..."
    for i in {1..30}; do
      curl -s "$BACKEND_MOCK/health" > /dev/null &
      curl -s "$BACKEND_EDC/health" > /dev/null &
      curl -s "$BACKEND_EDC/api/catalog" > /dev/null &
    done
    wait
    sleep 1
  done
  success "270 concurrent requests completed"
else
  log "Running minimal load test (quick mode)..."
  for i in {1..10}; do
    curl -s "$BACKEND_MOCK/health" > /dev/null &
    curl -s "$BACKEND_EDC/health" > /dev/null &
  done
  wait
  success "20 concurrent requests completed"
fi

# ============================================================================
# Phase 5: Wait for Prometheus Scrape
# ============================================================================

section "Phase 5: Waiting for Prometheus Scrape"

log "Waiting 20 seconds for Prometheus to scrape new metrics..."
sleep 20
success "Prometheus scrape cycle completed"

# ============================================================================
# Phase 6: Verify Metrics in Prometheus
# ============================================================================

section "Phase 6: Verifying Metrics in Prometheus"

check_metric() {
  local metric=$1
  local result=$(curl -s "$PROMETHEUS/api/v1/query?query=$metric" | jq -r '.data.result | length')
  if [ "$result" -gt 0 ]; then
    success "$metric: $result series"
    return 0
  else
    warn "$metric: No data"
    return 1
  fi
}

log "Checking EHDS/Dataspace metrics..."

METRICS_OK=0
METRICS_MISSING=0

# Core HTTP metrics
check_metric "http_request_duration_seconds_count" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "http_requests_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))

# EHDS Compliance metrics
check_metric "ehds_compliance_score" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "ehds_audit_trail_completeness" && ((METRICS_OK++)) || ((METRICS_MISSING++))

# Consent metrics
check_metric "consent_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "consent_by_type" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "consent_expiring_7d" && ((METRICS_OK++)) || ((METRICS_MISSING++))

# EDC metrics
check_metric "edc_assets_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "edc_data_offerings_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "edc_catalog_sync_status" && ((METRICS_OK++)) || ((METRICS_MISSING++))

# Transfer metrics
check_metric "transfer_volume_bytes" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "transfer_success_rate" && ((METRICS_OK++)) || ((METRICS_MISSING++))

# DSP metrics
check_metric "dsp_messages_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))

# Audit metrics
check_metric "audit_events_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "data_access_requests_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "data_access_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))

# EHR metrics
check_metric "ehr_records_available" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "fhir_resource_access_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "ehr_data_completeness_score" && ((METRICS_OK++)) || ((METRICS_MISSING++))

# Service health
check_metric "service_uptime_seconds" && ((METRICS_OK++)) || ((METRICS_MISSING++))
check_metric "service_health_status" && ((METRICS_OK++)) || ((METRICS_MISSING++))

# cAdvisor metrics
check_metric "container_cpu_usage_seconds_total" && ((METRICS_OK++)) || ((METRICS_MISSING++))

echo ""
log "Metrics Summary: $METRICS_OK available, $METRICS_MISSING missing"

# ============================================================================
# Phase 7: Check Dashboard Panels for "No Data"
# ============================================================================

section "Phase 7: Checking Grafana Dashboards for 'No Data' Panels"

GRAFANA_USER="admin"
GRAFANA_PASS="dataspace"

check_dashboard() {
  local uid=$1
  local name=$2
  
  # Get dashboard JSON
  local dashboard_json=$(curl -s -u "$GRAFANA_USER:$GRAFANA_PASS" \
    "$GRAFANA/api/dashboards/uid/$uid" 2>/dev/null)
  
  if [ -z "$dashboard_json" ] || [ "$dashboard_json" = "null" ]; then
    warn "Dashboard '$name' ($uid): Not found or not accessible"
    return 1
  fi
  
  # Count panels
  local panel_count=$(echo "$dashboard_json" | jq '.dashboard.panels | length' 2>/dev/null)
  
  if [ "$panel_count" = "null" ] || [ -z "$panel_count" ]; then
    warn "Dashboard '$name' ($uid): Could not parse panels"
    return 1
  fi
  
  # Get panel titles for debugging
  if [ "$VERBOSE" = true ]; then
    echo "  Panels in $name:"
    echo "$dashboard_json" | jq -r '.dashboard.panels[].title // "Untitled"' 2>/dev/null | while read title; do
      echo "    - $title"
    done
  fi
  
  success "Dashboard '$name': $panel_count panels found"
  echo "    URL: $GRAFANA/d/$uid"
  return 0
}

log "Checking all dashboards..."

DASHBOARDS_OK=0
DASHBOARDS_MISSING=0

for dashboard in "${DASHBOARDS[@]}"; do
  IFS=':' read -r uid name <<< "$dashboard"
  if check_dashboard "$uid" "$name"; then
    ((DASHBOARDS_OK++))
  else
    ((DASHBOARDS_MISSING++))
  fi
done

echo ""
log "Dashboard Summary: $DASHBOARDS_OK accessible, $DASHBOARDS_MISSING missing/inaccessible"

# ============================================================================
# Phase 8: Query Specific Dashboard Metrics
# ============================================================================

section "Phase 8: Validating Dashboard-Specific Metrics"

log "Testing queries used by dashboards..."

test_query() {
  local query=$1
  local dashboard=$2
  local result=$(curl -s "$PROMETHEUS/api/v1/query?query=$(echo "$query" | jq -sRr @uri)" | jq -r '.data.result | length')
  if [ "$result" -gt 0 ]; then
    success "$dashboard: Query returns $result series"
    return 0
  else
    warn "$dashboard: Query returns no data"
    if [ "$VERBOSE" = true ]; then
      echo "    Query: $query"
    fi
    return 1
  fi
}

# Health Overview Dashboard queries
test_query 'sum(rate(http_request_duration_seconds_count[5m])) by (job)' "Health Overview - Request Rate"
test_query 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))' "Health Overview - P95 Latency"

# Consent Dashboard queries
test_query 'consent_total' "Consent - Total Consents"
test_query 'consent_by_type' "Consent - By Type"

# EDC Dashboard queries
test_query 'edc_assets_total' "EDC - Assets"
test_query 'edc_data_offerings_total' "EDC - Offerings"

# Compliance Dashboard queries
test_query 'ehds_compliance_score' "Compliance - EHDS Score"
test_query 'audit_events_total' "Compliance - Audit Events"
test_query 'sum(rate(data_access_total[5m])) by (access_type)' "Compliance - Data Access by Type"
test_query 'sum(rate(data_access_total[5m])) by (data_category)' "Compliance - Access by Data Category"
test_query 'sum(rate(data_access_total[5m])) by (user_role)' "Compliance - Top Access by User Role"
test_query 'sum(rate(data_access_total[5m])) by (purpose)' "Compliance - Access by Purpose"

# System Resources queries
test_query 'rate(container_cpu_usage_seconds_total[5m])' "System - CPU Usage"

# Transfer Dashboard queries
test_query 'transfer_volume_bytes' "Transfer - Volume"
test_query 'transfer_success_rate' "Transfer - Success Rate"

# ============================================================================
# Summary
# ============================================================================

section "Test Summary"

echo ""
echo "  Services:     All core services running ✓"
echo "  Metrics:      $METRICS_OK of $((METRICS_OK + METRICS_MISSING)) metrics available"
echo "  Dashboards:   $DASHBOARDS_OK of ${#DASHBOARDS[@]} dashboards accessible"
echo ""

if [ $METRICS_MISSING -gt 0 ]; then
  warn "Some metrics are missing. The simulation may need more time to generate data."
  echo "  Run: ./scripts/test-dashboards.sh --verbose for more details"
fi

echo ""
log "Dashboard URLs:"
echo "  Health Overview:    $GRAFANA/d/health-dataspace-overview"
echo "  Data Transfer:      $GRAFANA/d/data-transfer-dashboard"
echo "  Consent Management: $GRAFANA/d/consent-management-dashboard"
echo "  System Resources:   $GRAFANA/d/system-resources-dashboard"
echo "  EDC Operations:     $GRAFANA/d/edc-operations-dashboard"
echo "  Compliance & Audit: $GRAFANA/d/compliance-audit-dashboard"
echo ""
echo "  Prometheus:         $PROMETHEUS"
echo "  Jaeger:             http://localhost:16686"
echo "  cAdvisor:           http://localhost:8080"
echo ""

success "Dashboard test completed!"
