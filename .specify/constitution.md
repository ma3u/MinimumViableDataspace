# Constitution: Non-Negotiable Development Rules

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

---

# Example: Catena-X Compliance Gates

These compliance gates are required for Catena-X dataspace implementations.

## CX-0018: Dataspace Connectivity (ALWAYS REQUIRED)

### DSP Protocol Compliance
- [ ] **Connector implements DSP 1.0+** - Eclipse Dataspace Components (EDC) or compatible
- [ ] **Catalog endpoint** - Exposes assets via DSP catalog protocol (`/v2/catalog/request`)
- [ ] **Contract negotiation** - Supports DSP contract negotiation protocol (`/v2/contractnegotiations`)
- [ ] **Transfer process** - Supports DSP transfer process protocol (`/v2/transferprocesses`)
- [ ] **EDR token handling** - Manages Endpoint Data References securely

### DCP Protocol Compliance (Decentralized Claims Protocol)
- [ ] **Credential exchange before DSP** - Request credentials via DCP before initiating DSP messages
- [ ] **Self-Issued (SI) token** - Generate SI token with scope matching required credentials
- [ ] **Verifiable Presentation** - Validate VP from IdentityHub containing required credentials
- [ ] **Credential expiry check** - Reject expired credentials

### Technical Requirements
- [ ] **HTTP/2 support** - All EDC endpoints support HTTP/2
- [ ] **TLS 1.3 minimum** - No older TLS versions accepted
- [ ] **Mutual TLS (mTLS)** - Optional but recommended for production
- [ ] **Token-based auth** - EDR tokens contain valid authorization claims

## CX-0049: DID Document Schema (ALWAYS REQUIRED)

### DID:WEB Implementation
- [ ] **DID format** - Use `did:web` method (e.g., `did:web:connector.example.com:participant-id`)
- [ ] **Well-known endpoint** - DID document accessible at `https://{domain}/.well-known/did.json`
- [ ] **Public key exposure** - Verification methods include public keys for signature validation
- [ ] **Service endpoints** - DID document includes:
  - [ ] `CredentialService` - IdentityHub endpoint for credential exchange
  - [ ] `EDC` - EDC DSP protocol endpoint

### DID Document Structure
```json
{
  "@context": ["https://www.w3.org/ns/did/v1"],
  "id": "did:web:connector.example.com:BPNL000000000001",
  "verificationMethod": [
    {
      "id": "did:web:connector.example.com:BPNL000000000001#key-1",
      "type": "JsonWebKey2020",
      "controller": "did:web:connector.example.com:BPNL000000000001",
      "publicKeyJwk": {
        "kty": "OKP",
        "crv": "Ed25519",
        "x": "..."
      }
    }
  ],
  "service": [
    {
      "id": "did:web:connector.example.com:BPNL000000000001#credential-service",
      "type": "CredentialService",
      "serviceEndpoint": "https://identityhub.example.com/api/resolution"
    },
    {
      "id": "did:web:connector.example.com:BPNL000000000001#edc",
      "type": "EDC",
      "serviceEndpoint": "https://connector.example.com/api/v1/dsp"
    }
  ]
}
```

### Key Management
- [ ] **Key rotation** - Rotate signing keys every 365 days maximum
- [ ] **Private key security** - Store private keys in HSM or secure vault (HashiCorp Vault, Azure Key Vault)
- [ ] **No key reuse** - Each participant has unique key pair

## CX-0050: Framework Agreement Credential (ALWAYS REQUIRED)

### Credential Issuance
- [ ] **MembershipCredential** - All participants must have valid Catena-X membership credential
- [ ] **FrameworkAgreementCredential** - Specific use case credentials:
  - [ ] `traceability:1.0` - For quality notification/traceability use cases
  - [ ] `pcf:1.0` - For Product Carbon Footprint calculation
  - [ ] `quality:1.0` - For quality management
  - [ ] `circularity:1.0` - For circular economy/DPP
- [ ] **Business Partner Number (BPN) Credential** - Legal entity BPN validated
- [ ] **Issuer trust** - Only accept credentials from trusted Catena-X issuer

### Credential Validation (Policy Evaluation)
- [ ] **Expiry check** - Reject credentials with `expirationDate` in past
- [ ] **Signature validation** - Verify JWT signature against issuer's public key
- [ ] **Revocation check** - Query revocation list (if applicable)
- [ ] **Scope matching** - Ensure credential grants required permissions

### Example MembershipCredential
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "MembershipCredential"],
  "issuer": "did:web:issuer.catena-x.net",
  "issuanceDate": "2024-01-01T00:00:00Z",
  "expirationDate": "2025-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:web:connector.example.com:BPNL000000000001",
    "holderIdentifier": "BPNL000000000001",
    "memberOf": "Catena-X",
    "status": "Active"
  },
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2024-01-01T00:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:web:issuer.catena-x.net#key-1",
    "jws": "..."
  }
}
```

### Policy Enforcement
- [ ] **CX-0152 policy constraints** - Implement policy evaluation functions:
  - [ ] `MembershipCredentialEvaluationFunction` - Check active membership
  - [ ] `FrameworkAgreementFunction` - Validate framework agreement
  - [ ] `UsagePurposeFunction` - Enforce purpose constraints
  - [ ] `BusinessPartnerNumberFunction` - Validate BPN access
- [ ] **ODRL policy binding** - All assets have ODRL policies attached
- [ ] **Deny by default** - No access without valid credential

## Additional Catena-X Standards

### CX-0001: Participant Registration
- [ ] **Business Partner Data Service (BPDS)** - Register BPN in BPDS
- [ ] **Federated catalog** - Register connector in catalog node directory
- [ ] **Self-description** - Provide Gaia-X-compliant self-description

### CX-0151: Industry Core Basics
- [ ] **Digital Twin Registry** - Implement Asset Administration Shell (AAS) registry
- [ ] **SerialPart aspect** - Support SerialPart SAMM model for part instances
- [ ] **Batch aspect** - Support Batch SAMM model for non-serialized parts
- [ ] **Quality notification API** - Implement notification endpoints

### CX-0003: SAMM Aspect Meta Model
- [ ] **SAMM version** - Use SAMM 2.1.0 or later
- [ ] **Aspect validation** - Validate aspects against SAMM schema
- [ ] **Namespace convention** - Follow Catena-X namespace: `urn:samm:io.catenax.*`

## Gaia-X Compliance (Optional but Recommended)

### Trust Framework
- [ ] **Gaia-X compliance** - Self-description follows Gaia-X trust framework
- [ ] **Service offering** - Publish service offerings with Gaia-X labels
- [ ] **Participant verification** - Verify participant claims via Gaia-X notary

### Interoperability
- [ ] **Cross-dataspace compatibility** - Support connections to other Gaia-X dataspaces
- [ ] **Standard APIs** - Use IDSA/DSP standard protocols

## Code Quality Gates (ALWAYS REQUIRED)
- [ ] All public APIs have OpenAPI spec
- [ ] All functions have unit tests (>85% coverage)
- [ ] All APIs pass contract tests (Newman)
- [ ] Zero known security vulnerabilities

## Deployment Gates (ALWAYS REQUIRED)
- [ ] All automated tests pass
- [ ] All compliance reports generated
- [ ] All monitoring configured
