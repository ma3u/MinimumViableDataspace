-- V002__membership_attestations.sql
-- Membership attestation table for dataspace membership verification
-- Used by the Issuer Service to track who is a member of the dataspace

CREATE TABLE IF NOT EXISTS membership_attestations (
    id VARCHAR(100) DEFAULT gen_random_uuid()::VARCHAR PRIMARY KEY,
    holder_id VARCHAR(500) NOT NULL,
    membership_type INTEGER DEFAULT 0 NOT NULL,
    -- 0 = None, 1 = FullMember, 2 = AssociateMember, 3 = Observer
    membership_start_date TIMESTAMP DEFAULT NOW() NOT NULL,
    membership_end_date TIMESTAMP,
    organization_name VARCHAR(255),
    organization_type VARCHAR(100),
    -- 'healthcare_provider', 'research_institution', 'pharma_company', 'cro', 'regulator'
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Unique constraint on holder_id to prevent duplicate memberships
CREATE UNIQUE INDEX IF NOT EXISTS membership_attestation_holder_id_uindex 
    ON membership_attestations (holder_id);

-- Index for querying active memberships
CREATE INDEX IF NOT EXISTS idx_membership_active 
    ON membership_attestations (is_active, membership_type);

-- Seed default attestations for demo participants
INSERT INTO membership_attestations (membership_type, holder_id, organization_name, organization_type)
VALUES 
    (1, 'did:web:localhost%3A7083:consumer', 'Nordstein Research Institute', 'cro'),
    (2, 'did:web:localhost%3A7093:provider', 'Rheinland Universitätsklinikum', 'healthcare_provider')
ON CONFLICT (holder_id) DO NOTHING;

-- Update schema info
INSERT INTO mvd_health_schema_info (component, version, description)
VALUES ('membership-attestations', '1.0.0', 'Membership attestation table for dataspace membership')
ON CONFLICT (component) DO UPDATE SET version = EXCLUDED.version, installed_on = NOW();
