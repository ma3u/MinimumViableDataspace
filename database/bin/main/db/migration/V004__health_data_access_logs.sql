-- V004__health_data_access_logs.sql
-- Health Data Access Logs for EHDS Art. 41 compliance
-- Tracks all access to health data through the dataspace

CREATE TABLE IF NOT EXISTS health_data_access_logs (
    id VARCHAR(100) DEFAULT gen_random_uuid()::VARCHAR PRIMARY KEY,
    
    -- Request identification
    request_id VARCHAR(100) NOT NULL,
    correlation_id VARCHAR(100),
    
    -- Actors
    requester_did VARCHAR(500) NOT NULL,
    requester_name VARCHAR(255),
    requester_type VARCHAR(100),
    -- 'research_institution', 'pharma_company', 'cro', 'regulator', 'healthcare_provider'
    
    provider_did VARCHAR(500) NOT NULL,
    provider_name VARCHAR(255),
    
    -- Asset identification
    asset_id VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100),
    -- 'ehr', 'genomics', 'imaging', 'lab_results', 'aggregated_dataset'
    
    -- Contract reference
    contract_id VARCHAR(255),
    contract_agreement_id VARCHAR(255),
    negotiation_id VARCHAR(255),
    transfer_process_id VARCHAR(255),
    
    -- Access details
    access_type VARCHAR(50) NOT NULL,
    -- 'catalog_query', 'contract_negotiation', 'data_transfer', 'data_access', 'metadata_access'
    access_result VARCHAR(50) NOT NULL,
    -- 'success', 'denied', 'error', 'timeout', 'cancelled'
    denial_reason TEXT,
    
    -- Purpose and legal basis (matching consent)
    purpose_uri VARCHAR(500),
    purpose_description TEXT,
    legal_basis_uri VARCHAR(500),
    
    -- Data categories accessed
    data_categories JSONB DEFAULT '[]'::JSONB,
    -- Array of data category codes
    
    -- Privacy measures applied
    anonymization_level VARCHAR(50),
    -- 'none', 'pseudonymized', 'k-anonymized', 'differential_privacy', 'fully_anonymized'
    encryption_in_transit BOOLEAN DEFAULT TRUE,
    confidential_computing BOOLEAN DEFAULT FALSE,
    
    -- EHDS specific fields
    data_permit_reference VARCHAR(100),
    cross_border_transfer BOOLEAN DEFAULT FALSE,
    destination_country VARCHAR(2),
    -- ISO 3166-1 alpha-2
    hdab_reference VARCHAR(100),
    
    -- Timing
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    
    -- Technical details
    source_ip VARCHAR(45),
    user_agent TEXT,
    protocol VARCHAR(50) DEFAULT 'dataspace-protocol-http',
    
    -- Audit metadata
    logged_at TIMESTAMP DEFAULT NOW(),
    log_source VARCHAR(100) DEFAULT 'edc-connector'
);

-- Indexes for compliance queries
CREATE INDEX IF NOT EXISTS idx_access_log_requester 
    ON health_data_access_logs (requester_did, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_log_provider 
    ON health_data_access_logs (provider_did, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_log_asset 
    ON health_data_access_logs (asset_id, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_log_contract 
    ON health_data_access_logs (contract_id);

CREATE INDEX IF NOT EXISTS idx_access_log_time 
    ON health_data_access_logs (requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_log_type_result 
    ON health_data_access_logs (access_type, access_result);

CREATE INDEX IF NOT EXISTS idx_access_log_purpose 
    ON health_data_access_logs (purpose_uri);

-- GIN index for data categories
CREATE INDEX IF NOT EXISTS idx_access_log_categories_gin 
    ON health_data_access_logs USING GIN (data_categories);

-- Partitioning hint: For production, consider range partitioning by requested_at
-- CREATE TABLE health_data_access_logs_2024 PARTITION OF health_data_access_logs
--     FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- View for daily access summary (EHDS reporting)
CREATE OR REPLACE VIEW health_data_access_daily_summary AS
SELECT 
    DATE(requested_at) as access_date,
    requester_did,
    requester_type,
    access_type,
    access_result,
    COUNT(*) as access_count,
    COUNT(DISTINCT asset_id) as unique_assets,
    AVG(duration_ms) as avg_duration_ms
FROM health_data_access_logs
GROUP BY DATE(requested_at), requester_did, requester_type, access_type, access_result;

-- Update schema info
INSERT INTO mvd_health_schema_info (component, version, description)
VALUES ('health-data-access-logs', '1.0.0', 'Access logging for EHDS Art. 41 compliance')
ON CONFLICT (component) DO UPDATE SET version = EXCLUDED.version, installed_on = NOW();
