# EDC Multi-Tenancy: Migrate to Virtual-Connector (EDC-V)

## Status: Proposed

**Issue Type**: Architecture / Infrastructure  
**Priority**: High  
**Effort Estimate**: Large (requires significant refactoring)  
**GitHub Issue**: [#13](https://github.com/ma3u/MinimumViableDataspace/issues/13)  
**Repository**: [ma3u/MinimumViableDataspace (health-demo)](https://github.com/ma3u/MinimumViableDataspace/tree/health-demo)

---

## Problem Statement

### The Cost Challenge (Azure AKS)

Running EDC in production is **expensive** when each participant requires a dedicated connector instance:

- **Per-participant costs**: Each Consumer/Provider EDC connector requires:
  - Control Plane container (D2s v3)
  - Data Plane container (D2s v3)
  - Identity Hub container (B2s)
  - Azure Database for PostgreSQL (Burstable)
  - Azure Key Vault namespace
  - Container Registry, Networking, Ingress

- **Estimated cost**: **€215/month (~€2,580/year)** per participant on Azure AKS

- **Operational overhead**: Each instance requires independent:
  - Updates and security patches
  - Monitoring and alerting
  - Backup and disaster recovery
  - Certificate management

### Current MVD-Health Architecture

Our current setup deploys dedicated EDC infrastructure per participant:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Current: Multi-Instance                       │
├─────────────────────────────────────────────────────────────────┤
│  Consumer Participant                Provider Participant        │
│  ┌──────────────────────┐           ┌──────────────────────┐    │
│  │ Control Plane :8081  │◄──DSP────▶│ Control Plane :8191  │    │
│  │ Data Plane    :8085  │           │ Data Plane    :8195  │    │
│  │ Identity Hub  :7082  │           │ Identity Hub  :7092  │    │
│  │ PostgreSQL (dedicated)│          │ PostgreSQL (dedicated)│   │
│  └──────────────────────┘           └──────────────────────┘    │
│           ▼                                   ▼                  │
│       consumer-postgres                 provider-postgres        │
└─────────────────────────────────────────────────────────────────┘
```

For an EHDS-compliant health dataspace with hundreds of hospitals and research institutions, this architecture **does not scale**.

---

## Solution: EDC Virtual-Connector (EDC-V)

The Eclipse EDC project has released **[Virtual-Connector](https://github.com/eclipse-edc/Virtual-Connector)** (EDC-V) - a multi-tenant-aware EDC distribution that addresses exactly this problem.

### What is EDC-V?

EDC-V provides a **virtualized control plane** where:

- **Single infrastructure** serves multiple participants (tenants)
- **Participant contexts** provide isolation between tenants
- **Shared databases** with row-level tenant filtering
- **Centralized vault access** with per-participant ACL policies
- **OAuth2 role-based access**: `admin`, `provisioner`, `participant`

### Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Target: EDC-V Multi-Tenant                    │
├─────────────────────────────────────────────────────────────────┤
│                  Shared EDC-V Infrastructure                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Virtual Control Plane                                       ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            ││
│  │  │ Consumer    │ │ Provider    │ │ Hospital-N  │  ...       ││
│  │  │ Context     │ │ Context     │ │ Context     │            ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘            ││
│  │                        │                                     ││
│  │                 ┌──────┴──────┐                              ││
│  │                 │ Shared Pool │                              ││
│  │                 │ Data Planes │                              ││
│  │                 └─────────────┘                              ││
│  └─────────────────────────────────────────────────────────────┘│
│           ▼                              ▼                       │
│     Shared PostgreSQL              HashiCorp Vault              │
│     (row-level isolation)          (path-based ACLs)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## EDC-V Key Concepts

### 1. Participant Contexts

Each dataspace participant is represented by a **participant context** that:
- Has its own `participantContextId` (mapped to DID)
- Owns resources: assets, policies, contracts, credentials
- Has dedicated vault paths for secrets
- Uses scoped OAuth2 tokens for API access

### 2. Security Boundaries

From EDC-V's [security_boundaries.md](https://github.com/eclipse-edc/Virtual-Connector/blob/main/docs/security_boundaries.md):

- **API Security**: OAuth2 Client Credentials flow with custom claims
- **Vault Isolation**: Per-participant folders with ACL policies
- **Database Isolation**: Shared database with tenant-filtered queries
- **Protocol Security**: DSP/DCP protocols maintain inter-participant boundaries

### 3. Role-Based Access Control

| Role | Purpose | API Access |
|------|---------|------------|
| `admin` | Emergency/initial setup | All APIs, all participants |
| `provisioner` | Onboarding new participants | Create/delete participant contexts |
| `participant` | Day-to-day operations | Own resources only via `/participants/{id}/...` |

### 4. Administration APIs

| API | Component | Purpose |
|-----|-----------|---------|
| Management API | ControlPlane | Assets, policies, contracts |
| Identity API | IdentityHub | VCs, key pairs, DID documents |
| Issuer Admin API | IssuerService | Holder management, attestations |
| Federated Catalog API | ControlPlane | Consolidated catalog queries |

---

## Migration Plan

### Phase 1: Assessment (2-3 weeks)

1. **Evaluate EDC-V maturity**
   - Currently in active development (latest commits: Dec 2024)
   - No official releases yet - using `main` branch
   - Check [Issues](https://github.com/eclipse-edc/Virtual-Connector/issues) and [PRs](https://github.com/eclipse-edc/Virtual-Connector/pulls)

2. **Map current extensions to EDC-V**
   - Review our `extensions/` compatibility:
     - `dcp-impl` → May be replaced by EDC-V's built-in DCP
     - `catalog-node-resolver` → Check EDC-V federated catalog
     - `did-example-resolver` → Likely still needed
     - `superuser-seed` → Replace with EDC-V provisioner APIs

3. **Identity Provider requirements**
   - EDC-V requires OAuth2 IdP with custom claims support
   - Evaluate: Keycloak (recommended by EDC-V docs) vs current setup
   - Required claims: `role`, `participant_context_id`, `scope`

### Phase 2: Proof of Concept (4-6 weeks)

1. **Set up EDC-V locally**
   ```bash
   git clone https://github.com/eclipse-edc/Virtual-Connector.git
   cd Virtual-Connector
   ./gradlew build
   ```

2. **Configure multi-tenant demo**
   - Create `consumer` and `provider` participant contexts
   - Configure Keycloak realm with required claims
   - Set up Vault with per-participant paths

3. **Adapt backend-edc proxy**
   - Update `backend-edc/src/config.ts` for EDC-V endpoints
   - Add OAuth2 token acquisition for API calls
   - Implement participant context routing

4. **Test health data flows**
   - Catalog browsing with participant isolation
   - Contract negotiation between contexts
   - EHR data transfer with consent verification

### Phase 3: Migration (6-8 weeks)

1. **Update Gradle dependencies**
   ```kotlin
   // gradle/libs.versions.toml
   [versions]
   edc = "0.14.1"        # Current
   edc-v = "TBD"         # Virtual-Connector version
   
   [libraries]
   # Add EDC-V specific dependencies
   edc-v-core = { module = "org.eclipse.edc:virtual-connector-core", version.ref = "edc-v" }
   ```

2. **Refactor launchers**
   - Replace `launchers/controlplane/` with EDC-V control plane
   - Replace `launchers/identity-hub/` with EDC-V identity hub
   - Keep `launchers/dataplane/` (shared pool architecture)

3. **Update Docker Compose**
   - Consolidate from per-participant containers to shared services
   - Add Keycloak container for OAuth2
   - Update Vault configuration for tenant paths

4. **Migrate seeding scripts**
   - Replace `seed-dataspace.sh` direct API calls with Provisioner API
   - Use EDC-V Administration APIs for participant onboarding
   - Adapt health asset creation to use participant context paths

### Phase 4: Production Readiness (4-6 weeks)

1. **Observability updates**
   - Update Prometheus metrics for multi-tenant context
   - Add per-participant dashboards in Grafana
   - Configure distributed tracing with tenant correlation

2. **Security hardening**
   - Implement proper Vault ACL policies
   - Configure OAuth2 scopes for fine-grained access
   - Audit logging per participant context

3. **Documentation updates**
   - Update `docs/DEVELOPER-MANUAL.md` with EDC-V architecture
   - Update `docs/USER-MANUAL.md` for new onboarding flow
   - Update `.github/copilot-instructions.md`

---

## Risks and Considerations

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| EDC-V not yet released | May have breaking changes | Pin to specific commit, monitor releases |
| Extension compatibility | Custom code may not work | Early PoC testing, engage EDC community |
| Performance at scale | Shared resources contention | Load testing in Phase 2 |
| Vault complexity | Security misconfigurations | Follow EDC-V docs exactly, security audit |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| IdP dependency | Single point of failure | HA Keycloak deployment |
| Database isolation | Cross-tenant data leakage | Row-level security, audit queries |
| Migration downtime | Service interruption | Blue-green deployment strategy |

---

## Decision Required

1. **Proceed with PoC?** 
   - Recommended: Yes, the cost savings and scalability benefits are significant

2. **Target timeline?**
   - Suggestion: Start Phase 1 in Q1 2025, target production in Q3 2025

3. **Resource allocation?**
   - Estimate: 1 senior developer + 0.5 DevOps for 4-6 months

---

## References

- [Eclipse EDC Multi-tenancy Discussion #25](https://github.com/orgs/eclipse-edc/discussions/25) - Original problem statement
- [eclipse-edc/Virtual-Connector](https://github.com/eclipse-edc/Virtual-Connector) - EDC-V repository
- [EDC-V Administration APIs](https://github.com/eclipse-edc/Virtual-Connector/blob/main/docs/administration_api.md)
- [EDC-V Security Boundaries](https://github.com/eclipse-edc/Virtual-Connector/blob/main/docs/security_boundaries.md)
- [EDC-V Access Control](https://github.com/eclipse-edc/Virtual-Connector/blob/main/docs/access_control.md)

---

## Related Files in This Project

- `docker-compose.edc.yml` - Current per-participant container setup
- `seed-dataspace.sh` - Current seeding scripts (will need rewrite)
- `backend-edc/src/config.ts` - EDC endpoint configuration
- `launchers/` - Current per-participant launcher assemblies
- `gradle/libs.versions.toml` - EDC version dependencies
