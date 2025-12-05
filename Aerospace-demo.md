# Eclipse Dataspace MVP Specification: Aerospace Digital Product Passport

**Scenario:** ApexPropulsion Systems (Provider) to Horizon Aviation Group (Consumer) Data Exchange
**Version:** 1.0  
**Status:** Draft  
**Based on:** Aerospace Digital Passport Data Structure (Ref: 810a7afe)

## 1. Executive Summary

This document specifies the Minimum Viable Product (MVP) configuration for an Eclipse Dataspace deployment facilitating the secure exchange of Digital Product Passports (DPP) between ApexPropulsion Systems (Provider) and Horizon Aviation Group (Consumer).

The MVP demonstrates the decentralized exchange of a "Digital Crate"—a JSON-LD Verifiable Credential containing Airworthiness, Sustainability, and Operational data for a high-value spare part (Trent XWB High-Pressure Turbine Blade).

## 2. Architecture Overview

The MVP consists of two Eclipse Dataspace Connectors (EDC) communicating via the Dataspace Protocol (DSP).

### 2.1 Components

**Provider Connector (ApexPropulsion Systems):**
* Hosts the "Digital Crate" (DPP) data.
* Enforces usage policies (e.g., Access restricted to Horizon Aviation Group DIDs).
* Serves the data via a public API endpoint or directly through the data plane.

**Consumer Connector (Horizon Aviation Group):**
* Discovers the Asset.
* Negotiates a Contract.
* Initiates the Data Transfer to ingest the DPP into the fleet management ontology.

### 2.2 Interaction Flow

* **Asset Registration:** ApexPropulsion Systems registers the Engine Blade DPP as an Asset.
* **Policy Definition:** ApexPropulsion Systems defines a policy restricting access to Horizon Aviation Group.
* **Contract Negotiation:** Horizon Aviation Group requests the asset; ApexPropulsion Systems validates the identity/DID.
* **Transfer Process:** Upon contract agreement, data is transferred (via HTTP Proxy/Pull) to Horizon Aviation Group.

## 3. Data Model Specification

The core payload exchanged in this MVP is the Digital Crate JSON-LD. This structure synthesizes ATA Spec 2000, S5000F, and IPC-1754 data.

### 3.1 The Asset Payload (JSON-LD)

This is the static content served by the Provider's backend service (mocked for MVP).

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/aerospace/dpp/v1"
  ],
  "id": "did:web:apexpropulsion.com:parts:serial:98765-XYZ-123",
  "type": ["VerifiableCredential", "AerospacePartPassport"],
  "issuer": "did:web:apexpropulsion.com",
  "issuanceDate": "2025-10-27T10:00:00Z",
  "credentialSubject": {
    "id": "did:web:apexpropulsion.com:parts:serial:98765-XYZ-123",
    "partType": "HighPressureTurbineBlade",
    "sku": "APEX-TrentXWB-HPT-Blade-001",
    "identityNode": {
      "manufacturerName": "ApexPropulsion Systems",
      "cageCode": "K1039",
      "partNumber": "FW12345",
      "serialNumber": "HPT998877"
    },
    "airworthinessNode": {
      "formType": "EASA_FORM_1",
      "formTrackingNumber": "APEX-DERBY-2025-00451",
      "status": "NEW"
    },
    "sustainabilityNode": {
      "pcfValue": 45.2,
      "pcfUnit": "kgCO2e",
      "scope": "Cradle-to-Gate"
    },
    "operationalNode": {
      "timeSinceNew": 0,
      "cyclesSinceNew": 0
    }
  }
}
```

## 4. EDC Configuration Entities

To enable the exchange, the following entities must be created via the EDC Management API on the Provider (ApexPropulsion Systems) side.

### 4.1 Asset Definition

The Asset represents the specific spare part available for exchange.

**Asset ID:** `asset:propulsion:blade:98765`

**Properties:**
* `dct:type`: `ids:DigitalProductPassport`
* `description`: "DPP for Trent XWB HPT Blade SN:998877"
* `version`: "1.0"
* `contenttype`: "application/json+ld"

**Data Address:**
* `type`: `HttpData`
* `baseUrl`: `http://apexpropulsion-backend-service/api/parts/98765` (Mock internal URL)

### 4.2 Policy Definition

Defines who can access the data. For the MVP, we use a BPN (Business Partner Number) or DID restriction.

**Policy ID:** `policy:horizonaviation-exclusive`

**Constraint:**
* **Left Operand:** `BusinessPartnerNumber`
* **Operator:** `EQ`
* **Right Operand:** `BPN-HORIZONAVIATION-001` (Mock BPN)

### 4.3 Contract Definition

Links the Asset to the Policy, offering it to the dataspace.

**Contract ID:** `contract:blade-access`
**Access Policy:** `policy:horizonaviation-exclusive`
**Contract Policy:** `policy:horizonaviation-exclusive`
**Assets:** `asset:propulsion:blade:98765`

## 5. MVP Usage Scenario Steps

This section details the step-by-step execution flow for the demo.

### Step 1: Provider Setup (ApexPropulsion Systems)
1. Boot Provider EDC.
2. Start "Blue Data Thread" mock server (serving the JSON-LD payload).
3. Execute `POST /management/v3/assets` to register the Digital Crate.
4. Execute `POST /management/v2/policydefinitions` to create the Horizon Aviation Group-only policy.
5. Execute `POST /management/v2/contractdefinitions` to publish the offer.

### Step 2: Consumer Discovery (Horizon Aviation Group)
1. Boot Consumer EDC.
2. Consumer executes `POST /management/v2/catalog/request` targeting the Provider's DSP address.
   * **Expected Result:** The Catalog returns the `asset:propulsion:blade:98765` offer.

### Step 3: Negotiation & Transfer
1. Consumer initiates negotiation for `contract:blade-access`.
2. Provider EDC verifies Consumer BPN.
3. Contract is agreed (State: `CONFIRMED`).
4. Consumer initiates transfer (`POST /management/v2/transferprocesses`).
   * **Destination Type:** `HttpProxy` (Synchronous data pull).
   * **Result:** Consumer receives the JSON-LD "Digital Crate".

### Step 4: Data Validation (Horizon Aviation Group Fleet Management Logic)
*Note: This is post-EDC logic.*

1. Horizon Aviation Group system parses the JSON-LD.
2. Checks `airworthinessNode.status == "NEW"`.
3. Checks `identityNode.serialNumber` against expected order.

## 6. Technical Requirements

* **Runtime:** Java 17+ (Eclipse Dataspace is Java-based).
* **Build Tool:** Gradle.
* **Docker:** Recommended for orchestrating the two connectors and the mock backend.
* **EDC Version:** 0.6.x (or latest stable Milestone).

## 7. Future Extensions (Post-MVP)

* **Usage Control:** Restrict usage duration (e.g., "Data valid for 24 hours").
* **Complex Policy:** Require a specific Verifiable Credential (e.g., "Certified MRO") to access repair manuals.
* **Push Transfer:** Use S3 or Azure Blob Storage sinks for large history files.
