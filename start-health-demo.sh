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

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default mode
MODE="mock"
DETACH=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --mode)
      MODE="$2"
      shift 2
      ;;
    -d|--detach)
      DETACH="-d"
      shift
      ;;
    -h|--help)
      echo "Usage: ./start-health-demo.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --mode <mode>     Set API mode: mock|hybrid|full (default: mock)"
      echo "  -d, --detach      Run in detached mode"
      echo "  -h, --help        Show this help message"
      echo ""
      echo "Modes:"
      echo "  mock    - Standalone demo with mock data (fast, no EDC needed)"
      echo "  hybrid  - EDC catalog + mock data (requires EDC stack)"
      echo "  full    - Complete EDC integration (requires EDC stack + seeding)"
      echo ""
      echo "Examples:"
      echo "  ./start-health-demo.sh                    # Mock mode (standalone)"
      echo "  ./start-health-demo.sh --mode full        # Full EDC integration"
      echo "  ./start-health-demo.sh --mode full -d     # Full mode in background"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Validate mode
if [[ ! "$MODE" =~ ^(mock|hybrid|full)$ ]]; then
  echo -e "${RED}Invalid mode: $MODE${NC}"
  echo "Valid modes: mock, hybrid, full"
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Health Dataspace Demo - EHR to EDC Integration           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Build the Java components if running EDC mode
if [[ "$MODE" == "full" || "$MODE" == "hybrid" ]]; then
  echo -e "${YELLOW}Building EDC components...${NC}"
  ./gradlew -Ppersistence=true build -x test || {
    echo -e "${RED}Build failed. Please check the errors above.${NC}"
    exit 1
  }
  echo -e "${GREEN}✓ Build complete${NC}"
  echo ""
fi

# Prepare docker-compose command
COMPOSE_CMD="docker-compose -f docker-compose.health.yml"

if [[ "$MODE" == "full" || "$MODE" == "hybrid" ]]; then
  COMPOSE_CMD="$COMPOSE_CMD -f docker-compose.edc.yml"
  
  # Set environment variable for the frontend
  export VITE_API_MODE="$MODE"
  
  echo -e "${BLUE}Starting Health Demo + EDC Stack (mode: $MODE)...${NC}"
else
  echo -e "${BLUE}Starting Health Demo in Mock Mode (standalone)...${NC}"
fi

# Stop any existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
$COMPOSE_CMD down 2>/dev/null || true

# Start the services
echo -e "${YELLOW}Starting services...${NC}"
$COMPOSE_CMD up --build $DETACH

# If running in full mode and not detached, remind about seeding
if [[ "$MODE" == "full" && -z "$DETACH" ]]; then
  echo ""
  echo -e "${YELLOW}Note: For full EDC mode, run seeding after containers are healthy:${NC}"
  echo -e "${GREEN}./seed-dataspace.sh --mode=docker --verbose${NC}"
fi

# Show access URLs
if [[ -n "$DETACH" ]]; then
  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  Services Started Successfully (Mode: $MODE)              ${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}Access URLs:${NC}"
  echo -e "  Frontend:           ${GREEN}http://localhost:3000${NC}"
  echo -e "  EHR Backend:        ${GREEN}http://localhost:3001${NC}"
  
  if [[ "$MODE" == "full" || "$MODE" == "hybrid" ]]; then
    echo -e "  Backend-EDC:        ${GREEN}http://localhost:3002${NC}"
    echo -e "  Consumer Control:   ${GREEN}http://localhost:8081${NC}"
    echo -e "  Provider Control:   ${GREEN}http://localhost:8191${NC}"
    echo ""
    echo -e "${YELLOW}Next steps for full mode:${NC}"
    echo -e "  1. Wait for containers to be healthy: ${GREEN}docker ps${NC}"
    echo -e "  2. Seed the dataspace: ${GREEN}./seed-dataspace.sh --mode=docker --verbose${NC}"
    echo -e "  3. Open: ${GREEN}http://localhost:3000${NC}"
  else
    echo ""
    echo -e "  Open: ${GREEN}http://localhost:3000${NC}"
  fi
  
  echo ""
  echo -e "${BLUE}To view logs:${NC} docker-compose -f docker-compose.health.yml logs -f"
  echo -e "${BLUE}To stop:${NC}      docker-compose -f docker-compose.health.yml down"
fi
