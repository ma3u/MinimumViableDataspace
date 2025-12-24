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
  'genomics': { label: 'Genomics', color: 'bg-slate-100 text-slate-800', icon: '🧬' },
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
  'genomics': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop', // dna
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
  'confidential-computing': { label: 'Confidential Compute', icon: '🛡️', description: 'Processing only in TEE/Enclave' },
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

// Extended metadata type for HealthDCAT-AP compliance
export interface ExtendedDistribution {
  mediaType: string;
  format: string;
  byteSize: number;
  compressFormat: string;
  checksum: { algorithm: string; value: string };
  conformsTo: string[];
  license: string;
  accessRights: string;
  rights: string;
}

export interface SampleDistribution {
  title: string;
  description: string;
  accessURL: string;
  byteSize: number;
}

export interface AnalyticsService {
  title: string;
  endpointURL: string;
  endpointDescription: string;
  conformsTo: string;
}

export interface QualityMetrics {
  findability: { metadataCompleteness: number; keywordRichness: number };
  accessibility: { endpointAvailability: number; authenticationDocumented: boolean };
  interoperability: { fhirComplianceRate: number; vocabularyCoverage: number };
  reusability: { licenseExplicit: boolean; provenanceDocumented: boolean };
  contextability: { clinicalContextCompleteness: number; consentGranularity: string; deidentificationLevel: string };
}

// ============================================================================
// HEALTH DATA ACCESS BODY (HDAB) - Per EHDS Regulation Art. 57
// ============================================================================
export const healthDataAccessBodies = {
  'DE': {
    '@id': 'https://www.hda-germany.de',
    'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
    'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
    'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    'locn:address': {
      'locn:adminUnitL1': 'DEU',
      'locn:postCode': '53113',
      'locn:postName': 'Bonn',
      'locn:thoroughfare': 'Kurt-Georg-Kiesinger-Allee 3'
    },
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/NationalPublicHealthInstitut'
  },
  'NL': {
    '@id': 'https://www.healthri.nl',
    'foaf:name': 'Health-RI Access Committee',
    'foaf:homepage': 'https://www.health-ri.nl',
    'foaf:mbox': 'mailto:access@health-ri.nl'
  },
  'BE': {
    '@id': 'https://www.hda.belgium.be',
    'foaf:name': 'Belgian Health Data Agency',
    'foaf:homepage': 'https://www.hda.belgium.be',
    'foaf:mbox': 'mailto:info@hda.fgov.be'
  }
};

// ============================================================================
// EHDS HEALTH CATEGORIES - Per Art. 51 EHDS Regulation
// ============================================================================
export const ehdsHealthCategories = {
  'EHR': { code: 'EHR', uri: 'http://healthdata.ec.europa.eu/authority/health-category/EHR', label: 'Electronic health records (EHRs)' },
  'HEALTH_DETERMINANTS': { code: 'HEALTH_DETERMINANTS', uri: 'http://healthdata.ec.europa.eu/authority/health-category/HEALTH_DETERMINANTS', label: 'Data on factors impacting health' },
  'HEALTHCARE_RESOURCES': { code: 'HEALTHCARE_RESOURCES', uri: 'http://healthdata.ec.europa.eu/authority/health-category/HEALTHCARE_RESOURCES', label: 'Aggregated data on healthcare resources' },
  'PATHOGEN': { code: 'PATHOGEN', uri: 'http://healthdata.ec.europa.eu/authority/health-category/PATHOGEN', label: 'Pathogen data impacting human health' },
  'ADMIN_CLAIMS': { code: 'ADMIN_CLAIMS', uri: 'http://healthdata.ec.europa.eu/authority/health-category/ADMIN_CLAIMS', label: 'Healthcare administrative data' },
  'GENOMIC': { code: 'GENOMIC', uri: 'http://healthdata.ec.europa.eu/authority/health-category/GENOMIC', label: 'Human genetic/genomic data' },
  'MOLECULAR': { code: 'MOLECULAR', uri: 'http://healthdata.ec.europa.eu/authority/health-category/MOLECULAR', label: 'Other human molecular data' },
  'MEDICAL_DEVICE': { code: 'MEDICAL_DEVICE', uri: 'http://healthdata.ec.europa.eu/authority/health-category/MEDICAL_DEVICE', label: 'Auto-generated data from medical devices' },
  'WELLNESS': { code: 'WELLNESS', uri: 'http://healthdata.ec.europa.eu/authority/health-category/WELLNESS', label: 'Data from wellness applications' },
  'HEALTH_PROF': { code: 'HEALTH_PROF', uri: 'http://healthdata.ec.europa.eu/authority/health-category/HEALTH_PROF', label: 'Data on health professionals' },
  'PUBLIC_HEALTH_REG': { code: 'PUBLIC_HEALTH_REG', uri: 'http://healthdata.ec.europa.eu/authority/health-category/PUBLIC_HEALTH_REG', label: 'Population-based health registries' },
  'MEDICAL_REG': { code: 'MEDICAL_REG', uri: 'http://healthdata.ec.europa.eu/authority/health-category/MEDICAL_REG', label: 'Medical/mortality registries' },
  'CLINICAL_TRIAL': { code: 'CLINICAL_TRIAL', uri: 'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL', label: 'Clinical trials/studies data' },
  'MEDICAL_DEVICE_REG': { code: 'MEDICAL_DEVICE_REG', uri: 'http://healthdata.ec.europa.eu/authority/health-category/MEDICAL_DEVICE_REG', label: 'Medical device registries' },
  'MEDICINAL_REG': { code: 'MEDICINAL_REG', uri: 'http://healthdata.ec.europa.eu/authority/health-category/MEDICINAL_REG', label: 'Medicinal product registries' },
  'RESEARCH_COHORT': { code: 'RESEARCH_COHORT', uri: 'http://healthdata.ec.europa.eu/authority/health-category/RESEARCH_COHORT', label: 'Research cohorts/questionnaires' },
  'BIOBANK': { code: 'BIOBANK', uri: 'http://healthdata.ec.europa.eu/authority/health-category/BIOBANK', label: 'Health data from biobanks' },
};

// ============================================================================
// PUBLISHER TYPES - Per HealthDCAT-AP
// ============================================================================
export const publisherTypes = {
  'NATIONAL_PH': { uri: 'http://healthdata.ec.europa.eu/authority/publisher-type/NationalPublicHealthInstitut', label: 'National Public Health Institute' },
  'HOSPITAL': { uri: 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital', label: 'Hospital/Healthcare Provider' },
  'REGISTRY': { uri: 'http://healthdata.ec.europa.eu/authority/publisher-type/Registry', label: 'Disease/Quality Registry' },
  'ACADEMIC': { uri: 'http://healthdata.ec.europa.eu/authority/publisher-type/Academic', label: 'Academic/Research Institution' },
  'GOVERNMENT': { uri: 'http://healthdata.ec.europa.eu/authority/publisher-type/Government', label: 'Government Agency' },
  'PHARMA': { uri: 'http://healthdata.ec.europa.eu/authority/publisher-type/Pharma', label: 'Pharmaceutical Company' },
  'BIOBANK': { uri: 'http://healthdata.ec.europa.eu/authority/publisher-type/Biobank', label: 'Biobank' },
};

// ============================================================================
// DPV PERSONAL DATA CATEGORIES - Per Data Privacy Vocabulary
// ============================================================================
export const dpvPersonalDataCategories = {
  'Gender': { uri: 'https://w3id.org/dpv/dpv-pd#Gender', label: 'Gender' },
  'Age': { uri: 'https://w3id.org/dpv/dpv-pd#Age', label: 'Age' },
  'Location': { uri: 'https://w3id.org/dpv/dpv-pd#Location', label: 'Location/Address' },
  'HealthRecord': { uri: 'https://w3id.org/dpv/dpv-pd#HealthRecord', label: 'Health Record' },
  'MedicalHealth': { uri: 'https://w3id.org/dpv/dpv-pd#MedicalHealth', label: 'Medical/Health Data' },
  'Genetic': { uri: 'https://w3id.org/dpv/dpv-pd#Genetic', label: 'Genetic Data' },
  'Biometric': { uri: 'https://w3id.org/dpv/dpv-pd#Biometric', label: 'Biometric Data' },
  'MentalHealth': { uri: 'https://w3id.org/dpv/dpv-pd#MentalHealth', label: 'Mental Health Data' },
  'DrugTestResult': { uri: 'https://w3id.org/dpv/dpv-pd#DrugTestResult', label: 'Drug Test Result' },
  'PhysicalHealth': { uri: 'https://w3id.org/dpv/dpv-pd#PhysicalHealth', label: 'Physical Health' },
  'HealthHistory': { uri: 'https://w3id.org/dpv/dpv-pd#HealthHistory', label: 'Health History' },
  'Prescription': { uri: 'https://w3id.org/dpv/dpv-pd#Prescription', label: 'Prescription' },
  'DNACode': { uri: 'https://w3id.org/dpv/dpv-pd#DNACode', label: 'DNA Code' },
  'VitalSigns': { uri: 'https://w3id.org/dpv/dpv-pd#VitalSigns', label: 'Vital Signs' },
};

// ============================================================================
// CODING SYSTEMS - With Wikidata URIs per HealthDCAT-AP specification
// ============================================================================
export const codingSystems = {
  'ICD-10': { 
    wikidataUri: 'https://www.wikidata.org/entity/Q45127',
    label: 'International Classification of Diseases, 10th Revision (ICD-10)',
    notation: 'ICD-10',
    version: '2019'
  },
  'ICD-10-GM': { 
    wikidataUri: 'https://www.wikidata.org/entity/Q15629608',
    label: 'ICD-10-GM (German Modification)',
    notation: 'ICD-10-GM',
    version: '2024'
  },
  'SNOMED-CT': { 
    wikidataUri: 'https://www.wikidata.org/entity/Q900684',
    label: 'SNOMED Clinical Terms',
    notation: 'SNOMED-CT',
    version: '2024-03'
  },
  'LOINC': { 
    wikidataUri: 'https://www.wikidata.org/entity/Q744434',
    label: 'Logical Observation Identifiers Names and Codes',
    notation: 'LOINC',
    version: '2.77'
  },
  'ATC': { 
    wikidataUri: 'https://www.wikidata.org/entity/Q192093',
    label: 'Anatomical Therapeutic Chemical Classification',
    notation: 'ATC',
    version: '2024'
  },
  'MedDRA': { 
    wikidataUri: 'https://www.wikidata.org/entity/Q2743',
    label: 'Medical Dictionary for Regulatory Activities',
    notation: 'MedDRA',
    version: '27.0'
  },
  'FHIR-R4': { 
    wikidataUri: 'https://www.wikidata.org/entity/Q19597236',
    label: 'Fast Healthcare Interoperability Resources (FHIR) R4',
    notation: 'FHIR-R4',
    version: '4.0.1'
  },
};

export const mockEHRCatalogAssets = [
  {
    '@id': 'asset:ehr:EHR021',
    '@type': 'dcat:Dataset',
    'dct:title': 'Rare Genetic Disorder (Pediatric)',
    'dct:description': 'Whole exome sequencing data for pediatric rare disease cohort',
    'dcat:keyword': ['genomics', 'pediatric', 'rare disease'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',  // EHDS Regulation
      'http://data.europa.eu/eli/reg/2016/679/oj',  // GDPR
      'http://data.europa.eu/eli/reg/2022/868/oj',  // Data Governance Act
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': [
      'http://publications.europa.eu/resource/authority/data-theme/HEAL',
      'http://publications.europa.eu/resource/authority/data-theme/TECH',
    ],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/GENOMIC',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
    ],
    'dct:provenance': {
      'rdfs:label': 'Electronic Health Records extracted from Rheinland Universitätsklinikum clinical systems under EHDS secondary use framework',
      'dct:source': 'Hospital Information System (HIS) - Krankenhausinformationssystem',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#Genetic',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',      // Consent
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',      // Scientific research
    ],
    'healthdcatap:publisherNote': 'Data collected under ethical approval (Ethics Committee Rheinland-Pfalz, Ref: 2023-RLP-0847). All records pseudonymized per EHDS Art. 55.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    // dct:identifier - MANDATORY persistent URI
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR021',
    // dcat:contactPoint - MANDATORY
    'dcat:contactPoint': [
      {
        '@type': 'vcard:Kind',
        'vcard:fn': 'Dr. Elisabeth Müller-Richter',
        'vcard:hasEmail': 'mailto:e.mueller-richter@rheinland-uklinikum.de',
        'vcard:hasTelephone': 'tel:+49-221-478-5123',
        'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Forschungsdatenmanagement',
        'vcard:hasRole': 'Research Data Steward',
      },
      {
        '@type': 'vcard:Kind',
        'vcard:fn': 'Prof. Dr. Hans-Peter Kramer',
        'vcard:hasEmail': 'mailto:datenschutz@rheinland-uklinikum.de',
        'vcard:hasTelephone': 'tel:+49-221-478-0',
        'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Datenschutzbeauftragter',
        'vcard:hasRole': 'Data Protection Officer',
      },
    ],
    // dct:publisher - MANDATORY
    'dct:publisher': {
      '@type': 'foaf:Agent',
      'foaf:name': 'Rheinland Universitätsklinikum',
      'foaf:homepage': 'https://www.rheinland-uklinikum.de',
      'dct:type': 'http://purl.org/adms/publishertype/Academia',
      'vcard:hasAddress': {
        'vcard:street-address': 'Kerpener Straße 62',
        'vcard:locality': 'Köln',
        'vcard:postal-code': '50937',
        'vcard:country-name': 'Germany',
      },
    },
    // ========== RECOMMENDED HealthDCAT-AP Properties ==========
    // healthdcatap:analytics - RECOMMENDED analytics distribution with Confidential Computing
    'healthdcatap:analytics': {
      'dct:title': 'Technical Report - WES Quality Metrics for EHR021',
      'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR021',
      'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV',
      'confidentialComputing': true,  // TEE-based secure analytics
    },
    // dqv:hasQualityAnnotation - RECOMMENDED
    'dqv:hasQualityAnnotation': {
      '@type': 'dqv:QualityCertificate',
      'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR021',
      'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR021-2024',
      'oa:motivatedBy': 'dqv:qualityAssessment',
    },
    // dct:source - RECOMMENDED source datasets
    'dct:source': [
      'https://www.rheinland-uklinikum.de/data/his-ehr-export',
    ],
    // dct:alternative - OPTIONAL acronym
    'dct:alternative': 'RGD-PED-2024',
    'healthdcatap:minTypicalAge': 0,
    'healthdcatap:maxTypicalAge': 17,
    'healthdcatap:numberOfRecords': 127,
    'healthdcatap:numberOfUniqueIndividuals': 42,
    'healthdcatap:populationCoverage': 'Pediatric patients with rare genetic disorders in Rhineland-Palatinate catchment area',
    'healthdcatap:hasCodingSystem': [
      'https://www.wikidata.org/entity/Q45127',     // ICD-10
      'https://www.wikidata.org/entity/Q900684',   // SNOMED-CT
      'https://www.wikidata.org/entity/Q19597236', // FHIR R4
    ],
    'healthdcatap:hasCodeValues': [
      'ICD-10:Q87.1',  // Congenital malformation syndromes
      'ICD-10:Q99.9',  // Chromosomal abnormality
      'SNOMED-CT:363235000',  // Genetic disorder
    ],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q15304597',  // Rare disease
      'https://www.wikidata.org/entity/Q7020',      // Genome
      'https://www.wikidata.org/entity/Q104548805', // Whole exome sequencing
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2024-01-01',
      endDate: '2034-12-31',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-rare-disease-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': [
      'http://hl7.org/fhir/R4',
      'https://www.hl7.de/de/isik/',
      'https://simplifier.net/kbv',
    ],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'Q87.1',
    'healthdcatap:diagnosis': 'Congenital malformation syndromes',
    'healthdcatap:category': 'genomics',
    'healthdcatap:ageRange': '0-17',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:sensitiveCategory': 'genomics',
    'healthdcatap:clinicalTrialPhase': 'Phase I',
    'healthdcatap:euCtNumber': '2025-530123-99-DE',
    'healthdcatap:sponsor': { name: 'Charité Forschung GmbH', type: 'academic', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'CONGENITAL', name: 'Congenital, Familial and Genetic Disorders' },
    'healthdcatap:memberStates': ['DE', 'FR'],
    'healthdcatap:medDRA': {
      socCode: '10010331',
      socName: 'Congenital, familial and genetic disorders',
      ptCode: '10061234',
      ptName: 'Genetic disorder'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 0 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'genetic-research'],
      restrictions: ['no-reidentification', 'confidential-computing'],
      validUntil: '2030-12-31',
      grantor: 'Parent/Guardian (Pseudonym: G9R4X2)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.0.0',
    'adms:versionNotes': 'Initial release with WES data and phenotype annotations',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-06-15',
    'dct:modified': '2024-12-01',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/QUARTERLY',
    'dct:temporal': { startDate: '2023-01-01', endDate: '2024-06-30' },
    'dcat:temporalResolution': 'P1D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 524288,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Data available under research agreement with IRB approval and consent verification',
    },
    'adms:sample': {
      title: 'Sample EHR Records (5 anonymized)',
      description: 'Preview subset for evaluation',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR021',
      byteSize: 51200,
    },
    'dcat:accessService': {
      title: 'EHR Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.92, keywordRichness: 0.88 },
      accessibility: { endpointAvailability: 0.995, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.97, vocabularyCoverage: 0.91 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.89, consentGranularity: 'study-specific', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR001',
    '@type': 'dcat:Dataset',
    'dct:title': 'Type 2 Diabetes with CV Risk',
    'dct:description': 'Type 2 diabetes mellitus with cardiovascular comorbidities',
    'dcat:keyword': ['diabetes', 'cardiovascular', 'metabolic'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',  // EHDS Regulation
      'http://data.europa.eu/eli/reg/2016/679/oj',  // GDPR
      'http://data.europa.eu/eli/reg/2022/868/oj',  // Data Governance Act
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': [
      'http://publications.europa.eu/resource/authority/data-theme/HEAL',
    ],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
      'http://publications.europa.eu/resource/authority/country/NLD',
      'http://publications.europa.eu/resource/authority/country/ESP',
    ],
    'dct:provenance': {
      'rdfs:label': 'Longitudinal diabetes registry data from Rheinland Universitätsklinikum clinical trial systems',
      'dct:source': 'Diabetes Care Registry - Diabeteszentrum Rheinland',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#VitalSigns',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',      // Consent
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',      // Scientific research
    ],
    'healthdcatap:publisherNote': 'Data from Phase III clinical trial with HbA1c monitoring. Ethics approval: Ethikkommission Nordrhein Ref: 2024-NR-0123.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    // dct:identifier - MANDATORY persistent URI
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR001',
    // dcat:contactPoint - MANDATORY
    'dcat:contactPoint': [
      {
        '@type': 'vcard:Kind',
        'vcard:fn': 'Dr. Thomas Schneider',
        'vcard:hasEmail': 'mailto:t.schneider@rheinland-uklinikum.de',
        'vcard:hasTelephone': 'tel:+49-221-478-5200',
        'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Diabeteszentrum',
        'vcard:hasRole': 'Clinical Data Manager',
      },
    ],
    // dct:publisher - MANDATORY
    'dct:publisher': {
      '@type': 'foaf:Agent',
      'foaf:name': 'Rheinland Universitätsklinikum',
      'foaf:homepage': 'https://www.rheinland-uklinikum.de',
      'dct:type': 'http://purl.org/adms/publishertype/Academia',
      'vcard:hasAddress': {
        'vcard:street-address': 'Kerpener Straße 62',
        'vcard:locality': 'Köln',
        'vcard:postal-code': '50937',
        'vcard:country-name': 'Germany',
      },
    },
    // healthdcatap:analytics - RECOMMENDED with Confidential Computing
    'healthdcatap:analytics': {
      'dct:title': 'Diabetes Registry - HbA1c Trend Analysis Report',
      'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR001',
      'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV',
      'confidentialComputing': true,  // TEE-based secure analytics
    },
    // dqv:hasQualityAnnotation - RECOMMENDED
    'dqv:hasQualityAnnotation': {
      '@type': 'dqv:QualityCertificate',
      'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR001',
      'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR001-2024',
      'oa:motivatedBy': 'dqv:qualityAssessment',
    },
    // dct:source - RECOMMENDED
    'dct:source': [
      'https://www.rheinland-uklinikum.de/data/diabetes-registry',
    ],
    // dct:alternative - OPTIONAL
    'dct:alternative': 'T2D-CV-2024',
    // ========== RECOMMENDED HealthDCAT-AP Properties ==========
    'healthdcatap:minTypicalAge': 55,
    'healthdcatap:maxTypicalAge': 64,
    'healthdcatap:numberOfRecords': 2847,
    'healthdcatap:numberOfUniqueIndividuals': 156,
    'healthdcatap:populationCoverage': 'Adult patients with Type 2 diabetes and cardiovascular comorbidities across EU partner sites',
    'healthdcatap:hasCodingSystem': [
      'https://www.wikidata.org/entity/Q15629608',  // ICD-10-GM
      'https://www.wikidata.org/entity/Q744434',   // LOINC
      'https://www.wikidata.org/entity/Q192093',   // ATC
      'https://www.wikidata.org/entity/Q19597236', // FHIR R4
    ],
    'healthdcatap:hasCodeValues': [
      'ICD-10-GM:E11.9',   // Type 2 diabetes
      'ICD-10-GM:I25.9',   // Chronic ischemic heart disease
      'LOINC:4548-4',      // HbA1c
      'ATC:A10B',          // Blood glucose lowering drugs
    ],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q3025883',   // Type 2 diabetes mellitus
      'https://www.wikidata.org/entity/Q389735',    // Cardiovascular disease
      'https://www.wikidata.org/entity/Q133212',    // Metabolic syndrome
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2022-06-01',
      endDate: '2032-12-31',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-diabetes-cv-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': [
      'http://hl7.org/fhir/R4',
      'https://www.hl7.de/de/isik/',
      'https://simplifier.net/kbv',
    ],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'E11.9',
    'healthdcatap:diagnosis': 'Type 2 diabetes mellitus',
    'healthdcatap:category': 'endocrine',
    'healthdcatap:ageRange': '55-64',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase III',
    'healthdcatap:euCtNumber': '2024-501234-12-DE',
    'healthdcatap:sponsor': { name: 'NordPharma AG', type: 'commercial', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'ENDOCRINE', name: 'Endocrinology/Diabetology' },
    'healthdcatap:memberStates': ['DE', 'FR', 'NL', 'ES'],
    'healthdcatap:medDRA': {
      socCode: '10027433',
      socName: 'Metabolism and nutrition disorders',
      ptCode: '10012601',
      ptName: 'Diabetes mellitus'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'real-world-evidence'],
      restrictions: ['no-reidentification'],
      validUntil: '2027-12-31',
      grantor: 'Patient (Pseudonym: A7X9K2)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '2.1.0',
    'adms:versionNotes': 'Updated with cardiovascular risk markers and HbA1c trends',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-01-15',
    'dct:modified': '2024-11-30',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/MONTHLY',
    'dct:temporal': { startDate: '2022-06-01', endDate: '2024-09-30' },
    'dcat:temporalResolution': 'P1D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 1048576,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/', 'https://simplifier.net/kbv'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Data available for clinical research with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample Diabetes Records (10 anonymized)',
      description: 'Preview subset with glucose monitoring and medication data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR001',
      byteSize: 102400,
    },
    'dcat:accessService': {
      title: 'Diabetes RWE Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/diabetes',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/diabetes-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.96, keywordRichness: 0.92 },
      accessibility: { endpointAvailability: 0.999, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.98, vocabularyCoverage: 0.95 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.94, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR002',
    '@type': 'dcat:Dataset',
    'dct:title': 'Chronic Heart Failure (HFrEF)',
    'dct:description': 'Heart failure with reduced ejection fraction',
    'dcat:keyword': ['heart failure', 'cardiology', 'HFrEF'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',  // EHDS Regulation
      'http://data.europa.eu/eli/reg/2016/679/oj',  // GDPR
      'http://data.europa.eu/eli/reg/2022/868/oj',  // Data Governance Act
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': [
      'http://publications.europa.eu/resource/authority/data-theme/HEAL',
    ],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
      'http://healthdata.ec.europa.eu/authority/health-category/MEDICAL_REG',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/AUT',
      'http://publications.europa.eu/resource/authority/country/NLD',
    ],
    'dct:provenance': {
      'rdfs:label': 'Heart failure registry data from Rheinland University Hospital cardiology department',
      'dct:source': 'Cardiology Registry - Kardiologisches Zentrum Rheinland',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#VitalSigns',
      'https://w3id.org/dpv/dpv-pd#Biometric',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',      // Consent
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',      // Scientific research
    ],
    'healthdcatap:publisherNote': 'Phase IV real-world evidence study. Includes echocardiography and biomarker data. Ethics: Ethikkommission Nordrhein Ref: 2023-NR-0456.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    // dct:identifier - MANDATORY persistent URI
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR002',
    // dcat:contactPoint - MANDATORY
    'dcat:contactPoint': [
      {
        '@type': 'vcard:Kind',
        'vcard:fn': 'Dr. Michael Weber',
        'vcard:hasEmail': 'mailto:m.weber@rheinland-uklinikum.de',
        'vcard:hasTelephone': 'tel:+49-221-478-5300',
        'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Kardiologie',
        'vcard:hasRole': 'Clinical Data Manager',
      },
    ],
    // dct:publisher - MANDATORY
    'dct:publisher': {
      '@type': 'foaf:Agent',
      'foaf:name': 'Rheinland Universitätsklinikum',
      'foaf:homepage': 'https://www.rheinland-uklinikum.de',
      'dct:type': 'http://purl.org/adms/publishertype/Academia',
      'vcard:hasAddress': {
        'vcard:street-address': 'Kerpener Straße 62',
        'vcard:locality': 'Köln',
        'vcard:postal-code': '50937',
        'vcard:country-name': 'Germany',
      },
    },
    // healthdcatap:analytics - RECOMMENDED with Confidential Computing
    'healthdcatap:analytics': {
      'dct:title': 'Heart Failure Registry - EF Analysis Report',
      'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR002',
      'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV',
      'confidentialComputing': true,  // TEE-based secure analytics
    },
    // dqv:hasQualityAnnotation - RECOMMENDED
    'dqv:hasQualityAnnotation': {
      '@type': 'dqv:QualityCertificate',
      'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR002',
      'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR002-2024',
      'oa:motivatedBy': 'dqv:qualityAssessment',
    },
    // dct:source - RECOMMENDED
    'dct:source': [
      'https://www.rheinland-uklinikum.de/data/cardiology-registry',
    ],
    // dct:alternative - OPTIONAL
    'dct:alternative': 'HFrEF-RWE-2024',
    // ========== RECOMMENDED HealthDCAT-AP Properties ==========
    'healthdcatap:minTypicalAge': 65,
    'healthdcatap:maxTypicalAge': 74,
    'healthdcatap:numberOfRecords': 1523,
    'healthdcatap:numberOfUniqueIndividuals': 89,
    'healthdcatap:populationCoverage': 'Patients with HFrEF (EF<40%) in Rhine region cardiology network',
    'healthdcatap:hasCodingSystem': [
      'https://www.wikidata.org/entity/Q15629608',  // ICD-10-GM
      'https://www.wikidata.org/entity/Q744434',   // LOINC
      'https://www.wikidata.org/entity/Q2743',     // MedDRA
      'https://www.wikidata.org/entity/Q19597236', // FHIR R4
    ],
    'healthdcatap:hasCodeValues': [
      'ICD-10-GM:I50.9',   // Heart failure
      'ICD-10-GM:I42.0',   // Dilated cardiomyopathy
      'LOINC:33762-6',     // NT-proBNP
      'LOINC:10230-1',     // Ejection fraction
      'MedDRA:10019279',   // Heart failure PT
    ],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q181754',    // Heart failure
      'https://www.wikidata.org/entity/Q389735',    // Cardiovascular disease
      'https://www.wikidata.org/entity/Q190805',    // Cardiomyopathy
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2022-01-15',
      endDate: '2032-11-30',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-heart-failure-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': [
      'http://hl7.org/fhir/R4',
      'https://www.hl7.de/de/isik/',
    ],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'I50.9',
    'healthdcatap:diagnosis': 'Heart failure',
    'healthdcatap:category': 'cardiology',
    'healthdcatap:ageRange': '65-74',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase IV',
    'healthdcatap:euCtNumber': '2023-487652-41-DE',
    'healthdcatap:sponsor': { name: 'Rhenus Therapeutics GmbH', type: 'commercial', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'CARDIO', name: 'Cardiovascular' },
    'healthdcatap:memberStates': ['DE', 'AT', 'NL'],
    'healthdcatap:medDRA': {
      socCode: '10007541',
      socName: 'Cardiac disorders',
      ptCode: '10019279',
      ptName: 'Heart failure'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'public-health'],
      restrictions: ['no-reidentification', 'no-commercial'],
      validUntil: '2028-06-30',
      grantor: 'Patient (Pseudonym: B8Y3L5)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.3.0',
    'adms:versionNotes': 'Added echocardiography data and NT-proBNP biomarker trends',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2023-09-01',
    'dct:modified': '2024-12-10',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/BIMONTHLY',
    'dct:temporal': { startDate: '2022-01-15', endDate: '2024-11-30' },
    'dcat:temporalResolution': 'P1D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 786432,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'b2c3d4e5f6a789012345678901234567890bcdef1234567890abcdef123456ab' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_ND_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Non-commercial research only with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample Heart Failure Records (5 anonymized)',
      description: 'Preview subset with ejection fraction and biomarker data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR002',
      byteSize: 76800,
    },
    'dcat:accessService': {
      title: 'Cardiology Registry Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/cardiology',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/cardiology-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.94, keywordRichness: 0.90 },
      accessibility: { endpointAvailability: 0.998, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.97, vocabularyCoverage: 0.93 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.91, consentGranularity: 'study-specific', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR003',
    '@type': 'dcat:Dataset',
    'dct:title': 'Breast Cancer (Remission)',
    'dct:description': 'Breast cancer in remission post-treatment',
    'dcat:keyword': ['oncology', 'breast cancer', 'survivor'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',  // EHDS Regulation
      'http://data.europa.eu/eli/reg/2016/679/oj',  // GDPR
      'http://data.europa.eu/eli/reg/2022/868/oj',  // Data Governance Act
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': [
      'http://publications.europa.eu/resource/authority/data-theme/HEAL',
    ],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
      'http://healthdata.ec.europa.eu/authority/health-category/PUBLIC_HEALTH_REG',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
    ],
    'dct:provenance': {
      'rdfs:label': 'Oncology registry data from DKFZ and Rheinland University Hospital tumor center',
      'dct:source': 'Krebsregister Rheinland-Pfalz / DKFZ Clinical Cancer Registry',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#PhysicalHealth',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',      // Consent
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',      // Scientific research
    ],
    'healthdcatap:publisherNote': 'Academic oncology trial. No genetic analysis permitted. Ethics: Ethikkommission Baden-Württemberg Ref: 2024-BW-0234.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Academic',
    // dct:identifier - MANDATORY persistent URI
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR003',
    // dcat:contactPoint - MANDATORY
    'dcat:contactPoint': [
      {
        '@type': 'vcard:Kind',
        'vcard:fn': 'Dr. Anna Fischer',
        'vcard:hasEmail': 'mailto:a.fischer@rheinland-uklinikum.de',
        'vcard:hasTelephone': 'tel:+49-221-478-5400',
        'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Onkologie',
        'vcard:hasRole': 'Clinical Research Coordinator',
      },
    ],
    // dct:publisher - MANDATORY
    'dct:publisher': {
      '@type': 'foaf:Agent',
      'foaf:name': 'Rheinland Universitätsklinikum',
      'foaf:homepage': 'https://www.rheinland-uklinikum.de',
      'dct:type': 'http://purl.org/adms/publishertype/Academia',
      'vcard:hasAddress': {
        'vcard:street-address': 'Kerpener Straße 62',
        'vcard:locality': 'Köln',
        'vcard:postal-code': '50937',
        'vcard:country-name': 'Germany',
      },
    },
    // healthdcatap:analytics - RECOMMENDED with Confidential Computing
    'healthdcatap:analytics': {
      'dct:title': 'Breast Cancer Survival Analysis Report',
      'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR003',
      'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV',
      'confidentialComputing': true,  // TEE-based secure analytics
    },
    // dqv:hasQualityAnnotation - RECOMMENDED
    'dqv:hasQualityAnnotation': {
      '@type': 'dqv:QualityCertificate',
      'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR003',
      'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR003-2024',
      'oa:motivatedBy': 'dqv:qualityAssessment',
    },
    // dct:source - RECOMMENDED
    'dct:source': [
      'https://www.rheinland-uklinikum.de/data/tumor-registry',
    ],
    // dct:alternative - OPTIONAL
    'dct:alternative': 'BC-REM-2024',
    // ========== RECOMMENDED HealthDCAT-AP Properties ==========
    'healthdcatap:minTypicalAge': 45,
    'healthdcatap:maxTypicalAge': 54,
    'healthdcatap:numberOfRecords': 892,
    'healthdcatap:numberOfUniqueIndividuals': 67,
    'healthdcatap:populationCoverage': 'Female breast cancer patients in remission from Baden-Württemberg tumor registry',
    'healthdcatap:hasCodingSystem': [
      'https://www.wikidata.org/entity/Q15629608',  // ICD-10-GM
      'https://www.wikidata.org/entity/Q2743',     // MedDRA
      'https://www.wikidata.org/entity/Q19597236', // FHIR R4
    ],
    'healthdcatap:hasCodeValues': [
      'ICD-10-GM:C50.9',   // Breast cancer
      'ICD-10-GM:Z85.3',   // Personal history of breast cancer
      'MedDRA:10006187',   // Breast cancer PT
      'MedDRA:10029104',   // Neoplasms SOC
    ],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q128581',    // Breast cancer
      'https://www.wikidata.org/entity/Q12078',     // Cancer
      'https://www.wikidata.org/entity/Q7164',      // Tumor
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2023-06-01',
      endDate: '2033-09-30',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-breast-cancer-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': [
      'http://hl7.org/fhir/R4',
      'https://www.hl7.de/de/isik/',
      'http://hl7.org/fhir/us/mcode',
    ],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'C50.9',
    'healthdcatap:diagnosis': 'Malignant neoplasm of breast',
    'healthdcatap:category': 'oncology',
    'healthdcatap:ageRange': '45-54',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase II',
    'healthdcatap:euCtNumber': '2024-512876-23-DE',
    'healthdcatap:sponsor': { name: 'DKFZ Heidelberg', type: 'academic', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'ANTINEOPL', name: 'Antineoplastic and Immunomodulating Agents' },
    'healthdcatap:memberStates': ['DE'],
    'healthdcatap:medDRA': {
      socCode: '10029104',
      socName: 'Neoplasms benign, malignant and unspecified',
      ptCode: '10006187',
      ptName: 'Breast cancer'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 3 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'academic-research'],
      restrictions: ['no-reidentification', 'no-genetic'],
      validUntil: '2026-12-31',
      grantor: 'Patient (Pseudonym: C2Z4M7)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.2.0',
    'adms:versionNotes': 'Added tumor marker trends and treatment response data',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-03-01',
    'dct:modified': '2024-11-15',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/QUARTERLY',
    'dct:temporal': { startDate: '2023-06-01', endDate: '2024-09-30' },
    'dcat:temporalResolution': 'P7D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 655360,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'c3d4e5f6a7b89012345678901234567890cdef1234567890abcdef123456abc1' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/', 'http://hl7.org/fhir/us/mcode'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Academic research only - no genetic analysis permitted',
    },
    'adms:sample': {
      title: 'Sample Oncology Records (3 anonymized)',
      description: 'Preview subset with staging and treatment data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR003',
      byteSize: 61440,
    },
    'dcat:accessService': {
      title: 'Oncology Registry Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/oncology',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/oncology-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.93, keywordRichness: 0.89 },
      accessibility: { endpointAvailability: 0.997, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.96, vocabularyCoverage: 0.92 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.90, consentGranularity: 'study-specific', deidentificationLevel: 'Expert-Determination' },
    },
  },
  {
    '@id': 'asset:ehr:EHR004',
    '@type': 'dcat:Dataset',
    'dct:title': 'Prostate Cancer (Active Surveillance)',
    'dct:description': 'Low-grade prostate cancer under surveillance',
    'dcat:keyword': ['oncology', 'prostate cancer', 'surveillance'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/PUBLIC_HEALTH_REG',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/BEL',
      'http://publications.europa.eu/resource/authority/country/NLD',
    ],
    'dct:provenance': {
      'rdfs:label': 'Prostate cancer surveillance registry from EU Oncology Consortium multi-site study',
      'dct:source': 'European Prostate Cancer Registry Network',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Active surveillance registry. Ethics: Multi-site approval EU-OC-2023-0055.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Registry',
    // dct:identifier - MANDATORY persistent URI
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR004',
    // dcat:contactPoint - MANDATORY
    'dcat:contactPoint': [
      {
        '@type': 'vcard:Kind',
        'vcard:fn': 'Dr. Peter Hoffmann',
        'vcard:hasEmail': 'mailto:p.hoffmann@rheinland-uklinikum.de',
        'vcard:hasTelephone': 'tel:+49-221-478-5500',
        'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Urologie',
        'vcard:hasRole': 'Registry Coordinator',
      },
    ],
    // dct:publisher - MANDATORY
    'dct:publisher': {
      '@type': 'foaf:Agent',
      'foaf:name': 'Rheinland Universitätsklinikum',
      'foaf:homepage': 'https://www.rheinland-uklinikum.de',
      'dct:type': 'http://purl.org/adms/publishertype/Academia',
      'vcard:hasAddress': {
        'vcard:street-address': 'Kerpener Straße 62',
        'vcard:locality': 'Köln',
        'vcard:postal-code': '50937',
        'vcard:country-name': 'Germany',
      },
    },
    // healthdcatap:analytics - RECOMMENDED with Confidential Computing
    'healthdcatap:analytics': {
      'dct:title': 'Prostate Cancer Surveillance Report',
      'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR004',
      'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV',
      'confidentialComputing': true,  // TEE-based secure analytics
    },
    // dqv:hasQualityAnnotation - RECOMMENDED
    'dqv:hasQualityAnnotation': {
      '@type': 'dqv:QualityCertificate',
      'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR004',
      'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR004-2024',
      'oa:motivatedBy': 'dqv:qualityAssessment',
    },
    // dct:source - RECOMMENDED
    'dct:source': [
      'https://www.rheinland-uklinikum.de/data/urology-registry',
    ],
    // dct:alternative - OPTIONAL
    'dct:alternative': 'PC-SURV-2024',
    'healthdcatap:minTypicalAge': 65,
    'healthdcatap:maxTypicalAge': 74,
    'healthdcatap:numberOfRecords': 523,
    'healthdcatap:numberOfUniqueIndividuals': 78,
    'healthdcatap:populationCoverage': 'Male patients with low-grade prostate cancer under active surveillance in EU network',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:C61', 'MedDRA:10036910'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q181257',    // Prostate cancer
      'https://www.wikidata.org/entity/Q12078',     // Cancer
      'https://www.wikidata.org/entity/Q7164',      // Tumor
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2021-01-01',
      endDate: '2031-10-15',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-prostate-cancer-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'C61',
    'healthdcatap:diagnosis': 'Malignant neoplasm of prostate',
    'healthdcatap:category': 'oncology',
    'healthdcatap:ageRange': '65-74',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Not Applicable',
    'healthdcatap:euCtNumber': '2023-498123-55-DE',
    'healthdcatap:sponsor': { name: 'EU Oncology Consortium', type: 'non-profit', country: 'BE' },
    'healthdcatap:therapeuticArea': { code: 'ANTINEOPL', name: 'Antineoplastic and Immunomodulating Agents' },
    'healthdcatap:memberStates': ['DE', 'BE', 'NL'],
    'healthdcatap:medDRA': {
      socCode: '10029104',
      socName: 'Neoplasms benign, malignant and unspecified',
      ptCode: '10036910',
      ptName: 'Prostate cancer'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 0 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation'],
      restrictions: ['no-reidentification', 'no-third-party'],
      validUntil: '2027-03-31',
      grantor: 'Patient (Pseudonym: D5N8P2)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.1.0',
    'adms:versionNotes': 'Added PSA velocity trends and Gleason score history',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2023-11-01',
    'dct:modified': '2024-10-20',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/ANNUAL',
    'dct:temporal': { startDate: '2021-01-01', endDate: '2024-10-15' },
    'dcat:temporalResolution': 'P30D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 409600,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'd4e5f6a7b8c9012345678901234567890def1234567890abcdef123456abcd12' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_SA_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Registry research only - no third-party sharing',
    },
    'adms:sample': {
      title: 'Sample Surveillance Records (5 anonymized)',
      description: 'Preview subset with PSA and imaging data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR004',
      byteSize: 40960,
    },
    'dcat:accessService': {
      title: 'Prostate Registry Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/prostate',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/prostate-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.91, keywordRichness: 0.87 },
      accessibility: { endpointAvailability: 0.996, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.95, vocabularyCoverage: 0.90 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.88, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR005',
    '@type': 'dcat:Dataset',
    'dct:title': 'COPD with Emphysema',
    'dct:description': 'Chronic obstructive pulmonary disease with emphysema',
    'dcat:keyword': ['pulmonology', 'COPD', 'emphysema'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
      'http://publications.europa.eu/resource/authority/country/NLD',
      'http://publications.europa.eu/resource/authority/country/ESP',
    ],
    'dct:provenance': {
      'rdfs:label': 'COPD clinical trial data from BioMedTech Phase III study',
      'dct:source': 'Pulmonary Research Network - Lungenforschung Rheinland',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#VitalSigns',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase III COPD trial with spirometry data. Ethics: Ethikkommission Nordrhein Ref: 2024-NR-0234.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR005',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Klaus Schmidt', 'vcard:hasEmail': 'mailto:k.schmidt@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-5600', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Pneumologie', 'vcard:hasRole': 'Clinical Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'COPD Registry Analysis Report', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR005', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR005', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR005-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/pulmonology-registry'],
    'dct:alternative': 'COPD-REG-2024',
    'healthdcatap:minTypicalAge': 55,
    'healthdcatap:maxTypicalAge': 64,
    'healthdcatap:numberOfRecords': 1847,
    'healthdcatap:numberOfUniqueIndividuals': 134,
    'healthdcatap:populationCoverage': 'Adult COPD patients with emphysema across EU partner respiratory centers',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q744434', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:J44.9', 'ICD-10-GM:J43.9', 'LOINC:19926-5'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q35869',     // COPD
      'https://www.wikidata.org/entity/Q3286546',   // Emphysema
      'https://www.wikidata.org/entity/Q161635',    // Chronic bronchitis
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2022-03-15',
      endDate: '2032-10-31',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-copd-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'J44.9',
    'healthdcatap:diagnosis': 'COPD',
    'healthdcatap:category': 'pulmonology',
    'healthdcatap:ageRange': '55-64',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase III',
    'healthdcatap:euCtNumber': '2024-503987-18-DE',
    'healthdcatap:sponsor': { name: 'BioMedTech Europa SE', type: 'commercial', country: 'NL' },
    'healthdcatap:therapeuticArea': { code: 'PULMONOLOGY', name: 'Pulmonology' },
    'healthdcatap:memberStates': ['DE', 'FR', 'NL', 'ES'],
    'healthdcatap:medDRA': {
      socCode: '10038738',
      socName: 'Respiratory, thoracic and mediastinal disorders',
      ptCode: '10009033',
      ptName: 'Chronic obstructive pulmonary disease'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'real-world-evidence', 'public-health'],
      restrictions: ['no-reidentification'],
      validUntil: '2028-12-31',
      grantor: 'Patient (Pseudonym: E9Q1R4)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.4.0',
    'adms:versionNotes': 'Added spirometry trends and exacerbation history',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-02-01',
    'dct:modified': '2024-11-25',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/QUARTERLY',
    'dct:temporal': { startDate: '2022-03-15', endDate: '2024-10-31' },
    'dcat:temporalResolution': 'P1D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 524288,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'e5f6a789012345678901234567890abcdef1234567890abcdef123456abcdef12' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for respiratory research with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample COPD Records (8 anonymized)',
      description: 'Preview subset with pulmonary function tests and exacerbation data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR005',
      byteSize: 51200,
    },
    'dcat:accessService': {
      title: 'Pulmonology Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/pulmonology',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/pulmonology-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.93, keywordRichness: 0.88 },
      accessibility: { endpointAvailability: 0.997, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.96, vocabularyCoverage: 0.92 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.90, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR006',
    '@type': 'dcat:Dataset',
    'dct:title': 'Multiple Sclerosis (RRMS)',
    'dct:description': 'Relapsing-remitting multiple sclerosis',
    'dcat:keyword': ['neurology', 'MS', 'autoimmune'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
      'http://healthdata.ec.europa.eu/authority/health-category/MEDICAL_REG',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
    ],
    'dct:provenance': {
      'rdfs:label': 'Multiple sclerosis registry data from Helmholtz Institute neuroimaging study',
      'dct:source': 'MS Registry - Nationales MS-Register',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#Biometric',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase II MS trial with MRI data. Ethics: Ethikkommission Charité Ref: 2024-CH-0189.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Academic',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR006',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Sabine Richter', 'vcard:hasEmail': 'mailto:s.richter@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-5700', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Neurologie', 'vcard:hasRole': 'Research Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'MS Registry MRI Analysis Report', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR006', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR006', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR006-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/ms-registry'],
    'dct:alternative': 'MS-MRI-2024',
    'healthdcatap:minTypicalAge': 25,
    'healthdcatap:maxTypicalAge': 34,
    'healthdcatap:numberOfRecords': 678,
    'healthdcatap:numberOfUniqueIndividuals': 45,
    'healthdcatap:populationCoverage': 'RRMS patients aged 25-34 in German MS registry network',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:G35', 'MedDRA:10028155'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q134561',    // Multiple sclerosis
      'https://www.wikidata.org/entity/Q210392',    // Autoimmune disease
      'https://www.wikidata.org/entity/Q1054718',   // Demyelinating disease
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2021-09-01',
      endDate: '2031-11-15',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-ms-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'G35',
    'healthdcatap:diagnosis': 'Multiple sclerosis',
    'healthdcatap:category': 'neurology',
    'healthdcatap:ageRange': '25-34',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase II',
    'healthdcatap:euCtNumber': '2024-518234-67-DE',
    'healthdcatap:sponsor': { name: 'Charité Forschung GmbH', type: 'academic', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'NERVOUS', name: 'Nervous System' },
    'healthdcatap:memberStates': ['DE'],
    'healthdcatap:medDRA': {
      socCode: '10029205',
      socName: 'Nervous system disorders',
      ptCode: '10028245',
      ptName: 'Multiple sclerosis'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'ai-training'],
      restrictions: ['no-reidentification', 'no-commercial'],
      validUntil: '2029-06-30',
      grantor: 'Patient (Pseudonym: F3S6T8)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '2.0.0',
    'adms:versionNotes': 'Added MRI lesion counts, EDSS progression, and relapse history',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-03-15',
    'dct:modified': '2024-12-01',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/QUARTERLY',
    'dct:temporal': { startDate: '2021-09-01', endDate: '2024-11-15' },
    'dcat:temporalResolution': 'P1M',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 983040,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'f6a789012345678901234567890abcdef1234567890abcdef123456abcdef1234' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_ND_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Academic research only with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample MS Records (6 anonymized)',
      description: 'Preview subset with EDSS scores and treatment response data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR006',
      byteSize: 92160,
    },
    'dcat:accessService': {
      title: 'Neurology Registry Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/neurology',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/neurology-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.95, keywordRichness: 0.91 },
      accessibility: { endpointAvailability: 0.999, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.97, vocabularyCoverage: 0.94 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.93, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR007',
    '@type': 'dcat:Dataset',
    'dct:title': 'Rheumatoid Arthritis',
    'dct:description': 'Seropositive rheumatoid arthritis',
    'dcat:keyword': ['rheumatology', 'RA', 'autoimmune'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
      'http://publications.europa.eu/resource/authority/country/NLD',
      'http://publications.europa.eu/resource/authority/country/ESP',
    ],
    'dct:provenance': {
      'rdfs:label': 'Rheumatoid arthritis Phase III clinical trial data from NordPharma multi-center study',
      'dct:source': 'Rheumatology Research Network - Rheumazentrum Rheinland',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase III RA trial with DAS28 monitoring. Ethics: Ethikkommission Nordrhein Ref: 2024-NR-0345.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR007',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Hans Weber', 'vcard:hasEmail': 'mailto:h.weber@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-5800', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Rheumatologie', 'vcard:hasRole': 'Research Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'RA Trial DAS28 Outcome Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR007', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR007', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR007-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/ra-registry'],
    'dct:alternative': 'RA-TRIAL-2024',
    'healthdcatap:minTypicalAge': 45,
    'healthdcatap:maxTypicalAge': 54,
    'healthdcatap:numberOfRecords': 1234,
    'healthdcatap:numberOfUniqueIndividuals': 98,
    'healthdcatap:populationCoverage': 'Adult RA patients with seropositive disease across EU partner rheumatology centers',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:M05.9', 'MedDRA:10039073'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q8277',      // Rheumatoid arthritis
      'https://www.wikidata.org/entity/Q210392',    // Autoimmune disease
      'https://www.wikidata.org/entity/Q188874',    // Arthritis
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2022-02-01',
      endDate: '2032-08-31',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-ra-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'M05.9',
    'healthdcatap:diagnosis': 'Rheumatoid arthritis',
    'healthdcatap:category': 'rheumatology',
    'healthdcatap:ageRange': '45-54',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase III',
    'healthdcatap:euCtNumber': '2024-505612-34-DE',
    'healthdcatap:sponsor': { name: 'NordPharma AG', type: 'commercial', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'RHEUMATOLOGY', name: 'Rheumatology' },
    'healthdcatap:memberStates': ['DE', 'FR', 'NL', 'ES'],
    'healthdcatap:medDRA': {
      socCode: '10028395',
      socName: 'Musculoskeletal and connective tissue disorders',
      ptCode: '10039073',
      ptName: 'Rheumatoid arthritis'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'academic-research'],
      restrictions: ['no-reidentification', 'no-indefinite-storage'],
      validUntil: '2026-09-30',
      grantor: 'Patient (Pseudonym: G7U2V9)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.2.0',
    'adms:versionNotes': 'Updated with DAS28 scores and biologic treatment response',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2023-11-01',
    'dct:modified': '2024-10-15',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/MONTHLY',
    'dct:temporal': { startDate: '2022-02-01', endDate: '2024-08-31' },
    'dcat:temporalResolution': 'P1M',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 655360,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'a789012345678901234567890abcdef1234567890abcdef123456abcdef123456' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for rheumatology research with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample RA Records (7 anonymized)',
      description: 'Preview subset with disease activity scores and treatment history',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR007',
      byteSize: 61440,
    },
    'dcat:accessService': {
      title: 'Rheumatology Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/rheumatology',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/rheumatology-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.92, keywordRichness: 0.87 },
      accessibility: { endpointAvailability: 0.998, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.95, vocabularyCoverage: 0.91 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.89, consentGranularity: 'study-specific', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR008',
    '@type': 'dcat:Dataset',
    'dct:title': 'Chronic Kidney Disease Stage 4',
    'dct:description': 'CKD stage 4 with diabetic nephropathy',
    'dcat:keyword': ['nephrology', 'CKD', 'diabetic nephropathy'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
      'http://healthdata.ec.europa.eu/authority/health-category/MEDICAL_REG',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/AUT',
    ],
    'dct:provenance': {
      'rdfs:label': 'CKD registry data from Universitätsklinikum Köln nephrology department',
      'dct:source': 'German CKD Registry - Deutsches Nierenregister',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#DrugTestResult',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase IV CKD registry with eGFR monitoring. Ethics: Ethikkommission Köln Ref: 2023-UK-0567.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Academic',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR008',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Petra Hoffmann', 'vcard:hasEmail': 'mailto:p.hoffmann@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-5900', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Nephrologie', 'vcard:hasRole': 'Research Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'CKD Registry eGFR Trends Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR008', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR008', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR008-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/ckd-registry'],
    'dct:alternative': 'CKD-REG-2024',
    'healthdcatap:minTypicalAge': 65,
    'healthdcatap:maxTypicalAge': 74,
    'healthdcatap:numberOfRecords': 2156,
    'healthdcatap:numberOfUniqueIndividuals': 123,
    'healthdcatap:populationCoverage': 'CKD stage 4 patients with diabetic nephropathy in German-Austrian registry network',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q744434', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:N18.4', 'ICD-10-GM:E11.2', 'LOINC:33914-3'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q476921',    // Chronic kidney disease
      'https://www.wikidata.org/entity/Q208414',    // Diabetic nephropathy
      'https://www.wikidata.org/entity/Q3025883',   // Type 2 diabetes mellitus
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2021-01-01',
      endDate: '2031-10-31',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-ckd-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'N18.4',
    'healthdcatap:diagnosis': 'Chronic kidney disease, stage 4',
    'healthdcatap:category': 'nephrology',
    'healthdcatap:ageRange': '65-74',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase IV',
    'healthdcatap:euCtNumber': '2023-492145-78-DE',
    'healthdcatap:sponsor': { name: 'Universitätsklinikum Köln', type: 'academic', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'NEPHROLOGY', name: 'Nephrology' },
    'healthdcatap:memberStates': ['DE', 'AT'],
    'healthdcatap:medDRA': {
      socCode: '10038359',
      socName: 'Renal and urinary disorders',
      ptCode: '10064848',
      ptName: 'Chronic kidney disease'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 2 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'real-world-evidence'],
      restrictions: ['no-reidentification'],
      validUntil: '2027-12-31',
      grantor: 'Patient (Pseudonym: H1W5X3)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.5.0',
    'adms:versionNotes': 'Added eGFR trends, proteinuria measurements, and dialysis readiness assessment',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2023-06-15',
    'dct:modified': '2024-11-20',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/MONTHLY',
    'dct:temporal': { startDate: '2021-01-01', endDate: '2024-10-31' },
    'dcat:temporalResolution': 'P1W',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 1310720,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'b789012345678901234567890abcdef1234567890abcdef123456abcdef1234ab' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for nephrology research with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample CKD Records (10 anonymized)',
      description: 'Preview subset with renal function trends and comorbidity data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR008',
      byteSize: 122880,
    },
    'dcat:accessService': {
      title: 'Nephrology Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/nephrology',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/nephrology-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.94, keywordRichness: 0.89 },
      accessibility: { endpointAvailability: 0.999, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.97, vocabularyCoverage: 0.93 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.92, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR009',
    '@type': 'dcat:Dataset',
    'dct:title': 'Major Depressive Disorder',
    'dct:description': 'Recurrent major depressive disorder, moderate',
    'dcat:keyword': ['psychiatry', 'depression', 'mental health'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
      'http://publications.europa.eu/resource/authority/country/NLD',
    ],
    'dct:provenance': {
      'rdfs:label': 'Major depressive disorder Phase II/III clinical trial data from Charité psychiatry department',
      'dct:source': 'Psychiatric Research Network - Psychiatrisches Forschungsnetzwerk',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#MentalHealth',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-a',
    ],
    'healthdcatap:publisherNote': 'Sensitive mental health data - strictly academic research only. Ethics: Ethikkommission Charité Ref: 2024-CH-0234.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Academic',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR009',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Julia Neumann', 'vcard:hasEmail': 'mailto:j.neumann@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6000', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Psychiatrie', 'vcard:hasRole': 'Clinical Research Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'MDD Treatment Response Report', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR009', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR009', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR009-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/psychiatry-registry'],
    'dct:alternative': 'MDD-TRR-2024',
    'healthdcatap:minTypicalAge': 35,
    'healthdcatap:maxTypicalAge': 44,
    'healthdcatap:numberOfRecords': 456,
    'healthdcatap:numberOfUniqueIndividuals': 34,
    'healthdcatap:populationCoverage': 'Adult patients with recurrent MDD in German-French-Dutch psychiatric research network',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:F33.1', 'MedDRA:10012378'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q42844',     // Major depressive disorder
      'https://www.wikidata.org/entity/Q13386846',  // Treatment-resistant depression
      'https://www.wikidata.org/entity/Q178190',    // Mood disorder
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2023-01-01',
      endDate: '2033-10-31',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-depression-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'F33.1',
    'healthdcatap:diagnosis': 'Major depressive disorder, recurrent',
    'healthdcatap:category': 'psychiatry',
    'healthdcatap:ageRange': '35-44',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:sensitiveCategory': 'mental-health',
    'healthdcatap:clinicalTrialPhase': 'Phase II/III',
    'healthdcatap:euCtNumber': '2024-509876-45-DE',
    'healthdcatap:sponsor': { name: 'Charité Forschung GmbH', type: 'academic', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'PSYCHIATRY', name: 'Psychiatry' },
    'healthdcatap:memberStates': ['DE', 'FR', 'NL'],
    'healthdcatap:medDRA': {
      socCode: '10037175',
      socName: 'Psychiatric disorders',
      ptCode: '10012378',
      ptName: 'Depression'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: true, adrCount: 3 },
    'healthdcatap:consent': {
      purposes: ['academic-research'],
      restrictions: ['no-reidentification', 'no-commercial', 'no-third-party', 'no-indefinite-storage'],
      validUntil: '2026-06-30',
      grantor: 'Patient (Pseudonym: I4Y8Z1)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.1.0',
    'adms:versionNotes': 'Added PHQ-9 score trends and treatment response metrics',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-04-01',
    'dct:modified': '2024-11-15',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/BIWEEKLY',
    'dct:temporal': { startDate: '2023-01-01', endDate: '2024-10-31' },
    'dcat:temporalResolution': 'P1W',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 327680,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'c789012345678901234567890abcdef1234567890abcdef123456abcdef1234cd' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_ND_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Strictly academic research only - sensitive mental health data',
    },
    'adms:sample': {
      title: 'Sample MDD Records (3 anonymized)',
      description: 'Preview subset with depression severity and medication data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR009',
      byteSize: 30720,
    },
    'dcat:accessService': {
      title: 'Psychiatry Research Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/psychiatry',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/psychiatry-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.91, keywordRichness: 0.85 },
      accessibility: { endpointAvailability: 0.998, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.94, vocabularyCoverage: 0.88 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.87, consentGranularity: 'study-specific', deidentificationLevel: 'Expert-Determination' },
    },
  },
  {
    '@id': 'asset:ehr:EHR010',
    '@type': 'dcat:Dataset',
    'dct:title': "Parkinson's Disease",
    'dct:description': "Early-stage Parkinson's disease",
    'dcat:keyword': ['neurology', 'Parkinson', 'movement disorder'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
    ],
    'dct:provenance': {
      'rdfs:label': 'Parkinson disease early-stage clinical trial data from Helmholtz Institute',
      'dct:source': 'German Parkinson Registry - Deutsches Parkinson-Register',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#Biometric',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase I/II Parkinson disease trial with UPDRS and motor assessment data. Ethics: Ethikkommission Saarland Ref: 2024-SL-0123.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Academic',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR010',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Stefan Krause', 'vcard:hasEmail': 'mailto:s.krause@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6100', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Gastroenterologie', 'vcard:hasRole': 'Clinical Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'IBD Registry Analysis Report', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR010', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR010', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR010-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/gastroenterology-registry'],
    'dct:alternative': 'IBD-REG-2024',
    'healthdcatap:minTypicalAge': 55,
    'healthdcatap:maxTypicalAge': 64,
    'healthdcatap:numberOfRecords': 567,
    'healthdcatap:numberOfUniqueIndividuals': 42,
    'healthdcatap:populationCoverage': 'Early-stage Parkinson disease patients in German neurology network',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:G20', 'MedDRA:10034010'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q11085',     // Parkinson's disease
      'https://www.wikidata.org/entity/Q386591',    // Movement disorder
      'https://www.wikidata.org/entity/Q913672',    // Neurodegenerative disease
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2023-06-01',
      endDate: '2033-11-30',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-parkinson-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'G20',
    'healthdcatap:diagnosis': "Parkinson's disease",
    'healthdcatap:category': 'neurology',
    'healthdcatap:ageRange': '55-64',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase I/II',
    'healthdcatap:euCtNumber': '2024-521345-89-DE',
    'healthdcatap:sponsor': { name: 'Helmholtz-Institut für Arzneimittelforschung', type: 'academic', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'NERVOUS', name: 'Nervous System' },
    'healthdcatap:memberStates': ['DE'],
    'healthdcatap:medDRA': {
      socCode: '10029205',
      socName: 'Nervous system disorders',
      ptCode: '10034010',
      ptName: "Parkinson's disease"
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'ai-training'],
      restrictions: ['no-reidentification'],
      validUntil: '2028-12-31',
      grantor: 'Patient (Pseudonym: J6A2B4)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.0.0',
    'adms:versionNotes': 'Initial dataset with UPDRS scores and tremor monitoring data',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-05-01',
    'dct:modified': '2024-12-05',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/MONTHLY',
    'dct:temporal': { startDate: '2023-06-01', endDate: '2024-11-30' },
    'dcat:temporalResolution': 'P1D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 819200,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'd789012345678901234567890abcdef1234567890abcdef123456abcdef1234de' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for movement disorder research with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample Parkinson Records (5 anonymized)',
      description: 'Preview subset with motor symptom scores and medication timing',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR010',
      byteSize: 76800,
    },
    'dcat:accessService': {
      title: 'Neurology Movement Disorders API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/movement-disorders',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/movement-disorders-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.93, keywordRichness: 0.90 },
      accessibility: { endpointAvailability: 0.999, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.96, vocabularyCoverage: 0.92 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.91, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR011',
    '@type': 'dcat:Dataset',
    'dct:title': "Crohn's Disease",
    'dct:description': "Crohn's disease of small intestine",
    'dcat:keyword': ['gastroenterology', 'IBD', 'Crohn'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
      'http://publications.europa.eu/resource/authority/country/NLD',
      'http://publications.europa.eu/resource/authority/country/ESP',
    ],
    'dct:provenance': {
      'rdfs:label': 'Crohn disease Phase III clinical trial data from BioMedTech multi-center study',
      'dct:source': 'European IBD Registry Network',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase III IBD trial with CDAI monitoring. Ethics: Ethikkommission Nordrhein Ref: 2024-NR-0456.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR011',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Stefan Krause', 'vcard:hasEmail': 'mailto:s.krause@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6200', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Gastroenterologie', 'vcard:hasRole': 'Clinical Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'IBD Trial CDAI Outcome Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR011', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR011', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR011-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/ibd-registry'],
    'dct:alternative': 'IBD-CDAI-2024',
    'healthdcatap:minTypicalAge': 25,
    'healthdcatap:maxTypicalAge': 34,
    'healthdcatap:numberOfRecords': 1678,
    'healthdcatap:numberOfUniqueIndividuals': 112,
    'healthdcatap:populationCoverage': 'Adult Crohn disease patients in EU IBD registry network',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:K50.0', 'MedDRA:10011401'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q155100',    // Crohn's disease
      'https://www.wikidata.org/entity/Q127076',    // Inflammatory bowel disease
      'https://www.wikidata.org/entity/Q210392',    // Autoimmune disease
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2022-04-01',
      endDate: '2032-10-31',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-ibd-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'K50.0',
    'healthdcatap:diagnosis': "Crohn's disease of small intestine",
    'healthdcatap:category': 'gastroenterology',
    'healthdcatap:ageRange': '25-34',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase III',
    'healthdcatap:euCtNumber': '2024-506789-12-DE',
    'healthdcatap:sponsor': { name: 'BioMedTech Europa SE', type: 'commercial', country: 'NL' },
    'healthdcatap:therapeuticArea': { code: 'GASTRO', name: 'Gastroenterology' },
    'healthdcatap:memberStates': ['DE', 'FR', 'NL', 'ES'],
    'healthdcatap:medDRA': {
      socCode: '10017947',
      socName: 'Gastrointestinal disorders',
      ptCode: '10011401',
      ptName: "Crohn's disease"
    },
    'healthdcatap:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'real-world-evidence'],
      restrictions: ['no-reidentification', 'no-genetic'],
      validUntil: '2027-09-30',
      grantor: 'Patient (Pseudonym: K8C5D7)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.6.0',
    'adms:versionNotes': 'Added CDAI scores, endoscopy findings, and biologic response data',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-01-20',
    'dct:modified': '2024-11-28',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/BIMONTHLY',
    'dct:temporal': { startDate: '2022-04-01', endDate: '2024-10-31' },
    'dcat:temporalResolution': 'P1W',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 917504,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'e789012345678901234567890abcdef1234567890abcdef123456abcdef1234ef' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for IBD research with valid ConsentCredential - excludes genetic data',
    },
    'adms:sample': {
      title: 'Sample Crohn Records (6 anonymized)',
      description: 'Preview subset with disease activity and treatment history',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR011',
      byteSize: 86016,
    },
    'dcat:accessService': {
      title: 'Gastroenterology Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/gastroenterology',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/gastroenterology-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.94, keywordRichness: 0.89 },
      accessibility: { endpointAvailability: 0.998, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.96, vocabularyCoverage: 0.93 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.90, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR012',
    '@type': 'dcat:Dataset',
    'dct:title': 'Epilepsy (Focal)',
    'dct:description': 'Focal epilepsy with impaired awareness',
    'dcat:keyword': ['neurology', 'epilepsy', 'seizure'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
    ],
    'dct:provenance': {
      'rdfs:label': 'Focal epilepsy Phase II clinical trial data from Charité Epilepsy Center',
      'dct:source': 'German Epilepsy Registry - Deutsches Epilepsie-Register',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#Biometric',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase II epilepsy trial with seizure diary and EEG data. Ethics: Ethikkommission Charité Ref: 2024-CH-0345.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Academic',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR012',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Monika Lang', 'vcard:hasEmail': 'mailto:m.lang@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6300', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Epilepsiezentrum', 'vcard:hasRole': 'Research Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'Epilepsy EEG Pattern Analysis Report', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR012', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR012', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR012-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/epilepsy-registry'],
    'dct:alternative': 'EPI-EEG-2024',
    'healthdcatap:minTypicalAge': 18,
    'healthdcatap:maxTypicalAge': 24,
    'healthdcatap:numberOfRecords': 623,
    'healthdcatap:numberOfUniqueIndividuals': 48,
    'healthdcatap:populationCoverage': 'Young adult patients with focal epilepsy in German epilepsy centers',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:G40.2', 'MedDRA:10015037'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q112',       // Epilepsy
      'https://www.wikidata.org/entity/Q1156499',   // Seizure
      'https://www.wikidata.org/entity/Q853090',    // Focal seizure
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2023-02-15',
      endDate: '2033-11-30',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-epilepsy-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'G40.2',
    'healthdcatap:diagnosis': 'Focal epilepsy',
    'healthdcatap:category': 'neurology',
    'healthdcatap:ageRange': '18-24',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase II',
    'healthdcatap:euCtNumber': '2024-514567-23-DE',
    'healthdcatap:sponsor': { name: 'Charité Forschung GmbH', type: 'academic', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'NERVOUS', name: 'Nervous System' },
    'healthdcatap:memberStates': ['DE'],
    'healthdcatap:medDRA': {
      socCode: '10029205',
      socName: 'Nervous system disorders',
      ptCode: '10015037',
      ptName: 'Epilepsy'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'academic-research'],
      restrictions: ['no-reidentification', 'no-commercial'],
      validUntil: '2028-03-31',
      grantor: 'Patient (Pseudonym: L2E9F1)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.2.0',
    'adms:versionNotes': 'Added seizure diary data and EEG monitoring summaries',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-03-01',
    'dct:modified': '2024-12-02',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/WEEKLY',
    'dct:temporal': { startDate: '2023-02-15', endDate: '2024-11-30' },
    'dcat:temporalResolution': 'P1D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 491520,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'f789012345678901234567890abcdef1234567890abcdef123456abcdef1234f0' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_ND_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Academic research only with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample Epilepsy Records (4 anonymized)',
      description: 'Preview subset with seizure frequency and medication data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR012',
      byteSize: 46080,
    },
    'dcat:accessService': {
      title: 'Epilepsy Registry Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/epilepsy',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/epilepsy-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.92, keywordRichness: 0.88 },
      accessibility: { endpointAvailability: 0.999, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.95, vocabularyCoverage: 0.91 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.89, consentGranularity: 'study-specific', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR013',
    '@type': 'dcat:Dataset',
    'dct:title': 'Systemic Lupus Erythematosus',
    'dct:description': 'SLE with renal involvement',
    'dcat:keyword': ['rheumatology', 'lupus', 'autoimmune'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
    ],
    'dct:provenance': {
      'rdfs:label': 'SLE Phase II clinical trial data from Rhenus Therapeutics lupus study',
      'dct:source': 'German Lupus Registry - Deutsches Lupus-Register',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase II SLE trial with SLEDAI monitoring. Ethics: Ethikkommission Nordrhein Ref: 2024-NR-0567.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR013',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Anna Schulz', 'vcard:hasEmail': 'mailto:a.schulz@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6400', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Rheumatologie', 'vcard:hasRole': 'Research Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'SLE SLEDAI Outcome Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR013', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR013', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR013-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/lupus-registry'],
    'dct:alternative': 'SLE-SLEDAI-2024',
    'healthdcatap:minTypicalAge': 35,
    'healthdcatap:maxTypicalAge': 44,
    'healthdcatap:numberOfRecords': 789,
    'healthdcatap:numberOfUniqueIndividuals': 56,
    'healthdcatap:populationCoverage': 'SLE patients with renal involvement in German lupus centers',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:M32.1', 'MedDRA:10042945'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q7881',      // Systemic lupus erythematosus
      'https://www.wikidata.org/entity/Q210392',    // Autoimmune disease
      'https://www.wikidata.org/entity/Q500459',    // Lupus nephritis
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2022-05-01',
      endDate: '2032-10-31',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-sle-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'M32.1',
    'healthdcatap:diagnosis': 'Systemic lupus erythematosus',
    'healthdcatap:category': 'rheumatology',
    'healthdcatap:ageRange': '35-44',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase II',
    'healthdcatap:euCtNumber': '2024-517890-56-DE',
    'healthdcatap:sponsor': { name: 'Rhenus Therapeutics GmbH', type: 'commercial', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'RHEUMATOLOGY', name: 'Rheumatology' },
    'healthdcatap:memberStates': ['DE'],
    'healthdcatap:medDRA': {
      socCode: '10028395',
      socName: 'Musculoskeletal and connective tissue disorders',
      ptCode: '10042945',
      ptName: 'Systemic lupus erythematosus'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: true, adrCount: 4 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'academic-research'],
      restrictions: ['no-reidentification', 'no-genetic'],
      validUntil: '2027-12-31',
      grantor: 'Patient (Pseudonym: M3G6H8)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.3.0',
    'adms:versionNotes': 'Added SLEDAI scores, nephritis biomarkers, and immunosuppressant response',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-02-15',
    'dct:modified': '2024-11-22',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/MONTHLY',
    'dct:temporal': { startDate: '2022-05-01', endDate: '2024-10-31' },
    'dcat:temporalResolution': 'P1W',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 753664,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'a89012345678901234567890abcdef1234567890abcdef123456abcdef12345a' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for autoimmune research with valid ConsentCredential - excludes genetic data',
    },
    'adms:sample': {
      title: 'Sample SLE Records (5 anonymized)',
      description: 'Preview subset with disease activity and organ involvement data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR013',
      byteSize: 71680,
    },
    'dcat:accessService': {
      title: 'Autoimmune Registry Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/autoimmune',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/autoimmune-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.93, keywordRichness: 0.90 },
      accessibility: { endpointAvailability: 0.998, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.96, vocabularyCoverage: 0.92 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.91, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR014',
    '@type': 'dcat:Dataset',
    'dct:title': 'Atrial Fibrillation',
    'dct:description': 'Persistent atrial fibrillation',
    'dcat:keyword': ['cardiology', 'arrhythmia', 'AFib'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
      'http://healthdata.ec.europa.eu/authority/health-category/MEDICAL_REG',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
      'http://publications.europa.eu/resource/authority/country/ITA',
      'http://publications.europa.eu/resource/authority/country/ESP',
    ],
    'dct:provenance': {
      'rdfs:label': 'Atrial fibrillation Phase IV registry data from NordPharma real-world study',
      'dct:source': 'European AF Registry Network',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#VitalSigns',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase IV AFib RWE study with anticoagulation data. Ethics: Ethikkommission Nordrhein Ref: 2023-NR-0678.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR014',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Thomas Fischer', 'vcard:hasEmail': 'mailto:t.fischer@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6500', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Kardiologie', 'vcard:hasRole': 'Clinical Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'AFib Anticoagulation Outcome Report', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR014', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR014', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR014-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/cardiology-registry'],
    'dct:alternative': 'AFIB-NOAC-2024',
    'healthdcatap:minTypicalAge': 75,
    'healthdcatap:maxTypicalAge': 84,
    'healthdcatap:numberOfRecords': 3456,
    'healthdcatap:numberOfUniqueIndividuals': 234,
    'healthdcatap:populationCoverage': 'Elderly patients with persistent AFib across EU cardiology centers',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q744434', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:I48.1', 'LOINC:8867-4', 'MedDRA:10003658'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q207067',    // Atrial fibrillation
      'https://www.wikidata.org/entity/Q389735',    // Cardiovascular disease
      'https://www.wikidata.org/entity/Q160680',    // Arrhythmia
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2021-06-01',
      endDate: '2031-11-30',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-afib-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'I48.1',
    'healthdcatap:diagnosis': 'Persistent atrial fibrillation',
    'healthdcatap:category': 'cardiology',
    'healthdcatap:ageRange': '75-84',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase IV',
    'healthdcatap:euCtNumber': '2023-489234-67-DE',
    'healthdcatap:sponsor': { name: 'NordPharma AG', type: 'commercial', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'CARDIO', name: 'Cardiovascular' },
    'healthdcatap:memberStates': ['DE', 'FR', 'IT', 'ES'],
    'healthdcatap:medDRA': {
      socCode: '10007541',
      socName: 'Cardiac disorders',
      ptCode: '10003658',
      ptName: 'Atrial fibrillation'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: true, adrCount: 3 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'public-health', 'real-world-evidence'],
      restrictions: ['no-reidentification'],
      validUntil: '2028-06-30',
      grantor: 'Patient (Pseudonym: N5I9J2)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '2.2.0',
    'adms:versionNotes': 'Added CHA2DS2-VASc scores, anticoagulation data, and rhythm control outcomes',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2023-08-01',
    'dct:modified': '2024-12-08',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/MONTHLY',
    'dct:temporal': { startDate: '2021-06-01', endDate: '2024-11-30' },
    'dcat:temporalResolution': 'P1D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 1179648,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'b89012345678901234567890abcdef1234567890abcdef123456abcdef12345b' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for arrhythmia research with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample AFib Records (8 anonymized)',
      description: 'Preview subset with rhythm data and stroke risk assessment',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR014',
      byteSize: 112640,
    },
    'dcat:accessService': {
      title: 'Cardiology Arrhythmia Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/arrhythmia',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/arrhythmia-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.95, keywordRichness: 0.91 },
      accessibility: { endpointAvailability: 0.999, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.97, vocabularyCoverage: 0.94 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.93, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR015',
    '@type': 'dcat:Dataset',
    'dct:title': 'Severe Asthma',
    'dct:description': 'Severe persistent asthma with allergic component',
    'dcat:keyword': ['pulmonology', 'asthma', 'allergic'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
      'http://publications.europa.eu/resource/authority/country/NLD',
      'http://publications.europa.eu/resource/authority/country/ESP',
    ],
    'dct:provenance': {
      'rdfs:label': 'Severe asthma Phase III clinical trial data from NordPharma multi-center study',
      'dct:source': 'European Severe Asthma Network',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#VitalSigns',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase III severe asthma trial with ACT and IgE data. Ethics: Ethikkommission Nordrhein Ref: 2024-NR-0789.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR015',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Birgit Schmidt', 'vcard:hasEmail': 'mailto:b.schmidt@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6600', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Pneumologie', 'vcard:hasRole': 'Research Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'Asthma ACT Biologic Response Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR015', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR015', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR015-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/pulmonology-registry'],
    'dct:alternative': 'AST-ACT-2024',
    'healthdcatap:minTypicalAge': 35,
    'healthdcatap:maxTypicalAge': 44,
    'healthdcatap:numberOfRecords': 1234,
    'healthdcatap:numberOfUniqueIndividuals': 89,
    'healthdcatap:populationCoverage': 'Adult patients with severe persistent asthma across EU respiratory centers',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q744434', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:J45.5', 'LOINC:19926-5', 'MedDRA:10003553'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q12206',     // Asthma
      'https://www.wikidata.org/entity/Q188504',    // Allergic asthma
      'https://www.wikidata.org/entity/Q147778',    // Respiratory disease
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2022-08-01',
      endDate: '2032-10-31',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-asthma-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'J45.5',
    'healthdcatap:diagnosis': 'Severe persistent asthma',
    'healthdcatap:category': 'pulmonology',
    'healthdcatap:ageRange': '35-44',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase III',
    'healthdcatap:euCtNumber': '2024-508234-78-DE',
    'healthdcatap:sponsor': { name: 'NordPharma AG', type: 'commercial', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'PULMONOLOGY', name: 'Pulmonology' },
    'healthdcatap:memberStates': ['DE', 'FR', 'NL', 'ES'],
    'healthdcatap:medDRA': {
      socCode: '10038738',
      socName: 'Respiratory, thoracic and mediastinal disorders',
      ptCode: '10003553',
      ptName: 'Asthma'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 2 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'real-world-evidence'],
      restrictions: ['no-reidentification', 'no-commercial'],
      validUntil: '2027-09-30',
      grantor: 'Patient (Pseudonym: O7K1L4)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.4.0',
    'adms:versionNotes': 'Added ACT scores, IgE levels, and biologic treatment response',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-02-01',
    'dct:modified': '2024-11-25',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/MONTHLY',
    'dct:temporal': { startDate: '2022-08-01', endDate: '2024-10-31' },
    'dcat:temporalResolution': 'P1D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 589824,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'c89012345678901234567890abcdef1234567890abcdef123456abcdef12345c' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_ND_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Non-commercial respiratory research with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample Asthma Records (6 anonymized)',
      description: 'Preview subset with symptom control and lung function data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR015',
      byteSize: 56320,
    },
    'dcat:accessService': {
      title: 'Respiratory Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/respiratory',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/respiratory-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.93, keywordRichness: 0.89 },
      accessibility: { endpointAvailability: 0.998, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.96, vocabularyCoverage: 0.92 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.90, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR016',
    '@type': 'dcat:Dataset',
    'dct:title': 'Type 1 Diabetes',
    'dct:description': 'Type 1 diabetes with insulin pump therapy',
    'dcat:keyword': ['endocrinology', 'T1D', 'insulin'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
      'http://healthdata.ec.europa.eu/authority/health-category/MEDICAL_DEVICE',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
    ],
    'dct:provenance': {
      'rdfs:label': 'Type 1 diabetes Phase II clinical trial data from Helmholtz Institute with CGM data',
      'dct:source': 'German T1D Registry - Deutsches Diabetes-Zentrum',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
      'https://w3id.org/dpv#AITraining',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
      'https://w3id.org/dpv/dpv-pd#VitalSigns',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase II T1D trial with CGM and insulin pump data. Ethics: Ethikkommission Saarland Ref: 2024-SL-0234.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Academic',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR016',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Martin Gruber', 'vcard:hasEmail': 'mailto:m.gruber@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6700', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Diabetologie', 'vcard:hasRole': 'Clinical Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'T1D CGM Time-in-Range Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR016', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR016', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR016-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/diabetes-registry'],
    'dct:alternative': 'T1D-CGM-2024',
    'healthdcatap:minTypicalAge': 25,
    'healthdcatap:maxTypicalAge': 34,
    'healthdcatap:numberOfRecords': 45678,
    'healthdcatap:numberOfUniqueIndividuals': 56,
    'healthdcatap:populationCoverage': 'Young adult T1D patients with insulin pump therapy in German diabetes centers',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q744434', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:E10.9', 'LOINC:4548-4', 'MedDRA:10067584'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q124407',    // Type 1 diabetes mellitus
      'https://www.wikidata.org/entity/Q8063',      // Diabetes mellitus
      'https://www.wikidata.org/entity/Q210392',    // Autoimmune disease
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2023-03-01',
      endDate: '2033-11-30',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-t1d-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'E10.9',
    'healthdcatap:diagnosis': 'Type 1 diabetes mellitus',
    'healthdcatap:category': 'endocrine',
    'healthdcatap:ageRange': '25-34',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase II',
    'healthdcatap:euCtNumber': '2024-519876-34-DE',
    'healthdcatap:sponsor': { name: 'Helmholtz-Institut für Arzneimittelforschung', type: 'academic', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'ENDOCRINE', name: 'Endocrinology/Diabetology' },
    'healthdcatap:memberStates': ['DE'],
    'healthdcatap:medDRA': {
      socCode: '10027433',
      socName: 'Metabolism and nutrition disorders',
      ptCode: '10067584',
      ptName: 'Type 1 diabetes mellitus'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: true, adrCount: 2 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'ai-training', 'real-world-evidence'],
      restrictions: ['no-reidentification'],
      validUntil: '2029-12-31',
      grantor: 'Patient (Pseudonym: P2M5N7)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.5.0',
    'adms:versionNotes': 'Added CGM data, insulin pump settings, and HbA1c trends',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-04-15',
    'dct:modified': '2024-12-05',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/DAILY',
    'dct:temporal': { startDate: '2023-03-01', endDate: '2024-11-30' },
    'dcat:temporalResolution': 'PT5M',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 2097152,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'd89012345678901234567890abcdef1234567890abcdef123456abcdef12345d' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for diabetes research and AI training with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample T1D Records (5 anonymized)',
      description: 'Preview subset with glucose patterns and insulin delivery data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR016',
      byteSize: 204800,
    },
    'dcat:accessService': {
      title: 'Diabetes Technology Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/diabetes-tech',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/diabetes-tech-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.96, keywordRichness: 0.92 },
      accessibility: { endpointAvailability: 0.999, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.98, vocabularyCoverage: 0.95 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.94, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR017',
    '@type': 'dcat:Dataset',
    'dct:title': 'Osteoporosis with Fracture',
    'dct:description': 'Postmenopausal osteoporosis with pathological fracture',
    'dcat:keyword': ['rheumatology', 'osteoporosis', 'fracture'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/AUT',
      'http://publications.europa.eu/resource/authority/country/BEL',
    ],
    'dct:provenance': {
      'rdfs:label': 'Osteoporosis Phase IV registry data from UK Köln bone health study',
      'dct:source': 'German Bone Health Registry - DVO Osteologisches Register',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase IV osteoporosis registry with DXA and FRAX data. Ethics: Ethikkommission Köln Ref: 2023-UK-0789.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Academic',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR017',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Eva Becker', 'vcard:hasEmail': 'mailto:e.becker@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6800', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Rheumatologie', 'vcard:hasRole': 'Research Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'Osteoporosis FRAX Score Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR017', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR017', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR017-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/bone-health-registry'],
    'dct:alternative': 'OST-DXA-2024',
    'healthdcatap:minTypicalAge': 65,
    'healthdcatap:maxTypicalAge': 74,
    'healthdcatap:numberOfRecords': 987,
    'healthdcatap:numberOfUniqueIndividuals': 78,
    'healthdcatap:populationCoverage': 'Postmenopausal women with osteoporosis and fracture history in EU bone health network',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:M80.0', 'MedDRA:10031282'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q165328',    // Osteoporosis
      'https://www.wikidata.org/entity/Q155688',    // Bone fracture
      'https://www.wikidata.org/entity/Q188913',    // Menopause
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2020-01-01',
      endDate: '2030-09-30',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-osteoporosis-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'M80.0',
    'healthdcatap:diagnosis': 'Postmenopausal osteoporosis with fracture',
    'healthdcatap:category': 'rheumatology',
    'healthdcatap:ageRange': '65-74',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase IV',
    'healthdcatap:euCtNumber': '2023-496543-21-DE',
    'healthdcatap:sponsor': { name: 'Universitätsklinikum Köln', type: 'academic', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'MUSCULO', name: 'Musculo-Skeletal System' },
    'healthdcatap:memberStates': ['DE', 'AT', 'BE'],
    'healthdcatap:medDRA': {
      socCode: '10028395',
      socName: 'Musculoskeletal and connective tissue disorders',
      ptCode: '10031282',
      ptName: 'Osteoporosis'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'public-health'],
      restrictions: ['no-reidentification', 'no-indefinite-storage'],
      validUntil: '2026-12-31',
      grantor: 'Patient (Pseudonym: Q4O8P1)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.1.0',
    'adms:versionNotes': 'Added DXA scans, FRAX scores, and bisphosphonate response data',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2023-10-15',
    'dct:modified': '2024-11-10',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/ANNUAL',
    'dct:temporal': { startDate: '2020-01-01', endDate: '2024-09-30' },
    'dcat:temporalResolution': 'P6M',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 425984,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'e89012345678901234567890abcdef1234567890abcdef123456abcdef12345e' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for bone health research with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample Osteoporosis Records (4 anonymized)',
      description: 'Preview subset with bone density and fracture risk data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR017',
      byteSize: 40960,
    },
    'dcat:accessService': {
      title: 'Bone Health Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/bone-health',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/bone-health-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.91, keywordRichness: 0.86 },
      accessibility: { endpointAvailability: 0.997, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.94, vocabularyCoverage: 0.90 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.88, consentGranularity: 'study-specific', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR018',
    '@type': 'dcat:Dataset',
    'dct:title': 'Hepatitis C (Chronic)',
    'dct:description': 'Chronic viral hepatitis C',
    'dcat:keyword': ['infectious disease', 'hepatitis', 'viral'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
      'http://healthdata.ec.europa.eu/authority/health-category/PATHOGEN',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/NLD',
      'http://publications.europa.eu/resource/authority/country/BEL',
    ],
    'dct:provenance': {
      'rdfs:label': 'Chronic hepatitis C Phase IV real-world study from BioMedTech DAA treatment cohort',
      'dct:source': 'European Hepatitis Registry Network',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#PublicHealth',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-i',
    ],
    'healthdcatap:publisherNote': 'Sensitive infectious disease data - Phase IV HCV study with SVR monitoring. Ethics: Ethikkommission Nordrhein Ref: 2023-NR-0890.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR018',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Klaus Zimmermann', 'vcard:hasEmail': 'mailto:k.zimmermann@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-6900', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Infektiologie', 'vcard:hasRole': 'Clinical Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'HCV SVR Cure Rate Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR018', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR018', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR018-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/hepatology-registry'],
    'dct:alternative': 'HCV-SVR-2024',
    'healthdcatap:minTypicalAge': 45,
    'healthdcatap:maxTypicalAge': 54,
    'healthdcatap:numberOfRecords': 678,
    'healthdcatap:numberOfUniqueIndividuals': 52,
    'healthdcatap:populationCoverage': 'Adult patients with chronic HCV in EU hepatitis treatment network',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q744434', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:B18.2', 'LOINC:20416-4', 'MedDRA:10019731'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q174701',    // Hepatitis C
      'https://www.wikidata.org/entity/Q7556',      // Hepatitis
      'https://www.wikidata.org/entity/Q18975',     // Liver disease
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2022-06-01',
      endDate: '2032-06-30',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-hcv-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'B18.2',
    'healthdcatap:diagnosis': 'Chronic viral hepatitis C',
    'healthdcatap:category': 'infectious',
    'healthdcatap:ageRange': '45-54',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:sensitiveCategory': 'infectious-disease',
    'healthdcatap:clinicalTrialPhase': 'Phase IV',
    'healthdcatap:euCtNumber': '2023-491234-56-DE',
    'healthdcatap:sponsor': { name: 'BioMedTech Europa SE', type: 'commercial', country: 'NL' },
    'healthdcatap:therapeuticArea': { code: 'ANTIINFECT', name: 'Antiinfectives for Systemic Use' },
    'healthdcatap:memberStates': ['DE', 'NL', 'BE'],
    'healthdcatap:medDRA': {
      socCode: '10021881',
      socName: 'Infections and infestations',
      ptCode: '10019731',
      ptName: 'Hepatitis C'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 0 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'public-health'],
      restrictions: ['no-reidentification', 'no-third-party', 'no-indefinite-storage'],
      validUntil: '2027-06-30',
      grantor: 'Patient (Pseudonym: R6Q2S3)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.0.0',
    'adms:versionNotes': 'Initial dataset with viral load monitoring and SVR documentation',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2023-12-01',
    'dct:modified': '2024-10-20',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/MONTHLY',
    'dct:temporal': { startDate: '2022-06-01', endDate: '2024-06-30' },
    'dcat:temporalResolution': 'P1W',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 368640,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'f89012345678901234567890abcdef1234567890abcdef123456abcdef12345f' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_ND_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Sensitive infectious disease data - strict access controls apply',
    },
    'adms:sample': {
      title: 'Sample HCV Records (3 anonymized)',
      description: 'Preview subset with treatment response and SVR status',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR018',
      byteSize: 35840,
    },
    'dcat:accessService': {
      title: 'Infectious Disease Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/infectious',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/infectious-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.90, keywordRichness: 0.85 },
      accessibility: { endpointAvailability: 0.999, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.94, vocabularyCoverage: 0.89 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.87, consentGranularity: 'study-specific', deidentificationLevel: 'Expert-Determination' },
    },
  },
  {
    '@id': 'asset:ehr:EHR019',
    '@type': 'dcat:Dataset',
    'dct:title': 'Chronic Migraine',
    'dct:description': 'Chronic migraine with aura',
    'dcat:keyword': ['neurology', 'migraine', 'headache'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
      'http://publications.europa.eu/resource/authority/country/NLD',
      'http://publications.europa.eu/resource/authority/country/ESP',
    ],
    'dct:provenance': {
      'rdfs:label': 'Chronic migraine Phase III clinical trial data from Rhenus Therapeutics headache study',
      'dct:source': 'European Headache Registry Network',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
      'https://w3id.org/dpv#ClinicalResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-j',
    ],
    'healthdcatap:publisherNote': 'Phase III migraine trial with MIDAS scores and CGRP data. Ethics: Ethikkommission Nordrhein Ref: 2024-NR-0912.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Hospital',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR019',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Claudia Frank', 'vcard:hasEmail': 'mailto:c.frank@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-7000', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Kopfschmerzzentrum', 'vcard:hasRole': 'Research Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'Migraine CGRP Response Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR019', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR019', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR019-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/headache-registry'],
    'dct:alternative': 'MIG-CGRP-2024',
    'healthdcatap:minTypicalAge': 35,
    'healthdcatap:maxTypicalAge': 44,
    'healthdcatap:numberOfRecords': 1456,
    'healthdcatap:numberOfUniqueIndividuals': 102,
    'healthdcatap:populationCoverage': 'Adult patients with chronic migraine across EU headache centers',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:G43.1', 'MedDRA:10027599'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q133823',    // Migraine
      'https://www.wikidata.org/entity/Q86',        // Headache
      'https://www.wikidata.org/entity/Q774352',    // Chronic pain
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2023-01-01',
      endDate: '2033-11-15',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-migraine-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'G43.1',
    'healthdcatap:diagnosis': 'Migraine with aura',
    'healthdcatap:category': 'neurology',
    'healthdcatap:ageRange': '35-44',
    'healthdcatap:biologicalSex': 'female',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:clinicalTrialPhase': 'Phase III',
    'healthdcatap:euCtNumber': '2024-507654-89-DE',
    'healthdcatap:sponsor': { name: 'Rhenus Therapeutics GmbH', type: 'commercial', country: 'DE' },
    'healthdcatap:therapeuticArea': { code: 'NERVOUS', name: 'Nervous System' },
    'healthdcatap:memberStates': ['DE', 'FR', 'NL', 'ES'],
    'healthdcatap:medDRA': {
      socCode: '10029205',
      socName: 'Nervous system disorders',
      ptCode: '10027599',
      ptName: 'Migraine'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'healthdcatap:consent': {
      purposes: ['clinical-research', 'registry-participation', 'academic-research'],
      restrictions: ['no-reidentification'],
      validUntil: '2028-03-31',
      grantor: 'Patient (Pseudonym: S8T4U6)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.3.0',
    'adms:versionNotes': 'Added MIDAS scores, attack diary, and CGRP inhibitor response data',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2024-01-15',
    'dct:modified': '2024-11-30',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/WEEKLY',
    'dct:temporal': { startDate: '2023-01-01', endDate: '2024-11-15' },
    'dcat:temporalResolution': 'P1D',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 442368,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'a90123456789012345678901234567890bcdef1234567890abcdef123456789a' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Available for headache research with valid ConsentCredential',
    },
    'adms:sample': {
      title: 'Sample Migraine Records (5 anonymized)',
      description: 'Preview subset with attack frequency and preventive treatment data',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR019',
      byteSize: 43008,
    },
    'dcat:accessService': {
      title: 'Headache Registry Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/headache',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/headache-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.93, keywordRichness: 0.88 },
      accessibility: { endpointAvailability: 0.998, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.95, vocabularyCoverage: 0.91 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.89, consentGranularity: 'purpose-bound', deidentificationLevel: 'HIPAA-Safe-Harbor' },
    },
  },
  {
    '@id': 'asset:ehr:EHR020',
    '@type': 'dcat:Dataset',
    'dct:title': 'HIV (Well-Controlled)',
    'dct:description': 'HIV infection on antiretroviral therapy, undetectable',
    'dcat:keyword': ['infectious disease', 'HIV', 'antiretroviral'],
    'dct:creator': 'did:web:rheinland-uklinikum.de',
    // ========== MANDATORY HealthDCAT-AP Properties for Sensitive Data ==========
    'dcatap:applicableLegislation': [
      'http://data.europa.eu/eli/reg/2025/327/oj',
      'http://data.europa.eu/eli/reg/2016/679/oj',
      'http://data.europa.eu/eli/reg/2022/868/oj',
    ],
    'dct:accessRights': 'http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC',
    'dcat:theme': ['http://publications.europa.eu/resource/authority/data-theme/HEAL'],
    'dct:type': 'http://publications.europa.eu/resource/dataset/dataset-type/PERSONAL_DATA',
    'healthdcatap:healthCategory': [
      'http://healthdata.ec.europa.eu/authority/health-category/EHR',
      'http://healthdata.ec.europa.eu/authority/health-category/CLINICAL_TRIAL',
      'http://healthdata.ec.europa.eu/authority/health-category/PATHOGEN',
    ],
    'healthdcatap:hdab': {
      '@id': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:name': 'Forschungsdatenzentrum Gesundheit (FDZ)',
      'foaf:homepage': 'https://www.forschungsdatenzentrum-gesundheit.de',
      'foaf:mbox': 'mailto:fdz-gesundheit@bfarm.de',
    },
    'dct:spatial': [
      'http://publications.europa.eu/resource/authority/country/DEU',
      'http://publications.europa.eu/resource/authority/country/FRA',
      'http://publications.europa.eu/resource/authority/country/BEL',
      'http://publications.europa.eu/resource/authority/country/NLD',
    ],
    'dct:provenance': {
      'rdfs:label': 'HIV Phase IV real-world cohort data from EU ART treatment network',
      'dct:source': 'European HIV Clinical Cohort',
    },
    'dpv:hasPurpose': [
      'https://w3id.org/dpv#AcademicResearch',
      'https://w3id.org/dpv#ScientificResearch',
    ],
    'dpv:hasPersonalData': [
      'https://w3id.org/dpv/dpv-pd#HealthRecord',
      'https://w3id.org/dpv/dpv-pd#MedicalHealth',
      'https://w3id.org/dpv/dpv-pd#Age',
      'https://w3id.org/dpv/dpv-pd#Gender',
    ],
    'dpv:hasLegalBasis': [
      'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
      'https://w3id.org/dpv/dpv-gdpr#A9-2-a',
    ],
    'healthdcatap:publisherNote': 'Highly sensitive HIV data - strictly academic research only. Ethics: Multi-center approval EU-HIV-2023-0034.',
    'healthdcatap:publisherType': 'http://healthdata.ec.europa.eu/authority/publisher-type/Registry',
    'dct:identifier': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR020',
    'dcat:contactPoint': [{ '@type': 'vcard:Kind', 'vcard:fn': 'Dr. Markus Hartmann', 'vcard:hasEmail': 'mailto:m.hartmann@rheinland-uklinikum.de', 'vcard:hasTelephone': 'tel:+49-221-478-7100', 'vcard:hasOrganizationName': 'Rheinland Universitätsklinikum - Infektiologie', 'vcard:hasRole': 'Clinical Data Manager' }],
    'dct:publisher': { '@type': 'foaf:Agent', 'foaf:name': 'Rheinland Universitätsklinikum', 'foaf:homepage': 'https://www.rheinland-uklinikum.de', 'dct:type': 'http://purl.org/adms/publishertype/Academia', 'vcard:hasAddress': { 'vcard:street-address': 'Kerpener Straße 62', 'vcard:locality': 'Köln', 'vcard:postal-code': '50937', 'vcard:country-name': 'Germany' } },
    'healthdcatap:analytics': { 'dct:title': 'HIV Viral Load Suppression Analysis', 'dcat:accessURL': 'https://dataspace.rheinland-uklinikum.de/analytics/EHR020', 'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV', 'confidentialComputing': true },
    'dqv:hasQualityAnnotation': { '@type': 'dqv:QualityCertificate', 'oa:hasTarget': 'https://dataspace.rheinland-uklinikum.de/dataset/EHR020', 'oa:hasBody': 'https://quality.healthdata.eu/certificate/EHR020-2024', 'oa:motivatedBy': 'dqv:qualityAssessment' },
    'dct:source': ['https://www.rheinland-uklinikum.de/data/hiv-cohort'],
    'dct:alternative': 'HIV-ART-2024',
    'healthdcatap:minTypicalAge': 35,
    'healthdcatap:maxTypicalAge': 44,
    'healthdcatap:numberOfRecords': 345,
    'healthdcatap:numberOfUniqueIndividuals': 28,
    'healthdcatap:populationCoverage': 'Well-controlled HIV patients on ART in EU clinical cohort',
    'healthdcatap:hasCodingSystem': ['https://www.wikidata.org/entity/Q15629608', 'https://www.wikidata.org/entity/Q744434', 'https://www.wikidata.org/entity/Q2743', 'https://www.wikidata.org/entity/Q19597236'],
    'healthdcatap:hasCodeValues': ['ICD-10-GM:B20', 'LOINC:24467-3', 'MedDRA:10020098'],
    // healthTheme - MANDATORY Wikidata URIs for health topics
    'healthdcatap:healthTheme': [
      'https://www.wikidata.org/entity/Q2840',      // HIV
      'https://www.wikidata.org/entity/Q12199',     // AIDS
      'https://www.wikidata.org/entity/Q210392',    // Immunodeficiency
    ],
    // Retention Period - RECOMMENDED
    'healthdcatap:retentionPeriod': {
      startDate: '2021-01-01',
      endDate: '2031-09-30',
      comment: 'Data retained for 10 years per EHDS Art. 46',
    },
    // isReferencedBy - RECOMMENDED
    'dct:isReferencedBy': [
      'https://doi.org/10.1000/example-hiv-study-2024',
    ],
    'dct:language': 'http://publications.europa.eu/resource/authority/language/DEU',
    'dct:conformsTo': ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
    // ========== Original Properties ==========
    'healthdcatap:icdCode': 'B20',
    'healthdcatap:diagnosis': 'HIV disease',
    'healthdcatap:category': 'infectious',
    'healthdcatap:ageRange': '35-44',
    'healthdcatap:biologicalSex': 'male',
    'healthdcatap:consentStatus': 'active',
    'healthdcatap:sensitiveCategory': 'infectious-disease',
    'healthdcatap:clinicalTrialPhase': 'Phase IV',
    'healthdcatap:euCtNumber': '2023-494567-12-DE',
    'healthdcatap:sponsor': { name: 'EU Oncology Consortium', type: 'non-profit', country: 'BE' },
    'healthdcatap:therapeuticArea': { code: 'ANTIINFECT', name: 'Antiinfectives for Systemic Use' },
    'healthdcatap:memberStates': ['DE', 'FR', 'BE', 'NL'],
    'healthdcatap:medDRA': {
      socCode: '10021881',
      socName: 'Infections and infestations',
      ptCode: '10020098',
      ptName: 'HIV infection'
    },
    'healthdcatap:signalStatus': { hasActiveSignal: false, adrCount: 1 },
    'healthdcatap:consent': {
      purposes: ['academic-research'],
      restrictions: ['no-reidentification', 'no-commercial', 'no-third-party', 'no-indefinite-storage'],
      validUntil: '2026-12-31',
      grantor: 'Patient (Pseudonym: T1V7W9)',
    },
    // Extended HealthDCAT-AP metadata
    'dcat:version': '1.2.0',
    'adms:versionNotes': 'Added CD4 counts, viral load trends, and ART adherence data',
    'adms:status': 'http://publications.europa.eu/resource/authority/dataset-status/COMPLETED',
    'dct:issued': '2023-09-01',
    'dct:modified': '2024-10-15',
    'dct:accrualPeriodicity': 'http://publications.europa.eu/resource/authority/frequency/QUARTERLY',
    'dct:temporal': { startDate: '2021-01-01', endDate: '2024-09-30' },
    'dcat:temporalResolution': 'P1M',
    'dcat:distribution': {
      mediaType: 'application/fhir+json',
      format: 'http://publications.europa.eu/resource/authority/file-type/JSON',
      byteSize: 294912,
      compressFormat: 'application/gzip',
      checksum: { algorithm: 'SHA-256', value: 'b90123456789012345678901234567890bcdef1234567890abcdef123456789b' },
      conformsTo: ['http://hl7.org/fhir/R4', 'https://www.hl7.de/de/isik/'],
      license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_NC_ND_4_0',
      accessRights: 'http://publications.europa.eu/resource/authority/access-right/RESTRICTED',
      rights: 'Strictly academic research - highly sensitive infectious disease data',
    },
    'adms:sample': {
      title: 'Sample HIV Records (2 anonymized)',
      description: 'Preview subset with virologic suppression and immune status',
      accessURL: 'https://dataspace.rheinland-uklinikum.de/sample/EHR020',
      byteSize: 28672,
    },
    'dcat:accessService': {
      title: 'HIV Research Analytics API',
      endpointURL: 'https://dataspace.rheinland-uklinikum.de/api/analytics/hiv',
      endpointDescription: 'https://dataspace.rheinland-uklinikum.de/api/docs/hiv-openapi.yaml',
      conformsTo: 'http://hl7.org/fhir/R4',
    },
    'dqv:qualityMetrics': {
      findability: { metadataCompleteness: 0.89, keywordRichness: 0.84 },
      accessibility: { endpointAvailability: 0.999, authenticationDocumented: true },
      interoperability: { fhirComplianceRate: 0.93, vocabularyCoverage: 0.87 },
      reusability: { licenseExplicit: true, provenanceDocumented: true },
      contextability: { clinicalContextCompleteness: 0.85, consentGranularity: 'study-specific', deidentificationLevel: 'Expert-Determination' },
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
      clinicalTrialNode: {
        phase: 'Phase III',
        phaseCode: 'C15602',
        studyType: 'interventional',
        interventionModel: 'parallel',
        primaryEndpoint: 'HbA1c reduction at 52 weeks',
        euCtNumber: '2024-501234-12-DE',
        sponsor: { name: 'NordPharma AG', type: 'commercial', country: 'DE' },
        therapeuticArea: { code: 'ENDOCRINE', name: 'Endocrinology/Diabetology' },
        investigationalProduct: { name: 'NP-DM-2024', atcCode: 'A10BX' },
        memberStatesConcerned: ['DE', 'FR', 'NL', 'ES']
      },
      medDRANode: {
        version: '27.0',
        primarySOC: {
          code: '10027433',
          name: 'Metabolism and nutrition disorders',
          abbreviation: 'Metab'
        },
        preferredTerm: {
          code: '10012601',
          name: 'Diabetes mellitus',
          hltCode: '10012608'
        }
      },
      signalVerificationNode: {
        adverseEvents: [
          {
            id: 'AE-001-001',
            medDRAPT: 'Hypoglycaemia',
            medDRACode: '10020993',
            severity: 'moderate',
            seriousness: ['hospitalization'],
            outcome: 'recovered',
            onsetPeriod: '2024-Q3',
            suspectedDrug: 'A10BA02',
            relatedness: 'probable',
            expectedness: 'expected',
            actionTaken: 'dose-reduced'
          }
        ],
        signalStatus: {
          hasActiveSignal: false,
          signalCategory: 'closed',
          lastReviewDate: '2025-10'
        },
        reportingStatus: 'not-required'
      },
      provenanceNode: {
        sourceSystem: 'Rheinland-UK-EHR-v4',
        extractionDate: '2025-11',
        deIdentificationMethod: 'k-anonymity-k5',
        qualityScore: 0.94
      },
      anamnesisNode: {
        chiefComplaint: {
          stepNumber: 1,
          stepName: 'Chief Complaint',
          stepNameDE: 'Hauptbeschwerde',
          summary: 'Progressive fatigue and increased thirst over 6 months',
          relevantFindings: ['Polyuria', 'Polydipsia', 'Unintentional weight loss'],
          clinicalSignificance: 'high'
        },
        historyOfPresentIllness: {
          stepNumber: 2,
          stepName: 'History of Present Illness',
          stepNameDE: 'Jetzige Anamnese',
          summary: 'Gradual onset of symptoms, initially attributed to stress; elevated fasting glucose detected during routine screening',
          relevantFindings: ['Symptom duration >6 months', 'No ketoacidosis episodes', 'Lifestyle modifications attempted'],
          clinicalSignificance: 'high'
        },
        pastMedicalHistory: {
          stepNumber: 3,
          stepName: 'Past Medical History',
          stepNameDE: 'Eigenanamnese',
          summary: 'History of hypertension (diagnosed 2015), hypercholesterolemia (2017); no prior diabetes diagnosis',
          relevantFindings: ['Hypertension controlled with ACE inhibitor', 'Statin therapy initiated', 'No surgical history'],
          clinicalSignificance: 'moderate'
        },
        familyHistory: {
          stepNumber: 4,
          stepName: 'Family History',
          stepNameDE: 'Familienanamnese',
          summary: 'Strong family history of metabolic disorders; mother with T2DM, father with coronary artery disease',
          relevantFindings: ['First-degree relative with T2DM', 'Cardiovascular disease in family', 'No known genetic conditions'],
          clinicalSignificance: 'high'
        },
        socialHistory: {
          stepNumber: 5,
          stepName: 'Social History',
          stepNameDE: 'Sozialanamnese',
          summary: 'Sedentary occupation, former smoker (quit 5 years ago), moderate alcohol consumption',
          relevantFindings: ['Office work >8h/day', 'Limited physical activity', 'BMI in overweight category'],
          clinicalSignificance: 'moderate'
        }
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
  },
  'asset:ehr:EHR021': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/ehds/ehr/v1', 'http://hl7.org/fhir'],
    id: 'did:web:rheinland-uklinikum.de:ehr:EHR021',
    type: ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    issuer: 'did:web:rheinland-uklinikum.de',
    issuanceDate: '2025-11-01T10:00:00Z',
    credentialSubject: {
      id: 'did:web:rheinland-uklinikum.de:patient:pseudonym:G9R4X2',
      resourceType: 'Bundle',
      studyEligibility: ['GENOMICS-RARE-2025'],
      consentScope: {
        purposes: ['clinical-research', 'genetic-research'],
        dataCategories: ['demographics', 'genomics', 'conditions'],
        retentionPeriod: '5-years',
        jurisdiction: 'DE-NW'
      },
      demographicsNode: {
        pseudonymId: 'G9R4X2',
        ageBand: '0-17',
        biologicalSex: 'male',
        region: 'Nordrhein-Westfalen',
        enrollmentPeriod: '2024-Q1'
      },
      conditionsNode: {
        primaryDiagnosis: {
          code: 'Q87.1',
          system: 'ICD-10-GM',
          display: 'Congenital malformation syndromes predominantly associated with short stature',
          onsetPeriod: '2018'
        },
        comorbidities: []
      },
      observationsNode: {
        latestVitals: {
          recordPeriod: '2025-Q3',
          bmiCategory: 'underweight',
          bloodPressureCategory: 'normal'
        },
        labResults: [
          { code: 'GENE-SEQ', display: 'Whole Exome Sequencing', valueRange: 'Variant detected', interpretation: 'pathogenic' }
        ]
      },
      medicationsNode: {
        activeTherapies: []
      },
      provenanceNode: {
        sourceSystem: 'Rheinland-UK-Genomics-v2',
        extractionDate: '2025-11',
        deIdentificationMethod: 'k-anonymity-k5',
        qualityScore: 0.99
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
  seeding: {
    title: 'Dataspace Initialization',
    description: 'Before the DSP protocol can begin, the dataspace must be initialized. This includes creating participant identities in the Identity Hub, issuing Verifiable Credentials (MembershipCredential, DataProcessorCredential), configuring Vault secrets for secure key storage, creating ODRL policies for consent-gated access, registering EHR assets in the catalog, and creating contract definitions that link assets to policies.',
    specLink: 'https://github.com/eclipse-edc/MinimumViableDataspace',
    steps: [
      { name: 'Initialize Participants', direction: 'Seed Script → Identity Hub', description: 'Create Consumer, Provider, and Issuer participant contexts' },
      { name: 'Configure Identity Hub', direction: 'Seed Script → Identity Hub', description: 'Register DIDs and create participant contexts' },
      { name: 'Store Vault Secrets', direction: 'Seed Script → Vault', description: 'Store encryption keys and credential secrets' },
      { name: 'Issue Credentials', direction: 'Issuer → Participants', description: 'Issue MembershipCredential and DataProcessorCredential' },
      { name: 'Create ODRL Policies', direction: 'Seed Script → Provider', description: 'Create consent-based access policies (EU CTR, GDPR, EHDS, GDNG)' },
      { name: 'Register EHR Assets', direction: 'Seed Script → Provider', description: 'Register EHR datasets with HealthDCAT-AP metadata' },
      { name: 'Create Contract Definitions', direction: 'Seed Script → Provider', description: 'Link assets to policies for automated negotiation' }
    ]
  },
  catalog: {
    title: 'Catalog Protocol (EHR Discovery)',
    description: 'The Catalog Protocol enables the research institute to discover available anonymized EHR datasets from the hospital. The Consumer sends a CatalogRequestMessage and receives a DCAT Catalog containing available patient cohorts and their consent-based access policies. The catalog uses the HealthDCAT-AP profile for semantic interoperability.',
    specLink: 'https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#catalog-protocol',
    steps: [
      { name: 'CatalogRequestMessage', direction: 'CRO → Hospital', description: 'Research institute requests available EHR cohorts' },
      { name: 'dcat:Catalog', direction: 'Hospital → CRO', description: 'Hospital responds with consent-gated EHR datasets (HealthDCAT-AP)' }
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
  },
  compute: {
    title: 'Confidential Compute (Secure Analysis)',
    description: 'For highly sensitive data (e.g., Genomics), the data is never transferred in clear text. Instead, it is processed inside a Trusted Execution Environment (TEE/Enclave). The algorithm is sent to the data, and only the aggregate results are returned.',
    specLink: 'https://confidentialcomputing.io/',
    steps: [
      { name: 'ComputeRequestMessage', direction: 'CRO → Hospital', description: 'CRO requests secure analysis in enclave' },
      { name: 'Enclave Attestation', direction: 'Hospital (internal)', description: 'Verify TEE integrity and load keys' },
      { name: 'Encrypted Ingestion', direction: 'Hospital → Enclave', description: 'Load encrypted EHR into enclave memory' },
      { name: 'Secure Execution', direction: 'Enclave', description: 'Run analysis on decrypted data in memory' },
      { name: 'Result Delivery', direction: 'Enclave → CRO', description: 'Return aggregate results (encrypted)' }
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
        { 'dspace:operand': 'healthdcatap:studyEligibility', 'dspace:operator': 'contains', 'dspace:value': 'CARDIO-DM2-2025' }
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

export const mockComputeFlow = [
  { step: 0, label: 'Compute Request', status: 'pending' },
  { step: 1, label: 'Enclave Attestation', status: 'pending' },
  { step: 2, label: 'Encrypted Ingestion', status: 'pending' },
  { step: 3, label: 'Secure Execution', status: 'pending' },
  { step: 4, label: 'Result Delivery', status: 'pending' }
];
