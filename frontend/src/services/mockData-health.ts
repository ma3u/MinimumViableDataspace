/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import type { ElectronicHealthRecord } from '../types/health';

// ============================================================================
// MOCK CATALOG DATA - Simulates DSP Catalog Protocol Response for EHR2EDC
// ============================================================================

export const mockEHRCatalogAssets = [
  {
    '@id': 'asset:ehr:EHR001',
    '@type': 'dcat:Dataset',
    'dct:title': 'EHR - Type 2 Diabetes with CV Risk',
    'dct:description': 'Anonymized EHR: Type 2 diabetes mellitus with cardiovascular comorbidities',
    'dcat:keyword': ['diabetes', 'cardiovascular', 'metabolic', 'EHR'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'E11.9',
    'health:diagnosis': 'Type 2 diabetes mellitus',
    'health:ageBand': '55-64',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
    'odrl:hasPolicy': {
      '@id': 'policy:health-consent-contract:EHR001',
      '@type': 'odrl:Offer',
      'odrl:permission': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'MembershipCredential',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'active'
        }
      }],
      'odrl:obligation': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'DataAccess.level',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'processing'
        }
      }],
      'odrl:prohibition': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'DataAccess.reidentification',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'true'
        }
      }]
    }
  },
  {
    '@id': 'asset:ehr:EHR002',
    '@type': 'dcat:Dataset',
    'dct:title': 'EHR - Chronic Heart Failure',
    'dct:description': 'Anonymized EHR: Heart failure with reduced ejection fraction',
    'dcat:keyword': ['heart failure', 'cardiology', 'HFrEF', 'EHR'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'I50.9',
    'health:diagnosis': 'Heart failure',
    'health:ageBand': '65-74',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
    'odrl:hasPolicy': {
      '@id': 'policy:health-consent-contract:EHR002',
      '@type': 'odrl:Offer',
      'odrl:permission': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'MembershipCredential',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'active'
        }
      }],
      'odrl:obligation': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'DataAccess.level',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'processing'
        }
      }]
    }
  },
  {
    '@id': 'asset:ehr:EHR003',
    '@type': 'dcat:Dataset',
    'dct:title': 'EHR - Breast Cancer Survivor',
    'dct:description': 'Anonymized EHR: Breast cancer in remission post-treatment',
    'dcat:keyword': ['oncology', 'breast cancer', 'survivor', 'EHR'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'C50.9',
    'health:diagnosis': 'Malignant neoplasm of breast',
    'health:ageBand': '45-54',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
    'odrl:hasPolicy': {
      '@id': 'policy:health-consent-contract:EHR003',
      '@type': 'odrl:Offer',
      'odrl:permission': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'MembershipCredential',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'active'
        }
      }],
      'odrl:obligation': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'DataAccess.level',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'processing'
        }
      }]
    }
  },
  {
    '@id': 'asset:ehr:EHR006',
    '@type': 'dcat:Dataset',
    'dct:title': 'EHR - Multiple Sclerosis (RRMS)',
    'dct:description': 'Anonymized EHR: Relapsing-remitting multiple sclerosis',
    'dcat:keyword': ['neurology', 'MS', 'autoimmune', 'EHR'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'G35',
    'health:diagnosis': 'Multiple sclerosis',
    'health:ageBand': '25-34',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
    'odrl:hasPolicy': {
      '@id': 'policy:health-consent-contract:EHR006',
      '@type': 'odrl:Offer',
      'odrl:permission': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'MembershipCredential',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'active'
        }
      }],
      'odrl:obligation': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'DataAccess.level',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'processing'
        }
      }]
    }
  }
];

// ============================================================================
// MOCK EHR DATA - Sample Electronic Health Records (Anonymized per GDPR/EHDS)
// ============================================================================

export const mockEHRData: Record<string, ElectronicHealthRecord> = {
  'asset:ehr:EHR001': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    id: 'did:web:rheinland-uklinikum.de:ehr:EHR001',
    type: ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    issuer: 'did:web:rheinland-uklinikum.de',
    issuanceDate: '2025-11-01T10:00:00Z',
    credentialSubject: {
      id: 'did:web:rheinland-uklinikum.de:patient:pseudonym:A7X9K2',
      resourceType: 'Bundle',
      studyEligibility: ['CARDIO-DM2-2025', 'METAB-PREV-2025'],
      consentScope: {
        purposes: ['clinical-research', 'registry-participation'],
        dataCategories: ['demographics', 'conditions', 'observations', 'medications'],
        retentionPeriod: '10-years',
        jurisdiction: 'DE-NW'
      },
      demographicsNode: {
        pseudonymId: 'A7X9K2',
        ageBand: '55-64',
        biologicalSex: 'male',
        region: 'Nordrhein-Westfalen',
        enrollmentPeriod: '2023-Q2'
      },
      conditionsNode: {
        primaryDiagnosis: {
          code: 'E11.9',
          system: 'ICD-10-GM',
          display: 'Type 2 diabetes mellitus without complications',
          onsetPeriod: '2019'
        },
        comorbidities: [
          { code: 'I10', system: 'ICD-10-GM', display: 'Essential hypertension' },
          { code: 'E78.0', system: 'ICD-10-GM', display: 'Pure hypercholesterolemia' }
        ]
      },
      observationsNode: {
        latestVitals: {
          recordPeriod: '2025-Q3',
          bmiCategory: 'overweight',
          bloodPressureCategory: 'stage1-hypertension',
          hba1cRange: '7.0-7.9%'
        },
        labResults: [
          { code: '2345-7', display: 'Glucose [Mass/Vol]', valueRange: '126-150 mg/dL', interpretation: 'elevated' },
          { code: '2093-3', display: 'Cholesterol Total', valueRange: '200-239 mg/dL', interpretation: 'borderline-high' }
        ]
      },
      medicationsNode: {
        activeTherapies: [
          { code: 'A10BA02', system: 'ATC', display: 'Metformin', durationCategory: '>2-years' },
          { code: 'C09AA05', system: 'ATC', display: 'Ramipril', durationCategory: '1-2-years' },
          { code: 'C10AA05', system: 'ATC', display: 'Atorvastatin', durationCategory: '>2-years' }
        ]
      },
      provenanceNode: {
        sourceSystem: 'Rheinland-UK-EHR-v4',
        extractionDate: '2025-11',
        deIdentificationMethod: 'k-anonymity-k5',
        qualityScore: 0.94
      }
    }
  },
  'asset:ehr:EHR002': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    id: 'did:web:rheinland-uklinikum.de:ehr:EHR002',
    type: ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    issuer: 'did:web:rheinland-uklinikum.de',
    issuanceDate: '2025-11-01T10:00:00Z',
    credentialSubject: {
      id: 'did:web:rheinland-uklinikum.de:patient:pseudonym:B3M7P5',
      resourceType: 'Bundle',
      studyEligibility: ['HF-OUTCOMES-2025', 'CARDIO-REHAB-2025'],
      consentScope: {
        purposes: ['clinical-research'],
        dataCategories: ['demographics', 'conditions', 'observations', 'procedures'],
        retentionPeriod: '10-years',
        jurisdiction: 'DE-NW'
      },
      demographicsNode: {
        pseudonymId: 'B3M7P5',
        ageBand: '65-74',
        biologicalSex: 'female',
        region: 'Nordrhein-Westfalen',
        enrollmentPeriod: '2022-Q4'
      },
      conditionsNode: {
        primaryDiagnosis: {
          code: 'I50.9',
          system: 'ICD-10-GM',
          display: 'Heart failure, unspecified',
          onsetPeriod: '2021'
        },
        comorbidities: [
          { code: 'I48.0', system: 'ICD-10-GM', display: 'Atrial fibrillation' },
          { code: 'N18.3', system: 'ICD-10-GM', display: 'Chronic kidney disease, stage 3' }
        ]
      },
      observationsNode: {
        latestVitals: {
          recordPeriod: '2025-Q3',
          bmiCategory: 'normal',
          bloodPressureCategory: 'normal',
          ejectionFractionRange: '35-40%'
        },
        labResults: [
          { code: '33762-6', display: 'NT-proBNP', valueRange: '900-1500 pg/mL', interpretation: 'elevated' },
          { code: '2160-0', display: 'Creatinine', valueRange: '1.3-1.8 mg/dL', interpretation: 'elevated' }
        ]
      },
      medicationsNode: {
        activeTherapies: [
          { code: 'C09AA02', system: 'ATC', display: 'Enalapril', durationCategory: '>2-years' },
          { code: 'C07AB02', system: 'ATC', display: 'Metoprolol', durationCategory: '>2-years' },
          { code: 'C03CA01', system: 'ATC', display: 'Furosemide', durationCategory: '1-2-years' }
        ]
      },
      provenanceNode: {
        sourceSystem: 'Rheinland-UK-EHR-v4',
        extractionDate: '2025-11',
        deIdentificationMethod: 'k-anonymity-k5',
        qualityScore: 0.91
      }
    }
  },
  'asset:ehr:EHR003': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    id: 'did:web:rheinland-uklinikum.de:ehr:EHR003',
    type: ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    issuer: 'did:web:rheinland-uklinikum.de',
    issuanceDate: '2025-11-01T10:00:00Z',
    credentialSubject: {
      id: 'did:web:rheinland-uklinikum.de:patient:pseudonym:C5N2R8',
      resourceType: 'Bundle',
      studyEligibility: ['ONCO-SURV-2025', 'BC-FOLLOWUP-2025'],
      consentScope: {
        purposes: ['clinical-research', 'cancer-registry'],
        dataCategories: ['demographics', 'conditions', 'procedures', 'medications'],
        retentionPeriod: '15-years',
        jurisdiction: 'DE-NW'
      },
      demographicsNode: {
        pseudonymId: 'C5N2R8',
        ageBand: '45-54',
        biologicalSex: 'female',
        region: 'Nordrhein-Westfalen',
        enrollmentPeriod: '2021-Q1'
      },
      conditionsNode: {
        primaryDiagnosis: {
          code: 'C50.9',
          system: 'ICD-10-GM',
          display: 'Malignant neoplasm of breast, unspecified',
          onsetPeriod: '2020',
          clinicalStatus: 'remission'
        },
        comorbidities: [
          { code: 'F32.0', system: 'ICD-10-GM', display: 'Mild depressive episode' }
        ]
      },
      observationsNode: {
        latestVitals: {
          recordPeriod: '2025-Q3',
          bmiCategory: 'normal',
          bloodPressureCategory: 'normal'
        },
        labResults: [
          { code: '2039-6', display: 'CA 15-3', valueRange: '<31 U/mL', interpretation: 'normal' }
        ]
      },
      proceduresNode: {
        historicalProcedures: [
          { code: '0HBT0ZZ', system: 'ICD-10-PCS', display: 'Excision of breast', periodPerformed: '2020-Q2' },
          { code: 'Chemotherapy', display: 'Adjuvant chemotherapy', periodPerformed: '2020-Q3' }
        ]
      },
      medicationsNode: {
        activeTherapies: [
          { code: 'L02BA01', system: 'ATC', display: 'Tamoxifen', durationCategory: '>2-years' }
        ]
      },
      provenanceNode: {
        sourceSystem: 'Rheinland-UK-EHR-v4',
        extractionDate: '2025-11',
        deIdentificationMethod: 'k-anonymity-k5',
        qualityScore: 0.96
      }
    }
  },
  'asset:ehr:EHR006': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    id: 'did:web:rheinland-uklinikum.de:ehr:EHR006',
    type: ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    issuer: 'did:web:rheinland-uklinikum.de',
    issuanceDate: '2025-11-01T10:00:00Z',
    credentialSubject: {
      id: 'did:web:rheinland-uklinikum.de:patient:pseudonym:F7Q3W9',
      resourceType: 'Bundle',
      studyEligibility: ['NEURO-MS-2025', 'MS-DMT-2025'],
      consentScope: {
        purposes: ['clinical-research'],
        dataCategories: ['demographics', 'conditions', 'observations', 'medications'],
        retentionPeriod: '10-years',
        jurisdiction: 'DE-NW'
      },
      demographicsNode: {
        pseudonymId: 'F7Q3W9',
        ageBand: '25-34',
        biologicalSex: 'female',
        region: 'Nordrhein-Westfalen',
        enrollmentPeriod: '2023-Q4'
      },
      conditionsNode: {
        primaryDiagnosis: {
          code: 'G35',
          system: 'ICD-10-GM',
          display: 'Multiple sclerosis',
          onsetPeriod: '2022',
          msType: 'relapsing-remitting'
        },
        comorbidities: []
      },
      observationsNode: {
        latestVitals: {
          recordPeriod: '2025-Q3',
          bmiCategory: 'normal',
          bloodPressureCategory: 'normal',
          edssScore: '1.5-2.0'
        },
        labResults: [
          { code: 'MRI-Brain', display: 'Brain MRI lesion count', valueRange: '5-10 lesions', interpretation: 'stable' }
        ]
      },
      medicationsNode: {
        activeTherapies: [
          { code: 'L04AA31', system: 'ATC', display: 'Teriflunomide', durationCategory: '1-2-years' }
        ]
      },
      provenanceNode: {
        sourceSystem: 'Rheinland-UK-EHR-v4',
        extractionDate: '2025-11',
        deIdentificationMethod: 'k-anonymity-k5',
        qualityScore: 0.95
      }
    }
  }
};

// ============================================================================
// PARTICIPANT INFORMATION - Healthcare Dataspace Scenario
// ============================================================================

export const healthParticipants = {
  provider: {
    name: 'Rheinland Universitätsklinikum',
    role: 'Data Provider (Hospital)',
    did: 'did:web:rheinland-uklinikum.de',
    description: 'University hospital providing de-identified EHR data for clinical research under EHDS',
    logo: '🏥',
    connectorEndpoint: 'https://provider.rheinland-uklinikum.de/dsp'
  },
  consumer: {
    name: 'Nordstein Research Institute',
    role: 'Data Consumer (CRO)',
    did: 'did:web:nordstein-research.de',
    description: 'Clinical research organization consuming EHR data for EDC studies',
    logo: '🔬',
    connectorEndpoint: 'https://consumer.nordstein-research.de/dsp'
  }
};

// ============================================================================
// DSP PROTOCOL PHASES - Healthcare/EHR2EDC Context
// ============================================================================

export const healthDspPhases = {
  catalog: {
    title: 'Catalog Protocol (EHR Discovery)',
    description: 'The Catalog Protocol enables the research institute to discover available anonymized EHR datasets from the hospital. The Consumer sends a CatalogRequestMessage and receives a DCAT Catalog containing available patient cohorts and their consent-based access policies.',
    specLink: 'https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#catalog-protocol',
    steps: [
      { name: 'CatalogRequestMessage', direction: 'CRO → Hospital', description: 'Research institute requests available EHR cohorts' },
      { name: 'dcat:Catalog', direction: 'Hospital → CRO', description: 'Hospital responds with consent-gated EHR datasets' }
    ]
  },
  negotiation: {
    title: 'Contract Negotiation (Consent Verification)',
    description: 'The Contract Negotiation Protocol ensures that the research institute presents valid credentials (MembershipCredential + DataProcessorCredential) and that patient consent covers the research purpose. The prohibition against re-identification is enforced.',
    specLink: 'https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#negotiation-protocol',
    steps: [
      { name: 'ContractRequestMessage + ConsentPresentation', direction: 'CRO → Hospital', description: 'CRO requests access with consent scope' },
      { name: 'ContractOfferMessage', direction: 'Hospital → CRO', description: 'Hospital offers terms with re-ID prohibition' },
      { name: 'ContractNegotiationEventMessage (ACCEPTED)', direction: 'CRO → Hospital', description: 'CRO accepts terms' },
      { name: 'ContractAgreementMessage', direction: 'Hospital → CRO', description: 'Hospital confirms data processing agreement' },
      { name: 'ContractAgreementVerificationMessage', direction: 'CRO → Hospital', description: 'CRO verifies agreement integrity' },
      { name: 'ContractNegotiationEventMessage (FINALIZED)', direction: 'Hospital → CRO', description: 'Consent-verified contract complete' }
    ]
  },
  transfer: {
    title: 'Transfer Process (EHR to EDC)',
    description: 'The Transfer Process delivers de-identified FHIR data to the research institute EDC system. The data undergoes k-anonymity transformation before transfer. Provenance metadata tracks all transformations applied.',
    specLink: 'https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#transfer-protocol',
    steps: [
      { name: 'TransferRequestMessage', direction: 'CRO → Hospital', description: 'CRO requests EHR transfer for study' },
      { name: 'De-identification Pipeline', direction: 'Hospital (internal)', description: 'Hospital applies k-anonymity (k=5)' },
      { name: 'TransferStartMessage + EDR', direction: 'Hospital → CRO', description: 'Hospital provides secure endpoint' },
      { name: 'FHIR Bundle (HTTP PULL)', direction: 'Hospital → CRO', description: 'De-identified EHR data transferred' },
      { name: 'TransferCompletionMessage', direction: 'CRO → Hospital', description: 'CRO confirms EDC ingestion' }
    ]
  }
};

// ============================================================================
// DSP PROTOCOL MESSAGE EXAMPLES - Healthcare Context
// ============================================================================

export const healthDspMessages = {
  catalogRequest: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dspace:CatalogRequestMessage',
    'dspace:filter': {
      '@type': 'dspace:QuerySpec',
      'dspace:filterExpression': [
        { 'dspace:operand': 'health:studyEligibility', 'dspace:operator': 'contains', 'dspace:value': 'CARDIO-DM2-2025' }
      ]
    }
  },
  
  catalogResponse: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dcat:Catalog',
    '@id': 'urn:uuid:ehr-catalog-001',
    'dcat:dataset': '... (array of EHR datasets)',
    'dcat:service': {
      '@type': 'dcat:DataService',
      'dcat:endpointUrl': 'https://rheinland-uklinikum.de/dsp'
    }
  },

  contractRequestMessage: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dspace:ContractRequestMessage',
    'dspace:consumerPid': 'urn:uuid:nordstein-process-001',
    'dspace:offer': {
      '@type': 'odrl:Offer',
      '@id': 'urn:uuid:ehr-offer-001',
      'odrl:target': 'asset:ehr:EHR001'
    },
    'dspace:callbackAddress': 'https://nordstein-research.de/callback',
    'dspace:verifiablePresentation': {
      '@type': 'VerifiablePresentation',
      'verifiableCredential': ['MembershipCredential', 'DataProcessorCredential', 'ConsentPresentation']
    }
  }
};

// Re-export negotiation and transfer flows (same structure, reusable)
export { mockNegotiationFlow, mockTransferFlow } from './mockData';
