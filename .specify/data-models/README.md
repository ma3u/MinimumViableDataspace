# Data Model Templates

JSON Schema templates for domain-specific data models in dataspaces.

## Available Templates

### generic-schema-template.json
Basic JSON Schema template for any entity. Includes Catena-X UUID pattern.

## Catena-X Industry Core Patterns

Based on **CX-0151 Industry Core: Basics** and **CX-0003 SAMM Aspect Meta Model**.

### Key Concepts
- **Digital Twins (AAS)**: Asset Administration Shell for discrete objects
- **Aspect Models**: SAMM-based semantic data models
- **Notifications**: Message-based data exchange

### When to Use Digital Twins (CX-0151 Guidance)
✅ **Use Digital Twin** when:
- Data is related to a discrete object (part, batch, production line)
- Multiple use cases need to access the same object data
- Data discovery across partners is required

❌ **Don't Use Digital Twin** when:
- Data is generic/mass data not tied to specific objects
- Data is used exclusively within one use case
- Notification-based push is more appropriate

## Creating Domain-Specific Schemas

### 1. Manufacturing/Automotive (Catena-X)
```json
{
  "catenaXId": "urn:uuid:...",
  "localIdentifiers": [
    {"key": "partInstanceId", "value": "SN12345"}
  ],
  "manufacturingInformation": {
    "date": "2025-01-01T00:00:00Z"
  }
}
```

**Standards**: CX-0126 (Part Type), CX-0127 (Part Instance)

### 2. Health Dataspace (FHIR R4)
```json
{
  "resourceType": "Patient",
  "identifier": [
    {"system": "urn:oid:1.2.276.0.76.3.1.78.1", "value": "12345"}
  ],
  "meta": {
    "profile": ["http://fhir.de/StructureDefinition/patient-de-basis"]
  }
}
```

**Standards**: FHIR R4, ISiK, KBV profiles

### 3. Energy (IEC 61850)
```json
{
  "meterId": "METER-001",
  "reading": {
    "timestamp": "2025-01-01T00:00:00Z",
    "value": 1234.56,
    "unit": "kWh"
  },
  "iec61850Compliant": true
}
```

## References
- [Catena-X CX-0151: Industry Core Basics](https://catenax-ev.github.io/docs/next/standards/CX-0151-IndustryCoreBasics)
- [Catena-X CX-0003: SAMM](https://catenax-ev.github.io/docs/next/standards/CX-0003-SAMMAspectMetaModel)
- [JSON Schema Specification](https://json-schema.org/)
