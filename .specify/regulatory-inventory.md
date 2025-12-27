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

---

# Example: Catena-X Standards Regulatory Inventory

This inventory maps Catena-X standards to technical implementation requirements.

## CX-0018: Dataspace Connectivity (v3.0.0)

**Status:** ✅ MANDATORY for all Catena-X participants

### Technical Requirements

| Requirement | Implementation | Testing Method | Compliance Test |
|-------------|---------------|----------------|------------------|
| **DSP Catalog Protocol** | EDC implements `/v2/catalog/request` endpoint | Integration test: Query catalog from another connector | Newman collection: `DSP-Catalog.postman_collection.json` |
| **DSP Contract Negotiation** | EDC implements `/v2/contractnegotiations` endpoint | Integration test: Negotiate contract end-to-end | Newman: `DSP-ContractNegotiation.postman_collection.json` |
| **DSP Transfer Process** | EDC implements `/v2/transferprocesses` endpoint | Integration test: Transfer data with EDR | Newman: `DSP-Transfer.postman_collection.json` |
| **DCP Credential Exchange** | Request VP before DSP, validate MembershipCredential | Unit test: Policy evaluation functions | E2E test: Full flow with credential validation |
| **EDR Token Handling** | Secure EDR storage, token refresh logic | Unit test: Token expiry handling | E2E test: Data access with EDR |

### Implementation Files
- `launchers/controlplane/` - EDC controlplane with DSP/DCP
- `extensions/dcp-impl/` - DCP protocol extensions
- `tests/end2end/` - DSP compliance tests

### Compliance Evidence
- [ ] EDC connector accessible via HTTPS
- [ ] DSP protocol version in header: `DSP-Version: 1.0`
- [ ] Contract negotiation completes successfully
- [ ] Data transfer completes with valid EDR

---

## CX-0049: DID Document Schema (v1.0.0)

**Status:** ✅ MANDATORY for identity verification

### Technical Requirements

| Requirement | Implementation | Testing Method | Compliance Test |
|-------------|---------------|----------------|------------------|
| **DID:WEB format** | `did:web:{domain}:{participantId}` | Unit test: DID parsing | Integration test: DID resolution |
| **Well-known endpoint** | NGINX serves `/.well-known/did.json` | Curl test: `curl https://{domain}/.well-known/did.json` | Verify DID document structure |
| **Public key in DID** | Ed25519 public key in `verificationMethod` | Unit test: Key format validation | Integration test: Signature verification |
| **CredentialService endpoint** | IdentityHub URL in `service` array | Integration test: Resolve CredentialService | E2E test: Query credentials |

### Implementation Files
- `deployment/assets/*/did.json` - DID document templates
- `extensions/did-example-resolver/` - DID resolution logic
- `launchers/identity-hub/` - IdentityHub for credential service

### Compliance Evidence
- [ ] DID document publicly accessible
- [ ] DID format follows `did:web` spec (W3C DID Core)
- [ ] At least one verification method present
- [ ] CredentialService endpoint returns 200 OK

---

## CX-0050: Framework Agreement Credential (v1.0.0)

**Status:** ✅ MANDATORY for access control

### Technical Requirements

| Requirement | Implementation | Testing Method | Compliance Test |
|-------------|---------------|----------------|------------------|
| **MembershipCredential** | W3C Verifiable Credential with `type: MembershipCredential` | Unit test: Credential parsing | E2E test: Contract with membership check |
| **FrameworkAgreementCredential** | Scoped credentials (`traceability:1.0`, `pcf:1.0`, etc.) | Unit test: Scope extraction | Policy evaluation test |
| **BPN Credential** | Business Partner Number in `credentialSubject.holderIdentifier` | Unit test: BPN format validation | E2E test: BPN-based access control |
| **Credential expiry** | Check `expirationDate` before accepting | Unit test: Expiry validation function | Integration test: Reject expired credential |
| **Signature validation** | Verify JWT signature using issuer's public key | Unit test: JWS validation | Integration test: Reject invalid signature |

### Implementation Files
- `extensions/dcp-impl/src/main/java/.../MembershipCredentialEvaluationFunction.java` - Policy function
- `extensions/dcp-impl/src/main/java/.../DataAccessLevelFunction.java` - Framework agreement check
- `launchers/identity-hub/` - Credential storage
- `launchers/issuerservice/` - Credential issuance

### Compliance Evidence
- [ ] All participants have MembershipCredential
- [ ] Policy evaluation rejects requests without valid credential
- [ ] Framework agreement credentials scoped to specific use cases
- [ ] BPN in credential matches participant identifier

---

## CX-0001: Participant Registration (v2.0.0)

**Status:** ⚠️ REQUIRED for production (not dev/test)

### Technical Requirements

| Requirement | Implementation | Testing Method | Compliance Test |
|-------------|---------------|----------------|------------------|
| **BPN registration** | Register with Business Partner Data Service | Manual: BPDS portal | Verify BPN issued |
| **Catalog registration** | Register connector in federated catalog | Integration test: Connector discoverable | Query catalog node directory |
| **Self-description** | Gaia-X self-description published | Unit test: Self-description format | Gaia-X compliance check |

### Implementation Files
- `extensions/catalog-node-resolver/` - Participant directory resolver
- `deployment/assets/participants` - Participant list for dev/test

### Compliance Evidence
- [ ] BPN issued by Catena-X authority
- [ ] Connector listed in federated catalog
- [ ] Self-description follows Gaia-X Trust Framework

---

## CX-0151: Industry Core Basics (v1.0.0)

**Status:** ✅ MANDATORY for traceability use cases

### Technical Requirements

| Requirement | Implementation | Testing Method | Compliance Test |
|-------------|---------------|----------------|------------------|
| **SerialPart aspect** | SAMM model for part instances | JSON Schema validation | Contract test: Validate SerialPart response |
| **Batch aspect** | SAMM model for non-serialized parts | JSON Schema validation | Contract test: Validate Batch response |
| **Quality notification API** | POST `/qualitynotifications/receive` endpoint | Contract test: Newman collection | E2E test: Send notification, verify receipt |
| **Notification status updates** | Async status updates (RECEIVED, ACKNOWLEDGED, etc.) | Integration test: Status callback | E2E test: Full notification lifecycle |

### Implementation Files
- `data-models/` - JSON schemas for SerialPart, Batch
- `spec.yaml` - OpenAPI spec for quality notification API
- Application code (domain-specific, not in MVD template)

### Compliance Evidence
- [ ] SerialPart aspect conforms to SAMM 2.1.0
- [ ] Quality notification API returns 201 Created
- [ ] Status updates delivered within 5 minutes
- [ ] Notification lifecycle completes successfully

---

## CX-0152: Policy Constraints for Data Exchange (v1.0.0)

**Status:** ✅ MANDATORY for all assets

### Technical Requirements

| Requirement | Implementation | Testing Method | Compliance Test |
|-------------|---------------|----------------|------------------|
| **Membership constraint** | ODRL policy with `cx-policy:Membership=active` | Unit test: Policy evaluation | E2E test: Reject non-member |
| **Framework agreement** | ODRL policy with `cx-policy:FrameworkAgreement=...` | Unit test: Scope matching | E2E test: Reject wrong framework |
| **Usage purpose** | ODRL policy with `cx-policy:UsagePurpose=...` | Unit test: Purpose validation | E2E test: Purpose-based access |
| **BPN constraint** | ODRL policy with `cx-policy:BusinessPartnerNumber` | Unit test: BPN validation | E2E test: BPN-based access control |

### Implementation Files
- `policies/membership-credential-policy.json` - Membership ODRL policy
- `policies/bpn-credential-policy.json` - BPN ODRL policy
- `policies/purpose-usage-policy.json` - Purpose ODRL policy
- `extensions/dcp-impl/src/main/java/.../` - Policy evaluation functions

### Compliance Evidence
- [ ] All assets have ODRL policies attached
- [ ] Policy evaluation functions implemented
- [ ] Contract negotiation fails without required credentials
- [ ] Purpose constraint enforced

---

## CX-0003: SAMM Aspect Meta Model (v2.1.0)

**Status:** ⚠️ REQUIRED for digital twin aspects

### Technical Requirements

| Requirement | Implementation | Testing Method | Compliance Test |
|-------------|---------------|----------------|------------------|
| **SAMM version** | Use SAMM 2.1.0 schema | JSON Schema validation | Validate aspect against SAMM schema |
| **Namespace convention** | `urn:samm:io.catenax.*` | Unit test: Namespace parsing | Verify namespace in aspect model |
| **Aspect validation** | Validate aspects before publishing | CI/CD: SAMM validator | Automated validation in pipeline |

### Implementation Files
- `data-models/` - SAMM aspect models (JSON schemas derived from SAMM)
- Application code (domain-specific aspect models)

### Compliance Evidence
- [ ] All aspects follow SAMM 2.1.0 structure
- [ ] Namespaces follow Catena-X convention
- [ ] Aspect validation passes in CI/CD

---

## CX-0007: Minimal Data Provider Services Offering (v1.0.0)

**Status:** ⚠️ REQUIRED for data providers

### Technical Requirements

| Requirement | Implementation | Testing Method | Compliance Test |
|-------------|---------------|----------------|------------------|
| **Catalog endpoint** | Expose at least one asset in catalog | Integration test: Query catalog | Verify asset count > 0 |
| **Contract negotiation** | Accept valid contract offers | Integration test: Negotiate contract | Verify contract agreement |
| **Data transfer** | Complete transfer with EDR | Integration test: Transfer data | Verify data received |

### Compliance Evidence
- [ ] Catalog returns at least one asset
- [ ] Contract negotiation completes
- [ ] Data transfer successful

---

## CX-0010: Business Partner Number (v2.0.0)

**Status:** ✅ MANDATORY for identification

### Technical Requirements

| Requirement | Implementation | Testing Method | Compliance Test |
|-------------|---------------|----------------|------------------|
| **BPN format** | `BPNL` + 12 digits for Legal Entity | Unit test: Regex validation | Verify format: `^BPNL[0-9]{12}$` |
| **BPN in credentials** | BPN in `holderIdentifier` field | Unit test: Credential parsing | Verify BPN present |
| **BPN in policies** | BPN constraint in ODRL policies | Unit test: Policy parsing | Verify BPN constraint |

### Compliance Evidence
- [ ] All participants have BPN in format `BPNL[0-9]{12}`
- [ ] BPN present in credentials
- [ ] BPN validated in policy evaluation

---

## Additional Domain Examples

See `REAL-WORLD-DATASPACE-EXAMPLES.md` for regulatory patterns from:
- **Energy-Data-X:** IEC 61850, German Energy Industry Act (EnWG), GDPR
- **MDS (Mobility):** GDPR, ITS Directive, German data sovereignty
- **EONA-X:** GDPR travel data, EU transport regulations
- **Prometheus-X:** GDPR, FERPA (US), EU Digital Education Action Plan
