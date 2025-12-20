-- V005__audit_trail.sql
-- Immutable audit trail for all dataspace operations
-- Provides tamper-evident logging with hash chains for compliance and forensics

CREATE TABLE IF NOT EXISTS audit_trail (
    -- Event identification
    event_id VARCHAR(100) DEFAULT gen_random_uuid()::VARCHAR PRIMARY KEY,
    sequence_number BIGSERIAL,
    -- Monotonically increasing for ordering
    
    -- Event classification
    event_type VARCHAR(100) NOT NULL,
    -- Categories: 'catalog', 'negotiation', 'transfer', 'credential', 'policy', 'consent', 'access', 'admin'
    event_subtype VARCHAR(100),
    -- Specific event: 'catalog_request', 'negotiation_initiated', 'transfer_completed', etc.
    
    -- Actor information
    actor_did VARCHAR(500) NOT NULL,
    actor_type VARCHAR(100),
    -- 'consumer', 'provider', 'issuer', 'admin', 'system'
    actor_name VARCHAR(255),
    
    -- Subject (what was acted upon)
    subject_type VARCHAR(100),
    -- 'asset', 'contract', 'credential', 'participant', 'policy'
    subject_id VARCHAR(255),
    subject_name VARCHAR(255),
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    -- 'create', 'read', 'update', 'delete', 'execute', 'approve', 'reject', 'revoke'
    action_result VARCHAR(50) NOT NULL,
    -- 'success', 'failure', 'denied', 'error'
    action_message TEXT,
    
    -- Timestamp (high precision for ordering)
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Event details (flexible JSONB for event-specific data)
    details JSONB DEFAULT '{}'::JSONB,
    
    -- Related entities
    related_contract_id VARCHAR(255),
    related_transfer_id VARCHAR(255),
    related_negotiation_id VARCHAR(255),
    related_credential_id VARCHAR(255),
    
    -- Hash chain for tamper detection
    previous_event_id VARCHAR(100),
    event_hash VARCHAR(128),
    -- SHA-512 of: sequence_number + event_type + actor_did + subject_id + action + timestamp + previous_hash
    signature VARCHAR(512),
    -- Optional: EdDSA signature for non-repudiation
    signing_key_id VARCHAR(255),
    
    -- Source information
    source_component VARCHAR(100) NOT NULL,
    -- 'consumer-connector', 'provider-connector', 'identity-hub', 'issuer-service', 'frontend'
    source_ip VARCHAR(45),
    source_version VARCHAR(50),
    
    -- Retention metadata
    retention_days INTEGER DEFAULT 3650,
    -- Default 10 years for compliance
    archived_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_details CHECK (jsonb_typeof(details) = 'object')
);

-- Primary ordering index
CREATE INDEX IF NOT EXISTS idx_audit_sequence 
    ON audit_trail (sequence_number DESC);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_timestamp 
    ON audit_trail (timestamp DESC);

-- Actor queries (who did what)
CREATE INDEX IF NOT EXISTS idx_audit_actor 
    ON audit_trail (actor_did, timestamp DESC);

-- Subject queries (what happened to X)
CREATE INDEX IF NOT EXISTS idx_audit_subject 
    ON audit_trail (subject_type, subject_id, timestamp DESC);

-- Event type queries
CREATE INDEX IF NOT EXISTS idx_audit_event_type 
    ON audit_trail (event_type, event_subtype, timestamp DESC);

-- Action result queries (find failures)
CREATE INDEX IF NOT EXISTS idx_audit_result 
    ON audit_trail (action_result, timestamp DESC);

-- Hash chain verification
CREATE INDEX IF NOT EXISTS idx_audit_hash_chain 
    ON audit_trail (previous_event_id);

-- Related entity queries
CREATE INDEX IF NOT EXISTS idx_audit_contract 
    ON audit_trail (related_contract_id) WHERE related_contract_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_transfer 
    ON audit_trail (related_transfer_id) WHERE related_transfer_id IS NOT NULL;

-- GIN index for JSONB details queries
CREATE INDEX IF NOT EXISTS idx_audit_details_gin 
    ON audit_trail USING GIN (details);

-- Function to compute event hash
CREATE OR REPLACE FUNCTION compute_audit_hash(
    p_sequence_number BIGINT,
    p_event_type VARCHAR,
    p_actor_did VARCHAR,
    p_subject_id VARCHAR,
    p_action VARCHAR,
    p_timestamp TIMESTAMPTZ,
    p_previous_hash VARCHAR
) RETURNS VARCHAR AS $$
BEGIN
    RETURN encode(
        sha512(
            (COALESCE(p_sequence_number::TEXT, '') || '|' ||
             COALESCE(p_event_type, '') || '|' ||
             COALESCE(p_actor_did, '') || '|' ||
             COALESCE(p_subject_id, '') || '|' ||
             COALESCE(p_action, '') || '|' ||
             COALESCE(p_timestamp::TEXT, '') || '|' ||
             COALESCE(p_previous_hash, 'GENESIS'))::BYTEA
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-compute hash on insert
CREATE OR REPLACE FUNCTION audit_trail_hash_trigger() RETURNS TRIGGER AS $$
DECLARE
    v_previous_hash VARCHAR;
    v_previous_id VARCHAR;
BEGIN
    -- Get the previous event's hash
    SELECT event_id, event_hash INTO v_previous_id, v_previous_hash
    FROM audit_trail
    ORDER BY sequence_number DESC
    LIMIT 1;
    
    NEW.previous_event_id := v_previous_id;
    NEW.event_hash := compute_audit_hash(
        NEW.sequence_number,
        NEW.event_type,
        NEW.actor_did,
        NEW.subject_id,
        NEW.action,
        NEW.timestamp,
        v_previous_hash
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_trail_before_insert
    BEFORE INSERT ON audit_trail
    FOR EACH ROW
    EXECUTE FUNCTION audit_trail_hash_trigger();

-- View for recent activity
CREATE OR REPLACE VIEW audit_trail_recent AS
SELECT 
    event_id,
    timestamp,
    event_type,
    event_subtype,
    actor_did,
    actor_type,
    subject_type,
    subject_id,
    action,
    action_result,
    action_message,
    source_component
FROM audit_trail
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY sequence_number DESC;

-- View for hash chain verification
CREATE OR REPLACE VIEW audit_trail_hash_verification AS
SELECT 
    a.event_id,
    a.sequence_number,
    a.event_hash as stored_hash,
    compute_audit_hash(
        a.sequence_number,
        a.event_type,
        a.actor_did,
        a.subject_id,
        a.action,
        a.timestamp,
        p.event_hash
    ) as computed_hash,
    CASE 
        WHEN a.event_hash = compute_audit_hash(
            a.sequence_number,
            a.event_type,
            a.actor_did,
            a.subject_id,
            a.action,
            a.timestamp,
            p.event_hash
        ) THEN 'VALID'
        ELSE 'TAMPERED'
    END as verification_status
FROM audit_trail a
LEFT JOIN audit_trail p ON a.previous_event_id = p.event_id
ORDER BY a.sequence_number;

-- Insert genesis event
INSERT INTO audit_trail (
    event_type,
    event_subtype,
    actor_did,
    actor_type,
    action,
    action_result,
    action_message,
    source_component,
    details
)
SELECT 
    'system',
    'schema_initialized',
    'did:web:mvd-health.local:system',
    'system',
    'create',
    'success',
    'Audit trail schema initialized - genesis block',
    'flyway-migration',
    '{"schema_version": "1.0.0", "migration": "V005"}'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM audit_trail LIMIT 1);

-- Update schema info
INSERT INTO mvd_health_schema_info (component, version, description)
VALUES ('audit-trail', '1.0.0', 'Immutable audit trail with hash chain verification')
ON CONFLICT (component) DO UPDATE SET version = EXCLUDED.version, installed_on = NOW();
