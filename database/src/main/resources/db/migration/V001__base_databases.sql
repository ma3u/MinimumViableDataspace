-- V001__base_databases.sql
-- Base database and user creation for MVD Health Demo
-- Note: Database and user creation should be done before Flyway runs
-- This migration creates the base schema structure

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schema version tracking table (in addition to Flyway's schema_version)
CREATE TABLE IF NOT EXISTS mvd_health_schema_info (
    component VARCHAR(100) PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    installed_on TIMESTAMP DEFAULT NOW()
);

INSERT INTO mvd_health_schema_info (component, version, description)
VALUES ('mvd-health-base', '1.0.0', 'Base schema for MVD Health Demo')
ON CONFLICT (component) DO UPDATE SET version = EXCLUDED.version, installed_on = NOW();
