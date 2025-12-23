# Copilot Instructions for MVD Health Demo

> **EHDS-compliant Health Dataspace** demonstrating consent-gated EHR data exchange using Eclipse Dataspace Components (EDC), FHIR R4, and Verifiable Credentials.

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────────────────────────┐
│   Frontend  │────▶│ Backend-EDC │────▶│         EDC Infrastructure           │
│  (React)    │     │  (Express)  │     │  Consumer ◄──DSP──▶ Provider ◄──▶ EHR │
│  :3000/:4000│     │   :3002     │     │  :808x           :819x         :3001  │
└─────────────┘     └─────────────┘     └──────────────────────────────────────┘
```

**Three API modes** (via `VITE_API_MODE`):
- `mock` - Direct to backend-mock (default, no EDC needed)
- `hybrid` - EDC catalog + mock data (testing EDC integration)
- `full` - Complete EDC data flow (production-like)

## Quick Start

```bash
# Option A: Local dev (no Docker, ports 4000/4001)
cd backend-mock && npm run dev:local     # Terminal 1
cd frontend && npm run dev:local         # Terminal 2

# Option B: Full EDC stack (ports 3000/3001/3002)
./gradlew -Ppersistence=true build -x test
docker-compose -f docker-compose.health.yml -f docker-compose.edc.yml up --build
./seed-dataspace.sh --mode=docker --verbose  # After containers healthy
```

## Project Structure Essentials

### Frontend (`frontend/`)
- **Entry point**: `App-health.tsx` (NOT `App.tsx` - that's legacy)
- **API switching**: `services/apiFactory.ts` provides unified interface across all modes
- **Type generation**: `npm run generate:types` regenerates from `specs/*.yaml`
- **Component patterns**: React + TypeScript + Tailwind. See `components/EHRViewer.tsx` for data display, `CatalogCard.tsx` for asset cards
- **Mock data**: `services/mockData-health.ts` contains 20 synthetic EHR records

### Backend Services
| Service | Local Port | Docker Port | Key File |
|---------|------------|-------------|----------|
| backend-mock | 4001 | 3001 | `server-health.ts` (simulated FHIR) |
| backend-edc | - | 3002 | `server.ts` (EDC proxy) |

Both use Express + TypeScript. The `dev:local` scripts use different ports to allow simultaneous Docker runs.

### EDC Extensions (`extensions/`)
Java extensions following EDC SPI patterns (EDC version 0.14.1):
- `dcp-impl` - Decentralized Claims Protocol
- `catalog-node-resolver` - Federated catalog discovery
- `did-example-resolver` - Demo DID resolution
- Dependencies in `gradle/libs.versions.toml`

**Build**: `./gradlew build` (add `-Ppersistence=true` for Vault/Postgres support in Docker)

### Launcher Configurations (`launchers/`)
Pre-configured EDC runtime assemblies: `controlplane/`, `dataplane/`, `identity-hub/`, `catalog-server/`, `issuerservice/`

## Critical Patterns

### API Factory Pattern
```typescript
// frontend/src/services/apiFactory.ts
import { api, getApiMode } from './services/apiFactory';
const assets = await api.fetchCatalogAssets();  // Works in all modes
```

### EDC API Authentication
All Management APIs require: `X-Api-Key: password`
```bash
curl -X POST http://localhost:8191/api/management/v3/assets/request \
  -H "X-Api-Key: password" -H "Content-Type: application/json" \
  -d '{"offset": 0, "limit": 10}'
```

### Config-driven URLs
- `backend-edc/src/config.ts` - All EDC endpoints centralized
- `frontend/src/config.ts` - Frontend environment config

## Port Reference

| Service | Local | Docker | Description |
|---------|-------|--------|-------------|
| Frontend | 4000 | 3000 | React Vite dev server |
| Backend-Mock | 4001 | 3001 | Simulated FHIR backend |
| Backend-EDC | - | 3002 | EDC proxy service |
| Consumer Control Plane | - | 8081 | Management API |
| Provider Control Plane | - | 8191 | Management API |
| Consumer Identity Hub | - | 7082 | Credential presentation |
| Provider Identity Hub | - | 7092 | Credential presentation |

## Testing

```bash
# Frontend
cd frontend && npm run test              # Vitest unit tests
cd frontend && npm run test:e2e          # Playwright E2E
cd frontend && npm run test:pact         # Contract tests

# Java
./gradlew :tests:end2end:test            # E2E tests (RestAssured)
./gradlew check                          # Lint + tests
```

## Health Domain Standards

- **FHIR R4** with ISiK/KBV profiles (German health IT standards)
- **MedDRA v27.0** for adverse event classification
- **ODRL policies** in `specs/odrl-policies/*.schema.json`
- **HealthDCAT-AP** metadata serialization in `services/HealthDCATAPSerializer.ts`
- **Verifiable Credentials**: MembershipCredential, ConsentCredential

## Seeding Commands

```bash
./seed-dataspace.sh --mode=docker          # Full Docker seeding
./seed-dataspace.sh --mode=local           # IntelliJ local dev
./seed-dataspace.sh --mode=k8s             # Kubernetes (on-prem/cloud)
./seed-dataspace.sh --skip-identity        # Only health assets
./seed-dataspace.sh --verbose              # Debug output
```

## Observability Stack

Start with: `docker-compose -f docker-compose.observability.yml up -d`

| Tool | Port | Purpose |
|------|------|--------|
| Grafana | 3003 | Dashboards (admin/dataspace) |
| Prometheus | 9090 | Metrics collection |
| Jaeger | 16686 | Distributed tracing (OTLP) |
| Loki | 3100 | Log aggregation |
| Alertmanager | 9093 | Alert routing |

Pre-built dashboards in `observability/grafana/dashboards/`.

## ⚠️ Common Pitfalls

1. **Port conflicts**: Local dev uses 4000/4001; Docker uses 3000/3001/3002
2. **Wrong entry point**: Use `App-health.tsx`, not `App.tsx`
3. **Missing persistence flag**: Docker builds require `./gradlew -Ppersistence=true build`
4. **Container networking**: Inside Docker, use service names (`provider-controlplane`), not `localhost`
5. **Seeding timing**: Wait for containers to be healthy before running `seed-dataspace.sh`
6. **Type regeneration**: After changing `specs/*.yaml`, run `npm run generate:types`
7. **Grafana port**: Grafana runs on :3003 (not :3000) to avoid frontend conflict
8. **Docker volumes**: Don't use `docker-compose down -v` as it removes persistent data (Grafana dashboards, Postgres). Use `docker-compose down` or `docker-compose restart` instead
9. **Grafana dashboard persistence**: Dashboards in "Health Dataspace" folder are provisioned from JSON files. Export manual changes to `observability/grafana/dashboards/` and commit to git
