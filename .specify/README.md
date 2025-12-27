# .specify/ - Specification-Driven Development Templates

This directory contains templates for specification-driven dataspace development.

## How to Customize This Template

1. **Start with a domain branch:**
   ```bash
   git checkout -b {domain}/{name}
   # Example: git checkout -b health/health-dataspace
   ```

2. **Customize the specifications:**
   - `constitution.md` - Add domain-specific regulatory requirements
   - `spec.md` - Define your use cases and workflows
   - `spec.yaml` - Create OpenAPI specification for your domain
   - `regulatory-inventory.md` - List all applicable regulations

3. **Add domain-specific policies:**
   - `policies/odrl-policies.yaml` - Data access policies
   - `policies/gdpr-policies.yaml` - GDPR compliance rules
   - `policies/dsp-policies.yaml` - Dataspace Protocol policies
   - Add domain-specific policy files as needed

4. **Define data models:**
   - `data-models/schema-template.json` - JSON Schema for your domain entities
   - Add domain-specific schemas

5. **Follow the blueprint:**
   - See `docs/spec-driven-dev-mvd-instructions.md` for the complete 6-phase process

## Directory Structure

```
.specify/
├── constitution.md              # Non-negotiable rules (template)
├── spec.md                      # High-level specification (template)
├── spec.yaml                    # OpenAPI specification (template)
├── regulatory-inventory.md      # Compliance checklist (template)
├── policies/                    # Policy definitions
│   ├── odrl-policies.yaml
│   ├── gdpr-policies.yaml
│   └── dsp-policies.yaml
├── data-models/                 # Data schemas
│   └── schema-template.json
└── README.md                    # This file
```

## Key Principles

- **Specifications as Law:** All code must reference and conform to specs
- **Tests Validate Specs:** Automated tests ensure specs are implemented correctly
- **Deployment is Verified:** Code reaches production only if 100% spec-compliant
- **Drift is Impossible:** Specifications and code are always synchronized

## Next Steps

1. Read `docs/spec-driven-dev-mvd-instructions.md` for the complete blueprint
2. Customize the templates in this directory for your domain
3. Follow the 6-phase implementation process
4. Use GitHub Copilot / Warp AI for code generation from specs

## Domain Branch Examples

- `health/health-dataspace` - Healthcare data sharing (FHIR + GDPR Article 9)
- `manufacturing/automotive-dpp` - Digital Product Passport (Catena-X)
- `energy/energy-meters` - Smart meter data (IEC standards)
