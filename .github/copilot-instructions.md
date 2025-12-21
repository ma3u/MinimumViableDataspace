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

**Three operating modes** (via `VITE_API_MODE`):
- `mock` - Direct to backend-mock (default, no EDC needed)
- `hybrid` - EDC catalog + mock data (testing EDC integration)
- `full` - Complete EDC data flow (production-like)

## Quick Start Commands

```bash
# Option A: Local dev (no Docker, ports 4000/4001)
cd backend-mock && npm run dev:local     # Terminal 1
cd frontend && npm run dev:local         # Terminal 2

# Option B: Full stack (ports 3000/3001/3002)
./gradlew -Ppersistence=true build -x test
docker-compose -f docker-compose.health.yml -f docker-compose.edc.yml up --build
./seed-dataspace.sh --mode=docker --verbose  # After containers healthy
```

## Key Patterns

### Frontend (React + TypeScript + Vite)
- **API switching**: `services/apiFactory.ts` - single interface for all modes
- **Types from OpenAPI**: Run `npm run generate:types` to regenerate from `specs/*.yaml`
- **Health-specific app**: Use `App-health.tsx`, not `App.tsx`
- **Testing**: Vitest for unit tests (`npm run test`), Playwright for E2E (`npm run test:e2e`)

### Backend Services
- **backend-mock** (:3001/:4001) - Simulated FHIR server with 20 EHR records
- **backend-edc** (:3002) - Middleware proxying to EDC Control Planes
- Both use Express + TypeScript. Use `dev:local` scripts for local dev to avoid port conflicts.

### EDC Extensions (Java)
Located in `extensions/`. Each follows EDC SPI pattern:
- `dcp-impl` - Decentralized Claims Protocol implementation
- `catalog-node-resolver` - Dynamic federated catalog discovery
- `did-example-resolver` - DID resolution for demo DIDs
- `superuser-seed` - Initial data seeding

**Build**: `./gradlew build` (add `-Ppersistence=true` for Docker/Vault support)

### API Authentication
All EDC Management APIs require: `X-Api-Key: password`
```bash
curl -X POST http://localhost:8191/api/management/v3/assets/request \
  -H "X-Api-Key: password" -H "Content-Type: application/json" \
  -d '{"offset": 0, "limit": 10}'
```

## Port Reference

| Service | Local | Docker | Purpose |
|---------|-------|--------|---------|
| Frontend | 4000 | 3000 | React UI |
| Backend-Mock | 4001 | 3001 | FHIR data |
| Backend-EDC | - | 3002 | EDC proxy |
| Consumer CP | - | 8081 | Control Plane |
| Provider CP | - | 8191 | Control Plane |
| Identity Hub | - | 7082/7092 | DID/VC |

## Data & Standards

- **FHIR R4** with ISiK/KBV profiles (German health IT)
- **MedDRA v27.0** for adverse event classification
- **ODRL policies** in `specs/odrl-policies/`
- **Verifiable Credentials** for consent and membership
- Records in `backend-mock/src/` - 20 synthetic patient records with clinical trial metadata

## Common Tasks

```bash
# Seeding (unified script)
./seed-dataspace.sh --mode=docker          # Full seeding
./seed-dataspace.sh --skip-identity        # Only health assets

# Testing
./gradlew :tests:end2end:test              # Java E2E tests
cd frontend && npm run test                # React unit tests
cd frontend && npm run test:pact           # Contract tests

# Troubleshooting
lsof -i:4000,4001                          # Check local ports
docker-compose -f docker-compose.health.yml logs -f  # Container logs
docker-compose -f docker-compose.health.yml down -v  # Clean reset
```

## ⚠️ Gotchas

1. **Port conflicts**: Local dev uses 4000/4001 to avoid Docker's 3000/3001/3002
2. **Hot reload**: Use `npm run dev:local` (ts-node), NOT `npm start` (compiled)
3. **Docker networking**: Inside containers use service names (`provider-controlplane`), not `localhost`
4. **Seeding order**: Wait for containers to be healthy before running seed scripts
5. **Persistence flag**: Required for Docker: `./gradlew -Ppersistence=true build`
