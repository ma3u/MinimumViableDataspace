/**
 * EHDS & Dataspace-Specific Metrics for Health Dataspace
 * 
 * Provides comprehensive metrics for monitoring EHDS compliance,
 * consent management, data transfers, and EDC operations.
 * 
 * @see https://eur-lex.europa.eu/eli/reg/2025/327 (EHDS Regulation)
 */

import * as client from 'prom-client';
import { register } from './metrics.js';

// ============================================================================
// EHDS COMPLIANCE METRICS
// ============================================================================

/**
 * EHDS Compliance Score (0-100)
 * Tracks overall compliance with EHDS requirements
 */
export const ehdsComplianceScore = new client.Gauge({
  name: 'ehds_compliance_score',
  help: 'EHDS compliance score (0-100)',
  labelNames: ['category'],
  registers: [register],
});

/**
 * EHDS Data Access Rights Compliance
 * Art. 51 - Electronic Health Data Access Rights
 */
export const ehdsDataAccessCompliance = new client.Gauge({
  name: 'ehds_data_access_compliance',
  help: 'Compliance status with EHDS Art. 51 data access rights',
  labelNames: ['right_type'],
  registers: [register],
});

/**
 * EHDS Audit Trail Completeness
 * Measures completeness of audit logging
 */
export const ehdsAuditTrailCompleteness = new client.Gauge({
  name: 'ehds_audit_trail_completeness',
  help: 'Audit trail completeness percentage',
  registers: [register],
});

// ============================================================================
// CONSENT MANAGEMENT METRICS
// ============================================================================

/**
 * Total Active Consents
 */
export const consentTotal = new client.Gauge({
  name: 'consent_total',
  help: 'Total number of active consents',
  labelNames: ['purpose', 'status'],
  registers: [register],
});

/**
 * Consent by Type
 */
export const consentByType = new client.Gauge({
  name: 'consent_by_type',
  help: 'Consents broken down by type',
  labelNames: ['type'],
  registers: [register],
});

/**
 * Consent Expiring Soon (within 7 days)
 */
export const consentExpiring7d = new client.Gauge({
  name: 'consent_expiring_7d',
  help: 'Number of consents expiring within 7 days',
  registers: [register],
});

/**
 * Consent Expiring Soon (within 24 hours)
 */
export const consentExpiring24h = new client.Gauge({
  name: 'consent_expiring_24h',
  help: 'Number of consents expiring within 24 hours',
  registers: [register],
});

/**
 * Consent Operations Counter
 */
export const consentOperationsTotal = new client.Counter({
  name: 'consent_operations_total',
  help: 'Total consent operations',
  labelNames: ['operation', 'status'],
  registers: [register],
});

/**
 * Consent Verification Duration
 */
export const consentVerificationDuration = new client.Histogram({
  name: 'consent_verification_duration_seconds',
  help: 'Duration of consent verification checks',
  labelNames: ['result'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2],
  registers: [register],
});

// ============================================================================
// DATA TRANSFER METRICS
// ============================================================================

/**
 * Transfer Volume (bytes)
 */
export const transferVolume = new client.Counter({
  name: 'transfer_volume_bytes',
  help: 'Total volume of data transferred',
  labelNames: ['direction', 'format'],
  registers: [register],
});

/**
 * Transfer Speed (bytes per second)
 */
export const transferSpeed = new client.Gauge({
  name: 'transfer_speed_bytes_per_second',
  help: 'Current transfer speed',
  labelNames: ['direction'],
  registers: [register],
});

/**
 * Active Data Transfers
 */
export const activeTransfers = new client.Gauge({
  name: 'active_transfers',
  help: 'Number of currently active data transfers',
  labelNames: ['type'],
  registers: [register],
});

/**
 * Transfer Success Rate
 */
export const transferSuccessRate = new client.Gauge({
  name: 'transfer_success_rate',
  help: 'Transfer success rate (0-1)',
  registers: [register],
});

// ============================================================================
// EDC OPERATIONS METRICS
// ============================================================================

/**
 * Total Registered Assets
 */
export const edcAssetsTotal = new client.Gauge({
  name: 'edc_assets_total',
  help: 'Total registered assets in EDC',
  labelNames: ['provider', 'type'],
  registers: [register],
});

/**
 * Active Data Offerings
 */
export const edcDataOfferings = new client.Gauge({
  name: 'edc_data_offerings_total',
  help: 'Total active data offerings',
  labelNames: ['provider'],
  registers: [register],
});

/**
 * Registered Identities (DIDs)
 */
export const edcIdentitiesTotal = new client.Gauge({
  name: 'edc_identities_total',
  help: 'Total registered identities',
  labelNames: ['type'],
  registers: [register],
});

/**
 * Contract Definitions
 */
export const edcContractDefinitions = new client.Gauge({
  name: 'edc_contract_definitions_total',
  help: 'Total contract definitions',
  labelNames: ['provider'],
  registers: [register],
});

/**
 * Policy Definitions
 */
export const edcPolicyDefinitions = new client.Gauge({
  name: 'edc_policy_definitions_total',
  help: 'Total policy definitions',
  labelNames: ['type'],
  registers: [register],
});

/**
 * Catalog Sync Status
 */
export const edcCatalogSyncStatus = new client.Gauge({
  name: 'edc_catalog_sync_status',
  help: 'Catalog synchronization status (1=synced, 0=out of sync)',
  labelNames: ['provider'],
  registers: [register],
});

/**
 * Contract Negotiations Total
 * Tracks all contract negotiations in the EDC flow
 */
export const contractNegotiationsTotal = new client.Counter({
  name: 'contract_negotiations_total',
  help: 'Total contract negotiations by status',
  labelNames: ['status'],
  registers: [register],
});

/**
 * Asset Transfers Total
 * Tracks all asset transfers in the EDC flow
 */
export const assetTransfersTotal = new client.Counter({
  name: 'asset_transfers_total',
  help: 'Total asset transfers by status',
  labelNames: ['status'],
  registers: [register],
});

/**
 * Catalog Queries Total
 * Tracks catalog discovery and query operations
 */
export const catalogQueriesTotal = new client.Counter({
  name: 'catalog_queries_total',
  help: 'Total catalog queries by status',
  labelNames: ['status', 'provider'],
  registers: [register],
});

/**
 * EHDS Consent Requests Total
 * Tracks consent requests in the EHDS flow
 */
export const ehdsConsentRequestsTotal = new client.Counter({
  name: 'ehds_consent_requests_total',
  help: 'Total EHDS consent requests by status',
  labelNames: ['status', 'purpose'],
  registers: [register],
});

/**
 * EHR Records Accessed Total
 * Tracks electronic health records accessed
 */
export const ehrRecordsAccessedTotal = new client.Counter({
  name: 'ehr_records_accessed_total',
  help: 'Total EHR records accessed by type',
  labelNames: ['record_type', 'access_type'],
  registers: [register],
});

/**
 * DSP Protocol Messages
 */
export const dspMessagesTotal = new client.Counter({
  name: 'dsp_messages_total',
  help: 'Total DSP protocol messages',
  labelNames: ['type', 'direction'],
  registers: [register],
});

/**
 * DSP Message Latency
 */
export const dspMessageLatency = new client.Histogram({
  name: 'dsp_message_latency_seconds',
  help: 'DSP protocol message latency',
  labelNames: ['type'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

/**
 * SSE Active Connections
 * Tracks number of active SSE (Server-Sent Events) subscribers
 */
export const sseActiveConnections = new client.Gauge({
  name: 'sse_active_connections',
  help: 'Number of active SSE connections (event subscribers)',
  registers: [register],
});

/**
 * SSE Total Connections
 * Tracks total SSE connections ever made
 */
export const sseTotalConnections = new client.Counter({
  name: 'sse_connections_total',
  help: 'Total SSE connections ever made',
  registers: [register],
});

/**
 * DSP Events Emitted
 * Tracks DSP events emitted by phase
 */
export const dspEventsEmitted = new client.Counter({
  name: 'dsp_events_emitted_total',
  help: 'Total DSP events emitted',
  labelNames: ['phase', 'action', 'status'],
  registers: [register],
});

// ============================================================================
// DATA ACCESS & AUDIT METRICS
// ============================================================================

/**
 * Data Access Requests
 */
export const dataAccessRequests = new client.Counter({
  name: 'data_access_requests_total',
  help: 'Total data access requests',
  labelNames: ['requester_type', 'data_type', 'result'],
  registers: [register],
});

/**
 * Data Access Total (for compliance dashboard)
 * Tracks data access by type, category, user role, and purpose
 */
export const dataAccessTotal = new client.Counter({
  name: 'data_access_total',
  help: 'Total data access operations with detailed labels',
  labelNames: ['access_type', 'data_category', 'user_role', 'purpose'],
  registers: [register],
});

/**
 * Audit Log Events
 */
export const auditEventsTotal = new client.Counter({
  name: 'audit_events_total',
  help: 'Total audit log events',
  labelNames: ['event_type', 'severity'],
  registers: [register],
});

/**
 * Policy Enforcement Events
 */
export const policyEnforcementTotal = new client.Counter({
  name: 'policy_enforcement_total',
  help: 'Total policy enforcement events',
  labelNames: ['policy_type', 'action', 'result'],
  registers: [register],
});

// ============================================================================
// IDENTITY & CREDENTIAL METRICS
// ============================================================================

/**
 * Verifiable Credential Issuance
 */
export const vcIssuanceTotal = new client.Counter({
  name: 'vc_issuance_total',
  help: 'Total verifiable credentials issued',
  labelNames: ['type', 'result'],
  registers: [register],
});

/**
 * DID Resolution Requests
 */
export const didResolutionTotal = new client.Counter({
  name: 'did_resolution_total',
  help: 'Total DID resolution requests',
  labelNames: ['method', 'result'],
  registers: [register],
});

/**
 * Credential Verification
 */
export const credentialVerificationTotal = new client.Counter({
  name: 'credential_verification_total',
  help: 'Total credential verifications',
  labelNames: ['type', 'result'],
  registers: [register],
});

// ============================================================================
// SYSTEM HEALTH METRICS
// ============================================================================

/**
 * Service Uptime
 */
export const serviceUptime = new client.Gauge({
  name: 'service_uptime_seconds',
  help: 'Service uptime in seconds',
  labelNames: ['service'],
  registers: [register],
});

/**
 * Service Health Status
 */
export const serviceHealthStatus = new client.Gauge({
  name: 'service_health_status',
  help: 'Service health status (1=healthy, 0=unhealthy)',
  labelNames: ['service', 'component'],
  registers: [register],
});

// ============================================================================
// METRICS INITIALIZATION & SIMULATION
// ============================================================================

const startTime = Date.now();

/**
 * Initialize EHDS metrics with baseline values
 * This simulates realistic dataspace activity for demo purposes
 */
export function initializeEhdsMetrics(): void {
  console.log('[EHDS Metrics] Initializing EHDS and Dataspace metrics...');

  // EHDS Compliance Scores
  ehdsComplianceScore.set({ category: 'data_access' }, 92);
  ehdsComplianceScore.set({ category: 'consent_management' }, 88);
  ehdsComplianceScore.set({ category: 'audit_logging' }, 95);
  ehdsComplianceScore.set({ category: 'data_portability' }, 85);
  ehdsComplianceScore.set({ category: 'interoperability' }, 90);

  // Data Access Rights Compliance
  ehdsDataAccessCompliance.set({ right_type: 'access' }, 1);
  ehdsDataAccessCompliance.set({ right_type: 'rectification' }, 1);
  ehdsDataAccessCompliance.set({ right_type: 'portability' }, 1);
  ehdsDataAccessCompliance.set({ right_type: 'restriction' }, 1);

  // Audit Trail
  ehdsAuditTrailCompleteness.set(97);

  // Consent Metrics
  consentTotal.set({ purpose: 'research', status: 'active' }, 145);
  consentTotal.set({ purpose: 'treatment', status: 'active' }, 312);
  consentTotal.set({ purpose: 'secondary_use', status: 'active' }, 78);
  consentTotal.set({ purpose: 'research', status: 'revoked' }, 12);
  consentTotal.set({ purpose: 'treatment', status: 'expired' }, 45);

  consentByType.set({ type: 'explicit' }, 423);
  consentByType.set({ type: 'implicit' }, 89);
  consentByType.set({ type: 'broad' }, 156);
  consentByType.set({ type: 'specific' }, 267);

  consentExpiring7d.set(23);
  consentExpiring24h.set(5);

  // Data Access by Type, Category, Role, and Purpose (for compliance dashboards)
  // Access Types: read, write, download, export, share
  // Data Categories: ehr, lab_results, imaging, medications, genomics
  // User Roles: researcher, clinician, admin, data_steward, auditor
  // Purposes: research, treatment, secondary_use, audit, quality_improvement
  
  // Initialize with baseline values
  const accessTypes = ['read', 'write', 'download', 'export', 'share'];
  const dataCategories = ['ehr', 'lab_results', 'imaging', 'medications', 'genomics'];
  const userRoles = ['researcher', 'clinician', 'admin', 'data_steward', 'auditor'];
  const purposes = ['research', 'treatment', 'secondary_use', 'audit', 'quality_improvement'];
  
  // Create realistic distribution
  accessTypes.forEach(accessType => {
    const weight = accessType === 'read' ? 100 : accessType === 'download' ? 30 : 10;
    dataAccessTotal.inc({ access_type: accessType, data_category: 'ehr', user_role: 'researcher', purpose: 'research' }, weight);
  });
  
  dataCategories.forEach(category => {
    const weight = category === 'ehr' ? 80 : category === 'lab_results' ? 40 : 15;
    dataAccessTotal.inc({ access_type: 'read', data_category: category, user_role: 'researcher', purpose: 'research' }, weight);
  });
  
  userRoles.forEach(role => {
    const weight = role === 'researcher' ? 100 : role === 'clinician' ? 60 : role === 'data_steward' ? 25 : 10;
    dataAccessTotal.inc({ access_type: 'read', data_category: 'ehr', user_role: role, purpose: 'research' }, weight);
  });
  
  purposes.forEach(purpose => {
    const weight = purpose === 'research' ? 120 : purpose === 'treatment' ? 80 : purpose === 'secondary_use' ? 40 : 15;
    dataAccessTotal.inc({ access_type: 'read', data_category: 'ehr', user_role: 'researcher', purpose }, weight);
  });

  // Transfer Metrics
  transferSuccessRate.set(0.97);
  activeTransfers.set({ type: 'fhir' }, 3);
  activeTransfers.set({ type: 'csv' }, 1);
  transferSpeed.set({ direction: 'outbound' }, 2500000); // 2.5 MB/s

  // EDC Operations
  edcAssetsTotal.set({ provider: 'health-provider', type: 'fhir' }, 20);
  edcAssetsTotal.set({ provider: 'health-provider', type: 'dicom' }, 5);
  edcDataOfferings.set({ provider: 'health-provider' }, 25);
  edcIdentitiesTotal.set({ type: 'organization' }, 2);
  edcIdentitiesTotal.set({ type: 'participant' }, 5);
  edcContractDefinitions.set({ provider: 'health-provider' }, 8);
  edcPolicyDefinitions.set({ type: 'consent' }, 6);
  edcPolicyDefinitions.set({ type: 'membership' }, 2);
  edcPolicyDefinitions.set({ type: 'usage' }, 4);
  edcCatalogSyncStatus.set({ provider: 'health-provider' }, 1);

  // EDC Flow Metrics (for dashboard panels)
  // Contract Negotiations
  contractNegotiationsTotal.inc({ status: 'completed' }, 145);
  contractNegotiationsTotal.inc({ status: 'pending' }, 12);
  contractNegotiationsTotal.inc({ status: 'rejected' }, 8);
  contractNegotiationsTotal.inc({ status: 'failed' }, 3);
  contractNegotiationsTotal.inc({ status: 'terminated' }, 5);
  
  // Asset Transfers
  assetTransfersTotal.inc({ status: 'completed' }, 132);
  assetTransfersTotal.inc({ status: 'in_progress' }, 5);
  assetTransfersTotal.inc({ status: 'failed' }, 7);
  assetTransfersTotal.inc({ status: 'cancelled' }, 2);
  
  // Catalog Queries
  catalogQueriesTotal.inc({ status: 'success', provider: 'health-provider' }, 1250);
  catalogQueriesTotal.inc({ status: 'success', provider: 'federated' }, 430);
  catalogQueriesTotal.inc({ status: 'error', provider: 'health-provider' }, 15);
  catalogQueriesTotal.inc({ status: 'timeout', provider: 'federated' }, 8);
  
  // EHDS Consent Requests
  ehdsConsentRequestsTotal.inc({ status: 'approved', purpose: 'research' }, 156);
  ehdsConsentRequestsTotal.inc({ status: 'approved', purpose: 'treatment' }, 287);
  ehdsConsentRequestsTotal.inc({ status: 'approved', purpose: 'secondary_use' }, 89);
  ehdsConsentRequestsTotal.inc({ status: 'denied', purpose: 'research' }, 12);
  ehdsConsentRequestsTotal.inc({ status: 'denied', purpose: 'treatment' }, 4);
  ehdsConsentRequestsTotal.inc({ status: 'pending', purpose: 'research' }, 23);
  ehdsConsentRequestsTotal.inc({ status: 'expired', purpose: 'research' }, 45);
  ehdsConsentRequestsTotal.inc({ status: 'revoked', purpose: 'research' }, 8);
  
  // EHR Records Accessed
  ehrRecordsAccessedTotal.inc({ record_type: 'patient_summary', access_type: 'read' }, 890);
  ehrRecordsAccessedTotal.inc({ record_type: 'lab_results', access_type: 'read' }, 567);
  ehrRecordsAccessedTotal.inc({ record_type: 'medications', access_type: 'read' }, 432);
  ehrRecordsAccessedTotal.inc({ record_type: 'imaging', access_type: 'read' }, 234);
  ehrRecordsAccessedTotal.inc({ record_type: 'genomics', access_type: 'read' }, 78);
  ehrRecordsAccessedTotal.inc({ record_type: 'patient_summary', access_type: 'export' }, 145);
  ehrRecordsAccessedTotal.inc({ record_type: 'lab_results', access_type: 'export' }, 89);

  // Service Health
  serviceHealthStatus.set({ service: 'backend-edc', component: 'api' }, 1);
  serviceHealthStatus.set({ service: 'backend-edc', component: 'edc_proxy' }, 1);
  serviceHealthStatus.set({ service: 'consumer-controlplane', component: 'dsp' }, 1);
  serviceHealthStatus.set({ service: 'provider-controlplane', component: 'dsp' }, 1);

  console.log('[EHDS Metrics] Initialization complete');
}

/**
 * Simulate ongoing dataspace activity
 * Updates metrics periodically to show realistic activity
 */
export function startMetricsSimulation(): void {
  console.log('[EHDS Metrics] Starting metrics simulation...');

  // Update metrics every 15 seconds
  setInterval(() => {
    simulateDataspaceActivity();
  }, 15000);

  // Update uptime every 5 seconds
  setInterval(() => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    serviceUptime.set({ service: 'backend-edc' }, uptimeSeconds);
  }, 5000);
}

function simulateDataspaceActivity(): void {
  // Simulate transfer volume (random bytes transferred)
  const bytesTransferred = Math.floor(Math.random() * 50000) + 10000;
  transferVolume.inc({ direction: 'outbound', format: 'fhir' }, bytesTransferred);

  // Simulate consent operations
  if (Math.random() > 0.8) {
    consentOperationsTotal.inc({ operation: 'verify', status: 'success' });
  }
  if (Math.random() > 0.95) {
    consentOperationsTotal.inc({ operation: 'create', status: 'success' });
  }
  if (Math.random() > 0.98) {
    consentOperationsTotal.inc({ operation: 'revoke', status: 'success' });
  }

  // Simulate DSP messages
  dspMessagesTotal.inc({ type: 'catalog_request', direction: 'outbound' });
  if (Math.random() > 0.3) {
    dspMessagesTotal.inc({ type: 'catalog_response', direction: 'inbound' });
  }
  if (Math.random() > 0.7) {
    dspMessagesTotal.inc({ type: 'contract_offer', direction: 'inbound' });
  }

  // Simulate EDC flow metrics (for dashboard panels)
  // Contract negotiations - mostly completed, occasional other states
  if (Math.random() > 0.6) {
    contractNegotiationsTotal.inc({ status: 'completed' });
  }
  if (Math.random() > 0.9) {
    contractNegotiationsTotal.inc({ status: 'pending' });
  }
  if (Math.random() > 0.97) {
    contractNegotiationsTotal.inc({ status: 'rejected' });
  }
  if (Math.random() > 0.99) {
    contractNegotiationsTotal.inc({ status: 'failed' });
  }
  
  // Asset transfers
  if (Math.random() > 0.5) {
    assetTransfersTotal.inc({ status: 'completed' });
  }
  if (Math.random() > 0.95) {
    assetTransfersTotal.inc({ status: 'failed' });
  }
  
  // Catalog queries - frequent operation
  catalogQueriesTotal.inc({ status: 'success', provider: 'health-provider' });
  if (Math.random() > 0.5) {
    catalogQueriesTotal.inc({ status: 'success', provider: 'federated' });
  }
  if (Math.random() > 0.98) {
    catalogQueriesTotal.inc({ status: 'error', provider: 'health-provider' });
  }
  
  // EHDS consent requests
  if (Math.random() > 0.7) {
    const consentPurpose = Math.random() > 0.5 ? 'research' : Math.random() > 0.5 ? 'treatment' : 'secondary_use';
    const consentStatus = Math.random() > 0.1 ? 'approved' : Math.random() > 0.5 ? 'denied' : 'pending';
    ehdsConsentRequestsTotal.inc({ status: consentStatus, purpose: consentPurpose });
  }
  
  // EHR records accessed
  if (Math.random() > 0.4) {
    const recordTypes = ['patient_summary', 'lab_results', 'medications', 'imaging', 'genomics'];
    const recordType = recordTypes[Math.floor(Math.random() * recordTypes.length)];
    const accessType = Math.random() > 0.8 ? 'export' : 'read';
    ehrRecordsAccessedTotal.inc({ record_type: recordType, access_type: accessType });
  }

  // Simulate data access requests (legacy metric)
  dataAccessRequests.inc({ 
    requester_type: 'researcher', 
    data_type: 'ehr', 
    result: Math.random() > 0.1 ? 'allowed' : 'denied' 
  });

  // Simulate detailed data access (for compliance dashboards)
  const accessTypes = ['read', 'write', 'download', 'export', 'share'];
  const dataCategories = ['ehr', 'lab_results', 'imaging', 'medications', 'genomics'];
  const userRoles = ['researcher', 'clinician', 'admin', 'data_steward', 'auditor'];
  const purposes = ['research', 'treatment', 'secondary_use', 'audit', 'quality_improvement'];
  
  // Pick random values with realistic weights
  const accessType = Math.random() > 0.7 ? accessTypes[Math.floor(Math.random() * accessTypes.length)] : 'read';
  const dataCategory = Math.random() > 0.6 ? dataCategories[Math.floor(Math.random() * dataCategories.length)] : 'ehr';
  const userRole = Math.random() > 0.5 ? userRoles[Math.floor(Math.random() * userRoles.length)] : 'researcher';
  const purpose = Math.random() > 0.6 ? purposes[Math.floor(Math.random() * purposes.length)] : 'research';
  
  dataAccessTotal.inc({ access_type: accessType, data_category: dataCategory, user_role: userRole, purpose });

  // Simulate audit events
  auditEventsTotal.inc({ event_type: 'data_access', severity: 'info' });
  if (Math.random() > 0.9) {
    auditEventsTotal.inc({ event_type: 'consent_check', severity: 'info' });
  }

  // Simulate policy enforcement
  policyEnforcementTotal.inc({ 
    policy_type: 'consent', 
    action: 'data_access', 
    result: 'allow' 
  });

  // Simulate VC/DID operations
  if (Math.random() > 0.7) {
    didResolutionTotal.inc({ method: 'did:web', result: 'success' });
    credentialVerificationTotal.inc({ type: 'membership', result: 'valid' });
  }

  // Randomly vary some gauges
  const activeTransferCount = Math.floor(Math.random() * 5) + 1;
  activeTransfers.set({ type: 'fhir' }, activeTransferCount);

  const currentSpeed = 2000000 + Math.floor(Math.random() * 1000000);
  transferSpeed.set({ direction: 'outbound' }, currentSpeed);

  // Update expiring consents (slowly decrease over time)
  const currentExpiring7d = Math.max(0, 23 - Math.floor(Math.random() * 2));
  consentExpiring7d.set(currentExpiring7d);
}

/**
 * Record a catalog operation with EHDS metrics
 */
export function recordCatalogOperation(_provider: string, success: boolean, durationMs: number): void {
  dspMessagesTotal.inc({ type: 'catalog_request', direction: 'outbound' });
  if (success) {
    dspMessagesTotal.inc({ type: 'catalog_response', direction: 'inbound' });
  }
  dspMessageLatency.observe({ type: 'catalog' }, durationMs / 1000);
  dataAccessRequests.inc({ 
    requester_type: 'system', 
    data_type: 'catalog', 
    result: success ? 'allowed' : 'denied' 
  });
  auditEventsTotal.inc({ event_type: 'catalog_access', severity: 'info' });
}

/**
 * Record a consent verification with EHDS metrics
 */
export function recordConsentCheck(valid: boolean, _durationMs: number): void {
  const endTimer = consentVerificationDuration.startTimer({ result: valid ? 'valid' : 'invalid' });
  endTimer();
  consentOperationsTotal.inc({ operation: 'verify', status: valid ? 'success' : 'failure' });
  policyEnforcementTotal.inc({ 
    policy_type: 'consent', 
    action: 'verify', 
    result: valid ? 'allow' : 'deny' 
  });
}

/**
 * Record a data transfer with EHDS metrics
 */
export function recordDataTransfer(bytes: number, format: string, success: boolean): void {
  transferVolume.inc({ direction: 'outbound', format }, bytes);
  dataAccessRequests.inc({ 
    requester_type: 'consumer', 
    data_type: format, 
    result: success ? 'allowed' : 'denied' 
  });
  auditEventsTotal.inc({ event_type: 'data_transfer', severity: success ? 'info' : 'warning' });
}
