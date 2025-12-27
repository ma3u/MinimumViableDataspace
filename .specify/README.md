# .specify/ - Specification-Driven Development Templates

This directory contains templates for specification-driven dataspace development.

MVD is a **reusable template** for building domain-specific dataspaces. This `.specify/` directory guides you through creating a customized dataspace for your industry, using real-world examples from operational dataspaces.

## Quick Start: Choose Your Domain

Based on operational dataspaces, pick the pattern that matches your use case:

| Your Domain | Reference Dataspace | Branch Name Pattern | Key Templates |
|-------------|---------------------|---------------------|---------------|
| **Automotive/Manufacturing** | [Catena-X](https://catenax-ev.github.io) | `manufacturing/automotive-*` | BPN auth, Industry Core, Traceability |
| **Energy/Utilities** | [Energy-Data-X](https://energydata-x.eu) | `energy/smart-grid-*` | Smart meters, TSO/DSO, Real-time balancing |
| **Mobility/Traffic (Germany)** | [MDS](https://mobility-dataspace.eu) | `mobility/traffic-*` | Real-time traffic, Parking, IDS-RAM |
| **Mobility/Tourism (Multi-country)** | [EONA-X](https://eona-x.eu) | `mobility/maas-*` | Multimodal transport, Booking systems |
| **Education/Skills** | [Prometheus-X](https://prometheus-x.org) | `education/learning-*` | Consent, Credentials, PDI |
| **Health/Research** | MVD-health | `health/clinical-*` | FHIR, GDPR Art. 9, Consent |

**See `REAL-WORLD-DATASPACE-EXAMPLES.md` for comprehensive details on each operational dataspace.**

## How to Customize This Template

### Phase 2: Domain Specification (You Are Here)

1. **Create your domain branch:**
   ```bash
   git checkout -b {domain}/{use-case-name}
   # Examples:
   git checkout -b manufacturing/traceability-demo  # Catena-X pattern
   git checkout -b energy/grid-balancing           # Energy-Data-X pattern
   git checkout -b mobility/traffic-optimization   # MDS pattern (Germany)
   git checkout -b mobility/trip-planner           # EONA-X pattern (Multi-country)
   git checkout -b education/skills-matching       # Prometheus-X pattern
   ```

2. **Customize specifications:**
   - `constitution.md` - Add domain regulatory requirements (GDPR, sector-specific)
   - `spec.md` - Define use cases, actors, workflows
   - `spec.yaml` - Create OpenAPI/AsyncAPI for domain APIs
   - `regulatory-inventory.md` - List all applicable regulations and standards

3. **Configure ODRL policies** (`policies/`):
   - **MembershipCredential** - Dataspace membership (all dataspaces)
   - **Purpose-based** - Catena-X: PCF calculation, Traceability
   - **Consent-based** - Prometheus-X: Learner data, EONA-X: Travel data
   - **Real-time** - Energy-Data-X: Grid balancing windows
   - See `policies/README.md` for comprehensive ODRL patterns

4. **Define data models** (`data-models/`):
   - **Catena-X**: Industry Core (PartInstance, PartType), SAMM aspects
   - **Energy-Data-X**: Smart meter readings, balancing group schemas
   - **EONA-X**: Trip schemas, booking data, multimodal connections
   - **Prometheus-X**: Learner profiles, credentials (OpenBadges, VC)
   - See `data-models/README.md` for JSON Schema patterns

5. **Follow the BLUEPRINT:**
   - Phase 2 (Current): Specification templates ✓
   - Phase 3: Core extensions (policy functions, DID resolvers)
   - Phase 4: Testing framework (spec validation)
   - Phase 5: Seeding and deployment
   - Phase 6: Production hardening
   - See `docs/spec-driven-dev-mvd-instructions.md` for complete process

## Directory Structure

```
.specify/
├── README.md                         # This file - comprehensive guide
├── REAL-WORLD-DATASPACE-EXAMPLES.md  # Operational dataspaces reference
├── DOMAIN-BRANCHING-GUIDE.md         # Domain branch patterns
│
├── constitution.md                   # Non-negotiable rules (template)
├── spec.md                           # High-level specification (template)
├── spec.yaml                         # OpenAPI/AsyncAPI specification (template)
├── regulatory-inventory.md           # Compliance checklist (template)
│
├── policies/                         # ODRL policy templates
│   ├── README.md                     # Comprehensive ODRL guide
│   ├── membership-credential-policy.json      # Dataspace membership (all)
│   ├── bpn-credential-policy.json             # Business Partner Number (Catena-X)
│   └── purpose-usage-policy.json              # Purpose-based + deletion duty
│
└── data-models/                      # JSON Schema templates
    ├── README.md                     # Data modeling guide
    └── generic-schema-template.json  # Base JSON Schema template
```

**New in Phase 2**: Added comprehensive examples from Catena-X, Energy-Data-X, EONA-X, and Prometheus-X.

## Key Principles

1. **Specifications as Law:** All code must reference and conform to specs
2. **Tests Validate Specs:** Automated tests ensure specs are implemented correctly
3. **Deployment is Verified:** Code reaches production only if 100% spec-compliant
4. **Drift is Impossible:** Specifications and code are always synchronized
5. **Domain Branches:** Each industry/use case maintains its own branch
6. **Real-World Patterns:** Learn from operational dataspaces (Catena-X, EONA-X, etc.)

## Real-World Dataspace Examples

### 1. Catena-X (Automotive/Manufacturing)
**Reference**: https://catenax-ev.github.io/docs/next/standards/overview

**Key Standards Implemented in MVD**:
- **CX-0152**: Policy Constraints for Data Exchange → `policies/bpn-credential-policy.json`, `policies/purpose-usage-policy.json`
- **CX-0151**: Industry Core Basics → `data-models/` with PartInstance/PartType patterns
- **CX-0049**: DID Document Schema → `extensions/did-example-resolver/`
- **CX-0018**: Dataspace Connectivity → `launchers/controlplane/` with DSP/DCP
- **CX-0050**: Credential Wallet → `launchers/identity-hub/`
- **CX-0001**: Participant Registration → `extensions/catalog-node-resolver/`

**Use Cases (KITs)**:
- **Traceability KIT**: Digital twins for part tracking, notification API
- **PCF KIT**: Product Carbon Footprint calculation with purpose constraint
- **Quality KIT**: Quality investigation notifications

**Branch Pattern**:
```bash
git checkout -b manufacturing/automotive-traceability
# Customize for automotive supply chain traceability
# Follow Catena-X Industry Core data model
# Implement BPN-based access control
```

**Policy Pattern** (CX-0152):
```json
{
  "odrl:constraint": [
    {"odrl:leftOperand": "cx-policy:Membership", "odrl:operator": "eq", "odrl:rightOperand": "active"},
    {"odrl:leftOperand": "cx-policy:FrameworkAgreement", "odrl:operator": "eq", "odrl:rightOperand": "traceability:1.0"},
    {"odrl:leftOperand": "cx-policy:UsagePurpose", "odrl:operator": "eq", "odrl:rightOperand": "cx.core.qualityNotification"}
  ]
}
```

### 2. Energy-Data-X (Energy/Utilities)
**Reference**: https://energydata-x.eu

**Key Features**:
- Gaia-X compliant energy dataspace (Germany)
- Real-time smart meter gateway data
- TSO/DSO coordination for grid balancing
- 17-partner consortium (TenneT, Amprion, Fraunhofer, Atos, Microsoft)

**Use Cases**:
1. Cross-sectoral flexibility development
2. Balancing group management optimization
3. Grid congestion forecasting

**Branch Pattern**:
```bash
git checkout -b energy/smart-grid-balancing
# Customize for energy flexibility markets
# Implement IEC 61850 compliance policies
# Add smart meter data models (IEC 62056)
```

**Policy Pattern** (Grid Operator Access):
```json
{
  "odrl:constraint": [
    {"odrl:leftOperand": "energy:GridOperatorLicense", "odrl:operator": "eq", "odrl:rightOperand": "TSO"},
    {"odrl:leftOperand": "energy:DataPurpose", "odrl:operator": "eq", "odrl:rightOperand": "balancing"},
    {"odrl:leftOperand": "odrl:dateTime", "odrl:operator": "gteq", "odrl:rightOperand": {"@value": "2024-01-01T00:00:00Z", "@type": "xsd:dateTime"}}
  ]
}
```

**Data Model Pattern** (Smart Meter Reading):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "meterId": {"type": "string", "pattern": "^[A-Z0-9]{10,20}$"},
    "timestamp": {"type": "string", "format": "date-time"},
    "reading": {"type": "number", "minimum": 0},
    "unit": {"enum": ["kWh", "MWh"]},
    "gridOperatorId": {"type": "string"}
  }
}
```

### 3. EONA-X (Mobility, Transport & Tourism)
**Reference**: https://eona-x.eu

**Key Features**:
- Gaia-X lighthouse project (operational since 2022)
- Members: Amadeus, Renault, Air France-KLM, Groupe ADP, SNCF
- Paris 2024 Olympics digital twin (flagship use case)
- Multimodal transport data exchange

**Use Cases**:
1. Multimodal trip tracking (train + plane + taxi + hotel)
2. MaaS (Mobility-as-a-Service) for corporate commuting
3. Tourism coordination (airport + accommodation + attractions)
4. Event management (Olympics delegation logistics)

**Branch Pattern**:
```bash
git checkout -b mobility/multimodal-trip-planner
# Customize for mobility data exchange
# Implement GDPR travel data consent policies
# Add trip/booking data models (GTFS, NeTEx)
```

**Policy Pattern** (Traveler Consent):
```json
{
  "odrl:permission": [{
    "odrl:action": "odrl:use",
    "odrl:constraint": [
      {"odrl:leftOperand": "mobility:TravelerConsent", "odrl:operator": "eq", "odrl:rightOperand": "granted"},
      {"odrl:leftOperand": "mobility:DataCategory", "odrl:operator": "isAnyOf", "odrl:rightOperand": ["location", "booking"]},
      {"odrl:leftOperand": "mobility:Purpose", "odrl:operator": "eq", "odrl:rightOperand": "trip-planning"}
    ]
  }]
}
```

### 4. Prometheus-X (Education & Skills)
**Reference**: https://prometheus-x.org

**Key Features**:
- Data Space of Education and Skills (DASES)
- Personal Data Intermediary (PDI) for learner sovereignty
- Service Chain Protocol for multi-party workflows
- Intercontinental use case (EU-Korea skills matching)

**Use Cases**:
1. Skills matching (job seekers ↔ employers)
2. Credential verification (digital diplomas)
3. Personalized learning (AI-driven paths)
4. EdTech data marketplace

**Branch Pattern**:
```bash
git checkout -b education/skills-matching
# Customize for education data exchange
# Implement learner consent (GDPR + FERPA)
# Add credential schemas (OpenBadges, W3C VC)
```

**Policy Pattern** (Learner-Initiated):
```json
{
  "odrl:permission": [{
    "odrl:assigner": "did:web:learner-identity",
    "odrl:action": "odrl:distribute",
    "odrl:constraint": [
      {"odrl:leftOperand": "education:ConsentType", "odrl:operator": "eq", "odrl:rightOperand": "explicit"},
      {"odrl:leftOperand": "education:DataCategory", "odrl:operator": "isAnyOf", "odrl:rightOperand": ["diploma", "transcript"]},
      {"odrl:leftOperand": "education:Purpose", "odrl:operator": "eq", "odrl:rightOperand": "job-application"}
    ]
  }]
}
```

**Data Model Pattern** (Learner Credential):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "credentialId": {"type": "string", "format": "uuid"},
    "issuerId": {"type": "string", "format": "uri"},
    "learnerId": {"type": "string", "pattern": "^did:web:.*"},
    "credentialType": {"enum": ["Degree", "Certificate", "Badge"]},
    "issuedAt": {"type": "string", "format": "date-time"},
    "verifiableCredential": {"type": "object"}
  },
  "required": ["credentialId", "issuerId", "learnerId", "credentialType"]
}
```

## Common Technical Patterns Across Dataspaces

| Component | Catena-X | Energy-Data-X | MDS | EONA-X | Prometheus-X |
|-----------|----------|---------------|-----|---------|-------------|
| **Connector** | EDC | IDS/EDC | MDS Connector (EDC) | EDC MVD | PDC (IDS-compliant) |
| **Identity** | did:web, BPN | Gaia-X Identity | IDSA Identity | X.509 DAPS | Personal Data Intermediary |
| **Catalog** | Federated Catalog | IDSA Metadata Broker | Data Catalog | Federated Catalog | Catalog Service |
| **Policies** | ODRL (CX-0152) | Gaia-X policies | Data Sovereignty | Gaia-X + ODRL | ODRL + Consent |
| **Standards** | DSP, DCP | IDSA, Gaia-X | IDS-RAM, Gaia-X | DSP, IDSA | DSP, IDS |

**All dataspaces share**:
- Eclipse Dataspace Components (EDC) or IDS-compliant connectors
- ODRL for policy expression
- Gaia-X trust framework alignment
- W3C Verifiable Credentials for identity
- Federated catalogs for asset discovery

## Implementation Workflow

### Step 1: Choose Your Domain
Review `REAL-WORLD-DATASPACE-EXAMPLES.md` and pick the operational dataspace closest to your use case.

### Step 2: Create Domain Branch
```bash
git checkout -b {domain}/{use-case}
# Follow naming convention in DOMAIN-BRANCHING-GUIDE.md
```

### Step 3: Customize Specifications
1. **Update `constitution.md`** with regulatory requirements:
   - Catena-X: CX-0018 (Dataspace Connectivity), CX-0049 (DID), CX-0050 (Credentials)
   - Energy: GDPR + national energy regulations (EnWG, IEC 61850)
   - Mobility: GDPR + transport regulations (rail, aviation, maritime)
   - Education: GDPR + FERPA (US) or equivalent

2. **Update `spec.md`** with use case workflows:
   - Define actors (providers, consumers, intermediaries)
   - Document data flows (B2B, B2C, multi-party)
   - Specify protocols (DSP, DCP, custom service chains)

3. **Update `spec.yaml`** with API contracts:
   - Catena-X: Notification API (quality alerts, traceability)
   - Energy: Time-series data API (smart meter readings)
   - Mobility: Booking API (multimodal trips)
   - Education: Credential API (issuance, verification)

4. **Create ODRL policies** in `policies/`:
   - Reference `policies/README.md` for comprehensive examples
   - Use templates: membership, BPN, purpose, consent
   - Add domain-specific constraint types

5. **Define data models** in `data-models/`:
   - Reference `data-models/README.md` for JSON Schema patterns
   - Follow domain standards (SAMM, FHIR, IEC, GTFS, etc.)
   - Include validation rules and examples

### Step 4: Implement Core Extensions
See Phase 3 of BLUEPRINT for:
- Policy evaluation functions (check constraints)
- DID resolvers (custom schemes if needed)
- Domain-specific connectors (IoT, API gateways)

### Step 5: Test and Deploy
See Phase 4-6 of BLUEPRINT for:
- Spec validation tests
- Local deployment (OrbStack/KinD)
- Cloud deployment (Azure AKS, AWS EKS, GKE, StackIT, OVH)

## Next Steps

1. **Read the references:**
   - `REAL-WORLD-DATASPACE-EXAMPLES.md` - Operational dataspaces
   - `DOMAIN-BRANCHING-GUIDE.md` - Branch patterns and workflows
   - `policies/README.md` - ODRL policy comprehensive guide
   - `data-models/README.md` - JSON Schema data modeling guide

2. **Study operational dataspaces:**
   - Catena-X: https://catenax-ev.github.io/docs/next/standards/overview
   - Tractus-X KITs: https://eclipse-tractusx.github.io/Kits
   - Energy-Data-X: https://energydata-x.eu
   - Mobility Data Space (MDS): https://mobility-dataspace.eu
   - EONA-X: https://eona-x.eu
   - Prometheus-X: https://prometheus-x.org

3. **Create your domain branch and customize:**
   ```bash
   git checkout -b {domain}/{use-case}
   # Edit .specify/ templates
   # Follow BLUEPRINT phases 2-6
   ```

4. **Use AI assistance for code generation:**
   - GitHub Copilot with spec comments
   - Warp AI with specification context
   - Reference specs in code comments for validation

## Domain Branch Quick Reference

| Branch Pattern | Reference | Key Files to Customize |
|----------------|-----------|------------------------|
| `manufacturing/automotive-*` | Catena-X | BPN policies, Industry Core schemas, Notification API |
| `energy/smart-grid-*` | Energy-Data-X | Smart meter schemas, TSO/DSO policies, Real-time API |
| `mobility/traffic-*` | MDS (Germany) | Traffic/parking schemas, Data sovereignty policies, IDS-RAM |
| `mobility/maas-*` | EONA-X | Trip schemas, Consent policies, Booking API |
| `education/skills-*` | Prometheus-X | Credential schemas, Learner consent, Verification API |
| `health/clinical-*` | MVD-health | FHIR resources, GDPR Art. 9 consent, Clinical trials |

**Need help?** Check WARP.md for local development guidance and deployment options.
