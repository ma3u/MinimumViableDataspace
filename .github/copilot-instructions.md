# Copilot Instructions for MVD Health Demo

This repository contains the **Minimum Viable Dataspace (MVD) Health Demo**, a comprehensive demonstration of secure, interoperable, and consent-managed access to health data (EHR2EDC) using Eclipse Dataspace Components (EDC). This demo showcases the extraction of consent-gated Electronic Health Records (EHR) into an Electronic Data Capture (EDC) system for clinical research, emphasizing strong privacy, granular consent management, and data sovereignty.

## 📋 Context & Purpose

### European Health Data Space (EHDS)
This demo aligns with EHDS regulations, German Health Data Use Act (GDNG), and initiatives like Sphin-X and Prometheus-X. It demonstrates:
- Secure secondary use of health data for research
- Decentralized "Data Visiting" (Compute-to-Data)
- FHIR R4 compliance with ISiK and KBV profiles
- Granular consent management using Verifiable Credentials

### Demo Scenario
Simulates **Rheinland Universitätsklinikum** (Healthcare Provider) securely sharing patient EHR data with **Nordstein Research Institute** (Research Organization) for a clinical study, with full patient consent control.

## 🏗 Architecture & Structure

The project is a multi-module Gradle project with a React frontend, Node.js backend mock, and Docker orchestration.

### Directory Structure
- **Core Components** (EDC-based):
  - `launchers/`: Entry points for EDC services (Control Plane, Data Plane, Identity Hub, Catalog Server, Issuer Service)
  - `extensions/`: Custom EDC extensions (`dcp-impl`, `catalog-node-resolver`, `did-example-resolver`, `superuser-seed`)
  - `tests/end2end/`: End-to-end integration tests
  - `tests/performance/`: Performance benchmarking
- **Frontend**: `frontend/` (React, Vite, Tailwind CSS)
  - Catalog browser with multi-dimensional filtering
  - EHR viewer with FHIR-compliant data display
  - Clinical trial metadata, MedDRA classifications, ADR tracking
- **Backend Mock**: `backend-mock/` (Node.js, Express, TypeScript)
  - Simulates FHIR R4-compliant EHR system
  - 20 anonymized patient records with clinical trial metadata
- **API Specifications**: `specs/` (OpenAPI 3.1, JSON Schema)
  - `edc-management-api.yaml`: EDC Management API v3 with HealthDCAT-AP extensions
  - `ehr-health-api.yaml`: Backend EHR API with FHIR R4 schemas
  - `identity-hub-api.yaml`: Identity Hub API for DID/VC management
  - `odrl-policies/`: JSON schemas for ODRL policy validation (membership, consent, sensitive, confidential-compute)
- **Infrastructure**:
  - `docker-compose.health.yml`: Main orchestration file for health demo
  - `deployment/`: Terraform configurations (K8s deployment, unused for local Docker)
- **Configuration**: `config/` contains environment variables, participant definitions, and EDC settings

### Technology Stack
- **Java**: Temurin 17+ (EDC runtimes are Java-based)
- **Node.js**: 18+ or 20+ (Frontend & backend)
- **Build System**: Gradle (Kotlin DSL) for Java components, npm for Node.js components
- **Deployment**: Docker Compose (local), Kubernetes (production via Terraform)

## 🛠 Developer Workflows

### 1. Local Development Setup

#### Prerequisites
- Java 17+ (Temurin recommended)
- Node.js 18+ or 20+
- Docker & Docker Compose
- Gradle (via `gradlew` wrapper)

#### Starting Backend Mock (EHR Server)
The backend mock simulates a FHIR R4-compliant EHR system with 20 anonymized patient records.

```bash
cd backend-mock
npm install                  # First time only
npm run dev:local           # Start on port 4001 (no Docker conflict)
# OR
npm run dev:health          # Start on port 3001 (conflicts with Docker)
```

**Important**: Use `npm run dev:local` (port 4001) to avoid conflicts with Docker containers.

**Local mode (Option A)** runs on **http://localhost:4001**
**Docker mode (Option B)** runs on **http://localhost:3001**

**Verify backend:**
```bash
curl http://localhost:4001/health  # Option A: local
curl http://localhost:3001/health  # Option B: Docker
# Expected: {"status":"healthy","service":"ehr2edc-backend","recordsCount":20}
```

**Available endpoints:**
- `GET /health` - Health check
- `GET /api/ehr` - List all EHR records
- `GET /api/ehr/:id` - Get specific EHR record (e.g., EHR001)

#### Starting Frontend (React App)
The frontend provides catalog browser and EHR viewer with advanced filtering.

```bash
cd frontend
npm install                  # First time only
npm run dev:local           # Start on port 4000 (no Docker conflict)
# OR
npm run dev                 # Start on port 3000 (conflicts with Docker)
```

**Local mode (Option A)** runs on **http://localhost:4000**
**Docker mode (Option B)** runs on **http://localhost:3000**

**Development commands:**
```bash
npm run lint                # Run ESLint
npm run build               # Production build
npm run preview             # Preview production build
```

#### Starting Both Services (Options)

Both options can run **simultaneously** on different ports.

**Option A: Local development (ports 4000/4001) - No Docker required**
```bash
# Terminal 1: Backend
cd backend-mock && npm run dev:local

# Terminal 2: Frontend  
cd frontend && npm run dev:local
# Open http://localhost:4000
```

**Option B: Docker Compose (ports 3000/3001/3002 - full stack)**
```bash
# Start frontend + backend + all EDC infrastructure
docker-compose -f docker-compose.health.yml up --build

# Run in detached mode
docker-compose -f docker-compose.health.yml up -d --build

# View logs
docker-compose -f docker-compose.health.yml logs -f

# Stop all services
docker-compose -f docker-compose.health.yml down
# Open http://localhost:3000

# Clean volumes (removes all data)
docker-compose -f docker-compose.health.yml down -v
```

**After Docker services are running, seed the dataspace:**
```bash
# Wait for all containers to be healthy (check logs)
docker-compose -f docker-compose.health.yml logs -f

# Seed everything (identity + health data) - Docker mode
./seed-dataspace.sh --mode=docker

# Or seed only health data (if identity already seeded)
./seed-dataspace.sh --mode=docker --skip-identity
```

### 2. Building EDC Components

```bash
# Build all Java components
./gradlew build

# Build with Docker images (requires persistence for provided docker-compose)
./gradlew -Ppersistence=true build dockerize

# Build with persistence enabled
./gradlew -Ppersistence=true build

# Run end-to-end tests
./gradlew :tests:end2end:test

# Run performance tests
./gradlew :tests:performance:test
```

### 3. Common Development Tasks

#### Seeding Data
```bash
# Unified seeding script (recommended)
./seed-dataspace.sh --help                    # Show all options
./seed-dataspace.sh --mode=docker             # Docker mode (identity + health)
./seed-dataspace.sh --mode=local              # Local/IntelliJ mode
./seed-dataspace.sh --mode=k8s                # Kubernetes mode
./seed-dataspace.sh --skip-identity           # Skip identity seeding
./seed-dataspace.sh --skip-health             # Skip health asset seeding

# Legacy wrapper scripts (deprecated, call seed-dataspace.sh internally)
./seed.sh                                     # Local identity only
./seed-health.sh                              # Docker health data only
./seed-docker.sh                              # Docker identity only
./seed-k8s.sh                                 # Kubernetes mode
```

#### Cleaning Ports
If you encounter "port already in use" errors:
```bash
# Check what's using ports (local development)
lsof -i:4000,4001

# Check what's using ports (Docker)
lsof -i:3000,3001,3002

# Kill processes on local ports
kill $(lsof -ti:4000,4001)

# Kill processes on Docker ports
kill $(lsof -ti:3000,3001,3002)
```

#### Troubleshooting

**Backend not serving updated data:**
- Ensure you're using `npm run dev:local` (port 4001) or `npm run dev:health` (port 3001)
- Check that the port is not occupied: `lsof -i:4001` or `lsof -i:3001`

**Frontend shows blank page:**
- Check browser console for errors (F12)
- Verify Vite dev server started on correct port (4000 for local, 3000 for Docker)
- Restart Vite: `pkill -f vite && cd frontend && npm run dev:local`

**TypeScript compilation errors:**
- Run `npm install` to ensure dependencies are up to date
- Clear dist folder: `rm -rf backend-mock/dist`

**Docker services not starting:**
- Check logs: `docker-compose -f docker-compose.health.yml logs -f`
- Clean volumes: `docker-compose -f docker-compose.health.yml down -v`
- Rebuild: `docker-compose -f docker-compose.health.yml up --build`

## 👤 User Manual

### Accessing the Demo

Once all services are running, access the demo through:

**Main Application:**
- **Frontend UI**: http://localhost:3000/
  - Browse EHR catalog with multi-dimensional filtering
  - View detailed FHIR-compliant health records
  - See clinical trial metadata, MedDRA classifications, ADRs, and anamnesis

**Backend API:**
- **Backend Health Check**: http://localhost:3001/health
- **EHR Records**: http://localhost:3001/api/ehr
- **Specific Record**: http://localhost:3001/api/ehr/EHR001

**EDC Management APIs** (require auth header: `X-Api-Key: password`):
- **Provider Management**: http://localhost:8191/api/management/v3/
  - Assets: `/assets`
  - Policies: `/policydefinitions`
  - Catalog: `/catalog`
- **Consumer Management**: http://localhost:8081/api/management/v3/
  - Catalog Request: `/catalog/request`
  - Contract Negotiations: `/contractnegotiations`
  - Transfer Processes: `/transferprocesses`

**Identity & Credentials:**
- **Provider IdentityHub**: http://localhost:7092/api/identity
- **Consumer IdentityHub**: http://localhost:7082/api/identity
- **Issuer Service**: http://localhost:10012/api/issuance

### Demo Workflow

Follow the interactive demo at http://localhost:3000/:

1. **Start Demo**: Click "Start Demo" button on the landing page
2. **Browse Catalog**: Use filters to find EHR datasets:
   - Medical Category (Cardiology, Oncology, etc.)
   - Age Band (18-24, 25-34, etc.)
   - Study Phase (Phase I-IV)
   - MedDRA SOC (System Organ Class)
   - Text search (diagnosis, ICD codes, phase, MedDRA terms)
3. **Select Record**: Click on an EHR card to select it
4. **Request Consent Verification**: Proceed to contract negotiation
5. **Review Contract**: See the DSP contract negotiation flow
6. **Transfer Data**: Initiate secure data transfer with de-identification
7. **View EHR**: Explore the complete FHIR record with:
   - Patient demographics and vital signs
   - Clinical trial information (phase, protocol, endpoints)
   - MedDRA classification (SOC and Preferred Terms)
   - Signal verification and Adverse Drug Reactions
   - 5-step Anamnesis (medical history)
   - Raw FHIR JSON (expandable)

### User Journey

This demo implements the following clinical research workflow:

**2.1 Pre-Enrollment (Patient Onboarding)**
- Patient receives study information and DID wallet link
- Verifies Issuer DID and obtains Membership credentials

**2.2 Study Enrollment and Consent Capture**
- Patient reviews protocol-specific consent
- Issuer issues **ConsentCredential** to Patient DID

**2.3 Consent Verification and Policy Provisioning**
- Consumer queries catalog
- Provider evaluates policies using IdentityHub
- Access granted only if ConsentCredential matches study purpose

**2.4 EHR Data Discovery and Eligibility Screening**
- Consumer submits criteria (ICD-10, age range)
- Provider responds with aggregate counts (privacy-preserving)

**2.5 Contract Negotiation and Data Transfer Setup**
- Consumer requests contract with credentials
- Provider returns ContractAgreement and EndpointDataReference (EDR)

**2.6 De-identification and Provenance**
- Provider's dataplane runs de-identification pipeline
- **Provenance VC** records transformation steps

**2.7 EDC Ingestion and Study Data Lock**
- Consumer fetches de-identified FHIR Bundle
- Transforms to CDISC SDTM/ODM standards
- Loads into EDC system with audit trail

**2.8 Re-consent and Revocation**
- Patient can update or revoke consent
- Provider enforces recall obligations
- Downstream consumers notified via policy webhook

### Advanced Features

**Multi-dimensional Filtering:**
- Combine filters with AND logic (all conditions must match)
- Active filters displayed as removable chips
- "Clear all" button resets all filters
- Search includes: diagnosis, ICD codes, phase names, MedDRA terms, age bands

**Clinical Trial Metadata:**
- **Phase**: Phase I-IV with descriptions
- **MedDRA v27.0**: System Organ Class (SOC) with 10-digit codes, Preferred Terms (PT)
- **ADRs**: Adverse Drug Reactions with severity, relatedness, causality, outcome
- **Anamnesis**: 5-step medical history (Chief Complaint, HPI, PMH, Family History, Social History)

**FHIR Compliance:**
- Patient resources with demographics
- Condition resources with ICD-10-GM codes
- Observation resources (vital signs, lab results)
- Procedure and Medication resources
- Extensions for clinical trial and safety data

### Example API Calls

```bash
# Query provider catalog from consumer
curl -X POST http://localhost:8081/api/management/v3/catalog/request \
  -H "X-Api-Key: password" \
  -H "Content-Type: application/json" \
  -d '{
    "counterPartyAddress": "http://localhost:8192/api/dsp",
    "protocol": "dataspace-protocol-http"
  }'

# Get EHR record with clinical trial data
curl http://localhost:3001/api/ehr/EHR001 | jq '.credentialSubject | {
  diagnosis: .diagnosis,
  clinicalPhase: .clinicalTrialNode.phase,
  medDRA: .medDRANode.primarySOC.name,
  adrCount: .signalVerificationNode.adverseEvents | length
}'

# Check provider assets
curl -X POST http://localhost:8191/api/management/v3/assets/request \
  -H "X-Api-Key: password" \
  -H "Content-Type: application/json" \
  -d '{"offset": 0, "limit": 10}'
```

## 🧩 Key Patterns & Conventions

- **EDC Extensions**: Custom logic is implemented as EDC extensions in `extensions/`. Use the `spi` module for interfaces and `src/main/java` for implementation.
- **Gradle Kotlin DSL**: All build scripts use `.kts`. Dependencies are managed in `gradle/libs.versions.toml`.
- **Docker Networking**: Services communicate via the Docker network defined in `docker-compose.health.yml`. Use service names (e.g., `provider-controlplane`) for inter-service communication.
- **Data Seeding**: The `seed-health.sh` script uses `curl` to interact with the Management APIs of the EDC connectors. Use this as a reference for API usage.
- **FHIR R4**: All health data follows FHIR R4 standard with ISiK and KBV profiles.
- **Verifiable Credentials**: Uses W3C VC Data Model for consent and membership credentials.

## 🔌 Integration Points

### EDC Management APIs
- **Provider Control Plane**: `http://localhost:8191/api/management/v3`
- **Consumer Control Plane**: `http://localhost:8081/api/management/v3`
- **Authentication**: All management APIs require header `X-Api-Key: password`

### Identity & Trust
- **Provider IdentityHub**: `http://localhost:7092/api/identity` (ports 7090-7096)
- **Consumer IdentityHub**: `http://localhost:7082/api/identity` (ports 7080-7086)
- **Issuer Service**: `http://localhost:10012/api/issuance` (ports 10010-10015)
- Manages Verifiable Credentials (VCs) for consent and membership

### Data Sources
- **Backend Mock**: `http://localhost:3001` (or `http://backend-mock:3001` inside Docker)
- Simulates FHIR R4-compliant EHR system
- 20 anonymized patient records with clinical trial metadata

### Catalog & Discovery
- **Catalog Server**: `http://localhost:8091` (ports 8091-8096)
- Federated asset catalog for data discovery
- Supports multi-dimensional queries

## ⚠️ Gotchas & Important Notes

### Startup & Initialization
- **Wait for Startup**: Ensure all services are healthy before running `seed-health.sh`. Check logs with `docker-compose -f docker-compose.health.yml logs -f`.
- **Seeding Order**: Run `./seed.sh` first for basic setup, then `./seed-health.sh` for EHR-specific data.
- **Backend Requirement**: `seed-health.sh` requires backend mock running on port 3001.

### Port Management
- **Port Conflicts**: Be aware of port mappings in `docker-compose.health.yml`. Use `lsof -i:PORT` to check conflicts.
- **Frontend**: Runs on port 3000 (NOT 3001)
- **Backend**: Runs on port 3001
- **EDC Services**: Use various ports (8081, 8191, 7080-7096, 10010-10015, etc.)

### Development Workflow
- **Hot Reload**: Use `npm run dev:health` for backend (ts-node), NOT `npm run start:health` (compiled).
- **Clean State**: If you encounter issues, try `docker-compose -f docker-compose.health.yml down -v` to clean volumes.
- **API Authentication**: All EDC management API calls require `X-Api-Key: password` header.
- **Docker Networking**: Inside Docker, use service names (e.g., `provider-controlplane`, `backend-mock`) instead of `localhost`.

### Data & Testing
- **Anonymized Data**: All 20 patient records are fully anonymized and synthetic.
- **Clinical Trial Metadata**: Each record includes phase, MedDRA classifications, ADRs, and anamnesis.
- **FHIR Compliance**: Data follows FHIR R4 with ISiK (German hospital IT systems) and KBV (Kassenärztliche Bundesvereinigung) profiles.
