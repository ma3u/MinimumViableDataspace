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

// Medical category definitions for filtering and visualization
export const medicalCategories = {
  'endocrine': { label: 'Endocrine/Metabolic', color: 'bg-amber-100 text-amber-800', icon: '🔬' },
  'cardiology': { label: 'Cardiology', color: 'bg-red-100 text-red-800', icon: '❤️' },
  'oncology': { label: 'Oncology', color: 'bg-pink-100 text-pink-800', icon: '🎗️' },
  'pulmonology': { label: 'Pulmonology', color: 'bg-sky-100 text-sky-800', icon: '🫁' },
  'rheumatology': { label: 'Rheumatology', color: 'bg-orange-100 text-orange-800', icon: '🦴' },
  'neurology': { label: 'Neurology', color: 'bg-purple-100 text-purple-800', icon: '🧠' },
  'nephrology': { label: 'Nephrology', color: 'bg-yellow-100 text-yellow-800', icon: '🫘' },
  'psychiatry': { label: 'Psychiatry', color: 'bg-indigo-100 text-indigo-800', icon: '🧠' },
  'gastroenterology': { label: 'Gastroenterology', color: 'bg-green-100 text-green-800', icon: '🔄' },
  'infectious': { label: 'Infectious Disease', color: 'bg-rose-100 text-rose-800', icon: '🦠' },
};

// Background images for medical categories (royalty-free medical illustrations)
export const categoryBackgrounds: Record<string, string> = {
  'endocrine': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop', // blood glucose
  'cardiology': 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=300&fit=crop', // heart
  'oncology': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop', // cells
  'pulmonology': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop', // lungs xray
  'rheumatology': 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=300&fit=crop', // joints
  'neurology': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', // brain
  'nephrology': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop', // medical
  'psychiatry': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop', // mental health
  'gastroenterology': 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop', // stomach
  'infectious': 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&h=300&fit=crop', // virus
};

export const mockEHRCatalogAssets = [
  {
    '@id': 'asset:ehr:EHR001',
    '@type': 'dcat:Dataset',
    'dct:title': 'Type 2 Diabetes with CV Risk',
    'dct:description': 'Type 2 diabetes mellitus with cardiovascular comorbidities',
    'dcat:keyword': ['diabetes', 'cardiovascular', 'metabolic'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'E11.9',
    'health:diagnosis': 'Type 2 diabetes mellitus',
    'health:category': 'endocrine',
    'health:ageBand': '55-64',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR002',
    '@type': 'dcat:Dataset',
    'dct:title': 'Chronic Heart Failure (HFrEF)',
    'dct:description': 'Heart failure with reduced ejection fraction',
    'dcat:keyword': ['heart failure', 'cardiology', 'HFrEF'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'I50.9',
    'health:diagnosis': 'Heart failure',
    'health:category': 'cardiology',
    'health:ageBand': '65-74',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR003',
    '@type': 'dcat:Dataset',
    'dct:title': 'Breast Cancer (Remission)',
    'dct:description': 'Breast cancer in remission post-treatment',
    'dcat:keyword': ['oncology', 'breast cancer', 'survivor'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'C50.9',
    'health:diagnosis': 'Malignant neoplasm of breast',
    'health:category': 'oncology',
    'health:ageBand': '45-54',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR004',
    '@type': 'dcat:Dataset',
    'dct:title': 'Prostate Cancer (Active Surveillance)',
    'dct:description': 'Low-grade prostate cancer under surveillance',
    'dcat:keyword': ['oncology', 'prostate cancer', 'surveillance'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'C61',
    'health:diagnosis': 'Malignant neoplasm of prostate',
    'health:category': 'oncology',
    'health:ageBand': '65-74',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR005',
    '@type': 'dcat:Dataset',
    'dct:title': 'COPD with Emphysema',
    'dct:description': 'Chronic obstructive pulmonary disease with emphysema',
    'dcat:keyword': ['pulmonology', 'COPD', 'emphysema'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'J44.9',
    'health:diagnosis': 'COPD',
    'health:category': 'pulmonology',
    'health:ageBand': '55-64',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR006',
    '@type': 'dcat:Dataset',
    'dct:title': 'Multiple Sclerosis (RRMS)',
    'dct:description': 'Relapsing-remitting multiple sclerosis',
    'dcat:keyword': ['neurology', 'MS', 'autoimmune'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'G35',
    'health:diagnosis': 'Multiple sclerosis',
    'health:category': 'neurology',
    'health:ageBand': '25-34',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR007',
    '@type': 'dcat:Dataset',
    'dct:title': 'Rheumatoid Arthritis',
    'dct:description': 'Seropositive rheumatoid arthritis',
    'dcat:keyword': ['rheumatology', 'RA', 'autoimmune'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'M05.9',
    'health:diagnosis': 'Rheumatoid arthritis',
    'health:category': 'rheumatology',
    'health:ageBand': '45-54',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR008',
    '@type': 'dcat:Dataset',
    'dct:title': 'Chronic Kidney Disease Stage 4',
    'dct:description': 'CKD stage 4 with diabetic nephropathy',
    'dcat:keyword': ['nephrology', 'CKD', 'diabetic nephropathy'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'N18.4',
    'health:diagnosis': 'Chronic kidney disease, stage 4',
    'health:category': 'nephrology',
    'health:ageBand': '65-74',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR009',
    '@type': 'dcat:Dataset',
    'dct:title': 'Major Depressive Disorder',
    'dct:description': 'Recurrent major depressive disorder, moderate',
    'dcat:keyword': ['psychiatry', 'depression', 'mental health'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'F33.1',
    'health:diagnosis': 'Major depressive disorder, recurrent',
    'health:category': 'psychiatry',
    'health:ageBand': '35-44',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
    'health:sensitiveCategory': 'mental-health',
  },
  {
    '@id': 'asset:ehr:EHR010',
    '@type': 'dcat:Dataset',
    'dct:title': "Parkinson's Disease",
    'dct:description': "Early-stage Parkinson's disease",
    'dcat:keyword': ['neurology', 'Parkinson', 'movement disorder'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'G20',
    'health:diagnosis': "Parkinson's disease",
    'health:category': 'neurology',
    'health:ageBand': '55-64',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR011',
    '@type': 'dcat:Dataset',
    'dct:title': "Crohn's Disease",
    'dct:description': "Crohn's disease of small intestine",
    'dcat:keyword': ['gastroenterology', 'IBD', 'Crohn'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'K50.0',
    'health:diagnosis': "Crohn's disease of small intestine",
    'health:category': 'gastroenterology',
    'health:ageBand': '25-34',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR012',
    '@type': 'dcat:Dataset',
    'dct:title': 'Epilepsy (Focal)',
    'dct:description': 'Focal epilepsy with impaired awareness',
    'dcat:keyword': ['neurology', 'epilepsy', 'seizure'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'G40.2',
    'health:diagnosis': 'Focal epilepsy',
    'health:category': 'neurology',
    'health:ageBand': '18-24',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR013',
    '@type': 'dcat:Dataset',
    'dct:title': 'Systemic Lupus Erythematosus',
    'dct:description': 'SLE with renal involvement',
    'dcat:keyword': ['rheumatology', 'lupus', 'autoimmune'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'M32.1',
    'health:diagnosis': 'Systemic lupus erythematosus',
    'health:category': 'rheumatology',
    'health:ageBand': '35-44',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR014',
    '@type': 'dcat:Dataset',
    'dct:title': 'Atrial Fibrillation',
    'dct:description': 'Persistent atrial fibrillation',
    'dcat:keyword': ['cardiology', 'arrhythmia', 'AFib'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'I48.1',
    'health:diagnosis': 'Persistent atrial fibrillation',
    'health:category': 'cardiology',
    'health:ageBand': '75-84',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR015',
    '@type': 'dcat:Dataset',
    'dct:title': 'Severe Asthma',
    'dct:description': 'Severe persistent asthma with allergic component',
    'dcat:keyword': ['pulmonology', 'asthma', 'allergic'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'J45.5',
    'health:diagnosis': 'Severe persistent asthma',
    'health:category': 'pulmonology',
    'health:ageBand': '35-44',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR016',
    '@type': 'dcat:Dataset',
    'dct:title': 'Type 1 Diabetes',
    'dct:description': 'Type 1 diabetes with insulin pump therapy',
    'dcat:keyword': ['endocrinology', 'T1D', 'insulin'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'E10.9',
    'health:diagnosis': 'Type 1 diabetes mellitus',
    'health:category': 'endocrine',
    'health:ageBand': '25-34',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR017',
    '@type': 'dcat:Dataset',
    'dct:title': 'Osteoporosis with Fracture',
    'dct:description': 'Postmenopausal osteoporosis with pathological fracture',
    'dcat:keyword': ['rheumatology', 'osteoporosis', 'fracture'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'M80.0',
    'health:diagnosis': 'Postmenopausal osteoporosis with fracture',
    'health:category': 'rheumatology',
    'health:ageBand': '65-74',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR018',
    '@type': 'dcat:Dataset',
    'dct:title': 'Hepatitis C (Chronic)',
    'dct:description': 'Chronic viral hepatitis C',
    'dcat:keyword': ['infectious disease', 'hepatitis', 'viral'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'B18.2',
    'health:diagnosis': 'Chronic viral hepatitis C',
    'health:category': 'infectious',
    'health:ageBand': '45-54',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
    'health:sensitiveCategory': 'infectious-disease',
  },
  {
    '@id': 'asset:ehr:EHR019',
    '@type': 'dcat:Dataset',
    'dct:title': 'Chronic Migraine',
    'dct:description': 'Chronic migraine with aura',
    'dcat:keyword': ['neurology', 'migraine', 'headache'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'G43.1',
    'health:diagnosis': 'Migraine with aura',
    'health:category': 'neurology',
    'health:ageBand': '35-44',
    'health:biologicalSex': 'female',
    'health:consentStatus': 'active',
  },
  {
    '@id': 'asset:ehr:EHR020',
    '@type': 'dcat:Dataset',
    'dct:title': 'HIV (Well-Controlled)',
    'dct:description': 'HIV infection on antiretroviral therapy, undetectable',
    'dcat:keyword': ['infectious disease', 'HIV', 'antiretroviral'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    'health:icdCode': 'B20',
    'health:diagnosis': 'HIV disease',
    'health:category': 'infectious',
    'health:ageBand': '35-44',
    'health:biologicalSex': 'male',
    'health:consentStatus': 'active',
    'health:sensitiveCategory': 'infectious-disease',
  },
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
