/**
 * EHDS & Dataspace-Specific Metrics for Backend-Mock (EHR Service)
 * 
 * Provides FHIR data access metrics, consent tracking, and 
 * EHDS compliance monitoring for the mock EHR backend.
 */

import * as client from 'prom-client';
import { register } from './metrics';

// ============================================================================
// FHIR/EHR DATA METRICS
// ============================================================================

/**
 * EHR Record Access Counter
 */
export const ehrAccessTotal = new client.Counter({
  name: 'ehr_access_total',
  help: 'Total EHR record access requests',
  labelNames: ['record_type', 'access_type', 'result'],
  registers: [register],
});

/**
 * FHIR Resource Access
 */
export const fhirResourceAccess = new client.Counter({
  name: 'fhir_resource_access_total',
  help: 'FHIR resource access by type',
  labelNames: ['resource_type', 'operation'],
  registers: [register],
});

/**
 * EHR Records Available
 */
export const ehrRecordsAvailable = new client.Gauge({
  name: 'ehr_records_available',
  help: 'Number of EHR records available',
  labelNames: ['category'],
  registers: [register],
});

/**
 * EHR Data Volume
 */
export const ehrDataVolume = new client.Counter({
  name: 'ehr_data_volume_bytes',
  help: 'Volume of EHR data served',
  labelNames: ['format'],
  registers: [register],
});

// ============================================================================
// CONSENT METRICS (EHR Side)
// ============================================================================

/**
 * Consent Checks at EHR Level
 */
export const ehrConsentChecks = new client.Counter({
  name: 'ehr_consent_checks_total',
  help: 'Consent verification checks for EHR access',
  labelNames: ['result'],
  registers: [register],
});

/**
 * Active Patient Consents
 */
export const activePatientConsents = new client.Gauge({
  name: 'ehr_active_patient_consents',
  help: 'Number of active patient consents',
  labelNames: ['purpose'],
  registers: [register],
});

// ============================================================================
// DATA QUALITY METRICS
// ============================================================================

/**
 * Data Completeness Score
 */
export const dataCompletenessScore = new client.Gauge({
  name: 'ehr_data_completeness_score',
  help: 'Data completeness score (0-100)',
  labelNames: ['record_type'],
  registers: [register],
});

/**
 * Data Validation Errors
 */
export const dataValidationErrors = new client.Counter({
  name: 'ehr_validation_errors_total',
  help: 'Data validation errors',
  labelNames: ['error_type'],
  registers: [register],
});

// ============================================================================
// EHDS COMPLIANCE METRICS (EHR Side)
// ============================================================================

/**
 * EHDS Data Format Compliance
 */
export const ehdsFormatCompliance = new client.Gauge({
  name: 'ehr_ehds_format_compliance',
  help: 'EHDS data format compliance (1=compliant, 0=non-compliant)',
  labelNames: ['format'],
  registers: [register],
});

/**
 * De-identification Operations
 */
export const deidentificationOps = new client.Counter({
  name: 'ehr_deidentification_operations_total',
  help: 'De-identification operations performed',
  labelNames: ['type', 'result'],
  registers: [register],
});

// ============================================================================
// AUDIT METRICS (EHR Side)
// ============================================================================

/**
 * EHR Audit Events
 */
export const ehrAuditEvents = new client.Counter({
  name: 'ehr_audit_events_total',
  help: 'EHR audit log events',
  labelNames: ['event_type', 'severity'],
  registers: [register],
});

/**
 * Data Access Log
 */
export const dataAccessLog = new client.Counter({
  name: 'ehr_data_access_log_total',
  help: 'Data access log entries',
  labelNames: ['accessor_type', 'action'],
  registers: [register],
});

// ============================================================================
// SERVICE HEALTH
// ============================================================================

/**
 * EHR Service Uptime
 */
export const ehrServiceUptime = new client.Gauge({
  name: 'ehr_service_uptime_seconds',
  help: 'EHR service uptime',
  registers: [register],
});

/**
 * EHR Service Health
 */
export const ehrServiceHealth = new client.Gauge({
  name: 'ehr_service_health_status',
  help: 'EHR service health (1=healthy, 0=unhealthy)',
  labelNames: ['component'],
  registers: [register],
});

// ============================================================================
// INITIALIZATION & SIMULATION
// ============================================================================

const startTime = Date.now();

/**
 * Initialize EHR/EHDS metrics with baseline values
 */
export function initializeEhrMetrics(): void {
  console.log('[EHR Metrics] Initializing EHR and EHDS metrics...');

  // EHR Records Available
  ehrRecordsAvailable.set({ category: 'patient' }, 20);
  ehrRecordsAvailable.set({ category: 'condition' }, 45);
  ehrRecordsAvailable.set({ category: 'medication' }, 38);
  ehrRecordsAvailable.set({ category: 'observation' }, 120);
  ehrRecordsAvailable.set({ category: 'procedure' }, 25);

  // Active Consents
  activePatientConsents.set({ purpose: 'research' }, 15);
  activePatientConsents.set({ purpose: 'treatment' }, 20);
  activePatientConsents.set({ purpose: 'secondary_use' }, 8);

  // Data Quality Scores
  dataCompletenessScore.set({ record_type: 'patient' }, 98);
  dataCompletenessScore.set({ record_type: 'condition' }, 92);
  dataCompletenessScore.set({ record_type: 'medication' }, 95);
  dataCompletenessScore.set({ record_type: 'observation' }, 88);

  // EHDS Format Compliance
  ehdsFormatCompliance.set({ format: 'fhir_r4' }, 1);
  ehdsFormatCompliance.set({ format: 'isik' }, 1);
  ehdsFormatCompliance.set({ format: 'kbv' }, 1);
  ehdsFormatCompliance.set({ format: 'meddra' }, 1);

  // Service Health
  ehrServiceHealth.set({ component: 'api' }, 1);
  ehrServiceHealth.set({ component: 'data_store' }, 1);
  ehrServiceHealth.set({ component: 'fhir_parser' }, 1);

  console.log('[EHR Metrics] Initialization complete');
}

/**
 * Start EHR metrics simulation
 */
export function startEhrMetricsSimulation(): void {
  console.log('[EHR Metrics] Starting metrics simulation...');

  // Update metrics every 15 seconds
  setInterval(() => {
    simulateEhrActivity();
  }, 15000);

  // Update uptime every 5 seconds
  setInterval(() => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    ehrServiceUptime.set(uptimeSeconds);
  }, 5000);
}

function simulateEhrActivity(): void {
  // Simulate FHIR resource access
  const resourceTypes = ['Patient', 'Condition', 'MedicationRequest', 'Observation', 'Procedure'];
  const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
  fhirResourceAccess.inc({ resource_type: resourceType, operation: 'read' });

  // Simulate EHR access
  ehrAccessTotal.inc({ record_type: 'patient', access_type: 'read', result: 'success' });
  if (Math.random() > 0.95) {
    ehrAccessTotal.inc({ record_type: 'patient', access_type: 'read', result: 'denied' });
  }

  // Simulate consent checks
  ehrConsentChecks.inc({ result: Math.random() > 0.05 ? 'valid' : 'invalid' });

  // Simulate data volume
  const dataBytes = Math.floor(Math.random() * 10000) + 5000;
  ehrDataVolume.inc({ format: 'fhir' }, dataBytes);

  // Simulate audit events
  ehrAuditEvents.inc({ event_type: 'data_access', severity: 'info' });
  dataAccessLog.inc({ accessor_type: 'dataspace', action: 'read' });

  // Simulate de-identification
  if (Math.random() > 0.8) {
    deidentificationOps.inc({ type: 'pseudonymization', result: 'success' });
  }

  // Random validation errors (rare)
  if (Math.random() > 0.98) {
    dataValidationErrors.inc({ error_type: 'missing_field' });
  }
}

/**
 * Record an EHR access with metrics
 */
export function recordEhrAccess(recordId: string, success: boolean): void {
  ehrAccessTotal.inc({ 
    record_type: 'patient', 
    access_type: 'read', 
    result: success ? 'success' : 'failure' 
  });
  ehrAuditEvents.inc({ event_type: 'ehr_access', severity: 'info' });
  dataAccessLog.inc({ accessor_type: 'api', action: 'read' });
}

/**
 * Record a consent check at EHR level
 */
export function recordEhrConsentCheck(valid: boolean): void {
  ehrConsentChecks.inc({ result: valid ? 'valid' : 'invalid' });
}
