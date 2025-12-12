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

// Consent purpose definitions aligned with EHDS and German GDNG
export const consentPurposes = {
  'clinical-research': { label: 'Clinical Research', icon: '🔬', description: 'Use in clinical trials and studies' },
  'registry-participation': { label: 'Registry Participation', icon: '📊', description: 'Inclusion in disease registries' },
  'real-world-evidence': { label: 'Real-World Evidence', icon: '🌍', description: 'RWE studies and health analytics' },
  'ai-training': { label: 'AI/ML Training', icon: '🤖', description: 'Training machine learning models' },
  'public-health': { label: 'Public Health', icon: '🏥', description: 'Public health monitoring and surveillance' },
  'academic-research': { label: 'Academic Research', icon: '🎓', description: 'Non-commercial academic studies' },
};

export const consentRestrictions = {
  'no-commercial': { label: 'No Commercial Use', icon: '🚫💰', description: 'Data may not be used for commercial purposes' },
  'no-genetic': { label: 'No Genetic Analysis', icon: '🧬❌', description: 'Genetic/genomic analysis not permitted' },
  'no-reidentification': { label: 'No Re-identification', icon: '🔒', description: 'Attempts to re-identify are prohibited' },
  'no-third-party': { label: 'No Third-Party Sharing', icon: '🚫↗️', description: 'Data may not be shared outside the study' },
  'no-indefinite-storage': { label: 'Time-Limited Storage', icon: '⏰', description: 'Data must be deleted after study completion' },
};

// ============================================================================
// CLINICAL TRIAL PHASES - ICH E8(R1) / FDA / EMA Classification
// ============================================================================

export const clinicalTrialPhases = {
  'Phase I': { 
    code: 'C15600', 
    label: 'Phase I', 
    description: 'First-in-human, safety & tolerability', 
    subjects: '20-100',
    color: 'bg-blue-100 text-blue-800'
  },
  'Phase I/II': { 
    code: 'C15693', 
    label: 'Phase I/II', 
    description: 'Combined safety & preliminary efficacy', 
    subjects: '50-200',
    color: 'bg-indigo-100 text-indigo-800'
  },
  'Phase II': { 
    code: 'C15601', 
    label: 'Phase II', 
    description: 'Proof-of-concept, dose-finding', 
    subjects: '100-500',
    color: 'bg-violet-100 text-violet-800'
  },
  'Phase II/III': { 
    code: 'C15694', 
    label: 'Phase II/III', 
    description: 'Adaptive design, seamless transition', 
    subjects: '300-1000',
    color: 'bg-purple-100 text-purple-800'
  },
  'Phase III': { 
    code: 'C15602', 
    label: 'Phase III', 
    description: 'Confirmatory, pivotal registration trial', 
    subjects: '1000-5000',
    color: 'bg-fuchsia-100 text-fuchsia-800'
  },
  'Phase IV': { 
    code: 'C15603', 
    label: 'Phase IV', 
    description: 'Post-marketing surveillance, RWE', 
    subjects: '>5000',
    color: 'bg-pink-100 text-pink-800'
  },
  'Not Applicable': { 
    code: 'C48660', 
    label: 'N/A', 
    description: 'Observational or registry study', 
    subjects: 'Variable',
    color: 'bg-gray-100 text-gray-800'
  },
};

// ============================================================================
// MedDRA v27.0 - System Organ Classes (SOC) Reference Data
// ============================================================================

export const medDRASystemOrganClasses = {
  '10005329': { code: '10005329', name: 'Blood and lymphatic system disorders', abbreviation: 'Blood' },
  '10007541': { code: '10007541', name: 'Cardiac disorders', abbreviation: 'Cardiac' },
  '10010331': { code: '10010331', name: 'Congenital, familial and genetic disorders', abbreviation: 'Congen' },
  '10013993': { code: '10013993', name: 'Ear and labyrinth disorders', abbreviation: 'Ear' },
  '10014698': { code: '10014698', name: 'Endocrine disorders', abbreviation: 'Endoc' },
  '10015919': { code: '10015919', name: 'Eye disorders', abbreviation: 'Eye' },
  '10017947': { code: '10017947', name: 'Gastrointestinal disorders', abbreviation: 'Gastroint' },
  '10018065': { code: '10018065', name: 'General disorders and administration site conditions', abbreviation: 'Genrl' },
  '10019805': { code: '10019805', name: 'Hepatobiliary disorders', abbreviation: 'Hepatobil' },
  '10021428': { code: '10021428', name: 'Immune system disorders', abbreviation: 'Immune' },
  '10021881': { code: '10021881', name: 'Infections and infestations', abbreviation: 'Infec' },
  '10022117': { code: '10022117', name: 'Injury, poisoning and procedural complications', abbreviation: 'Injury' },
  '10022891': { code: '10022891', name: 'Investigations', abbreviation: 'Inv' },
  '10027433': { code: '10027433', name: 'Metabolism and nutrition disorders', abbreviation: 'Metab' },
  '10028395': { code: '10028395', name: 'Musculoskeletal and connective tissue disorders', abbreviation: 'Musc' },
  '10029104': { code: '10029104', name: 'Neoplasms benign, malignant and unspecified', abbreviation: 'Neopl' },
  '10029205': { code: '10029205', name: 'Nervous system disorders', abbreviation: 'Nerv' },
  '10036585': { code: '10036585', name: 'Pregnancy, puerperium and perinatal conditions', abbreviation: 'Preg' },
  '10037175': { code: '10037175', name: 'Psychiatric disorders', abbreviation: 'Psych' },
  '10038359': { code: '10038359', name: 'Renal and urinary disorders', abbreviation: 'Renal' },
  '10038604': { code: '10038604', name: 'Reproductive system and breast disorders', abbreviation: 'Reprod' },
  '10038738': { code: '10038738', name: 'Respiratory, thoracic and mediastinal disorders', abbreviation: 'Resp' },
  '10040785': { code: '10040785', name: 'Skin and subcutaneous tissue disorders', abbreviation: 'Skin' },
  '10041244': { code: '10041244', name: 'Social circumstances', abbreviation: 'Soc' },
  '10042613': { code: '10042613', name: 'Surgical and medical procedures', abbreviation: 'Surg' },
  '10047065': { code: '10047065', name: 'Vascular disorders', abbreviation: 'Vasc' },
  '10077536': { code: '10077536', name: 'Product issues', abbreviation: 'Product' },
};

// ============================================================================
// ADR Severity and Signal Status Reference
// ============================================================================

export const adrSeverityLevels = {
  'mild': { grade: 1, label: 'Mild', description: 'No treatment required', color: 'bg-green-100 text-green-800' },
  'moderate': { grade: 2, label: 'Moderate', description: 'Local/noninvasive intervention', color: 'bg-yellow-100 text-yellow-800' },
  'severe': { grade: 3, label: 'Severe', description: 'Hospitalization indicated', color: 'bg-orange-100 text-orange-800' },
  'life-threatening': { grade: 4, label: 'Life-threatening', description: 'Urgent intervention required', color: 'bg-red-100 text-red-800' },
  'fatal': { grade: 5, label: 'Fatal', description: 'Death related to AE', color: 'bg-gray-800 text-white' },
};

export const relatednessCategories = {
  'certain': { label: 'Certain', score: 6, color: 'bg-red-100 text-red-800' },
  'probable': { label: 'Probable/Likely', score: 5, color: 'bg-orange-100 text-orange-800' },
  'possible': { label: 'Possible', score: 4, color: 'bg-yellow-100 text-yellow-800' },
  'unlikely': { label: 'Unlikely', score: 3, color: 'bg-green-100 text-green-800' },
  'conditional': { label: 'Conditional', score: 2, color: 'bg-blue-100 text-blue-800' },
  'unassessable': { label: 'Unassessable', score: 1, color: 'bg-gray-100 text-gray-800' },
};

// ============================================================================
// EU CTR 536/2014 - CTIS Reference Data
// ============================================================================

/**
 * EMA Therapeutic Areas - 27 categories aligned with ATC classification
 * Used for trial categorization in CTIS (Clinical Trials Information System)
 */
export const emaTherapeuticAreas = {
  'ALIMENTARY': { code: 'ALIMENTARY', name: 'Alimentary Tract and Metabolism', atcPrefix: 'A' },
  'BLOOD': { code: 'BLOOD', name: 'Blood and Blood Forming Organs', atcPrefix: 'B' },
  'CARDIO': { code: 'CARDIO', name: 'Cardiovascular', atcPrefix: 'C' },
  'DERMA': { code: 'DERMA', name: 'Dermatologicals', atcPrefix: 'D' },
  'GENITO': { code: 'GENITO', name: 'Genito Urinary System and Sex Hormones', atcPrefix: 'G' },
  'HORMONAL': { code: 'HORMONAL', name: 'Systemic Hormonal Preparations', atcPrefix: 'H' },
  'ANTIINFECT': { code: 'ANTIINFECT', name: 'Antiinfectives for Systemic Use', atcPrefix: 'J' },
  'ANTINEOPL': { code: 'ANTINEOPL', name: 'Antineoplastic and Immunomodulating Agents', atcPrefix: 'L' },
  'MUSCULO': { code: 'MUSCULO', name: 'Musculo-Skeletal System', atcPrefix: 'M' },
  'NERVOUS': { code: 'NERVOUS', name: 'Nervous System', atcPrefix: 'N' },
  'ANTIPARAS': { code: 'ANTIPARAS', name: 'Antiparasitic Products', atcPrefix: 'P' },
  'RESPIRATORY': { code: 'RESPIRATORY', name: 'Respiratory System', atcPrefix: 'R' },
  'SENSORY': { code: 'SENSORY', name: 'Sensory Organs', atcPrefix: 'S' },
  'VARIOUS': { code: 'VARIOUS', name: 'Various', atcPrefix: 'V' },
  'IMMUNOLOGY': { code: 'IMMUNOLOGY', name: 'Immunology', atcPrefix: 'L03' },
  'VACCINES': { code: 'VACCINES', name: 'Vaccines', atcPrefix: 'J07' },
  'RARE': { code: 'RARE', name: 'Rare Diseases (Orphan)', atcPrefix: null },
  'PEDIATRIC': { code: 'PEDIATRIC', name: 'Pediatric Use', atcPrefix: null },
  'GERIATRIC': { code: 'GERIATRIC', name: 'Geriatric Use', atcPrefix: null },
  'PSYCHIATRY': { code: 'PSYCHIATRY', name: 'Psychiatry', atcPrefix: 'N05' },
  'NEPHROLOGY': { code: 'NEPHROLOGY', name: 'Nephrology', atcPrefix: 'C03' },
  'HEPATOLOGY': { code: 'HEPATOLOGY', name: 'Hepatology', atcPrefix: 'A05' },
  'HEMATOLOGY': { code: 'HEMATOLOGY', name: 'Hematology', atcPrefix: 'B' },
  'RHEUMATOLOGY': { code: 'RHEUMATOLOGY', name: 'Rheumatology', atcPrefix: 'M01' },
  'GASTRO': { code: 'GASTRO', name: 'Gastroenterology', atcPrefix: 'A02' },
  'PULMONOLOGY': { code: 'PULMONOLOGY', name: 'Pulmonology', atcPrefix: 'R03' },
  'ENDOCRINE': { code: 'ENDOCRINE', name: 'Endocrinology/Diabetology', atcPrefix: 'A10' },
};

/**
 * Sponsor types per EU CTR 536/2014 Article 2(14)
 */
export const sponsorTypes = {
  'commercial': { type: 'commercial', label: 'Commercial', icon: '🏢', color: 'bg-blue-100 text-blue-800' },
  'academic': { type: 'academic', label: 'Academic', icon: '🎓', color: 'bg-purple-100 text-purple-800' },
  'non-profit': { type: 'non-profit', label: 'Non-Profit', icon: '🏛️', color: 'bg-green-100 text-green-800' },
};

/**
 * Fictional but realistic sponsor organizations for the demo
 */
export const demoSponsors = {
  'nordpharma': { name: 'NordPharma AG', type: 'commercial' as const, country: 'DE' as const, icon: '🏢' },
  'rhenus': { name: 'Rhenus Therapeutics GmbH', type: 'commercial' as const, country: 'DE' as const, icon: '🏢' },
  'charite': { name: 'Charité Forschung GmbH', type: 'academic' as const, country: 'DE' as const, icon: '🎓' },
  'helmholtz': { name: 'Helmholtz-Institut für Arzneimittelforschung', type: 'academic' as const, country: 'DE' as const, icon: '🎓' },
  'biomedtech': { name: 'BioMedTech Europa SE', type: 'commercial' as const, country: 'NL' as const, icon: '🏢' },
  'ukkoeln': { name: 'Universitätsklinikum Köln', type: 'academic' as const, country: 'DE' as const, icon: '🎓' },
  'dkfz': { name: 'DKFZ Heidelberg', type: 'academic' as const, country: 'DE' as const, icon: '🎓' },
  'euoncology': { name: 'EU Oncology Consortium', type: 'non-profit' as const, country: 'BE' as const, icon: '🏛️' },
};

/**
 * EU Member State flags for display
 */
export const memberStateFlags: Record<string, { code: string; flag: string; name: string }> = {
  'DE': { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  'FR': { code: 'FR', flag: '🇫🇷', name: 'France' },
  'NL': { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  'ES': { code: 'ES', flag: '🇪🇸', name: 'Spain' },
  'IT': { code: 'IT', flag: '🇮🇹', name: 'Italy' },
  'BE': { code: 'BE', flag: '🇧🇪', name: 'Belgium' },
  'AT': { code: 'AT', flag: '🇦🇹', name: 'Austria' },
  'PL': { code: 'PL', flag: '🇵🇱', name: 'Poland' },
  'SE': { code: 'SE', flag: '🇸🇪', name: 'Sweden' },
  'DK': { code: 'DK', flag: '🇩🇰', name: 'Denmark' },
  'FI': { code: 'FI', flag: '🇫🇮', name: 'Finland' },
  'PT': { code: 'PT', flag: '🇵🇹', name: 'Portugal' },
  'IE': { code: 'IE', flag: '🇮🇪', name: 'Ireland' },
  'CZ': { code: 'CZ', flag: '🇨🇿', name: 'Czech Republic' },
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
    'health:clinicalTrialPhase': 'Phase III',
    'health:euCtNumber': '2024-501234-12-DE',
    'health:sponsor': { name: 'NordPharma AG', type: 'commercial', country: 'DE' },
    'health:therapeuticArea': { code: 'ENDOCRINE', name: 'Endocrinology/Diabetology' },
    'health:memberStatesConcerned': ['DE', 'FR', 'NL', 'ES'],
    'health:medDRA': {
      socCode: '10027433',
      socName: 'Metabolism and nutrition disorders',
      ptCode: '10012601',
      ptName: 'Diabetes mellitus'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'real-world-evidence'],
      restrictions: ['no-reidentification'],
      validUntil: '2027-12-31',
      grantor: 'Patient (Pseudonym: A7X9K2)',
    },
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
    'health:clinicalTrialPhase': 'Phase IV',
    'health:euCtNumber': '2023-487652-41-DE',
    'health:sponsor': { name: 'Rhenus Therapeutics GmbH', type: 'commercial', country: 'DE' },
    'health:therapeuticArea': { code: 'CARDIO', name: 'Cardiovascular' },
    'health:memberStatesConcerned': ['DE', 'AT', 'NL'],
    'health:medDRA': {
      socCode: '10007541',
      socName: 'Cardiac disorders',
      ptCode: '10019279',
      ptName: 'Heart failure'
    },
    'health:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'public-health'],
      restrictions: ['no-reidentification', 'no-commercial'],
      validUntil: '2028-06-30',
      grantor: 'Patient (Pseudonym: B8Y3L5)',
    },
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
    'health:clinicalTrialPhase': 'Phase II',
    'health:euCtNumber': '2024-512876-23-DE',
    'health:sponsor': { name: 'DKFZ Heidelberg', type: 'academic', country: 'DE' },
    'health:therapeuticArea': { code: 'ANTINEOPL', name: 'Antineoplastic and Immunomodulating Agents' },
    'health:memberStatesConcerned': ['DE'],
    'health:medDRA': {
      socCode: '10029104',
      socName: 'Neoplasms benign, malignant and unspecified',
      ptCode: '10006187',
      ptName: 'Breast cancer'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 3 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'academic-research'],
      restrictions: ['no-reidentification', 'no-genetic'],
      validUntil: '2026-12-31',
      grantor: 'Patient (Pseudonym: C2Z4M7)',
    },
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
    'health:clinicalTrialPhase': 'Not Applicable',
    'health:euCtNumber': '2023-498123-55-DE',
    'health:sponsor': { name: 'EU Oncology Consortium', type: 'non-profit', country: 'BE' },
    'health:therapeuticArea': { code: 'ANTINEOPL', name: 'Antineoplastic and Immunomodulating Agents' },
    'health:memberStatesConcerned': ['DE', 'BE', 'NL'],
    'health:medDRA': {
      socCode: '10029104',
      socName: 'Neoplasms benign, malignant and unspecified',
      ptCode: '10036910',
      ptName: 'Prostate cancer'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 0 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation'],
      restrictions: ['no-reidentification', 'no-third-party'],
      validUntil: '2027-03-31',
      grantor: 'Patient (Pseudonym: D5N8P2)',
    },
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
    'health:clinicalTrialPhase': 'Phase III',
    'health:euCtNumber': '2024-503987-18-DE',
    'health:sponsor': { name: 'BioMedTech Europa SE', type: 'commercial', country: 'NL' },
    'health:therapeuticArea': { code: 'PULMONOLOGY', name: 'Pulmonology' },
    'health:memberStatesConcerned': ['DE', 'FR', 'NL', 'ES'],
    'health:medDRA': {
      socCode: '10038738',
      socName: 'Respiratory, thoracic and mediastinal disorders',
      ptCode: '10009033',
      ptName: 'Chronic obstructive pulmonary disease'
    },
    'health:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'health:consent': {
      purposes: ['clinical-research', 'real-world-evidence', 'public-health'],
      restrictions: ['no-reidentification'],
      validUntil: '2028-12-31',
      grantor: 'Patient (Pseudonym: E9Q1R4)',
    },
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
    'health:clinicalTrialPhase': 'Phase II',
    'health:euCtNumber': '2024-518234-67-DE',
    'health:sponsor': { name: 'Charité Forschung GmbH', type: 'academic', country: 'DE' },
    'health:therapeuticArea': { code: 'NERVOUS', name: 'Nervous System' },
    'health:memberStatesConcerned': ['DE'],
    'health:medDRA': {
      socCode: '10029205',
      socName: 'Nervous system disorders',
      ptCode: '10028245',
      ptName: 'Multiple sclerosis'
    },
    'health:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'ai-training'],
      restrictions: ['no-reidentification', 'no-commercial'],
      validUntil: '2029-06-30',
      grantor: 'Patient (Pseudonym: F3S6T8)',
    },
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
    'health:clinicalTrialPhase': 'Phase III',
    'health:euCtNumber': '2024-505612-34-DE',
    'health:sponsor': { name: 'NordPharma AG', type: 'commercial', country: 'DE' },
    'health:therapeuticArea': { code: 'RHEUMATOLOGY', name: 'Rheumatology' },
    'health:memberStatesConcerned': ['DE', 'FR', 'NL', 'ES'],
    'health:medDRA': {
      socCode: '10028395',
      socName: 'Musculoskeletal and connective tissue disorders',
      ptCode: '10039073',
      ptName: 'Rheumatoid arthritis'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'health:consent': {
      purposes: ['clinical-research', 'academic-research'],
      restrictions: ['no-reidentification', 'no-indefinite-storage'],
      validUntil: '2026-09-30',
      grantor: 'Patient (Pseudonym: G7U2V9)',
    },
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
    'health:clinicalTrialPhase': 'Phase IV',
    'health:euCtNumber': '2023-492145-78-DE',
    'health:sponsor': { name: 'Universitätsklinikum Köln', type: 'academic', country: 'DE' },
    'health:therapeuticArea': { code: 'NEPHROLOGY', name: 'Nephrology' },
    'health:memberStatesConcerned': ['DE', 'AT'],
    'health:medDRA': {
      socCode: '10038359',
      socName: 'Renal and urinary disorders',
      ptCode: '10064848',
      ptName: 'Chronic kidney disease'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 2 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'real-world-evidence'],
      restrictions: ['no-reidentification'],
      validUntil: '2027-12-31',
      grantor: 'Patient (Pseudonym: H1W5X3)',
    },
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
    'health:clinicalTrialPhase': 'Phase II/III',
    'health:euCtNumber': '2024-509876-45-DE',
    'health:sponsor': { name: 'Charité Forschung GmbH', type: 'academic', country: 'DE' },
    'health:therapeuticArea': { code: 'PSYCHIATRY', name: 'Psychiatry' },
    'health:memberStatesConcerned': ['DE', 'FR', 'NL'],
    'health:medDRA': {
      socCode: '10037175',
      socName: 'Psychiatric disorders',
      ptCode: '10012378',
      ptName: 'Depression'
    },
    'health:signalStatus': { hasActiveSignal: true, adrCount: 3 },
    'health:consent': {
      purposes: ['academic-research'],
      restrictions: ['no-reidentification', 'no-commercial', 'no-third-party', 'no-indefinite-storage'],
      validUntil: '2026-06-30',
      grantor: 'Patient (Pseudonym: I4Y8Z1)',
    },
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
    'health:clinicalTrialPhase': 'Phase I/II',
    'health:euCtNumber': '2024-521345-89-DE',
    'health:sponsor': { name: 'Helmholtz-Institut für Arzneimittelforschung', type: 'academic', country: 'DE' },
    'health:therapeuticArea': { code: 'NERVOUS', name: 'Nervous System' },
    'health:memberStatesConcerned': ['DE'],
    'health:medDRA': {
      socCode: '10029205',
      socName: 'Nervous system disorders',
      ptCode: '10034010',
      ptName: "Parkinson's disease"
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'ai-training'],
      restrictions: ['no-reidentification'],
      validUntil: '2028-12-31',
      grantor: 'Patient (Pseudonym: J6A2B4)',
    },
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
    'health:clinicalTrialPhase': 'Phase III',
    'health:euCtNumber': '2024-506789-12-DE',
    'health:sponsor': { name: 'BioMedTech Europa SE', type: 'commercial', country: 'NL' },
    'health:therapeuticArea': { code: 'GASTRO', name: 'Gastroenterology' },
    'health:memberStatesConcerned': ['DE', 'FR', 'NL', 'ES'],
    'health:medDRA': {
      socCode: '10017947',
      socName: 'Gastrointestinal disorders',
      ptCode: '10011401',
      ptName: "Crohn's disease"
    },
    'health:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'real-world-evidence'],
      restrictions: ['no-reidentification', 'no-genetic'],
      validUntil: '2027-09-30',
      grantor: 'Patient (Pseudonym: K8C5D7)',
    },
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
    'health:clinicalTrialPhase': 'Phase II',
    'health:euCtNumber': '2024-514567-23-DE',
    'health:sponsor': { name: 'Charité Forschung GmbH', type: 'academic', country: 'DE' },
    'health:therapeuticArea': { code: 'NERVOUS', name: 'Nervous System' },
    'health:memberStatesConcerned': ['DE'],
    'health:medDRA': {
      socCode: '10029205',
      socName: 'Nervous system disorders',
      ptCode: '10015037',
      ptName: 'Epilepsy'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'health:consent': {
      purposes: ['clinical-research', 'academic-research'],
      restrictions: ['no-reidentification', 'no-commercial'],
      validUntil: '2028-03-31',
      grantor: 'Patient (Pseudonym: L2E9F1)',
    },
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
    'health:clinicalTrialPhase': 'Phase II',
    'health:euCtNumber': '2024-517890-56-DE',
    'health:sponsor': { name: 'Rhenus Therapeutics GmbH', type: 'commercial', country: 'DE' },
    'health:therapeuticArea': { code: 'RHEUMATOLOGY', name: 'Rheumatology' },
    'health:memberStatesConcerned': ['DE'],
    'health:medDRA': {
      socCode: '10028395',
      socName: 'Musculoskeletal and connective tissue disorders',
      ptCode: '10042945',
      ptName: 'Systemic lupus erythematosus'
    },
    'health:signalStatus': { hasActiveSignal: true, adrCount: 4 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'academic-research'],
      restrictions: ['no-reidentification', 'no-genetic'],
      validUntil: '2027-12-31',
      grantor: 'Patient (Pseudonym: M3G6H8)',
    },
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
    'health:clinicalTrialPhase': 'Phase IV',
    'health:euCtNumber': '2023-489234-67-DE',
    'health:sponsor': { name: 'NordPharma AG', type: 'commercial', country: 'DE' },
    'health:therapeuticArea': { code: 'CARDIO', name: 'Cardiovascular' },
    'health:memberStatesConcerned': ['DE', 'FR', 'IT', 'ES'],
    'health:medDRA': {
      socCode: '10007541',
      socName: 'Cardiac disorders',
      ptCode: '10003658',
      ptName: 'Atrial fibrillation'
    },
    'health:signalStatus': { hasActiveSignal: true, adrCount: 3 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'public-health', 'real-world-evidence'],
      restrictions: ['no-reidentification'],
      validUntil: '2028-06-30',
      grantor: 'Patient (Pseudonym: N5I9J2)',
    },
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
    'health:clinicalTrialPhase': 'Phase III',
    'health:euCtNumber': '2024-508234-78-DE',
    'health:sponsor': { name: 'NordPharma AG', type: 'commercial', country: 'DE' },
    'health:therapeuticArea': { code: 'PULMONOLOGY', name: 'Pulmonology' },
    'health:memberStatesConcerned': ['DE', 'FR', 'NL', 'ES'],
    'health:medDRA': {
      socCode: '10038738',
      socName: 'Respiratory, thoracic and mediastinal disorders',
      ptCode: '10003553',
      ptName: 'Asthma'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 2 },
    'health:consent': {
      purposes: ['clinical-research', 'real-world-evidence'],
      restrictions: ['no-reidentification', 'no-commercial'],
      validUntil: '2027-09-30',
      grantor: 'Patient (Pseudonym: O7K1L4)',
    },
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
    'health:clinicalTrialPhase': 'Phase II',
    'health:euCtNumber': '2024-519876-34-DE',
    'health:sponsor': { name: 'Helmholtz-Institut für Arzneimittelforschung', type: 'academic', country: 'DE' },
    'health:therapeuticArea': { code: 'ENDOCRINE', name: 'Endocrinology/Diabetology' },
    'health:memberStatesConcerned': ['DE'],
    'health:medDRA': {
      socCode: '10027433',
      socName: 'Metabolism and nutrition disorders',
      ptCode: '10067584',
      ptName: 'Type 1 diabetes mellitus'
    },
    'health:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'ai-training', 'real-world-evidence'],
      restrictions: ['no-reidentification'],
      validUntil: '2029-12-31',
      grantor: 'Patient (Pseudonym: P2M5N7)',
    },
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
    'health:clinicalTrialPhase': 'Phase IV',
    'health:euCtNumber': '2023-496543-21-DE',
    'health:sponsor': { name: 'Universitätsklinikum Köln', type: 'academic', country: 'DE' },
    'health:therapeuticArea': { code: 'MUSCULO', name: 'Musculo-Skeletal System' },
    'health:memberStatesConcerned': ['DE', 'AT', 'BE'],
    'health:medDRA': {
      socCode: '10028395',
      socName: 'Musculoskeletal and connective tissue disorders',
      ptCode: '10031282',
      ptName: 'Osteoporosis'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'health:consent': {
      purposes: ['clinical-research', 'public-health'],
      restrictions: ['no-reidentification', 'no-indefinite-storage'],
      validUntil: '2026-12-31',
      grantor: 'Patient (Pseudonym: Q4O8P1)',
    },
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
    'health:clinicalTrialPhase': 'Phase IV',
    'health:euCtNumber': '2023-491234-56-DE',
    'health:sponsor': { name: 'BioMedTech Europa SE', type: 'commercial', country: 'NL' },
    'health:therapeuticArea': { code: 'ANTIINFECT', name: 'Antiinfectives for Systemic Use' },
    'health:memberStatesConcerned': ['DE', 'NL', 'BE'],
    'health:medDRA': {
      socCode: '10021881',
      socName: 'Infections and infestations',
      ptCode: '10019731',
      ptName: 'Hepatitis C'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 0 },
    'health:consent': {
      purposes: ['clinical-research', 'public-health'],
      restrictions: ['no-reidentification', 'no-third-party', 'no-indefinite-storage'],
      validUntil: '2027-06-30',
      grantor: 'Patient (Pseudonym: R6Q2S3)',
    },
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
    'health:clinicalTrialPhase': 'Phase III',
    'health:euCtNumber': '2024-507654-89-DE',
    'health:sponsor': { name: 'Rhenus Therapeutics GmbH', type: 'commercial', country: 'DE' },
    'health:therapeuticArea': { code: 'NERVOUS', name: 'Nervous System' },
    'health:memberStatesConcerned': ['DE', 'FR', 'NL', 'ES'],
    'health:medDRA': {
      socCode: '10029205',
      socName: 'Nervous system disorders',
      ptCode: '10027599',
      ptName: 'Migraine'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'health:consent': {
      purposes: ['clinical-research', 'registry-participation', 'academic-research'],
      restrictions: ['no-reidentification'],
      validUntil: '2028-03-31',
      grantor: 'Patient (Pseudonym: S8T4U6)',
    },
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
    'health:clinicalTrialPhase': 'Phase IV',
    'health:euCtNumber': '2023-494567-12-DE',
    'health:sponsor': { name: 'EU Oncology Consortium', type: 'non-profit', country: 'BE' },
    'health:therapeuticArea': { code: 'ANTIINFECT', name: 'Antiinfectives for Systemic Use' },
    'health:memberStatesConcerned': ['DE', 'FR', 'BE', 'NL'],
    'health:medDRA': {
      socCode: '10021881',
      socName: 'Infections and infestations',
      ptCode: '10020098',
      ptName: 'HIV infection'
    },
    'health:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'health:consent': {
      purposes: ['academic-research'],
      restrictions: ['no-reidentification', 'no-commercial', 'no-third-party', 'no-indefinite-storage'],
      validUntil: '2026-12-31',
      grantor: 'Patient (Pseudonym: T1V7W9)',
    },
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
