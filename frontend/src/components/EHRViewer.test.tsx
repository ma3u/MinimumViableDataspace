import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EHRViewer } from './EHRViewer';
import type { ElectronicHealthRecord } from '../types/health';

// Minimal mock EHR data that matches the actual type structure
const mockEHR: ElectronicHealthRecord = {
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
};

describe('EHRViewer', () => {
  it('should render the EHR header with pseudonym ID', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText('Electronic Health Record')).toBeInTheDocument();
    expect(screen.getByText('A7X9K2')).toBeInTheDocument();
  });

  it('should display patient demographics', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText('55-64')).toBeInTheDocument();
    expect(screen.getByText('male')).toBeInTheDocument();
  });

  it('should display primary diagnosis with ICD code', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText(/E11\.9/)).toBeInTheDocument();
    expect(screen.getByText(/Type 2 diabetes mellitus/i)).toBeInTheDocument();
  });

  it('should display study eligibility', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText(/CARDIO-DM2-2025/)).toBeInTheDocument();
  });

  it('should display comorbidities', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText(/Essential hypertension/)).toBeInTheDocument();
    expect(screen.getByText(/Pure hypercholesterolemia/)).toBeInTheDocument();
  });

  it('should display consent scope information', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText(/clinical research/i)).toBeInTheDocument();
    expect(screen.getByText(/registry participation/i)).toBeInTheDocument();
  });

  it('should display lab results with interpretation', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText(/Glucose/)).toBeInTheDocument();
    expect(screen.getByText(/Cholesterol Total/)).toBeInTheDocument();
  });

  it('should display current medications', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText(/Metformin/)).toBeInTheDocument();
    expect(screen.getByText(/Ramipril/)).toBeInTheDocument();
    expect(screen.getByText(/Atorvastatin/)).toBeInTheDocument();
  });

  it('should display provenance information', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText(/Rheinland-UK-EHR-v4/)).toBeInTheDocument();
    expect(screen.getByText(/k-anonymity/i)).toBeInTheDocument();
  });

  it('should display region and enrollment period', () => {
    render(<EHRViewer ehr={mockEHR} />);
    
    expect(screen.getByText(/Nordrhein-Westfalen/)).toBeInTheDocument();
    expect(screen.getByText(/2023-Q2/)).toBeInTheDocument();
  });
});
