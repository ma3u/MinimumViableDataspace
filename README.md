# Minimum Viable Dataspace (MVD)

## BLUEPRINT for Building Domain-Specific Dataspaces

A reusable template and methodology for creating production-grade, compliant dataspaces across any domain using Eclipse Dataspace Components (EDC), Decentralized Claims Protocol (DCP), and specification-driven development.

[![EDC](https://img.shields.io/badge/Eclipse-Dataspace%20Components-white)](https://eclipse-edc.github.io/docs/)
[![DCP](https://img.shields.io/badge/Protocol-DCP-blue)](https://github.com/eclipse-tractusx/identity-trust)
[![DSP](https://img.shields.io/badge/Dataspace-Protocol%202025-yellow)](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/)

---

## What is MVD?

**Minimum Viable Dataspace (MVD)** is a **template repository** that provides the essential infrastructure, patterns, and methodology for building domain-specific dataspaces. It is NOT a finished product—it's a foundation you customize and extend for your specific use case.

### Key Characteristics

- ✅ **Template, Not a Product**: Core EDC infrastructure without domain-specific implementations
- ✅ **BLUEPRINT Methodology**: Phase-based development workflow with GitHub issue tracking
- ✅ **Specification-Driven**: OpenAPI specs drive code generation and compliance testing
- ✅ **Production-Ready Patterns**: Kubernetes deployment, observability, security best practices
- ✅ **Multi-Domain Support**: Branch-based strategy for health, aerospace, manufacturing, etc.

### What You Get

| Component | Description | Customization Required |
|-----------|-------------|------------------------|
| **EDC Runtimes** | Controlplane, Dataplane, IdentityHub, Catalog Server, Issuer Service | Minimal - works out of box |
| **Custom Extensions** | DCP implementation, catalog resolver, DID resolver | Configure for your identity model |
| **Deployment Templates** | IntelliJ configs, Kubernetes/Terraform, Docker Compose | Adjust ports/resources |
| **Specification Framework** | GitHub Spec Kit templates, ODRL policies, OpenAPI schemas | **Replace with your domain** |
| **Documentation** | BLUEPRINT methodology, cloud deployment guide, SDD instructions | Extend with domain specifics |
| **Seeding Scripts** | Identity/credential creation, asset registration | **Replace with your assets** |

---

## Quick Start: Create Your Domain-Specific Dataspace

### Step 1: Fork or Branch This Repository

**Option A: Fork for Independent Project**
```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/MinimumViableDataspace.git
cd MinimumViableDataspace
```

**Option B: Create Domain Branch (Recommended)**
```bash
# Clone this repo
git clone https://github.com/ma3u/MinimumViableDataspace.git
cd MinimumViableDataspace

# Create your domain branch
git checkout -b health-demo  # or aerospace-demo, manufacturing-demo, etc.
```

### Step 2: Install Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| **Java** | 17+ (temurin-17 or temurin-22) | EDC runtimes |
| **Node.js** | 18+ or 20+ | Frontend/backend (if building UI) |
| **Newman** | Latest | Postman CLI for seeding |
| **jq** | Latest | JSON processing in scripts |
| **Container Runtime** | OrbStack (recommended) or Docker Desktop | Local K8s development |

```bash
# Install Newman and jq
brew install newman jq

# Install OrbStack (recommended for macOS)
brew install orbstack

# OR install Rancher Desktop (open source alternative)
brew install rancher-desktop
```

See [docs/cloud-deployment-options.md](docs/cloud-deployment-options.md) for detailed comparison.

### Step 3: Build Core MVD Infrastructure

```bash
# Build EDC components
./gradlew build

# For Kubernetes/Docker deployment, build with persistence
./gradlew -Ppersistence=true build
./gradlew -Ppersistence=true dockerize
```

### Step 4: Deploy MVD Infrastructure

**Option A: IntelliJ IDEA (Fastest for Development)**

1. Open project in IntelliJ IDEA
2. Run `.run/dataspace` compound configuration (starts all 8 runtimes)
3. Wait for all services to be healthy (~30-60 seconds)
4. Run seeding script:
   ```bash
   ./seed-edc.sh
   ```

**Option B: Kubernetes (Production-like)**

```bash
# Create KinD cluster
kind create cluster -n mvd --config deployment/kind.config.yaml

# Load images
kind load docker-image controlplane:latest dataplane:latest \
  identity-hub:latest catalog-server:latest issuerservice:latest -n mvd

# Deploy with Terraform
cd deployment
terraform init
terraform apply
```

See [WARP.md](WARP.md) for detailed deployment instructions.

### Step 5: Customize for Your Domain

Now you're ready to customize MVD for your specific domain. Follow the **BLUEPRINT methodology**:

---

## BLUEPRINT Methodology: Phase-Based Development

The BLUEPRINT methodology is a structured, phase-based approach to building dataspaces. Each phase is tracked as a GitHub issue with clear acceptance criteria.

### Phase-Based Development Workflow

**Before starting ANY implementation:**

1. **Create BLUEPRINT Issue**
   - Title: `BLUEPRINT: Phase <X> - <Feature Name>`
   - Define acceptance criteria
   - Commit issue creation to `main` branch

2. **Implement Phase**
   - Update GitHub issue with progress
   - Reference issue in all commits: `#<issue-number>`
   - Document decisions and blockers

3. **Complete Phase**
   - Verify all acceptance criteria met
   - Close issue with final summary

### BLUEPRINT Phases for Domain-Specific Dataspace

#### Phase 1: Cleanup and Setup ✅ (COMPLETE)
**Status**: Complete (see [Issue #17](https://github.com/ma3u/MinimumViableDataspace/issues/17))
- Clean repository (remove aerospace demo)
- Research cloud deployment options
- Establish development environment

#### Phase 2: Domain Specification
**Create**: `BLUEPRINT: Phase 2 - <Your Domain> Specification`

**Deliverables:**
- `.specify/spec.md` - Domain requirements and data models
- `.specify/spec.yaml` - OpenAPI specification for your domain APIs
- `.specify/constitution.md` - Non-negotiable rules (security, compliance)
- `.specify/regulatory-inventory.md` - Domain compliance requirements (GDPR, HIPAA, etc.)
- `.specify/policies/*.yaml` - ODRL policies for your domain

**Example: Health Domain**
```yaml
# .specify/spec.yaml
openapi: 3.1.0
info:
  title: Health Dataspace API
  description: EHDS-compliant EHR data exchange
paths:
  /api/ehr:
    get:
      summary: List EHR records
      responses:
        '200':
          description: FHIR R4 Patient bundle
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FHIRBundle'
```

#### Phase 3: Frontend Development
**Create**: `BLUEPRINT: Phase 3 - <Your Domain> Frontend`

**Deliverables:**
- React/TypeScript frontend for catalog browsing
- Domain-specific data viewer (EHR viewer, DPP viewer, etc.)
- Contract negotiation UI
- Data transfer flow visualization

**Reusable Components (from MVD-health branch):**
- `CatalogCard.tsx` - Asset display component
- `DataspaceInsiderPanel.tsx` - DSP protocol visualization
- `useCatalog.ts` - Catalog fetching hook
- `apiFactory.ts` - Multi-mode API interface (mock/hybrid/full)

#### Phase 4: Backend Services
**Create**: `BLUEPRINT: Phase 4 - <Your Domain> Backend`

**Deliverables:**
- Backend service serving domain-specific data
- EDC proxy service (optional, for simplified frontend integration)
- Mock data for development/testing
- OpenTelemetry tracing, Prometheus metrics

#### Phase 5: Testing & Compliance
**Create**: `BLUEPRINT: Phase 5 - Testing & Compliance`

**Deliverables:**
- Unit tests (Vitest for frontend, JUnit for Java)
- Contract tests (Pact/Newman)
- E2E tests (Playwright for frontend, RestAssured for backend)
- Compliance tests (GDPR, domain-specific regulations)
- DSP/DCP protocol conformance tests

#### Phase 6: Production Deployment
**Create**: `BLUEPRINT: Phase 6 - Production Deployment`

**Deliverables:**
- Cloud deployment (AKS/EKS/GKE Terraform modules)
- CI/CD pipelines (GitHub Actions)
- Monitoring & alerting (Prometheus, Grafana, Jaeger)
- Security hardening (network policies, RBAC, secrets management)
- Disaster recovery plan

---

## Architecture

MVD provides core dataspace infrastructure based on Eclipse EDC:

### Core Components

```
┌─────────────────────────────────────────────────────┐
│                 Your Domain Layer                    │
│  (Frontend, Backend, Domain-Specific Extensions)    │
└─────────────────────────────────────────────────────┘
                         ↓ Uses
┌─────────────────────────────────────────────────────┐
│              MVD Core Infrastructure                 │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Consumer   │  │   Provider   │                │
│  │ Controlplane │←→│ Controlplane │ (DSP)          │
│  │  Dataplane   │  │  Dataplane   │                │
│  │ IdentityHub  │  │ IdentityHub  │                │
│  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐                │
│  │Catalog Server│  │Issuer Service│                │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

### Management Domains Architecture

MVD implements **Management Domains** - a pattern where multiple departments/divisions share a common identity but maintain independent data policies:

**Example: Provider Organization**
- `provider-qna` - Q&A department connector
- `provider-manufacturing` - Manufacturing department connector
- `provider-catalog-server` - Federated catalog (shared)
- `provider-identityhub` - Shared identity for all departments

This architecture allows organizations to:
- Maintain single organizational identity (`did:web:provider-identityhub`)
- Enforce department-specific access policies
- Share catalog metadata while protecting sensitive data
- Scale horizontally by adding new department connectors

### Key Design Patterns

1. **Decentralized Identity (DCP)**
   - `did:web` DIDs for each participant
   - Verifiable Credentials (MembershipCredential, domain-specific credentials)
   - Zero-trust credential verification

2. **Policy-Based Access Control (ODRL)**
   - Fine-grained access policies per asset
   - Credential-based policy evaluation
   - Domain-specific policy functions

3. **Dataspace Protocol (DSP)**
   - Catalog discovery
   - Contract negotiation
   - HTTP-PULL data transfer

---

## Example Domains

This repository serves as a template. Here are example domain implementations:

### Health Dataspace (MVD-health)
**Branch**: `health-demo`  
**Use Case**: EHDS-compliant Electronic Health Record exchange for clinical research

**Domain-Specific Components:**
- FHIR R4 EHR data with ISiK/KBV profiles
- DCAT-AP for Health metadata
- ConsentCredential for GDPR Art. 89 compliance
- MedDRA v27.0 adverse event classification
- Frontend: EHR viewer with clinical trial metadata

**Regulatory Compliance:**
- EHDS Regulation (EU 2025/327) Art. 50/51
- GDPR Art. 9 (special categories) + Art. 89 (research)
- German GDNG (Health Data Use Act)

### Aerospace Supply Chain (Legacy)
**Status**: Removed in Phase 1 cleanup (aerospace-specific code in separate branch)

**Use Case**: Digital Product Passport exchange for aerospace components

---

## Deployment Options

### Local Development

**Recommended: OrbStack (macOS)**
- 3-5x faster than Docker Desktop
- ~500 MB idle memory vs 2-4 GB
- Full KinD support

**Alternative: Rancher Desktop**
- Open source (Apache 2.0)
- K3s lightweight Kubernetes

**Installation:**
```bash
# OrbStack
brew install orbstack

# Rancher Desktop
brew install rancher-desktop
```

### Cloud Production Deployment

**Recommended: Azure Kubernetes Service (AKS)**

**Why AKS?**
- Best EHDS compliance (EU data residency)
- Azure AD integration for EDC DCP
- Azure Key Vault for secrets management
- Cost-effective: €150-800/month depending on scale

**Alternative Cloud Providers:**
- **AWS EKS**: Best if already on AWS
- **Google GKE**: Best monitoring/observability

See [docs/cloud-deployment-options.md](docs/cloud-deployment-options.md) for comprehensive comparison.

**Typical Production Setup:**
```yaml
Cluster: AKS (West Europe or Germany West Central)
Nodes: 5x Standard_D4s_v3 (4 vCPU, 16 GB RAM)
Database: Azure PostgreSQL Flexible Server (HA)
Secrets: Azure Key Vault (HSM-backed)
Registry: Azure Container Registry
Monitoring: Azure Monitor + Prometheus + Grafana
Cost: €500-800/month (with HA and DR)
```

---

## Project Structure

```
MinimumViableDataspace/
├── extensions/              # Custom EDC extensions
│   ├── catalog-node-resolver/    # Federated catalog discovery
│   ├── dcp-impl/                 # Decentralized Claims Protocol
│   ├── did-example-resolver/     # DID resolution (demo)
│   └── superuser-seed/           # IdentityHub bootstrap
├── launchers/              # EDC runtime modules
│   ├── controlplane/       # Management API, DSP protocol
│   ├── dataplane/          # Data transfer execution
│   ├── identity-hub/       # Identity & credential management
│   ├── catalog-server/     # Federated catalog crawler
│   └── issuerservice/      # Verifiable Credential issuer
├── deployment/             # Deployment configurations
│   ├── assets/             # Keys, DIDs, environment configs
│   ├── postman/            # Newman seeding collections
│   └── kind.config.yaml    # KinD cluster configuration
├── .specify/               # Specification-Driven Development
│   ├── constitution.md     # Governance rules
│   ├── spec.md/spec.yaml   # OpenAPI specifications
│   ├── regulatory-inventory.md  # Compliance checklist
│   └── policies/           # ODRL policy templates
├── docs/                   # Documentation
│   ├── cloud-deployment-options.md
│   └── spec-driven-dev-mvd-instructions.md
├── tests/
│   └── end2end/            # Integration tests
├── .run/                   # IntelliJ run configurations
├── WARP.md                 # AI assistant guidance
├── seed-edc.sh             # Identity/credential seeding script
└── README.md               # This file
```

---

## Common Development Commands

### Build
```bash
# Standard build
./gradlew build

# Build with persistence (for Docker/K8s)
./gradlew -Ppersistence=true build

# Build Docker images
./gradlew -Ppersistence=true dockerize
```

### Test
```bash
# Run checkstyle
./gradlew checkstyleMain checkstyleTest

# Run end-to-end tests (requires running dataspace)
./gradlew :tests:end2end:test
```

### Deploy
```bash
# IntelliJ: Run .run/dataspace compound configuration, then:
./seed-edc.sh

# Kubernetes: See deployment/README.md (if exists) or WARP.md
```

---

## Seeding the Dataspace

**CRITICAL**: Always run seeding after starting EDC runtimes. This creates:
- Participant contexts in IdentityHubs
- DID documents
- Verifiable Credentials (MembershipCredential, domain-specific credentials)
- Assets, policies, contract definitions (domain-specific)

```bash
# IntelliJ deployment
./seed-edc.sh

# Note: Domain-specific asset seeding is separate
# Example: For health domain, run additional script after seed-edc.sh
# ./seed-health-assets.sh
```

---

## Specification-Driven Development (SDD)

MVD uses a specification-first approach where OpenAPI specifications drive code generation and testing:

### SDD Workflow

```
1. Define Spec (.specify/spec.yaml)
    ↓
2. Generate Mock API (Prism)
    ↓
3. Develop Frontend (against mock)
    ↓
4. Implement Backend (spec-compliant)
    ↓
5. Contract Tests (Newman/Pact)
    ↓
6. Compliance Tests (automated)
    ↓
7. Deploy (only if 100% compliant)
```

### Tools

- **GitHub Spec Kit**: Specification management & task generation
- **Prism**: OpenAPI mock server
- **Newman**: Postman CLI for contract testing
- **Pact**: Consumer-driven contract testing
- **dsp-tck/dcp-tck**: Protocol compliance testing

See [docs/spec-driven-dev-mvd-instructions.md](docs/spec-driven-dev-mvd-instructions.md) for complete guide.

---

## Domain-Specific Examples

### Health Dataspace Implementation

**Repository**: [MVD-health branch](https://github.com/ma3u/MinimumViableDataspace/tree/health-demo)

**Key Differences from Core MVD:**
```
MVD (Core)                      MVD-health (Domain Extension)
├── seed-edc.sh                 ├── seed-dataspace.sh (enhanced)
├── [No frontend]               ├── frontend/ (React + FHIR viewer)
├── [No backend]                ├── backend-mock/ (FHIR R4 data)
├── [Generic policies]          ├── backend-edc/ (EDC proxy)
└── extensions/dcp-impl/        ├── docker-compose.health.yml
    (base DCP)                  ├── docker-compose.edc.yml
                                ├── docs/USER-MANUAL.md
                                └── extensions/edc-health-client/
                                    (health-specific extensions)
```

**To Create Your Domain:**
1. Branch from `main`: `git checkout -b my-domain-demo`
2. Copy structure from `health-demo` branch (if applicable)
3. Replace health-specific components with your domain
4. Follow BLUEPRINT phases

---

## Monitoring & Observability

MVD is designed to integrate with standard observability tools:

### Prometheus + Grafana

```bash
# See MVD-health branch for pre-configured observability stack
# docker-compose.observability.yml includes:
# - Prometheus (metrics)
# - Grafana (dashboards)
# - Jaeger (tracing)
# - Loki (logs)
```

### OpenTelemetry

All MVD components support OpenTelemetry for distributed tracing:
- EDC connectors emit OTLP traces
- Backend services instrumented with OpenTelemetry SDK
- Traces visualized in Jaeger

---

## Security Considerations

### Development (Local)
- ⚠️ Uses in-memory databases and vaults
- ⚠️ Simplified DID resolution (not production-grade)
- ⚠️ Demo credentials (not secure)

### Production (Cloud)
- ✅ Azure Key Vault (HSM-backed)
- ✅ PostgreSQL with encryption at rest
- ✅ Network policies (Calico/Azure CNI)
- ✅ RBAC for Kubernetes API
- ✅ Private endpoints for all services
- ✅ Regular credential rotation

---

## Regulatory Compliance

MVD provides **patterns** for compliance, not compliance itself. Your domain implementation must ensure:

### Built-in Compliance Patterns
- ✅ Verifiable Credentials for access control
- ✅ ODRL policies for fine-grained permissions
- ✅ Audit logging (all DSP messages)
- ✅ Credential-based access (zero-trust)

### Domain-Specific Compliance (Your Responsibility)
- GDPR (Art. 9, Art. 89 for health data)
- HIPAA (US health data)
- EHDS (EU health data)
- Industry-specific regulations

**Example: Health Domain Compliance**
```yaml
# .specify/regulatory-inventory.md
- EHDS Regulation (EU 2025/327): Art. 50/51 health categories
- GDPR Art. 9: Special categories of personal data
- GDPR Art. 89: Safeguards for research
- German GDNG: Health Data Use Act
- FHIR R4: ISiK and KBV profiles
- MedDRA: Adverse event classification
```

---

## Troubleshooting

### Common Issues

**Runtimes fail to communicate**
- Forgot to run seed script: `./seed-edc.sh`
- DID documents not accessible (check IdentityHub logs)
- Vault secrets not synchronized (IntelliJ memory vault limitation)

**Contract negotiation fails**
- Missing credentials: Check IdentityHub has issued MembershipCredential
- Policy constraints not satisfied: Check ODRL policy in asset
- Credential verification failure: Re-run seed script

**Port conflicts**
- IntelliJ deployment uses ports 7080-10100
- Check no other services using these ports
- See WARP.md for complete port mapping

**Build failures**
- Missing `-Ppersistence=true` flag for Docker/K8s builds
- Java version < 17
- Gradle wrapper issues: `./gradlew wrapper --gradle-version 8.5`

---

## Version & Stability

- **`main` branch**: Latest development, uses `-SNAPSHOT` EDC versions
- **Tagged releases**: Stable EDC release versions
- **Domain branches**: `health-demo`, `aerospace-demo` (archived), etc.

**Versioning Strategy:**
- No backward compatibility guarantees (this is a template, not a product)
- Bugfixes target `main` branch only
- Domain branches maintained independently

---

## Contributing

MVD is a template repository. Contributions should focus on:

1. **Core EDC Infrastructure**: Extensions, deployment patterns, build improvements
2. **Documentation**: BLUEPRINT methodology, deployment guides, troubleshooting
3. **Domain Examples**: Reference implementations in domain branches

**Not Accepted:**
- Domain-specific code in `main` branch (use domain branches)
- Breaking changes without migration guide
- Untested code

**Process:**
1. Fork repository
2. Create feature branch
3. Submit pull request with:
   - Clear description of change
   - Tests for new functionality
   - Documentation updates

---

## Resources

### Documentation
- [WARP.md](WARP.md) - AI assistant guidance & development workflow
- [docs/cloud-deployment-options.md](docs/cloud-deployment-options.md) - Cloud K8s deployment guide
- [docs/spec-driven-dev-mvd-instructions.md](docs/spec-driven-dev-mvd-instructions.md) - SDD methodology

### External Links
- [Eclipse Dataspace Components](https://eclipse-edc.github.io/docs/)
- [Dataspace Protocol Specification](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/)
- [IdentityHub Documentation](https://github.com/eclipse-edc/IdentityHub)
- [DCP Specification](https://github.com/eclipse-tractusx/identity-trust)

### Domain Examples
- [Health Dataspace (MVD-health)](https://github.com/ma3u/MinimumViableDataspace/tree/health-demo)
- Aerospace Dataspace (archived)

---

## License

This project is licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/ma3u/MinimumViableDataspace/issues)
- **Discussions**: Use GitHub Discussions for questions
- **Domain-Specific**: Check domain branch documentation

**Note**: This is a demonstration template, not a supported product. Use at your own risk in production environments.
