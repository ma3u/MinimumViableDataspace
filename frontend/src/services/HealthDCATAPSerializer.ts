/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import { mockEHRCatalogAssets } from './mockData-health';

export const serializeToTurtle = (): string => {
  const lines: string[] = [];
  
  // Complete Prefixes for HealthDCAT-AP Release 5
  lines.push('@prefix dcat: <http://www.w3.org/ns/dcat#> .');
  lines.push('@prefix dcatap: <http://data.europa.eu/r5r/> .');
  lines.push('@prefix dct: <http://purl.org/dc/terms/> .');
  lines.push('@prefix foaf: <http://xmlns.com/foaf/0.1/> .');
  lines.push('@prefix healthdcatap: <http://healthdataportal.eu/ns/health#> .');  // HealthDCAT-AP Release 5 namespace
  lines.push('@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .');
  lines.push('@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .');
  lines.push('@prefix prov: <http://www.w3.org/ns/prov#> .');
  lines.push('@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .');
  lines.push('@prefix adms: <http://www.w3.org/ns/adms#> .');
  lines.push('@prefix odrl: <http://www.w3.org/ns/odrl/2/> .');
  lines.push('@prefix dqv: <http://www.w3.org/ns/dqv#> .');
  lines.push('@prefix skos: <http://www.w3.org/2004/02/skos/core#> .');
  lines.push('@prefix spdx: <http://spdx.org/rdf/terms#> .');
  lines.push('@prefix locn: <http://www.w3.org/ns/locn#> .');
  lines.push('@prefix dpv: <https://w3id.org/dpv#> .');
  lines.push('@prefix dpv-pd: <https://w3id.org/dpv/dpv-pd#> .');
  lines.push('@prefix dpv-gdpr: <https://w3id.org/dpv/dpv-gdpr#> .');
  lines.push('@prefix oa: <http://www.w3.org/ns/oa#> .');
  lines.push('@prefix csvw: <http://www.w3.org/ns/csvw#> .');  // CSVW for variable dictionary (Release 5)
  lines.push('@prefix eli: <http://data.europa.eu/eli/ontology#> .');  // ELI for Legal Resources
  lines.push('@prefix time: <http://www.w3.org/2006/time#> .');  // Time ontology for Period of Time
  lines.push('@prefix owl: <http://www.w3.org/2002/07/owl#> .');  // OWL for imports
  lines.push('');

  // ============================================================
  // DQV QUALITY DIMENSION DEFINITIONS (Inline)
  // ============================================================
  lines.push('# ============================================================');
  lines.push('# Data Quality Vocabulary (DQV) - FAIR + Health Dimensions');
  lines.push('# ============================================================');
  lines.push('');
  
  // Categories
  lines.push('<http://example.org/dqv/category/fair> a dqv:Category ;');
  lines.push('  skos:prefLabel "FAIR Quality Dimensions"@en .');
  lines.push('');
  lines.push('<http://example.org/dqv/category/health> a dqv:Category ;');
  lines.push('  skos:prefLabel "Health Data Quality Dimensions"@en .');
  lines.push('');

  // Findability
  lines.push('<http://example.org/dqv/dimension/findability> a dqv:Dimension ;');
  lines.push('  skos:prefLabel "Findability"@en ;');
  lines.push('  skos:definition "The degree to which metadata enables discovery of the dataset"@en ;');
  lines.push('  dqv:inCategory <http://example.org/dqv/category/fair> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/metadataCompleteness> a dqv:Metric ;');
  lines.push('  skos:definition "Percentage of required metadata fields populated"@en ;');
  lines.push('  dqv:expectedDataType xsd:double ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/findability> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/keywordRichness> a dqv:Metric ;');
  lines.push('  skos:definition "Quality and coverage of descriptive keywords"@en ;');
  lines.push('  dqv:expectedDataType xsd:double ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/findability> .');
  lines.push('');

  // Accessibility
  lines.push('<http://example.org/dqv/dimension/accessibility> a dqv:Dimension ;');
  lines.push('  skos:prefLabel "Accessibility"@en ;');
  lines.push('  skos:definition "The degree to which data can be accessed via standardized protocols"@en ;');
  lines.push('  dqv:inCategory <http://example.org/dqv/category/fair> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/endpointAvailability> a dqv:Metric ;');
  lines.push('  skos:definition "Availability of data access endpoints (uptime percentage)"@en ;');
  lines.push('  dqv:expectedDataType xsd:double ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/accessibility> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/authenticationDocumented> a dqv:Metric ;');
  lines.push('  skos:definition "Whether authentication/authorization mechanisms are documented"@en ;');
  lines.push('  dqv:expectedDataType xsd:boolean ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/accessibility> .');
  lines.push('');

  // Interoperability
  lines.push('<http://example.org/dqv/dimension/interoperability> a dqv:Dimension ;');
  lines.push('  skos:prefLabel "Interoperability"@en ;');
  lines.push('  skos:definition "The degree to which data uses standard vocabularies and formats"@en ;');
  lines.push('  dqv:inCategory <http://example.org/dqv/category/fair> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/fhirComplianceRate> a dqv:Metric ;');
  lines.push('  skos:definition "FHIR R4 validation pass rate"@en ;');
  lines.push('  dqv:expectedDataType xsd:double ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/interoperability> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/vocabularyCoverage> a dqv:Metric ;');
  lines.push('  skos:definition "Percentage of coded elements using standard terminologies (ICD-10, SNOMED-CT, MedDRA)"@en ;');
  lines.push('  dqv:expectedDataType xsd:double ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/interoperability> .');
  lines.push('');

  // Reusability
  lines.push('<http://example.org/dqv/dimension/reusability> a dqv:Dimension ;');
  lines.push('  skos:prefLabel "Reusability"@en ;');
  lines.push('  skos:definition "The degree to which data is well-described for reuse"@en ;');
  lines.push('  dqv:inCategory <http://example.org/dqv/category/fair> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/licenseExplicit> a dqv:Metric ;');
  lines.push('  skos:definition "Whether an explicit, machine-readable license is provided"@en ;');
  lines.push('  dqv:expectedDataType xsd:boolean ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/reusability> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/provenanceDocumented> a dqv:Metric ;');
  lines.push('  skos:definition "Whether data provenance is documented"@en ;');
  lines.push('  dqv:expectedDataType xsd:boolean ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/reusability> .');
  lines.push('');

  // Contextability (Health-specific)
  lines.push('<http://example.org/dqv/dimension/contextability> a dqv:Dimension ;');
  lines.push('  skos:prefLabel "Contextability"@en ;');
  lines.push('  skos:definition "The degree to which clinical context is preserved and documented"@en ;');
  lines.push('  dqv:inCategory <http://example.org/dqv/category/health> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/clinicalContextCompleteness> a dqv:Metric ;');
  lines.push('  skos:definition "Completeness of clinical trial metadata (phase, protocol, endpoints)"@en ;');
  lines.push('  dqv:expectedDataType xsd:double ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/contextability> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/consentGranularity> a dqv:Metric ;');
  lines.push('  skos:definition "Level of consent granularity (study-specific, purpose-bound)"@en ;');
  lines.push('  dqv:expectedDataType xsd:string ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/contextability> .');
  lines.push('');
  lines.push('<http://example.org/dqv/metric/deidentificationLevel> a dqv:Metric ;');
  lines.push('  skos:definition "De-identification standard compliance (HIPAA Safe Harbor, Expert Determination)"@en ;');
  lines.push('  dqv:expectedDataType xsd:string ;');
  lines.push('  dqv:inDimension <http://example.org/dqv/dimension/contextability> .');
  lines.push('');

  // ============================================================
  // CATALOG DEFINITION
  // ============================================================
  lines.push('# ============================================================');
  lines.push('# Catalog Definition');
  lines.push('# ============================================================');
  lines.push('');

  const catalogId = 'http://example.org/catalog';
  
  lines.push(`<${catalogId}> a dcat:Catalog ;`);
  lines.push('  dct:title "MVD Health Demo Catalog"@en ;');
  lines.push('  dct:description "A catalog of anonymized EHR datasets for the MVD Health Demo, compliant with HealthDCAT-AP."@en ;');
  lines.push('  dct:identifier "did:web:rheinland-uklinikum.de:catalog:health-demo" ;');
  lines.push('  dct:publisher [');
  lines.push('    a foaf:Agent ;');
  lines.push('    foaf:name "Rheinland Universitätsklinikum" ;');
  lines.push('    dct:type <http://purl.org/adms/publishertype/Academia>');
  lines.push('  ] ;');
  lines.push('  dct:language <http://publications.europa.eu/resource/authority/language/ENG> ;');
  lines.push('  dct:issued "2024-01-01"^^xsd:date ;');
  lines.push('  dct:modified "2024-12-17"^^xsd:date ;');
  lines.push('  dct:spatial <http://publications.europa.eu/resource/authority/country/DEU> ;');
  lines.push('  dcat:themeTaxonomy <http://publications.europa.eu/resource/authority/data-theme> ;');
  // MANDATORY: Applicable legislation (EHDS Regulation, GDPR, DGA)
  lines.push('  dcatap:applicableLegislation <http://data.europa.eu/eli/reg/2025/327/oj> ;');
  lines.push('  dcatap:applicableLegislation <http://data.europa.eu/eli/reg/2016/679/oj> ;');
  lines.push('  dcatap:applicableLegislation <http://data.europa.eu/eli/reg/2022/868/oj> ;');
  // MANDATORY: Conformance to HealthDCAT-AP Release 5
  lines.push('  dct:conformsTo <https://healthdataeu.pages.code.europa.eu/healthdcat-ap/releases/release-5/> ;');
  lines.push('  dct:conformsTo <http://data.europa.eu/eli/reg/2025/327/oj> ;');
  lines.push('  dct:conformsTo <http://hl7.org/fhir/R4> ;');
  lines.push('  foaf:homepage <https://www.rheinland-uklinikum.de/research> ;');
  lines.push('  dct:rights [');
  lines.push('    a dct:RightsStatement ;');
  lines.push('    rdfs:label "Access requires valid Verifiable Credentials and consent verification"@en');
  lines.push('  ] ;');
  
  const datasetUris = mockEHRCatalogAssets.map(asset => `<${asset['@id'].replace('asset:ehr:', 'http://example.org/dataset/')}>`);
  if (datasetUris.length > 0) {
    lines.push(`  dcat:dataset ${datasetUris.join(', ')} ;`);
  }
  lines.push('  dcat:service <http://example.org/service/analytics> .');
  lines.push('');

  // ============================================================
  // ANALYTICS DATA SERVICE
  // ============================================================
  lines.push('# ============================================================');
  lines.push('# Analytics Data Service');
  lines.push('# ============================================================');
  lines.push('');
  lines.push('<http://example.org/service/analytics> a dcat:DataService ;');
  lines.push('  dct:title "EHR Compute-to-Data Analytics Service"@en ;');
  lines.push('  dct:description "Federated analytics service for privacy-preserving queries on EHR data"@en ;');
  lines.push('  dcat:endpointURL <https://dataspace.rheinland-uklinikum.de/api/analytics> ;');
  lines.push('  dcat:endpointDescription <https://dataspace.rheinland-uklinikum.de/api/docs/openapi.yaml> ;');
  lines.push('  dct:conformsTo <http://hl7.org/fhir/R4> ;');
  lines.push('  dct:type <http://purl.org/dc/dcmitype/Service> ;');
  lines.push('  dcat:servesDataset ' + datasetUris.join(', ') + ' .');
  lines.push('');

  // ============================================================
  // DATASET DEFINITIONS
  // ============================================================
  lines.push('# ============================================================');
  lines.push('# Dataset Definitions');
  lines.push('# ============================================================');
  lines.push('');

  mockEHRCatalogAssets.forEach((asset, index) => {
    const id = asset['@id'].replace('asset:ehr:', '');
    const datasetUri = `http://example.org/dataset/${id}`;
    const policyUri = `http://example.org/policy/${id}`;
    const distributionUri = `http://example.org/distribution/${id}`;
    const sampleUri = `http://example.org/sample/${id}`;
    const analyticsUri = `http://example.org/analytics/${id}`;
    const analyticsServiceUri = `http://example.org/analytics-service/${id}`;  // Confidential Computing Service
    const creatorDid = asset['dct:creator'];
    
    lines.push(`<${datasetUri}> a dcat:Dataset ;`);
    
    // ==================== Dataset Discovery ====================
    lines.push(`  # Dataset Discovery`);
    // Use dct:identifier from data if available (MANDATORY persistent URI)
    const identifier = asset['dct:identifier'] as string | undefined;
    if (identifier) {
      lines.push(`  dct:identifier "${identifier}"^^xsd:anyURI ;`);
    } else {
      lines.push(`  dct:identifier "${creatorDid}:datasets:${id}" ;`);
    }
    lines.push(`  adms:identifier [`);
    lines.push(`    a adms:Identifier ;`);
    lines.push(`    skos:notation "${identifier || `${creatorDid}:datasets:${id}`}"^^xsd:anyURI ;`);
    lines.push(`    adms:schemeAgency "HealthData@EU"@en`);
    lines.push(`  ] ;`);
    // dct:alternative (OPTIONAL acronym)
    const alternative = asset['dct:alternative'] as string | undefined;
    if (alternative) {
      lines.push(`  dct:alternative "${alternative}"@en ;`);
    }
    lines.push(`  dct:title "${asset['dct:title']}"@en ;`);
    lines.push(`  dct:description "${asset['dct:description']}"@en ;`);
    lines.push(`  dct:language <http://publications.europa.eu/resource/authority/language/ENG> ;`);
    
    // Keywords
    if (asset['dcat:keyword'] && asset['dcat:keyword'].length > 0) {
      asset['dcat:keyword'].forEach(kw => {
        lines.push(`  dcat:keyword "${kw}"@en ;`);
      });
    }

    // ==================== Revision / Versioning ====================
    lines.push(`  # Revision / Versioning`);
    lines.push(`  dcat:version "1.${index}.0" ;`);
    lines.push(`  adms:versionNotes "Release with MedDRA v27.0 classification and EU CTR 536/2014 compliance"@en ;`);
    lines.push(`  adms:status <http://publications.europa.eu/resource/authority/dataset-status/COMPLETED> ;`);
    lines.push(`  dct:issued "2024-0${(index % 9) + 1}-15"^^xsd:date ;`);
    lines.push(`  dct:modified "2024-12-01"^^xsd:date ;`);
    lines.push(`  dct:accrualPeriodicity <http://publications.europa.eu/resource/authority/frequency/QUARTERLY> ;`);
    lines.push(`  dct:temporal [`);
    lines.push(`    a dct:PeriodOfTime ;`);
    lines.push(`    dcat:startDate "2023-01-01"^^xsd:date ;`);
    lines.push(`    dcat:endDate "2024-06-30"^^xsd:date ;`);
    lines.push(`    time:hasBeginning [ a time:Instant ; time:inXSDDate "2023-01-01"^^xsd:date ] ;`);
    lines.push(`    time:hasEnd [ a time:Instant ; time:inXSDDate "2024-06-30"^^xsd:date ]`);
    lines.push(`  ] ;`);
    lines.push(`  dcat:temporalResolution "P1D"^^xsd:duration ;`);

    // ==================== Contacts ====================
    lines.push(`  # Contacts`);
    // Read contactPoint from data if available
    const contactPoints = asset['dcat:contactPoint'] as Array<{
      '@type': string;
      'vcard:fn': string;
      'vcard:hasEmail': string;
      'vcard:hasTelephone': string;
      'vcard:hasOrganizationName': string;
      'vcard:hasRole': string;
    }> | undefined;
    
    if (contactPoints && Array.isArray(contactPoints)) {
      contactPoints.forEach((cp) => {
        lines.push(`  dcat:contactPoint [`);
        lines.push(`    a vcard:Kind ;`);
        lines.push(`    vcard:fn "${cp['vcard:fn']}" ;`);
        lines.push(`    vcard:hasEmail <${cp['vcard:hasEmail']}> ;`);
        if (cp['vcard:hasTelephone']) {
          lines.push(`    vcard:hasTelephone <${cp['vcard:hasTelephone']}> ;`);
        }
        lines.push(`    vcard:hasOrganizationName "${cp['vcard:hasOrganizationName']}" ;`);
        lines.push(`    vcard:hasRole "${cp['vcard:hasRole']}"`);
        lines.push(`  ] ;`);
      });
    } else {
      // Fallback to default contact point
      lines.push(`  dcat:contactPoint [`);
      lines.push(`    a vcard:Kind ;`);
      lines.push(`    vcard:fn "Dr. Elisabeth Müller-Richter" ;`);
      lines.push(`    vcard:hasEmail <mailto:e.mueller-richter@rheinland-uklinikum.de> ;`);
      lines.push(`    vcard:hasTelephone <tel:+49-221-478-5123> ;`);
      lines.push(`    vcard:hasOrganizationName "Rheinland Universitätsklinikum - Forschungsdatenmanagement" ;`);
      lines.push(`    vcard:hasRole "Research Data Steward"`);
      lines.push(`  ] ;`);
    }

    // ==================== Documentation ====================
    lines.push(`  # Documentation`);
    lines.push(`  foaf:page <https://www.rheinland-uklinikum.de/research/datasets/${id}> ;`);
    lines.push(`  dcat:landingPage <https://dataspace.rheinland-uklinikum.de/catalog/${id}> ;`);
    lines.push(`  dct:conformsTo <https://w3id.org/ehds/ehr/v1> ;`);
    lines.push(`  dct:conformsTo <http://hl7.org/fhir/R4> ;`);
    lines.push(`  dct:conformsTo <https://www.hl7.de/de/isik/> ;`);
    lines.push(`  dct:conformsTo <https://simplifier.net/kbv> ;`);
    lines.push(`  dct:conformsTo <https://meddra.org/how-to-use/support-documentation/english> ;`);
    lines.push(`  dcat:qualifiedRelation [`);
    lines.push(`    a dcat:Relationship ;`);
    lines.push(`    dct:relation <https://clinicaltrials.gov/> ;`);
    lines.push(`    dcat:hadRole <http://www.iana.org/assignments/relation/related>`);
    lines.push(`  ] ;`);

    // ==================== Categorisation ====================
    lines.push(`  # Categorisation`);
    lines.push(`  dcat:theme <http://publications.europa.eu/resource/authority/data-theme/HEAL> ;`);
    lines.push(`  dcat:theme <http://eurovoc.europa.eu/2784> ;`);
    lines.push(`  dcat:theme <http://eurovoc.europa.eu/3885> ;`);
    const category = asset['healthdcatap:category'];
    if (category) {
      const meshMapping: Record<string, string> = {
        'genomics': 'D005820',
        'endocrine': 'D004700',
        'cardiology': 'D002318',
        'oncology': 'D009369',
        'pulmonology': 'D012140',
        'rheumatology': 'D012216',
        'neurology': 'D009422',
        'nephrology': 'D007674',
        'psychiatry': 'D011570',
        'gastroenterology': 'D005767',
        'infectious': 'D007239',
      };
      if (meshMapping[category]) {
        lines.push(`  dcat:theme <http://id.nlm.nih.gov/mesh/${meshMapping[category]}> ;`);
      }
    }

    // ==================== MANDATORY HealthDCAT-AP Properties (EHDS) ====================
    lines.push(`  # MANDATORY HealthDCAT-AP Properties (EHDS Regulation)`);
    
    // Applicable Legislation (MANDATORY for sensitive data)
    const applicableLegislation = asset['dcatap:applicableLegislation'] as string[] | undefined;
    if (applicableLegislation && Array.isArray(applicableLegislation)) {
      applicableLegislation.forEach((leg: string) => {
        lines.push(`  dcatap:applicableLegislation <${leg}> ;`);
      });
    } else {
      // Default EHDS legislation
      lines.push(`  dcatap:applicableLegislation <http://data.europa.eu/eli/reg/2025/327/oj> ;`);
      lines.push(`  dcatap:applicableLegislation <http://data.europa.eu/eli/reg/2016/679/oj> ;`);
    }

    // Dataset Type (MANDATORY)
    const datasetType = asset['dct:type'] as string | undefined;
    lines.push(`  dct:type <${datasetType || 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA'}> ;`);

    // Health Categories (MANDATORY - Art. 51 EHDS) - lowercase per spec
    const healthCategories = asset['healthdcatap:healthCategory'] as string[] | undefined;
    if (healthCategories && Array.isArray(healthCategories)) {
      healthCategories.forEach((cat: string) => {
        lines.push(`  healthdcatap:healthCategory <${cat}> ;`);
      });
    } else {
      lines.push(`  healthdcatap:healthCategory <http://healthdata.ec.europa.eu/authority/health-category/EHR> ;`);
    }

    // Spatial Coverage (MANDATORY)
    const spatialCoverage = asset['dct:spatial'] as string[] | undefined;
    if (spatialCoverage && Array.isArray(spatialCoverage)) {
      spatialCoverage.forEach((sp: string) => {
        lines.push(`  dct:spatial <${sp}> ;`);
      });
    }

    // Data Provenance (MANDATORY)
    const provenance = asset['dct:provenance'] as { 'rdfs:label': string; 'dct:source': string } | undefined;
    if (provenance) {
      lines.push(`  dct:provenance [`);
      lines.push(`    a dct:ProvenanceStatement ;`);
      lines.push(`    rdfs:label "${provenance['rdfs:label']}"@en ;`);
      lines.push(`    dct:source "${provenance['dct:source']}"`);
      lines.push(`  ] ;`);
    }

    // Purpose (DPV) - MANDATORY
    const purposes = asset['dpv:hasPurpose'] as string[] | undefined;
    if (purposes && Array.isArray(purposes)) {
      purposes.forEach((p: string) => {
        lines.push(`  dpv:hasPurpose <${p}> ;`);
      });
    }

    // Personal Data Categories (DPV) - MANDATORY
    const personalData = asset['dpv:hasPersonalData'] as string[] | undefined;
    if (personalData && Array.isArray(personalData)) {
      personalData.forEach((pd: string) => {
        lines.push(`  dpv:hasPersonalData <${pd}> ;`);
      });
    }

    // Legal Basis (DPV-GDPR) - MANDATORY
    const legalBasis = asset['dpv:hasLegalBasis'] as string[] | undefined;
    if (legalBasis && Array.isArray(legalBasis)) {
      legalBasis.forEach((lb: string) => {
        lines.push(`  dpv:hasLegalBasis <${lb}> ;`);
      });
    }

    // Publisher Note (MANDATORY)
    const publisherNote = asset['healthdcatap:publisherNote'] as string | undefined;
    if (publisherNote) {
      lines.push(`  healthdcatap:publisherNote "${publisherNote}"@en ;`);
    }

    // Publisher Type (MANDATORY)
    const publisherType = asset['healthdcatap:publisherType'] as string | undefined;
    if (publisherType) {
      lines.push(`  healthdcatap:publisherType <${publisherType}> ;`);
    }

    // ==================== RECOMMENDED HealthDCAT-AP Properties ====================
    lines.push(`  # RECOMMENDED HealthDCAT-AP Properties`);
    
    // Age Range - Official property names per HealthDCAT-AP tabular overview
    const minAge = asset['healthdcatap:minTypicalAge'] as number | undefined;
    const maxAge = asset['healthdcatap:maxTypicalAge'] as number | undefined;
    if (minAge !== undefined) {
      lines.push(`  healthdcatap:minTypicalAge "${minAge}"^^xsd:nonNegativeInteger ;`);
    }
    if (maxAge !== undefined) {
      lines.push(`  healthdcatap:maxTypicalAge "${maxAge}"^^xsd:nonNegativeInteger ;`);
    }

    // Number of Records (Release 5: xsd:nonNegativeInteger)
    const numberOfRecords = asset['healthdcatap:numberOfRecords'] as number | undefined;
    if (numberOfRecords !== undefined) {
      lines.push(`  healthdcatap:numberOfRecords "${numberOfRecords}"^^xsd:nonNegativeInteger ;`);
    }

    // Number of Unique Individuals (Release 5: xsd:nonNegativeInteger)
    const numberOfIndividuals = asset['healthdcatap:numberOfUniqueIndividuals'] as number | undefined;
    if (numberOfIndividuals !== undefined) {
      lines.push(`  healthdcatap:numberOfUniqueIndividuals "${numberOfIndividuals}"^^xsd:nonNegativeInteger ;`);
    }

    // Population Coverage
    const populationCoverage = asset['healthdcatap:populationCoverage'] as string | undefined;
    if (populationCoverage) {
      lines.push(`  healthdcatap:populationCoverage "${populationCoverage}"@en ;`);
    }

    // Coding Systems (RECOMMENDED) - Standards to Wikidata URIs per HealthDCAT-AP Release 5
    const codingSystems = asset['healthdcatap:hasCodingSystem'] as string[] | undefined;
    if (codingSystems && Array.isArray(codingSystems)) {
      codingSystems.forEach((cs: string) => {
        lines.push(`  healthdcatap:hasCodingSystem <${cs}> ;`);
      });
    }

    // Code Values (RECOMMENDED) - Must be skos:Concept per HealthDCAT-AP Release 5 §7.7
    // Maps coding system prefixes to their Wikidata concept scheme URIs
    const codingSystemSchemes: Record<string, { uri: string; label: string; notation: string }> = {
      'ICD-10': { uri: 'https://www.wikidata.org/entity/Q45127', label: 'International Classification of Diseases, 10th Revision', notation: 'ICD-10' },
      'ICD-10-GM': { uri: 'https://www.wikidata.org/entity/Q15629608', label: 'ICD-10-GM (German Modification)', notation: 'ICD-10-GM' },
      'SNOMED-CT': { uri: 'https://www.wikidata.org/entity/Q744434', label: 'SNOMED Clinical Terms', notation: 'SNOMED-CT' },
      'LOINC': { uri: 'https://www.wikidata.org/entity/Q192093', label: 'Logical Observation Identifiers Names and Codes', notation: 'LOINC' },
      'MedDRA': { uri: 'https://www.wikidata.org/entity/Q19597236', label: 'Medical Dictionary for Regulatory Activities', notation: 'MedDRA' },
      'ATC': { uri: 'https://www.wikidata.org/entity/Q192270', label: 'Anatomical Therapeutic Chemical Classification', notation: 'ATC' },
      'FHIR': { uri: 'https://www.wikidata.org/entity/Q19597236', label: 'Fast Healthcare Interoperability Resources', notation: 'FHIR' },
    };

    const codeValues = asset['healthdcatap:hasCodeValues'] as string[] | undefined;
    if (codeValues && Array.isArray(codeValues)) {
      codeValues.forEach((cv: string) => {
        // Parse code value like "ICD-10-GM:E11.9" or "LOINC:4548-4"
        const colonIdx = cv.lastIndexOf(':');
        if (colonIdx > 0) {
          const systemPrefix = cv.substring(0, colonIdx);
          const codeNotation = cv.substring(colonIdx + 1);
          const scheme = codingSystemSchemes[systemPrefix] || {
            uri: `https://www.wikidata.org/entity/Q0`,  // Fallback
            label: systemPrefix,
            notation: systemPrefix
          };
          
          // Per HealthDCAT-AP SHACL validation:
          // - skos:inScheme must be an IRI (not a blank node)
          // - dct:identifier must be xsd:anyURI
          lines.push(`  healthdcatap:hasCodeValues [`);
          lines.push(`    a skos:Concept ;`);
          lines.push(`    skos:inScheme <${scheme.uri}> ;`);
          lines.push(`    dct:identifier "${cv}"^^xsd:anyURI ;`);
          lines.push(`    skos:notation "${codeNotation}" ;`);
          lines.push(`    skos:prefLabel "${cv}"@en`);
          lines.push(`  ] ;`);
        } else {
          // Fallback for codes without prefix
          lines.push(`  healthdcatap:hasCodeValues [`);
          lines.push(`    a skos:Concept ;`);
          lines.push(`    dct:identifier "${cv}"^^xsd:anyURI ;`);
          lines.push(`    skos:notation "${cv}"`);
          lines.push(`  ] ;`);
        }
      });
    }

    // Health Theme (MANDATORY for NON_PUBLIC) - Wikidata concept URIs per HealthDCAT-AP Release 5
    const healthThemes = asset['healthdcatap:healthTheme'] as string[] | undefined;
    if (healthThemes && Array.isArray(healthThemes)) {
      healthThemes.forEach((theme: string) => {
        lines.push(`  healthdcatap:healthTheme <${theme}> ;`);
      });
    }

    // Retention Period (RECOMMENDED) - Period dataset available for secondary use
    const retentionPeriod = asset['healthdcatap:retentionPeriod'] as {
      startDate?: string;
      endDate?: string;
      comment?: string;
    } | undefined;
    if (retentionPeriod) {
      lines.push(`  healthdcatap:retentionPeriod [`);
      lines.push(`    a dct:PeriodOfTime ;`);
      if (retentionPeriod.startDate) {
        lines.push(`    dcat:startDate "${retentionPeriod.startDate}"^^xsd:date ;`);
      }
      if (retentionPeriod.endDate) {
        lines.push(`    dcat:endDate "${retentionPeriod.endDate}"^^xsd:date`);
      }
      lines.push(`  ] ;`);
    }

    // Is Referenced By (RECOMMENDED) - Related publications/resources
    const isReferencedBy = asset['dct:isReferencedBy'] as string[] | undefined;
    if (isReferencedBy && Array.isArray(isReferencedBy)) {
      isReferencedBy.forEach((ref: string) => {
        lines.push(`  dct:isReferencedBy <${ref}> ;`);
      });
    }

    // Note: Analytics is linked via healthdcatap:analytics <analyticsUri> in Data Access section
    // The full Analytics Distribution resource is defined separately after Sample Distribution

    // Quality Annotation (RECOMMENDED)
    const qualityAnnotation = asset['dqv:hasQualityAnnotation'] as {
      '@type': string;
      'oa:hasTarget': string;
      'oa:hasBody': string;
      'oa:motivatedBy': string;
    } | undefined;
    if (qualityAnnotation) {
      lines.push(`  dqv:hasQualityAnnotation [`);
      lines.push(`    a dqv:QualityCertificate ;`);
      lines.push(`    oa:hasTarget <${qualityAnnotation['oa:hasTarget']}> ;`);
      lines.push(`    oa:hasBody <${qualityAnnotation['oa:hasBody']}> ;`);
      lines.push(`    oa:motivatedBy dqv:qualityAssessment`);
      lines.push(`  ] ;`);
    }

    // Source Datasets (RECOMMENDED)
    const sourceDatasets = asset['dct:source'] as string[] | undefined;
    if (sourceDatasets && Array.isArray(sourceDatasets)) {
      sourceDatasets.forEach((src: string) => {
        lines.push(`  dct:source <${src}> ;`);
      });
    }

    // ==================== Data Access ====================
    lines.push(`  # Data Access - MANDATORY for Sensitive Data`);
    lines.push(`  dct:accessRights <http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC> ;`);
    lines.push(`  odrl:hasPolicy <${policyUri}> ;`);
    
    // Health Data Access Body (MANDATORY - Art. 37/77 EHDS) - Official HealthDCAT-AP property
    const hdab = asset['healthdcatap:hdab'] as { '@id': string; 'foaf:name': string; 'foaf:homepage': string; 'foaf:mbox': string } | undefined;
    if (hdab) {
      lines.push(`  healthdcatap:hdab [`);  // Official property name per HealthDCAT-AP spec
      lines.push(`    a foaf:Agent ;`);
      lines.push(`    dct:identifier "${hdab['@id']}" ;`);
      lines.push(`    foaf:name "${hdab['foaf:name']}"@de ;`);
      lines.push(`    foaf:homepage <${hdab['foaf:homepage']}> ;`);
      lines.push(`    foaf:mbox <${hdab['foaf:mbox']}> ;`);
      lines.push(`    dcat:contactPoint [`);
      lines.push(`      a vcard:Kind ;`);
      lines.push(`      vcard:hasEmail <${hdab['foaf:mbox']}> ;`);
      lines.push(`      vcard:hasURL <${hdab['foaf:homepage']}>`);
      lines.push(`    ]`);
      lines.push(`  ] ;`);
    }
    
    // Main Distribution (MANDATORY)
    lines.push(`  dcat:distribution <${distributionUri}> ;`)
    
    // Sample Distribution (MANDATORY for Sensitive Data)
    lines.push(`  adms:sample <${sampleUri}> ;`);
    
    // Analytics Distribution (RECOMMENDED)
    lines.push(`  healthdcatap:analytics <${analyticsUri}> ;`);
    
    // Data Service (OPTIONAL)
    lines.push(`  dcat:distribution [`);
    lines.push(`    a dcat:Distribution ;`);
    lines.push(`    dct:title "Analytics API Access"@en ;`);
    lines.push(`    dcat:accessService [`);
    lines.push(`      a dcat:DataService ;`);
    lines.push(`      dct:title "EHR Analytics Service"@en ;`);
    lines.push(`      dcat:endpointURL <https://dataspace.rheinland-uklinikum.de/api/analytics/${id}> ;`);
    lines.push(`      dcat:servesDataset <${datasetUri}>`);
    lines.push(`    ]`);
    lines.push(`  ] ;`);

    // ==================== Provenance / Metadata Quality ====================
    lines.push(`  # Provenance / Metadata Quality`);
    lines.push(`  dct:provenance [`);
    lines.push(`    a dct:ProvenanceStatement ;`);
    lines.push(`    rdfs:label "Data collected under IRB-approved protocol ${asset['healthdcatap:euCtNumber'] || 'N/A'}. Anonymized using k-anonymity (k=5) and differential privacy via EDC dataplane. Last validation: 2024-12-01."@en`);
    lines.push(`  ] ;`);
    // prov:wasGeneratedBy with Health Activity NAL vocabulary (Release 5 MUST use)
    lines.push(`  prov:wasGeneratedBy [`);
    lines.push(`    a prov:Activity ;`);
    lines.push(`    dct:type <http://healthdata.ec.europa.eu/authority/health-activity/CLINICAL_TRIAL> ;`);  // Health Activity NAL
    lines.push(`    rdfs:label "Clinical Trial Data Collection - ${asset['healthdcatap:clinicalTrialPhase'] || 'Observational'}"@en ;`);
    lines.push(`    prov:wasAssociatedWith <${creatorDid}> ;`);
    lines.push(`    prov:startedAtTime "2023-01-01T00:00:00Z"^^xsd:dateTime ;`);
    lines.push(`    prov:endedAtTime "2024-06-30T23:59:59Z"^^xsd:dateTime`);
    lines.push(`  ] ;`);

    // Creator with full details
    lines.push(`  dct:creator [`);
    lines.push(`    a foaf:Agent, foaf:Organization ;`);
    lines.push(`    foaf:name "Rheinland Universitätsklinikum - Klinik für ${asset['healthdcatap:therapeuticArea']?.name || 'Innere Medizin'}"@de ;`);
    lines.push(`    foaf:name "Rheinland University Hospital - Department of ${asset['healthdcatap:therapeuticArea']?.name || 'Internal Medicine'}"@en ;`);
    lines.push(`    dct:identifier "${creatorDid}" ;`);
    lines.push(`    foaf:homepage <https://www.rheinland-uklinikum.de>`);
    lines.push(`  ] ;`);
    
    // Publisher with full details (read from data if available - MANDATORY)
    const publisher = asset['dct:publisher'] as {
      '@type': string;
      'foaf:name': string;
      'foaf:homepage': string;
      'dct:type': string;
      'vcard:hasAddress'?: {
        'vcard:street-address': string;
        'vcard:locality': string;
        'vcard:postal-code': string;
        'vcard:country-name': string;
      };
    } | undefined;
    
    lines.push(`  dct:publisher [`);
    lines.push(`    a foaf:Agent, foaf:Organization ;`);
    lines.push(`    foaf:name "${publisher?.['foaf:name'] || 'Rheinland Universitätsklinikum'}"@de ;`);
    lines.push(`    foaf:name "${publisher?.['foaf:name'] || 'Rheinland University Hospital'}"@en ;`);
    lines.push(`    dct:type <${publisher?.['dct:type'] || 'http://purl.org/adms/publishertype/Academia'}> ;`);
    if (publisher?.['vcard:hasAddress']) {
      lines.push(`    vcard:hasAddress [`);
      lines.push(`      a vcard:Address ;`);
      lines.push(`      vcard:street-address "${publisher['vcard:hasAddress']['vcard:street-address']}" ;`);
      lines.push(`      vcard:locality "${publisher['vcard:hasAddress']['vcard:locality']}" ;`);
      lines.push(`      vcard:postal-code "${publisher['vcard:hasAddress']['vcard:postal-code']}" ;`);
      lines.push(`      vcard:country-name "${publisher['vcard:hasAddress']['vcard:country-name']}"`);
      lines.push(`    ] ;`);
      // MANDATORY: dcat:contactPoint for HealthPublisherAgent_Shape (HealthDCAT-AP Release 5)
      lines.push(`    dcat:contactPoint [`);
      lines.push(`      a vcard:Kind, vcard:Organization ;`);
      lines.push(`      vcard:fn "Forschungsdatenmanagement"@de ;`);
      lines.push(`      vcard:fn "Research Data Management"@en ;`);
      lines.push(`      vcard:hasEmail <mailto:forschungsdaten@rheinland-uklinikum.de> ;`);
      lines.push(`      vcard:hasTelephone <tel:+49-221-478-0>`);
      lines.push(`    ] ;`);
      lines.push(`    foaf:homepage <${publisher['foaf:homepage']}>`);
      lines.push(`  ] ;`);
    } else {
      lines.push(`    vcard:hasAddress [`);
      lines.push(`      a vcard:Address ;`);
      lines.push(`      vcard:street-address "Kerpener Straße 62" ;`);
      lines.push(`      vcard:locality "Köln" ;`);
      lines.push(`      vcard:postal-code "50937" ;`);
      lines.push(`      vcard:country-name "Germany"`);
      lines.push(`    ] ;`);
    }
    // MANDATORY: dcat:contactPoint for HealthPublisherAgent_Shape (HealthDCAT-AP Release 5)
    lines.push(`    dcat:contactPoint [`);
    lines.push(`      a vcard:Kind, vcard:Organization ;`);
    lines.push(`      vcard:fn "Forschungsdatenmanagement"@de ;`);
    lines.push(`      vcard:fn "Research Data Management"@en ;`);
    lines.push(`      vcard:hasEmail <mailto:forschungsdaten@rheinland-uklinikum.de> ;`);
    lines.push(`      vcard:hasTelephone <tel:+49-221-478-0>`);
    lines.push(`    ] ;`);
    lines.push(`    foaf:homepage <${publisher?.['foaf:homepage'] || 'https://www.rheinland-uklinikum.de'}>`);
    lines.push(`  ] ;`);

    // ==================== HealthDCAT-AP Specific ====================
    lines.push(`  # HealthDCAT-AP Specific Fields`);
    if (asset['healthdcatap:icdCode']) lines.push(`  healthdcatap:icdCode "${asset['healthdcatap:icdCode']}" ;`);
    if (asset['healthdcatap:diagnosis']) lines.push(`  healthdcatap:diagnosis "${asset['healthdcatap:diagnosis']}"@en ;`);
    if (asset['healthdcatap:category']) lines.push(`  healthdcatap:category "${asset['healthdcatap:category']}" ;`);
    if (asset['healthdcatap:ageRange']) lines.push(`  healthdcatap:ageRange "${asset['healthdcatap:ageRange']}" ;`);
    if (asset['healthdcatap:biologicalSex']) lines.push(`  healthdcatap:biologicalSex "${asset['healthdcatap:biologicalSex']}" ;`);
    if (asset['healthdcatap:clinicalTrialPhase']) lines.push(`  healthdcatap:clinicalTrialPhase "${asset['healthdcatap:clinicalTrialPhase']}" ;`);
    if (asset['healthdcatap:euCtNumber']) lines.push(`  healthdcatap:euCtNumber "${asset['healthdcatap:euCtNumber']}" ;`);

    // Sponsor
    if (asset['healthdcatap:sponsor']) {
      lines.push(`  healthdcatap:sponsor [`);
      lines.push(`    a foaf:Agent ;`);
      lines.push(`    foaf:name "${asset['healthdcatap:sponsor'].name}" ;`);
      lines.push(`    healthdcatap:sponsorType "${asset['healthdcatap:sponsor'].type}" ;`);
      if (asset['healthdcatap:sponsor'].country) {
        lines.push(`    vcard:country-name "${asset['healthdcatap:sponsor'].country}"`);
      }
      lines.push(`  ] ;`);
    }

    // Therapeutic Area
    if (asset['healthdcatap:therapeuticArea']) {
      lines.push(`  healthdcatap:therapeuticArea [`);
      lines.push(`    a healthdcatap:TherapeuticArea ;`);
      lines.push(`    healthdcatap:code "${asset['healthdcatap:therapeuticArea'].code}" ;`);
      lines.push(`    healthdcatap:name "${asset['healthdcatap:therapeuticArea'].name}"@en`);
      lines.push(`  ] ;`);
    }

    // Member States
    if (asset['healthdcatap:memberStates'] && Array.isArray(asset['healthdcatap:memberStates'])) {
      asset['healthdcatap:memberStates'].forEach(ms => {
        const countryCode = ms === 'DE' ? 'DEU' : ms === 'FR' ? 'FRA' : ms === 'NL' ? 'NLD' : ms === 'ES' ? 'ESP' : ms === 'AT' ? 'AUT' : ms === 'BE' ? 'BEL' : ms === 'IT' ? 'ITA' : ms === 'PL' ? 'POL' : ms === 'SE' ? 'SWE' : ms === 'DK' ? 'DNK' : ms === 'FI' ? 'FIN' : ms === 'PT' ? 'PRT' : ms === 'IE' ? 'IRL' : ms === 'CZ' ? 'CZE' : ms;
        lines.push(`  healthdcatap:memberState <http://publications.europa.eu/resource/authority/country/${countryCode}> ;`);
      });
    }

    // MedDRA
    if (asset['healthdcatap:medDRA']) {
      lines.push(`  healthdcatap:medDRA [`);
      lines.push(`    a healthdcatap:MedDRA ;`);
      lines.push(`    healthdcatap:socCode "${asset['healthdcatap:medDRA'].socCode}" ;`);
      lines.push(`    healthdcatap:socName "${asset['healthdcatap:medDRA'].socName}"@en ;`);
      lines.push(`    healthdcatap:ptCode "${asset['healthdcatap:medDRA'].ptCode}" ;`);
      lines.push(`    healthdcatap:ptName "${asset['healthdcatap:medDRA'].ptName}"@en`);
      lines.push(`  ] ;`);
    }

    // Consent
    if (asset['healthdcatap:consent']) {
      lines.push(`  healthdcatap:consent [`);
      lines.push(`    a healthdcatap:Consent ;`);
      if (asset['healthdcatap:consent'].purposes) {
        asset['healthdcatap:consent'].purposes.forEach((p: string) => {
          lines.push(`    healthdcatap:purpose <https://w3id.org/ehds/purpose/${p}> ;`);
        });
      }
      if (asset['healthdcatap:consent'].restrictions) {
        asset['healthdcatap:consent'].restrictions.forEach((r: string) => {
          lines.push(`    healthdcatap:restriction <https://w3id.org/ehds/restriction/${r}> ;`);
        });
      }
      lines.push(`    healthdcatap:validUntil "${asset['healthdcatap:consent'].validUntil}"^^xsd:date`);
      lines.push(`  ] ;`);
    }

    // ==================== DQV Quality Measurements ====================
    lines.push(`  # DQV Quality Measurements`);
    const findabilityScore = 0.90 + (index % 10) * 0.01;
    const interopScore = 0.95 + (index % 5) * 0.01;
    const contextScore = 0.88 + (index % 12) * 0.01;
    
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/metadataCompleteness> ;`);
    lines.push(`    dqv:value "${findabilityScore.toFixed(2)}"^^xsd:double`);
    lines.push(`  ] ;`);
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/endpointAvailability> ;`);
    lines.push(`    dqv:value "0.999"^^xsd:double`);
    lines.push(`  ] ;`);
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/authenticationDocumented> ;`);
    lines.push(`    dqv:value "true"^^xsd:boolean`);
    lines.push(`  ] ;`);
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/fhirComplianceRate> ;`);
    lines.push(`    dqv:value "${interopScore.toFixed(2)}"^^xsd:double`);
    lines.push(`  ] ;`);
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/vocabularyCoverage> ;`);
    lines.push(`    dqv:value "0.94"^^xsd:double`);
    lines.push(`  ] ;`);
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/licenseExplicit> ;`);
    lines.push(`    dqv:value "true"^^xsd:boolean`);
    lines.push(`  ] ;`);
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/provenanceDocumented> ;`);
    lines.push(`    dqv:value "true"^^xsd:boolean`);
    lines.push(`  ] ;`);
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/clinicalContextCompleteness> ;`);
    lines.push(`    dqv:value "${contextScore.toFixed(2)}"^^xsd:double`);
    lines.push(`  ] ;`);
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/consentGranularity> ;`);
    lines.push(`    dqv:value "study-specific"^^xsd:string`);
    lines.push(`  ] ;`);
    lines.push(`  dqv:hasQualityMeasurement [`);
    lines.push(`    a dqv:QualityMeasurement ;`);
    lines.push(`    dqv:isMeasurementOf <http://example.org/dqv/metric/deidentificationLevel> ;`);
    lines.push(`    dqv:value "HIPAA-Safe-Harbor"^^xsd:string`);
    lines.push(`  ] .`);
    lines.push('');

    // ==================== DISTRIBUTION ====================
    lines.push(`<${distributionUri}> a dcat:Distribution ;`);
    lines.push(`  dct:title "FHIR R4 Bundle (Anonymized)"@en ;`);
    lines.push(`  dct:description "De-identified FHIR R4 Bundle with ISiK/KBV profile compliance"@en ;`);
    lines.push(`  dcat:accessURL <https://dataspace.rheinland-uklinikum.de/catalog/${id}> ;`);
    lines.push(`  dcat:downloadURL <https://dataspace.rheinland-uklinikum.de/download/${id}.json.gz> ;`);
    lines.push(`  dcat:mediaType <https://www.iana.org/assignments/media-types/application/fhir+json> ;`);
    lines.push(`  dct:format <http://publications.europa.eu/resource/authority/file-type/JSON> ;`);
    lines.push(`  dcat:byteSize "${(524288 + index * 10240)}"^^xsd:nonNegativeInteger ;`);
    lines.push(`  dcat:compressFormat <https://www.iana.org/assignments/media-types/application/gzip> ;`);
    lines.push(`  spdx:checksum [`);
    lines.push(`    a spdx:Checksum ;`);
    lines.push(`    spdx:algorithm spdx:checksumAlgorithm_sha256 ;`);
    lines.push(`    spdx:checksumValue "e3b0c44298fc1c149afbf4c8996fb924${index.toString().padStart(2, '0')}ae41e4649b934ca495991b7852b855"`);
    lines.push(`  ] ;`);
    lines.push(`  dct:license <http://publications.europa.eu/resource/authority/licence/CC_BY_NC_4_0> ;`);
    lines.push(`  dct:accessRights <http://publications.europa.eu/resource/authority/access-right/RESTRICTED> ;`);
    lines.push(`  dct:rights [`);
    lines.push(`    a dct:RightsStatement ;`);
    lines.push(`    rdfs:label "Data available under research agreement with IRB approval and consent verification via Verifiable Credentials"@en`);
    lines.push(`  ] ;`);
    lines.push(`  dct:conformsTo <http://hl7.org/fhir/R4> ;`);
    lines.push(`  dct:conformsTo <https://www.hl7.de/de/isik/> ;`);
    lines.push(`  adms:status <http://publications.europa.eu/resource/authority/dataset-status/COMPLETED> ;`);
    // MANDATORY: Applicable legislation for distribution (HealthDCAT-AP Release 5)
    lines.push(`  dcatap:applicableLegislation <http://data.europa.eu/eli/reg/2025/327/oj> .`);
    lines.push('');

    // ==================== SAMPLE DISTRIBUTION ====================
    // Read sample from data if available - includes CSVW variable dictionary per Release 5
    const sampleData = asset['adms:sample'] as {
      title?: string;
      description?: string;
      accessURL?: string;
      byteSize?: number;
    } | undefined;
    const csvwUri = `http://example.org/csvw/${id}`;
    lines.push(`<${sampleUri}> a dcat:Distribution ;`);
    lines.push(`  dct:title "${sampleData?.title || 'Sample EHR Records (5 anonymized)'}"@en ;`);
    lines.push(`  dct:description "${sampleData?.description || 'Preview subset of the dataset for evaluation purposes. Includes CSVW variable dictionary.'}"@en ;`);
    lines.push(`  dcat:accessURL <${sampleData?.accessURL || `https://dataspace.rheinland-uklinikum.de/sample/${id}`}> ;`);
    lines.push(`  dcat:downloadURL <${sampleData?.accessURL || `https://dataspace.rheinland-uklinikum.de/sample/${id}`}.json> ;`);
    lines.push(`  dcat:mediaType <https://www.iana.org/assignments/media-types/application/fhir+json> ;`);
    lines.push(`  dct:format <http://publications.europa.eu/resource/authority/file-type/JSON> ;`);
    lines.push(`  dcat:byteSize "${sampleData?.byteSize || 51200}"^^xsd:nonNegativeInteger ;`);
    lines.push(`  dct:license <http://publications.europa.eu/resource/authority/licence/CC_BY_4_0> ;`);
    lines.push(`  adms:status <http://publications.europa.eu/resource/authority/dataset-status/COMPLETED> ;`);
    lines.push(`  dct:issued "2024-12-01"^^xsd:date ;`);
    lines.push(`  dct:conformsTo <http://hl7.org/fhir/R4> ;`);
    lines.push(`  dct:conformsTo <http://www.w3.org/ns/csvw> ;`);  // CSVW conformance
    // MANDATORY: Applicable legislation for distribution (HealthDCAT-AP Release 5)
    lines.push(`  dcatap:applicableLegislation <http://data.europa.eu/eli/reg/2025/327/oj> .`);
    lines.push('');
    
    // ==================== CSVW VARIABLE DICTIONARY (Release 5) ====================
    // Table Group containing variable definitions for the sample data
    lines.push(`<${csvwUri}> a csvw:TableGroup ;`);
    lines.push(`  csvw:table [`);
    lines.push(`    a csvw:Table ;`);
    lines.push(`    csvw:url <${sampleData?.accessURL || `https://dataspace.rheinland-uklinikum.de/sample/${id}`}.csv> ;`);
    lines.push(`    dct:title "Variable Dictionary for ${asset['dct:title']}"@en ;`);
    lines.push(`    dcat:keyword "EHR"@en, "FHIR"@en, "clinical data"@en ;`);
    lines.push(`    csvw:column [`);
    lines.push(`      a csvw:Column ;`);
    lines.push(`      csvw:name "patient_id" ;`);
    lines.push(`      csvw:titles "Patient Identifier"@en ;`);
    lines.push(`      dct:description "Pseudonymized patient identifier"@en ;`);
    lines.push(`      csvw:datatype "string"`);
    lines.push(`    ], [`);
    lines.push(`      a csvw:Column ;`);
    lines.push(`      csvw:name "diagnosis_code" ;`);
    lines.push(`      csvw:titles "ICD-10 Diagnosis Code"@en ;`);
    lines.push(`      dct:description "Primary diagnosis using ICD-10-GM coding"@en ;`);
    lines.push(`      csvw:datatype "string" ;`);
    lines.push(`      csvw:propertyUrl <http://hl7.org/fhir/StructureDefinition/Condition>`);
    lines.push(`    ], [`);
    lines.push(`      a csvw:Column ;`);
    lines.push(`      csvw:name "age_at_diagnosis" ;`);
    lines.push(`      csvw:titles "Age at Diagnosis"@en ;`);
    lines.push(`      dct:description "Patient age in years at time of diagnosis"@en ;`);
    lines.push(`      csvw:datatype "integer"`);
    lines.push(`    ], [`);
    lines.push(`      a csvw:Column ;`);
    lines.push(`      csvw:name "biological_sex" ;`);
    lines.push(`      csvw:titles "Biological Sex"@en ;`);
    lines.push(`      dct:description "Biological sex (male, female, other, unknown)"@en ;`);
    lines.push(`      csvw:datatype "string" ;`);
    lines.push(`      csvw:propertyUrl <http://hl7.org/fhir/StructureDefinition/Patient>`);
    lines.push(`    ], [`);
    lines.push(`      a csvw:Column ;`);
    lines.push(`      csvw:name "meddra_pt_code" ;`);
    lines.push(`      csvw:titles "MedDRA Preferred Term Code"@en ;`);
    lines.push(`      dct:description "MedDRA v27.0 Preferred Term code"@en ;`);
    lines.push(`      csvw:datatype "string" ;`);
    lines.push(`      csvw:propertyUrl <https://meddra.org/>`);
    lines.push(`    ], [`);
    lines.push(`      a csvw:Column ;`);
    lines.push(`      csvw:name "observation_date" ;`);
    lines.push(`      csvw:titles "Observation Date"@en ;`);
    lines.push(`      dct:description "Date of clinical observation"@en ;`);
    lines.push(`      csvw:datatype "date"`);
    lines.push(`    ]`);
    lines.push(`  ] .`);
    lines.push('');

    // ==================== ANALYTICS DISTRIBUTION ====================
    // Read analytics from data if available - links to Confidential Computing Data Service
    const analyticsData = asset['healthdcatap:analytics'] as {
      'dct:title'?: string;
      'dcat:accessURL'?: string;
      'dct:format'?: string;
      'confidentialComputing'?: boolean;
    } | undefined;
    lines.push(`<${analyticsUri}> a dcat:Distribution ;`);
    lines.push(`  dct:title "${analyticsData?.['dct:title'] || `Analytics Report for ${asset['dct:title']}`}"@en ;`);
    lines.push(`  dct:description "Pre-computed statistical analytics and aggregated insights for secondary use evaluation via Confidential Computing"@en ;`);
    lines.push(`  dcat:accessURL <${analyticsData?.['dcat:accessURL'] || `https://dataspace.rheinland-uklinikum.de/analytics/${id}`}> ;`);
    lines.push(`  dcat:downloadURL <${analyticsData?.['dcat:accessURL'] || `https://dataspace.rheinland-uklinikum.de/analytics/${id}`}.csv> ;`);
    lines.push(`  dcat:accessService <${analyticsServiceUri}> ;`);  // Link to Confidential Computing Data Service
    lines.push(`  dcat:mediaType <https://www.iana.org/assignments/media-types/text/csv> ;`);
    lines.push(`  dct:format <${analyticsData?.['dct:format'] || 'http://publications.europa.eu/resource/authority/file-type/CSV'}> ;`);
    lines.push(`  dcat:byteSize "204800"^^xsd:nonNegativeInteger ;`);
    lines.push(`  dct:license <http://publications.europa.eu/resource/authority/licence/CC_BY_NC_4_0> ;`);
    lines.push(`  adms:status <http://publications.europa.eu/resource/authority/dataset-status/COMPLETED> ;`);
    lines.push(`  dct:issued "2024-12-01"^^xsd:date ;`);
    lines.push(`  dct:modified "2024-12-15"^^xsd:date ;`);
    lines.push(`  dct:conformsTo <https://www.w3.org/TR/vocab-dqv/> ;`);
    // MANDATORY: Applicable legislation for distribution (HealthDCAT-AP Release 5)
    lines.push(`  dcatap:applicableLegislation <http://data.europa.eu/eli/reg/2025/327/oj> .`);
    lines.push('');

    // ==================== CONFIDENTIAL COMPUTING DATA SERVICE ====================
    // Data Service for Confidential Computing (TEE-based analytics)
    lines.push(`<${analyticsServiceUri}> a dcat:DataService ;`);
    lines.push(`  dct:title "Confidential Computing Analytics Service for ${asset['dct:title']}"@en ;`);
    lines.push(`  dct:description "Trusted Execution Environment (TEE) based analytics service enabling secure computation on sensitive health data without exposing raw data. Compliant with EHDS Art. 50 requirements for secure processing environments."@en ;`);
    lines.push(`  dcat:endpointURL <https://dataspace.rheinland-uklinikum.de/tee/analytics/${id}> ;`);
    lines.push(`  dcat:endpointDescription <https://dataspace.rheinland-uklinikum.de/api/tee/openapi.yaml> ;`);
    lines.push(`  dcat:servesDataset <${datasetUri}> ;`);
    lines.push(`  dct:conformsTo <https://confidentialcomputing.io/> ;`);
    lines.push(`  dct:conformsTo <https://www.iso.org/standard/82528.html> ;`);  // ISO/IEC 24392 TEE
    lines.push(`  dcatap:applicableLegislation <http://data.europa.eu/eli/reg/2025/327/oj> ;`);
    lines.push(`  dcat:theme <http://publications.europa.eu/resource/authority/data-theme/HEAL> ;`);
    lines.push(`  dcat:keyword "confidential computing"@en, "TEE"@en, "secure analytics"@en, "privacy-preserving"@en ;`);
    lines.push(`  dct:accessRights <http://publications.europa.eu/resource/authority/access-right/RESTRICTED> ;`);
    lines.push(`  dct:license <http://publications.europa.eu/resource/authority/licence/CC_BY_NC_4_0> ;`);
    lines.push(`  dcat:contactPoint [`);
    lines.push(`    a vcard:Organization ;`);
    lines.push(`    vcard:fn "Rheinland Universitätsklinikum IT Security"@de ;`);
    lines.push(`    vcard:hasEmail <mailto:tee-support@rheinland-uklinikum.de>`);
    lines.push(`  ] ;`);
    lines.push(`  foaf:page <https://dataspace.rheinland-uklinikum.de/docs/confidential-computing> .`);
    lines.push('');

    // ==================== ODRL POLICY ====================
    lines.push(`<${policyUri}> a odrl:Offer ;`);
    lines.push(`  odrl:uid <${policyUri}> ;`);
    lines.push(`  dct:title "Consent-Gated Access Policy for ${asset['dct:title']}"@en ;`);
    lines.push(`  dct:description "ODRL policy requiring valid ConsentCredential and purpose-bound access per EHDS Art. 46"@en ;`);
    lines.push(`  odrl:profile <https://w3id.org/ehds/policy/profile> ;`);
    lines.push(`  odrl:assigner <${creatorDid}> ;`);
    lines.push(`  dct:issued "2024-01-15"^^xsd:date ;`);
    lines.push(`  dct:valid "2030-12-31"^^xsd:date ;`);
    lines.push(`  dct:creator <${creatorDid}> ;`);
    lines.push(`  rdfs:seeAlso <https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space_en> ;`);
    lines.push(`  odrl:permission [`);
    lines.push(`    a odrl:Permission ;`);
    lines.push(`    odrl:target <${datasetUri}> ;`);
    lines.push(`    odrl:action odrl:read ;`);
    lines.push(`    odrl:action odrl:use ;`);
    
    // Purpose constraints based on consent
    if (asset['healthdcatap:consent']?.purposes) {
      lines.push(`    odrl:constraint [`);
      lines.push(`      a odrl:Constraint ;`);
      lines.push(`      odrl:leftOperand odrl:purpose ;`);
      lines.push(`      odrl:operator odrl:isAnyOf ;`);
      const purposeUris = asset['healthdcatap:consent'].purposes.map((p: string) => `<https://w3id.org/ehds/purpose/${p}>`);
      lines.push(`      odrl:rightOperand ${purposeUris.join(', ')}`);
      lines.push(`    ] ;`);
    }
    
    // Spatial constraint for member states
    if (asset['healthdcatap:memberStates'] && asset['healthdcatap:memberStates'].length > 0) {
      lines.push(`    odrl:constraint [`);
      lines.push(`      a odrl:Constraint ;`);
      lines.push(`      odrl:leftOperand odrl:spatial ;`);
      lines.push(`      odrl:operator odrl:isAnyOf ;`);
      const countryUris = asset['healthdcatap:memberStates'].map((ms: string) => {
        const code = ms === 'DE' ? 'DEU' : ms === 'FR' ? 'FRA' : ms === 'NL' ? 'NLD' : ms === 'ES' ? 'ESP' : ms === 'AT' ? 'AUT' : ms === 'BE' ? 'BEL' : ms === 'IT' ? 'ITA' : ms === 'PL' ? 'POL' : ms === 'SE' ? 'SWE' : ms === 'DK' ? 'DNK' : ms === 'FI' ? 'FIN' : ms === 'PT' ? 'PRT' : ms === 'IE' ? 'IRL' : ms === 'CZ' ? 'CZE' : ms;
        return `<http://publications.europa.eu/resource/authority/country/${code}>`;
      });
      lines.push(`      odrl:rightOperand ${countryUris.join(', ')}`);
      lines.push(`    ] ;`);
    }

    // Time constraint
    if (asset['healthdcatap:consent']?.validUntil) {
      lines.push(`    odrl:constraint [`);
      lines.push(`      a odrl:Constraint ;`);
      lines.push(`      odrl:leftOperand odrl:dateTime ;`);
      lines.push(`      odrl:operator odrl:lt ;`);
      lines.push(`      odrl:rightOperand "${asset['healthdcatap:consent'].validUntil}"^^xsd:date`);
      lines.push(`    ] ;`);
    }

    // Duty: Obtain consent via VC
    lines.push(`    odrl:duty [`);
    lines.push(`      a odrl:Duty ;`);
    lines.push(`      odrl:action odrl:obtainConsent ;`);
    lines.push(`      odrl:constraint [`);
    lines.push(`        a odrl:Constraint ;`);
    lines.push(`        odrl:leftOperand <https://w3id.org/ehds/constraint/credentialType> ;`);
    lines.push(`        odrl:operator odrl:eq ;`);
    lines.push(`        odrl:rightOperand "ConsentCredential"^^xsd:string`);
    lines.push(`      ]`);
    lines.push(`    ] ;`);

    // Duty: Data provenance logging
    lines.push(`    odrl:duty [`);
    lines.push(`      a odrl:Duty ;`);
    lines.push(`      odrl:action <https://w3id.org/ehds/action/logProvenance> ;`);
    lines.push(`      odrl:constraint [`);
    lines.push(`        a odrl:Constraint ;`);
    lines.push(`        odrl:leftOperand <https://w3id.org/ehds/constraint/provenanceVC> ;`);
    lines.push(`        odrl:operator odrl:eq ;`);
    lines.push(`        odrl:rightOperand "true"^^xsd:boolean`);
    lines.push(`      ]`);
    lines.push(`    ]`);
    lines.push(`  ] ;`);

    // Prohibitions based on restrictions
    if (asset['healthdcatap:consent']?.restrictions) {
      asset['healthdcatap:consent'].restrictions.forEach((r: string, rIndex: number) => {
        const isLast = rIndex === asset['healthdcatap:consent']!.restrictions.length - 1;
        lines.push(`  odrl:prohibition [`);
        lines.push(`    a odrl:Prohibition ;`);
        lines.push(`    odrl:target <${datasetUri}> ;`);
        if (r === 'no-commercial') {
          lines.push(`    odrl:action odrl:commercialize`);
        } else if (r === 'no-reidentification') {
          lines.push(`    odrl:action <https://w3id.org/ehds/action/reidentify>`);
        } else if (r === 'no-genetic') {
          lines.push(`    odrl:action <https://w3id.org/ehds/action/geneticAnalysis>`);
        } else if (r === 'no-third-party') {
          lines.push(`    odrl:action odrl:distribute`);
        } else if (r === 'no-indefinite-storage') {
          lines.push(`    odrl:action <https://w3id.org/ehds/action/indefiniteStorage>`);
        } else if (r === 'confidential-computing') {
          lines.push(`    odrl:action <https://w3id.org/ehds/action/processOutsideTEE>`);
        } else {
          lines.push(`    odrl:action <https://w3id.org/ehds/action/${r}>`);
        }
        lines.push(`  ]${isLast ? ' ;' : ' ;'}`);
      });
    }
    
    lines.push(`  dct:issued "2024-01-15"^^xsd:date .`);
    lines.push('');
  });

  // ============================================================
  // EXTERNAL RESOURCE TYPE DECLARATIONS (SHACL Compliance)
  // ============================================================
  // These declarations provide rdf:type for external URIs referenced
  // throughout the catalog, enabling DCAT-AP SHACL validation.
  lines.push('# ============================================================');
  lines.push('# External Resource Type Declarations (SHACL Compliance)');
  lines.push('# ============================================================');
  lines.push('# The following declarations provide rdf:type for external URIs');
  lines.push('# used in the catalog. This enables DCAT-AP 3.0.0 SHACL validation.');
  lines.push('');

  // Languages (dct:LinguisticSystem)
  lines.push('# Languages');
  lines.push('<http://publications.europa.eu/resource/authority/language/ENG> a dct:LinguisticSystem .');
  lines.push('<http://publications.europa.eu/resource/authority/language/DEU> a dct:LinguisticSystem .');
  lines.push('');

  // Locations (dct:Location)
  lines.push('# Locations');
  lines.push('<http://publications.europa.eu/resource/authority/country/DEU> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/FRA> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/NLD> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/ESP> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/AUT> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/BEL> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/ITA> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/POL> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/SWE> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/DNK> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/FIN> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/PRT> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/IRL> a dct:Location .');
  lines.push('<http://publications.europa.eu/resource/authority/country/CZE> a dct:Location .');
  lines.push('');

  // Licenses (dct:LicenseDocument)
  lines.push('# Licenses');
  lines.push('<http://publications.europa.eu/resource/authority/licence/CC_BY_4_0> a dct:LicenseDocument .');
  lines.push('<http://publications.europa.eu/resource/authority/licence/CC_BY_NC_4_0> a dct:LicenseDocument .');
  lines.push('<http://publications.europa.eu/resource/authority/licence/CC_BY_SA_4_0> a dct:LicenseDocument .');
  lines.push('<http://publications.europa.eu/resource/authority/licence/CC0> a dct:LicenseDocument .');
  lines.push('');

  // Frequencies (dct:Frequency)
  lines.push('# Frequencies');
  lines.push('<http://publications.europa.eu/resource/authority/frequency/QUARTERLY> a dct:Frequency .');
  lines.push('<http://publications.europa.eu/resource/authority/frequency/ANNUAL> a dct:Frequency .');
  lines.push('<http://publications.europa.eu/resource/authority/frequency/MONTHLY> a dct:Frequency .');
  lines.push('');

  // Legal Resources (eli:LegalResource)
  lines.push('# Legal Resources');
  lines.push('<http://data.europa.eu/eli/reg/2025/327/oj> a eli:LegalResource .');
  lines.push('<http://data.europa.eu/eli/reg/2016/679/oj> a eli:LegalResource .');
  lines.push('<http://data.europa.eu/eli/reg/2014/536/oj> a eli:LegalResource .');
  lines.push('<http://data.europa.eu/eli/reg/2017/745/oj> a eli:LegalResource .');
  lines.push('<https://www.gesetze-im-internet.de/gdng/> a eli:LegalResource .');
  lines.push('<https://www.gesetze-im-internet.de/bdsg_2018/> a eli:LegalResource .');
  lines.push('');

  // Standards (dct:Standard)
  lines.push('# Standards');
  lines.push('<https://w3id.org/ehds/ehr/v1> a dct:Standard .');
  lines.push('<http://hl7.org/fhir/R4> a dct:Standard .');
  lines.push('<https://www.hl7.de/de/isik/> a dct:Standard .');
  lines.push('<https://simplifier.net/kbv> a dct:Standard .');
  lines.push('<https://meddra.org/how-to-use/support-documentation/english> a dct:Standard .');
  lines.push('<http://www.w3.org/ns/csvw#> a dct:Standard .');
  lines.push('<http://www.w3.org/ns/csvw> a dct:Standard .');
  lines.push('<https://www.iso.org/iso-27001-information-security.html> a dct:Standard .');
  lines.push('<http://www.w3.org/ns/prov-o#> a dct:Standard .');
  lines.push('');

  // Themes (skos:Concept)
  lines.push('# Themes');
  lines.push('<http://publications.europa.eu/resource/authority/data-theme/HEAL> a skos:Concept .');
  lines.push('<http://eurovoc.europa.eu/2784> a skos:Concept .');
  lines.push('<http://eurovoc.europa.eu/3885> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D005820> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D004700> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D002318> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D009369> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D012140> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D012216> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D009422> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D007674> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D011570> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D005767> a skos:Concept .');
  lines.push('<http://id.nlm.nih.gov/mesh/D007239> a skos:Concept .');
  lines.push('');

  // Dataset Types (skos:Concept)
  lines.push('# Dataset Types');
  lines.push('<http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA> a skos:Concept .');
  lines.push('<http://publications.europa.eu/resource/dataset/dataset-type/STATISTICAL> a skos:Concept .');
  lines.push('<http://publications.europa.eu/resource/dataset/dataset-type/CODE_LIST> a skos:Concept .');
  lines.push('');

  // Dataset Status (skos:Concept)
  lines.push('# Dataset Status');
  lines.push('<http://publications.europa.eu/resource/authority/dataset-status/COMPLETED> a skos:Concept .');
  lines.push('<http://publications.europa.eu/resource/authority/dataset-status/ONGOING> a skos:Concept .');
  lines.push('');

  // Access Rights (dct:RightsStatement)
  lines.push('# Access Rights');
  lines.push('<http://publications.europa.eu/resource/authority/access-right/RESTRICTED> a dct:RightsStatement .');
  lines.push('<http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC> a dct:RightsStatement .');
  lines.push('<http://publications.europa.eu/resource/authority/access-right/PUBLIC> a dct:RightsStatement .');
  lines.push('');

  // Media Types (dct:MediaType)
  lines.push('# Media Types');
  lines.push('<https://www.iana.org/assignments/media-types/application/fhir+json> a dct:MediaType .');
  lines.push('<https://www.iana.org/assignments/media-types/text/csv> a dct:MediaType .');
  lines.push('<https://www.iana.org/assignments/media-types/application/json> a dct:MediaType .');
  lines.push('<https://www.iana.org/assignments/media-types/application/ld+json> a dct:MediaType .');
  lines.push('');

  // File Formats (dct:MediaTypeOrExtent)
  lines.push('# File Formats');
  lines.push('<http://publications.europa.eu/resource/authority/file-type/JSON> a dct:MediaTypeOrExtent .');
  lines.push('<http://publications.europa.eu/resource/authority/file-type/CSV> a dct:MediaTypeOrExtent .');
  lines.push('<http://publications.europa.eu/resource/authority/file-type/XML> a dct:MediaTypeOrExtent .');
  lines.push('<http://publications.europa.eu/resource/authority/file-type/RDF_TURTLE> a dct:MediaTypeOrExtent .');
  lines.push('');

  // Checksum Algorithms (spdx:ChecksumAlgorithm)
  lines.push('# Checksum Algorithms');
  lines.push('<http://spdx.org/rdf/terms#checksumAlgorithm_sha256> a spdx:ChecksumAlgorithm .');
  lines.push('<http://spdx.org/rdf/terms#checksumAlgorithm_sha512> a spdx:ChecksumAlgorithm .');
  lines.push('');

  // DCAT Roles
  lines.push('# DCAT Roles');
  lines.push('<http://www.iana.org/assignments/relation/related> a dcat:Role .');
  lines.push('<http://www.iana.org/assignments/relation/describes> a dcat:Role .');
  lines.push('');

  // Health Categories (skos:Concept) - HealthDCAT-AP specific
  lines.push('# Health Categories (EHDS Art. 51)');
  lines.push('<http://healthdata.ec.europa.eu/authority/health-category/EHR> a skos:Concept .');
  lines.push('<http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL> a skos:Concept .');
  lines.push('<http://healthdata.ec.europa.eu/authority/health-category/MEDICAL_DEVICE> a skos:Concept .');
  lines.push('<http://healthdata.ec.europa.eu/authority/health-category/BIOBANK> a skos:Concept .');
  lines.push('');

  // Theme Taxonomy (skos:ConceptScheme)
  lines.push('# Theme Taxonomy');
  lines.push('<http://publications.europa.eu/resource/authority/data-theme> a skos:ConceptScheme ;');
  lines.push('  dct:title "EU Data Theme Taxonomy"@en .');
  lines.push('');

  // Publisher Types (skos:Concept)
  lines.push('# Publisher Types');
  lines.push('<http://purl.org/adms/publishertype/Academia> a skos:Concept .');
  lines.push('<http://purl.org/adms/publishertype/Company> a skos:Concept .');
  lines.push('<http://purl.org/adms/publishertype/LocalAuthority> a skos:Concept .');
  lines.push('<http://purl.org/adms/publishertype/NationalAuthority> a skos:Concept .');
  lines.push('<http://purl.org/adms/publishertype/RegionalAuthority> a skos:Concept .');
  lines.push('<http://purl.org/adms/publishertype/IndustryConsortium> a skos:Concept .');
  lines.push('<http://purl.org/adms/publishertype/NonGovernmentalOrganisation> a skos:Concept .');
  lines.push('<http://purl.org/adms/publishertype/StandardisationBody> a skos:Concept .');
  lines.push('<http://purl.org/adms/publishertype/SupraNationalAuthority> a skos:Concept .');
  lines.push('<http://purl.org/adms/publishertype/NonProfitOrganisation> a skos:Concept .');
  lines.push('');

  // DPV Purposes (skos:Concept)
  lines.push('# DPV Purposes');
  lines.push('<https://w3id.org/dpv#ResearchAndDevelopment> a skos:Concept .');
  lines.push('<https://w3id.org/dpv#AcademicResearch> a skos:Concept .');
  lines.push('<https://w3id.org/dpv#ScientificResearch> a skos:Concept .');
  lines.push('<https://w3id.org/dpv#NonCommercialResearch> a skos:Concept .');
  lines.push('<https://w3id.org/dpv#StatisticalPurpose> a skos:Concept .');
  lines.push('<https://w3id.org/dpv#PublicHealth> a skos:Concept .');
  lines.push('<https://w3id.org/dpv#HealthMonitoring> a skos:Concept .');
  lines.push('<https://w3id.org/dpv#DrugDevelopment> a skos:Concept .');
  lines.push('<https://w3id.org/dpv#PersonalizedMedicine> a skos:Concept .');
  lines.push('<https://w3id.org/dpv#ClinicalStudy> a skos:Concept .');
  lines.push('');

  // Additional Standards
  lines.push('# Additional Standards');
  lines.push('<https://www.cdisc.org/standards/foundational/sdtm> a dct:Standard .');
  lines.push('<https://www.cdisc.org/standards/foundational/odm> a dct:Standard .');
  lines.push('<https://www.iso.org/standard/79573.html> a dct:Standard .');
  lines.push('<https://www.iso.org/standard/82528.html> a dct:Standard .');
  lines.push('<https://www.iso.org/iso-27001> a dct:Standard .');
  lines.push('<https://www.iso.org/standard/45170.html> a dct:Standard .');
  lines.push('');

  // Documentation (foaf:Document)
  lines.push('# Documentation');
  lines.push('<https://dataspace.rheinland-uklinikum.de/docs/confidential-computing> a foaf:Document .');
  lines.push('<https://dataspace.rheinland-uklinikum.de/docs/ehr-catalog> a foaf:Document .');
  lines.push('<https://dataspace.rheinland-uklinikum.de/docs/fhir-api> a foaf:Document .');
  lines.push('<https://dataspace.rheinland-uklinikum.de/docs/consent> a foaf:Document .');
  lines.push('<https://dataspace.rheinland-uklinikum.de/docs/privacy> a foaf:Document .');
  lines.push('<https://dataspace.rheinland-uklinikum.de/docs/deidentification> a foaf:Document .');
  lines.push('<https://dataspace.rheinland-uklinikum.de/docs/data-quality> a foaf:Document .');
  lines.push('');

  // OpenAPI Documentation
  lines.push('# OpenAPI Documentation');
  lines.push('<https://dataspace.rheinland-uklinikum.de/api/tee/openapi.yaml> a rdfs:Resource .');
  lines.push('');

  // GZip Media Type
  lines.push('# Compression Format');
  lines.push('<https://www.iana.org/assignments/media-types/application/gzip> a dct:MediaType .');
  lines.push('');

  // Additional Legal Resources
  lines.push('# Additional Legal Resources');
  lines.push('<http://data.europa.eu/eli/reg/2022/868/oj> a eli:LegalResource .');
  lines.push('');

  // Generate per-record resource type declarations
  lines.push('# Per-Record Resource Declarations');
  const allRecordIds = mockEHRCatalogAssets.map((r) => r['@id'].split('/').pop() || r['@id']);
  allRecordIds.forEach((id: string) => {
    // Sample resources
    lines.push(`<https://dataspace.rheinland-uklinikum.de/sample/${id}> a rdfs:Resource .`);
    // Download sample URLs
    lines.push(`<https://dataspace.rheinland-uklinikum.de/download/sample/${id}> a rdfs:Resource .`);
    // Download analytics URLs
    lines.push(`<https://dataspace.rheinland-uklinikum.de/download/analytics/${id}> a rdfs:Resource .`);
    // TEE endpoint URLs
    lines.push(`<https://dataspace.rheinland-uklinikum.de/tee/analytics/${id}> a rdfs:Resource .`);
    // Analytics API endpoint URLs
    lines.push(`<https://dataspace.rheinland-uklinikum.de/api/analytics/${id}> a rdfs:Resource .`);
    // Download URLs for distributions
    lines.push(`<https://dataspace.rheinland-uklinikum.de/download/${id}.json.gz> a rdfs:Resource .`);
    // Catalog access URLs
    lines.push(`<https://dataspace.rheinland-uklinikum.de/catalog/${id}> a rdfs:Resource .`);
  });
  lines.push('');

  return lines.join('\n');
};

/**
 * Download HealthDCAT-AP catalog from the backend API endpoint.
 * This ensures single source of truth - the canonical TTL file served by backend-mock.
 * Falls back to local serialization if API is unavailable.
 */
export const downloadHealthDCATAP = async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Try to fetch from the canonical API endpoint
    const response = await fetch(`${backendUrl}/api/catalog.ttl`);
    
    if (response.ok) {
      const turtle = await response.text();
      const blob = new Blob([turtle], { type: 'text/turtle' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'health-catalog.ttl';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('[HealthDCAT-AP] Downloaded from API endpoint');
      return;
    }
    throw new Error(`API returned ${response.status}`);
  } catch (error) {
    // Fallback to local serialization if API unavailable
    console.warn('[HealthDCAT-AP] API unavailable, using local serializer:', error);
    const turtle = serializeToTurtle();
    const blob = new Blob([turtle], { type: 'text/turtle' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health-catalog.ttl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
