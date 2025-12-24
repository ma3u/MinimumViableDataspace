# Health Data Exchange with High Privacy and Consent Management Demo

A comprehensive demonstration of secure, interoperable, and consent-managed access to health data for research (secondary use), aligned with the European Health Data Space (EHDS) and German Health Data Use Act (GDNG).

📚 **Documentation:**
- 📖 [**Implementation Plan**](docs/IMPLEMENTATION_PLAN.md) - Detailed step-by-step development guide from mock to production
- 👤 [**User Manual**](docs/USER-MANUAL.md) - End-user guide for browsing and accessing health data
- 🛠 [**Developer Manual**](docs/DEVELOPER-MANUAL.md) - Technical architecture and API reference

🐛 **Issue Tracking:**
- [#13 - Migrate to EDC Virtual-Connector for Multi-Tenancy](https://github.com/ma3u/MinimumViableDataspace/issues/13)
- [#10 - Phase 14: Monitoring & Debugging](https://github.com/ma3u/MinimumViableDataspace/issues/10)
- [#8 - Dataspace Insider View - Real-time DSP Protocol Visualization](https://github.com/ma3u/MinimumViableDataspace/issues/8)

[![EHDS Compliant](https://img.shields.io/badge/EHDS-EU%202025%2F327-blue)](https://eur-lex.europa.eu/eli/reg/2025/327)
[![DCAT-AP Health](https://img.shields.io/badge/DCAT--AP-Health-green)](https://healthdcat-ap.github.io/)
[![Dataspace Protocol](https://img.shields.io/badge/Dataspace-Protocol%202025-yellow)](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/)
[![EDC](https://img.shields.io/badge/Eclipse-Dataspace%20Components-white)](https://eclipse-edc.github.io/docs/)

## Purpose

This demo showcases how easy it is to create an **EHDS-compliant dataspace for health data** using the **Dataspace Protocol**. Built on **Eclipse Dataspace Components (EDC)**, it demonstrates:

- Secure, interoperable health data exchange aligned with the European Health Data Space (EHDS) regulation
- Consent-gated access using Verifiable Credentials and decentralized identity
- FHIR R4-compliant EHR data with clinical trial metadata, MedDRA classifications, and ADR tracking
- "Data Visiting" patterns for sensitive data (genomics, mental health) via Confidential Compute (DEMO ONLY)
- ODRL-based consent policies for fine-grained access control
- DCAT-AP for Health metadata for seamless data discovery and interoperability
- Flexible deployment modes: Mock backend, Hybrid EDC integration, Full EDC flow

🌐 **[Live Demo](https://ma3u.github.io/MinimumViableDataspace/)** (mock mode, no EDC required)


## Quick Start

### Three API Modes

The demo supports three modes for different use cases:

| Mode | Backend | EDC Stack | Use Case |
|------|---------|-----------|----------|
| **mock** | Mock data in frontend | ❌ Not needed | Quick demo, development, CI/CD |
| **hybrid** | backend-mock (FHIR) | ✅ Catalog only | Test EDC catalog integration |
| **full** | backend-mock + backend-edc | ✅ Complete flow | Full dataspace protocol demo |

### Option A: Mock Mode (Fastest - No EDC Required)

Perfect for quick demos and frontend development:

```bash
# Use the startup script
./start-health-demo.sh --mode mock

# OR manually:
cd backend-mock && npm install && npm run dev:health  # Terminal 1
cd frontend && npm install && npm run dev              # Terminal 2
```

Open http://localhost:4000 (local dev) or http://localhost:3000 (Docker)

### Option B: Full EDC Mode (Complete Dataspace Protocol)

For full dataspace demonstration with consent verification:

```bash
# Use the startup script (builds Java components automatically)
./start-health-demo.sh --mode full -d

# Wait for containers to be healthy
docker ps

# Seed the dataspace
./seed-dataspace.sh --mode=docker --verbose
```

Open http://localhost:3000

### Option C: Manual Full Setup

```bash
# Build Java components (requires persistence flag for Docker/Vault support)
./gradlew -Ppersistence=true build -x test

# Start all services
docker-compose -f docker-compose.health.yml -f docker-compose.edc.yml up --build

# In another terminal, seed the dataspace
./seed-dataspace.sh --mode=docker --verbose
```

Open http://localhost:3000

**Notes:**
- The script is macOS and Linux compatible (uses portable awk-based PEM handling).
- Legacy compatibility wrappers remain for convenience:
  - `./seed.sh` (local wrapper)
  - `./seed-docker.sh` (docker wrapper)

For details and advanced options, see [User Manual - Seeding](docs/USER-MANUAL.md#seeding-the-dataspace).

---

## Documentation

| Document | Description |
|----------|-------------|
| 📖 **[User Manual](docs/USER-MANUAL.md)** | Step-by-step guide for using the demo |
| 🔧 **[Developer Manual](docs/DEVELOPER-MANUAL.md)** | Architecture, APIs, and development guide |
| 🗺️ **[User Journey](docs/Health-EHR2EDC-UserJourney.md)** | Detailed EHR2EDC workflow documentation |

---

## Demo Scenario

The demo simulates secure health data exchange between:

- **Rheinland Universitätsklinikum** (Provider): Hospital holding patient EHR data
- **Nordstein Research Institute** (Consumer): CRO conducting clinical study
- **Patient**: Data subject who grants consent

```mermaid
flowchart LR
    subgraph Provider["Healthcare Provider"]
        EHR["EHR System"]
        DeID["De-Identification"]
    end
    
    subgraph Consumer["Research Organization"]
        EDC["EDC System"]
    end
    
    EHR --> DeID
    DeID -->|"Consent-Gated DSP"| EDC
```

---

## Architecture

### Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React catalog browser |
| Backend-Mock | 3001 | Simulated FHIR backend |
| Backend-EDC | 3002 | EDC proxy service |
| Consumer EDC | 8081 | Consumer control plane |
| Provider EDC | 8191 | Provider control plane |
| Pact Broker | 9292 | Contract testing |

### Operating Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Mock** | Direct mock data | Quick demos, offline |
| **Hybrid** | EDC catalog + mock data | Testing EDC integration |
| **Full** | Complete EDC flow | Production-like testing |

Configure via `VITE_API_MODE` environment variable.

---

## EDC Negotiation & Transfer Flow (DSP Protocol)

The Dataspace Protocol (DSP) defines how participants discover, negotiate, and transfer data. This demo implements the full DSP 2025 specification:

```mermaid
sequenceDiagram
    autonumber
    participant Frontend
    participant Consumer as Consumer EDC
    participant Provider as Provider EDC
    participant Backend as EHR Backend

    Note over Frontend,Backend: Phase 1: Catalog Discovery
    Frontend->>Consumer: POST /catalog/request
    Consumer->>Provider: CatalogRequestMessage + VP
    Provider-->>Consumer: CatalogMessage (DCAT)
    Consumer-->>Frontend: Asset list with policies

    Note over Frontend,Backend: Phase 2: Contract Negotiation
    Frontend->>Consumer: POST /contractnegotiations
    Consumer->>Provider: ContractRequestMessage + VP
    Provider->>Provider: Verify credentials, evaluate ODRL policy
    Provider-->>Consumer: ContractOfferMessage
    Consumer->>Provider: ContractNegotiationEventMessage (ACCEPTED)
    Provider-->>Consumer: ContractAgreementMessage
    Consumer->>Provider: ContractAgreementVerificationMessage
    Provider-->>Consumer: ContractNegotiationEventMessage (FINALIZED)

    Note over Frontend,Backend: Phase 3: Data Transfer (HTTP-PULL)
    Frontend->>Consumer: POST /transferprocesses
    Consumer->>Provider: TransferRequestMessage
    Provider-->>Consumer: TransferStartMessage + EDR (token)
    Consumer-->>Frontend: Endpoint Data Reference
    Frontend->>Provider: GET /public/{assetId} + Bearer token
    Provider->>Backend: Fetch EHR data (FHIR R4)
    Backend-->>Provider: De-identified health record
    Provider-->>Frontend: EHR JSON response
```

**Key DSP Messages:**

| Phase | Message | Direction | Purpose |
|-------|---------|-----------|---------|
| Catalog | `CatalogRequestMessage` | Consumer → Provider | Request available datasets |
| Catalog | `CatalogMessage` | Provider → Consumer | DCAT-AP catalog response |
| Negotiation | `ContractRequestMessage` | Consumer → Provider | Initiate negotiation with offer |
| Negotiation | `ContractAgreementMessage` | Provider → Consumer | Signed contract agreement |
| Transfer | `TransferRequestMessage` | Consumer → Provider | Request data transfer |
| Transfer | `TransferStartMessage` | Provider → Consumer | EDR with access token |

**Credential Verification:**
Each DSP message includes a Verifiable Presentation (VP) containing credentials issued by the dataspace authority. The provider verifies:
- `MembershipCredential` - Proves participant is a dataspace member
- `ConsentCredential` - Proves patient consent for data access (for health data)

---

## Key Features

- ✅ **EHDS Art. 51 Compliance** - Health categories and access rights
- ✅ **DCAT-AP for Health** - Metadata interoperability
- ✅ **FHIR R4** - ISiK and KBV profiles
- ✅ **Verifiable Credentials** - MembershipCredential, ConsentCredential
- ✅ **ODRL Policies** - Consent-based access control
- ✅ **Confidential Compute** - Data visiting for sensitive data
- ✅ **MedDRA v27.0** - Adverse event classification
- ✅ **Clinical Trial Phases** - Phase I-IV metadata

---
## Health Dataspace Demo - Startscreen

![alt text](image.png)

## Project Structure

```
MVD-health/
├── frontend/           # React frontend (port 3000)
├── backend-mock/       # Mock FHIR backend (port 3001)
├── backend-edc/        # EDC proxy service (port 3002)
├── extensions/         # Custom EDC extensions
├── launchers/          # EDC runtime configurations
├── database/           # Flyway migrations
├── specs/              # OpenAPI specifications
├── docs/               # Documentation
│   ├── USER-MANUAL.md
│   └── DEVELOPER-MANUAL.md
└── docker-compose.*.yml
```

---

## Development

```bash
# Build Java components
./gradlew build

# Run tests
./gradlew test
cd frontend && npm test

# Lint code
cd frontend && npm run lint
```

See [Developer Manual](docs/DEVELOPER-MANUAL.md) for detailed instructions.



## Standards & Compliance

| Standard | Implementation |
|----------|----------------|
| [EHDS Regulation (EU 2025/327)](https://eur-lex.europa.eu/eli/reg/2025/327) | Art. 50/51 categories, HDAB integration |
| [DCAT-AP for Health](https://healthdcat-ap.github.io/) | Full Release 5 compliance |
| [Dataspace Protocol](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol) | Catalog, negotiation, transfer |
| [FHIR R4](https://hl7.org/fhir/R4/) | Patient, Condition, Observation resources |
| [MedDRA v27.0](https://www.meddra.org/) | SOC/PT classification |
| [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) | Consent and membership credentials |
| [ODRL](https://www.w3.org/TR/odrl-model/) | Access control policies |

---

## Roadmap

🚀 **[EDC Virtual-Connector Migration](https://github.com/ma3u/MinimumViableDataspace/issues/13)** - Multi-tenancy support for 80% cost reduction at scale (100+ hospitals).

See [docs/issues/](docs/issues/) for detailed planning documents.

---

## License

This project is licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

---

## Contributing

1. Fork the repository with the branch health-demo:  https://github.com/ma3u/MinimumViableDataspace/tree/health-demo
2. Create a feature branch
3. Make your changes
4. Run tests: `./gradlew test && cd frontend && npm test`
5. Submit a pull request

See [Developer Manual](docs/DEVELOPER-MANUAL.md) for coding guidelines.
