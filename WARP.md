# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Minimum Viable Dataspace (MVD)** is a demonstration project showcasing Eclipse Dataspace Components (EDC) with the [Dataspace Protocol 2025-01](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1-err1/) (DSP) and [Decentralized Claims Protocol 1.0](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0.1/) (DCP). It demonstrates how dataspace participants can perform credential exchange prior to DSP message exchanges.

**Important**: This is NOT a production-grade installation. It's a playground for developers to understand how DCP and EDC work together.

**Key Technologies**: Eclipse EDC 0.15.x, Decentralized Claims Protocol, Verifiable Credentials, did:web DIDs, ODRL policies

## Development Workflow - BLUEPRINT Process

**CRITICAL WORKFLOW REQUIREMENT**: Before starting any implementation work, always follow this process:

### Phase-Based Development
For any new feature or significant change:

1. **Create a BLUEPRINT Issue First**
   - Title format: `BLUEPRINT: Phase <X> - <Feature Name>`
   - Example: `BLUEPRINT: Phase 14 - Monitoring & Debugging`
   
2. **Define Acceptance Criteria**
   - Write clear, testable acceptance criteria in the issue description
   - Define "Definition of Done" for the phase
   - List all deliverables and expected outcomes

3. **Commit the BLUEPRINT**
   - Create the issue on GitHub
   - Commit the BLUEPRINT creation to the `main` branch
   - Reference the issue number in commit messages

4. **During Implementation**
   - Add implementation comments to the GitHub issue
   - Document what has been implemented
   - Update the issue with progress, blockers, and decisions made
   - Link commits to the issue using `#<issue-number>` in commit messages

5. **Completion**
   - Verify all acceptance criteria are met
   - Update the issue with final implementation summary
   - Close the issue only when phase is complete

### Example BLUEPRINT Issue Structure

```markdown
# BLUEPRINT: Phase 14 - Monitoring & Debugging

## Acceptance Criteria
- [ ] Prometheus metrics endpoint exposed on all EDC runtimes
- [ ] Grafana dashboards for catalog crawler, negotiation, and transfer metrics
- [ ] Jaeger distributed tracing for DSP protocol flows
- [ ] Loki log aggregation for all containers
- [ ] Alert rules for critical failures (negotiation failures, transfer timeouts)

## Definition of Done
- All observability components deployed and accessible
- At least 3 pre-built dashboards in Grafana
- Documentation updated with monitoring guide
- E2E test validates metrics collection

## Implementation Progress
<!-- Update this section during development -->

### Completed
- Implemented Prometheus metrics exporter
- Created Grafana datasource configuration
- ...

### In Progress
- Building custom dashboards for negotiation flow
- ...

### Blocked
- Waiting for upstream EDC metrics API enhancement
- ...
```

## Architecture

MVD consists of two companies demonstrating federated catalog data sharing:

### Provider Corp (3 runtimes sharing one identity)
- **provider-qna** - Controlplane + Dataplane for Q&A department
- **provider-manufacturing** - Controlplane + Dataplane for Manufacturing department  
- **provider-catalog-server** - Stripped-down EDC runtime for catalog requests
- **provider-identityhub** - Shared identity for all provider runtimes

### Consumer Corp
- **consumer** - Controlplane + Dataplane
- **consumer-identityhub** - Identity management

### Dataspace Issuer
- **issuerservice** - Issues Verifiable Credentials to participants

### Key Concepts
- **Management Domains**: Provider departments are independent but share a catalog server
- **IdentityHub**: Represents "identities" rather than individual runtimes
- **did:web DIDs**: Web-DIDs identify participants and reference public key material
- **Verifiable Credentials**: MembershipCredential and DataProcessorCredential control access

## Common Development Commands

### Building Runtime Images

```bash
# Standard build
./gradlew build

# Build with persistence support (required for Kubernetes)
./gradlew -Ppersistence=true build

# Build Docker images (after building)
./gradlew -Ppersistence=true dockerize
```

The `-Ppersistence=true` flag adds HashiCorp Vault and PostgreSQL modules to the runtime classpath.

### Build Individual Modules

```bash
# Build specific launcher
./gradlew :launchers:controlplane:build

# Build specific extension
./gradlew :extensions:dcp-impl:build
```

### Testing

```bash
# Run checkstyle
./gradlew checkstyleMain checkstyleTest

# Run end-to-end tests (requires running dataspace)
./gradlew :tests:end2end:test
```

## Running the Dataspace

### IntelliJ Deployment (Recommended for Development)

1. **Start NGINX** (hosts issuer DID document):
```bash
docker run -d --name nginx -p 9876:80 --rm \
  -v "$PWD"/deployment/assets/issuer/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v "$PWD"/deployment/assets/issuer/did.docker.json:/var/www/.well-known/did.json:ro \
  nginx
```

2. **Start Runtimes**: Use the `dataspace` compound run configuration in `.run/` directory
   - Requires JDK 17+ (recommended: temurin-22)
   - Configuration files located in `deployment/assets/env/*.env`

3. **Seed the Dataspace** (CRITICAL - must run after all runtimes start):
```bash
./seed.sh
```

**Note**: IntelliJ deployment uses in-memory databases and vaults. Data is lost on restart. Always restart the entire dataspace together.

### Kubernetes Deployment

1. **Build Images**:
```bash
./gradlew build
./gradlew -Ppersistence=true dockerize
```

2. **Create Cluster**:
```bash
# Create KinD cluster
kind create cluster -n mvd --config deployment/kind.config.yaml

# Load images
kind load docker-image controlplane:latest dataplane:latest identity-hub:latest catalog-server:latest issuerservice:latest -n mvd

# Deploy NGINX ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

3. **Deploy with Terraform**:
```bash
cd deployment
terraform init
terraform apply  # type 'yes' when prompted
```

4. **Seed the Dataspace**:
```bash
./seed-k8s.sh
```

**ARM Platform Note**: If JVM crashes with `SIGILL` on ARM (Apple Silicon):
```bash
terraform apply -var="useSVE=true"
```

### Docker Compose Deployment

1. **Build Images**:
```bash
./gradlew build
./gradlew -Ppersistence=true dockerize
```

2. **Start Services**:
```bash
cd deployment
docker compose up -d
```

3. **Seed the Dataspace**:
```bash
cd ..
./seed.sh
```
*Note: Docker Compose setup uses host networking for convenient access and reuses the standard `seed.sh` script.*

### Debugging in Kubernetes

All runtime images support remote debugging on port **1044**:

```bash
# Port-forward for debugging
kubectl port-forward -n mvd service/consumer-controlplane 1044:1044
```

Create "Remote JVM Debug" run configuration in IntelliJ targeting the appropriate launcher module classpath.

## Key Differences: IntelliJ vs Kubernetes

### IntelliJ (Local Development)
- In-memory databases (no persistent storage)
- Memory-based vaults (isolated per runtime)
- Embedded STS in controlplane
- DIDs use `localhost` with specific ports
- Faster iteration for development

### Kubernetes
- PostgreSQL persistent storage
- HashiCorp Vault (shared across components)
- Remote STS as standalone component
- DIDs use Kubernetes service URLs
- Production-like architecture

## Project Structure

### Directory Overview
```
MinimumViableDataspace/
├── extensions/              # Custom MVD extensions
│   ├── catalog-node-resolver/    # Participant directory resolver
│   ├── dcp-impl/                 # DCP patches and implementations
│   ├── did-example-resolver/     # DID resolution for demo
│   └── superuser-seed/           # Super-user seeding for IdentityHub
├── launchers/              # Runtime modules (controlplane, dataplane, etc.)
│   ├── catalog-server/
│   ├── controlplane/
│   ├── dataplane/
│   ├── identity-hub/
│   ├── issuerservice/
│   └── runtime-embedded/
├── deployment/             # Kubernetes and local deployment configs
│   ├── assets/            # Configuration files, keys, DIDs
│   ├── modules/           # Terraform modules
│   ├── postman/           # API collections for testing
│   └── *.tf               # Terraform deployment files
├── tests/
│   └── end2end/           # Integration tests
├── .run/                  # IntelliJ run configurations
├── seed.sh                # Seed script for IntelliJ deployment
└── seed-k8s.sh           # Seed script for Kubernetes deployment
```

### Module Analysis

#### Extensions (`extensions/`)
Custom functionalities implementing EDC SPIs:
- **`catalog-node-resolver`**: 
  - Implements `TargetNodeDirectory` to resolve participant URLs.
  - Uses a static list of participants (likely from a file or config).
  - Dependencies: `edc-spi-identity-did`, `edc-fc-spi-crawler`, `edc-fc-core`.
- **`dcp-impl`**:
  - Implements Decentralized Claims Protocol (DCP) specific logic.
  - Includes `DcpPatchExtension` and policy functions.
  - Dependencies: `edc-dcp-core`, `edc-spi-identity-trust`, `edc-spi-catalog`.
- **`did-example-resolver`**:
  - Provides DID resolution logic, possibly with a local/static approach for the demo.
  - Dependencies: `edc-did-core`, `edc-ih-spi-did`.
- **`superuser-seed`**:
  - Seeds the Identity Hub with an initial super-user identity.
  - Dependencies: `edc-ih-spi-credentials`, `edc-ih-spi`.

#### Launchers (`launchers/`)
Executable runtimes that assemble core EDC modules and custom extensions:
- **`controlplane`**: 
  - The control plane runtime for connectors.
  - Includes `did-example-resolver`, `dcp-impl`, `catalog-node-resolver`.
  - Supports HashiCorp Vault and PostgreSQL (when `persistence` is enabled).
  - Uses `org.eclipse.edc.boot.system.runtime.BaseRuntime` as main class.
- **`dataplane`**:
  - The data plane runtime.
  - Dependencies: `edc-bom-dataplane`, `edc-dataplane-v2`.
  - Supports HashiCorp Vault and PostgreSQL.
- **`identity-hub`**:
  - Runtime for Identity Hub.
  - Includes `superuser-seed`, `did-example-resolver`.
  - Dependencies: `edc-bom-identityhub`.
  - Supports HashiCorp Vault and PostgreSQL.
- **`catalog-server`**:
  - A specialized runtime for the catalog server.
  - Includes `did-example-resolver`, `dcp-impl`.
  - Dependencies: `edc-controlplane-core`, `edc-controlplane-services`, `edc-dsp`, `edc-dcp`.
- **`issuerservice`**:
  - Runtime for the Verifiable Credential Issuer Service.
  - Dependencies: `edc-issuance-spi`, `superuser-seed`, `edc-bom-issuerservice`.

## Custom Extensions

MVD includes several critical extensions that implement dataspace-specific functionality:

### Catalog Node Resolver (`extensions/catalog-node-resolver/`)
- `LazyLoadNodeDirectory`: Custom `TargetNodeDirectory` implementation
- Reads participant list from `deployment/assets/participants`
- Resolves DSP URLs, public keys, CredentialService URLs from DID documents

### DCP Implementation (`extensions/dcp-impl/`)
- `DcpPatchExtension`: Adds MembershipCredential scope to DSP requests
- `DataAccessCredentialScopeExtractor`: Converts policies to scope strings
- Policy evaluation functions (see below)

### Policy Evaluation Functions
- `MembershipCredentialEvaluationFunction`: Validates membership in dataspace
- `DataAccessLevelFunction`: Validates DataProcessorCredential and access levels

### Super-user Seeding (`extensions/superuser-seed/`)
- `ParticipantContextSeedExtension`: Seeds initial "super-user" for IdentityHub RBAC

### DID Example Resolver (`extensions/did-example-resolver/`)
- `SecretsExtension`: Pre-seeds secrets for IntelliJ deployment (memory vault workaround)

## Testing with Postman

Import collection from `deployment/postman/MVD.postman_collection.json` with appropriate environment:
- **"Local"** environment for IntelliJ deployment
- **"MVD K8S"** environment for Kubernetes deployment

### Typical DSP Flow
1. Get catalog: `ControlPlane Management/Get Cached Catalog`
2. Initiate negotiation: `ControlPlane Management/Initiate Negotiation` (use policy `@id` from catalog)
3. Query negotiation: `ControlPlane Management/Get Contract Negotiations` (wait for `FINALIZED`)
4. Initiate transfer: `ControlPlane Management/Initiate Transfer` (use `contractAgreementId`)
5. Query transfers: `ControlPlane Management/Get transfer processes` (wait for `STARTED`)
6. Get EDR: `ControlPlane Management/Get Cached EDRs`
7. Get token: `ControlPlane Management/Get EDR DataAddress for TransferId`
8. Fetch data: `ControlPlane Management/Download Data from Public API`

## Critical Setup Notes

### Seeding is Mandatory
**Always run the seed script** (`seed.sh` or `seed-k8s.sh`) after starting the dataspace. Omitting this leaves the dataspace inoperable:
- Creates ParticipantContext in IdentityHubs
- Generates DID documents dynamically
- Seeds assets, policies, and contract definitions
- Configures client secrets

### Port Mappings and DIDs
DIDs are coupled to URLs. NGINX port mapping affects issuer DID:
- Port `9876` → `did:web:localhost%3A9876`
- Changing ports requires search-and-replace across configuration files

### Credential Requirements
All participants need credentials for DSP communication:
- **MembershipCredential**: Required for all DSP requests
- **DataProcessorCredential**: Required for contract negotiation based on asset policy
  - `level: "processing"` - can process non-sensitive data (asset-1)
  - `level: "sensitive"` - can process sensitive data (asset-2, no participant has this)

## Versioning and Stability

- **`main` branch**: Latest development, uses `-SNAPSHOT` upstream versions
- **Tagged releases**: Use stable release versions of upstream components
- No backwards compatibility guarantees (this is a demo, not a product)
- No published artifacts - must build from source
- Bugfixes always target `main`, no backports to older releases

## Advanced Operations

### Regenerate Issuer Keys
```bash
# Generate new key pair
openssl genpkey -algorithm ed25519 -out deployment/assets/issuer_private.pem
openssl pkey -in deployment/assets/issuer_private.pem -pubout -out deployment/assets/issuer_public.pem

# Re-sign credentials and update DID documents
# Run test: launchers/identity-hub/src/test/java/org/eclipse/edc/demo/dcp/JwtSigner.java
```

### Regenerate Participant Keys (IntelliJ)
```bash
openssl genpkey -algorithm ed25519 -out deployment/assets/consumer_private.pem
openssl pkey -in deployment/assets/consumer_private.pem -pubout -out deployment/assets/consumer_public.pem
cp deployment/assets/consumer_private.pem deployment/assets/provider_private.pem
cp deployment/assets/consumer_public.pem deployment/assets/provider_public.pem

# Update SecretsExtension.java with new key content
# Clean, rebuild, restart, and re-seed
```

### Credential Issuance
Request additional credentials from issuer:
```bash
curl --location 'http://localhost/consumer/cs/api/identity/v1alpha/participants/ZGlkOndlYjpjb25zdW1lci1pZGVudGl0eWh1YiUzQTcwODM6Y29uc3VtZXI=/credentials/request' \
--header 'Content-Type: application/json' \
--header 'X-Api-Key: c3VwZXItdXNlcg==.c3VwZXItc2VjcmV0LWtleQo=' \
--data '{
    "issuerDid": "did:web:dataspace-issuer-service%3A10016:issuer",
    "holderPid": "credential-request-1",
    "credentials": [{
        "format": "VC1_0_JWT",
        "credentialType": "DemoCredential"
    }]
}'
```

## Development Workflow Guidelines

### When Working with EDC Components (Java)
- EDC uses **service loader pattern** - extensions are registered via `META-INF/services/org.eclipse.edc.spi.system.ServiceExtension`
- Module structure follows EDC conventions: `build.gradle.kts` + `src/main/java` + `src/main/resources`
- Extensions must implement `ServiceExtension` interface
- Use `@Inject` for dependency injection
- Policy functions extend evaluation base classes in `extensions/dcp-impl`
- **IMPORTANT**: Always build with `-Ppersistence=true` flag for Docker/Kubernetes deployment

### Commit Message Format
- Reference BLUEPRINT issue numbers: `#<issue-number>`
- Example: `feat: Add Prometheus metrics endpoint #10`
- Example: `docs: Update monitoring guide for Phase 14 #10`

### Branch Strategy
- Work in `main` branch for BLUEPRINT creation commits
- Feature branches optional but should reference BLUEPRINT issue
- All changes must link back to a BLUEPRINT issue

## Common Issues

### Runtimes fail to communicate
- Forgot to run seed script
- DID documents not accessible (check NGINX for issuer, IdentityHub for participants)
- Vault secrets not synchronized (IntelliJ memory vault limitation)

### Port conflicts
- Check that NGINX runs on 9876
- Verify no other services using connector ports
- IntelliJ run configs specify exact ports in .env files

### Kubernetes pods not starting
- Check logs: `kubectl logs -n mvd <pod-name>`
- ARM platforms: Apply `useSVE=true` terraform variable
- Verify images loaded: `docker exec -it mvd-control-plane crictl images`

### Contract negotiation fails
- Check credentials: Participant may lack required credential type/level
- Verify policy constraints match available credentials
- Review policy evaluation function logs

## References

- [Eclipse Dataspace Components](https://github.com/eclipse-edc/Connector)
- [IdentityHub](https://github.com/eclipse-edc/IdentityHub)
- [DCP Specification](https://github.com/eclipse-tractusx/identity-trust)
- [EDC Management Domains](https://github.com/eclipse-edc/Connector/blob/main/docs/developer/management-domains/management-domains.md)
