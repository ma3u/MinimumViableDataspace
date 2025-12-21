/*
 *  Copyright (c) 2025 Health Dataspace Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

// Initialize OpenTelemetry tracing FIRST (before other imports)
import { initTracing, shutdownTracing } from './middleware/tracing';
initTracing();

import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { metricsMiddleware, register, recordEhrAccess, measureDataAccess } from './middleware/metrics';
import { loggingMiddleware, logger } from './middleware/logging';
import { initializeEhrMetrics, startEhrMetricsSimulation } from './middleware/ehds-metrics';

// Initialize EHDS/EHR metrics with baseline values
initializeEhrMetrics();
startEhrMetricsSimulation();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Observability middleware
app.use(loggingMiddleware);
app.use(metricsMiddleware);

// Prometheus metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err instanceof Error ? err.message : 'Error generating metrics');
  }
});

// Interfaces for EHR records (Verifiable Credential structure)
interface DemographicsNode {
  pseudonymId: string;
  ageBand: string;
  biologicalSex: string;
  region: string;
  enrollmentPeriod: string;
  [key: string]: unknown;
}

interface Diagnosis {
  code: string;
  system: string;
  display: string;
  onsetPeriod?: string;
  [key: string]: unknown;
}

interface ConditionsNode {
  primaryDiagnosis: Diagnosis;
  comorbidities: Diagnosis[];
  [key: string]: unknown;
}

interface ConsentScope {
  purposes: string[];
  dataCategories: string[];
  retentionPeriod: string;
  jurisdiction: string;
  [key: string]: unknown;
}

interface ProvenanceNode {
  sourceSystem: string;
  extractionDate: string;
  deIdentificationMethod: string;
  qualityScore: number;
  [key: string]: unknown;
}

interface CredentialSubject {
  id: string;
  resourceType: string;
  type: string;
  studyEligibility: string[];
  consentScope: ConsentScope;
  demographicsNode: DemographicsNode;
  conditionsNode: ConditionsNode;
  provenanceNode: ProvenanceNode;
  observationsNode?: Record<string, unknown>;
  medicationsNode?: Record<string, unknown>;
  clinicalTrialNode?: Record<string, unknown>;
  medDRANode?: Record<string, unknown>;
  signalVerificationNode?: Record<string, unknown>;
  anamnesisNode?: Record<string, unknown>;
  [key: string]: unknown;
}

interface HealthRecord {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: CredentialSubject;
  proof?: Record<string, unknown>;
}

/**
 * 20 Anonymized Electronic Health Records following GDPR/EHDS guidelines
 * Provider: Rheinland Universitätsklinikum (University Hospital)
 * Consumer: Nordstein Research Institute (Clinical Research Organization)
 * 
 * Anonymization applied per EU GDPR Art. 89 and EHDS secondary use provisions:
 * - Direct identifiers removed (names replaced with pseudonyms)
 * - Dates generalized to month/year
 * - Locations generalized to region
 * - Age bands instead of exact birth dates
 * - Quasi-identifiers minimized
 */

const healthRecords: Record<string, HealthRecord> = {
  // Patient 1: Diabetes Type 2 with Cardiovascular Risk
  'EHR001': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR001',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:A7X9K2',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['CARDIO-DM2-2025', 'METAB-PREV-2025'],
      'consentScope': {
        'purposes': ['clinical-research', 'registry-participation'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'A7X9K2',
        'ageBand': '55-64',
        'biologicalSex': 'male',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2023-Q2'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'E11.9',
          'system': 'ICD-10-GM',
          'display': 'Type 2 diabetes mellitus without complications',
          'onsetPeriod': '2019'
        },
        'comorbidities': [
          { 'code': 'I10', 'system': 'ICD-10-GM', 'display': 'Essential hypertension' },
          { 'code': 'E78.0', 'system': 'ICD-10-GM', 'display': 'Pure hypercholesterolemia' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'overweight',
          'bloodPressureCategory': 'stage1-hypertension',
          'hba1cRange': '7.0-7.9%'
        },
        'labResults': [
          { 'code': '2345-7', 'display': 'Glucose [Mass/Vol]', 'valueRange': '126-150 mg/dL', 'interpretation': 'elevated' },
          { 'code': '2093-3', 'display': 'Cholesterol Total', 'valueRange': '200-239 mg/dL', 'interpretation': 'borderline-high' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'A10BA02', 'system': 'ATC', 'display': 'Metformin', 'durationCategory': '>2-years' },
          { 'code': 'C09AA05', 'system': 'ATC', 'display': 'Ramipril', 'durationCategory': '1-2-years' },
          { 'code': 'C10AA05', 'system': 'ATC', 'display': 'Atorvastatin', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.94
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15602',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'HbA1c reduction at 52 weeks',
        'euCtNumber': '2024-501234-12-DE',
        'sponsor': { 'name': 'NordPharma AG', 'type': 'commercial', 'country': 'DE' },
        'therapeuticArea': { 'code': 'ENDOCRINE', 'name': 'Endocrinology/Diabetology' },
        'investigationalProduct': { 'name': 'NP-DM-2024', 'atcCode': 'A10BX' },
        'memberStatesConcerned': ['DE', 'FR', 'NL', 'ES']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10027433',
          'name': 'Metabolism and nutrition disorders',
          'abbreviation': 'Metab'
        },
        'preferredTerm': {
          'code': '10012601',
          'name': 'Diabetes mellitus',
          'hltCode': '10012608'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-001-001',
            'medDRAPT': 'Hypoglycaemia',
            'medDRACode': '10020993',
            'severity': 'moderate',
            'seriousness': ['hospitalization'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q3',
            'suspectedDrug': 'A10BA02',
            'relatedness': 'probable',
            'expectedness': 'expected',
            'actionTaken': 'dose-reduced'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'closed',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Progressive fatigue and increased thirst over 6 months',
          'relevantFindings': ['Polyuria', 'Polydipsia', 'Unintentional weight loss'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Gradual onset of symptoms, initially attributed to stress; elevated fasting glucose detected during routine screening',
          'relevantFindings': ['Symptom duration >6 months', 'No ketoacidosis episodes', 'Lifestyle modifications attempted'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'History of hypertension (diagnosed 2015), hypercholesterolemia (2017); no prior diabetes diagnosis',
          'relevantFindings': ['Hypertension controlled with ACE inhibitor', 'Statin therapy initiated', 'No surgical history'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Strong family history of metabolic disorders; mother with T2DM, father with coronary artery disease',
          'relevantFindings': ['First-degree relative with T2DM', 'Cardiovascular disease in family', 'No known genetic conditions'],
          'clinicalSignificance': 'high'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Sedentary occupation, former smoker (quit 5 years ago), moderate alcohol consumption',
          'relevantFindings': ['Office work >8h/day', 'Limited physical activity', 'BMI in overweight category'],
          'clinicalSignificance': 'moderate'
        }
      }
    }
  },

  // Patient 2: Chronic Heart Failure
  'EHR002': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR002',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:B3M7P5',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['HF-OUTCOMES-2025', 'CARDIO-REHAB-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'procedures'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'B3M7P5',
        'ageBand': '65-74',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2022-Q4'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'I50.9',
          'system': 'ICD-10-GM',
          'display': 'Heart failure, unspecified',
          'onsetPeriod': '2021'
        },
        'comorbidities': [
          { 'code': 'I48.0', 'system': 'ICD-10-GM', 'display': 'Atrial fibrillation' },
          { 'code': 'N18.3', 'system': 'ICD-10-GM', 'display': 'Chronic kidney disease, stage 3' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal',
          'ejectionFractionRange': '35-40%'
        },
        'labResults': [
          { 'code': '33762-6', 'display': 'NT-proBNP', 'valueRange': '900-1500 pg/mL', 'interpretation': 'elevated' },
          { 'code': '2160-0', 'display': 'Creatinine', 'valueRange': '1.3-1.8 mg/dL', 'interpretation': 'elevated' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'C09AA02', 'system': 'ATC', 'display': 'Enalapril', 'durationCategory': '>2-years' },
          { 'code': 'C07AB02', 'system': 'ATC', 'display': 'Metoprolol', 'durationCategory': '>2-years' },
          { 'code': 'C03CA01', 'system': 'ATC', 'display': 'Furosemide', 'durationCategory': '1-2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.91
      },
      'clinicalTrialNode': {
        'phase': 'Phase IV',
        'phaseCode': 'C15603',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Reduction in HF hospitalization',
        'euCtNumber': '2023-487652-41-DE',
        'sponsor': { 'name': 'Rhenus Therapeutics GmbH', 'type': 'commercial', 'country': 'DE' },
        'therapeuticArea': { 'code': 'CARDIO', 'name': 'Cardiovascular' },
        'investigationalProduct': { 'name': 'RT-HF-2023', 'atcCode': 'C01DA' },
        'memberStatesConcerned': ['DE', 'AT', 'NL']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10007541',
          'name': 'Cardiac disorders',
          'abbreviation': 'Card'
        },
        'preferredTerm': {
          'code': '10019277',
          'name': 'Heart failure',
          'hltCode': '10019279'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-002-001',
            'medDRAPT': 'Hypotension',
            'medDRACode': '10021097',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'C09AA02',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'dose-maintained'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Shortness of breath on exertion and swelling in ankles',
          'relevantFindings': ['Dyspnea (NYHA II)', 'Peripheral edema'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Worsening exercise tolerance over past 3 months; orthopnea present',
          'relevantFindings': ['Reduced exercise capacity', '2-pillow orthopnea'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Chronic kidney disease (stage 3), atrial fibrillation',
          'relevantFindings': ['CKD stable', 'AFib rate controlled'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Father died of MI at 65',
          'relevantFindings': ['Paternal MI <65y'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Retired teacher, lives with spouse, non-smoker',
          'relevantFindings': ['Good social support', 'No tobacco use'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 3: Breast Cancer Survivor
  'EHR003': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR003',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:C5N2R8',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['ONCO-SURV-2025', 'BC-FOLLOWUP-2025'],
      'consentScope': {
        'purposes': ['clinical-research', 'cancer-registry'],
        'dataCategories': ['demographics', 'conditions', 'procedures', 'medications'],
        'retentionPeriod': '15-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'C5N2R8',
        'ageBand': '45-54',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2021-Q1'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'C50.9',
          'system': 'ICD-10-GM',
          'display': 'Malignant neoplasm of breast, unspecified',
          'onsetPeriod': '2020',
          'clinicalStatus': 'remission'
        },
        'comorbidities': [
          { 'code': 'F32.0', 'system': 'ICD-10-GM', 'display': 'Mild depressive episode' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal'
        },
        'labResults': [
          { 'code': '2039-6', 'display': 'CA 15-3', 'valueRange': '<31 U/mL', 'interpretation': 'normal' }
        ]
      },
      'proceduresNode': {
        'historicalProcedures': [
          { 'code': '0HBT0ZZ', 'system': 'ICD-10-PCS', 'display': 'Excision of breast', 'periodPerformed': '2020-Q2' },
          { 'code': 'Chemotherapy', 'display': 'Adjuvant chemotherapy', 'periodPerformed': '2020-Q3' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'L02BA01', 'system': 'ATC', 'display': 'Tamoxifen', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.96
      },
      'clinicalTrialNode': {
        'phase': 'Phase II',
        'phaseCode': 'C15601',
        'studyType': 'interventional',
        'interventionModel': 'single-group',
        'primaryEndpoint': 'Disease-free survival',
        'euCtNumber': '2024-512876-23-DE',
        'sponsor': { 'name': 'DKFZ Heidelberg', 'type': 'academic', 'country': 'DE' },
        'therapeuticArea': { 'code': 'ANTINEOPL', 'name': 'Antineoplastic and Immunomodulating Agents' },
        'investigationalProduct': { 'name': 'DKFZ-BC-2024', 'atcCode': 'L01XX' },
        'memberStatesConcerned': ['DE']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10029104',
          'name': 'Neoplasms benign, malignant and unspecified',
          'abbreviation': 'Neopl'
        },
        'preferredTerm': {
          'code': '10006187',
          'name': 'Breast cancer',
          'hltCode': '10006190'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-003-001',
            'medDRAPT': 'Hot flush',
            'medDRACode': '10020406',
            'severity': 'moderate',
            'seriousness': ['non-serious'],
            'outcome': 'not-recovered',
            'onsetPeriod': '2024-Q2',
            'suspectedDrug': 'L02BA01',
            'relatedness': 'probable',
            'expectedness': 'expected',
            'actionTaken': 'dose-maintained'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-09'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Routine follow-up, reports frequent hot flashes',
          'relevantFindings': ['Hot flashes', 'No palpable masses'],
          'clinicalSignificance': 'low'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Diagnosed 2020, treated with mastectomy and chemo; currently on Tamoxifen',
          'relevantFindings': ['Post-mastectomy', 'Adherent to Tamoxifen'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Mild depression diagnosed post-diagnosis',
          'relevantFindings': ['Depression managed with therapy'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Maternal aunt with breast cancer at 50',
          'relevantFindings': ['Family history of breast cancer'],
          'clinicalSignificance': 'high'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Works part-time, married, 2 children',
          'relevantFindings': ['Active lifestyle', 'Non-smoker'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 4: COPD with Respiratory Issues
  'EHR004': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR004',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:D9K4L1',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['RESP-COPD-2025', 'PULM-REHAB-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'D9K4L1',
        'ageBand': '65-74',
        'biologicalSex': 'male',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2023-Q1'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'J44.1',
          'system': 'ICD-10-GM',
          'display': 'COPD with acute exacerbation',
          'onsetPeriod': '2018'
        },
        'comorbidities': [
          { 'code': 'J45.9', 'system': 'ICD-10-GM', 'display': 'Asthma, unspecified' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'underweight',
          'bloodPressureCategory': 'normal',
          'fev1Range': '50-60%'
        },
        'labResults': [
          { 'code': '20564-1', 'display': 'Oxygen saturation', 'valueRange': '92-95%', 'interpretation': 'low-normal' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'R03AK06', 'system': 'ATC', 'display': 'Salmeterol + Fluticasone', 'durationCategory': '>2-years' },
          { 'code': 'R03BB04', 'system': 'ATC', 'display': 'Tiotropium', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.89
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15602',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Reduction in exacerbations',
        'euCtNumber': '2024-503987-18-DE',
        'sponsor': { 'name': 'BioMedTech Europa SE', 'type': 'commercial', 'country': 'NL' },
        'therapeuticArea': { 'code': 'PULMONOLOGY', 'name': 'Pulmonology' },
        'investigationalProduct': { 'name': 'BMT-COPD-2024', 'atcCode': 'R03BB' },
        'memberStatesConcerned': ['DE', 'FR', 'NL', 'ES']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10038738',
          'name': 'Respiratory, thoracic and mediastinal disorders',
          'abbreviation': 'Resp'
        },
        'preferredTerm': {
          'code': '10009033',
          'name': 'Chronic obstructive pulmonary disease',
          'hltCode': '10009036'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-004-001',
            'medDRAPT': 'Dry mouth',
            'medDRACode': '10013781',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q3',
            'suspectedDrug': 'R03BB04',
            'relatedness': 'probable',
            'expectedness': 'expected',
            'actionTaken': 'dose-maintained'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Chronic cough and shortness of breath',
          'relevantFindings': ['Productive cough', 'Dyspnea on exertion'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Worsening cough over winter months; frequent exacerbations',
          'relevantFindings': ['Winter exacerbations', 'Sputum production'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Diagnosed with COPD 5 years ago; history of pneumonia',
          'relevantFindings': ['COPD GOLD 3', 'Prior pneumonia'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Father was a heavy smoker with emphysema',
          'relevantFindings': ['Paternal emphysema'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Retired construction worker, former smoker (40 pack-years)',
          'relevantFindings': ['Heavy smoking history', 'Occupational dust exposure'],
          'clinicalSignificance': 'high'
        }
      }
    }
  },

  // Patient 5: Rheumatoid Arthritis
  'EHR005': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR005',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:E2P8T6',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['RHEUM-BIO-2025', 'AUTOIMMUNE-REG-2025'],
      'consentScope': {
        'purposes': ['clinical-research', 'registry-participation'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'E2P8T6',
        'ageBand': '35-44',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2022-Q3'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'M06.9',
          'system': 'ICD-10-GM',
          'display': 'Rheumatoid arthritis, unspecified',
          'onsetPeriod': '2019'
        },
        'comorbidities': [
          { 'code': 'M35.0', 'system': 'ICD-10-GM', 'display': 'Sicca syndrome [Sjögren]' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal',
          'das28Score': '2.6-3.2'
        },
        'labResults': [
          { 'code': '14627-4', 'display': 'RF', 'valueRange': '>60 IU/mL', 'interpretation': 'positive' },
          { 'code': '33935-8', 'display': 'Anti-CCP', 'valueRange': '>100 U/mL', 'interpretation': 'positive' },
          { 'code': '4537-7', 'display': 'ESR', 'valueRange': '25-40 mm/hr', 'interpretation': 'elevated' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'L04AX03', 'system': 'ATC', 'display': 'Methotrexate', 'durationCategory': '>2-years' },
          { 'code': 'L04AB02', 'system': 'ATC', 'display': 'Infliximab', 'durationCategory': '1-2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.93
      },
      'clinicalTrialNode': {
        'phase': 'Phase II',
        'phaseCode': 'C15601',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'ACR20 response',
        'euCtNumber': '2024-505612-34-DE',
        'sponsor': { 'name': 'NordPharma AG', 'type': 'commercial', 'country': 'DE' },
        'therapeuticArea': { 'code': 'RHEUMATOLOGY', 'name': 'Rheumatology' },
        'investigationalProduct': { 'name': 'NP-RA-2024', 'atcCode': 'M01AX' },
        'memberStatesConcerned': ['DE', 'FR', 'NL', 'ES']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10028395',
          'name': 'Musculoskeletal and connective tissue disorders',
          'abbreviation': 'Musc'
        },
        'preferredTerm': {
          'code': '10039073',
          'name': 'Rheumatoid arthritis',
          'hltCode': '10039075'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-005-001',
            'medDRAPT': 'Injection site reaction',
            'medDRACode': '10022095',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'L04AB02',
            'relatedness': 'certain',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Morning stiffness lasting >1 hour and joint pain',
          'relevantFindings': ['Morning stiffness', 'Polyarthralgia'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Diagnosed 3 years ago; symptoms controlled on current biologic but recent flare',
          'relevantFindings': ['Recent flare', 'Biologic therapy'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'No other major chronic conditions',
          'relevantFindings': ['Generally healthy otherwise'],
          'clinicalSignificance': 'low'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Mother with hypothyroidism',
          'relevantFindings': ['Autoimmune history in family'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Office worker, non-smoker',
          'relevantFindings': ['Low impact job'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 6: Multiple Sclerosis
  'EHR006': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR006',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:F7Q3W9',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['NEURO-MS-2025', 'MS-DMT-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'F7Q3W9',
        'ageBand': '25-34',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2023-Q4'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'G35',
          'system': 'ICD-10-GM',
          'display': 'Multiple sclerosis',
          'onsetPeriod': '2022',
          'msType': 'relapsing-remitting'
        },
        'comorbidities': []
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal',
          'edssScore': '1.5-2.0'
        },
        'labResults': [
          { 'code': 'MRI-Brain', 'display': 'Brain MRI lesion count', 'valueRange': '5-10 lesions', 'interpretation': 'stable' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'L04AA31', 'system': 'ATC', 'display': 'Teriflunomide', 'durationCategory': '1-2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.95
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15602',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Reduction in relapse rate',
        'euCtNumber': '2024-506789-01-DE',
        'sponsor': { 'name': 'NeuroScience Solutions', 'type': 'commercial', 'country': 'CH' },
        'therapeuticArea': { 'code': 'NEUROLOGY', 'name': 'Neurology' },
        'investigationalProduct': { 'name': 'NS-MS-2024', 'atcCode': 'L04AA' },
        'memberStatesConcerned': ['DE', 'AT', 'CH']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10029205',
          'name': 'Nervous system disorders',
          'abbreviation': 'Nerv'
        },
        'preferredTerm': {
          'code': '10028172',
          'name': 'Multiple sclerosis',
          'hltCode': '10028175'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-006-001',
            'medDRAPT': 'Headache',
            'medDRACode': '10019211',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'L04AA31',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Numbness in legs and fatigue',
          'relevantFindings': ['Paresthesia', 'Fatigue'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Relapsing-remitting MS. Last relapse 6 months ago.',
          'relevantFindings': ['RRMS', 'Recent relapse'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Vitamin D deficiency',
          'relevantFindings': ['Vit D deficiency'],
          'clinicalSignificance': 'low'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'No known neurological diseases',
          'relevantFindings': ['None'],
          'clinicalSignificance': 'low'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Graphic designer, non-smoker',
          'relevantFindings': ['Sedentary job'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 7: Chronic Kidney Disease Stage 4
  'EHR007': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR007',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:G1R5Y4',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['NEPHRO-CKD-2025', 'RENAL-OUTCOMES-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'G1R5Y4',
        'ageBand': '55-64',
        'biologicalSex': 'male',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2022-Q2'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'N18.4',
          'system': 'ICD-10-GM',
          'display': 'Chronic kidney disease, stage 4',
          'onsetPeriod': '2020'
        },
        'comorbidities': [
          { 'code': 'E11.9', 'system': 'ICD-10-GM', 'display': 'Type 2 diabetes mellitus' },
          { 'code': 'I10', 'system': 'ICD-10-GM', 'display': 'Essential hypertension' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'overweight',
          'bloodPressureCategory': 'controlled',
          'gfrRange': '15-29 mL/min'
        },
        'labResults': [
          { 'code': '2160-0', 'display': 'Creatinine', 'valueRange': '3.5-4.5 mg/dL', 'interpretation': 'severely-elevated' },
          { 'code': '6299-2', 'display': 'Urea nitrogen', 'valueRange': '50-70 mg/dL', 'interpretation': 'elevated' },
          { 'code': '14959-1', 'display': 'Albumin/Creatinine ratio', 'valueRange': '>300 mg/g', 'interpretation': 'macroalbuminuria' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'C09CA01', 'system': 'ATC', 'display': 'Losartan', 'durationCategory': '>2-years' },
          { 'code': 'B03XA01', 'system': 'ATC', 'display': 'Erythropoietin', 'durationCategory': '1-2-years' },
          { 'code': 'A11CC', 'system': 'ATC', 'display': 'Vitamin D analogs', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.92
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15603',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Delay in dialysis initiation',
        'euCtNumber': '2024-507890-12-DE',
        'sponsor': { 'name': 'RenalCare Global', 'type': 'commercial', 'country': 'US' },
        'therapeuticArea': { 'code': 'NEPHROLOGY', 'name': 'Nephrology' },
        'investigationalProduct': { 'name': 'RC-CKD-2024', 'atcCode': 'A10BK' },
        'memberStatesConcerned': ['DE', 'FR', 'IT', 'ES']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10038359',
          'name': 'Renal and urinary disorders',
          'abbreviation': 'Renal'
        },
        'preferredTerm': {
          'code': '10009118',
          'name': 'Chronic kidney disease',
          'hltCode': '10038435'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-007-001',
            'medDRAPT': 'Hyperkalemia',
            'medDRACode': '10020647',
            'severity': 'moderate',
            'seriousness': ['medically-significant'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q3',
            'suspectedDrug': 'C09CA01',
            'relatedness': 'probable',
            'expectedness': 'expected',
            'actionTaken': 'dose-reduced'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Fatigue and swelling in legs',
          'relevantFindings': ['Fatigue', 'Edema'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'CKD stage 4 secondary to diabetes and hypertension. Declining GFR.',
          'relevantFindings': ['CKD progression', 'Diabetic nephropathy'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Type 2 Diabetes (15 years), Hypertension (20 years)',
          'relevantFindings': ['Long-standing diabetes', 'Hypertension'],
          'clinicalSignificance': 'high'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Father on dialysis',
          'relevantFindings': ['Family history of ESRD'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Retired accountant, married',
          'relevantFindings': ['Good support system'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 8: Major Depressive Disorder
  'EHR008': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR008',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:H8S2U7',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['PSYCH-MDD-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW',
        'sensitiveCategory': 'mental-health'
      },
      'demographicsNode': {
        'pseudonymId': 'H8S2U7',
        'ageBand': '25-34',
        'biologicalSex': 'male',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2024-Q1'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'F33.1',
          'system': 'ICD-10-GM',
          'display': 'Major depressive disorder, recurrent, moderate',
          'onsetPeriod': '2021'
        },
        'comorbidities': [
          { 'code': 'F41.1', 'system': 'ICD-10-GM', 'display': 'Generalized anxiety disorder' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal',
          'phq9ScoreRange': '10-14'
        },
        'labResults': []
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'N06AB06', 'system': 'ATC', 'display': 'Sertraline', 'durationCategory': '1-2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.88
      },
      'clinicalTrialNode': {
        'phase': 'Phase II',
        'phaseCode': 'C15601',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Reduction in PHQ-9 score',
        'euCtNumber': '2024-508901-23-DE',
        'sponsor': { 'name': 'PsychoPharm Research', 'type': 'commercial', 'country': 'UK' },
        'therapeuticArea': { 'code': 'PSYCHIATRY', 'name': 'Psychiatry' },
        'investigationalProduct': { 'name': 'PP-MDD-2024', 'atcCode': 'N06AX' },
        'memberStatesConcerned': ['DE', 'UK', 'NL']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10037175',
          'name': 'Psychiatric disorders',
          'abbreviation': 'Psych'
        },
        'preferredTerm': {
          'code': '10025482',
          'name': 'Major depression',
          'hltCode': '10012303'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-008-001',
            'medDRAPT': 'Insomnia',
            'medDRACode': '10022437',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'N06AB06',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Persistent low mood and loss of interest',
          'relevantFindings': ['Anhedonia', 'Depressed mood'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Recurrent episodes since 20s. Current episode started 3 months ago.',
          'relevantFindings': ['Recurrent MDD', 'Current episode moderate'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Generalized Anxiety Disorder',
          'relevantFindings': ['GAD'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Mother with depression',
          'relevantFindings': ['Family history of depression'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Unemployed, single, lives alone',
          'relevantFindings': ['Social isolation', 'Unemployment'],
          'clinicalSignificance': 'high'
        }
      }
    }
  },

  // Patient 9: Parkinson's Disease
  'EHR009': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR009',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:I4T9V3',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['NEURO-PD-2025', 'PD-DBS-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'I4T9V3',
        'ageBand': '65-74',
        'biologicalSex': 'male',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2021-Q3'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'G20',
          'system': 'ICD-10-GM',
          'display': "Parkinson's disease",
          'onsetPeriod': '2018'
        },
        'comorbidities': [
          { 'code': 'G47.3', 'system': 'ICD-10-GM', 'display': 'Sleep apnea' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'orthostatic-hypotension',
          'updrsScoreRange': '25-35'
        },
        'labResults': []
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'N04BA02', 'system': 'ATC', 'display': 'Levodopa + Carbidopa', 'durationCategory': '>2-years' },
          { 'code': 'N04BC05', 'system': 'ATC', 'display': 'Pramipexole', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.90
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15602',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Improvement in motor function',
        'euCtNumber': '2024-509012-34-DE',
        'sponsor': { 'name': 'NeuroDegenerative Research', 'type': 'academic', 'country': 'DE' },
        'therapeuticArea': { 'code': 'NEUROLOGY', 'name': 'Neurology' },
        'investigationalProduct': { 'name': 'ND-PD-2024', 'atcCode': 'N04BA' },
        'memberStatesConcerned': ['DE', 'FR']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10029205',
          'name': 'Nervous system disorders',
          'abbreviation': 'Nerv'
        },
        'preferredTerm': {
          'code': '10033991',
          'name': "Parkinson's disease",
          'hltCode': '10034010'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-009-001',
            'medDRAPT': 'Nausea',
            'medDRACode': '10028813',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'N04BA02',
            'relatedness': 'probable',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Tremor in right hand and slowness of movement',
          'relevantFindings': ['Resting tremor', 'Bradykinesia'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Diagnosed 3 years ago. Symptoms worsening despite medication.',
          'relevantFindings': ['Progressive symptoms', 'Motor fluctuations'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Sleep apnea',
          'relevantFindings': ['OSA'],
          'clinicalSignificance': 'low'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'No family history of PD',
          'relevantFindings': ['None'],
          'clinicalSignificance': 'low'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Retired engineer, married',
          'relevantFindings': ['Supportive spouse'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 10: Inflammatory Bowel Disease (Crohn's)
  'EHR010': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR010',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:J6U1X8',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['GI-IBD-2025', 'CROHN-BIO-2025'],
      'consentScope': {
        'purposes': ['clinical-research', 'registry-participation'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications', 'procedures'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'J6U1X8',
        'ageBand': '25-34',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2023-Q2'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'K50.9',
          'system': 'ICD-10-GM',
          'display': "Crohn's disease, unspecified",
          'onsetPeriod': '2019'
        },
        'comorbidities': [
          { 'code': 'K51.9', 'system': 'ICD-10-GM', 'display': 'Ulcerative colitis' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'underweight',
          'bloodPressureCategory': 'normal',
          'cdaiScoreRange': '150-220'
        },
        'labResults': [
          { 'code': '1988-5', 'display': 'CRP', 'valueRange': '15-30 mg/L', 'interpretation': 'elevated' },
          { 'code': '16551-0', 'display': 'Fecal calprotectin', 'valueRange': '200-500 µg/g', 'interpretation': 'elevated' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'L04AB04', 'system': 'ATC', 'display': 'Adalimumab', 'durationCategory': '1-2-years' },
          { 'code': 'A07EA06', 'system': 'ATC', 'display': 'Budesonide', 'durationCategory': '<1-year' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.91
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15602',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Clinical remission (CDAI < 150)',
        'euCtNumber': '2024-509123-45-DE',
        'sponsor': { 'name': 'GastroHealth Solutions', 'type': 'commercial', 'country': 'DE' },
        'therapeuticArea': { 'code': 'GASTROENTEROLOGY', 'name': 'Gastroenterology' },
        'investigationalProduct': { 'name': 'GH-IBD-2024', 'atcCode': 'A07EA' },
        'memberStatesConcerned': ['DE', 'FR', 'IT']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10017947',
          'name': 'Gastrointestinal disorders',
          'abbreviation': 'Gastro'
        },
        'preferredTerm': {
          'code': '10011401',
          'name': "Crohn's disease",
          'hltCode': '10011404'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-010-001',
            'medDRAPT': 'Abdominal pain',
            'medDRACode': '10000081',
            'severity': 'moderate',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'L04AB04',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Abdominal pain and diarrhea',
          'relevantFindings': ['Abdominal pain', 'Diarrhea'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Diagnosed 5 years ago. Recent flare with increased stool frequency.',
          'relevantFindings': ["Crohn's flare", 'Increased stool frequency'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Appendectomy',
          'relevantFindings': ['Appendectomy'],
          'clinicalSignificance': 'low'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Sister with ulcerative colitis',
          'relevantFindings': ['Family history of IBD'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Teacher, non-smoker',
          'relevantFindings': ['Stressful job'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 11: Epilepsy (Refractory)
  'EHR011': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR011',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:K7A2Z9',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['NEURO-EPI-2025', 'ANTIEPILEPTIC-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'K7A2Z9',
        'ageBand': '18-24',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2024-Q2'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'G40.3',
          'system': 'ICD-10-GM',
          'display': 'Generalized idiopathic epilepsy and epileptic syndromes',
          'onsetPeriod': '2015'
        },
        'comorbidities': []
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal',
          'seizureFrequency': '2-3/month'
        },
        'labResults': [
          { 'code': '30385-9', 'display': 'Lamotrigine level', 'valueRange': '3-14 µg/mL', 'interpretation': 'therapeutic' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'N03AX09', 'system': 'ATC', 'display': 'Lamotrigine', 'durationCategory': '>2-years' },
          { 'code': 'N03AX14', 'system': 'ATC', 'display': 'Levetiracetam', 'durationCategory': '1-2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.94
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15602',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Reduction in seizure frequency',
        'euCtNumber': '2024-511234-56-DE',
        'sponsor': { 'name': 'NordPharma AG', 'type': 'commercial', 'country': 'DE' },
        'therapeuticArea': { 'code': 'NEUROLOGY', 'name': 'Neurology' },
        'investigationalProduct': { 'name': 'NP-EPI-2024', 'atcCode': 'N03AX' },
        'memberStatesConcerned': ['DE', 'FR', 'NL', 'ES', 'IT', 'BE']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10029205',
          'name': 'Nervous system disorders',
          'abbreviation': 'Nerv'
        },
        'preferredTerm': {
          'code': '10015037',
          'name': 'Epilepsy',
          'hltCode': '10015040'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-011-001',
            'medDRAPT': 'Dizziness',
            'medDRACode': '10013573',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q3',
            'suspectedDrug': 'N03AX09',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Increased seizure frequency despite medication',
          'relevantFindings': ['Seizure breakthrough', 'Fatigue'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Diagnosed 10 years ago; generalized tonic-clonic seizures. Recently more frequent.',
          'relevantFindings': ['Long-standing epilepsy', 'Recent worsening'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Febrile seizures as a child',
          'relevantFindings': ['Childhood seizures'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Uncle with epilepsy',
          'relevantFindings': ['Family history of epilepsy'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Student, lives in shared apartment, non-smoker',
          'relevantFindings': ['Student stress', 'Regular sleep schedule important'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 12: Systemic Lupus Erythematosus (SLE)
  'EHR012': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR012',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:L8B4U2',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['RHEUM-SLE-2025', 'BIOLOGICS-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'L8B4U2',
        'ageBand': '35-44',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2024-Q1'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'M32.1',
          'system': 'ICD-10-GM',
          'display': 'Systemic lupus erythematosus with organ involvement',
          'onsetPeriod': '2020'
        },
        'comorbidities': [
          { 'code': 'N04.0', 'system': 'ICD-10-GM', 'display': 'Nephrotic syndrome' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'elevated',
          'heartRate': '78/min'
        },
        'labResults': [
          { 'code': '50993-8', 'display': 'Anti-dsDNA', 'valueRange': '>100 IU/mL', 'interpretation': 'high' },
          { 'code': '63482-4', 'display': 'C3/C4 Complement', 'valueRange': 'low', 'interpretation': 'low' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'L04AA13', 'system': 'ATC', 'display': 'Belimumab', 'durationCategory': '1-2-years' },
          { 'code': 'P01BA02', 'system': 'ATC', 'display': 'Hydroxychloroquine', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.93
      },
      'clinicalTrialNode': {
        'phase': 'Phase II',
        'phaseCode': 'C15601',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Reduction in proteinuria',
        'euCtNumber': '2024-512345-67-DE',
        'sponsor': { 'name': 'Charité Forschung GmbH', 'type': 'academic', 'country': 'DE' },
        'therapeuticArea': { 'code': 'RHEUMATOLOGY', 'name': 'Rheumatology' },
        'investigationalProduct': { 'name': 'CF-SLE-2024', 'atcCode': 'L04AA' },
        'memberStatesConcerned': ['DE', 'FR']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10028395',
          'name': 'Musculoskeletal and connective tissue disorders',
          'abbreviation': 'Musc'
        },
        'preferredTerm': {
          'code': '10042963',
          'name': 'Systemic lupus erythematosus',
          'hltCode': '10042966'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-012-001',
            'medDRAPT': 'Nausea',
            'medDRACode': '10028813',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'L04AA06',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Joint pain and fatigue, butterfly rash',
          'relevantFindings': ['Arthralgia', 'Malar rash', 'Fatigue'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Diagnosed 5 years ago. Recent flare with increased proteinuria.',
          'relevantFindings': ['SLE flare', 'Proteinuria'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'History of pericarditis',
          'relevantFindings': ['Pericarditis'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Sister with rheumatoid arthritis',
          'relevantFindings': ['Family history of autoimmune disease'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Teacher, non-smoker, occasional alcohol',
          'relevantFindings': ['Stressful job'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 13: Atrial Fibrillation with Stroke Risk
  'EHR013': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR013',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:M2X8B6',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['CARDIO-AFIB-2025', 'STROKE-PREV-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'M2X8B6',
        'ageBand': '75-84',
        'biologicalSex': 'male',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2023-Q3'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'I48.91',
          'system': 'ICD-10-GM',
          'display': 'Atrial fibrillation, unspecified',
          'onsetPeriod': '2020'
        },
        'comorbidities': [
          { 'code': 'I10', 'system': 'ICD-10-GM', 'display': 'Essential hypertension' },
          { 'code': 'E11.9', 'system': 'ICD-10-GM', 'display': 'Type 2 diabetes mellitus' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'overweight',
          'bloodPressureCategory': 'controlled',
          'cha2ds2vascScore': '4'
        },
        'labResults': [
          { 'code': '6301-6', 'display': 'INR', 'valueRange': '2.0-3.0', 'interpretation': 'therapeutic' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'B01AF01', 'system': 'ATC', 'display': 'Rivaroxaban', 'durationCategory': '>2-years' },
          { 'code': 'C07AB07', 'system': 'ATC', 'display': 'Bisoprolol', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.89
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15603',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Reduction in stroke risk',
        'euCtNumber': '2024-513456-78-DE',
        'sponsor': { 'name': 'CardioVasc Global Inc.', 'type': 'commercial', 'country': 'US' },
        'therapeuticArea': { 'code': 'CARDIOLOGY', 'name': 'Cardiology' },
        'investigationalProduct': { 'name': 'CV-AFIB-2024', 'atcCode': 'B01AF' },
        'memberStatesConcerned': ['DE', 'FR', 'IT', 'ES']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10007541',
          'name': 'Cardiac disorders',
          'abbreviation': 'Card'
        },
        'preferredTerm': {
          'code': '10003658',
          'name': 'Atrial fibrillation',
          'hltCode': '10003662'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-013-001',
            'medDRAPT': 'Epistaxis',
            'medDRACode': '10015091',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'B01AF01',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Palpitations and mild shortness of breath',
          'relevantFindings': ['Palpitations', 'Dyspnea'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Diagnosed with AFib 3 years ago. Currently on anticoagulation.',
          'relevantFindings': ['Atrial fibrillation', 'Anticoagulation therapy'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Hypertension, Type 2 Diabetes',
          'relevantFindings': ['Hypertension', 'T2DM'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Father had a stroke at 70',
          'relevantFindings': ['Family history of stroke'],
          'clinicalSignificance': 'high'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Retired, lives with spouse, non-smoker',
          'relevantFindings': ['Good social support'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 14: Asthma (Severe Persistent)
  'EHR014': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR014',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:N9Y5C4',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['RESP-ASTHMA-2025', 'BIOLOGIC-ASTHMA-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'N9Y5C4',
        'ageBand': '35-44',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2023-Q1'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'J45.50',
          'system': 'ICD-10-GM',
          'display': 'Severe persistent asthma, uncomplicated',
          'onsetPeriod': '2010'
        },
        'comorbidities': [
          { 'code': 'J30.1', 'system': 'ICD-10-GM', 'display': 'Allergic rhinitis' },
          { 'code': 'L20.9', 'system': 'ICD-10-GM', 'display': 'Atopic dermatitis' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'overweight',
          'bloodPressureCategory': 'normal',
          'fev1Range': '60-70%',
          'actScoreRange': '15-19'
        },
        'labResults': [
          { 'code': '26449-9', 'display': 'Total IgE', 'valueRange': '300-500 IU/mL', 'interpretation': 'elevated' },
          { 'code': '713-8', 'display': 'Eosinophils', 'valueRange': '400-600/µL', 'interpretation': 'elevated' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'R03DX05', 'system': 'ATC', 'display': 'Omalizumab', 'durationCategory': '1-2-years' },
          { 'code': 'R03AK06', 'system': 'ATC', 'display': 'Fluticasone/Salmeterol', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.92
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15602',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Reduction in exacerbations',
        'euCtNumber': '2024-514567-89-DE',
        'sponsor': { 'name': 'BioMedTech Europa SE', 'type': 'commercial', 'country': 'NL' },
        'therapeuticArea': { 'code': 'PULMONOLOGY', 'name': 'Pulmonology' },
        'investigationalProduct': { 'name': 'BMT-ASTHMA-2024', 'atcCode': 'R03DX' },
        'memberStatesConcerned': ['DE', 'FR', 'NL', 'ES', 'IT', 'BE']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10038738',
          'name': 'Respiratory, thoracic and mediastinal disorders',
          'abbreviation': 'Resp'
        },
        'preferredTerm': {
          'code': '10003553',
          'name': 'Asthma',
          'hltCode': '10003556'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-014-001',
            'medDRAPT': 'Oropharyngeal pain',
            'medDRACode': '10031068',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'R03AK06',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Shortness of breath and wheezing, especially at night',
          'relevantFindings': ['Dyspnea', 'Wheezing', 'Nocturnal symptoms'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Severe asthma since childhood. Frequent exacerbations despite high-dose ICS/LABA.',
          'relevantFindings': ['Severe asthma', 'Frequent exacerbations'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Allergic rhinitis, eczema',
          'relevantFindings': ['Atopic history'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Mother with asthma',
          'relevantFindings': ['Family history of asthma'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Office worker, non-smoker, has a cat',
          'relevantFindings': ['Pet exposure'],
          'clinicalSignificance': 'moderate'
        }
      }
    }
  },

  // Patient 15: Prostate Cancer
  'EHR015': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR015',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:O7Z3D1',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['ONCO-PROSTATE-2025', 'CANCER-SURV-2025'],
      'consentScope': {
        'purposes': ['clinical-research', 'cancer-registry'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'procedures'],
        'retentionPeriod': '15-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'O7Z3D1',
        'ageBand': '65-74',
        'biologicalSex': 'male',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2022-Q4'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'C61',
          'system': 'ICD-10-GM',
          'display': 'Malignant neoplasm of prostate',
          'onsetPeriod': '2022',
          'gleasonScore': '3+4=7'
        },
        'comorbidities': [
          { 'code': 'N40', 'system': 'ICD-10-GM', 'display': 'Benign prostatic hyperplasia' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal'
        },
        'labResults': [
          { 'code': '2857-1', 'display': 'PSA', 'valueRange': '0.1-0.5 ng/mL', 'interpretation': 'undetectable-post-treatment' }
        ]
      },
      'proceduresNode': {
        'historicalProcedures': [
          { 'code': '0VT00ZZ', 'system': 'ICD-10-PCS', 'display': 'Radical prostatectomy', 'periodPerformed': '2023-Q1' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': []
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.95
      },
      'clinicalTrialNode': {
        'phase': 'Phase IV',
        'phaseCode': 'C15604',
        'studyType': 'observational',
        'interventionModel': 'single-group',
        'primaryEndpoint': 'Quality of life assessment',
        'euCtNumber': '2024-515678-90-DE',
        'sponsor': { 'name': 'OncoLife Research', 'type': 'academic', 'country': 'DE' },
        'therapeuticArea': { 'code': 'ONCOLOGY', 'name': 'Oncology' },
        'investigationalProduct': { 'name': 'N/A (Observational)', 'atcCode': 'N/A' },
        'memberStatesConcerned': ['DE']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10029104',
          'name': 'Neoplasms benign, malignant and unspecified',
          'abbreviation': 'Neopl'
        },
        'preferredTerm': {
          'code': '10036900',
          'name': 'Prostate cancer',
          'hltCode': '10036905'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-015-001',
            'medDRAPT': 'Urinary incontinence',
            'medDRACode': '10046543',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovering',
            'onsetPeriod': '2023-Q2',
            'suspectedDrug': 'N/A',
            'relatedness': 'unlikely',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Routine follow-up after prostatectomy',
          'relevantFindings': ['Post-prostatectomy', 'Asymptomatic'],
          'clinicalSignificance': 'low'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Diagnosed 3 years ago. Radical prostatectomy. PSA undetectable.',
          'relevantFindings': ['Prostate cancer history', 'Remission'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Benign Prostatic Hyperplasia (prior to cancer)',
          'relevantFindings': ['BPH'],
          'clinicalSignificance': 'low'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Father with prostate cancer',
          'relevantFindings': ['Family history of prostate cancer'],
          'clinicalSignificance': 'high'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Retired, active lifestyle',
          'relevantFindings': ['Good quality of life'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 16: Osteoporosis with Fracture History
  'EHR016': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR016',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:P4A9E5',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['BONE-OSTEO-2025', 'FRACTURE-PREV-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'P4A9E5',
        'ageBand': '75-84',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2023-Q4'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'M81.0',
          'system': 'ICD-10-GM',
          'display': 'Postmenopausal osteoporosis with pathological fracture',
          'onsetPeriod': '2018'
        },
        'comorbidities': [
          { 'code': 'M80.08', 'system': 'ICD-10-GM', 'display': 'Vertebral fracture' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'underweight',
          'bloodPressureCategory': 'normal',
          'tScoreRange': '-3.0 to -2.5'
        },
        'labResults': [
          { 'code': '1968-7', 'display': 'Vitamin D', 'valueRange': '20-30 ng/mL', 'interpretation': 'low-normal' },
          { 'code': '17861-6', 'display': 'Calcium', 'valueRange': '8.5-10.0 mg/dL', 'interpretation': 'normal' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'M05BA07', 'system': 'ATC', 'display': 'Risedronate', 'durationCategory': '>2-years' },
          { 'code': 'A11CC05', 'system': 'ATC', 'display': 'Colecalciferol', 'durationCategory': '>2-years' },
          { 'code': 'A12AA', 'system': 'ATC', 'display': 'Calcium supplements', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.90
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15603',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Increase in bone mineral density',
        'euCtNumber': '2024-516789-01-DE',
        'sponsor': { 'name': 'OsteoPharma GmbH', 'type': 'commercial', 'country': 'DE' },
        'therapeuticArea': { 'code': 'RHEUMATOLOGY', 'name': 'Rheumatology' },
        'investigationalProduct': { 'name': 'OP-BONE-2024', 'atcCode': 'M05BX' },
        'memberStatesConcerned': ['DE', 'AT', 'CH']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10028395',
          'name': 'Musculoskeletal and connective tissue disorders',
          'abbreviation': 'Musc'
        },
        'preferredTerm': {
          'code': '10031282',
          'name': 'Osteoporosis',
          'hltCode': '10031285'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-016-001',
            'medDRAPT': 'Dyspepsia',
            'medDRACode': '10013946',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'M05BA07',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Back pain and fear of falling',
          'relevantFindings': ['Back pain', 'Fall risk'],
          'clinicalSignificance': 'moderate'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Diagnosed 5 years ago after vertebral fracture. On bisphosphonates.',
          'relevantFindings': ['Osteoporosis', 'Prior fracture'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Early menopause',
          'relevantFindings': ['Early menopause'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Mother with hip fracture',
          'relevantFindings': ['Family history of osteoporosis'],
          'clinicalSignificance': 'high'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Widowed, lives alone, uses walking aid',
          'relevantFindings': ['Mobility aid'],
          'clinicalSignificance': 'moderate'
        }
      }
    }
  },

  // Patient 17: Type 1 Diabetes with Insulin Pump
  'EHR017': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR017',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:Q1B6F8',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['ENDO-T1D-2025', 'TECH-PUMP-2025'],
      'consentScope': {
        'purposes': ['clinical-research', 'device-registry'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'devices'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'Q1B6F8',
        'ageBand': '25-34',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2024-Q1'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'E10.9',
          'system': 'ICD-10-GM',
          'display': 'Type 1 diabetes mellitus without complications',
          'onsetPeriod': '2008'
        },
        'comorbidities': [
          { 'code': 'E03.9', 'system': 'ICD-10-GM', 'display': 'Hypothyroidism, unspecified' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal',
          'hba1cRange': '6.5-7.0%',
          'timeInRangePercent': '70-80%'
        },
        'labResults': [
          { 'code': '4548-4', 'display': 'HbA1c', 'valueRange': '6.5-7.0%', 'interpretation': 'target' }
        ]
      },
      'devicesNode': {
        'activeDevices': [
          { 'type': 'Insulin Pump', 'manufacturer': 'anonymized', 'startPeriod': '2022-Q1' },
          { 'type': 'CGM', 'manufacturer': 'anonymized', 'startPeriod': '2021-Q3' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'A10AB05', 'system': 'ATC', 'display': 'Insulin aspart', 'durationCategory': '>2-years' },
          { 'code': 'H03AA01', 'system': 'ATC', 'display': 'Levothyroxine', 'durationCategory': '>2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.96
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15603',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Improvement in Time in Range',
        'euCtNumber': '2024-517890-12-DE',
        'sponsor': { 'name': 'DiabetesTech Solutions', 'type': 'commercial', 'country': 'US' },
        'therapeuticArea': { 'code': 'ENDOCRINOLOGY', 'name': 'Endocrinology' },
        'investigationalProduct': { 'name': 'DT-PUMP-2024', 'atcCode': 'A10AB' },
        'memberStatesConcerned': ['DE', 'FR', 'UK']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10014698',
          'name': 'Endocrine disorders',
          'abbreviation': 'Endo'
        },
        'preferredTerm': {
          'code': '10012601',
          'name': 'Diabetes mellitus type 1',
          'hltCode': '10012604'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-017-001',
            'medDRAPT': 'Hypoglycaemia',
            'medDRACode': '10021005',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'A10AB05',
            'relatedness': 'probable',
            'expectedness': 'expected',
            'actionTaken': 'dose-adjusted'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Glycemic variability',
          'relevantFindings': ['Glucose fluctuations'],
          'clinicalSignificance': 'moderate'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'T1D since childhood. Using pump and CGM. Seeking better control.',
          'relevantFindings': ['T1D', 'Pump therapy'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Hypothyroidism',
          'relevantFindings': ['Hypothyroidism'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Father with T2D',
          'relevantFindings': ['Family history of diabetes'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Architect, active lifestyle',
          'relevantFindings': ['Active'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 18: Hepatitis C (Cured)
  'EHR018': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR018',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:R8C2G7',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['HEPATO-HCV-2025', 'LIVER-FIBROSIS-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'R8C2G7',
        'ageBand': '55-64',
        'biologicalSex': 'male',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2022-Q3'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'B18.2',
          'system': 'ICD-10-GM',
          'display': 'Chronic viral hepatitis C',
          'onsetPeriod': '2005',
          'clinicalStatus': 'resolved'
        },
        'comorbidities': [
          { 'code': 'K74.0', 'system': 'ICD-10-GM', 'display': 'Hepatic fibrosis' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal',
          'fibroscanScore': 'F2'
        },
        'labResults': [
          { 'code': 'HCV-RNA', 'display': 'HCV RNA', 'valueRange': 'undetectable', 'interpretation': 'SVR-achieved' },
          { 'code': '1742-6', 'display': 'ALT', 'valueRange': '20-40 U/L', 'interpretation': 'normal' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': []
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.91
      },
      'clinicalTrialNode': {
        'phase': 'Phase IV',
        'phaseCode': 'C15604',
        'studyType': 'observational',
        'interventionModel': 'single-group',
        'primaryEndpoint': 'Long-term liver fibrosis regression',
        'euCtNumber': '2024-518901-23-DE',
        'sponsor': { 'name': 'HepatoResearch Institute', 'type': 'academic', 'country': 'DE' },
        'therapeuticArea': { 'code': 'HEPATOLOGY', 'name': 'Hepatology' },
        'investigationalProduct': { 'name': 'N/A (Post-SVR)', 'atcCode': 'N/A' },
        'memberStatesConcerned': ['DE']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10019805',
          'name': 'Hepatobiliary disorders',
          'abbreviation': 'Hep'
        },
        'preferredTerm': {
          'code': '10008552',
          'name': 'Chronic hepatitis C',
          'hltCode': '10019812'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Routine follow-up post-HCV cure',
          'relevantFindings': ['Asymptomatic'],
          'clinicalSignificance': 'low'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Treated with DAAs 3 years ago. SVR achieved. Monitoring fibrosis.',
          'relevantFindings': ['HCV cured', 'Residual fibrosis'],
          'clinicalSignificance': 'moderate'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'History of IV drug use (remote)',
          'relevantFindings': ['Past IVDU'],
          'clinicalSignificance': 'low'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'No liver disease in family',
          'relevantFindings': ['None'],
          'clinicalSignificance': 'low'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Employed, sober for 20 years',
          'relevantFindings': ['Stable social situation'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },

  // Patient 19: Migraine Chronic
  'EHR019': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR019',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:S5D8H3',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['NEURO-MIGRAINE-2025', 'CGRP-STUDY-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW'
      },
      'demographicsNode': {
        'pseudonymId': 'S5D8H3',
        'ageBand': '35-44',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2024-Q2'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'G43.909',
          'system': 'ICD-10-GM',
          'display': 'Migraine, unspecified, not intractable',
          'onsetPeriod': '2015',
          'migraineType': 'chronic'
        },
        'comorbidities': []
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal',
          'migraineDaysPerMonth': '10-15'
        },
        'labResults': []
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'N02CC01', 'system': 'ATC', 'display': 'Sumatriptan', 'durationCategory': '>2-years' },
          { 'code': 'N02CX', 'system': 'ATC', 'display': 'Erenumab', 'durationCategory': '<1-year' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.87
      },
      'clinicalTrialNode': {
        'phase': 'Phase III',
        'phaseCode': 'C15603',
        'studyType': 'interventional',
        'interventionModel': 'parallel',
        'primaryEndpoint': 'Reduction in monthly migraine days',
        'euCtNumber': '2024-519012-34-DE',
        'sponsor': { 'name': 'NeuroPain Solutions', 'type': 'commercial', 'country': 'CH' },
        'therapeuticArea': { 'code': 'NEUROLOGY', 'name': 'Neurology' },
        'investigationalProduct': { 'name': 'NP-MIG-2024', 'atcCode': 'N02CX' },
        'memberStatesConcerned': ['DE', 'AT', 'CH']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10029205',
          'name': 'Nervous system disorders',
          'abbreviation': 'Nerv'
        },
        'preferredTerm': {
          'code': '10027599',
          'name': 'Migraine',
          'hltCode': '10027602'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-019-001',
            'medDRAPT': 'Constipation',
            'medDRACode': '10010774',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'recovered',
            'onsetPeriod': '2024-Q4',
            'suspectedDrug': 'N02CX',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Frequent headaches with nausea',
          'relevantFindings': ['Headache', 'Nausea', 'Photophobia'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Chronic migraine for 10 years. Failed multiple preventives. Responding to CGRP.',
          'relevantFindings': ['Chronic migraine', 'Treatment resistant'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Depression (mild)',
          'relevantFindings': ['Depression'],
          'clinicalSignificance': 'moderate'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Mother with migraines',
          'relevantFindings': ['Family history of migraine'],
          'clinicalSignificance': 'moderate'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Teacher, high stress',
          'relevantFindings': ['Stress'],
          'clinicalSignificance': 'moderate'
        }
      }
    }
  },

  // Patient 20: HIV on ART (Well-controlled)
  'EHR020': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR020',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:T2E4I9',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['HIV-OUTCOMES-2025'],
      'consentScope': {
        'purposes': ['clinical-research'],
        'dataCategories': ['demographics', 'conditions', 'observations', 'medications'],
        'retentionPeriod': '10-years',
        'jurisdiction': 'DE-NW',
        'sensitiveCategory': 'infectious-disease'
      },
      'demographicsNode': {
        'pseudonymId': 'T2E4I9',
        'ageBand': '45-54',
        'biologicalSex': 'male',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2021-Q2'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'B20',
          'system': 'ICD-10-GM',
          'display': 'HIV disease',
          'onsetPeriod': '2012',
          'clinicalStatus': 'controlled'
        },
        'comorbidities': [
          { 'code': 'E78.0', 'system': 'ICD-10-GM', 'display': 'Pure hypercholesterolemia' }
        ]
      },
      'observationsNode': {
        'latestVitals': {
          'recordPeriod': '2025-Q3',
          'bmiCategory': 'normal',
          'bloodPressureCategory': 'normal',
          'cd4CountRange': '>500 cells/µL',
          'viralLoadStatus': 'undetectable'
        },
        'labResults': [
          { 'code': '24467-3', 'display': 'CD4 count', 'valueRange': '>500 cells/µL', 'interpretation': 'normal' },
          { 'code': 'HIV-RNA', 'display': 'HIV RNA', 'valueRange': '<20 copies/mL', 'interpretation': 'undetectable' }
        ]
      },
      'medicationsNode': {
        'activeTherapies': [
          { 'code': 'J05AR13', 'system': 'ATC', 'display': 'Bictegravir/Emtricitabine/TAF', 'durationCategory': '>2-years' },
          { 'code': 'C10AA05', 'system': 'ATC', 'display': 'Atorvastatin', 'durationCategory': '1-2-years' }
        ]
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-EHR-v4',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.94
      },
      'clinicalTrialNode': {
        'phase': 'Phase IV',
        'phaseCode': 'C15604',
        'studyType': 'observational',
        'interventionModel': 'single-group',
        'primaryEndpoint': 'Long-term viral suppression',
        'euCtNumber': '2024-520123-45-DE',
        'sponsor': { 'name': 'Virology Research Group', 'type': 'academic', 'country': 'DE' },
        'therapeuticArea': { 'code': 'INFECTIOUS_DISEASES', 'name': 'Infectious Diseases' },
        'investigationalProduct': { 'name': 'N/A (Observational)', 'atcCode': 'N/A' },
        'memberStatesConcerned': ['DE']
      },
      'medDRANode': {
        'version': '27.0',
        'primarySOC': {
          'code': '10021881',
          'name': 'Infections and infestations',
          'abbreviation': 'Infec'
        },
        'preferredTerm': {
          'code': '10019976',
          'name': 'HIV infection',
          'hltCode': '10019980'
        }
      },
      'signalVerificationNode': {
        'adverseEvents': [
          {
            'id': 'AE-020-001',
            'medDRAPT': 'Fatigue',
            'medDRACode': '10016256',
            'severity': 'mild',
            'seriousness': ['non-serious'],
            'outcome': 'not-recovered',
            'onsetPeriod': '2024-Q3',
            'suspectedDrug': 'J05AR13',
            'relatedness': 'possible',
            'expectedness': 'expected',
            'actionTaken': 'none'
          }
        ],
        'signalStatus': {
          'hasActiveSignal': false,
          'signalCategory': 'monitored',
          'lastReviewDate': '2025-10'
        },
        'reportingStatus': 'not-required'
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Hauptbeschwerde',
          'summary': 'Routine follow-up',
          'relevantFindings': ['Asymptomatic'],
          'clinicalSignificance': 'low'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'HIV positive for 13 years. Undetectable viral load for >10 years.',
          'relevantFindings': ['HIV controlled', 'Long-term suppression'],
          'clinicalSignificance': 'high'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Hypercholesterolemia',
          'relevantFindings': ['Hyperlipidemia'],
          'clinicalSignificance': 'low'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'No significant family history',
          'relevantFindings': ['None'],
          'clinicalSignificance': 'low'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Office manager, single',
          'relevantFindings': ['Stable employment'],
          'clinicalSignificance': 'low'
        }
      }
    }
  },
  'EHR021': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    'id': 'did:web:rheinland-uklinikum.de:ehr:EHR021',
    'type': ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    'issuer': 'did:web:rheinland-uklinikum.de',
    'issuanceDate': '2025-11-01T10:00:00Z',
    'credentialSubject': {
      'id': 'did:web:rheinland-uklinikum.de:patient:pseudonym:GEN021',
      'resourceType': 'Bundle',
      'type': 'collection',
      'studyEligibility': ['GEN-RARE-2025'],
      'consentScope': {
        'purposes': ['clinical-research', 'genetic-research'],
        'dataCategories': ['demographics', 'conditions', 'genomics'],
        'retentionPeriod': '20-years',
        'jurisdiction': 'DE'
      },
      'demographicsNode': {
        'pseudonymId': 'GEN021',
        'ageBand': '18-24',
        'biologicalSex': 'female',
        'region': 'Nordrhein-Westfalen',
        'enrollmentPeriod': '2024-Q1'
      },
      'conditionsNode': {
        'primaryDiagnosis': {
          'code': 'Q99.9',
          'system': 'ICD-10-GM',
          'display': 'Chromosomal abnormality, unspecified',
          'onsetPeriod': '2024'
        },
        'comorbidities': []
      },
      'provenanceNode': {
        'sourceSystem': 'Rheinland-UK-Genomics-v1',
        'extractionDate': '2025-11',
        'deIdentificationMethod': 'k-anonymity-k5',
        'qualityScore': 0.98
      },
      'entry': [
        {
          'resource': {
            'resourceType': 'Patient',
            'id': 'GEN021',
            'gender': 'female',
            'birthDate': '2001',
            'address': [{'country': 'DE', 'state': 'NW'}]
          }
        },
        {
          'resource': {
            'resourceType': 'Condition',
            'code': {
              'coding': [{'system': 'http://hl7.org/fhir/sid/icd-10', 'code': 'Q99.9', 'display': 'Chromosomal abnormality, unspecified'}]
            },
            'subject': {'reference': 'Patient/GEN021'}
          }
        }
      ],
      'clinicalTrialNode': {
        'phase': 'Phase I',
        'phaseCode': 'C15600',
        'studyType': 'interventional',
        'interventionModel': 'single-group',
        'protocolId': '2024-GEN-001-DE',
        'euCtNumber': '2024-501234-99-00',
        'sponsor': {
          'name': 'Genomic Research Inst',
          'type': 'academic'
        },
        'status': 'recruiting'
      },
      'medDRANode': {
        'primarySOC': {
          'code': '10010331',
          'name': 'Congenital, familial and genetic disorders'
        },
        'preferredTerm': {
          'code': '10018236',
          'name': 'Genetic disorder'
        }
      },
      'anamnesisNode': {
        'chiefComplaint': {
          'stepNumber': 1,
          'stepName': 'Chief Complaint',
          'stepNameDE': 'Aktuelle Beschwerden',
          'summary': 'Genetic counseling referral',
          'relevantFindings': ['Family history'],
          'clinicalSignificance': 'high'
        },
        'historyOfPresentIllness': {
          'stepNumber': 2,
          'stepName': 'History of Present Illness',
          'stepNameDE': 'Jetzige Anamnese',
          'summary': 'Asymptomatic carrier screening',
          'relevantFindings': ['Carrier status'],
          'clinicalSignificance': 'medium'
        },
        'pastMedicalHistory': {
          'stepNumber': 3,
          'stepName': 'Past Medical History',
          'stepNameDE': 'Eigenanamnese',
          'summary': 'Unremarkable',
          'relevantFindings': ['None'],
          'clinicalSignificance': 'low'
        },
        'familyHistory': {
          'stepNumber': 4,
          'stepName': 'Family History',
          'stepNameDE': 'Familienanamnese',
          'summary': 'Sibling with rare disorder',
          'relevantFindings': ['Positive family history'],
          'clinicalSignificance': 'high'
        },
        'socialHistory': {
          'stepNumber': 5,
          'stepName': 'Social History',
          'stepNameDE': 'Sozialanamnese',
          'summary': 'Student',
          'relevantFindings': ['None'],
          'clinicalSignificance': 'low'
        }
      }
    }
  }
};

// EHR catalog summary
const ehrCatalog = Object.entries(healthRecords).map(([id, record]) => ({
  id,
  pseudonymId: record.credentialSubject.demographicsNode.pseudonymId,
  ageBand: record.credentialSubject.demographicsNode.ageBand,
  biologicalSex: record.credentialSubject.demographicsNode.biologicalSex,
  primaryDiagnosis: record.credentialSubject.conditionsNode.primaryDiagnosis.display,
  icdCode: record.credentialSubject.conditionsNode.primaryDiagnosis.code,
  studyEligibility: record.credentialSubject.studyEligibility,
  consentPurposes: record.credentialSubject.consentScope.purposes,
  qualityScore: record.credentialSubject.provenanceNode.qualityScore
}));

// Dynamic endpoint for any EHR
app.get('/api/ehr/:id', (req: Request, res: Response) => {
  const ehrId = req.params.id;
  const endTimer = measureDataAccess('get_ehr_by_id');
  const record = healthRecords[ehrId];
  
  if (record) {
    logger.info(`Serving EHR record`, {
      correlationId: req.correlationId,
      ehrId,
      diagnosis: record.credentialSubject.conditionsNode.primaryDiagnosis.display,
    });
    recordEhrAccess(ehrId, record.credentialSubject.conditionsNode.primaryDiagnosis.code);
    endTimer();
    res.json(record);
  } else {
    endTimer();
    res.status(404).json({ error: 'Electronic Health Record not found', ehrId });
  }
});

// List all available EHRs
app.get('/api/ehr', (req: Request, res: Response) => {
  const endTimer = measureDataAccess('list_all_ehr');
  logger.info(`Listing all EHR records`, {
    correlationId: req.correlationId,
    count: ehrCatalog.length,
  });
  endTimer();
  res.json({
    totalCount: ehrCatalog.length,
    records: ehrCatalog
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'ehr2edc-backend', recordsCount: ehrCatalog.length });
});

// ============================================================
// HealthDCAT-AP Catalog Endpoint - Single Source of Truth
// ============================================================

/**
 * Serve the HealthDCAT-AP catalog as Turtle (TTL) format.
 * This eliminates drift between the static file and the serializer
 * by serving the canonical resources/health-catalog.ttl file.
 */
app.get('/api/catalog.ttl', (req: Request, res: Response) => {
  // Try multiple paths to find the TTL file (local dev vs Docker)
  const possiblePaths = [
    path.join(__dirname, '../../resources/health-catalog.ttl'),  // From backend-mock/src/
    path.join(__dirname, '../../../resources/health-catalog.ttl'), // Alternative relative path
    '/app/resources/health-catalog.ttl',  // Docker path
    path.resolve(process.cwd(), '../resources/health-catalog.ttl'),  // From backend-mock/
    path.resolve(process.cwd(), 'resources/health-catalog.ttl'),  // From root
  ];
  
  let catalogPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      catalogPath = p;
      break;
    }
  }
  
  if (!catalogPath) {
    console.error(`[${new Date().toISOString()}] GET /api/catalog.ttl - TTL file not found. Searched: ${possiblePaths.join(', ')}`);
    res.status(404).json({ 
      error: 'HealthDCAT-AP catalog not found', 
      searchedPaths: possiblePaths,
      hint: 'Ensure resources/health-catalog.ttl exists'
    });
    return;
  }
  
  try {
    const ttlContent = fs.readFileSync(catalogPath, 'utf-8');
    console.log(`[${new Date().toISOString()}] GET /api/catalog.ttl - Serving ${(ttlContent.length / 1024).toFixed(1)}KB HealthDCAT-AP catalog`);
    res.setHeader('Content-Type', 'text/turtle; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="health-catalog.ttl"');
    res.send(ttlContent);
  } catch (err) {
    const error = err as Error;
    console.error(`[${new Date().toISOString()}] GET /api/catalog.ttl - Error reading TTL: ${error.message}`);
    res.status(500).json({ error: 'Failed to read catalog file', details: error.message });
  }
});

// Catalog metadata endpoint (JSON summary with full HealthDCAT-AP properties)
app.get('/api/catalog', (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] GET /api/catalog - Full HealthDCAT-AP catalog metadata`);
  
  // Build rich dataset metadata from healthRecords
  const datasets = Object.entries(healthRecords).map(([id, record]) => {
    const cs = record.credentialSubject;
    const clinicalTrial = cs.clinicalTrialNode as { phase?: string; phaseCode?: string; studyType?: string; euCtNumber?: string; sponsor?: unknown; therapeuticArea?: unknown; memberStatesConcerned?: string[] } | undefined;
    const medDRA = cs.medDRANode as { version?: string; primarySOC?: unknown; preferredTerm?: { code?: string; name?: string } } | undefined;
    
    return {
      '@id': `http://example.org/dataset/${id}`,
      '@type': 'Dataset',
      'dct:identifier': id,
      'dct:title': `${cs.conditionsNode.primaryDiagnosis.display} - Clinical Study Data`,
      'dct:description': `De-identified EHR data for ${cs.conditionsNode.primaryDiagnosis.display} (${cs.conditionsNode.primaryDiagnosis.code}) from ${clinicalTrial?.phase || 'clinical'} trial`,
      'dct:accessRights': 'NON_PUBLIC',
      // HealthDCAT-AP MANDATORY properties
      'healthdcatap:healthCategory': ['EHR', 'CLINICAL_TRIAL'],
      'healthdcatap:hdab': {
        name: 'Forschungsdatenzentrum Gesundheit (FDZ)',
        homepage: 'https://www.forschungsdatenzentrum-gesundheit.de'
      },
      'dcatap:applicableLegislation': [
        'http://data.europa.eu/eli/reg/2025/327/oj',
        'http://data.europa.eu/eli/reg/2016/679/oj'
      ],
      // Clinical metadata
      diagnosis: {
        display: cs.conditionsNode.primaryDiagnosis.display,
        code: cs.conditionsNode.primaryDiagnosis.code,
        system: 'ICD-10-GM'
      },
      clinicalTrial: clinicalTrial ? {
        phase: clinicalTrial.phase,
        phaseCode: clinicalTrial.phaseCode,
        studyType: clinicalTrial.studyType,
        euCtNumber: clinicalTrial.euCtNumber,
        sponsor: clinicalTrial.sponsor,
        therapeuticArea: clinicalTrial.therapeuticArea,
        memberStates: clinicalTrial.memberStatesConcerned
      } : null,
      medDRA: medDRA ? {
        version: medDRA.version,
        primarySOC: medDRA.primarySOC,
        preferredTerm: medDRA.preferredTerm
      } : null,
      // HealthDCAT-AP RECOMMENDED properties
      'healthdcatap:hasCodeValues': [
        `ICD-10-GM:${cs.conditionsNode.primaryDiagnosis.code}`,
        ...(medDRA?.preferredTerm?.code ? [`MedDRA:${medDRA.preferredTerm.code}`] : [])
      ],
      'healthdcatap:hasCodingSystem': [
        'https://www.wikidata.org/entity/Q15629608',  // ICD-10-GM
        'https://www.wikidata.org/entity/Q1428979'   // MedDRA
      ],
      'healthdcatap:minTypicalAge': parseInt(cs.demographicsNode.ageBand.split('-')[0]) || 18,
      'healthdcatap:maxTypicalAge': parseInt(cs.demographicsNode.ageBand.split('-')[1]) || 99,
      'healthdcatap:populationCoverage': `${cs.demographicsNode.ageBand} age group, ${cs.demographicsNode.biologicalSex} patients with ${cs.conditionsNode.primaryDiagnosis.display}`,
      demographics: {
        ageBand: cs.demographicsNode.ageBand,
        biologicalSex: cs.demographicsNode.biologicalSex
      },
      studyEligibility: cs.studyEligibility,
      consentScope: cs.consentScope.purposes,
      qualityScore: cs.provenanceNode.qualityScore,
      
      // ========================================
      // SENSITIVE DATA (NON_PUBLIC) PROPERTIES
      // HealthDCAT-AP Release 5 Requirements
      // ========================================
      
      // MANDATORY for NON_PUBLIC: Theme (must include HEAL)
      'dcat:theme': [
        'http://publications.europa.eu/resource/authority/data-theme/HEAL',
        'http://eurovoc.europa.eu/2784',  // Clinical medicine
        'http://eurovoc.europa.eu/3885'   // Medical research
      ],
      
      // MANDATORY for NON_PUBLIC: Keywords for discovery
      'dcat:keyword': [
        cs.conditionsNode.primaryDiagnosis.display,
        clinicalTrial?.phase || 'clinical trial',
        cs.demographicsNode.biologicalSex,
        medDRA?.primarySOC ? (medDRA.primarySOC as { name?: string }).name : 'health data',
        'EHR',
        'secondary use',
        'EHDS'
      ].filter(Boolean),
      
      // MANDATORY for NON_PUBLIC: Dataset type
      'dct:type': 'http://publications.europa.eu/resource/authority/dataset-type/PERSONAL_DATA',
      
      // MANDATORY for NON_PUBLIC: Provenance
      'dct:provenance': {
        '@type': 'dct:ProvenanceStatement',
        'rdfs:label': `Electronic Health Records extracted from Rheinland Universitätsklinikum clinical systems under EHDS secondary use framework. Data collected under ethical approval for ${clinicalTrial?.phase || 'clinical'} trial.`,
        'dct:source': 'Hospital Information System (HIS) - Krankenhausinformationssystem'
      },
      
      // MANDATORY for NON_PUBLIC: Contact point
      'dcat:contactPoint': {
        '@type': 'vcard:Kind',
        'vcard:fn': 'Research Data Steward',
        'vcard:hasEmail': 'mailto:forschungsdaten@rheinland-uklinikum.de',
        'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Forschungsdatenmanagement'
      },
      
      // RECOMMENDED for NON_PUBLIC: Personal data categories (DPV taxonomy)
      'dpv:hasPersonalData': [
        'https://w3id.org/dpv/dpv-pd#HealthRecord',
        'https://w3id.org/dpv/dpv-pd#MedicalHealth',
        'https://w3id.org/dpv/dpv-pd#Age',
        'https://w3id.org/dpv/dpv-pd#Gender',
        'https://w3id.org/dpv/dpv-pd#VitalSigns'
      ],
      
      // RECOMMENDED for NON_PUBLIC: Legal basis (GDPR Art. 6 & 9)
      'dpv:hasLegalBasis': [
        'https://w3id.org/dpv/dpv-gdpr#A6-1-a',   // Consent
        'https://w3id.org/dpv/dpv-gdpr#A9-2-j'    // Scientific research
      ],
      
      // RECOMMENDED for NON_PUBLIC: Purpose of processing
      'dpv:hasPurpose': [
        'https://w3id.org/dpv#AcademicResearch',
        'https://w3id.org/dpv#ScientificResearch',
        'https://w3id.org/dpv#ClinicalResearch'
      ],
      
      // RECOMMENDED for NON_PUBLIC: Number of records/individuals
      'healthdcatap:numberOfRecords': Math.floor(Math.random() * 1000) + 100,
      'healthdcatap:numberOfUniqueIndividuals': Math.floor(Math.random() * 500) + 50,
      
      // RECOMMENDED for NON_PUBLIC: Retention period
      'healthdcatap:retentionPeriod': {
        '@type': 'dct:PeriodOfTime',
        'dcat:startDate': '2024-01-01',
        'dcat:endDate': '2034-12-31'
      },
      
      // RECOMMENDED for NON_PUBLIC: Health theme (specific health topics)
      'healthdcatap:healthTheme': [
        medDRA?.primarySOC ? `https://www.wikidata.org/entity/Q${(medDRA.primarySOC as { code?: string }).code?.slice(0,5) || '21169'}` : 'https://www.wikidata.org/entity/Q12136'  // Disease
      ],
      
      // Distribution info
      distribution: {
        '@type': 'dcat:Distribution',
        'dct:title': 'FHIR R4 Bundle Distribution',
        accessURL: `http://localhost:3001/api/ehr/${id}`,
        format: 'application/fhir+json',
        conformsTo: ['http://hl7.org/fhir/R4'],
        'dcatap:applicableLegislation': 'http://data.europa.eu/eli/reg/2025/327/oj'
      }
    };
  });

  res.json({
    '@context': {
      'dcat': 'http://www.w3.org/ns/dcat#',
      'dct': 'http://purl.org/dc/terms/',
      'healthdcatap': 'http://healthdataportal.eu/ns/health#',
      'dcatap': 'http://data.europa.eu/r5r/',
      'foaf': 'http://xmlns.com/foaf/0.1/'
    },
    '@type': 'dcat:Catalog',
    'dct:title': 'MVD Health Demo Catalog - EHR2EDC',
    'dct:description': 'HealthDCAT-AP Release 5 compliant catalog of anonymized Electronic Health Records for secondary use in clinical research. Demonstrates EHDS Regulation (EU) 2025/327 data governance.',
    'dct:conformsTo': [
      'https://healthdataeu.pages.code.europa.eu/healthdcat-ap/releases/release-5/',
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://hl7.org/fhir/R4'
    ],
    'dct:publisher': {
      '@type': 'foaf:Organization',
      'foaf:name': 'Rheinland Universitätsklinikum',
      'foaf:homepage': 'https://www.rheinland-uklinikum.de',
      'healthdcatap:publisherType': 'Hospital'
    },
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj'
    ],
    'dcat:themeTaxonomy': 'http://publications.europa.eu/resource/authority/data-theme',
    'dct:spatial': 'http://publications.europa.eu/resource/authority/country/DEU',
    datasetCount: datasets.length,
    formats: {
      ttl: '/api/catalog.ttl',
      json: '/api/ehr',
      jsonld: '/api/catalog'
    },
    'dcat:dataset': datasets
  });
});

const server = app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, recordsCount: ehrCatalog.length });
  console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║     EHR2EDC Health Data Exchange Backend Service                      ║
║                                                                       ║
║  Rheinland Universitätsklinikum - Anonymized EHR Server               ║
║  Serving ${ehrCatalog.length} de-identified patient records                           ║
║                                                                       ║
║  Provider: Rheinland Universitätsklinikum (Hospital)                  ║
║  Consumer: Nordstein Research Institute (CRO)                         ║
║                                                                       ║
║  EHR Data Endpoints:                                                  ║
║    GET /api/ehr             - List all ${ehrCatalog.length} EHRs                           ║
║    GET /api/ehr/:id         - Get specific EHR (EHR001-EHR020)        ║
║                                                                       ║
║  HealthDCAT-AP Catalog (Single Source of Truth):                      ║
║    GET /api/catalog         - Catalog metadata (JSON)                 ║
║    GET /api/catalog.ttl     - Full catalog (Turtle/RDF)               ║
║                                                                       ║
║  Observability Endpoints:                                             ║
║    GET /health              - Health check                            ║
║    GET /metrics             - Prometheus metrics                      ║
║                                                                       ║
║  Compliance: GDPR Art. 89, EHDS Reg. 2025/327, HealthDCAT-AP R5       ║
║  Server running on port ${PORT}                                         ║
╚═══════════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await shutdownTracing();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await shutdownTracing();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
