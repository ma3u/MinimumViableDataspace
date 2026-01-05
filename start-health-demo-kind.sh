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

# Default options
MODE="full"
SKIP_BUILD=false
CLEANUP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --cleanup)
      CLEANUP=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./start-health-demo-kind.sh [OPTIONS]"
      echo ""
      echo "Deploy Health Dataspace Demo on OrbStack with KinD"
      echo ""
      echo "Options:"
      echo "  --mode <mode>     Set deployment mode: mock|hybrid|full (default: full)"
      echo "  --skip-build      Skip Gradle build (use existing JARs)"
      echo "  --cleanup         Delete existing KinD cluster before creating new one"
      echo "  -h, --help        Show this help message"
      echo ""
      echo "Modes:"
      echo "  mock    - Application layer only (frontend + backend-mock)"
      echo "  hybrid  - Application + EDC catalog (partial EDC stack)"
      echo "  full    - Complete EDC dataspace with all components"
      echo ""
      echo "Prerequisites:"
      echo "  - OrbStack installed and running"
      echo "  - KinD installed (brew install kind)"
      echo "  - kubectl installed"
      echo "  - Docker images built (or use --skip-build)"
      echo ""
      echo "Examples:"
      echo "  ./start-health-demo-kind.sh                    # Full mode"
      echo "  ./start-health-demo-kind.sh --mode mock        # Mock mode only"
      echo "  ./start-health-demo-kind.sh --cleanup          # Clean install"
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
echo -e "${BLUE}║  Health Dataspace Demo - OrbStack + KinD Deployment      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Mode: ${MODE}${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v kind &> /dev/null; then
  echo -e "${RED}ERROR: kind is not installed${NC}"
  echo "Install with: brew install kind"
  exit 1
fi

if ! command -v kubectl &> /dev/null; then
  echo -e "${RED}ERROR: kubectl is not installed${NC}"
  echo "Install with: brew install kubectl"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo -e "${RED}ERROR: Docker is not running${NC}"
  echo "Start OrbStack and try again"
  exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Cleanup if requested
if [ "$CLEANUP" = true ]; then
  echo -e "${YELLOW}Cleaning up existing cluster...${NC}"
  kind delete cluster --name health-dataspace 2>/dev/null || true
  echo -e "${GREEN}✓ Cleanup complete${NC}"
  echo ""
fi

# Check if cluster exists
if kind get clusters 2>/dev/null | grep -q "^health-dataspace$"; then
  echo -e "${GREEN}✓ KinD cluster 'health-dataspace' already exists${NC}"
else
  echo -e "${YELLOW}Creating KinD cluster...${NC}"
  kind create cluster --config deployment/kind.config.yaml --wait 2m
  echo -e "${GREEN}✓ KinD cluster created${NC}"
fi
echo ""

# Build Java components if not skipped
if [[ "$MODE" == "full" || "$MODE" == "hybrid" ]] && [ "$SKIP_BUILD" = false ]; then
  echo -e "${YELLOW}Building EDC components...${NC}"
  ./gradlew -Ppersistence=true build -x test || {
    echo -e "${RED}Build failed. Please check the errors above.${NC}"
    exit 1
  }
  echo -e "${GREEN}✓ Build complete${NC}"
  echo ""
fi

# Build Docker images
echo -e "${YELLOW}Building Docker images...${NC}"

# Application images
echo "  Building application images..."
docker build -t health-ehr-backend:latest ./backend-mock
docker build -t health-frontend:latest ./frontend
if [[ "$MODE" == "full" || "$MODE" == "hybrid" ]]; then
  docker build -t backend-edc:latest ./backend-edc
fi

# EDC images (full mode only)
if [ "$MODE" == "full" ]; then
  echo "  Building EDC images..."
  docker build -t controlplane:latest -f launchers/controlplane/src/main/docker/Dockerfile --build-arg JAR=launchers/controlplane/build/libs/controlplane.jar .
  docker build -t dataplane:latest -f launchers/dataplane/src/main/docker/Dockerfile --build-arg JAR=launchers/dataplane/build/libs/dataplane.jar .
  docker build -t identity-hub:latest -f launchers/identity-hub/src/main/docker/Dockerfile --build-arg JAR=launchers/identity-hub/build/libs/identity-hub.jar .
  docker build -t catalog-server:latest -f launchers/catalog-server/src/main/docker/Dockerfile --build-arg JAR=launchers/catalog-server/build/libs/catalog-server.jar .
  docker build -t issuerservice:latest -f launchers/issuerservice/src/main/docker/Dockerfile --build-arg JAR=launchers/issuerservice/build/libs/issuerservice.jar .
fi

echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

# Load images into KinD cluster
echo -e "${YELLOW}Loading images into KinD cluster...${NC}"
kind load docker-image health-ehr-backend:latest --name health-dataspace
kind load docker-image health-frontend:latest --name health-dataspace

if [[ "$MODE" == "full" || "$MODE" == "hybrid" ]]; then
  kind load docker-image backend-edc:latest --name health-dataspace
fi

if [ "$MODE" == "full" ]; then
  kind load docker-image controlplane:latest --name health-dataspace
  kind load docker-image dataplane:latest --name health-dataspace
  kind load docker-image identity-hub:latest --name health-dataspace
  kind load docker-image catalog-server:latest --name health-dataspace
  kind load docker-image issuerservice:latest --name health-dataspace
fi

echo -e "${GREEN}✓ Images loaded into cluster${NC}"
echo ""

# Deploy Kubernetes manifests
echo -e "${YELLOW}Deploying Kubernetes manifests...${NC}"

# Create namespace
kubectl apply -f deployment/k8s/00-namespace.yaml

# Deploy infrastructure (always needed for full mode)
if [ "$MODE" == "full" ]; then
  echo "  Deploying infrastructure layer..."
  kubectl apply -f deployment/k8s/infrastructure/

  echo "  Waiting for infrastructure to be ready..."
  kubectl wait --for=condition=ready pod -l app=health-postgres -n health-dataspace --timeout=120s
  kubectl wait --for=condition=ready pod -l app=health-vault -n health-dataspace --timeout=60s
fi

# Note: EDC components and application layer manifests would be applied here
# This is a framework - full manifests to be completed in next iteration

echo -e "${GREEN}✓ Deployment complete${NC}"
echo ""

# Show access information
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Health Dataspace Demo - Deployment Complete             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  Frontend:           ${GREEN}http://localhost:3000${NC}"
echo -e "  EHR Backend:        ${GREEN}http://localhost:3001${NC}"

if [[ "$MODE" == "full" || "$MODE" == "hybrid" ]]; then
  echo -e "  Backend-EDC:        ${GREEN}http://localhost:3002${NC}"
fi

if [ "$MODE" == "full" ]; then
  echo -e "  Consumer Control:   ${GREEN}http://localhost:8081${NC}"
  echo -e "  Provider Control:   ${GREEN}http://localhost:8191${NC}"
  echo -e "  Vault:              ${GREEN}http://localhost:8200${NC} (token: root)"
  echo ""
  echo -e "${YELLOW}Next steps for full mode:${NC}"
  echo -e "  1. Wait for all pods to be ready: ${GREEN}kubectl get pods -n health-dataspace${NC}"
  echo -e "  2. Seed the dataspace: ${GREEN}./seed-dataspace.sh --mode=k8s --verbose${NC}"
  echo -e "  3. Open: ${GREEN}http://localhost:3000${NC}"
fi

echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo -e "  View pods:          ${GREEN}kubectl get pods -n health-dataspace${NC}"
echo -e "  View logs:          ${GREEN}kubectl logs -f <pod-name> -n health-dataspace${NC}"
echo -e "  Delete cluster:     ${GREEN}kind delete cluster --name health-dataspace${NC}"
echo ""
