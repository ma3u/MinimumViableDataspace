-- V003__consent_attestations.sql
-- Consent attestation table for patient consent verification
-- Tracks patient consent for secondary use of health data (EHDS Art. 33-35)

CREATE TABLE IF NOT EXISTS consent_attestations (
    id VARCHAR(100) DEFAULT gen_random_uuid()::VARCHAR PRIMARY KEY,
    
    -- Patient identification
    patient_did VARCHAR(500) NOT NULL,
    patient_pseudonym VARCHAR(255),
    
    -- Study/Purpose identification
    study_id VARCHAR(100) NOT NULL,
    study_name VARCHAR(500),
    study_phase VARCHAR(50),
    -- 'Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Observational'
    
    -- Consent scope (JSONB for flexibility)
    consent_scope JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- Array of: 'demographics', 'diagnosis', 'medications', 'procedures', 
    --           'lab-results', 'vital-signs', 'genomics', 'mental-health'
    
    -- Purpose and legal basis (DPV/GDPR aligned)
    purpose_code VARCHAR(255) NOT NULL,
    -- DPV purpose URI, e.g., 'https://w3id.org/dpv#ClinicalResearch'
    purpose_description TEXT,
    
    legal_basis VARCHAR(255) NOT NULL,
    -- GDPR Article reference, e.g., 'https://w3id.org/dpv/dpv-gdpr#A6-1-a'
    
    -- Data retention
    retention_period_days INTEGER,
    data_minimization_applied BOOLEAN DEFAULT TRUE,
    pseudonymization_method VARCHAR(100),
    
    -- Consent lifecycle
    granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    
    -- Consent provenance
    consent_document_hash VARCHAR(128),
    consent_version VARCHAR(20) DEFAULT '1.0',
    collected_by_did VARCHAR(500),
    
    -- EHDS specific fields
    hdab_notified BOOLEAN DEFAULT FALSE,
    -- Health Data Access Body notification status
    hdab_reference VARCHAR(100),
    cross_border_allowed BOOLEAN DEFAULT FALSE,
    member_states_allowed JSONB DEFAULT '[]'::JSONB,
    -- Array of ISO 3166-1 alpha-2 country codes
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_consent_scope CHECK (jsonb_typeof(consent_scope) = 'array'),
    CONSTRAINT valid_member_states CHECK (jsonb_typeof(member_states_allowed) = 'array')
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_consent_patient 
    ON consent_attestations (patient_did);

CREATE INDEX IF NOT EXISTS idx_consent_study 
    ON consent_attestations (study_id);

CREATE INDEX IF NOT EXISTS idx_consent_active 
    ON consent_attestations (patient_did, study_id) 
    WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW());

CREATE INDEX IF NOT EXISTS idx_consent_purpose 
    ON consent_attestations (purpose_code);

CREATE INDEX IF NOT EXISTS idx_consent_legal_basis 
    ON consent_attestations (legal_basis);

-- GIN index for JSONB scope queries
CREATE INDEX IF NOT EXISTS idx_consent_scope_gin 
    ON consent_attestations USING GIN (consent_scope);

-- Sample consent for demo
INSERT INTO consent_attestations (
    patient_did, 
    patient_pseudonym,
    study_id, 
    study_name,
    study_phase,
    consent_scope, 
    purpose_code, 
    purpose_description,
    legal_basis,
    retention_period_days,
    hdab_notified,
    cross_border_allowed,
    member_states_allowed
)
VALUES (
    'did:web:patient-wallet.de:patient:P12345',
    'PSEUDO-EHR001',
    '2024-501234-12-DE',
    'Phase III Diabetes Study - Glucose Control',
    'Phase III',
    '["demographics", "diagnosis", "medications", "lab-results", "vital-signs"]'::JSONB,
    'https://w3id.org/dpv#ClinicalResearch',
    'Clinical research for Type 2 Diabetes treatment optimization',
    'https://w3id.org/dpv/dpv-gdpr#A6-1-a',
    1825, -- 5 years
    true,
    true,
    '["DE", "FR", "NL", "ES"]'::JSONB
)
ON CONFLICT DO NOTHING;

-- Update schema info
INSERT INTO mvd_health_schema_info (component, version, description)
VALUES ('consent-attestations', '1.0.0', 'Consent attestation table for EHDS patient consent')
ON CONFLICT (component) DO UPDATE SET version = EXCLUDED.version, installed_on = NOW();
