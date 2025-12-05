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
