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

## Code Quality Gates (ALWAYS REQUIRED)
- [ ] All public APIs have OpenAPI spec
- [ ] All functions have unit tests (>85% coverage)
- [ ] All APIs pass contract tests (Newman)
- [ ] Zero known security vulnerabilities

## Deployment Gates (ALWAYS REQUIRED)
- [ ] All automated tests pass
- [ ] All compliance reports generated
- [ ] All monitoring configured
