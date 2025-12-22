#!/usr/bin/env bash
#
# setup-observability.sh - Unified Observability Stack Setup for Health Dataspace
#
# Sets up Prometheus, Grafana, Jaeger, Loki, and all monitoring tools.
# Can run standalone or alongside the main health/EDC stack.
#
# Usage:
#   ./scripts/setup-observability.sh [OPTIONS]
#
# Options:
#   --start             Start all observability services
#   --stop              Stop all observability services
#   --restart           Restart all observability services
#   --status            Show status of all services
#   --test              Run comprehensive test of all tools
#   --logs [service]    Show logs (optionally for specific service)
#   --clean             Stop and remove all data volumes
#   --help              Show this help message
#
# Examples:
#   ./scripts/setup-observability.sh --start
#   ./scripts/setup-observability.sh --status
#   ./scripts/setup-observability.sh --logs grafana
#   ./scripts/setup-observability.sh --test
#

set -eo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Compose file
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.observability.yml"

# ============================================================
# Utility Functions
# ============================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_header() {
    echo -e "\n${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}\n"
}

check_prerequisites() {
    log_header "Checking Prerequisites"
    
    local missing=0
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        missing=1
    else
        log_success "Docker is installed: $(docker --version)"
    fi
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        missing=1
    else
        log_success "Docker Compose is installed: $(docker compose version --short)"
    fi
    
    # Check compose file exists
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "Compose file not found: $COMPOSE_FILE"
        missing=1
    else
        log_success "Compose file found: $COMPOSE_FILE"
    fi
    
    # Check required config directories
    local configs=(
        "$PROJECT_ROOT/observability/prometheus/prometheus.yml"
        "$PROJECT_ROOT/observability/grafana/provisioning"
        "$PROJECT_ROOT/observability/loki/loki-config.yml"
    )
    
    for config in "${configs[@]}"; do
        if [[ ! -e "$config" ]]; then
            log_warning "Config not found: $config"
        fi
    done
    
    if [[ $missing -eq 1 ]]; then
        log_error "Prerequisites check failed"
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

# ============================================================
# Service Management Functions
# ============================================================

ensure_network() {
    # Ensure the health network exists (needed before observability stack)
    local network_name="mvd-health_health-network"
    if ! docker network inspect "$network_name" &> /dev/null; then
        log_info "Creating network: $network_name"
        docker network create "$network_name"
        log_success "Network created"
    else
        log_info "Network already exists: $network_name"
    fi
}

start_services() {
    log_header "Starting Observability Stack"
    
    check_prerequisites
    ensure_network
    
    cd "$PROJECT_ROOT"
    
    log_info "Starting services..."
    docker compose -f "$COMPOSE_FILE" up -d
    
    log_info "Waiting for services to be healthy..."
    sleep 5
    
    # Wait for key services with direct container names
    local max_wait=60
    local waited=0
    local containers="tools-prometheus tools-grafana tools-jaeger tools-loki"
    
    while [[ $waited -lt $max_wait ]]; do
        local healthy=0
        local total=4
        
        for container in $containers; do
            if docker ps --filter "name=$container" --filter "status=running" --format "{{.Names}}" 2>/dev/null | grep -q "$container"; then
                healthy=$((healthy + 1))
            fi
        done
        
        if [[ $healthy -eq $total ]]; then
            break
        fi
        
        sleep 2
        waited=$((waited + 2))
        echo -n "."
    done
    echo ""
    
    show_status
    show_urls
}

stop_services() {
    log_header "Stopping Observability Stack"
    
    cd "$PROJECT_ROOT"
    docker compose -f "$COMPOSE_FILE" down
    
    log_success "All services stopped"
}

restart_services() {
    log_header "Restarting Observability Stack"
    stop_services
    start_services
}

show_status() {
    log_header "Service Status"
    
    printf "%-15s %-20s %-10s %-8s\n" "SERVICE" "CONTAINER" "STATUS" "PORT"
    printf "%-15s %-20s %-10s %-8s\n" "-------" "---------" "------" "----"
    
    # Check each service individually
    check_service_status "prometheus" "tools-prometheus" "9090"
    check_service_status "grafana" "tools-grafana" "3003"
    check_service_status "jaeger" "tools-jaeger" "16686"
    check_service_status "loki" "tools-loki" "3100"
    check_service_status "alertmanager" "tools-alertmanager" "9093"
    check_service_status "cadvisor" "tools-cadvisor" "8080"
    check_service_status "promtail" "tools-promtail" "N/A"
}

check_service_status() {
    local service="$1"
    local container="$2"
    local port="$3"
    
    if docker ps --filter "name=$container" --filter "status=running" --format "{{.Names}}" 2>/dev/null | grep -q "$container"; then
        printf "%-15s %-20s ${GREEN}%-10s${NC} %-8s\n" "$service" "$container" "running" "$port"
    elif docker ps -a --filter "name=$container" --format "{{.Names}}" 2>/dev/null | grep -q "$container"; then
        printf "%-15s %-20s ${RED}%-10s${NC} %-8s\n" "$service" "$container" "stopped" "$port"
    else
        printf "%-15s %-20s ${YELLOW}%-10s${NC} %-8s\n" "$service" "$container" "not found" "$port"
    fi
}

show_urls() {
    log_header "Access URLs"
    
    echo "  📊 Grafana:      http://localhost:3003  (admin/dataspace)"
    echo "  📈 Prometheus:   http://localhost:9090"
    echo "  🔍 Jaeger:       http://localhost:16686"
    echo "  📋 Loki:         http://localhost:3100"
    echo "  🚨 Alertmanager: http://localhost:9093"
    echo "  📦 cAdvisor:     http://localhost:8080"
    echo ""
}

show_logs() {
    local service="${1:-}"
    
    cd "$PROJECT_ROOT"
    
    if [[ -n "$service" ]]; then
        log_info "Showing logs for: $service"
        docker compose -f "$COMPOSE_FILE" logs -f "$service"
    else
        log_info "Showing logs for all services (Ctrl+C to exit)"
        docker compose -f "$COMPOSE_FILE" logs -f
    fi
}

clean_all() {
    log_header "Cleaning Observability Stack"
    
    log_warning "This will remove all containers AND data volumes!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT"
        docker compose -f "$COMPOSE_FILE" down -v
        log_success "All containers and volumes removed"
    else
        log_info "Clean cancelled"
    fi
}

# ============================================================
# Testing Functions
# ============================================================

run_tests() {
    log_header "Running Observability Tests"
    
    local passed=0
    local failed=0
    
    # Test 1: Prometheus health
    log_info "Testing Prometheus..."
    if curl -sf "http://localhost:9090/-/healthy" > /dev/null 2>&1; then
        log_success "Prometheus is healthy"
        passed=$((passed + 1))
    else
        log_error "Prometheus health check failed"
        failed=$((failed + 1))
    fi
    
    # Test 2: Prometheus metrics availability
    log_info "Testing Prometheus metrics..."
    local metric_count=$(curl -sf "http://localhost:9090/api/v1/targets" 2>/dev/null | jq '.data.activeTargets | length' 2>/dev/null || echo 0)
    if [[ "$metric_count" -gt 0 ]]; then
        log_success "Prometheus has $metric_count active targets"
        passed=$((passed + 1))
    else
        log_warning "No active Prometheus targets found"
        failed=$((failed + 1))
    fi
    
    # Test 3: Grafana health
    log_info "Testing Grafana..."
    if curl -sf "http://localhost:3003/api/health" > /dev/null 2>&1; then
        log_success "Grafana is healthy"
        passed=$((passed + 1))
    else
        log_error "Grafana health check failed"
        failed=$((failed + 1))
    fi
    
    # Test 4: Grafana dashboards
    log_info "Testing Grafana dashboards..."
    local dashboard_count=$(curl -sf "http://admin:dataspace@localhost:3003/api/search?type=dash-db" 2>/dev/null | jq 'length' 2>/dev/null || echo 0)
    if [[ "$dashboard_count" -gt 0 ]]; then
        log_success "Grafana has $dashboard_count dashboards"
        passed=$((passed + 1))
    else
        log_warning "No Grafana dashboards found"
        failed=$((failed + 1))
    fi
    
    # Test 5: Jaeger health
    log_info "Testing Jaeger..."
    if curl -sf "http://localhost:16686/api/services" > /dev/null 2>&1; then
        log_success "Jaeger is healthy"
        passed=$((passed + 1))
    else
        log_error "Jaeger health check failed"
        failed=$((failed + 1))
    fi
    
    # Test 6: Jaeger services (after apps are running)
    log_info "Testing Jaeger traces..."
    local service_count=$(curl -sf "http://localhost:16686/api/services" 2>/dev/null | jq '.data | length' 2>/dev/null || echo 0)
    if [[ "$service_count" -gt 1 ]]; then
        log_success "Jaeger has $service_count services with traces"
        passed=$((passed + 1))
    else
        log_warning "Only $service_count service(s) in Jaeger (run app services for more traces)"
        # Don't count as failed - apps may not be running
    fi
    
    # Test 7: Loki health (use metrics endpoint as ready may not be exposed)
    log_info "Testing Loki..."
    if curl -sf "http://localhost:3100/ready" > /dev/null 2>&1 || curl -sf "http://localhost:3100/metrics" > /dev/null 2>&1; then
        log_success "Loki is healthy"
        passed=$((passed + 1))
    else
        log_error "Loki health check failed"
        failed=$((failed + 1))
    fi
    
    # Test 8: Alertmanager health
    log_info "Testing Alertmanager..."
    if curl -sf "http://localhost:9093/-/healthy" > /dev/null 2>&1; then
        log_success "Alertmanager is healthy"
        passed=$((passed + 1))
    else
        log_error "Alertmanager health check failed"
        failed=$((failed + 1))
    fi
    
    # Test 9: Key metrics from backend services
    log_info "Testing backend metrics..."
    local key_metrics=(
        "http_requests_total"
        "data_access_total"
        "contract_negotiations_total"
        "ehds_consent_requests_total"
    )
    
    local metrics_found=0
    for metric in "${key_metrics[@]}"; do
        local result=$(curl -sf "http://localhost:9090/api/v1/query?query=$metric" 2>/dev/null | jq '.data.result | length' 2>/dev/null || echo 0)
        if [[ "$result" -gt 0 ]]; then
            metrics_found=$((metrics_found + 1))
        fi
    done
    
    if [[ $metrics_found -gt 0 ]]; then
        log_success "Found $metrics_found/${#key_metrics[@]} key metrics"
        passed=$((passed + 1))
    else
        log_warning "No backend metrics found (start backend services first)"
    fi
    
    # Summary
    log_header "Test Summary"
    echo -e "  ${GREEN}Passed:${NC} $passed"
    echo -e "  ${RED}Failed:${NC} $failed"
    echo ""
    
    if [[ $failed -eq 0 ]]; then
        log_success "All core tests passed!"
        return 0
    else
        log_warning "Some tests failed - check service status"
        return 1
    fi
}

# ============================================================
# Dashboard shortcuts
# ============================================================

show_dashboards() {
    log_header "Available Grafana Dashboards"
    
    local dashboards=$(curl -sf "http://admin:dataspace@localhost:3003/api/search?type=dash-db" 2>/dev/null || echo "[]")
    
    if [[ "$dashboards" == "[]" ]] || [[ -z "$dashboards" ]]; then
        log_warning "Could not fetch dashboards (is Grafana running?)"
        return 1
    fi
    
    echo "Available dashboards:"
    echo "$dashboards" | jq -r '.[] | "  📊 \(.title) -> http://localhost:3003\(.url)"'
    echo ""
}

# ============================================================
# Help
# ============================================================

show_help() {
    cat << EOF
Observability Stack Setup for Health Dataspace
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This script manages the complete observability stack including:
  • Prometheus (metrics collection)
  • Grafana (dashboards & visualization)
  • Jaeger (distributed tracing)
  • Loki (log aggregation)
  • Promtail (log shipping)
  • Alertmanager (alert routing)
  • cAdvisor (container metrics)

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --start             Start all observability services
    --stop              Stop all observability services
    --restart           Restart all services
    --status            Show status of all services
    --test              Run comprehensive health tests
    --logs [service]    Show logs (all or specific service)
    --dashboards        List available Grafana dashboards
    --clean             Stop services and remove data volumes
    --help              Show this help message

EXAMPLES:
    # Start the observability stack
    $0 --start

    # Check service status
    $0 --status

    # Run all tests
    $0 --test

    # View Grafana logs
    $0 --logs grafana

    # View all logs
    $0 --logs

SERVICES & PORTS:
    Prometheus:    http://localhost:9090
    Grafana:       http://localhost:3003  (admin/dataspace)
    Jaeger:        http://localhost:16686
    Loki:          http://localhost:3100
    Alertmanager:  http://localhost:9093
    cAdvisor:      http://localhost:8080

COMBINING WITH HEALTH STACK:
    # Start health stack first (creates required network)
    docker-compose -f docker-compose.health.yml up -d

    # Then start observability
    $0 --start

    # Or combine in one command
    docker-compose -f docker-compose.health.yml -f docker-compose.observability.yml up -d

EOF
}

# ============================================================
# Main
# ============================================================

main() {
    cd "$PROJECT_ROOT"
    
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi
    
    case "$1" in
        --start)
            start_services
            ;;
        --stop)
            stop_services
            ;;
        --restart)
            restart_services
            ;;
        --status)
            show_status
            show_urls
            ;;
        --test)
            run_tests
            ;;
        --logs)
            show_logs "${2:-}"
            ;;
        --dashboards)
            show_dashboards
            ;;
        --clean)
            clean_all
            ;;
        --help|-h)
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

main "$@"
