/*
 *  Copyright (c) 2025 Health Dataspace Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

const healthRecords: Record<string, any> = {
  // Patient 1: Diabetes Type 2 with Cardiovascular Risk
  "EHR001": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR001",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:A7X9K2",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["CARDIO-DM2-2025", "METAB-PREV-2025"],
      "consentScope": {
        "purposes": ["clinical-research", "registry-participation"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "A7X9K2",
        "ageBand": "55-64",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2023-Q2"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "E11.9",
          "system": "ICD-10-GM",
          "display": "Type 2 diabetes mellitus without complications",
          "onsetPeriod": "2019"
        },
        "comorbidities": [
          { "code": "I10", "system": "ICD-10-GM", "display": "Essential hypertension" },
          { "code": "E78.0", "system": "ICD-10-GM", "display": "Pure hypercholesterolemia" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "overweight",
          "bloodPressureCategory": "stage1-hypertension",
          "hba1cRange": "7.0-7.9%"
        },
        "labResults": [
          { "code": "2345-7", "display": "Glucose [Mass/Vol]", "valueRange": "126-150 mg/dL", "interpretation": "elevated" },
          { "code": "2093-3", "display": "Cholesterol Total", "valueRange": "200-239 mg/dL", "interpretation": "borderline-high" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "A10BA02", "system": "ATC", "display": "Metformin", "durationCategory": ">2-years" },
          { "code": "C09AA05", "system": "ATC", "display": "Ramipril", "durationCategory": "1-2-years" },
          { "code": "C10AA05", "system": "ATC", "display": "Atorvastatin", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.94
      },
      "clinicalTrialNode": {
        "phase": "Phase III",
        "phaseCode": "C15602",
        "studyType": "interventional",
        "interventionModel": "parallel",
        "primaryEndpoint": "HbA1c reduction at 52 weeks",
        "trialRegistryId": "EudraCT 2024-001234-56"
      },
      "medDRANode": {
        "version": "27.0",
        "primarySOC": {
          "code": "10027433",
          "name": "Metabolism and nutrition disorders",
          "abbreviation": "Metab"
        },
        "preferredTerm": {
          "code": "10012601",
          "name": "Diabetes mellitus",
          "hltCode": "10012608"
        }
      },
      "signalVerificationNode": {
        "adverseEvents": [
          {
            "id": "AE-001-001",
            "medDRAPT": "Hypoglycaemia",
            "medDRACode": "10020993",
            "severity": "moderate",
            "seriousness": ["hospitalization"],
            "outcome": "recovered",
            "onsetPeriod": "2024-Q3",
            "suspectedDrug": "A10BA02",
            "relatedness": "probable",
            "expectedness": "expected",
            "actionTaken": "dose-reduced"
          }
        ],
        "signalStatus": {
          "hasActiveSignal": false,
          "signalCategory": "closed",
          "lastReviewDate": "2025-10"
        },
        "reportingStatus": "not-required"
      },
      "anamnesisNode": {
        "chiefComplaint": {
          "stepNumber": 1,
          "stepName": "Chief Complaint",
          "stepNameDE": "Hauptbeschwerde",
          "summary": "Progressive fatigue and increased thirst over 6 months",
          "relevantFindings": ["Polyuria", "Polydipsia", "Unintentional weight loss"],
          "clinicalSignificance": "high"
        },
        "historyOfPresentIllness": {
          "stepNumber": 2,
          "stepName": "History of Present Illness",
          "stepNameDE": "Jetzige Anamnese",
          "summary": "Gradual onset of symptoms, initially attributed to stress; elevated fasting glucose detected during routine screening",
          "relevantFindings": ["Symptom duration >6 months", "No ketoacidosis episodes", "Lifestyle modifications attempted"],
          "clinicalSignificance": "high"
        },
        "pastMedicalHistory": {
          "stepNumber": 3,
          "stepName": "Past Medical History",
          "stepNameDE": "Eigenanamnese",
          "summary": "History of hypertension (diagnosed 2015), hypercholesterolemia (2017); no prior diabetes diagnosis",
          "relevantFindings": ["Hypertension controlled with ACE inhibitor", "Statin therapy initiated", "No surgical history"],
          "clinicalSignificance": "moderate"
        },
        "familyHistory": {
          "stepNumber": 4,
          "stepName": "Family History",
          "stepNameDE": "Familienanamnese",
          "summary": "Strong family history of metabolic disorders; mother with T2DM, father with coronary artery disease",
          "relevantFindings": ["First-degree relative with T2DM", "Cardiovascular disease in family", "No known genetic conditions"],
          "clinicalSignificance": "high"
        },
        "socialHistory": {
          "stepNumber": 5,
          "stepName": "Social History",
          "stepNameDE": "Sozialanamnese",
          "summary": "Sedentary occupation, former smoker (quit 5 years ago), moderate alcohol consumption",
          "relevantFindings": ["Office work >8h/day", "Limited physical activity", "BMI in overweight category"],
          "clinicalSignificance": "moderate"
        }
      }
    }
  },

  // Patient 2: Chronic Heart Failure
  "EHR002": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR002",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:B3M7P5",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["HF-OUTCOMES-2025", "CARDIO-REHAB-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "procedures"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "B3M7P5",
        "ageBand": "65-74",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2022-Q4"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "I50.9",
          "system": "ICD-10-GM",
          "display": "Heart failure, unspecified",
          "onsetPeriod": "2021"
        },
        "comorbidities": [
          { "code": "I48.0", "system": "ICD-10-GM", "display": "Atrial fibrillation" },
          { "code": "N18.3", "system": "ICD-10-GM", "display": "Chronic kidney disease, stage 3" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "ejectionFractionRange": "35-40%"
        },
        "labResults": [
          { "code": "33762-6", "display": "NT-proBNP", "valueRange": "900-1500 pg/mL", "interpretation": "elevated" },
          { "code": "2160-0", "display": "Creatinine", "valueRange": "1.3-1.8 mg/dL", "interpretation": "elevated" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "C09AA02", "system": "ATC", "display": "Enalapril", "durationCategory": ">2-years" },
          { "code": "C07AB02", "system": "ATC", "display": "Metoprolol", "durationCategory": ">2-years" },
          { "code": "C03CA01", "system": "ATC", "display": "Furosemide", "durationCategory": "1-2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.91
      },
      "clinicalTrialNode": {
        "phase": "Phase III",
        "phaseCode": "C15602",
        "studyType": "interventional",
        "interventionModel": "parallel",
        "primaryEndpoint": "Reduction in HF hospitalization",
        "trialRegistryId": "EudraCT 2024-005678-90"
      },
      "medDRANode": {
        "version": "27.0",
        "primarySOC": {
          "code": "10007541",
          "name": "Cardiac disorders",
          "abbreviation": "Card"
        },
        "preferredTerm": {
          "code": "10019277",
          "name": "Heart failure",
          "hltCode": "10019279"
        }
      },
      "signalVerificationNode": {
        "adverseEvents": [
          {
            "id": "AE-002-001",
            "medDRAPT": "Hypotension",
            "medDRACode": "10021097",
            "severity": "mild",
            "seriousness": ["non-serious"],
            "outcome": "recovered",
            "onsetPeriod": "2024-Q4",
            "suspectedDrug": "C09AA02",
            "relatedness": "possible",
            "expectedness": "expected",
            "actionTaken": "dose-maintained"
          }
        ],
        "signalStatus": {
          "hasActiveSignal": false,
          "signalCategory": "monitored",
          "lastReviewDate": "2025-10"
        },
        "reportingStatus": "not-required"
      },
      "anamnesisNode": {
        "chiefComplaint": {
          "stepNumber": 1,
          "stepName": "Chief Complaint",
          "stepNameDE": "Hauptbeschwerde",
          "summary": "Shortness of breath on exertion and swelling in ankles",
          "relevantFindings": ["Dyspnea (NYHA II)", "Peripheral edema"],
          "clinicalSignificance": "high"
        },
        "historyOfPresentIllness": {
          "stepNumber": 2,
          "stepName": "History of Present Illness",
          "stepNameDE": "Jetzige Anamnese",
          "summary": "Worsening exercise tolerance over past 3 months; orthopnea present",
          "relevantFindings": ["Reduced exercise capacity", "2-pillow orthopnea"],
          "clinicalSignificance": "high"
        },
        "pastMedicalHistory": {
          "stepNumber": 3,
          "stepName": "Past Medical History",
          "stepNameDE": "Eigenanamnese",
          "summary": "Chronic kidney disease (stage 3), atrial fibrillation",
          "relevantFindings": ["CKD stable", "AFib rate controlled"],
          "clinicalSignificance": "moderate"
        },
        "familyHistory": {
          "stepNumber": 4,
          "stepName": "Family History",
          "stepNameDE": "Familienanamnese",
          "summary": "Father died of MI at 65",
          "relevantFindings": ["Paternal MI <65y"],
          "clinicalSignificance": "moderate"
        },
        "socialHistory": {
          "stepNumber": 5,
          "stepName": "Social History",
          "stepNameDE": "Sozialanamnese",
          "summary": "Retired teacher, lives with spouse, non-smoker",
          "relevantFindings": ["Good social support", "No tobacco use"],
          "clinicalSignificance": "low"
        }
      }
    }
  },

  // Patient 3: Breast Cancer Survivor
  "EHR003": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR003",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:C5N2R8",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["ONCO-SURV-2025", "BC-FOLLOWUP-2025"],
      "consentScope": {
        "purposes": ["clinical-research", "cancer-registry"],
        "dataCategories": ["demographics", "conditions", "procedures", "medications"],
        "retentionPeriod": "15-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "C5N2R8",
        "ageBand": "45-54",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2021-Q1"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "C50.9",
          "system": "ICD-10-GM",
          "display": "Malignant neoplasm of breast, unspecified",
          "onsetPeriod": "2020",
          "clinicalStatus": "remission"
        },
        "comorbidities": [
          { "code": "F32.0", "system": "ICD-10-GM", "display": "Mild depressive episode" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal"
        },
        "labResults": [
          { "code": "2039-6", "display": "CA 15-3", "valueRange": "<31 U/mL", "interpretation": "normal" }
        ]
      },
      "proceduresNode": {
        "historicalProcedures": [
          { "code": "0HBT0ZZ", "system": "ICD-10-PCS", "display": "Excision of breast", "periodPerformed": "2020-Q2" },
          { "code": "Chemotherapy", "display": "Adjuvant chemotherapy", "periodPerformed": "2020-Q3" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "L02BA01", "system": "ATC", "display": "Tamoxifen", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.96
      },
      "clinicalTrialNode": {
        "phase": "Phase II",
        "phaseCode": "C15601",
        "studyType": "interventional",
        "interventionModel": "single-group",
        "primaryEndpoint": "Disease-free survival",
        "trialRegistryId": "EudraCT 2024-009988-77"
      },
      "medDRANode": {
        "version": "27.0",
        "primarySOC": {
          "code": "10029104",
          "name": "Neoplasms benign, malignant and unspecified",
          "abbreviation": "Neopl"
        },
        "preferredTerm": {
          "code": "10006187",
          "name": "Breast cancer",
          "hltCode": "10006190"
        }
      },
      "signalVerificationNode": {
        "adverseEvents": [
          {
            "id": "AE-003-001",
            "medDRAPT": "Hot flush",
            "medDRACode": "10020406",
            "severity": "moderate",
            "seriousness": ["non-serious"],
            "outcome": "not-recovered",
            "onsetPeriod": "2024-Q2",
            "suspectedDrug": "L02BA01",
            "relatedness": "probable",
            "expectedness": "expected",
            "actionTaken": "dose-maintained"
          }
        ],
        "signalStatus": {
          "hasActiveSignal": false,
          "signalCategory": "monitored",
          "lastReviewDate": "2025-09"
        },
        "reportingStatus": "not-required"
      },
      "anamnesisNode": {
        "chiefComplaint": {
          "stepNumber": 1,
          "stepName": "Chief Complaint",
          "stepNameDE": "Hauptbeschwerde",
          "summary": "Routine follow-up, reports frequent hot flashes",
          "relevantFindings": ["Hot flashes", "No palpable masses"],
          "clinicalSignificance": "low"
        },
        "historyOfPresentIllness": {
          "stepNumber": 2,
          "stepName": "History of Present Illness",
          "stepNameDE": "Jetzige Anamnese",
          "summary": "Diagnosed 2020, treated with mastectomy and chemo; currently on Tamoxifen",
          "relevantFindings": ["Post-mastectomy", "Adherent to Tamoxifen"],
          "clinicalSignificance": "high"
        },
        "pastMedicalHistory": {
          "stepNumber": 3,
          "stepName": "Past Medical History",
          "stepNameDE": "Eigenanamnese",
          "summary": "Mild depression diagnosed post-diagnosis",
          "relevantFindings": ["Depression managed with therapy"],
          "clinicalSignificance": "moderate"
        },
        "familyHistory": {
          "stepNumber": 4,
          "stepName": "Family History",
          "stepNameDE": "Familienanamnese",
          "summary": "Maternal aunt with breast cancer at 50",
          "relevantFindings": ["Family history of breast cancer"],
          "clinicalSignificance": "high"
        },
        "socialHistory": {
          "stepNumber": 5,
          "stepName": "Social History",
          "stepNameDE": "Sozialanamnese",
          "summary": "Works part-time, married, 2 children",
          "relevantFindings": ["Active lifestyle", "Non-smoker"],
          "clinicalSignificance": "low"
        }
      }
    }
  },

  // Patient 4: COPD with Respiratory Issues
  "EHR004": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR004",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:D9K4L1",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["RESP-COPD-2025", "PULM-REHAB-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "D9K4L1",
        "ageBand": "65-74",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2023-Q1"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "J44.1",
          "system": "ICD-10-GM",
          "display": "COPD with acute exacerbation",
          "onsetPeriod": "2018"
        },
        "comorbidities": [
          { "code": "J45.9", "system": "ICD-10-GM", "display": "Asthma, unspecified" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "underweight",
          "bloodPressureCategory": "normal",
          "fev1Range": "50-60%"
        },
        "labResults": [
          { "code": "20564-1", "display": "Oxygen saturation", "valueRange": "92-95%", "interpretation": "low-normal" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "R03AK06", "system": "ATC", "display": "Salmeterol + Fluticasone", "durationCategory": ">2-years" },
          { "code": "R03BB04", "system": "ATC", "display": "Tiotropium", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.89
      },
      "clinicalTrialNode": {
        "phase": "Phase III",
        "phaseCode": "C15602",
        "studyType": "interventional",
        "interventionModel": "parallel",
        "primaryEndpoint": "Reduction in exacerbations",
        "trialRegistryId": "EudraCT 2024-003344-22"
      },
      "medDRANode": {
        "version": "27.0",
        "primarySOC": {
          "code": "10038738",
          "name": "Respiratory, thoracic and mediastinal disorders",
          "abbreviation": "Resp"
        },
        "preferredTerm": {
          "code": "10009033",
          "name": "Chronic obstructive pulmonary disease",
          "hltCode": "10009036"
        }
      },
      "signalVerificationNode": {
        "adverseEvents": [
          {
            "id": "AE-004-001",
            "medDRAPT": "Dry mouth",
            "medDRACode": "10013781",
            "severity": "mild",
            "seriousness": ["non-serious"],
            "outcome": "recovered",
            "onsetPeriod": "2024-Q3",
            "suspectedDrug": "R03BB04",
            "relatedness": "probable",
            "expectedness": "expected",
            "actionTaken": "dose-maintained"
          }
        ],
        "signalStatus": {
          "hasActiveSignal": false,
          "signalCategory": "monitored",
          "lastReviewDate": "2025-10"
        },
        "reportingStatus": "not-required"
      },
      "anamnesisNode": {
        "chiefComplaint": {
          "stepNumber": 1,
          "stepName": "Chief Complaint",
          "stepNameDE": "Hauptbeschwerde",
          "summary": "Chronic cough and shortness of breath",
          "relevantFindings": ["Productive cough", "Dyspnea on exertion"],
          "clinicalSignificance": "high"
        },
        "historyOfPresentIllness": {
          "stepNumber": 2,
          "stepName": "History of Present Illness",
          "stepNameDE": "Jetzige Anamnese",
          "summary": "Worsening cough over winter months; frequent exacerbations",
          "relevantFindings": ["Winter exacerbations", "Sputum production"],
          "clinicalSignificance": "high"
        },
        "pastMedicalHistory": {
          "stepNumber": 3,
          "stepName": "Past Medical History",
          "stepNameDE": "Eigenanamnese",
          "summary": "Diagnosed with COPD 5 years ago; history of pneumonia",
          "relevantFindings": ["COPD GOLD 3", "Prior pneumonia"],
          "clinicalSignificance": "moderate"
        },
        "familyHistory": {
          "stepNumber": 4,
          "stepName": "Family History",
          "stepNameDE": "Familienanamnese",
          "summary": "Father was a heavy smoker with emphysema",
          "relevantFindings": ["Paternal emphysema"],
          "clinicalSignificance": "moderate"
        },
        "socialHistory": {
          "stepNumber": 5,
          "stepName": "Social History",
          "stepNameDE": "Sozialanamnese",
          "summary": "Retired construction worker, former smoker (40 pack-years)",
          "relevantFindings": ["Heavy smoking history", "Occupational dust exposure"],
          "clinicalSignificance": "high"
        }
      }
    }
  },

  // Patient 5: Rheumatoid Arthritis
  "EHR005": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR005",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:E2P8T6",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["RHEUM-BIO-2025", "AUTOIMMUNE-REG-2025"],
      "consentScope": {
        "purposes": ["clinical-research", "registry-participation"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "E2P8T6",
        "ageBand": "35-44",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2022-Q3"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "M06.9",
          "system": "ICD-10-GM",
          "display": "Rheumatoid arthritis, unspecified",
          "onsetPeriod": "2019"
        },
        "comorbidities": [
          { "code": "M35.0", "system": "ICD-10-GM", "display": "Sicca syndrome [Sjögren]" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "das28Score": "2.6-3.2"
        },
        "labResults": [
          { "code": "14627-4", "display": "RF", "valueRange": ">60 IU/mL", "interpretation": "positive" },
          { "code": "33935-8", "display": "Anti-CCP", "valueRange": ">100 U/mL", "interpretation": "positive" },
          { "code": "4537-7", "display": "ESR", "valueRange": "25-40 mm/hr", "interpretation": "elevated" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "L04AX03", "system": "ATC", "display": "Methotrexate", "durationCategory": ">2-years" },
          { "code": "L04AB02", "system": "ATC", "display": "Infliximab", "durationCategory": "1-2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.93
      },
      "clinicalTrialNode": {
        "phase": "Phase II",
        "phaseCode": "C15601",
        "studyType": "interventional",
        "interventionModel": "parallel",
        "primaryEndpoint": "ACR20 response",
        "trialRegistryId": "EudraCT 2024-001122-33"
      },
      "medDRANode": {
        "version": "27.0",
        "primarySOC": {
          "code": "10028395",
          "name": "Musculoskeletal and connective tissue disorders",
          "abbreviation": "Musc"
        },
        "preferredTerm": {
          "code": "10039073",
          "name": "Rheumatoid arthritis",
          "hltCode": "10039075"
        }
      },
      "signalVerificationNode": {
        "adverseEvents": [
          {
            "id": "AE-005-001",
            "medDRAPT": "Injection site reaction",
            "medDRACode": "10022095",
            "severity": "mild",
            "seriousness": ["non-serious"],
            "outcome": "recovered",
            "onsetPeriod": "2024-Q4",
            "suspectedDrug": "L04AB02",
            "relatedness": "certain",
            "expectedness": "expected",
            "actionTaken": "none"
          }
        ],
        "signalStatus": {
          "hasActiveSignal": false,
          "signalCategory": "monitored",
          "lastReviewDate": "2025-10"
        },
        "reportingStatus": "not-required"
      },
      "anamnesisNode": {
        "chiefComplaint": {
          "stepNumber": 1,
          "stepName": "Chief Complaint",
          "stepNameDE": "Hauptbeschwerde",
          "summary": "Morning stiffness lasting >1 hour and joint pain",
          "relevantFindings": ["Morning stiffness", "Polyarthralgia"],
          "clinicalSignificance": "high"
        },
        "historyOfPresentIllness": {
          "stepNumber": 2,
          "stepName": "History of Present Illness",
          "stepNameDE": "Jetzige Anamnese",
          "summary": "Diagnosed 3 years ago; symptoms controlled on current biologic but recent flare",
          "relevantFindings": ["Recent flare", "Biologic therapy"],
          "clinicalSignificance": "high"
        },
        "pastMedicalHistory": {
          "stepNumber": 3,
          "stepName": "Past Medical History",
          "stepNameDE": "Eigenanamnese",
          "summary": "No other major chronic conditions",
          "relevantFindings": ["Generally healthy otherwise"],
          "clinicalSignificance": "low"
        },
        "familyHistory": {
          "stepNumber": 4,
          "stepName": "Family History",
          "stepNameDE": "Familienanamnese",
          "summary": "Mother with hypothyroidism",
          "relevantFindings": ["Autoimmune history in family"],
          "clinicalSignificance": "moderate"
        },
        "socialHistory": {
          "stepNumber": 5,
          "stepName": "Social History",
          "stepNameDE": "Sozialanamnese",
          "summary": "Office worker, non-smoker",
          "relevantFindings": ["Low impact job"],
          "clinicalSignificance": "low"
        }
      }
    }
  },

  // Patient 6: Multiple Sclerosis
  "EHR006": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR006",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:F7Q3W9",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["NEURO-MS-2025", "MS-DMT-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "F7Q3W9",
        "ageBand": "25-34",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2023-Q4"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "G35",
          "system": "ICD-10-GM",
          "display": "Multiple sclerosis",
          "onsetPeriod": "2022",
          "msType": "relapsing-remitting"
        },
        "comorbidities": []
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "edssScore": "1.5-2.0"
        },
        "labResults": [
          { "code": "MRI-Brain", "display": "Brain MRI lesion count", "valueRange": "5-10 lesions", "interpretation": "stable" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "L04AA31", "system": "ATC", "display": "Teriflunomide", "durationCategory": "1-2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.95
      }
    }
  },

  // Patient 7: Chronic Kidney Disease Stage 4
  "EHR007": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR007",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:G1R5Y4",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["NEPHRO-CKD-2025", "RENAL-OUTCOMES-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "G1R5Y4",
        "ageBand": "55-64",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2022-Q2"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "N18.4",
          "system": "ICD-10-GM",
          "display": "Chronic kidney disease, stage 4",
          "onsetPeriod": "2020"
        },
        "comorbidities": [
          { "code": "E11.9", "system": "ICD-10-GM", "display": "Type 2 diabetes mellitus" },
          { "code": "I10", "system": "ICD-10-GM", "display": "Essential hypertension" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "overweight",
          "bloodPressureCategory": "controlled",
          "gfrRange": "15-29 mL/min"
        },
        "labResults": [
          { "code": "2160-0", "display": "Creatinine", "valueRange": "3.5-4.5 mg/dL", "interpretation": "severely-elevated" },
          { "code": "6299-2", "display": "Urea nitrogen", "valueRange": "50-70 mg/dL", "interpretation": "elevated" },
          { "code": "14959-1", "display": "Albumin/Creatinine ratio", "valueRange": ">300 mg/g", "interpretation": "macroalbuminuria" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "C09CA01", "system": "ATC", "display": "Losartan", "durationCategory": ">2-years" },
          { "code": "B03XA01", "system": "ATC", "display": "Erythropoietin", "durationCategory": "1-2-years" },
          { "code": "A11CC", "system": "ATC", "display": "Vitamin D analogs", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.92
      }
    }
  },

  // Patient 8: Major Depressive Disorder
  "EHR008": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR008",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:H8S2U7",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["PSYCH-MDD-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW",
        "sensitiveCategory": "mental-health"
      },
      "demographicsNode": {
        "pseudonymId": "H8S2U7",
        "ageBand": "25-34",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2024-Q1"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "F33.1",
          "system": "ICD-10-GM",
          "display": "Major depressive disorder, recurrent, moderate",
          "onsetPeriod": "2021"
        },
        "comorbidities": [
          { "code": "F41.1", "system": "ICD-10-GM", "display": "Generalized anxiety disorder" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "phq9ScoreRange": "10-14"
        },
        "labResults": []
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "N06AB06", "system": "ATC", "display": "Sertraline", "durationCategory": "1-2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.88
      }
    }
  },

  // Patient 9: Parkinson's Disease
  "EHR009": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR009",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:I4T9V3",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["NEURO-PD-2025", "PD-DBS-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "I4T9V3",
        "ageBand": "65-74",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2021-Q3"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "G20",
          "system": "ICD-10-GM",
          "display": "Parkinson's disease",
          "onsetPeriod": "2018"
        },
        "comorbidities": [
          { "code": "G47.3", "system": "ICD-10-GM", "display": "Sleep apnea" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "orthostatic-hypotension",
          "updrsScoreRange": "25-35"
        },
        "labResults": []
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "N04BA02", "system": "ATC", "display": "Levodopa + Carbidopa", "durationCategory": ">2-years" },
          { "code": "N04BC05", "system": "ATC", "display": "Pramipexole", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.90
      }
    }
  },

  // Patient 10: Inflammatory Bowel Disease (Crohn's)
  "EHR010": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR010",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:J6U1X8",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["GI-IBD-2025", "CROHN-BIO-2025"],
      "consentScope": {
        "purposes": ["clinical-research", "registry-participation"],
        "dataCategories": ["demographics", "conditions", "observations", "medications", "procedures"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "J6U1X8",
        "ageBand": "25-34",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2023-Q2"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "K50.9",
          "system": "ICD-10-GM",
          "display": "Crohn's disease, unspecified",
          "onsetPeriod": "2019"
        },
        "comorbidities": [
          { "code": "K51.9", "system": "ICD-10-GM", "display": "Ulcerative colitis" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "underweight",
          "bloodPressureCategory": "normal",
          "cdaiScoreRange": "150-220"
        },
        "labResults": [
          { "code": "1988-5", "display": "CRP", "valueRange": "15-30 mg/L", "interpretation": "elevated" },
          { "code": "16551-0", "display": "Fecal calprotectin", "valueRange": "200-500 µg/g", "interpretation": "elevated" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "L04AB04", "system": "ATC", "display": "Adalimumab", "durationCategory": "1-2-years" },
          { "code": "A07EA06", "system": "ATC", "display": "Budesonide", "durationCategory": "<1-year" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.91
      }
    }
  },

  // Patient 11: Epilepsy
  "EHR011": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR011",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:K3V7Z2",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["NEURO-EPI-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "K3V7Z2",
        "ageBand": "18-24",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2024-Q2"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "G40.3",
          "system": "ICD-10-GM",
          "display": "Generalized idiopathic epilepsy",
          "onsetPeriod": "2015"
        },
        "comorbidities": []
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "seizureFrequency": "0-1/month"
        },
        "labResults": [
          { "code": "3968-5", "display": "Valproic acid level", "valueRange": "50-100 µg/mL", "interpretation": "therapeutic" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "N03AG01", "system": "ATC", "display": "Valproic acid", "durationCategory": ">2-years" },
          { "code": "N03AX09", "system": "ATC", "display": "Lamotrigine", "durationCategory": "1-2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.94
      }
    }
  },

  // Patient 12: Systemic Lupus Erythematosus
  "EHR012": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR012",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:L5W4A9",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["AUTOIMMUNE-REG-2025", "LUPUS-NEPHRITIS-2025"],
      "consentScope": {
        "purposes": ["clinical-research", "registry-participation"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "L5W4A9",
        "ageBand": "35-44",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2022-Q1"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "M32.9",
          "system": "ICD-10-GM",
          "display": "Systemic lupus erythematosus, unspecified",
          "onsetPeriod": "2017"
        },
        "comorbidities": [
          { "code": "M32.14", "system": "ICD-10-GM", "display": "Glomerular disease in SLE" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "sledaiScore": "4-6"
        },
        "labResults": [
          { "code": "5130-4", "display": "ANA", "valueRange": ">1:640", "interpretation": "positive" },
          { "code": "33935-8", "display": "Anti-dsDNA", "valueRange": ">100 IU/mL", "interpretation": "positive" },
          { "code": "4498-2", "display": "Complement C3", "valueRange": "60-80 mg/dL", "interpretation": "low" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "P01BA02", "system": "ATC", "display": "Hydroxychloroquine", "durationCategory": ">2-years" },
          { "code": "L04AA06", "system": "ATC", "display": "Mycophenolate", "durationCategory": "1-2-years" },
          { "code": "H02AB06", "system": "ATC", "display": "Prednisolone", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.93
      }
    }
  },

  // Patient 13: Atrial Fibrillation with Stroke Risk
  "EHR013": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR013",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:M2X8B6",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["CARDIO-AFIB-2025", "STROKE-PREV-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "M2X8B6",
        "ageBand": "75-84",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2023-Q3"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "I48.91",
          "system": "ICD-10-GM",
          "display": "Atrial fibrillation, unspecified",
          "onsetPeriod": "2020"
        },
        "comorbidities": [
          { "code": "I10", "system": "ICD-10-GM", "display": "Essential hypertension" },
          { "code": "E11.9", "system": "ICD-10-GM", "display": "Type 2 diabetes mellitus" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "overweight",
          "bloodPressureCategory": "controlled",
          "cha2ds2vascScore": "4"
        },
        "labResults": [
          { "code": "6301-6", "display": "INR", "valueRange": "2.0-3.0", "interpretation": "therapeutic" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "B01AF01", "system": "ATC", "display": "Rivaroxaban", "durationCategory": ">2-years" },
          { "code": "C07AB07", "system": "ATC", "display": "Bisoprolol", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.89
      }
    }
  },

  // Patient 14: Asthma (Severe Persistent)
  "EHR014": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR014",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:N9Y5C4",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["RESP-ASTHMA-2025", "BIOLOGIC-ASTHMA-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "N9Y5C4",
        "ageBand": "35-44",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2023-Q1"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "J45.50",
          "system": "ICD-10-GM",
          "display": "Severe persistent asthma, uncomplicated",
          "onsetPeriod": "2010"
        },
        "comorbidities": [
          { "code": "J30.1", "system": "ICD-10-GM", "display": "Allergic rhinitis" },
          { "code": "L20.9", "system": "ICD-10-GM", "display": "Atopic dermatitis" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "overweight",
          "bloodPressureCategory": "normal",
          "fev1Range": "60-70%",
          "actScoreRange": "15-19"
        },
        "labResults": [
          { "code": "26449-9", "display": "Total IgE", "valueRange": "300-500 IU/mL", "interpretation": "elevated" },
          { "code": "713-8", "display": "Eosinophils", "valueRange": "400-600/µL", "interpretation": "elevated" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "R03DX05", "system": "ATC", "display": "Omalizumab", "durationCategory": "1-2-years" },
          { "code": "R03AK06", "system": "ATC", "display": "Fluticasone/Salmeterol", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.92
      }
    }
  },

  // Patient 15: Prostate Cancer
  "EHR015": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR015",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:O7Z3D1",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["ONCO-PROSTATE-2025", "CANCER-SURV-2025"],
      "consentScope": {
        "purposes": ["clinical-research", "cancer-registry"],
        "dataCategories": ["demographics", "conditions", "observations", "procedures"],
        "retentionPeriod": "15-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "O7Z3D1",
        "ageBand": "65-74",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2022-Q4"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "C61",
          "system": "ICD-10-GM",
          "display": "Malignant neoplasm of prostate",
          "onsetPeriod": "2022",
          "gleasonScore": "3+4=7"
        },
        "comorbidities": [
          { "code": "N40", "system": "ICD-10-GM", "display": "Benign prostatic hyperplasia" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal"
        },
        "labResults": [
          { "code": "2857-1", "display": "PSA", "valueRange": "0.1-0.5 ng/mL", "interpretation": "undetectable-post-treatment" }
        ]
      },
      "proceduresNode": {
        "historicalProcedures": [
          { "code": "0VT00ZZ", "system": "ICD-10-PCS", "display": "Radical prostatectomy", "periodPerformed": "2023-Q1" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": []
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.95
      }
    }
  },

  // Patient 16: Osteoporosis with Fracture History
  "EHR016": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR016",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:P4A9E5",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["BONE-OSTEO-2025", "FRACTURE-PREV-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "P4A9E5",
        "ageBand": "75-84",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2023-Q4"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "M81.0",
          "system": "ICD-10-GM",
          "display": "Postmenopausal osteoporosis with pathological fracture",
          "onsetPeriod": "2018"
        },
        "comorbidities": [
          { "code": "M80.08", "system": "ICD-10-GM", "display": "Vertebral fracture" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "underweight",
          "bloodPressureCategory": "normal",
          "tScoreRange": "-3.0 to -2.5"
        },
        "labResults": [
          { "code": "1968-7", "display": "Vitamin D", "valueRange": "20-30 ng/mL", "interpretation": "low-normal" },
          { "code": "17861-6", "display": "Calcium", "valueRange": "8.5-10.0 mg/dL", "interpretation": "normal" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "M05BA07", "system": "ATC", "display": "Risedronate", "durationCategory": ">2-years" },
          { "code": "A11CC05", "system": "ATC", "display": "Colecalciferol", "durationCategory": ">2-years" },
          { "code": "A12AA", "system": "ATC", "display": "Calcium supplements", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.90
      }
    }
  },

  // Patient 17: Type 1 Diabetes with Insulin Pump
  "EHR017": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR017",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:Q1B6F8",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["ENDO-T1D-2025", "TECH-PUMP-2025"],
      "consentScope": {
        "purposes": ["clinical-research", "device-registry"],
        "dataCategories": ["demographics", "conditions", "observations", "devices"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "Q1B6F8",
        "ageBand": "25-34",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2024-Q1"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "E10.9",
          "system": "ICD-10-GM",
          "display": "Type 1 diabetes mellitus without complications",
          "onsetPeriod": "2008"
        },
        "comorbidities": [
          { "code": "E03.9", "system": "ICD-10-GM", "display": "Hypothyroidism, unspecified" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "hba1cRange": "6.5-7.0%",
          "timeInRangePercent": "70-80%"
        },
        "labResults": [
          { "code": "4548-4", "display": "HbA1c", "valueRange": "6.5-7.0%", "interpretation": "target" }
        ]
      },
      "devicesNode": {
        "activeDevices": [
          { "type": "Insulin Pump", "manufacturer": "anonymized", "startPeriod": "2022-Q1" },
          { "type": "CGM", "manufacturer": "anonymized", "startPeriod": "2021-Q3" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "A10AB05", "system": "ATC", "display": "Insulin aspart", "durationCategory": ">2-years" },
          { "code": "H03AA01", "system": "ATC", "display": "Levothyroxine", "durationCategory": ">2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.96
      }
    }
  },

  // Patient 18: Hepatitis C (Cured)
  "EHR018": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR018",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:R8C2G7",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["HEPATO-HCV-2025", "LIVER-FIBROSIS-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "R8C2G7",
        "ageBand": "55-64",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2022-Q3"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "B18.2",
          "system": "ICD-10-GM",
          "display": "Chronic viral hepatitis C",
          "onsetPeriod": "2005",
          "clinicalStatus": "resolved"
        },
        "comorbidities": [
          { "code": "K74.0", "system": "ICD-10-GM", "display": "Hepatic fibrosis" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "fibroscanScore": "F2"
        },
        "labResults": [
          { "code": "HCV-RNA", "display": "HCV RNA", "valueRange": "undetectable", "interpretation": "SVR-achieved" },
          { "code": "1742-6", "display": "ALT", "valueRange": "20-40 U/L", "interpretation": "normal" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": []
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.91
      }
    }
  },

  // Patient 19: Migraine Chronic
  "EHR019": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR019",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:S5D8H3",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["NEURO-MIGRAINE-2025", "CGRP-STUDY-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW"
      },
      "demographicsNode": {
        "pseudonymId": "S5D8H3",
        "ageBand": "35-44",
        "biologicalSex": "female",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2024-Q2"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "G43.909",
          "system": "ICD-10-GM",
          "display": "Migraine, unspecified, not intractable",
          "onsetPeriod": "2015",
          "migraineType": "chronic"
        },
        "comorbidities": []
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "migraineDaysPerMonth": "10-15"
        },
        "labResults": []
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "N02CC01", "system": "ATC", "display": "Sumatriptan", "durationCategory": ">2-years" },
          { "code": "N02CX", "system": "ATC", "display": "Erenumab", "durationCategory": "<1-year" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.87
      }
    }
  },

  // Patient 20: HIV on ART (Well-controlled)
  "EHR020": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/ehds/ehr/v1", "http://hl7.org/fhir"],
    "id": "did:web:rheinland-uklinikum.de:ehr:EHR020",
    "type": ["VerifiableCredential", "ElectronicHealthRecord", "FHIRBundle"],
    "issuer": "did:web:rheinland-uklinikum.de",
    "issuanceDate": "2025-11-01T10:00:00Z",
    "credentialSubject": {
      "id": "did:web:rheinland-uklinikum.de:patient:pseudonym:T2E4I9",
      "resourceType": "Bundle",
      "type": "collection",
      "studyEligibility": ["HIV-OUTCOMES-2025"],
      "consentScope": {
        "purposes": ["clinical-research"],
        "dataCategories": ["demographics", "conditions", "observations", "medications"],
        "retentionPeriod": "10-years",
        "jurisdiction": "DE-NW",
        "sensitiveCategory": "infectious-disease"
      },
      "demographicsNode": {
        "pseudonymId": "T2E4I9",
        "ageBand": "45-54",
        "biologicalSex": "male",
        "region": "Nordrhein-Westfalen",
        "enrollmentPeriod": "2021-Q2"
      },
      "conditionsNode": {
        "primaryDiagnosis": {
          "code": "B20",
          "system": "ICD-10-GM",
          "display": "HIV disease",
          "onsetPeriod": "2012",
          "clinicalStatus": "controlled"
        },
        "comorbidities": [
          { "code": "E78.0", "system": "ICD-10-GM", "display": "Pure hypercholesterolemia" }
        ]
      },
      "observationsNode": {
        "latestVitals": {
          "recordPeriod": "2025-Q3",
          "bmiCategory": "normal",
          "bloodPressureCategory": "normal",
          "cd4CountRange": ">500 cells/µL",
          "viralLoadStatus": "undetectable"
        },
        "labResults": [
          { "code": "24467-3", "display": "CD4 count", "valueRange": ">500 cells/µL", "interpretation": "normal" },
          { "code": "HIV-RNA", "display": "HIV RNA", "valueRange": "<20 copies/mL", "interpretation": "undetectable" }
        ]
      },
      "medicationsNode": {
        "activeTherapies": [
          { "code": "J05AR13", "system": "ATC", "display": "Bictegravir/Emtricitabine/TAF", "durationCategory": ">2-years" },
          { "code": "C10AA05", "system": "ATC", "display": "Atorvastatin", "durationCategory": "1-2-years" }
        ]
      },
      "provenanceNode": {
        "sourceSystem": "Rheinland-UK-EHR-v4",
        "extractionDate": "2025-11",
        "deIdentificationMethod": "k-anonymity-k5",
        "qualityScore": 0.94
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
  const record = healthRecords[ehrId];
  
  if (record) {
    console.log(`[${new Date().toISOString()}] GET /api/ehr/${ehrId} - Serving ${record.credentialSubject.conditionsNode.primaryDiagnosis.display} EHR`);
    res.json(record);
  } else {
    res.status(404).json({ error: 'Electronic Health Record not found', ehrId });
  }
});

// List all available EHRs
app.get('/api/ehr', (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] GET /api/ehr - Listing all ${ehrCatalog.length} EHRs`);
  res.json({
    totalCount: ehrCatalog.length,
    records: ehrCatalog
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'ehr2edc-backend', recordsCount: ehrCatalog.length });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║     EHR2EDC Health Data Exchange Backend Service                   ║
║                                                                    ║
║  Rheinland Universitätsklinikum - Anonymized EHR Server            ║
║  Serving ${ehrCatalog.length} de-identified patient records                        ║
║                                                                    ║
║  Provider: Rheinland Universitätsklinikum (Hospital)               ║
║  Consumer: Nordstein Research Institute (CRO)                      ║
║                                                                    ║
║  Endpoints:                                                        ║
║    GET /api/ehr             - List all ${ehrCatalog.length} EHRs                        ║
║    GET /api/ehr/:id         - Get specific EHR (EHR001-EHR020)     ║
║    GET /health              - Health check                         ║
║                                                                    ║
║  GDPR/EHDS Compliant: k-anonymity (k=5), pseudonymized             ║
║  Server running on port ${PORT}                                      ║
╚════════════════════════════════════════════════════════════════════╝
  `);
});
