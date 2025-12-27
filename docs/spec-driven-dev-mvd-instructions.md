# Specification-Driven Development Blueprint for Dataspaces

## Executive Summary

This document defines a complete, six-phase specification-driven development (SDD) blueprint for building production-grade dataspaces across any domain. Grounded in your health-demo experience and GitHub Spec Kit methodology, this blueprint transforms the traditional SDLC by making **specifications the source of truth** rather than a separate artifact.

The approach ensures that compliance requirements (GDPR, FHIR, DSP, DCP), security constraints, and regulatory obligations are embedded in the specification from day one and verified automatically at every stage of development. Using tools like GitHub Spec Kit, Postman, Prism, Newman, dsp-tck/dcp-tck, and GitHub Actions, specifications directly drive code generation, testing, and deployment with zero tolerance for specification-code drift.

**Key Outcomes:**
- ✅ 100% specification compliance at all times
- ✅ 100% automated regulatory compliance testing
- ✅ Zero-trust deployment (spec-verified code only)
- ✅ 6-week timeline from concept to production
- ✅ Reusable template for any domain via branch-based instantiation

---

## Quick Start: Main Branch Cleanup & Template Structure

**Goal:** Transform main branch into a clean, reusable template with minimal skeleton files.

**Result:**
- Main branch contains ONLY template `.specify/` directory and essential skeleton
- No health-demo code, no example implementations
- Domain branches inherit and customize `.specify/` for their needs
- Reduced file clutter; focused documentation in `/docs`

### Minimal Main Branch Structure

```
MinimumViableDataspace/
├── .specify/                         # ← ONLY this (template)
│   ├── constitution.md               # Template with [ ] checkboxes
│   ├── spec.md                       # Template with DOMAIN placeholders
│   ├── spec.yaml                     # OpenAPI template
│   ├── regulatory-inventory.md       # Compliance checklist template
│   ├── policies/
│   │   ├── odrl-policies.yaml
│   │   ├── gdpr-policies.yaml
│   │   └── dsp-policies.yaml
│   ├── data-models/
│   │   └── schema-template.json
│   ├── postman-collection.json
│   └── README.md                     # "How to customize this template"
│
├── src/skeleton/                      # Skeleton only, NO implementations
│   ├── components/README.md
│   ├── api/README.md
│   ├── services/README.md
│   └── index.tsx.template
│
├── server/skeleton/                   # Skeleton only, NO implementations
│   ├── connectors/README.md
│   ├── policies/README.md
│   └── index.ts.template
│
├── tests/templates/                   # Test templates only
│   ├── unit.test.template.ts
│   ├── compliance.test.template.ts
│   └── README.md
│
├── k8s/templates/                     # Kubernetes templates only
│   ├── deployment.yaml.template
│   └── README.md
│
├── .github/workflows/                 # CI/CD workflows (reusable)
│   ├── spec-validation.yml
│   ├── compliance-tests.yml
│   └── build-and-deploy.yml
│
├── docs/                              # Documentation (NOT code)
│   ├── 01-BLUEPRINT-OVERVIEW.md
│   ├── 02-PHASE1-SETUP.md
│   ├── 03-PHASE2-SPECS.md
│   ├── 04-PHASE3-FRONTEND.md
│   ├── 05-PHASE4-WORKSHOPS.md
│   ├── 06-PHASE5-TESTING.md
│   ├── 07-PHASE6-DEPLOYMENT.md
│   ├── 08-BRANCH-STRATEGY.md
│   ├── 09-CLEANUP-CHECKLIST.md
│   ├── GLOSSARY.md
│   └── COMMAND-REFERENCE.md
│
├── package.json                       # Dependencies only
├── tsconfig.json
├── jest.config.js
├── Dockerfile.template
├── docker-compose.template.yml
└── README.md                          # "Start here"
```
---

## Part 1: The Spec-Driven Paradigm

### 1.1 Traditional SDLC vs. Specification-Driven Development

**Traditional SDLC Problem:**
```
Specification → Design → Development → Testing → Deployment
                       ↓ DRIFT OCCURS ↓
Code doesn't match specification. Compliance gaps discovered late. Expensive rework.
```
**Specification-Driven Development Solution:**
```
1. GitHub Spec Kit Constitution & Spec  
    ↓ (Spec as source of truth)
2. OpenAPI Specification + YAML Regulatory Schemas  
    ↓ (Automatic mock API generation)
3. Prism Mock API (Day 3) → Frontend Team Starts
    ↓ (Automatic code generation)
4. GitHub Copilot / Warp AI-Driven Implementation  
    ↓ (Automatic verification)
5. Newman Contract Tests + dsp-tck/dcp-tck Protocol Tests (Continuous)
    ↓ (Automatic compliance validation)
6. Automated GDPR/FHIR/DSP Compliance Tests (Continuous)
    ↓ (Automatic zero-trust deployment)
7. Docker + GitHub Actions → Kubernetes (Only if 100% compliant)
```

**Key Principle:** Specifications and code are always in sync. Drift is mathematically impossible.

### 1.2 Core Tenets of Spec-Driven Development

| Tenet | Meaning | Implementation |
|-------|---------|-----------------|
| **Specifications as Law** | All code must reference and conform to specs | Every function, endpoint, policy has linked spec artifact |
| **Tests Validate Specs** | Automated tests ensure specs are implemented correctly | Unit tests, Contract tests, Protocol compliance tests run on every commit |
| **Deployment is Verified** | Code reaches production only if 100% spec-compliant | GitHub Actions blocks deployment if any test fails |
| **Drift is Impossible** | Specifications and code are always synchronized | String replacement-based updates; changes in spec → automatic code regeneration |
| **Compliance is Automatic** | Regulatory requirements (GDPR, FHIR, DSP) are embedded in specs and tested continuously | GDPR Article 9 test, FHIR R4 test, DSP contract test run on every commit |

### 1.3 The Six-Layer Integration Pipeline

The architecture implements a **six-layer spec-driven pipeline** that transforms specifications into production-ready systems:

```
Layer 1: GitHub Spec Kit & Constitution
├─ Specification management & version control
├─ Non-negotiable rules (security, quality gates)
└─ Regulatory checklist as executable constraints

    ↓ (spec.md → spec.yaml)

Layer 2: OpenAPI + YAML Specifications
├─ RESTful API contracts (OpenAPI 3.1)
├─ Data models (JSON Schema)
├─ Policy definitions (ODRL)
├─ Regulatory constraints (GDPR, FHIR, DSP)
└─ Produces: Comprehensive spec documentation

    ↓ (spec.yaml → mock)

Layer 3: Prism Mock API Server
├─ Instant, realistic API mock from OpenAPI spec
├─ Dynamic response generation
├─ Request/response validation
├─ Enables frontend team to start immediately
└─ Produces: Working HTTP API (no backend code needed yet)

    ↓ (mock + spec → tasks)

Layer 4: GitHub Spec Kit Task Generation
├─ /specify workflow: Extracts requirements from spec
├─ /plan workflow: Generates technical architecture plan
├─ /tasks workflow: Creates granular implementation tasks (27-40 per phase)
├─ Each task is spec-linked with acceptance criteria
└─ Produces: Prioritized, AI-friendly implementation queue

    ↓ (tasks → code)

Layer 5: GitHub Copilot AI-Driven Implementation
├─ Developers review AI-generated code (not write from scratch)
├─ Code generator reads spec + task description
├─ Produces code guaranteed to match spec
├─ All code includes spec citations and compliance markers
└─ Produces: Spec-verified implementation

    ↓ (implementation → tests)

Layer 6: Automated Testing & Compliance Verification
├─ Unit tests verify individual functions match spec
├─ Contract tests (Newman) verify API contracts match OpenAPI
├─ Protocol compliance tests (dsp-tck, dcp-tck) verify DSP/DCP conformance
├─ Regulatory tests (GDPR, FHIR, eIDAS) verify legal compliance
├─ Only code passing 100% of tests reaches production
└─ Produces: Zero-defect, spec-verified, regulation-compliant deployment

    ↓ (verified → deploy)

Layer 7: Zero-Trust Deployment
├─ Docker image built only from spec-verified code
├─ GitHub Actions CI/CD enforces quality gates
├─ Kubernetes deployment with immutable tags
├─ Real-time monitoring of system health & business metrics
└─ Produces: Production-ready, compliant
```

Each layer adds value by ensuring specifications are correctly implemented and verified.

---

## Part 2: Six-Phase Implementation Blueprint

### Phase 1: Setup, Regulatory Inventory & Design 

**Objective:** Establish the constitutional framework, enumerate all regulatory requirements, and design the system visually before any code is written.

#### 1.1 Initialize GitHub Spec Kit

**Deliverable:** `.specify/` directory with complete specification framework

**Tools:** GitHub Spec Kit CLI, VS Code, GitHub Copilot

**Steps:**

1. **Create `.specify/` directory structure:**
   .specify/
   ├── constitution.md          # Non-negotiable rules (security, quality, compliance)
   ├── spec.md                  # High-level project spec
   ├── spec.yaml                # Machine-readable OpenAPI + regulatory schemas
   ├── plan.md                  # Technical architecture plan
   ├── regulatory-inventory.md  # Complete compliance checklist
   ├── policies/
   │   ├── odrl-policies.yaml   # Data access & sharing policies
   │   ├── gdpr-policies.yaml   # GDPR consent & processing rules
   │   └── dsp-policies.yaml    # Dataspace Protocol policies
   ├── data-models/
   │   ├── core-schemas.json    # JSON Schema for domain entities
   │   ├── dpp-schema.json      # Digital Product Passport (if applicable)
   │   └── regulatory-schemas.json
   └── tasks/
       ├── phase-1-setup.md     # Placeholder for generated tasks
       ├── phase-2-specs.md
       ├── phase-3-frontend.md
       ├── phase-4-backend.md
       ├── phase-5-testing.md
       └── phase-6-deployment.md

2. **Create `constitution.md`** (Non-negotiable rules):

   # Constitution: Non-Negotiable Development Rules

   ## Security Constraints
   - [ ] All APIs must be TLS 1.3 minimum
   - [ ] All data at rest must be encrypted (AES-256)
   - [ ] API keys rotate every 90 days
   - [ ] No credentials in source code (use GitHub Secrets)
   - [ ] All external calls require mutual TLS (mTLS)

   ## Regulatory Compliance Gates
   - [ ] GDPR: Consent must be recorded before processing personal data
   - [ ] GDPR Article 9: Special categories data (health) requires explicit consent
   - [ ] FHIR R4: All health data responses must validate against HL7 FHIR schema
   - [ ] DSP: All transfers must comply with Dataspace Protocol 1.0.0
   - [ ] eIDAS: All identity assertions must use W3C Verifiable Credentials

   ## Code Quality Gates
   - [ ] All public APIs must have OpenAPI spec
   - [ ] All functions must have unit tests (>85% coverage)
   - [ ] All APIs must pass contract tests (Newman)
   - [ ] All code must be reviewed before merge
   - [ ] Zero known security vulnerabilities (OWASP)

   ## Deployment Gates
   - [ ] All automated tests must pass (unit + contract + protocol + compliance)
   - [ ] All compliance reports must be generated and reviewed
   - [ ] All dependent services must be available
   - [ ] All monitoring and alerting must be configured

3. **Create `spec.md`** (High-level project spec):

   # Dataspace Specification

   ## Goals
   - Enable secure, privacy-preserving data sharing across [DOMAIN]
   - Ensure 100% compliance with GDPR, [FHIR/HIPAA/CCPA/other relevant standards]
   - Achieve zero specification-code drift
   - Deploy to production in 6 weeks with zero rework

   ## Key Users
   - **Data Providers:** Share data assets via catalog
   - **Data Consumers:** Discover, negotiate access, consume data
   - **Compliance Officers:** Audit, verify regulatory adherence
   - **Operators:** Monitor, maintain, update dataspace

   ## Core Workflows
   1. **Data Catalog Discovery:** Consumers browse provider catalog
   2. **Contract Negotiation:** Consumer + Provider agree on terms
   3. **Credential Verification:** Consumer proves compliance (GDPR consent, FHIR role, etc.)
   4. **Data Transfer:** Consumer fetches data over DSP
   5. **Audit Logging:** All transactions logged for compliance

   ## Non-Functional Requirements
   - **Availability:** 99.9% uptime
   - **Performance:** <500ms API latency, p99
   - **Scalability:** 10,000 concurrent users
   - **Compliance:** 100% GDPR/FHIR/DSP compliant
   - **Security:** Zero known vulnerabilities

#### 1.2 Create Regulatory Inventory

**Deliverable:** `regulatory-inventory.md` with complete compliance checklist

**Process:**

1. **Identify all applicable regulations:**
   # Regulatory Inventory

   ## General Data Protection Regulation (GDPR)
   - [ ] Article 4: Definitions (lawful basis, consent, etc.)
   - [ ] Article 5: Data protection principles (lawfulness, fairness, transparency, etc.)
   - [ ] Article 6: Lawful basis for processing
   - [ ] Article 7: Conditions for consent
   - [ ] Article 9: Processing of special categories of data
   - [ ] Article 13: Information to be provided to data subjects
   - [ ] Article 21: Right to object
   - [ ] Article 28: Data processing agreements
   - [ ] Article 32: Security of processing

   ## Domain-Specific Standards (if applicable)
   - [ ] HL7 FHIR R4: Electronic Health Records format
   - [ ] HIPAA (US): Patient privacy and security
   - [ ] GDPR Article 9 special rules for health data
   - [ ] NHS Data Security and Protection Toolkit

   ## Data Space Standards
   - [ ] Dataspace Protocol (DSP) 1.0.0: Catalog, negotiation, transfer
   - [ ] Decentralized Claims Protocol (DCP): Verifiable credentials
   - [ ] DCAT: Data Catalog Vocabulary
   - [ ] ODRL: Open Digital Rights Language for policies

   ## Industry-Specific Standards
   - [ ] Catena-X standards (if automotive/manufacturing) Industry Core Hub
   - [ ] GAIA-X compliance (if EU sovereign cloud)
   - [ ] Other domain-specific requirements

2. **Map each regulation to technical requirements:**

   ## GDPR Article 9 → Technical Requirements

   **Regulation:** "Processing of special categories of data [health, genetic, biometric] is prohibited unless..."

   **Technical Requirements:**
   - [ ] Explicit consent must be recorded before ANY health data processing
   - [ ] Consent must be stored immutably (blockchain or versioned database)
   - [ ] Data subject can withdraw consent at any time
   - [ ] Withdrawal must immediately stop all processing
   - [ ] Audit log must record consent state changes
   - [ ] Health data must be encrypted at rest (AES-256)
   - [ ] Health data must be encrypted in transit (TLS 1.3)
   - [ ] k-anonymity must be enforced (no re-identification possible)
   - [ ] Audit API must allow compliance officer to verify compliance

#### 1.3 Design Low-Fidelity Wireframes

**Deliverable:** Wireframes for Consumer & Provider dashboards showing data flow

**Tools:** Excalidraw, Figma, or hand-drawn diagrams (commit to `/docs/wireframes/`)

**Key Diagrams to Create:**

1. **Consumer Workflow:**
   [Catalog View] → [Select Asset] → [View Policy] → [Verify Consent] 
   → [Start Transfer] → [Monitor Progress] → [View Data]

2. **Provider Workflow:**
   [Upload Asset] → [Set Policy] → [Define Schema] → [Set Access Control]
   → [Monitor Requests] → [Approve/Reject] → [Audit Trail]

3. **Data Flow Diagram:**
   Consumer Frontend
          ↓
   Consumer EDC Connector (Contract negotiation, credential verification)
          ↓
   Provider EDC Connector (Policy enforcement, data serving)
          ↓
   Provider Data Backend (DPP storage, audit logging)

**Output:** Commit wireframes to `/docs/wireframes/` with narrative descriptions

---

### Phase 2: Specification & Mock API Generation (Week 1, Days 4-5)

**Objective:** Generate the OpenAPI contract and YAML specifications as the absolute source of truth, then spin up Mock APIs for immediate frontend development.

#### 2.1 Generate OpenAPI Specification

**Deliverable:** `.specify/spec.yaml` with complete API contract

**Tools:** Postman, Swagger Editor, VS Code OpenAPI extension

**Structure:**

openapi: 3.1.0
info:
  title: Dataspace API
  version: 1.0.0
  description: Spec-driven dataspace for [DOMAIN]

paths:
  /catalog:
    get:
      operationId: listAssets
      summary: List all data assets
      tags: [Catalog]
      responses:
        '200':
          description: List of assets
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Asset'

  /catalog/{assetId}:
    get:
      operationId: getAssetDetails
      summary: Get details of a specific asset
      tags: [Catalog]
      parameters:
        - name: assetId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Asset details with policy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetWithPolicy'

  /policies/{assetId}:
    get:
      operationId: getAccessPolicy
      summary: Get data access policy for asset
      tags: [Policy]
      parameters:
        - name: assetId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: ODRL policy with regulatory constraints
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Policy'

  /transfer:
    post:
      operationId: initiateTransfer
      summary: Initiate data transfer
      tags: [Transfer]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TransferRequest'
      responses:
        '200':
          description: Transfer initiated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransferResponse'

components:
  schemas:
    Asset:
      type: object
      required:
        - id
        - title
        - provider
      properties:
        id:
          type: string
          example: "asset-001"
        title:
          type: string
          example: "Flight Engine Specifications"
        description:
          type: string
        provider:
          type: string
          example: "ApexPropulsion Systems"
        dataType:
          type: string
          enum: [DPP, HealthRecord, Document, Dataset]
        createdAt:
          type: string
          format: date-time

    Policy:
      type: object
      required:
        - id
        - permission
      properties:
        id:
          type: string
        permission:
          type: object
          properties:
            action:
              type: array
              items:
                enum: [USE, COPY, TRANSFER, DELETE]
            target:
              type: string
            constraint:
              type: array
              items:
                type: object
                properties:
                  leftOperand:
                    type: string
                    enum: [
                      "urn:odrl:leftOperand:purpose",
                      "urn:odrl:leftOperand:securityLevel",
                      "urn:gdpr:consent",
                      "urn:fhir:role"
                    ]
                  operator:
                    type: string
                  rightOperand:
                    type: string
                example:
                  - leftOperand: "urn:gdpr:consent"
                    operator: "eq"
                    rightOperand: "GDPR_ARTICLE_9_HEALTH"

    TransferRequest:
      type: object
      required:
        - assetId
        - credentials
      properties:
        assetId:
          type: string
        credentials:
          type: array
          items:
            $ref: '#/components/schemas/VerifiableCredential'

    TransferResponse:
      type: object
      properties:
        transferId:
          type: string
        status:
          type: string
          enum: [PENDING, NEGOTIATING, ACTIVE, COMPLETED, FAILED]
        dataUrl:
          type: string
        expiresAt:
          type: string
          format: date-time

    VerifiableCredential:
      type: object
      required:
        - type
        - issuer
        - credentialSubject
      properties:
        type:
          type: array
          items:
            type: string
          example: ["VerifiableCredential", "GDPRConsent"]
        issuer:
          type: string
        credentialSubject:
          type: object
          properties:
            id:
              type: string
            consentTo:
              type: string
            grantedAt:
              type: string
              format: date-time

#### 2.2 Create Regulatory YAML Schemas

**Deliverable:** `.specify/policies/gdpr-policies.yaml`, `fhir-policies.yaml`, etc.

**Example: GDPR Policies**

# .specify/policies/gdpr-policies.yaml
gdpr:
  articles:
    article_9:
      name: "Processing of Special Categories of Data"
      condition: "MUST be explicitly consented to"
      technical_requirements:
        - consent_recorded: true
        - consent_immutable: true
        - encryption_at_rest: "AES-256"
        - encryption_in_transit: "TLS-1.3"
        - k_anonymity_enforced: 5  # minimum 5-anonymity
        - withdrawal_possible: true
        - withdrawal_time_sla: "PT24H"  # 24 hours max
      audit_requirements:
        - log_consent_grants: true
        - log_consent_withdrawals: true
        - log_data_access: true
        - log_data_deletion: true
        - retention_period: "P7Y"  # 7 years (statute of limitations)

    article_6:
      name: "Lawful Basis for Processing"
      condition: "Must have one of: consent, contract, legal obligation, vital interests, public task, legitimate interests"
      technical_requirements:
        - lawful_basis_recorded: true
        - lawful_basis_immutable: true

  consent_types:
    health_data:
      id: "GDPR_ARTICLE_9_HEALTH"
      label: "Consent to Process Health Data"
      required_for: ["HealthRecord", "MedicalData", "GeneticData"]
      claims_required:
        - "email"
        - "name"
        - "gdpr_consent_health_data"

    research:
      id: "GDPR_RESEARCH_PURPOSE"
      label: "Consent for Research Use"
      required_for: ["ResearchDataset"]
      claims_required:
        - "researcher_institution"
        - "research_ethics_approval"

#### 2.3 Spin Up Prism Mock API Server

**Deliverable:** Running HTTP mock server matching OpenAPI spec

**Tools:** Prism CLI, Docker

**Steps:**

1. **Install Prism:**
   npm install -g @stoplight/prism-cli

2. **Start mock server:**
   prism mock --dynamic .specify/spec.yaml --port 3000

3. **Verify with frontend team:**
   curl http://localhost:3000/catalog
   curl http://localhost:3000/catalog/asset-001

4. **Docker-ify for team access:**
   FROM node:18
   RUN npm install -g @stoplight/prism-cli
   COPY .specify/spec.yaml /spec.yaml
   EXPOSE 3000
   CMD ["prism", "mock", "--dynamic", "/spec.yaml", "--port", "3000"]

   docker build -t dataspace-mock-api:latest .
   docker run -p 3000:3000 dataspace-mock-api:latest

**Outcome:** Frontend team can immediately start building UI against stable API contract. No backend code needed yet.

---

### Phase 3: AI-Driven Prototyping (Frontend First) (Week 2, Days 1-4)

**Objective:** Execute the Spec Kit workflow and use AI to build a functional Frontend Prototype connected to the Mock APIs, creating a working visual demonstration early.

#### 3.1 Execute Spec Kit Workflow

**Tools:** GitHub Spec Kit CLI, GitHub Copilot, VS Code

**Workflow:**

# 1. /specify - Extract requirements from spec
spec-cli specify \
  --input .specify/spec.md \
  --output .specify/spec.yaml \
  --format openapi

# 2. /plan - Generate technical architecture plan
spec-cli plan \
  --spec .specify/spec.yaml \
  --constitution .specify/constitution.md \
  --output .specify/plan.md

# 3. /tasks - Generate implementation tasks
spec-cli tasks \
  --plan .specify/plan.md \
  --output .specify/tasks/ \
  --language javascript \
  --framework react

**Output:**
- 27-40 granular implementation tasks
- Each task has spec link, acceptance criteria, estimated effort
- Tasks prioritized by frontend-first approach

#### 3.2 Prompt AI Tools for Frontend Prototype

**Tools:** GitHub Copilot in VS Code, Claude Code

**Workflow with GitHub Copilot:**

1. **Create React component stub:**
   // src/components/AssetCatalog.tsx
   // Generated from task: task-03-asset-catalog-ui.md
   // Spec: .specify/spec.yaml#/paths/~1catalog
   
   import React from 'react';
   import { useQuery } from '@tanstack/react-query';
   
   interface Asset {
     id: string;
     title: string;
     provider: string;
     dataType: string;
   }
   
   export const AssetCatalog: React.FC = () => {
     // TODO: Copilot generates the hook
   };

2. **Trigger Copilot code generation:**
   - Type `/specify` in VS Code comment
   - Reference the spec: `// Spec: .specify/spec.yaml#/components/schemas/Asset`
   - Copilot generates code matching the spec schema

3. **Review and verify generated code:**
   - Copilot-generated code includes OpenAPI examples
   - Mock API call automatically uses correct endpoint
   - Code comments include spec references

**Expected Output:**
- **AssetCatalog.tsx** - Browse data assets
- **PolicyViewer.tsx** - Display access policy with regulatory constraints
- **ConsentFlow.tsx** - Request user credentials (GDPR consent, FHIR role, etc.)
- **TransferMonitor.tsx** - Track data transfer progress
- **AuditLog.tsx** - Display compliance audit trail

#### 3.3 Integrate Frontend with Mock API

**Deliverable:** `src/api/client.ts` connecting to mock server

// src/api/client.ts
import axios from 'axios';

const MOCK_API_BASE = process.env.REACT_APP_MOCK_API_URL || 'http://localhost:3000';

export const catalogAPI = {
  listAssets: async () => {
    const response = await axios.get(`${MOCK_API_BASE}/catalog`);
    return response.data;
  },

  getAsset: async (assetId: string) => {
    const response = await axios.get(`${MOCK_API_BASE}/catalog/${assetId}`);
    return response.data;
  },

  getPolicy: async (assetId: string) => {
    const response = await axios.get(`${MOCK_API_BASE}/policies/${assetId}`);
    return response.data;
  },

  initiateTransfer: async (request: TransferRequest) => {
    const response = await axios.post(`${MOCK_API_BASE}/transfer`, request);
    return response.data;
  },
};

**Outcome:** Fully functional frontend prototype running against mock API. Ready for expert review in Phase 4.

---

### Phase 4: Expert Workshops & Iteration (Week 2, Days 5 + Week 3, Day 1)

**Objective:** Conduct focused workshops with domain experts and use feedback to refine the Constitution, Specs, and regenerate code.

#### 4.1 Conduct Expert Workshops

**Participants:**
- **Domain Experts:** Doctors, engineers, domain specialists
- **Legal:** Regulatory and compliance officers
- **Technical:** Architects, security engineers
- **Product:** Product managers, UX designers

**Workshop 1: Regulatory Alignment (2 hours)**

- Present Constitution and regulatory inventory
- Expert feedback: "Is Article 9 constraint complete?"
- Update `.specify/constitution.md` based on feedback
- **Example feedback:** "Add requirement for explicit audit trail when health data is accessed"

**Workshop 2: UI/UX Walkthrough (2 hours)**

- Demonstrate Phase 3 frontend prototype
- Expert feedback: "Consent flow should show exactly what data is being accessed"
- Update wireframes and spec
- **Example feedback:** "Add data lineage visualization"

**Workshop 3: Data Model Review (2 hours)**

- Present API schemas and data models
- Expert feedback: "DPP structure needs to include product lifecycle data"
- Update `.specify/data-models/dpp-schema.json`
- **Example feedback:** "Add fields for product certification, warranty, recycling"

#### 4.2 Update Specifications Based on Feedback

**Process:**

1. **Update Constitution:**
   # [UPDATED] Constitution

   ## Regulatory Compliance Gates (REVISED)

   - [ ] GDPR Article 9: Consent recorded + immutable
   - [ ] GDPR Article 9 AUDIT: All health data access logged with timestamp and user
   - [ ] [NEW] Data Lineage: Able to trace data from source to consumer

2. **Update OpenAPI Spec:**
   # .specify/spec.yaml
   /audit/data-access:
     get:
       operationId: getDataAccessAudit
       summary: Get audit trail for health data access
       tags: [Audit]
       parameters:
         - name: healthRecordId
           in: query
           required: true
           schema:
             type: string
       responses:
         '200':
           description: Audit trail entries
           content:
             application/json:
               schema:
                 type: array
                 items:
                   $ref: '#/components/schemas/AuditEntry'

   components:
     schemas:
       AuditEntry:
         type: object
         properties:
           timestamp:
             type: string
             format: date-time
           user:
             type: string
           action:
             enum: [READ, WRITE, DELETE, EXPORT]
           ipAddress:
             type: string
           result:
             enum: [SUCCESS, DENIED]

3. **Regenerate Spec Kit tasks:**
   spec-cli tasks \
     --plan .specify/plan.md \
     --output .specify/tasks/ \
     --force

**Outcome:** Specifications refined based on real-world expert feedback. Ready for Phase 5 backend development.

---

### Phase 5: Continuous Validation & Testing (Week 3-4, Days 2-7)

**Objective:** Run the full suite of automated tests to ensure code complies with specs and regulations at every commit.

#### 5.1 Unit Tests (Spec Compliance)

**Tools:** Jest, Mocha, or similar

**Example:**

// tests/unit/policies.test.ts
describe('GDPR Policy Enforcement', () => {
  describe('Article 9: Health Data Processing', () => {
    it('should deny transfer without GDPR_ARTICLE_9_HEALTH consent', async () => {
      // SPEC: .specify/policies/gdpr-policies.yaml#/gdpr/articles/article_9
      // CONSTRAINT: consent_recorded = true

      const transfer = {
        assetId: 'health-record-001',
        credentials: [], // NO GDPR consent
      };

      const result = await policyEngine.evaluatePolicy(transfer);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('GDPR_ARTICLE_9_HEALTH');
    });

    it('should allow transfer with valid GDPR_ARTICLE_9_HEALTH consent', async () => {
      // SPEC: .specify/policies/gdpr-policies.yaml#/gdpr/articles/article_9
      // CONSTRAINT: consent_recorded = true, encryption_at_rest = "AES-256"

      const validConsent = createVerifiableCredential({
        type: ['VerifiableCredential', 'GDPRConsent'],
        credentialSubject: {
          id: 'user-123',
          consentTo: 'GDPR_ARTICLE_9_HEALTH',
          grantedAt: new Date(),
        },
      });

      const transfer = {
        assetId: 'health-record-001',
        credentials: [validConsent],
      };

      const result = await policyEngine.evaluatePolicy(transfer);
      expect(result.allowed).toBe(true);
    });
  });
});

#### 5.2 Contract Tests (Newman)

**Tools:** Postman, Newman CLI

**Postman Collection: `.specify/postman-collection.json`**

{
  "info": {
    "name": "Dataspace API Contract Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Catalog Tests",
      "item": [
        {
          "name": "GET /catalog - List Assets",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/catalog"
          },
          "response": [],
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "// SPEC: .specify/spec.yaml#/paths/~1catalog",
                  "pm.test('Response validates against OpenAPI schema', function() {",
                  "  const schema = pm.collectionVariables.get('catalog-schema');",
                  "  pm.response.to.have.jsonSchema(schema);",
                  "});",
                  "pm.test('Each asset has required fields', function() {",
                  "  pm.response.json().forEach(asset => {",
                  "    pm.expect(asset).to.have.property('id');",
                  "    pm.expect(asset).to.have.property('title');",
                  "    pm.expect(asset).to.have.property('provider');",
                  "  });",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Policy Tests",
      "item": [
        {
          "name": "POST /transfer - with GDPR consent",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/transfer",
            "body": {
              "mode": "raw",
              "raw": "{{gdpr_consent_transfer_request}}"
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "// SPEC: .specify/policies/gdpr-policies.yaml#/gdpr/articles/article_9",
                  "pm.test('Transfer allowed with valid GDPR consent', function() {",
                  "  pm.response.to.have.status(200);",
                  "  pm.expect(pm.response.json().status).to.equal('NEGOTIATING');",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    }
  ]
}

**Run Newman tests:**

newman run .specify/postman-collection.json \
  --environment .specify/postman-env.json \
  --reporters cli,json \
  --reporter-json-export tests/contract-results.json

#### 5.3 Protocol Compliance Tests (dsp-tck & dcp-tck)

**Tools:** dsp-tck, dcp-tck (Eclipse Dataspace TCK)

**Setup:**

# Clone TCK repositories
git clone https://github.com/eclipse-dataspacetck/dsp-tck.git
git clone https://github.com/eclipse-dataspacetck/dcp-tck.git

# Run DSP compliance tests
docker run -it --rm \
  -v $(pwd):/workspace \
  eclipse-dataspacetck/dsp-tck:latest \
  test --connector-url http://localhost:8080 \
  --test-file dsp-tck/tests/dsp-compliance.yaml

**Expected Output:**
DSP Compliance Test Results
================================
✅ Catalog endpoint (GET /catalog) - PASS
✅ Asset retrieval (GET /catalog/{id}) - PASS
✅ Contract negotiation (POST /negotiations) - PASS
✅ Contract agreement (GET /agreements/{id}) - PASS
✅ Data transfer (POST /transfers) - PASS
✅ Transfer process tracking - PASS

DCP Compliance Test Results
================================
✅ Verifiable Credential validation - PASS
✅ Credential issuance - PASS
✅ Credential verification - PASS

Overall: 140/140 tests PASS ✅

#### 5.4 Regulatory Compliance Tests (GDPR, FHIR, eIDAS)

**Deliverable:** `.github/workflows/compliance-tests.yml`

name: Regulatory Compliance Tests

on: [push, pull_request]

jobs:
  gdpr-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: GDPR Article 9 - Health Data Consent Test
        run: |
          npm test -- --grep "GDPR Article 9"
        env:
          SPEC_PATH: .specify/policies/gdpr-policies.yaml

      - name: GDPR Audit Trail Test
        run: |
          npm test -- --grep "GDPR Audit"

      - name: Data Deletion (GDPR Right to be Forgotten) Test
        run: |
          npm test -- --grep "Right to be Forgotten"

      - name: Upload GDPR compliance report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: gdpr-compliance-report
          path: tests/reports/gdpr-compliance.json

  fhir-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: FHIR R4 Schema Validation
        run: |
          npm test -- --grep "FHIR R4"

      - name: HL7 Interoperability Test
        run: |
          npm test -- --grep "HL7"

      - name: Upload FHIR compliance report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: fhir-compliance-report
          path: tests/reports/fhir-compliance.json

  dsp-dcp-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2

      - name: Run DSP-TCK tests
        run: |
          docker run --rm \
            -v $(pwd):/workspace \
            eclipse-dataspacetck/dsp-tck:latest \
            test --connector-url http://localhost:8080

      - name: Run DCP-TCK tests
        run: |
          docker run --rm \
            -v $(pwd):/workspace \
            eclipse-dataspacetck/dcp-tck:latest \
            test --connector-url http://localhost:8080

  security-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'Dataspace'
          path: '.'
          format: 'JSON'

      - name: Upload security report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: reports/dependency-check-report.json

#### 5.5 Generate Compliance Report

**Deliverable:** Automated compliance dashboard

# Generate compliance report
npm run compliance:report

# Output: reports/compliance-dashboard.html
# Shows:
# - GDPR Article 9 compliance: 100/100 tests ✅
# - FHIR R4 compliance: 45/45 tests ✅
# - DSP compliance: 140/140 tests ✅
# - Security compliance: 0 vulnerabilities ✅
# - Overall: PRODUCTION READY ✅

**Outcome:** All automated tests pass. Code is spec-compliant and regulation-compliant. Ready for Phase 6 deployment.

---

### Phase 6: Deployment & Beta Release (Week 4, Days 1-5)

**Objective:** Build Docker images, deploy to Kubernetes staging, get expert sign-off, then promote to production.

#### 6.1 Build Docker Image

**Deliverable:** `.dockerfile` and GitHub Actions build pipeline

# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy specs and sources
COPY .specify /app/.specify
COPY src /app/src
COPY package.json /app/

# Install dependencies
RUN npm ci

# Run compliance tests
RUN npm run compliance:test

# Build application
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/.specify /app/.specify
COPY --from=builder /app/package.json /app/

RUN npm ci --production

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["node", "dist/index.js"]

**GitHub Actions Build Pipeline:** `.github/workflows/build-and-deploy.yml`

name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v3

      - name: Run all compliance tests
        run: npm run compliance:test

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=sha,format=long
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'v1.27.0'

      - name: Deploy to staging Kubernetes
        run: |
          kubectl set image deployment/dataspace-staging \
            dataspace=${{ needs.build.outputs.image-tag }} \
            --kubeconfig=${{ secrets.KUBE_CONFIG }}

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/dataspace-staging \
            --kubeconfig=${{ secrets.KUBE_CONFIG }} \
            --timeout=5m

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          API_URL: https://staging.dataspace.example.com

  approve-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - name: Create deployment approval issue
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Production Deployment Approval: ${context.sha.substring(0, 7)}`,
              body: `Staging deployment passed all tests.\n\nApprove to deploy to production: /approve`,
              labels: ['deployment', 'approval-required']
            })

#### 6.2 Deploy to Kubernetes

**Deliverable:** Kubernetes manifests for staging and production

# k8s/staging-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dataspace-staging
  namespace: dataspace-staging
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dataspace
      environment: staging
  template:
    metadata:
      labels:
        app: dataspace
        environment: staging
      annotations:
        spec-version: "1.0.0"
        compliance-status: "production-ready"
    spec:
      containers:
      - name: dataspace
        image: ghcr.io/ma3u/dataspace:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: SPEC_PATH
          value: "/app/.specify"
        - name: LOG_LEVEL
          value: "info"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        volumeMounts:
        - name: spec-volume
          mountPath: /app/.specify
          readOnly: true
      volumes:
      - name: spec-volume
        configMap:
          name: dataspace-spec
---
apiVersion: v1
kind: Service
metadata:
  name: dataspace-staging
  namespace: dataspace-staging
spec:
  type: LoadBalancer
  ports:
  - port: 443
    targetPort: 3000
    protocol: TCP
  selector:
    app: dataspace
    environment: staging

#### 6.3 Expert Sign-Off

**Deliverable:** Compliance sign-off document

**Process:**

1. **Schedule expert review meeting:**
   - Domain experts
   - Legal/Compliance officers
   - Security team
   - Product team

2. **Present staging environment:**
   - Live demo of all workflows
   - Audit trail showing GDPR compliance
   - Data lineage visualization
   - Performance metrics

3. **Review compliance report:**
   COMPLIANCE VERIFICATION REPORT
   ========================================
   
   Regulatory Requirements:        100% COMPLETE ✅
   - GDPR Article 9:                100% Implemented
   - FHIR R4 Compatibility:          100% Implemented
   - DSP Protocol:                   100% Compliant (140/140 TCK tests pass)
   - eIDAS Credentials:              100% Implemented
   
   Security Requirements:           100% COMPLETE ✅
   - Encryption at rest (AES-256):   ✅
   - Encryption in transit (TLS 1.3):✅
   - Zero security vulnerabilities:  ✅
   - Audit trail logging:            ✅
   
   Performance Requirements:        100% MET ✅
   - API latency (<500ms p99):       285ms
   - System availability (99.9%):    99.97%
   - Concurrent users (10,000):      Tested ✅
   
   SIGN-OFF: Approved for Production ✅
   Signed: Chief Medical Officer, Legal Officer, CTO
   Date: [DATE]

4. **Get formal sign-off:**
   - Document approval signatures
   - Commit to `/docs/compliance-sign-off.md`

#### 6.4 Promote to Production

**Trigger:** Expert sign-off + all tests passing

# GitHub Actions automatically promotes staging to production
# upon /approve comment on approval issue

kubectl apply -f k8s/production-deployment.yaml
kubectl set image deployment/dataspace-production \
  dataspace=ghcr.io/ma3u/dataspace:${VERSION} \
  --record

#### 6.5 Monitor Production

**Deliverable:** Monitoring dashboard tracking compliance + business metrics

# monitoring/prometheus-rules.yaml
groups:
  - name: dataspace-compliance
    interval: 60s
    rules:
    - alert: GDPRConsentMissing
      expr: transfer_denied_missing_consent > 0
      for: 1m
      annotations:
        summary: "GDPR consent missing for transfer"
        
    - alert: AuditLogVolumeAnomaly
      expr: audit_log_volume > avg(audit_log_volume) * 2
      for: 5m
      annotations:
        summary: "Unusual audit log volume (possible breach detection)"

    - alert: HealthDataEncryptionFailure
      expr: health_data_unencrypted_bytes > 0
      for: 1m
      annotations:
        summary: "CRITICAL: Unencrypted health data detected"

  - name: dataspace-business
    interval: 60s
    rules:
    - record: business:active_consent_agreements
      expr: count(consent_status{status="active"})

    - record: business:data_transfer_volume_daily
      expr: sum(transfer_bytes) by (hour)

    - record: business:consumer_engagement
      expr: count(distinct(consumer_id))

**Grafana Dashboard:**
[COMPLIANCE STATUS]              [BUSINESS METRICS]
- GDPR Compliance: 100% ✅       - Active Consents: 1,247
- DSP Compliance: 100% ✅        - Data Transfers/Day: 15,640
- Security Scan: 0 vulns ✅      - Consumers Online: 342
- Audit Trail: 100% logged ✅    - Avg Transfer Time: 2.3s

[SYSTEM HEALTH]
- API Availability: 99.98%
- Data Integrity: 100% ✅
- Encryption Status: 100% ✅

**Outcome:** Production dataspace is live, spec-compliant, regulation-compliant, and being actively monitored.

## Part 2: Repository Structure & Branching Strategy

### 2.1 Main Branch: Clean Template Structure

**Philosophy:** Main branch is a reusable TEMPLATE with minimal files.

**What stays in main:**
- ✅ `.specify/` - Specification templates (ready to customize)
- ✅ `docs/` - Blueprint documentation (markdown only)
- ✅ `src/skeleton/` - Directory structure only (no implementations)
- ✅ `server/skeleton/` - Directory structure only (no implementations)
- ✅ `tests/templates/` - Test templates (ready to customize)
- ✅ `k8s/templates/` - Kubernetes templates (ready to customize)
- ✅ `.github/workflows/` - CI/CD workflows (reusable)
- ✅ `package.json` - Dependencies only
- ✅ Configuration files (tsconfig.json, jest.config.js, etc.)

**What does NOT go in main:**
- ❌ Health-demo code or implementations
- ❌ Domain-specific implementations
- ❌ Generated files (dist/, node_modules/, .next/)
- ❌ Example data or test fixtures
- ❌ Architecture diagrams (link to external sources instead)

### 2.2 Branch Strategy for Domain Dataspaces

Each domain gets its own branch inheriting from main:

main (TEMPLATE)
├── health/health-dataspace (HL7 FHIR + GDPR Article 9)
├── manufacturing/automotive-dpp (Digital Product Passport)
├── manufacturing/supply-chain (Catena-X standards)
├── energy/energy-meters (Meter data management)
├── logistics/track-and-trace (EPCIS + IoT)
└── [future domains...]

**Branch Creation Workflow:**

# Start from main
git clone https://github.com/ma3u/MinimumViableDataspace.git
cd MinimumViableDataspace

# Create domain branch
git checkout -b health/health-dataspace

# Customize .specify/ for health domain
# (Files in .specify/ are templates, customize them)
vim .specify/spec.md              # Define health use case
vim .specify/constitution.md       # Add GDPR Article 9, FHIR requirements
vim .specify/spec.yaml            # Define health data APIs
vim .specify/policies/fhir-policies.yaml

# Create domain-specific directories in src/, server/, tests/
mkdir -p src/{components,api,services}
mkdir -p server/{connectors,policies,services}
mkdir -p tests/{unit,compliance}

# Push domain branch
git push origin health/health-dataspace

# NOW implement the domain (using Copilot workflow from docs)

---

## Part 3: Documentation Structure

All documentation is in `/docs/` as markdown files (NO code, NO examples):

docs/
├── 01-BLUEPRINT-OVERVIEW.md          # This document overview
├── 02-PHASE1-SETUP.md               # Phase 1: Setup & Regulatory Inventory
├── 03-PHASE2-SPECS.md               # Phase 2: Specifications & Mock APIs
├── 04-PHASE3-FRONTEND.md            # Phase 3: AI-Driven Frontend
├── 05-PHASE4-WORKSHOPS.md           # Phase 4: Expert Iteration
├── 06-PHASE5-TESTING.md             # Phase 5: Automated Testing
├── 07-PHASE6-DEPLOYMENT.md          # Phase 6: Zero-Trust Deployment
├── 08-BRANCH-STRATEGY.md            # How to create domain branches
├── 09-CLEANUP-CHECKLIST.md          # Step-by-step cleanup from health-demo
├── GLOSSARY.md                      # Term definitions
├── COMMAND-REFERENCE.md             # CLI commands for Spec Kit, Docker, K8s
├── TOOL-INTEGRATION.md              # GitHub Copilot, Warp 2.0, Claude Code
└── README.md                        # Start here

Each document is **focused and concise** (2-5 pages max), not a 50-page monolith.

---

## Part 4: Main Branch Cleanup: Step-by-Step Instructions

**Main Branch:** `main`
- Always production-ready
- Contains only spec-compliant, regulation-verified code
- Protected: requires all tests to pass before merge

**Domain Branches:** `{domain}/{domain-name}`
- Example: `health/health-dataspace`, `manufacturing/automotive-supply-chain`, etc.
- Each domain branch is a complete, independent dataspace
- Inherits `.specify/` templates from `main`
- Overrides domain-specific `.specify/constitution.md`, `.specify/spec.yaml`, etc.

**Example Workflow:**

# Start with main branch (template)
git clone https://github.com/ma3u/MinimumViableDataspace.git
cd MinimumViableDataspace

# Create new domain branch
git checkout -b health/health-dataspace

# Customize specification for health domain
# .specify/spec.md → Define health data use case
# .specify/constitution.md → Add HIPAA, GDPR Article 9, FHIR requirements
# .specify/policies/fhir-policies.yaml → FHIR R4 constraints
# .specify/spec.yaml → OpenAPI for health data APIs

# Push domain branch
git push origin health/health-dataspace

# Create pull request for review
# Once approved and tests pass → Merge to main (or keep as independent branch for CI/CD)

**Benefits:**
- ✅ Main branch remains clean template
- ✅ Each domain is fully isolated but shares foundational patterns
- ✅ Easy to create new dataspaces: `git checkout -b {domain}/{name}`
- ✅ Easy to sync improvements from main to all domains

---

## Part 4: AI Development Tools Integration

### 4.1 GitHub Copilot Workflow

**Setup:**

1. **Install GitHub Copilot extension in VS Code**
2. **Configure Copilot to use specification:**

// .vscode/settings.json
{
  "github.copilot.enable": {
    "plaintext": false,
    "markdown": true,
    "yaml": true,
    "json": true,
    "typescript": true,
    "javascript": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  }
}

**Usage Pattern:**

// src/services/policyEngine.ts
// Prompt Copilot with spec reference

// Spec: .specify/policies/gdpr-policies.yaml#/gdpr/articles/article_9
// Requirement: "Deny transfer if GDPR_ARTICLE_9_HEALTH consent is missing"
// Acceptance Criteria:
//   - Must check consent type
//   - Must log denial reason
//   - Must return HTTP 403

export async function evaluateGDPRPolicy(transfer: TransferRequest): Promise<PolicyDecision> {
  // Copilot generates function body matching spec
}

**Copilot will generate:**

export async function evaluateGDPRPolicy(transfer: TransferRequest): Promise<PolicyDecision> {
  const requiredConsent = 'GDPR_ARTICLE_9_HEALTH';
  
  const hasConsent = transfer.credentials?.some(cred =>
    cred.credentialSubject?.consentTo === requiredConsent
  );

  if (!hasConsent) {
    logger.warn('GDPR Article 9 consent missing', {
      transferId: transfer.id,
      requiredConsent,
      spec: '.specify/policies/gdpr-policies.yaml#/gdpr/articles/article_9',
    });
    
    return {
      allowed: false,
      reason: `Missing required consent: ${requiredConsent}`,
      specReference: '.specify/policies/gdpr-policies.yaml#/gdpr/articles/article_9',
    };
  }

  return { allowed: true };
}

### 4.2 Warp 2.0 Terminal Workflow

**Setup:**

# Install Warp 2.0
# https://www.warp.dev/

# Configure aliases for spec-driven workflow
# ~/.warp/functions/env_custom.sh

alias spec-generate="npm run spec:generate"
alias spec-validate="npm run spec:validate"
alias spec-tasks="spec-cli tasks --plan .specify/plan.md --output .specify/tasks/"
alias mock-start="prism mock --dynamic .specify/spec.yaml --port 3000"
alias tests-compliance="npm run test:compliance"
alias tests-all="npm run test && npm run test:contract && npm run test:compliance"

**Commands:**

# Terminal command with Warp
$ mock-start
→ Prism mock server running on http://localhost:3000

$ spec-validate
✅ Specification is valid
✅ All schemas valid
✅ All policies parseable

$ tests-all
✅ Unit tests: 127/127 passing
✅ Contract tests: 45/45 passing
✅ GDPR tests: 18/18 passing
✅ FHIR tests: 12/12 passing
✅ DSP tests: 140/140 passing
→ Ready for deployment

### 4.3 Claude Code Integration (for complex implementations)

**Approach:** Use Claude Code for multi-file, complex domain logic

**Example:**

Create a complete policy evaluation engine that:
1. Reads ODRL policies from .specify/policies/odrl-policies.yaml
2. Evaluates policies against transfer requests
3. Checks GDPR consent (spec: .specify/policies/gdpr-policies.yaml#/gdpr/articles/article_9)
4. Checks FHIR role-based access (spec: .specify/policies/fhir-policies.yaml)
5. Enforces DSP constraints (spec: .specify/policies/dsp-policies.yaml)
6. Logs all decisions to audit trail
7. Returns PolicyDecision with spec references

Use these files:
- .specify/policies/*.yaml (read)
- src/services/policyEngine.ts (create)
- src/types/policy.ts (create)
- tests/unit/policies.test.ts (create)

**Claude generates:**
- Complete policy engine implementation
- Type definitions matching OpenAPI schemas
- Unit tests with spec references
- Error handling with audit logging

---

## Part 5: Checklist for Main Branch Cleanup & Template Setup

### 5.1 Cleanup Phase

- [ ] **Freeze health-demo branch:** Mark as read-only, archive documentation
- [ ] **Extract reusable templates from health-demo:**
  - [ ] `.specify/constitution.md` template (healthcare-specific parts extracted)
  - [ ] `.specify/spec.yaml` template (health APIs extracted to domain example)
  - [ ] `.specify/policies/gdpr-policies.yaml` (keep as is, highly reusable)
  - [ ] `.specify/policies/fhir-policies.yaml` (keep as is, domain-specific but reusable)
  - [ ] Unit tests structure and patterns
  - [ ] Kubernetes manifests template

- [ ] **Create generic main branch:**
  - [ ] `.specify/constitution.md` - generic version with [ ] checkboxes
  - [ ] `.specify/spec.yaml` - generic template with comments
  - [ ] `.specify/README.md` - instructions on how to customize for domain
  - [ ] `docs/TEMPLATE_GUIDE.md` - guide for extending templates
  - [ ] `docs/MIGRATION_GUIDE.md` - how to migrate from health-demo to new domains

### 4.1 Cleanup Checklist

Execute these steps to transform main branch into a clean template:

#### Step 1: Archive health-demo (Week 1)

# Ensure all health-demo knowledge is documented
# Create archive branch (read-only reference)
git checkout health-demo
git pull origin health-demo
git checkout -b archive/health-demo-final

# Tag for reference
git tag -a health-demo-v1.0.0 -m "Health dataspace implementation reference"
git push origin archive/health-demo-final
git push origin --tags

# On GitHub: Set health-demo branch to read-only
# Settings → Branches → Add rule:
#   Pattern: health-demo
#   Require pull request reviews before merging: Yes
#   Require status checks to pass: Yes
#   Restrictions: Archive branch (no new commits)

#### Step 2: Create clean main branch from scratch (Week 1)

# Start from health-demo to extract templates
git checkout health-demo

# Create new orphan branch (no history)
git checkout --orphan main-clean

# Remove health-demo code, keep ONLY templates
git rm -r src/ server/ tests/ docs/wireframes/ docs/architecture/
git rm demo-step1.png demo-step2.png demo-step3.png demo-step4.png
git rm docker-compose.yml Dockerfile
git rm -r k8s/

# Keep only:
# - .specify/ (template)
# - .github/workflows/ (CI/CD)
# - package.json (dependencies)
# - Configuration files

#### Step 3: Create template directories with skeletons (Week 1)

# Create skeleton directories
mkdir -p src/skeleton
mkdir -p server/skeleton
mkdir -p tests/templates
mkdir -p k8s/templates

# Create README files for each skeleton directory
cat > src/skeleton/README.md << 'EOF'
# Frontend Skeleton

This is a placeholder for your domain-specific React components.

To get started:
1. Customize `.specify/spec.yaml` for your domain
2. Generate API types: `npx openapi-typescript .specify/spec.yaml --output src/types/api.ts`
3. Create components in `src/components/` following Phase 3 workflow
4. See docs/04-PHASE3-FRONTEND.md for detailed instructions
EOF

cat > server/skeleton/README.md << 'EOF'
# Backend Skeleton

This is a placeholder for your domain-specific backend services.

To get started:
1. Customize `.specify/spec.yaml` for your domain
2. Use GitHub Copilot to generate endpoint handlers
3. Implement policy enforcement in `server/policies/`
4. See docs/04-PHASE3-FRONTEND.md for detailed instructions
EOF

cat > tests/templates/README.md << 'EOF'
# Test Templates

Template files for unit, integration, and compliance tests.

Copy and customize:
- `unit.test.template.ts` for your domain
- `compliance.test.template.ts` for regulatory tests
- See docs/06-PHASE5-TESTING.md for examples
EOF

cat > k8s/templates/README.md << 'EOF'
# Kubernetes Templates

Helm-like templates for Kubernetes deployments.

To use:
1. Copy `deployment.yaml.template` to `deployment.yaml`
2. Replace placeholders: `{{DOMAIN}}`, `{{IMAGE_TAG}}`, etc.
3. See docs/07-PHASE6-DEPLOYMENT.md for examples
EOF

#### Step 4: Create markdown documentation (Week 1)

# Create docs/ directory
mkdir -p docs

# Create main documentation files (markdown only)
# See section 3.3 for content templates
touch docs/{01-BLUEPRINT-OVERVIEW.md,02-PHASE1-SETUP.md,03-PHASE2-SPECS.md,...}

# Example: docs/01-BLUEPRINT-OVERVIEW.md
cat > docs/01-BLUEPRINT-OVERVIEW.md << 'EOF'
# Blueprint Overview

This main branch is a TEMPLATE for building spec-driven dataspaces.

## Quick Start

1. **Create a domain branch:** `git checkout -b {domain}/{name}`
2. **Customize specifications:** Edit `.specify/` files
3. **Generate code:** Use GitHub Copilot (see docs/TOOL-INTEGRATION.md)
4. **Follow phases:** See docs/02-PHASE1-SETUP.md through docs/07-PHASE6-DEPLOYMENT.md

## Domain Branch Examples

- `health/health-dataspace` - Healthcare data sharing (FHIR + GDPR Article 9)
- `manufacturing/automotive-dpp` - Digital Product Passport (Catena-X)
- `energy/energy-meters` - Smart meter data (IEC standards)

## Key Directories

- `.specify/` - Specification templates (START HERE)
- `docs/` - Step-by-step guides
- `src/skeleton/` - Frontend directory structure
- `server/skeleton/` - Backend directory structure
- `.github/workflows/` - CI/CD pipelines (reusable)
EOF

#### Step 5: Customize .specify/ templates (Week 1)

# .specify/constitution.md - Generic version
cat > .specify/constitution.md << 'EOF'
# Constitution: Non-Negotiable Rules

This document defines rules that ALL implementations must follow.

## Security Constraints (ALWAYS REQUIRED)
- [ ] All APIs must be TLS 1.3 minimum
- [ ] All data at rest must be encrypted (AES-256)
- [ ] API keys rotate every 90 days
- [ ] No credentials in source code
- [ ] All external calls require mutual TLS (mTLS)

## Regulatory Compliance Gates

### General Requirements (ALL DOMAINS)
- [ ] GDPR: Consent recorded before processing personal data
- [ ] DSP: All transfers comply with Dataspace Protocol 1.0.0
- [ ] eIDAS: Identity assertions use W3C Verifiable Credentials

### Domain-Specific Requirements
- [ ] [ADD YOUR DOMAIN REGULATIONS HERE]
  - Example for health: GDPR Article 9, FHIR R4
  - Example for manufacturing: Catena-X, DPP standards
  - Example for energy: IEC 61850, meter data standards

## Code Quality Gates (ALWAYS REQUIRED)
- [ ] All public APIs have OpenAPI spec
- [ ] All functions have unit tests (>85% coverage)
- [ ] All APIs pass contract tests (Newman)
- [ ] Zero known security vulnerabilities

## Deployment Gates (ALWAYS REQUIRED)
- [ ] All automated tests pass
- [ ] All compliance reports generated
- [ ] All monitoring configured
EOF

# .specify/spec.md - Generic version
cat > .specify/spec.md << 'EOF'
# [DOMAIN] Dataspace Specification

## Domain Placeholder
Replace `[DOMAIN]` with your domain (health, manufacturing, energy, etc.)

## Goals

What should this dataspace achieve?
- [ ] Enable secure data sharing across [DOMAIN]
- [ ] Ensure 100% compliance with [DOMAIN-SPECIFIC REGULATIONS]
- [ ] Support [DOMAIN-SPECIFIC USE CASES]

## Key Users

Who are the main stakeholders?
- **Data Providers:** [Define role in your domain]
- **Data Consumers:** [Define role in your domain]
- **Compliance Officers:** Audit and verify regulatory adherence
- **Operators:** Monitor and maintain the system

## Core Workflows

What are the main data flows?
1. [Workflow 1: Define data discovery/access pattern]
2. [Workflow 2: Define contract negotiation]
3. [Workflow 3: Define data transfer]
4. [Workflow 4: Define audit/compliance]

## Non-Functional Requirements

- Availability: 99.9% uptime
- Latency: <500ms p99
- Scalability: [Your target]
- Compliance: 100% [YOUR DOMAIN REGULATIONS]
- Security: Zero known vulnerabilities
EOF

# .specify/spec.yaml - Generic template
cat > .specify/spec.yaml << 'EOF'
openapi: 3.1.0
info:
  title: "[DOMAIN] Dataspace API"
  version: 1.0.0
  description: "Replace [DOMAIN] with your specific domain"

paths:
  /catalog:
    get:
      summary: "List data assets available in this dataspace"
      tags: [Catalog]
      operationId: listAssets
      responses:
        '200':
          description: "List of assets"
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Asset'

components:
  schemas:
    Asset:
      type: object
      required: [id, title]
      properties:
        id:
          type: string
          description: "Unique asset identifier"
        title:
          type: string
          description: "Asset title"
        description:
          type: string
        dataType:
          type: string
          enum: [PLACEHOLDER]
          description: "Replace with your domain-specific data types"

    # Add more schemas for your domain
    # See docs/03-PHASE2-SPECS.md for examples
EOF

# .specify/regulatory-inventory.md - Generic template
cat > .specify/regulatory-inventory.md << 'EOF'
# Regulatory Inventory

This checklist maps regulations to technical requirements.

## General Data Protection (ALWAYS REQUIRED)

### GDPR - General Data Protection Regulation
- [ ] Article 4: Definitions of key terms
- [ ] Article 5: Data protection principles
- [ ] Article 6: Lawful basis for processing
- [ ] Article 7: Conditions for consent
- [ ] Article 13: Information to data subjects
- [ ] Article 32: Security of processing

## Domain-Specific Regulations

### [DOMAIN] Standards
Add regulations specific to your domain:
- Example (health): HIPAA, HL7 FHIR, GDPR Article 9
- Example (manufacturing): Catena-X, DPP standards
- Example (energy): IEC 61850, meter data standards

For each regulation, map to technical requirements:
- What must be implemented?
- How is it tested?
- What compliance tests are required?

See docs/02-PHASE1-SETUP.md section 1.2 for examples.
EOF

#### Step 6: Create .gitignore for clean commits (Week 1)

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/
.next/
out/

# Health-demo content (should not be in main)
demo-step*.png
health-demo/
docs/wireframes/
docs/architecture/

# Generated files (should be generated, not committed)
.specify/plan.md
.specify/tasks/
src/types/api.ts
server/types/api.ts

# Local development
.env.local
.env.*.local
.DS_Store

# Testing
coverage/
.nyc_output/

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo

# Kubernetes
k8s/*.yaml  # Templates only, no actual deployments
!k8s/*.template

# Docker
docker-compose.yml  # Use docker-compose.template.yml
!docker-compose.template.yml
Dockerfile  # Use Dockerfile.template
!Dockerfile.template
EOF

git add .gitignore
git commit -m "Add comprehensive .gitignore for clean template"

#### Step 7: Finalize and push clean main (Week 1)

# Remove old main branch (backup first)
git push origin --delete main  # WARNING: deletes old main

# Push new clean main
git push origin main-clean:main

# Force update if needed (use with caution)
git push origin -f main-clean:main

# Verify main is clean
git checkout main
git log --oneline | head -5  # Should show clean history
git ls-files | wc -l         # Should be <100 files

---

### 4.2 Create Domain Branches

Once main is clean, create domain-specific branches:

# Health dataspace
git checkout -b health/health-dataspace
# Customize .specify/ for health domain
# Create domain-specific directories

# Manufacturing dataspace  
git checkout -b manufacturing/automotive-dpp
# Customize .specify/ for manufacturing

# Energy dataspace
git checkout -b energy/energy-meters
# Customize .specify/ for energy

# For each domain:
git push origin {domain}/{name}

---

## Part 5: Documentation Templates

### 5.1 docs/02-PHASE1-SETUP.md

# Phase 1: Setup, Regulatory Inventory & Design

## Objective

Establish the constitutional framework, enumerate regulations, and design visually.

## Phase Duration

**Week 1, Days 1-3** (3 days, not full week)

## Tasks

### Task 1.1: Initialize GitHub Spec Kit
- [ ] Create `.specify/` directory
- [ ] Customize `constitution.md` for domain
- [ ] Customize `spec.md` with use cases
- [ ] Define regulatory inventory

**Effort:** 1 day  
**Tools:** VS Code, GitHub Copilot  
**Output:** `.specify/` with templates filled in

### Task 1.2: Create Regulatory Inventory
- [ ] List all applicable regulations
- [ ] Map each to technical requirements
- [ ] Create test cases for each

**Effort:** 1 day  
**Output:** `.specify/regulatory-inventory.md`

### Task 1.3: Design Wireframes
- [ ] Create low-fidelity wireframes
- [ ] Show data discovery flow
- [ ] Show contract negotiation
- [ ] Show data transfer

**Effort:** 1 day  
**Tools:** Excalidraw or pen-and-paper  
**Output:** `/docs/wireframes/` (images or ASCII art)

## Success Criteria

- [ ] `.specify/constitution.md` completed
- [ ] `.specify/spec.md` completed
- [ ] All regulations listed and mapped
- [ ] Wireframes created and reviewed

### 5.2 docs/COMMAND-REFERENCE.md

# Command Reference

Quick reference for common commands.

## Spec Kit Commands

# Validate specification
spec-cli validate .specify/spec.yaml

# Generate OpenAPI from spec.md
spec-cli spec .specify/spec.md --format openapi --output .specify/spec.yaml

# Generate technical plan
spec-cli plan .specify/spec.yaml --constitution .specify/constitution.md

# Generate implementation tasks
spec-cli tasks .specify/plan.md --output .specify/tasks/ --language typescript

## Docker & Kubernetes

# Build Docker image
docker build -t dataspace:latest .

# Start mock API with Prism
prism mock --dynamic .specify/spec.yaml --port 3000

# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml

## Testing

# Run all tests
npm run test

# Run compliance tests only
npm run test:compliance

# Run contract tests
newman run .specify/postman-collection.json

## Development

# Start development server
npm start

# Generate API types from spec
npx openapi-typescript .specify/spec.yaml --output src/types/api.ts

---

## Part 6: Final Structure Summary

### Minimal Main Branch Files

MinimumViableDataspace/
├── .specify/                          # ← Customize per domain
├── .github/workflows/                 # ← Reuse as-is
├── docs/                              # ← Reference documentation
├── src/skeleton/                      # ← Empty skeleton
├── server/skeleton/                   # ← Empty skeleton
├── tests/templates/                   # ← Template files only
├── k8s/templates/                     # ← Template files only
├── package.json                       # ← Dependencies only
├── tsconfig.json
├── jest.config.js
├── Dockerfile.template
├── docker-compose.template.yml
└── README.md                          # ← "Start here"

**Total files in main: ~80-100** (clean, focused)  
**No implementations, no examples, no generated files**

### Branch Creation Workflow

main (TEMPLATE)
   ↓
git checkout -b {domain}/{name}
   ↓
Customize .specify/
   ↓
Implement using Copilot (docs/04-PHASE3-FRONTEND.md)
   ↓
Push domain branch

---

## Part 7: GitHub Configuration

### Branch Protection Rules

Settings → Branches → Add Rule

Pattern: main
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Require a pull request before merging
✅ Require status checks to pass before merging
   → spec-validation
   → compliance-tests
   → build-and-deploy
✅ Require branches to be up to date
✅ Require code reviews: 1 approval
✅ Dismiss stale reviews
✅ Require status checks from protected branches

### Add CODEOWNERS File

cat > .github/CODEOWNERS << 'EOF'
# CODEOWNERS for spec-driven workflow

# Spec changes require review
.specify/** @maintainers

# Documentation
docs/** @maintainers

# CI/CD workflows
.github/workflows/** @maintainers

# Default owners for this repo
* @ma3u
EOF

---

## Conclusion

**Main branch is now a clean, reusable TEMPLATE:**
- ✅ No health-demo code
- ✅ All .specify/ files are templates with placeholders
- ✅ Skeleton directories show structure
- ✅ Documentation in markdown
- ✅ CI/CD workflows ready to use
- ✅ Domain branches inherit and customize

**To create a new dataspace:**
1. `git checkout -b {domain}/{name}`
2. Customize `.specify/` for domain
3. Implement using Copilot (following docs/)
4. Push domain branch
5. Run CI/CD (automatic)

**All 50+ pages of dense documentation converted to:**
- 8 focused markdown files (2-5 pages each)
- Clear structure and navigation
- Copy-paste ready templates
- Examples in domain branches (not main)

---

## Part 6: Success Metrics

### 6.1 Development Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Specification Compliance** | 100% | All code passes specification validation tests |
| **Regulatory Compliance** | 100% | All compliance tests pass (GDPR, FHIR, DSP, etc.) |
| **Test Coverage** | >85% | Code coverage of unit tests |
| **Time to Production** | 6 weeks | From spec initiation to production deployment |
| **Specification-Code Drift** | 0% | No divergence between spec and implementation |
| **Security Vulnerabilities** | 0 | OWASP scan passes with no critical/high findings |

### 6.2 Operational Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **System Availability** | 99.9% | Uptime monitoring |
| **API Latency (p99)** | <500ms | Continuous monitoring |
| **Deployment Frequency** | Weekly | How often updates reach production |
| **MTTR (Mean Time to Recovery)** | <15 min | Time to fix critical issues |
| **Compliance Audit Success Rate** | 100% | All regulatory audits pass |

### 6.3 Business Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| **Active Data Providers** | - | >10 |
| **Active Data Consumers** | - | >50 |
| **Data Transfers Per Day** | - | >1,000 |
| **Active Consent Agreements** | - | >500 |
| **User Engagement (daily active)** | - | >100 |

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Specification-Driven Development** | Development methodology where specifications are the source of truth and drive all implementation, testing, and deployment |
| **GitHub Spec Kit** | Open-source toolkit for organizing specifications in version-controlled `.specify/` directory |
| **OpenAPI** | Machine-readable API contract format (YAML/JSON) that describes REST endpoints, schemas, and examples |
| **Prism Mock API** | Open-source tool that generates realistic HTTP mock servers from OpenAPI specifications |
| **Newman** | CLI tool that runs Postman collections for automated API contract testing |
| **dsp-tck / dcp-tck** | Eclipse Dataspace Technology Compatibility Kits that verify DSP and DCP protocol compliance |
| **GDPR Article 9** | Regulation that prohibits processing of special categories of data (health, genetic, biometric) without explicit consent |
| **FHIR R4** | HL7 Fast Healthcare Interoperability Resources standard for electronic health records |
| **Dataspace Protocol (DSP)** | Standard protocol for data exchange in dataspaces (catalog, negotiation, transfer) |
| **Decentralized Claims Protocol (DCP)** | Protocol for verifying identity and claims using W3C Verifiable Credentials |
| **ODRL** | Open Digital Rights Language for expressing data access policies |
| **Zero-Trust Deployment** | Only code that passes 100% of compliance tests reaches production |
| **Specification-Code Drift** | Divergence between written specification and actual implementation (this approach makes drift impossible) |

---

## Appendix B: Command Reference

### Initialization

# Initialize Spec Kit project
spec-cli init --project-name "My Dataspace"

# Generate OpenAPI from spec
spec-cli spec .specify/spec.md --format openapi --output .specify/spec.yaml

# Generate technical plan
spec-cli plan .specify/spec.yaml --constitution .specify/constitution.md --output .specify/plan.md

# Generate implementation tasks
spec-cli tasks .specify/plan.md --output .specify/tasks/ --language typescript

### Development

# Start mock API server
prism mock --dynamic .specify/spec.yaml --port 3000

# Generate API types from spec
npx openapi-typescript .specify/spec.yaml --output src/types/api.ts

# Run unit tests
npm run test

# Run contract tests
newman run .specify/postman-collection.json --environment .specify/postman-env.json

# Run compliance tests
npm run test:compliance

### Verification

# Validate spec
spec-cli validate .specify/spec.yaml

# Run DSP-TCK tests
docker run --rm eclipse-dataspacetck/dsp-tck:latest test --connector-url http://localhost:8080

# Generate compliance report
npm run compliance:report

# Check security vulnerabilities
npm audit --audit-level=high

### Deployment

# Build Docker image
docker build -t dataspace:latest .

# Push to registry
docker push ghcr.io/ma3u/dataspace:latest

# Deploy to Kubernetes
kubectl apply -f k8s/production-deployment.yaml
kubectl set image deployment/dataspace dataspace=ghcr.io/ma3u/dataspace:latest --record

# Verify deployment
kubectl rollout status deployment/dataspace

---

## Appendix C: Recommended Tools & Versions

| Category | Tool | Version | Purpose |
|----------|------|---------|---------|
| **Specification** | GitHub Spec Kit | Latest | Specification management |
| **API Design** | Postman / Apidog | Latest | API design, testing, documentation |
| **Mock API** | Stoplight Prism | Latest | Mock server from OpenAPI |
| **Contract Testing** | Newman | Latest | Automated API contract testing |
| **Protocol Testing** | dsp-tck / dcp-tck | Latest | Dataspace protocol compliance |
| **Testing** | Jest | ^29.0 | Unit testing framework |
| **Code Generation** | GitHub Copilot | Latest | AI-assisted code generation |
| **Frontend** | React | ^18.0 | UI framework |
| **Backend** | Node.js / Java | LTS | Application runtime |
| **Container** | Docker | Latest | Container runtime |
| **Orchestration** | Kubernetes | ^1.27 | Container orchestration |
| **CI/CD** | GitHub Actions | Built-in | Automated testing & deployment |
| **Monitoring** | Prometheus / Grafana | Latest | System monitoring & metrics |
| **Code Editor** | VS Code | Latest | IDE with Copilot integration |
| **Terminal** | Warp | 2.0+ | Modern terminal with AI |

---

## Appendix D: File Templates

### D.1 Constitution Template

# Constitution: Non-Negotiable Development Rules

## Security Constraints
- [ ] All APIs must be TLS 1.3 minimum
- [ ] All data at rest must be encrypted (AES-256)
- [ ] API keys rotate every 90 days
- [ ] No credentials in source code (use GitHub Secrets)
- [ ] All external calls require mutual TLS (mTLS)

## Regulatory Compliance Gates
- [ ] GDPR: Consent must be recorded before processing personal data
- [ ] [DOMAIN-SPECIFIC]: Add your domain regulations

## Code Quality Gates
- [ ] All public APIs must have OpenAPI spec
- [ ] All functions must have unit tests (>85% coverage)
- [ ] All APIs must pass contract tests (Newman)
- [ ] All code must be reviewed before merge
- [ ] Zero known security vulnerabilities (OWASP)

## Deployment Gates
- [ ] All automated tests must pass
- [ ] All compliance reports must be generated
- [ ] All dependent services must be available
- [ ] All monitoring and alerting must be configured

### D.2 OpenAPI Template

# .specify/spec.yaml
openapi: 3.1.0
info:
  title: "[DOMAIN] Dataspace API"
  version: 1.0.0
  description: "Spec-driven dataspace for [DOMAIN]"

paths:
  # Add domain-specific paths

components:
  schemas:
    # Add domain-specific schemas

---

## Conclusion

This specification-driven development blueprint transforms dataspace development from a traditional waterfall approach with specification-code drift into an agile, AI-powered process where specifications and code are always synchronized. By following these six phases, your dataspace will be:

✅ **100% specification-compliant** - Code always matches spec  
✅ **100% regulation-compliant** - GDPR, FHIR, DSP verified automatically  
✅ **100% secure** - Zero known vulnerabilities, encrypted, audited  
✅ **Production-ready in 6 weeks** - Not 6 months  
✅ **Reusable across domains** - Branch-based templates for any dataspace  

The main branch becomes a clean, reusable template. Each domain creates its own branch with customized specifications. The specification-driven approach ensures that regulatory compliance, security, and quality are baked into the development process from day one, not bolted on at the end.

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-27  
**Author:** Specification-Driven Development Team  
**License:** MIT
