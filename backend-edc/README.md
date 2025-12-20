# Backend EDC

Express server that proxies requests to EDC connectors for the Health Dataspace Demo.

## Overview

This service provides a REST API that:
- Proxies catalog requests to the EDC Consumer Control Plane
- Manages contract negotiations with the Provider
- Handles data transfers and EDR (Endpoint Data Reference) management
- Integrates with Identity Hub for credential verification

## Modes

The backend supports two operational modes:

### Hybrid Mode (Default)
- Uses EDC for catalog browsing and contract negotiation
- Falls back to mock backend for actual EHR data
- Best for development and testing EDC integration

### Full Mode
- All data flows through EDC connectors
- Requires complete EDC infrastructure running
- Used for production-like testing

## Development

```bash
# Install dependencies
npm install

# Start in hybrid mode (default)
npm run dev

# Explicit hybrid mode
npm run dev:hybrid

# Full EDC mode
npm run dev:full

# Build for production
npm run build

# Run production build
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3002 |
| `BACKEND_MODE` | `hybrid` or `full` | hybrid |
| `EDC_API_KEY` | API key for EDC endpoints | password |
| `CONSUMER_MANAGEMENT_URL` | Consumer Control Plane URL | http://localhost:8081 |
| `PROVIDER_MANAGEMENT_URL` | Provider Control Plane URL | http://localhost:8191 |
| `MOCK_BACKEND_URL` | Mock backend URL (hybrid mode) | http://localhost:3001 |

## API Endpoints

### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed status with dependency checks
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

### Catalog
- `GET /api/catalog` - Request catalog from provider via EDC
- `GET /api/catalog/assets` - Get transformed catalog assets
- `GET /api/catalog/cached` - Query cached catalogs from federated catalog

### Contract Negotiation
- `POST /api/negotiations` - Initiate contract negotiation
- `GET /api/negotiations` - List all negotiations
- `GET /api/negotiations/:id` - Get negotiation status
- `POST /api/negotiations/:id/poll` - Poll until terminal state
- `GET /api/negotiations/:id/agreement` - Get contract agreement

### Data Transfer
- `POST /api/transfers` - Initiate data transfer
- `GET /api/transfers` - List all transfers
- `GET /api/transfers/:id` - Get transfer status
- `POST /api/transfers/:id/poll` - Poll until terminal state
- `GET /api/transfers/:id/edr` - Get Endpoint Data Reference
- `GET /api/transfers/:id/data` - Fetch data via EDR

### EHR (Mode-aware)
- `GET /api/transfers/ehr/:id` - Fetch EHR record (uses hybrid/full mode logic)
- `POST /api/transfers/ehr/:id/transfer` - Initiate full EDC transfer for EHR

### Identity
- `GET /api/identity/participant` - Get participant info from Identity Hub
- `GET /api/identity/credentials` - List verifiable credentials
- `POST /api/identity/attestation/membership` - Submit membership attestation
- `POST /api/identity/attestation/consent` - Submit consent attestation
- `GET /api/identity/consent/:patientDid` - Check consent status
- `POST /api/identity/consent/:patientDid/revoke` - Revoke consent
- `GET /api/identity/provider/verify` - Verify provider membership

### Mode Info
- `GET /api/mode` - Get current mode and configuration

## Docker

```bash
# Build image
docker build -t backend-edc .

# Run in hybrid mode
docker run -p 3002:3002 \
  -e BACKEND_MODE=hybrid \
  -e MOCK_BACKEND_URL=http://host.docker.internal:3001 \
  backend-edc

# Run in full mode
docker run -p 3002:3002 \
  -e BACKEND_MODE=full \
  -e CONSUMER_MANAGEMENT_URL=http://consumer-controlplane:8081 \
  backend-edc
```

## Testing

```bash
# Run unit tests
npm test

# Verify Pact contracts
npm run test:pact:verify

# Generate TypeScript types from OpenAPI specs
npm run generate:types
```

## Architecture

```
backend-edc/
├── src/
│   ├── server.ts           # Express app setup
│   ├── config.ts           # Environment configuration
│   ├── routes/
│   │   ├── catalog.ts      # Catalog endpoints
│   │   ├── negotiation.ts  # Contract negotiation endpoints
│   │   ├── transfer.ts     # Data transfer endpoints
│   │   ├── identity.ts     # Identity Hub endpoints
│   │   └── health.ts       # Health check endpoints
│   └── services/
│       ├── edcClient.ts    # EDC Management API client
│       └── dataFetcher.ts  # Hybrid/full mode data fetching
└── Dockerfile
```

## Integration with Frontend

The frontend uses the `apiFactory.ts` service to switch between modes:

```typescript
// frontend/src/services/apiFactory.ts
import { api } from './apiFactory';

// Works in any mode - automatically routes to correct backend
const records = await api.getEhrList();
const ehr = await api.getEhr('EHR001');
```

Configure frontend mode via environment variables:
- `VITE_API_MODE=mock` - Direct mock backend
- `VITE_API_MODE=hybrid` - This backend in hybrid mode
- `VITE_API_MODE=full` - This backend in full mode
