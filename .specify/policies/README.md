# ODRL Policy Templates

This directory contains ODRL (Open Digital Rights Language) policy templates for data access and usage control in dataspaces.

## Overview

Policies in dataspaces define:
- **Access Policies**: Who can see and negotiate contracts for data assets
- **Usage Policies**: Under what conditions data can be used after a contract is agreed

All policies follow ODRL 2.2 specification and are based on Catena-X CX-0152 "Policy Constraints For Data Exchange" standard.

## Available Templates

### 1. Membership Credential Policy
**File**: `membership-credential-policy.json`

Requires data consumers to hold an active MembershipCredential for the dataspace.

**Use Cases**:
- Restrict access to dataspace members only
- Ensure participants have signed governance agreements
- Basic dataspace participation gate

**Based on**: Catena-X CX-0050 (Credentials), CX-0152 (Policy Constraints)

```json
{
  "odrl:constraint": {
    "odrl:leftOperand": "cx-policy:Membership",
    "odrl:operator": "odrl:eq",
    "odrl:rightOperand": "active"
  }
}
```

### 2. BPN (Business Partner Number) Policy
**File**: `bpn-credential-policy.json`

Restricts access to specific business partners identified by their BPN.

**Use Cases**:
- B2B contracts with specific partners
- Supplier-OEM relationships
- Trusted partner networks

**Based on**: Catena-X CX-0010 (BPN), CX-0152 (Policy Constraints)

```json
{
  "odrl:constraint": {
    "odrl:leftOperand": "cx-policy:BusinessPartnerNumber",
    "odrl:operator": "odrl:eq",
    "odrl:rightOperand": "BPNL000000000001"
  }
}
```

**Customization**: Replace `BPNL000000000001` with your partner's BPN.

### 3. Purpose-Based Usage Policy
**File**: `purpose-usage-policy.json`

Restricts data usage to specific purposes and enforces data deletion after contract end.

**Use Cases**:
- Industry Core data exchange (CX-0151)
- Supply chain traceability (CX-0125)
- Product Carbon Footprint calculation (CX-0136)

**Based on**: Catena-X CX-0152 (Policy Constraints)

```json
{
  "odrl:constraint": {
    "odrl:leftOperand": "cx-policy:UsagePurpose",
    "odrl:operator": "odrl:eq",
    "odrl:rightOperand": "cx.core.industrycore:1"
  },
  "odrl:duty": {
    "odrl:action": "odrl:delete"
  }
}
```

## Policy Constraint Types

### Catena-X Standard Constraints (CX-0152)

| Left Operand | Description | Example Right Operand |
|--------------|-------------|----------------------|
| `cx-policy:Membership` | Dataspace membership | `active` |
| `cx-policy:BusinessPartnerNumber` | Specific partner BPN | `BPNL000000000001` |
| `cx-policy:UsagePurpose` | Purpose of data usage | `cx.core.industrycore:1` |
| `cx-policy:FrameworkAgreement` | Signed framework | `DataspaceGovernance:1.0` |
| `cx-policy:ContractReference` | Contract reference | `Contract:12345` |

### Generic ODRL Constraints

| Left Operand | Description | Example Right Operand |
|--------------|-------------|----------------------|
| `odrl:dateTime` | Time-based access | `2025-12-31T23:59:59Z` |
| `odrl:count` | Usage count limit | `100` |
| `odrl:spatial` | Geographic restriction | `EU` |
| `odrl:industry` | Industry restriction | `automotive` |

## Creating Your Own Policies

### Step 1: Choose Policy Type

**Access Policy** - Who can see the data offer?
```json
{
  "@type": "odrl:Set",
  "odrl:permission": {
    "odrl:action": "odrl:use",
    "odrl:constraint": [ /* your constraints */ ]
  }
}
```

**Usage Policy** - How can data be used?
```json
{
  "@type": "odrl:Set",
  "odrl:permission": {
    "odrl:action": "odrl:use",
    "odrl:constraint": [ /* usage constraints */ ],
    "odrl:duty": [ /* obligations like deletion */ ]
  }
}
```

### Step 2: Define Constraints

**Simple Constraint** (single condition):
```json
{
  "odrl:leftOperand": "cx-policy:Membership",
  "odrl:operator": "odrl:eq",
  "odrl:rightOperand": "active"
}
```

**Logical AND** (all conditions must be true):
```json
{
  "odrl:and": [
    { "odrl:leftOperand": "cx-policy:Membership", "odrl:operator": "odrl:eq", "odrl:rightOperand": "active" },
    { "odrl:leftOperand": "cx-policy:BPN", "odrl:operator": "odrl:eq", "odrl:rightOperand": "BPNL123" }
  ]
}
```

**Logical OR** (any condition can be true):
```json
{
  "odrl:or": [
    { "odrl:leftOperand": "cx-policy:BPN", "odrl:operator": "odrl:eq", "odrl:rightOperand": "BPNL001" },
    { "odrl:leftOperand": "cx-policy:BPN", "odrl:operator": "odrl:eq", "odrl:rightOperand": "BPNL002" }
  ]
}
```

### Step 3: Add Duties (Optional)

Duties are obligations the data consumer must fulfill:

```json
{
  "odrl:duty": [
    {
      "odrl:action": "odrl:delete",
      "odrl:constraint": {
        "odrl:leftOperand": "odrl:dateTime",
        "odrl:operator": "odrl:gteq",
        "odrl:rightOperand": "2026-01-01T00:00:00Z"
      }
    },
    {
      "odrl:action": "odrl:anonymize",
      "odrl:constraint": {
        "odrl:leftOperand": "cx-policy:purpose",
        "odrl:operator": "odrl:eq",
        "odrl:rightOperand": "statistics"
      }
    }
  ]
}
```

## Domain-Specific Examples

### Health Dataspace (EHDS Compliance)

```json
{
  "odrl:constraint": {
    "odrl:and": [
      {
        "odrl:leftOperand": "cx-policy:ConsentCredential",
        "odrl:operator": "odrl:eq",
        "odrl:rightOperand": "active"
      },
      {
        "odrl:leftOperand": "cx-policy:UsagePurpose",
        "odrl:operator": "odrl:eq",
        "odrl:rightOperand": "research:Article89GDPR"
      }
    ]
  }
}
```

### Manufacturing/Automotive (Catena-X)

```json
{
  "odrl:constraint": {
    "odrl:and": [
      {
        "odrl:leftOperand": "cx-policy:Membership",
        "odrl:operator": "odrl:eq",
        "odrl:rightOperand": "active"
      },
      {
        "odrl:leftOperand": "cx-policy:UsagePurpose",
        "odrl:operator": "odrl:isAnyOf",
        "odrl:rightOperand": [
          "cx.core.industrycore:1",
          "cx.pcf.base:1",
          "cx.traceability.base:1"
        ]
      }
    ]
  }
}
```

### Energy Dataspace (Smart Meter Data)

```json
{
  "odrl:constraint": {
    "odrl:and": [
      {
        "odrl:leftOperand": "cx-policy:Certification",
        "odrl:operator": "odrl:eq",
        "odrl:rightOperand": "IEC61850:Compliant"
      },
      {
        "odrl:leftOperand": "odrl:spatial",
        "odrl:operator": "odrl:eq",
        "odrl:rightOperand": "EU"
      }
    ]
  }
}
```

## ODRL Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `odrl:eq` | Equals | `"active"` |
| `odrl:neq` | Not equals | `"inactive"` |
| `odrl:lt` | Less than | `100` |
| `odrl:lteq` | Less than or equal | `100` |
| `odrl:gt` | Greater than | `0` |
| `odrl:gteq` | Greater than or equal | `0` |
| `odrl:isAnyOf` | Value is in list | `["val1", "val2"]` |
| `odrl:isNoneOf` | Value not in list | `["val1", "val2"]` |

## Policy Evaluation in EDC

Policies are evaluated by the Eclipse Dataspace Connector (EDC) during:

1. **Catalog Discovery**: Access policies filter which assets are visible to which partners
2. **Contract Negotiation**: Both access and usage policies are evaluated
3. **Data Transfer**: Usage policies are part of the contract agreement

## Testing Policies

Test your policies before deploying:

```bash
# Validate JSON syntax
cat your-policy.json | jq .

# Test with EDC Policy Engine (if available)
# curl -X POST http://localhost:8080/api/v1/management/policydefinitions/validate \
#   -H "Content-Type: application/json" \
#   -d @your-policy.json
```

## References

- [ODRL 2.2 Specification](https://www.w3.org/TR/odrl-model/)
- [Catena-X CX-0152: Policy Constraints](https://catenax-ev.github.io/docs/next/standards/CX-0152-PolicyConstrainsForDataExchange)
- [Catena-X CX-0050: Credentials](https://catenax-ev.github.io/docs/next/standards/CX-0050)
- [Catena-X CX-0010: BPN](https://catenax-ev.github.io/docs/next/standards/CX-0010-BusinessPartnerNumber)
- [Eclipse Dataspace Protocol (DSP)](https://docs.internationaldataspaces.org/)

## Next Steps

1. Customize policies for your domain
2. Test policies in local EDC deployment
3. Document domain-specific constraints in `.specify/constitution.md`
4. Map policies to regulatory requirements in `.specify/regulatory-inventory.md`
