# Frontend Data Sources Report

> **Generated:** 21 December 2025  
> **Purpose:** Document which frontend parameters are static, from backend-mock, or from EDC integration layer

---

## Executive Summary

| Source | Count | Description |
|--------|-------|-------------|
| **Static/Hardcoded** | 25+ | Reference data, mock EHR records, UI constants |
| **Backend-Mock** | 5 endpoints | EHR data, health checks |
| **EDC Layer** | 16+ endpoints | Catalog, negotiations, transfers, identity, events |

---

## Page-by-Page Data Sources

The application has **6 demo phases** controlled by the `currentPhase` state:

### Page 1: Intro Phase (`phase === 'intro'`)

**Component:** `App-health.tsx` (lines 450-520)

| Parameter | Source | API/File | Description |
|-----------|--------|----------|-------------|
| `MOCK_PARTICIPANTS` | Static | `mockData-health.ts` | Provider/Consumer organization info (DIDs, logos) |
| `DSP_PHASES` | Static | `mockData-health.ts` | Phase descriptions for stepper |
| `backendAvailable` | Backend-Mock | `GET /health` | Health check on mount |
| `apiMode` | Environment | `VITE_API_MODE` | Current mode indicator |

---

### Page 2: Catalog Phase (`phase === 'catalog'`)

**Component:** `App-health.tsx` (lines 520-650)

| Parameter | Source | API/File | Mode |
|-----------|--------|----------|------|
| **Catalog Assets** | | | |
| `assets` (mock) | Static | `mockData-health.ts` → `MOCK_CATALOG_ASSETS` | mock |
| `assets` (mock) | Backend-Mock | `GET /api/ehr` | mock (with backend) |
| `assets` (hybrid/full) | Backend-EDC | `GET /api/catalog/assets` | hybrid/full |
| **Filter Reference Data** | | | |
| `HEALTH_CATEGORIES` | Static | `mockData-health.ts` | All modes |
| `HEALTH_CATEGORY_IMAGES` | Static | `mockData-health.ts` | All modes |
| `CLINICAL_TRIAL_PHASES` | Static | `mockData-health.ts` | All modes |
| `MEDDRA_SOC` | Static | `mockData-health.ts` | All modes |
| `EMA_THERAPEUTIC_AREAS` | Static | `mockData-health.ts` | All modes |
| `MOCK_SPONSORS` | Static | `mockData-health.ts` | All modes |
| `EU_MEMBER_STATE_FLAGS` | Static | `mockData-health.ts` | All modes |
| **Protocol Education** | | | |
| `EXAMPLE_DSP_MESSAGES` | Static | `mockData-health.ts` | All modes |
| **Events** | | | |
| `emitEvent()` | Context | `DspEventLogContext` | All modes |

**Filter Logic (all client-side):**
| Filter | Applied To | Type |
|--------|------------|------|
| `categoryFilter` | `healthCategory` | Dropdown |
| `ageFilter` | `ageBand` | Dropdown |
| `phaseFilter` | `clinicalPhase` | Dropdown |
| `meddraFilter` | `meddraSOC` | Dropdown |
| `therapeuticAreaFilter` | `therapeuticArea` | Dropdown |
| `sponsorTypeFilter` | `sponsorType` | Dropdown |
| `searchQuery` | All text fields | Text input |

---

### Page 3: Negotiation Phase (`phase === 'negotiation'`)

**Component:** `App-health.tsx` (lines 650-780) + `useNegotiation.ts`

| Parameter | Source | API/File | Mode |
|-----------|--------|----------|------|
| **Input State** | | | |
| `selectedAsset` | Component State | From catalog phase | All modes |
| `consentData` | Component State | User input | All modes |
| **Negotiation Flow** | | | |
| `negotiationId` (mock) | Simulated | Instant mock response | mock |
| `negotiationId` (real) | Backend-EDC | `POST /api/negotiations` | hybrid/full |
| `negotiationState` (mock) | Simulated | Always FINALIZED | mock |
| `negotiationState` (real) | Backend-EDC | `GET /api/negotiations/:id` | hybrid/full |
| `contractAgreementId` | Backend-EDC | Response from negotiation | hybrid/full |
| **Reference Data** | | | |
| `NEGOTIATION_STEPS` | Static | `mockData-health.ts` | All modes |
| `EXAMPLE_DSP_MESSAGES` | Static | `mockData-health.ts` | All modes |
| `CONSENT_PURPOSES` | Static | `mockData-health.ts` | All modes |
| `CONSENT_RESTRICTIONS` | Static | `mockData-health.ts` | All modes |
| **Events** | | | |
| `emitEvent()` | Context | `DspEventLogContext` | All modes |
| SSE events | Backend-EDC | `GET /api/events/stream` | hybrid/full |

---

### Page 4: Transfer Phase (`phase === 'transfer'`)

**Component:** `App-health.tsx` (lines 780-880) + `useTransfer.ts`

| Parameter | Source | API/File | Mode |
|-----------|--------|----------|------|
| **Input State** | | | |
| `selectedAsset` | Component State | From catalog phase | All modes |
| `contractAgreementId` | Component State | From negotiation phase | All modes |
| **Transfer Flow** | | | |
| `transferId` (mock) | Simulated | Instant mock response | mock |
| `transferId` (real) | Backend-EDC | `POST /api/transfers` | hybrid/full |
| `transferState` (mock) | Simulated | Always COMPLETED | mock |
| `transferState` (real) | Backend-EDC | `GET /api/transfers/:id` | hybrid/full |
| `edr` (EDR token) | Backend-EDC | Transfer response | full |
| **Reference Data** | | | |
| `TRANSFER_STEPS` | Static | `mockData-health.ts` | All modes |
| **Events** | | | |
| `emitEvent()` | Context | `DspEventLogContext` | All modes |
| SSE events | Backend-EDC | `GET /api/events/stream` | hybrid/full |

---

### Page 5: Compute Phase (`phase === 'compute'`)

**Component:** `App-health.tsx` (lines 880-950)

*Only shown for assets with `sensitiveCategory === 'genomic'` or `'mental-health'`*

| Parameter | Source | API/File | Mode |
|-----------|--------|----------|------|
| **Input State** | | | |
| `selectedAsset` | Component State | From catalog phase | All modes |
| **Compute Flow** | | | |
| Compute steps | Simulated | Local state machine | All modes |
| **Reference Data** | | | |
| `COMPUTE_STEPS` | Static | `mockData-health.ts` | All modes |
| **Events** | | | |
| `emitEvent()` | Context | `DspEventLogContext` | All modes |

---

### Page 6: Complete Phase (`phase === 'complete'`)

**Component:** `App-health.tsx` (lines 950-1100) + `EHRViewer.tsx`

| Parameter | Source | API/File | Mode |
|-----------|--------|----------|------|
| **EHR Data** | | | |
| `ehrData` (static fallback) | Static | `mockData-health.ts` → `MOCK_EHR_FULL_RECORDS` | mock (no backend) |
| `ehrData` (mock backend) | Backend-Mock | `GET /api/ehr/:id` | mock (with backend) |
| `ehrData` (hybrid) | Backend-EDC | `GET /api/transfers/ehr/:id` | hybrid |
| `ehrData` (full) | Backend-EDC | `GET /api/transfers/:id/data` (via EDR) | full |
| **Display Reference Data** | | | |
| `HEALTH_CATEGORIES` | Static | `mockData-health.ts` | All modes |
| `CONSENT_PURPOSES` | Static | `mockData-health.ts` | All modes |
| `CONSENT_RESTRICTIONS` | Static | `mockData-health.ts` | All modes |
| `ADR_SEVERITY_GRADES` | Static | `mockData-health.ts` | All modes |
| `ADR_CAUSALITY` | Static | `mockData-health.ts` | All modes |
| `MEDDRA_SOC` | Static | `mockData-health.ts` | All modes |
| **Summary Fallback** | | | |
| `selectedAsset` | Component State | From catalog phase | All modes |

**EHRViewer Component Data:**
| Section | Data Source | Fields |
|---------|-------------|--------|
| Patient Demographics | `ehrData.credentialSubject.patient` | age, sex, region |
| Diagnoses | `ehrData.credentialSubject.diagnoses` | ICD codes, comorbidities |
| Observations | `ehrData.credentialSubject.observations` | vitals, lab results |
| Medications | `ehrData.credentialSubject.medications` | ATC codes, dosages |
| Clinical Trial | `ehrData.credentialSubject.clinicalTrialNode` | phase, protocol, sponsor |
| MedDRA | `ehrData.credentialSubject.medDRANode` | SOC, preferred terms |
| ADRs | `ehrData.credentialSubject.adverseEvents` | severity, causality |
| Anamnesis | `ehrData.credentialSubject.anamnesis` | 5-step history |
| Consent | `ehrData.credentialSubject.consent` | purposes, restrictions |
| Raw FHIR | `ehrData.fhirBundle` | Full FHIR R4 Bundle |

---

### Persistent Components (All Pages)

#### DataspaceInsiderPanel

**Component:** `components/DataspaceInsiderPanel.tsx`

| Parameter | Source | API/File | Mode |
|-----------|--------|----------|------|
| `events` | Context | `DspEventLogContext` | All modes |
| `phaseStatus` | Context | `DspEventLogContext` | All modes |
| `isConnected` | Context | `DspEventLogContext` | hybrid/full |
| `isBackendOnline` | Props | Parent health check | All modes |
| SSE stream | Backend-EDC | `GET /api/events/stream` | hybrid/full |
| Seeding events | Backend-EDC | `POST /api/events/seeding` | hybrid/full |
| `OBSERVABILITY_LINKS` | Static | Local constant | All modes |

#### ModeSwitcher

**Component:** `components/ModeSwitcher.tsx`

| Parameter | Source | API/File | Mode |
|-----------|--------|----------|------|
| `currentMode` | Environment | `VITE_API_MODE` | All modes |
| `backendStatus` | Backend-Mock | `GET /health` | All modes |

#### Header/Footer

| Parameter | Source | Description |
|-----------|--------|-------------|
| `GITHUB_REPO_URL` | Static | Repository link |
| `VERSION` | Static | App version |
| Mode indicator | Environment | `VITE_API_MODE` |

---

## Data Flow by Mode - Complete Matrix

### Mock Mode (`VITE_API_MODE=mock`)

| Phase | Static Data | Backend-Mock | Backend-EDC | Simulated |
|-------|-------------|--------------|-------------|-----------|
| Intro | ✅ Participants, phases | ✅ Health check | ❌ | ❌ |
| Catalog | ✅ Categories, filters | ✅ `/api/ehr` | ❌ | ❌ |
| Negotiation | ✅ Steps, messages | ❌ | ❌ | ✅ Instant |
| Transfer | ✅ Steps | ❌ | ❌ | ✅ Instant |
| Compute | ✅ Steps | ❌ | ❌ | ✅ Instant |
| Complete | ✅ Display refs | ✅ `/api/ehr/:id` | ❌ | ❌ |

### Hybrid Mode (`VITE_API_MODE=hybrid`)

| Phase | Static Data | Backend-Mock | Backend-EDC | Simulated |
|-------|-------------|--------------|-------------|-----------|
| Intro | ✅ Participants, phases | ❌ | ✅ Health | ❌ |
| Catalog | ✅ Categories, filters | ❌ | ✅ `/api/catalog/assets` | ❌ |
| Negotiation | ✅ Steps, messages | ❌ | ✅ `/api/negotiations` | ❌ |
| Transfer | ✅ Steps | ❌ | ✅ `/api/transfers` | ❌ |
| Compute | ✅ Steps | ❌ | ❌ | ✅ |
| Complete | ✅ Display refs | ❌ | ✅ `/api/transfers/ehr/:id` | ❌ |
| SSE Events | ❌ | ❌ | ✅ `/api/events/stream` | ❌ |

### Full Mode (`VITE_API_MODE=full`)

| Phase | Static Data | Backend-Mock | Backend-EDC | EDC Control Planes |
|-------|-------------|--------------|-------------|-------------------|
| Intro | ✅ Participants, phases | ❌ | ✅ Health | ❌ |
| Catalog | ✅ Categories, filters | ❌ | ✅ Catalog → EDC | ✅ DSP Catalog |
| Negotiation | ✅ Steps, messages | ❌ | ✅ Negotiations → EDC | ✅ DSP Contract |
| Transfer | ✅ Steps | ❌ | ✅ Transfers → EDC | ✅ DSP Transfer |
| Compute | ✅ Steps | ❌ | ✅ | ✅ TEE (future) |
| Complete | ✅ Display refs | ❌ | ✅ Data via EDR | ✅ Data Plane |
| SSE Events | ❌ | ❌ | ✅ Real EDC callbacks | ✅ |

---

## 1. Static/Hardcoded Parameters

These values are hardcoded in the frontend and never fetched from any API:

### 1.1 Reference Data (Used for Filtering & Display)

| Parameter | File | Description | Count |
|-----------|------|-------------|-------|
| `HEALTH_CATEGORIES` | `mockData-health.ts` | Medical specialties with colors/icons | 11 |
| `HEALTH_CATEGORY_IMAGES` | `mockData-health.ts` | Unsplash URLs per category | 11 |
| `CONSENT_PURPOSES` | `mockData-health.ts` | EHDS-aligned consent purposes | 6 |
| `CONSENT_RESTRICTIONS` | `mockData-health.ts` | Consent restriction types | 6 |
| `CLINICAL_TRIAL_PHASES` | `mockData-health.ts` | ICH E8(R1) phases | 6 |
| `MEDDRA_SOC` | `mockData-health.ts` | MedDRA v27.0 SOC codes | 27 |
| `ADR_SEVERITY_GRADES` | `mockData-health.ts` | CTCAE severity grades | 5 |
| `ADR_CAUSALITY` | `mockData-health.ts` | WHO-UMC causality categories | 6 |
| `EMA_THERAPEUTIC_AREAS` | `mockData-health.ts` | ATC-aligned therapeutic areas | 27 |
| `SPONSOR_TYPES` | `mockData-health.ts` | commercial/academic/non-profit | 3 |
| `MOCK_SPONSORS` | `mockData-health.ts` | Demo sponsor organizations | 8 |
| `EU_MEMBER_STATE_FLAGS` | `mockData-health.ts` | EU country flags | 14 |
| `HDAB_DATA` | `mockData-health.ts` | Health Data Access Bodies (DE/NL/BE) | 3 |
| `EHDS_DATA_CATEGORIES` | `mockData-health.ts` | EHDS Article 51 categories | 17 |
| `HEALTHDCAT_PUBLISHER_TYPES` | `mockData-health.ts` | HealthDCAT-AP publisher types | 7 |
| `DPV_PERSONAL_DATA_CATEGORIES` | `mockData-health.ts` | Data Privacy Vocabulary categories | 14 |
| `HEALTH_TERMINOLOGY_SYSTEMS` | `mockData-health.ts` | ICD-10, SNOMED-CT, LOINC, etc. | 8 |

### 1.2 Static Demo Data (Mock Mode Only)

| Parameter | File | Description | Status |
|-----------|------|-------------|--------|
| `MOCK_CATALOG_ASSETS` | `mockData-health.ts` | 20+ HealthDCAT-AP catalog entries | ⚠️ Only used when APIs unavailable |
| `MOCK_EHR_FULL_RECORDS` | `mockData-health.ts` | Full EHR credential objects | ⚠️ Only used when APIs unavailable |
| `DSP_PHASES` | `mockData-health.ts` | DSP protocol phase descriptions | ✅ Educational content |
| `EXAMPLE_DSP_MESSAGES` | `mockData-health.ts` | Example DSP protocol messages | ✅ Educational content |
| `MOCK_PARTICIPANTS` | `mockData-health.ts` | Provider/Consumer participant info | ✅ Demo scenario |

### 1.3 Hardcoded Defaults

| Default | Value | Location | Should Be Dynamic? |
|---------|-------|----------|-------------------|
| MedDRA version | `'27.0'` | Multiple files | ❌ Stable reference |
| Provider Participant ID | `did:web:provider-identityhub%3A7093` | `config.ts` | ⚠️ Should be from config |
| Provider DSP URL | `http://localhost:8192/api/dsp` | `config.ts` | ⚠️ Should be from env |
| EDC JSON-LD context | `https://w3id.org/edc/...` | `edcApi.ts` | ❌ Standard URI |
| Poll interval | `2000ms` | `useEhrFlow.ts` | ❌ UX tuning |
| Max poll attempts | `30` | `useEhrFlow.ts` | ❌ UX tuning |
| Retry attempts | `3` | `useCatalog.ts` | ❌ UX tuning |

---

## 2. Backend-Mock Parameters (Port 3001/4001)

These are fetched from `backend-mock` in **mock mode**:

### 2.1 API Endpoints

| Endpoint | Method | Returns | Frontend Usage |
|----------|--------|---------|----------------|
| `/health` | GET | `{ status: 'ok' }` | Health check |
| `/api/ehr` | GET | `{ records: [...], totalCount: N }` | EHR catalog list |
| `/api/ehr/:id` | GET | Full EHR record | EHR detail view |
| `/api/ehr/:id/summary` | GET | Summary object | Card preview |
| `/api/ehr/:id/fhir` | GET | FHIR Bundle | Raw FHIR export |

### 2.2 Response Fields from Backend-Mock

| Field | Type | Description |
|-------|------|-------------|
| `id` / `ehrId` | string | EHR record identifier |
| `primaryDiagnosis` | string | Main diagnosis text |
| `icdCode` | string | ICD-10-GM code |
| `ageBand` | string | Age range (e.g., "55-64") |
| `biologicalSex` | string | "male" / "female" / "other" |
| `qualityScore` | number | Data quality 0-100 |
| `pseudonymId` | string | De-identified patient ID |
| `consentPurposes` | string[] | Allowed consent purposes |
| `studyEligibility` | boolean | Clinical trial eligibility |

### 2.3 Mock Mode Simulated Responses

In **mock mode**, these return instant simulated results (no API call):

| Function | Returns | Purpose |
|----------|---------|---------|
| `initiateNegotiation()` | Mock negotiation ID + FINALIZED | Skip real EDC |
| `getNegotiationStatus()` | Always FINALIZED | Skip polling |
| `initiateTransfer()` | Mock transfer ID + COMPLETED | Skip real EDC |
| `getTransferStatus()` | Always COMPLETED | Skip polling |
| `getConsentStatus()` | Mock active consent | Simulate consent |

---

## 3. EDC Integration Layer Parameters (Port 3002/4002)

These are fetched from `backend-edc` in **hybrid** or **full** mode:

### 3.1 Catalog APIs

| Endpoint | Method | Returns | Mode |
|----------|--------|---------|------|
| `/api/catalog` | GET | Raw EDC catalog | hybrid/full |
| `/api/catalog/assets` | GET | `{ assets: [...], totalCount, source }` | hybrid/full |
| `/api/catalog/cached` | GET | Federated catalog cache | hybrid/full |

**Response Fields (CatalogAsset):**
| Field | Source | Description |
|-------|--------|-------------|
| `assetId` | EDC | Asset identifier |
| `title` | `dct:title` | Dataset title |
| `description` | `dct:description` | Dataset description |
| `healthCategory` | `healthdcatap:healthCategory` | Medical specialty |
| `ageBand` | `healthdcatap:ageRange` | Age range |
| `biologicalSex` | `healthdcatap:biologicalSex` | Sex category |
| `clinicalPhase` | `healthdcatap:clinicalTrialPhase` | Trial phase |
| `meddraVersion` | `healthdcatap:meddraVersion` | MedDRA version |
| `sensitiveCategory` | `healthdcatap:sensitiveCategory` | Sensitivity level |
| `policies` | `odrl:hasPolicy` | ODRL policy definitions |

### 3.2 Contract Negotiation APIs

| Endpoint | Method | Request Body | Returns |
|----------|--------|--------------|---------|
| `/api/negotiations` | POST | `{ assetId, offerId, policyId? }` | `{ negotiationId, state }` |
| `/api/negotiations/:id` | GET | - | `{ id, state, contractAgreementId?, message? }` |
| `/api/negotiations/:id/cancel` | POST | - | Cancellation result |

**Negotiation States (from EDC):**
| State | Description |
|-------|-------------|
| `INITIAL` | Just created |
| `REQUESTING` | Sending request |
| `REQUESTED` | Request sent |
| `OFFERING` | Provider reviewing |
| `ACCEPTED` | Provider accepted |
| `AGREED` | Agreement created |
| `VERIFIED` | Credentials verified |
| `FINALIZED` | ✅ Complete |
| `TERMINATED` | ❌ Failed |

### 3.3 Transfer APIs

| Endpoint | Method | Request Body | Returns |
|----------|--------|--------------|---------|
| `/api/transfers` | POST | `{ assetId, contractId }` | `{ transferId, state }` |
| `/api/transfers/:id` | GET | - | `{ id, state, edr? }` |
| `/api/transfers/:id/data` | GET | - | Actual EHR data (via EDR) |
| `/api/transfers/ehr/:id` | GET | - | EHR data (hybrid fallback) |
| `/api/transfers/complete` | POST | `{ ehrId, contractId }` | Full transfer result |

**Transfer States (from EDC):**
| State | Description |
|-------|-------------|
| `INITIAL` | Just created |
| `PROVISIONING` | Setting up |
| `PROVISIONED` | Ready |
| `REQUESTING` | Requesting data |
| `REQUESTED` | Request sent |
| `STARTING` | Starting transfer |
| `STARTED` | ✅ EDR available |
| `COMPLETED` | ✅ Transfer done |
| `TERMINATED` | ❌ Failed |

### 3.4 Identity APIs

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/identity/verify` | GET | Provider identity verification |
| `/api/identity/status` | GET | Consumer identity status |

### 3.5 Consent APIs

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/consent/:ehrId` | GET | Current consent status |
| `/api/consent/:ehrId` | POST | Submit consent |
| `/api/consent/:ehrId/revoke` | POST | Revoke consent |

### 3.6 Event Streaming APIs (SSE)

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/events/stream` | GET (SSE) | Real-time DSP events |
| `/api/events/callback` | POST | EDC callback webhook |
| `/api/events/seeding` | POST | Seed script events |
| `/api/events/seeding/status` | GET | Seeding status |
| `/api/mode` | GET | Current mode info |
| `/health` | GET | Service health |

---

## 4. Data Flow by Mode

### Mock Mode (`VITE_API_MODE=mock`)

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│ Backend-Mock │
│   :4000     │     │   :4001      │
└─────────────┘     └─────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  Static Reference Data          │
│  (mockData-health.ts)           │
└─────────────────────────────────┘
```

**Data Sources:**
- ✅ EHR list/detail: `backend-mock`
- ✅ Reference data: Static
- ⚠️ Negotiation: Simulated (instant)
- ⚠️ Transfer: Simulated (instant)
- ❌ SSE Events: Not connected

### Hybrid Mode (`VITE_API_MODE=hybrid`)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│ Backend-EDC │────▶│ Backend-Mock │
│   :4000     │     │   :4002     │     │   :4001      │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │
      │                   ▼ (fallback if EDC unavailable)
      │            ┌─────────────────┐
      │            │ EDC Control     │
      │            │ Planes (:808x)  │
      │            └─────────────────┘
      ▼
┌─────────────────────────────────┐
│  Static Reference Data          │
└─────────────────────────────────┘
```

**Data Sources:**
- ✅ Catalog: `backend-edc` (with mock fallback)
- ✅ EHR data: `backend-mock` (via backend-edc)
- ✅ Negotiation: `backend-edc` → EDC (if available)
- ✅ Transfer: `backend-edc` → mock data
- ✅ SSE Events: Connected
- ✅ Reference data: Static

### Full Mode (`VITE_API_MODE=full`)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Frontend  │────▶│ Backend-EDC │────▶│ EDC Control     │
│   :4000     │     │   :4002     │     │ Planes (:808x)  │
└─────────────┘     └─────────────┘     └─────────────────┘
      │                                         │
      ▼                                         ▼
┌─────────────────────────────────┐     ┌─────────────────┐
│  Static Reference Data          │     │ EDC Data Plane  │
└─────────────────────────────────┘     │ (via EDR token) │
                                        └─────────────────┘
```

**Data Sources:**
- ✅ Catalog: EDC federated catalog
- ✅ EHR data: EDC Data Plane (via EDR)
- ✅ Negotiation: Full EDC protocol
- ✅ Transfer: Full EDC protocol
- ✅ SSE Events: Real EDC callbacks
- ✅ Reference data: Static

---

## 5. Recommendations

### Parameters That Should Be Dynamic (Currently Static)

| Parameter | Current Source | Recommended Source |
|-----------|---------------|-------------------|
| Provider Participant ID | Hardcoded | Environment variable |
| Provider DSP URL | Hardcoded | Environment variable |
| Consumer Participant ID | Hardcoded | Identity Hub API |
| Available Consent Purposes | Static array | Provider policy API |
| MedDRA SOC codes | Static array | Terminology service |
| Sponsor organizations | Static array | Directory service |

### Parameters That Should Remain Static

| Parameter | Reason |
|-----------|--------|
| Clinical Trial Phases | ICH E8(R1) standard (stable) |
| EHDS Data Categories | EHDS Article 51 (regulatory) |
| ADR Severity Grades | CTCAE standard (stable) |
| EU Member State Flags | Reference data (stable) |
| Health Terminology Systems | Standard URIs (stable) |

---

## 6. Environment Variables Summary

| Variable | Default | Used By |
|----------|---------|---------|
| `VITE_API_MODE` | `mock` | Mode selection |
| `VITE_MOCK_API_URL` | `http://localhost:3001` | Backend-mock |
| `VITE_EDC_API_URL` | `http://localhost:3002` | Backend-EDC |
| `VITE_EHR_BACKEND_URL` | `http://localhost:3001` | EHR data |
| `VITE_BACKEND_URL` | `http://localhost:3001` | General backend |
| `VITE_DEBUG` | `false` | Debug logging |

---

*Report generated by analyzing frontend/src/services/, frontend/src/hooks/, and frontend/src/types/*
