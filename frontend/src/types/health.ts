/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// Electronic Health Record Types - EHDS/FHIR-aligned
// ============================================================================

export interface ElectronicHealthRecord {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: EHRCredentialSubject;
}

export interface EHRCredentialSubject {
  id: string;
  resourceType: 'Bundle';
  studyEligibility: string[];
  consentScope: ConsentScope;
  demographicsNode: DemographicsNode;
  conditionsNode: ConditionsNode;
  observationsNode: ObservationsNode;
  proceduresNode?: ProceduresNode;
  medicationsNode: MedicationsNode;
  provenanceNode: ProvenanceNode;
  // Enhanced clinical trial data
  clinicalTrialNode?: ClinicalTrialNode;
  medDRANode?: MedDRANode;
  signalVerificationNode?: SignalVerificationNode;
  anamnesisNode?: AnamnesisNode;
}

// ============================================================================
// Consent Management - Prometheus-X / EHDS aligned
// ============================================================================

export interface ConsentScope {
  purposes: ConsentPurpose[];
  dataCategories: DataCategory[];
  retentionPeriod: RetentionPeriod;
  jurisdiction: string;
  sensitiveCategories?: SensitiveCategory[];
}

export type ConsentPurpose = 
  | 'clinical-research'
  | 'registry-participation'
  | 'cancer-registry'
  | 'drug-safety-surveillance'
  | 'quality-improvement'
  | 'public-health'
  | 'rare-disease-research';

export type DataCategory =
  | 'demographics'
  | 'conditions'
  | 'observations'
  | 'medications'
  | 'procedures'
  | 'lab-results'
  | 'imaging'
  | 'genetic';

export type RetentionPeriod =
  | '5-years'
  | '10-years'
  | '15-years'
  | '25-years'
  | 'indefinite';

export type SensitiveCategory =
  | 'mental-health'
  | 'infectious-disease'
  | 'genetic'
  | 'reproductive';

// ============================================================================
// Demographics Node - GDPR/EHDS anonymization patterns
// ============================================================================

export interface DemographicsNode {
  pseudonymId: string;
  ageBand: AgeBand;
  biologicalSex: BiologicalSex;
  region: string;
  enrollmentPeriod: string;
}

export type AgeBand = 
  | '18-24' | '25-34' | '35-44' | '45-54' 
  | '55-64' | '65-74' | '75-84' | '85+';

export type BiologicalSex = 'male' | 'female' | 'other' | 'unknown';

// ============================================================================
// Conditions Node - ICD-10-GM coded diagnoses
// ============================================================================

export interface ConditionsNode {
  primaryDiagnosis: Diagnosis;
  comorbidities: Diagnosis[];
}

export interface Diagnosis {
  code: string;
  system: 'ICD-10-GM' | 'ICD-10' | 'SNOMED-CT';
  display: string;
  onsetPeriod?: string;
  clinicalStatus?: ClinicalStatus;
  msType?: string; // For MS-specific classification
}

export type ClinicalStatus = 
  | 'active'
  | 'remission'
  | 'resolved'
  | 'recurrence';

// ============================================================================
// Observations Node - Vital signs and lab results (anonymized ranges)
// ============================================================================

export interface ObservationsNode {
  latestVitals: VitalsRecord;
  labResults: LabResult[];
}

export interface VitalsRecord {
  recordPeriod: string;
  bmiCategory: BMICategory;
  bloodPressureCategory: BloodPressureCategory;
  hba1cRange?: string;
  ejectionFractionRange?: string;
  edssScore?: string;
}

export type BMICategory = 
  | 'underweight' 
  | 'normal' 
  | 'overweight' 
  | 'obese-class-i' 
  | 'obese-class-ii' 
  | 'obese-class-iii';

export type BloodPressureCategory = 
  | 'normal' 
  | 'elevated' 
  | 'stage1-hypertension' 
  | 'stage2-hypertension' 
  | 'hypertensive-crisis';

export interface LabResult {
  code: string;
  display: string;
  valueRange: string;
  interpretation: LabInterpretation;
}

export type LabInterpretation = 
  | 'normal' 
  | 'low' 
  | 'high' 
  | 'elevated' 
  | 'borderline-high' 
  | 'critical'
  | 'stable'
  | 'improved'
  | 'worsened';

// ============================================================================
// Procedures Node - ICD-10-PCS / OPS coded procedures
// ============================================================================

export interface ProceduresNode {
  historicalProcedures: Procedure[];
}

export interface Procedure {
  code: string;
  system?: 'ICD-10-PCS' | 'OPS';
  display: string;
  periodPerformed: string;
}

// ============================================================================
// Medications Node - ATC coded medications
// ============================================================================

export interface MedicationsNode {
  activeTherapies: Medication[];
}

export interface Medication {
  code: string;
  system: 'ATC';
  display: string;
  durationCategory: DurationCategory;
}

export type DurationCategory = 
  | '<6-months' 
  | '6-12-months' 
  | '1-2-years' 
  | '>2-years';

// ============================================================================
// Provenance Node - Data lineage and quality metadata
// ============================================================================

export interface ProvenanceNode {
  sourceSystem: string;
  extractionDate: string;
  deIdentificationMethod: DeIdentificationMethod;
  qualityScore: number;
}

export type DeIdentificationMethod = 
  | 'k-anonymity-k5' 
  | 'k-anonymity-k10' 
  | 'differential-privacy' 
  | 'generalization';

// ============================================================================
// Clinical Trial Node - FDA/EMA Phase Classification
// ============================================================================

export interface ClinicalTrialNode {
  phase: ClinicalTrialPhase;
  phaseCode: string; // NCIt code
  studyType: StudyType;
  interventionModel: InterventionModel;
  primaryEndpoint?: string;
  trialRegistryId?: string; // EudraCT or ClinicalTrials.gov
}

/**
 * Clinical Trial Phases per ICH E8(R1) and FDA/EMA guidelines:
 * - Phase I: First-in-human, safety/tolerability, PK/PD (20-100 subjects)
 * - Phase II: Proof-of-concept, dose-finding, preliminary efficacy (100-500 subjects)
 * - Phase III: Confirmatory, pivotal trials for approval (1000-5000 subjects)
 * - Phase IV: Post-marketing surveillance, real-world evidence
 */
export type ClinicalTrialPhase = 
  | 'Phase I'      // C15600 - First-in-human
  | 'Phase I/II'   // C15693 - Combined phase
  | 'Phase II'     // C15601 - Therapeutic exploratory
  | 'Phase II/III' // C15694 - Combined phase
  | 'Phase III'    // C15602 - Therapeutic confirmatory
  | 'Phase IV'     // C15603 - Post-marketing
  | 'Not Applicable'; // C48660 - Observational/registry

export type StudyType =
  | 'interventional'
  | 'observational'
  | 'expanded-access'
  | 'registry';

export type InterventionModel =
  | 'single-group'
  | 'parallel'
  | 'crossover'
  | 'factorial'
  | 'sequential';

// ============================================================================
// MedDRA Node - Medical Dictionary for Regulatory Activities v27.0
// Hierarchical structure: SOC > HLGT > HLT > PT > LLT
// ============================================================================

export interface MedDRANode {
  version: string; // e.g., "27.0"
  primarySOC: MedDRASystemOrganClass;
  secondarySOC?: MedDRASystemOrganClass[];
  preferredTerm: MedDRAPreferredTerm;
}

/**
 * System Organ Class (SOC) - Highest level, 27 classes
 * Examples: Cardiac disorders, Nervous system disorders, etc.
 */
export interface MedDRASystemOrganClass {
  code: string;      // 8-digit SOC code
  name: string;      // SOC name
  abbreviation: string; // SOC abbreviation
}

/**
 * High Level Group Term (HLGT) - Groups of HLTs
 */
export interface MedDRAHighLevelGroupTerm {
  code: string;
  name: string;
  socCode: string;
}

/**
 * High Level Term (HLT) - Groups of PTs
 */
export interface MedDRAHighLevelTerm {
  code: string;
  name: string;
  hlgtCode: string;
}

/**
 * Preferred Term (PT) - Clinical concept level, ~24,000 terms
 * This is the primary coding level for adverse events
 */
export interface MedDRAPreferredTerm {
  code: string;      // 8-digit PT code
  name: string;      // PT name
  hltCode: string;   // Parent HLT
  seriousness?: SeriousnessCriteria[];
}

/**
 * Lowest Level Term (LLT) - Synonyms and verbatim terms
 */
export interface MedDRALowestLevelTerm {
  code: string;
  name: string;
  ptCode: string;
  currency: 'current' | 'non-current';
}

export type SeriousnessCriteria =
  | 'death'
  | 'life-threatening'
  | 'hospitalization'
  | 'disability'
  | 'congenital-anomaly'
  | 'medically-important';

// ============================================================================
// Signal Verification Node - Pharmacovigilance / ADR Monitoring
// ============================================================================

export interface SignalVerificationNode {
  adverseEvents: AdverseEventRecord[];
  signalStatus: SignalStatus;
  causalityAssessment?: CausalityAssessment;
  reportingStatus: ReportingStatus;
}

export interface AdverseEventRecord {
  id: string;
  medDRAPT: string;          // MedDRA Preferred Term
  medDRACode: string;        // MedDRA PT code
  severity: AdversEventSeverity;
  seriousness: SeriousnessCriteria[];
  outcome: AdverseEventOutcome;
  onsetPeriod: string;       // Generalized date
  suspectedDrug?: string;    // ATC code of suspected drug
  relatedness: Relatedness;
  expectedness: 'expected' | 'unexpected';
  actionTaken: ActionTaken;
}

export type AdversEventSeverity = 
  | 'mild'       // Grade 1 - No treatment required
  | 'moderate'   // Grade 2 - Local/noninvasive intervention
  | 'severe'     // Grade 3 - Hospitalization indicated
  | 'life-threatening' // Grade 4
  | 'fatal';     // Grade 5

export type AdverseEventOutcome =
  | 'recovered'
  | 'recovering'
  | 'not-recovered'
  | 'recovered-with-sequelae'
  | 'fatal'
  | 'unknown';

/**
 * WHO-UMC causality assessment categories
 */
export type Relatedness =
  | 'certain'       // Definite causal relationship
  | 'probable'      // Likely causal relationship
  | 'possible'      // Cannot be ruled out
  | 'unlikely'      // Doubtful relationship
  | 'conditional'   // More data needed
  | 'unassessable'; // Insufficient information

export type ActionTaken =
  | 'drug-withdrawn'
  | 'dose-reduced'
  | 'dose-increased'
  | 'dose-not-changed'
  | 'not-applicable'
  | 'unknown';

export interface SignalStatus {
  hasActiveSignal: boolean;
  signalCategory?: 'new' | 'ongoing' | 'closed';
  lastReviewDate?: string;
  prrValue?: number;  // Proportional Reporting Ratio
  rorValue?: number;  // Reporting Odds Ratio
}

export interface CausalityAssessment {
  method: 'WHO-UMC' | 'Naranjo' | 'CIOMS';
  score?: number;
  classification: Relatedness;
  assessmentDate: string;
}

export type ReportingStatus = 
  | 'not-required'
  | 'submitted-to-bfarm'      // German authority
  | 'submitted-to-ema'        // European authority
  | 'submitted-to-who-umc'    // WHO Uppsala
  | 'expedited-report';       // 15-day report for serious unexpected

// ============================================================================
// Anamnesis Node - 5 Steps of Medical History
// ============================================================================

/**
 * Standard 5-step medical anamnesis following German medical education:
 * 1. Chief Complaint (Hauptbeschwerde)
 * 2. History of Present Illness (Jetzige Anamnese)
 * 3. Past Medical History (Eigenanamnese)
 * 4. Family History (Familienanamnese)
 * 5. Social History (Sozialanamnese)
 */
export interface AnamnesisNode {
  chiefComplaint: AnamnesisStep;        // Step 1
  historyOfPresentIllness: AnamnesisStep; // Step 2
  pastMedicalHistory: AnamnesisStep;    // Step 3
  familyHistory: AnamnesisStep;         // Step 4
  socialHistory: AnamnesisStep;         // Step 5
}

export interface AnamnesisStep {
  stepNumber: 1 | 2 | 3 | 4 | 5;
  stepName: string;
  stepNameDE: string;  // German terminology
  summary: string;     // Anonymized/generalized summary
  relevantFindings: string[];
  clinicalSignificance: 'high' | 'moderate' | 'low';
}

// ============================================================================
// Catalog Asset Types - For displaying EHR catalog items
// ============================================================================

export interface EHRCatalogAsset {
  '@id': string;
  '@type': string;
  'dct:title': string;
  'dct:description': string;
  'dcat:keyword': string[];
  'dct:creator': string;
  'health:icdCode': string;
  'health:diagnosis': string;
  'health:ageBand': AgeBand;
  'health:biologicalSex': BiologicalSex;
  'health:consentStatus': 'active' | 'withdrawn' | 'expired';
  'odrl:hasPolicy': ODRLPolicy;
}

export interface ODRLPolicy {
  '@id': string;
  '@type': string;
  'odrl:permission': ODRLRule[];
  'odrl:obligation'?: ODRLRule[];
  'odrl:prohibition'?: ODRLRule[];
}

export interface ODRLRule {
  'odrl:action': string;
  'odrl:constraint': ODRLConstraint;
}

export interface ODRLConstraint {
  'odrl:leftOperand': string;
  'odrl:operator': string;
  'odrl:rightOperand': string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface HealthDataspaceState {
  selectedEHR: ElectronicHealthRecord | null;
  catalogAssets: EHRCatalogAsset[];
  negotiationState: NegotiationState;
  transferState: TransferState;
  activePhase: 'catalog' | 'negotiation' | 'transfer' | 'complete';
}

export type NegotiationState = 
  | 'idle'
  | 'requesting'
  | 'offered'
  | 'accepted'
  | 'agreed'
  | 'verified'
  | 'finalized'
  | 'terminated';

export type TransferState =
  | 'idle'
  | 'requested'
  | 'started'
  | 'transferring'
  | 'completed'
  | 'failed';

// ============================================================================
// Health Participant Types
// ============================================================================

export interface HealthParticipant {
  name: string;
  role: string;
  did: string;
  description: string;
  logo: string;
  connectorEndpoint: string;
}

export interface HealthParticipants {
  provider: HealthParticipant;
  consumer: HealthParticipant;
}

// ============================================================================
// DSP Protocol Phase Types
// ============================================================================

export interface DspPhaseStep {
  name: string;
  direction: string;
  description: string;
}

export interface DspPhase {
  title: string;
  description: string;
  specLink: string;
  steps: DspPhaseStep[];
}

export interface HealthDspPhases {
  catalog: DspPhase;
  negotiation: DspPhase;
  transfer: DspPhase;
}
