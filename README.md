# Start from Minimum Viable Dataspace (MVD)

## A BLUEPRINT for Building Domain-Specific Dataspaces

A reusable template and methodology for creating production-grade, compliant dataspaces across any domain using Eclipse Dataspace Components (EDC), Decentralized Claims Protocol (DCP), and specification-driven development.

[![EDC](https://img.shields.io/badge/Eclipse-Dataspace%20Components-white)](https://eclipse-edc.github.io/docs/)
[![DCP](https://img.shields.io/badge/Protocol-DCP-blue)](https://github.com/eclipse-tractusx/identity-trust)
[![DSP](https://img.shields.io/badge/Dataspace-Protocol%202025-yellow)](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/)

---

## What is MVD?

**Minimum Viable Dataspace (MVD)** is a **template repository** that provides the essential infrastructure, patterns, and methodology for building domain-specific dataspaces. It is NOT a finished product—it's a foundation you customize and extend for your specific use case.

### Key Characteristics

-  **Template, Not a Product**: Core EDC infrastructure without domain-specific implementations
- **BLUEPRINT Methodology**: Phase-based development workflow with GitHub issue tracking
- **Specification-Driven**: OpenAPI specs drive code generation and compliance testing
- **Production-Ready Patterns**: Kubernetes deployment, observability, security best practices
- **Multi-Domain Support**: Branch-based strategy for health, aerospace, manufacturing, etc.

### What You Get

| Component | Description | Customization Required |
|-----------|-------------|------------------------|
| **EDC Runtimes** | Controlplane, Dataplane, IdentityHub, Catalog Server, Issuer Service | Minimal - works out of box |
| **Custom Extensions** | DCP implementation, catalog resolver, DID resolver | Configure for your identity model |
| **Deployment Templates** | Kubernetes/Terraform, Docker Compose | Adjust ports/resources |
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
| **uv** | Latest | Python package manager for Spec Kit |
| **GitHub Spec Kit** | Latest | Specification-driven development toolkit |
| **Newman** | Latest | Postman CLI for seeding |
| **jq** | Latest | JSON processing in scripts |
| **Container Runtime** | OrbStack (recommended) or Docker Desktop | Local K8s development |

```bash
# Install uv (Python package manager)
brew install uv

# Install GitHub Spec Kit (persistent installation - recommended)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Verify Spec Kit installation
specify --help

# Install Newman and jq
brew install newman jq

# Install OrbStack (recommended for macOS)
brew install orbstack
```

**GitHub Spec Kit** is used for specification-driven development:
- `/speckit.constitution` - Define project principles
- `/speckit.specify` - Create feature specifications
- `/speckit.plan` - Generate technical implementation plans
- `/speckit.tasks` - Break down into actionable tasks
- `/speckit.implement` - Execute implementation

See [GitHub Spec Kit documentation](https://github.com/github/spec-kit) for complete usage guide.

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

**Option A2: VS Code (Alternative IDE)**

1. Open project in VS Code:
   ```bash
   code .
   ```
2. Install recommended extensions:
   - Java Extension Pack
   - Gradle for Java
   - Docker (for container management)
3. Use integrated terminal to run individual launchers:
   ```bash
   # Start each runtime in separate terminal windows
   ./gradlew :launchers:consumer:run
   ./gradlew :launchers:provider-qna:run
   # ... or use deployment/docker-compose.yml
   ```
4. Run seeding script:
   ```bash
   ./seed-edc.sh
   ```

**Note**: IntelliJ provides the best Java development experience with compound run configurations. VS Code requires manual terminal management per runtime or Docker Compose usage.

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

## Using the BLUEPRINT Methodology

The BLUEPRINT methodology is a proven, phase-based approach to building production-grade dataspaces. All 6 phases have been implemented in this repository as a **complete reference implementation**.

### How to Use This Blueprint

**Each phase is documented as a closed GitHub issue** containing:
- ✅ Acceptance criteria (all met)
- 📋 Implementation details and decisions
- 🎯 Deliverables and artifacts created
- 💡 Lessons learned and recommendations

**Your approach**:
1. Review each phase's GitHub issue to understand what was done
2. Study the delivered artifacts (code, configs, docs)
3. Adapt the patterns to your domain-specific needs
4. Use the AI prompt templates below to guide your implementation

---

## BLUEPRINT Phases Reference

### Phase 1: Cleanup and Setup ✅
**GitHub Issue**: [#17 - Cleanup and Setup](https://github.com/ma3u/MinimumViableDataspace/issues/17)

**What This Phase Delivers**:
- Clean repository structure without domain-specific code
- Cloud deployment research and documentation
- Development environment setup

**Key Artifacts**:
- `docs/cloud-deployment-options.md` - Multi-cloud comparison (Azure, AWS, GCP)
- `WARP.md` - AI-assisted development guide
- Clean build configuration

**Adapt for Your Domain**:
```
I'm building a [DOMAIN] dataspace (e.g., healthcare, supply chain, finance).

Help me with Phase 1:
1. Review requirements for [YOUR_DOMAIN]
2. Research cloud options for [COMPLIANCE_REQUIREMENT] (e.g., GDPR, HIPAA)
3. Set up development environment
4. Document architecture decisions

Target cloud: [Azure/AWS/GCP]
```

---

### Phase 2: Domain Specification Template ✅
**GitHub Issue**: [#18 - Domain Specification Template](https://github.com/ma3u/MinimumViableDataspace/issues/18)

**What This Phase Delivers**:
- `.specify/` directory structure for specification-driven development
- Template ODRL policies for access control
- Regulatory inventory framework

**Key Artifacts**:
- `.specify/README.md` - Spec-driven development guide
- `.specify/constitution.md` - Governance template
- `.specify/regulatory-inventory.md` - Compliance tracking
- `.specify/policies/` - ODRL policy templates

**Adapt for Your Domain**:
```
Customize Phase 2 specifications for [DOMAIN].

Create:
1. .specify/spec.yaml - OpenAPI spec for [YOUR_API]
2. .specify/constitution.md - Update with:
   - Data residency: [YOUR_REQUIREMENT]
   - Encryption standards: [YOUR_STANDARD]
   - Compliance: [YOUR_REGULATIONS]
3. .specify/policies/*.yaml - ODRL policies for [YOUR_USE_CASES]

Reference: .specify/ directory in MVD
```

---

### Phase 3: Core Extensions ✅
**GitHub Issue**: [#19 - Core Extensions](https://github.com/ma3u/MinimumViableDataspace/issues/19)

**What This Phase Delivers**:
- DCP (Decentralized Claims Protocol) implementation
- Policy evaluation functions (MembershipCredential, DataAccessLevel)
- Catalog node resolver for participant discovery
- DID resolution for did:web

**Key Artifacts**:
- `extensions/dcp-impl/` - DCP protocol implementation
- `extensions/catalog-node-resolver/` - Participant directory
- `extensions/did-example-resolver/` - DID resolution
- `extensions/superuser-seed/` - Identity seeding

**Adapt for Your Domain**:
```
Extend Phase 3 for [DOMAIN]-specific requirements.

1. Add custom credential type:
   - Create [DOMAIN]Credential (e.g., HealthcareProviderCredential)
   - Define required claims/attributes
   
2. Implement policy functions:
   - [DOMAIN]CredentialEvaluationFunction
   - Verify [SPECIFIC_REQUIREMENTS]
   
3. Update participant directory:
   - Add [YOUR_ORGANIZATIONS] to deployment/assets/participants

Reference: extensions/ directory
```

---

### Phase 4: Testing Infrastructure ✅
**GitHub Issue**: [#20 - Testing Infrastructure](https://github.com/ma3u/MinimumViableDataspace/issues/20)

**What This Phase Delivers**:
- Unit testing framework (JUnit 5, Mockito, JaCoCo)
- GitHub Actions CI/CD workflows
- Protocol compliance testing (DSP-TCK, DCP-TCK)
- 80%+ code coverage

**Key Artifacts**:
- `.github/workflows/test.yml` - Automated testing pipeline
- `docs/TESTING.md` - Complete testing guide
- Test examples in all modules

**Adapt for Your Domain**:
```
Add [DOMAIN]-specific tests to Phase 4 infrastructure.

1. Unit tests for custom extensions
2. Integration tests for [DOMAIN_WORKFLOW]
3. Compliance tests for [REGULATION]
4. Performance tests for [SLA_REQUIREMENT]

Target: 80%+ coverage
Reference: docs/TESTING.md
```

---

### Phase 5: Observability & Monitoring ✅
**GitHub Issue**: [#21 - Observability & Monitoring](https://github.com/ma3u/MinimumViableDataspace/issues/21)

**What This Phase Delivers**:
- Prometheus metrics (11 EDC runtime targets)
- Jaeger distributed tracing
- 3 Grafana dashboards with 24 panels
- Health check endpoints

**Key Artifacts**:
- `deployment/observability/` - Complete observability stack
- `deployment/observability/grafana/dashboards/` - Pre-built dashboards
- `docs/OBSERVABILITY.md` - Setup and usage guide

**Adapt for Your Domain**:
```
Extend Phase 5 monitoring for [DOMAIN] metrics.

1. Add custom metrics:
   - [BUSINESS_METRIC] (e.g., contract_value_total)
   - [DOMAIN_METRIC] (e.g., patient_records_transferred)
   
2. Create dashboards:
   - [DOMAIN] Business Metrics
   - [DOMAIN] Compliance Dashboard
   
3. Configure alerts for [CRITICAL_CONDITIONS]

Reference: deployment/observability/
```

---

### Phase 6: Production Deployment & Security ✅
**GitHub Issue**: [#22 - Production Deployment & Security](https://github.com/ma3u/MinimumViableDataspace/issues/22)

**What This Phase Delivers**:
- Complete Kubernetes manifests (base + overlays)
- Security hardening (Pod Security, RBAC, NetworkPolicies)
- CI/CD pipelines (build + deploy)
- Multi-cloud deployment guides (AKS, EKS, GKE)
- Operational runbook

**Key Artifacts**:
- `deployment/k8s/` - Production Kubernetes configs
- `.github/workflows/build-release.yml` - Build pipeline
- `.github/workflows/deploy.yml` - Deployment pipeline
- `docs/PRODUCTION-DEPLOYMENT.md` - Cloud deployment guide
- `docs/SECURITY.md` - Security hardening guide
- `docs/RUNBOOK.md` - Operations manual

**Adapt for Your Domain**:
```
Prepare Phase 6 production deployment for [DOMAIN].

1. Cloud setup:
   - Provider: [Azure/AWS/GCP]
   - Region: [REGION] (for [COMPLIANCE_REQUIREMENT])
   - Resources: Adjust deployment/k8s/base/ for [YOUR_SCALE]
   
2. Security:
   - Implement [DOMAIN_CONTROLS] from docs/SECURITY.md
   - Add [REGULATION]-specific logging/audit
   
3. Operations:
   - Define RTO: [X] hours, RPO: [Y] minutes
   - Disaster recovery: Customize docs/RUNBOOK.md

Reference: docs/PRODUCTION-DEPLOYMENT.md
```

---

## AI-Assisted Development: Best Practices

### Seamless Tool Switching with Symbolic Links ✅

This repository uses symbolic links to share context across different AI coding assistants. All links are **already implemented** and point to a single source of truth.

**Implemented Symbolic Links**:
```bash
# Root directory links (all point to WARP.md)
.aiderules -> WARP.md              # For Aider
.clinerules -> WARP.md             # For Cline (Claude Code)
.cursorrules -> WARP.md            # For Cursor
.warp-context.md -> WARP.md        # For Warp

# GitHub directory link
.github/copilot-instructions.md -> ../WARP.md  # For GitHub Copilot

# Project governance link
.ai-constitution -> .specify/constitution.md   # Non-negotiable rules
```

**Benefits**:
- ✅ **Single source of truth**: Update `WARP.md` once, all tools see the changes
- ✅ **Switch tools seamlessly**: Use Warp, Cursor, Copilot, Aider, or Cline interchangeably
- ✅ **Consistent context**: All AI assistants have the same project understanding
- ✅ **No duplication**: Never copy-paste documentation between tool config files

**Verify Setup**:
```bash
# View all symbolic links
ls -la | grep '^l'

# Check GitHub Copilot link
ls -la .github/ | grep copilot
```

### Recommended Tool Combinations

| Phase | Primary Tool | Alternative | Why |
|-------|-------------|-------------|-----|
| **Phase 1-2** (Planning) | Warp Agent Mode | Claude/ChatGPT | Complex reasoning, research |
| **Phase 3** (Extensions) | Cursor / GitHub Copilot | IntelliJ AI | Java code generation, EDC patterns |
| **Phase 4** (Testing) | GitHub Copilot | Cursor | Test generation, mocking |
| **Phase 5** (Observability) | Warp Agent Mode | Cline | Configuration files, YAML |
| **Phase 6** (Deployment) | Warp Agent Mode | Cursor + Copilot | Kubernetes manifests, documentation |

### Tool-Specific Tips

**Warp Agent Mode** (Best for this project):
- ✅ Excellent for: Multi-file operations, Git workflows, deployment
- ✅ Use `WARP.md` for project context
- ✅ Can execute commands directly
- ⚠️ Limited inline code editing (uses diffs)

**GitHub Copilot**:
- ✅ Excellent for: Inline code completion, test generation
- ✅ Use `.github/copilot-instructions.md` for context
- ⚠️ Limited multi-file context

**Cursor**:
- ✅ Excellent for: Refactoring, multi-file edits
- ✅ Use `.cursorrules` for project rules
- ✅ Composer mode for complex changes

**Cline (Claude Code)**:
- ✅ Excellent for: Planning, documentation
- ✅ Use `.clinerules` for context
- ✅ Good at understanding complex requirements

**Aider**:
- ✅ Excellent for: CLI-based development, Git integration
- ✅ Use `.aiderules` for context
- ✅ Strong refactoring capabilities

### Context Sharing Pattern

1. **Maintain WARP.md as Source of Truth**
2. **Link to it from other tools**:
   ```markdown
   # .github/copilot-instructions.md
   
   See WARP.md for complete project context.
   
   Quick reference:
   - Architecture: See WARP.md ## Architecture
   - Build: ./gradlew build
   - Deploy: See deployment/k8s/
   ```

3. **Update WARP.md when architecture changes**
4. **Symbolic links automatically reflect updates**

---

## Contributing & Feedback

### Found a Bug? Have a Suggestion?

We welcome contributions and feedback! Please help improve MVD:

**🐛 Report a Bug**:
1. Check [existing issues](https://github.com/ma3u/MinimumViableDataspace/issues)
2. Create a new issue with:
   - Clear title: `[BUG] Short description`
   - Steps to reproduce
   - Expected vs. actual behavior
   - Environment (OS, Java version, EDC version)
   - Logs or error messages

**💡 Suggest an Improvement**:
1. Create an issue with:
   - Clear title: `[FEATURE] Short description`
   - Use case: Why is this needed?
   - Proposed solution (if you have one)
   - Alternative approaches considered

**📖 Documentation Issues**:
1. Create an issue with:
   - Title: `[DOCS] What's unclear/missing`
   - Which document: `docs/FILE.md`
   - What you expected to find
   - Suggested improvement

**🔧 Submit a Pull Request**:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following existing patterns
4. Test your changes thoroughly
5. Update documentation (WARP.md, relevant docs/)
6. Commit with descriptive messages
7. Push and create a PR with:
   - Clear description of changes
   - Link to related issue
   - Screenshots (if UI changes)

**Issue Templates**:
```markdown
## Bug Report Template
**Title**: [BUG] Short description

**Environment**:
- OS: macOS 14.0 / Ubuntu 22.04 / Windows 11
- Java: 17.0.8
- EDC Version: (from build.gradle.kts)

**Steps to Reproduce**:
1. Start dataspace with `./seed.sh`
2. Call API: `curl ...`
3. Observe error: ...

**Expected**: Should return 200 OK
**Actual**: Returns 500 Internal Server Error

**Logs**:
```
[paste relevant logs]
```

**Context**: Trying to implement [your use case]
```

```markdown
## Feature Request Template  
**Title**: [FEATURE] Short description

**Use Case**:
As a [dataspace operator/developer],
I want to [do something],
So that [achieve outcome].

**Current Limitation**:
Currently, MVD [does not support X / requires manual Y].

**Proposed Solution**:
1. Add [component/feature]
2. Modify [existing functionality]
3. Document [new capability]

**Alternatives Considered**:
- Option A: [description] - Why not chosen: [reason]
- Option B: [description] - Why not chosen: [reason]

**Additional Context**:
- Related to [domain/regulation]:
- Similar to [other project/standard]:
```

**Quick Links**:
- 📋 [All Issues](https://github.com/ma3u/MinimumViableDataspace/issues)
- 🎯 [Roadmap & Milestones](https://github.com/ma3u/MinimumViableDataspace/milestones)
- 💬 [Discussions](https://github.com/ma3u/MinimumViableDataspace/discussions)

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
- **StackIT (Schwarz IT)**: German sovereign cloud for German/EU dataspaces
- **OVH Public Cloud**: European sovereign cloud, cost-effective

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
# Run all unit tests
./gradlew test

# Run specific module tests
./gradlew :extensions:dcp-impl:test

# Run with coverage report
./gradlew test jacocoRootReport

# View coverage report
 open build/reports/jacoco/jacocoRootReport/html/index.html

# Run checkstyle
./gradlew checkstyleMain checkstyleTest

# Run end-to-end tests (requires running dataspace)
./gradlew :tests:end2end:test
```

See [docs/TESTING.md](docs/TESTING.md) for comprehensive testing guide.

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
