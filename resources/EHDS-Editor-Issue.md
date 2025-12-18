# EHDS Editor Validation Discrepancy Report

> **Issue for**: [EHDS Health Data Portal Editor](https://ehds.healthdataportal.eu/editor2/)  
> **Reporter**: MVD Health Demo Project  
> **Date**: December 18, 2025

## Summary

The EHDS Editor reports missing mandatory fields despite the catalog being **fully SHACL-compliant** according to Apache Jena validation with the official HealthDCAT-AP Release 5 shapes.

## Environment

- **Editor URL**: https://ehds.healthdataportal.eu/editor2/
- **Catalog Format**: Turtle (.ttl)
- **SHACL Shapes**: HealthDCAT-AP Release 5 NON_PUBLIC (with DCAT-AP 3.0 imports)
- **Validation Tool**: Apache Jena SHACL (`shacl validate`)

## Issue Description

### Editor Validation Results (Incorrect)

| Category | Editor Status | Actual in TTL |
|----------|---------------|---------------|
| **Mandatory** | 11/18 ✗ | 18/18 ✅ |
| **Recommended** | 16/20 | 14/14 ✅ |
| **Optional** | 7/14 | 12/12 ✅ |

### SHACL Validation Result (Correct)

```bash
$ shacl validate --shapes healthdcatap-shacl.ttl --data health-catalog.ttl

[ rdf:type     sh:ValidationReport;
  sh:conforms  true
] .
```

## Fields Reported as Missing (But Present)

| Editor Field | HealthDCAT-AP Property | Occurrences in TTL | Verified |
|--------------|------------------------|-------------------|----------|
| Purpose | `dpv:hasPurpose` | **59x** | ✅ Present |
| HDAB | `healthdcatap:hdab` | **21x** | ✅ Present |
| Legal Basis | `dpv:hasLegalBasis` | **42x** | ✅ Present |
| Health Category | `healthdcatap:healthCategory` | **51x** | ✅ Present |
| Code Values | `healthdcatap:hasCodeValues` | **57x** | ✅ Present |
| Distribution | `dcat:distribution` | **84x** | ✅ Present |
| Sample | `adms:sample` | **21x** | ✅ Present |
| Analytics | `healthdcatap:analytics` | **21x** | ✅ Present |
| Identifier | `dct:identifier` | **121x** | ✅ Present |
| Modified Date | `dct:modified` | **43x** | ✅ Present |

## Suspected Root Causes

1. **Nested Structure Parsing**: The editor may not correctly parse nested blank nodes (e.g., `healthdcatap:hdab [ a foaf:Agent ; ... ]`)

2. **SHACL Shape Conformance**: Fields exist but may not be recognized due to strict shape matching expectations:
   - `dct:identifier` uses `xsd:anyURI` datatype (valid per spec)
   - `healthdcatap:hasCodeValues` contains `skos:Concept` blank nodes
   - `healthdcatap:hdab` contains `HealthAgent_Shape` with nested `contactPoint`

3. **Version Mismatch**: Editor may implement different HealthDCAT-AP version than Release 5

## Reproducible Test Case

### Files

| File | Description | Link |
|------|-------------|------|
| **Catalog Data** | 21 EHR datasets, fully compliant | [`health-catalog.ttl`](health-catalog.ttl) |
| **SHACL Shapes** | HealthDCAT-AP Release 5 NON_PUBLIC | [`shacl/healthdcatap-shacl.ttl`](shacl/healthdcatap-shacl.ttl) |
| **Analysis Report** | Detailed field analysis | [`HealthDCAT-AP-Field-Analysis.md`](HealthDCAT-AP-Field-Analysis.md) |

### Steps to Reproduce

1. Go to https://ehds.healthdataportal.eu/editor2/
2. Upload `health-catalog.ttl`
3. Observe validation panel showing missing fields
4. Compare with SHACL validation:
   ```bash
   shacl validate --shapes shacl/healthdcatap-shacl.ttl --data health-catalog.ttl
   ```

## Expected Behavior

The editor should recognize all fields that pass SHACL validation with the official HealthDCAT-AP shapes.

## Actual Behavior

The editor reports 7 mandatory fields as missing despite:
- All fields being present in the TTL
- SHACL validation returning `sh:conforms true`
- Field counts verified via grep

## Sample TTL Snippets

### 1. HDAB (Reported Missing)

```turtle
healthdcatap:hdab [
  a foaf:Agent ;
  foaf:name "Rheinland Universitätsklinikum HDAB" ;
  dcat:contactPoint [
    a vcard:Kind, vcard:Organization ;
    vcard:hasEmail <mailto:hdab@rheinland-uklinikum.de>
  ]
] ;
```

### 2. Purpose (Reported Missing)

```turtle
dpv:hasPurpose <https://w3id.org/dpv#ResearchAndDevelopment> ;
dpv:hasPurpose <https://w3id.org/dpv#AcademicResearch> ;
```

### 3. hasCodeValues (Reported Missing)

```turtle
healthdcatap:hasCodeValues [
  a skos:Concept ;
  skos:prefLabel "Myocardial Infarction"@en ;
  skos:notation "I21.9" ;
  skos:inScheme <http://hl7.org/fhir/sid/icd-10> ;
  dct:identifier "ICD-10:I21.9"^^xsd:anyURI
] ;
```

## Additional Context

- **Project**: [MVD Health Demo](https://github.com/siemens/MVD-health) - Minimum Viable Dataspace for Health
- **Compliance Target**: EHDS Regulation 2025/327, HealthDCAT-AP Release 5
- **Catalog Size**: 21 datasets, 84 distributions, ~10,500 lines

## Suggested Fix

The editor should:
1. Use the same SHACL shapes as the official HealthDCAT-AP Release 5
2. Support nested blank node structures (HealthAgent_Shape, HasCodeValues_Shape)
3. Accept `xsd:anyURI` typed literals for `dct:identifier` (per spec examples)

---

## Where to Report

### Primary Repository (HealthDCAT-AP Specification)

The HealthDCAT-AP specification has been migrated to the European Commission's official infrastructure:

| Resource | URL |
|----------|-----|
| **HealthDCAT-AP Release 5** (Specification) | https://healthdataeu.pages.code.europa.eu/healthdcat-ap/releases/release-5/ |
| **EU Code Repository** | https://code.europa.eu/healthdata/healthdcat-ap *(requires EU Login)* |
| **HealthData@EU Validator** | https://health-data-itb-rdf-validator.acceptance.data.health.europa.eu/shacl/ehds/upload |

### Contact for HealthDCAT-AP Editor Issues

The HealthDCAT-AP Editor (v4.0) at https://ehds.healthdataportal.eu/editor2/ is developed by **Sciensano** (Belgium) as part of Work Package 6 (Metadata Standards) of the HealthData@EU Pilot.

| Contact | Details |
|---------|---------|
| **Editor Contact** | [EHDS2@sciensano.be](mailto:EHDS2@sciensano.be) |
| **Organization** | Sciensano - Belgian Institute for Health |
| **Address** | Rue Juliette Wytsmanstraat 14, 1050 Brussels, Belgium |

### Alternative Reporting Channels

1. **GitHub (Legacy - now decommissioned)**: https://github.com/healthDCAT-AP *(specification moved to code.europa.eu)*
2. **Interoperability Test Bed**: https://joinup.ec.europa.eu/solution/interoperability-test-bed *(for validator issues)*
3. **HealthData@EU Pilot Documentation**: https://health-data-hub.fr/page/healthdataeu-pilot

### Recommended Action

**Send an email to [EHDS2@sciensano.be](mailto:EHDS2@sciensano.be)** with:
- Subject: "HealthDCAT-AP Editor v4.0 - Validation Discrepancy Report"
- Attach: `health-catalog.ttl` and `healthdcatap-shacl.ttl`
- Reference: This issue document

---

*This issue was generated from the MVD Health Demo SHACL validation analysis.*
