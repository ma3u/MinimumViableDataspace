# Domain Branching Strategy Guide

How to create domain-specific dataspace implementations from the MVD template.

## Quick Start

```bash
# 1. Create your domain branch
git checkout -b manufacturing/automotive-dataspace

# 2. Customize .specify/ files for your domain
# 3. Implement domain-specific frontend/backend
# 4. Follow BLUEPRINT Phase 2 → Phase 6
```

## Domain Branch Examples

### Manufacturing/Automotive (Catena-X Pattern)

**Branch Name**: `manufacturing/catena-x-demo`

**Key Standards**:
- CX-0151: Industry Core Basics
- CX-0152: Policy Constraints
- CX-0126/CX-0127: Part Type/Instance
- CX-0018: Dataspace Connectivity

**Customization Checklist**:
- [ ] `.specify/spec.md` → Define automotive use cases (traceability, PCF, circularity)
- [ ] `.specify/spec.yaml` → Add Digital Twin Registry API, notification endpoints
- [ ] `.specify/policies/` → Add BPN-based policies, purpose constraints
- [ ] `.specify/constitution.md` → Add Catena-X governance requirements
- [ ] `.specify/regulatory-inventory.md` → Map CX standards (CX-0001 through CX-0156)
- [ ] `extensions/` → Add automotive-specific EDC extensions
- [ ] `frontend/` → Build Digital Product Passport viewer, traceability UI
- [ ] `backend/` → Implement Industry Core notification API

**KIT References**:
- [Traceability KIT](https://eclipse-tractusx.github.io/docs-kits/kits/Traceability%20Kit/Adoption%20View%20Traceability%20Kit)
- [Digital Twin KIT](https://eclipse-tractusx.github.io/docs-kits/kits/Digital%20Twin%20Kit/Adoption%20View%20Digital%20Twin%20Kit)
- [PCF KIT](https://eclipse-tractusx.github.io/docs-kits/kits/PCF%20Exchange%20Kit/Adoption%20View)

### Health Dataspace (EHDS Pattern)

**Branch Name**: `health/ehds-demo`

**Key Standards**:
- EHDS Regulation (EU 2025/327)
- GDPR Art. 9 + Art. 89
- FHIR R4 (ISiK, KBV profiles)
- German GDNG

**Customization Checklist**:
- [ ] `.specify/spec.md` → Define EHR exchange, research data secondary use
- [ ] `.specify/spec.yaml` → Add FHIR R4 endpoints, consent management API
- [ ] `.specify/policies/` → Add ConsentCredential policies, Article 89 compliance
- [ ] `.specify/constitution.md` → Add EHDS Art. 50/51 requirements, GDPR gates
- [ ] `.specify/regulatory-inventory.md` → Map EHDS, GDPR, GDNG, MedDRA standards
- [ ] `.specify/data-models/` → Add FHIR R4 schemas (Patient, Observation, etc.)
- [ ] `extensions/` → Add FHIR validation, consent verification
- [ ] `frontend/` → Build EHR viewer, consent UI, research request portal
- [ ] `backend-mock/` → Implement FHIR R4 server with synthetic patient data

**References**:
- [EHDS Regulation](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R0327)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [ISiK Basismodul](https://simplifier.net/isik-basismodul)

### Energy Dataspace (Smart Grid Pattern)

**Branch Name**: `energy/smart-grid-demo`

**Key Standards**:
- IEC 61850 (Smart Grid)
- IEC 62325 (Energy Market)
- GDPR (for household data)
- EU Network Codes

**Customization Checklist**:
- [ ] `.specify/spec.md` → Define meter data exchange, grid balancing
- [ ] `.specify/spec.yaml` → Add IEC 61850 endpoints, market data API
- [ ] `.specify/policies/` → Add certification policies (IEC compliance), spatial EU constraints
- [ ] `.specify/constitution.md` → Add IEC 61850 compliance gates, grid security
- [ ] `.specify/regulatory-inventory.md` → Map IEC standards, EU energy regulations
- [ ] `.specify/data-models/` → Add IEC 61850 schemas, meter reading formats
- [ ] `extensions/` → Add IEC 61850 validation, time-series data handling
- [ ] `frontend/` → Build meter dashboard, grid visualization, market portal
- [ ] `backend/` → Implement IEC 61850 server, time-series database integration

## BLUEPRINT Phase Workflow for Domain Branches

### Phase 2: Domain Specification (This Phase)
1. Customize all `.specify/` templates
2. Define domain-specific policies, data models, regulations
3. Document in GitHub Issue: `BLUEPRINT: Phase 2 - [Domain] Specification`

### Phase 3: Frontend Development
1. Build domain-specific UI components
2. Integrate with EDC catalog/negotiation APIs
3. Create domain data viewers (EHR, DPP, meter data)

### Phase 4: Backend Services
1. Implement domain data providers
2. Add EDC proxy service (optional)
3. Integrate OpenTelemetry tracing, Prometheus metrics

### Phase 5: Testing & Compliance
1. Unit tests (Vitest/JUnit)
2. Contract tests (Newman)
3. E2E tests (Playwright/RestAssured)
4. Compliance tests (domain-specific regulations)

### Phase 6: Production Deployment
1. Cloud deployment (AKS/EKS/GKE/StackIT/OVH)
2. CI/CD pipelines (GitHub Actions)
3. Monitoring & alerting (Prometheus, Grafana, Jaeger)
4. Security hardening, DR plan

## Branch Naming Convention

```
<domain>/<use-case-name>

Examples:
- manufacturing/catena-x-demo
- manufacturing/dpp-automotive
- health/ehds-research
- health/ehds-secondary-use
- energy/smart-grid-balancing
- finance/open-banking
```

## Merging Strategy

**Domain branches are NOT merged back to main.**

- `main` branch: Template infrastructure only
- Domain branches: Complete implementations

## When to Update from Main

```bash
# Periodically sync template improvements from main
git checkout manufacturing/catena-x-demo
git merge main
# Resolve conflicts, keeping domain customizations
```

## Multi-Domain Support

For organizations participating in multiple domains:

```bash
# Create separate branches for each domain
git checkout -b manufacturing/automotive
git checkout -b health/clinical-trials
git checkout -b energy/smart-meters

# Share common extensions via git worktrees or submodules if needed
```

## References

- [Catena-X Standards](https://catenax-ev.github.io/docs/next/standards/overview)
- [Tractus-X KITs](https://eclipse-tractusx.github.io/docs-kits/)
- [MVD-health Branch](https://github.com/ma3u/MinimumViableDataspace/tree/health-demo)
- [Specification-Driven Development Guide](../docs/spec-driven-dev-mvd-instructions.md)
