#!/bin/bash
#
#  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
#
#  This program and the accompanying materials are made available under the
#  terms of the Apache License, Version 2.0 which is available at
#  https://www.apache.org/licenses/LICENSE-2.0
#
#  SPDX-License-Identifier: Apache-2.0
#

# Start Full EDC Stack for Health Dataspace Demo
#
# This script starts the complete EDC infrastructure including:
# - Consumer EDC (Control Plane + Data Plane + Identity Hub)
# - Provider EDC (Control Plane + Data Plane + Identity Hub)  
# - Federated Catalog Server
# - Issuer Service
# - PostgreSQL databases
# - Backend EDC proxy service
# - Pact Broker
#
# Usage:
#   ./start-edc-stack.sh           # Start all services
#   ./start-edc-stack.sh --build   # Force rebuild
#   ./start-edc-stack.sh --down    # Stop all services
#   ./start-edc-stack.sh --clean   # Stop and remove volumes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_banner() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}    Health Dataspace - EDC Stack Launcher${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

# Parse arguments
BUILD_FLAG=""
DOWN_FLAG=""
CLEAN_FLAG=""

for arg in "$@"; do
    case $arg in
        --build)
            BUILD_FLAG="--build"
            ;;
        --down)
            DOWN_FLAG="true"
            ;;
        --clean)
            CLEAN_FLAG="true"
            ;;
        *)
            echo "Unknown argument: $arg"
            echo "Usage: $0 [--build] [--down] [--clean]"
            exit 1
            ;;
    esac
done

print_banner

# Handle --down flag
if [ "$DOWN_FLAG" = "true" ]; then
    log_info "Stopping EDC stack..."
    docker-compose -f docker-compose.health.yml -f docker-compose.edc.yml down
    log_success "EDC stack stopped"
    exit 0
fi

# Handle --clean flag
if [ "$CLEAN_FLAG" = "true" ]; then
    log_info "Stopping EDC stack and removing volumes..."
    docker-compose -f docker-compose.health.yml -f docker-compose.edc.yml down -v
    log_success "EDC stack stopped and volumes removed"
    exit 0
fi

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Java build is needed
if [ ! -f "launchers/controlplane/build/libs/controlplane.jar" ]; then
    log_warn "EDC launchers not built. Building with Gradle..."
    ./gradlew -Ppersistence=true build -x test
    log_success "Gradle build complete"
fi

# Start the stack
log_info "Starting EDC stack..."
docker-compose -f docker-compose.health.yml -f docker-compose.edc.yml up -d $BUILD_FLAG

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."

wait_for_service() {
    local name=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "^[23]"; then
            log_success "$name is healthy"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_warn "$name is not responding (may still be starting)"
    return 1
}

echo ""
log_info "Checking service health (this may take a minute)..."

# Wait for key services
wait_for_service "Backend Mock" "http://localhost:3001/health" 30
wait_for_service "Backend EDC" "http://localhost:3002/health" 30
wait_for_service "Consumer Control Plane" "http://localhost:8081/api/management/v3/assets/request" 60 || true
wait_for_service "Provider Control Plane" "http://localhost:8191/api/management/v3/assets/request" 60 || true
wait_for_service "Frontend" "http://localhost:3000" 30

echo ""
log_success "EDC Stack Started!"
echo ""

echo "Services available at:"
echo "  📱 Frontend:                http://localhost:3000"
echo "  🔌 Backend Mock:            http://localhost:3001"
echo "  🔌 Backend EDC:             http://localhost:3002"
echo "  🛡️  Consumer Control Plane: http://localhost:8081"
echo "  🛡️  Provider Control Plane: http://localhost:8191"
echo "  📋 Catalog Server:          http://localhost:8091"
echo "  🪪 Consumer Identity Hub:   http://localhost:7082"
echo "  🪪 Provider Identity Hub:   http://localhost:7092"
echo "  📜 Issuer Service:          http://localhost:10012"
echo "  🧪 Pact Broker:             http://localhost:9292"
echo ""

log_info "Next steps:"
echo "  1. Wait for all services to be healthy"
echo "  2. Seed the dataspace using the unified script: ./seed-dataspace.sh --mode=docker"
echo "     Use --skip-identity or --skip-health to run only parts of the seeding flow"
echo "  3. Open http://localhost:3000 to use the demo"
echo ""

log_info "To view logs:     docker-compose -f docker-compose.health.yml -f docker-compose.edc.yml logs -f"
log_info "To stop:          ./start-edc-stack.sh --down"
log_info "To clean:         ./start-edc-stack.sh --clean"
echo ""
