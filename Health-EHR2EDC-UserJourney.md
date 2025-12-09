# EHR2EDC with High Privacy and Consent Management – User Journey Study

## Table of Contents
1. Introduction
2. Stakeholders and Roles
3. Assumptions and Scope
4. Target Architecture Overview
5. Consent and Privacy Model
6. User Journey
   6.1 Pre-Enrollment (Patient Onboarding)
   6.2 Study Enrollment and Consent Capture
   6.3 Consent Verification and Policy Provisioning
   6.4 EHR Data Discovery and Eligibility Screening
   6.5 Contract Negotiation (DSP) and Data Transfer Setup
   6.6 De-identification / Pseudonymization and Provenance
   6.7 EDC Ingestion and Study Data Lock
   6.8 Re-consent, Consent Revocation, and Data Recall
   6.9 Post-Study Archival and Audit
7. Prometheus-X Integration Pattern
8. Data Model and Standards Mapping
9. Security, Trust, and Compliance Considerations
10. Implementation Notes in MVD-health
11. Open Questions and Next Steps

## 1. Context & Initiatives
This user journey is designed within the context of the **European Health Data Space (EHDS)** and the **German Health Data Use Act (GDNG)**, which mandate secure, interoperable, and consent-managed access to health data for research (secondary use).

### German Landscape (Sphin-X Context)
- **Sphin-X**: A key initiative addressing the decentralization and sovereignty of health data. Sphin-X emphasizes "Data Visiting" (Compute-to-Data) over "Data Sharing" to minimize privacy risks.
- **GDNG & FDZ**: The Forschungsdatenzentrum (FDZ) centralizes claims data, but the GDNG encourages decentralized access to clinical data (EHRs) via secure processing environments.
- **Interop Standards**: Adoption of ISiK (Informationstechnische Systeme in Krankenhäusern) and KBV profiles ensures standard FHIR resources.

### European Context (EHDS)
- **EHDS Regulation**: Establishes "MyHealth@EU" for primary use and "HealthData@EU" for secondary use.
- **TEHDAS**: Defines data quality and governance frameworks that this MVD use case implements via EDC policies.
- **Prometheus-X**: A building block for data intermediation services, providing the architectural blueprint for consent visualization, contract negotiation, and compute-to-data orchestration in compliance with the Data Governance Act (DGA).

## 2. Introduction
This document defines a healthcare use case: extracting consent-gated EHR data into an electronic data capture (EDC) system for clinical research (EHR2EDC), with strong privacy and consent management. It reuses the MVD-health dataspace foundations (EDC, IdentityHub, DCP) and consider  Prometheus-X principal for privacy-preserving analytics and consent management.

## 2. Stakeholders and Roles
- Patient (Data Subject)
- Healthcare Provider (EHR Holder) – Dataspace Provider Connector
- CRO (Research Data Consumer) – Dataspace Consumer Connector
- Ethics Board / DPO (Oversight)
- Issuer Service (Trust Anchor issuing credentials)

## 3. Assumptions and Scope
- Real-world EHR systems expose FHIR R4/R5 APIs; the provider maps EHR assets to dataspace assets.
- EDC is used for policy-controlled data exchange; IdentityHub stores VCs and presentations.
- Consent is granular (purpose, data categories, retention, jurisdictions) and must be machine-enforceable.
- De-identification uses k-anonymity or differential privacy where mandated; provenance is recorded.

## 4. Target Architecture Overview
- Provider Side: EHR Adapter → De-ID Service → Provider Controlplane/Dataplane → IdentityHub.
- Consumer Side: EDC Consumer → EDC-to-EDC (EDC) → Study EDC System (CDISC ODM/SDTM import).
- Trust: Issuer Service issues MembershipCredential and DataProcessorCredential(health.research:processing).
- Prometheus-X: Compute-to-Data execution for aggregated analytics; no raw PHI leaves the provider domain.

## 5. Consent and Privacy Model
- Consent Credential (Verifiable Credential) encodes: subject DID, purposes (research protocol IDs), data categories (FHIR resources), retention, jurisdiction, and revocation endpoint.
- Policy links:
  - Access Policy: requires MembershipCredential + ConsentCredential with purpose=StudyXYZ and scope=minimum-necessary.
  - Contract Policy: obligation to run De-ID and log provenance; prohibition on re-identification.

## 6. User Journey
### 6.1 Pre-Enrollment (Patient Onboarding)
1) Patient receives study information and a DID wallet link.
2) Patient verifies Issuer DID and obtains Membership to the healthcare network (optional).

### 6.2 Study Enrollment and Consent Capture
1) Patient reviews protocol-specific consent (plain + machine-readable JSON-LD).
2) Issuer issues ConsentCredential to the Patient DID; a presentation is shareable with the provider.

### 6.3 Consent Verification and Policy Provisioning
1) Consumer queries catalog; provider evaluates policies using IdentityHub.
2) If ConsentCredential matches purpose and validity, proceed; else request updated consent.

### 6.4 EHR Data Discovery and Eligibility Screening
1) Consumer submits criteria (e.g., ICD-10, age range) as a query; provider responds with counts (privacy budget preserved).
2) Eligibility uses compute-to-data on Prometheus-X to avoid raw data movement during pre-screening.

### 6.5 Contract Negotiation (DSP) and Data Transfer Setup
1) Consumer requests contract; presents MembershipCredential + DataProcessorCredential(health.research:processing) + ConsentPresentation.
2) Provider returns ContractAgreement and EndpointDataReference (EDR) for a scoped FHIR bundle.

### 6.6 De-identification / Pseudonymization and Provenance
1) Dataplane runs De-ID pipeline (remove direct identifiers, pseudonymize, generalize dates/locations).
2) Provenance VC is attached with transformation steps and DP epsilon (if used).

### 6.7 EDC Ingestion and Study Data Lock
1) Consumer fetches de-identified FHIR Bundle → transforms to CDISC SDTM/ODM → loads into EDC (Electronic Data Capture).
2) Lock and audit trail maintained; hash anchored for integrity.

### 6.8 Re-consent, Consent Revocation, and Data Recall
1) Patent will be notified about consumer-initiated data use; re-consent requested if protocol changes.
2) Patient updates or revokes consent; ConsentCredential status changes (revocation list or status endpoint).
3) Provider enforces recall obligations; downstream consumer notified via policy webhook; derived data flagged.

### 6.9 Post-Study Archival and Audit
1) Retention period enforced; data archived or deleted per policy; audit trail kept with minimal metadata.

## 8. Bridging to Prometheus-X: Privacy & Consent Lessons

The **Prometheus-X** ecosystem provides critical building blocks for this use case, particularly in addressing the "high privacy" and "consent management" requirements that standard dataspaces may lack.

### What We Can Learn & Implement
1.  **Consent Visualization & Management**:
    -   *Challenge*: Raw VC-based consent is hard for patients to understand.
    -   *Prometheus-X Solution*: Standardized "Consent Dashboards" that visualize what specific data (e.g., "Mental Health Records") is shared for what purpose (e.g., "Cancer Research").
    -   *MVD Implementation*: The frontend should render the JSON-LD Consent Credential into a human-readable, tiered consent form (granular check-boxes) before signing.

2.  **Contract Negotiation as Privacy Enforcement**:
    -   *Challenge*: Broad access grants lead to privacy leaks.
    -   *Prometheus-X Solution*: Automated contract negotiation where the *privacy budget* (e.g., Differential Privacy epsilon) is a negotiable term.
    -   *MVD Implementation*: Extend the DSP contract definition to include `odrl:constraint` on `privacy:epsilon` < 1.0. The provider's IdentityHub rejects negotiation if the requested privacy budget exceeds the limit.

3.  **Compute-to-Data as Default**:
    -   *Challenge*: Transferring de-identified data (EHR2EDC) still carries re-identification risk.
    -   *Prometheus-X Solution*: "Data Visiting" – the algorithm travels to the data.
    -   *MVD Implementation*: Use the EHR2EDC pipeline only for *final* study data after eligibility is proven via Compute-to-Data. The "transfer" is actually a "remote execution" result, not a bulk dump, unless explicitly consented for specific patient cohorts.

### Integration Architecture
-   **Catalog Federation**: Sphin-X catalogs can harvest metadata (DCAT-AP) to make these datasets discoverable EU-wide.
-   **Trust Anchors**: Mutual recognition of Prometheus-X and MVD Identity issuers (e.g., generic `did:web` trust lists).
-   **Privacy Information Protection Checks (PIPC)** defined in access and usage policies during contract negotiation and check during the data transfer. 

## 8. Data Model and Standards Mapping
- FHIR resources: Patient, Encounter, Condition, Observation, Procedure, MedicationStatement, AllergyIntolerance, DiagnosticReport.
- CDISC mapping: SDTM domains (DM, AE, CM, LB, VS), ODM for study metadata.
- ConsentCredential aligns with HL7 FHIR Consent and AOC (authorization of care) semantics; serialized as VC JSON-LD.

## 9. Security, Trust, and Compliance Considerations
- DIDs + VCs for participant, consent, processor role; revocation via status lists.
- Data minimization: purpose-bound queries; least-privilege scopes; privacy budgets.
- Regional compliance: GDPR (EU), BDSG (DE); logging without PHI; DPIA recommended.

## 10. Implementation Notes in MVD-health
- New extension: `extensions/consent-impl` implementing ConsentCredential evaluation (similar to `dcp-impl`).
- Provider-side De-ID microservice wired into Dataplane HTTP-PULL; configurable k-anonymity/diff-privacy.
- New assets: cohort query endpoints returning FHIR Bundles; policies referencing consent and processor scopes.
- Frontend: add study workflow pages; show consent status, compute-to-data job status.
- For the demo dont use trademarks, please use generic names like "HealthDataSpace" instead of "Sphin-X". Find names that do not infringe on trademarks.

### 10.1 Docker Deployment Architecture & Endpoints

The MVD-health demo runs as a multi-container Docker Compose setup with the following components:

| Component | Container | Port(s) | Purpose | Key Endpoints |
|-----------|-----------|---------|---------|---------------|
| **Frontend** | `aerospace-frontend` | 3000 | React UI for browsing EHR catalog, viewing FHIR records, managing consent | `http://localhost:3000/` - Main UI<br>`http://localhost:3000/health` - Health check |
| **Backend Mock** | `dpp-backend` | 3001 | Mock EHR server with 20 anonymized FHIR R4 records | `http://localhost:3001/api/ehr/:id` - Get EHR record<br>`http://localhost:3001/health` - Health check<br>`http://localhost:3001/api/ehr` - List all records |
| **Consumer Control Plane** | Consumer Connector | 8080-8085 | EDC connector for research data consumer (CRO) | `http://localhost:8081/api/management/v3/catalog/request` - Query catalog<br>`http://localhost:8081/api/management/v3/contractnegotiations` - Negotiate contracts<br>`http://localhost:8082/api/dsp` - Dataspace Protocol endpoint |
| **Consumer Data Plane** | Consumer Connector | 11001 | Data transfer proxy for consumer | `http://localhost:11001/api/public` - Public data endpoint |
| **Consumer Identity Hub** | Consumer IdentityHub | 7080-7086 | Identity & credential management for consumer | `http://localhost:7082/api/identity` - Identity resolution<br>`http://localhost:7081/api/credentials` - Verifiable credentials<br>`http://localhost:7086/api/sts` - Security Token Service |
| **Provider Control Plane** | Provider Connector | 8190-8195 | EDC connector for healthcare provider (EHR holder) | `http://localhost:8191/api/management/v3/assets` - Manage EHR assets<br>`http://localhost:8191/api/management/v3/policydefinitions` - Manage policies<br>`http://localhost:8192/api/dsp` - Dataspace Protocol endpoint |
| **Provider Data Plane** | Provider Connector | 11002 | Data transfer proxy serving de-identified EHR data | `http://localhost:11002/api/public` - Public data endpoint |
| **Provider Identity Hub** | Provider IdentityHub | 7090-7096 | Identity & credential management for provider | `http://localhost:7092/api/identity` - Identity resolution<br>`http://localhost:7091/api/credentials` - Verifiable credentials<br>`http://localhost:7096/api/sts` - Security Token Service<br>`http://localhost:7093/` - DID document endpoint |
| **Provider Catalog Server** | Catalog Server | 8090-8093 | Federated catalog aggregating EHR assets | `http://localhost:8091/api/management/v3/catalog` - Catalog management<br>`http://localhost:8092/api/dsp` - DSP catalog endpoint |
| **Issuer Service** | Issuer Service | 10010-10015 | Trust anchor issuing membership & consent credentials | `http://localhost:10012/api/issuance` - Issue credentials<br>`http://localhost:10013/api/admin` - Admin API<br>`http://localhost:10015/api/identity` - Issuer identity |

#### Component Explanations

**Frontend (React SPA)**
- Provides the user interface for browsing the EHR catalog with multi-dimensional filtering (Age Band, Study Phase, MedDRA SOC, Medical Category)
- Displays detailed FHIR-compliant health records including:
  - Patient demographics & vital signs
  - Clinical Trial Information (phase, study type, intervention model)
  - MedDRA classification (System Organ Class, Preferred Terms)
  - Signal verification & Adverse Drug Reactions (ADRs)
  - 5-step Anamnesis (chief complaint, history, past medical history, family history, social history)
- Integrates with backend mock via REST API for data retrieval

**Backend Mock (EHR Server)**
- Simulates a FHIR R4-compliant Electronic Health Record system
- Serves 20 anonymized patient records enriched with clinical trial metadata
- Each record includes:
  - Standard FHIR resources (Patient, Condition, Observation, Procedure, Medication)
  - Clinical trial nodes (phase, protocol, endpoints)
  - MedDRA coding (SOC 10-digit codes, PT codes, HLT hierarchies)
  - Signal verification data (suspected ADRs with severity, causality, outcome)
  - Structured anamnesis following German clinical workflow
- Data model aligns with CDISC SDTM for downstream EDC integration

**Consumer Connector (EDC Control & Data Plane)**
- Represents the research organization (CRO) consuming EHR data for clinical studies
- Control Plane (ports 8080-8085):
  - Queries the federated catalog to discover available EHR datasets
  - Negotiates Dataspace Protocol (DSP) contracts with providers
  - Enforces access policies requiring MembershipCredential + ConsentCredential
  - Manages transfer processes for fetching de-identified FHIR bundles
- Data Plane (port 11001):
  - Receives data streams via HTTP-PULL from provider data plane
  - Applies consumer-side transformation pipelines (FHIR → CDISC ODM/SDTM)
  - Validates data integrity using provenance VCs

**Consumer Identity Hub**
- Stores and manages Verifiable Credentials for the consumer participant
- Issues presentations combining:
  - DataProcessorCredential (scope: `health.research:processing`)
  - ConsentPresentation (proves patient authorization for specific study)
- Resolves `did:web:localhost:7083` identity for the consumer
- STS endpoint (port 7086) issues OAuth2 tokens for inter-connector authentication

**Provider Connector (EDC Control & Data Plane)**
- Represents the healthcare institution holding EHR data
- Control Plane (ports 8190-8195):
  - Publishes EHR assets to the dataspace with DCAT-AP metadata
  - Enforces consent-based access policies:
    - Access Policy: requires valid ConsentCredential with matching `purpose` and `data categories`
    - Usage Policy: mandates de-identification, prohibits re-identification
  - Evaluates contract offers against policy constraints
- Data Plane (port 11002):
  - Runs de-identification pipeline before data egress:
    - Removes direct identifiers (names, SSNs, addresses)
    - Pseudonymizes patient IDs using deterministic hashing
    - Generalizes dates, locations (k-anonymity ≥ 5)
    - Optionally applies differential privacy (ε-DP) for aggregate queries
  - Attaches provenance metadata (transformation steps, DP epsilon)

**Provider Identity Hub**
- Manages credentials for the healthcare provider participant
- Stores ConsentCredentials issued by patients via the Issuer Service
- Resolves `did:web:localhost:7093` identity
- DID document endpoint (port 7093) publishes public keys for signature verification
- STS endpoint (port 7096) issues tokens for provider-side authentication

**Provider Catalog Server**
- Aggregates EHR asset metadata from multiple provider connectors (federated catalog)
- Exposes DCAT-AP compliant catalog via DSP protocol
- Enables consumer discovery without revealing patient-level data
- Caches catalog state (refresh interval: 10 seconds)
- Management API (port 8091) for adding/updating catalog entries

**Issuer Service (Trust Anchor)**
- Acts as the root of trust for the MVD dataspace
- Issues foundational credentials:
  - **MembershipCredential**: Proves participant is authorized member of the health dataspace
  - **DataProcessorCredential**: Attests that consumer has lawful basis for research processing (GDPR Art. 9(2)(j))
  - **ConsentCredential**: Machine-readable patient consent encoding:
    - Study protocol ID (`purpose`)
    - Allowed data categories (FHIR resource types)
    - Retention period, jurisdiction constraints
    - Revocation endpoint
- Maintains status lists for credential revocation
- Admin API (port 10013) for credential lifecycle management

#### Authentication & Authorization Flow

1. **Consumer queries catalog** → Catalog Server returns EHR asset metadata
2. **Consumer initiates contract negotiation** → Provider evaluates:
   - Consumer presents `MembershipCredential` + `DataProcessorCredential` (from IdentityHub 7082)
   - Consumer includes `ConsentPresentation` proving patient authorized data use for study X
3. **Provider validates consent** → IdentityHub 7092 verifies:
   - Consent credential not revoked (check Issuer status list)
   - `purpose` in consent matches asset's `health:studyPurpose` property
   - `dataCategories` in consent cover requested FHIR resources (e.g., Condition, Observation)
4. **Contract agreed** → Provider issues `EndpointDataReference` (EDR) with bearer token
5. **Consumer fetches data** → Data Plane 11002:
   - Token validated against STS 7096
   - De-ID pipeline executes (remove PII, pseudonymize, generalize)
   - Provenance VC attached: `{"transformations": ["anonymize"], "epsilon": 1.0, "timestamp": "..."}`
6. **Data transferred** → Consumer Data Plane 11001 receives FHIR bundle → transforms to CDISC SDTM

#### Security Considerations

- **No TLS in local demo**: `EDC_IAM_DID_WEB_USE_HTTPS=false` (must enable for production)
- **Static auth keys**: Management APIs use `password` token (replace with OAuth2/OIDC)
- **Superuser credentials**: IdentityHubs use base64 `c3VwZXItdXNlcg==.c3VwZXItc2VjcmV0LWtleQo=` (rotate in production)
- **Consent revocation**: Patient updates ConsentCredential status → Provider must reject future requests (webhook or polling)
- **Data minimization**: Policies enforce least-privilege scopes; queries return only consent-authorized fields

#### Starting the Demo

```bash
# 1. Start all services
docker-compose -f docker-compose.health.yml up --build

# 2. Wait for all containers to be healthy (check logs)
docker-compose -f docker-compose.health.yml logs -f

# 3. Seed the dataspace with participants, assets, and policies
./seed-health.sh

# 4. Access the frontend
open http://localhost:3000
```

The seeding script performs:
- Creates 5 EHR assets (EHR001-EHR005) with clinical trial metadata
- Defines access policies referencing `ConsentCredential` and `MembershipCredential`
- Publishes assets to catalog server
- Issues baseline credentials to consumer/provider IdentityHubs

## 11. Open Questions and Next Steps
- Consent granularity for genomic data and imaging?
- Cross-jurisdiction consent portability (DE federal states)?
- Pilot with synthetic FHIR dataset; define CI jobs to validate de-ID and policy evaluation.
