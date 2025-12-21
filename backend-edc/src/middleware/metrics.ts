/**
 * Prometheus Metrics Middleware for Backend-EDC
 * 
 * Provides HTTP request metrics, EDC operation metrics,
 * and dataspace activity metrics.
 */

import { Request, Response, NextFunction } from 'express';
import * as client from 'prom-client';

// Create a Registry
export const register = new client.Registry();

// Add default metrics (CPU, memory, event loop)
client.collectDefaultMetrics({ register });

// HTTP Metrics

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

export const activeRequests = new client.Gauge({
  name: 'http_requests_active',
  help: 'Number of requests currently being processed',
  registers: [register],
});

// Catalog Metrics

export const catalogRequestsTotal = new client.Counter({
  name: 'catalog_requests_total',
  help: 'Total catalog requests',
  labelNames: ['provider', 'status'],
  registers: [register],
});

export const catalogResponseTime = new client.Histogram({
  name: 'catalog_response_time_seconds',
  help: 'Catalog request response time',
  labelNames: ['provider'],
  buckets: [0.1, 0.25, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

// Negotiation Metrics

export const negotiationsTotal = new client.Counter({
  name: 'negotiations_total',
  help: 'Total contract negotiations',
  labelNames: ['status', 'asset_type'],
  registers: [register],
});

export const negotiationDuration = new client.Histogram({
  name: 'negotiation_duration_seconds',
  help: 'Duration of contract negotiations',
  labelNames: ['outcome'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60, 120, 300],
  registers: [register],
});

export const activeNegotiations = new client.Gauge({
  name: 'active_negotiations',
  help: 'Currently active negotiations',
  registers: [register],
});

// Transfer Metrics

export const transfersTotal = new client.Counter({
  name: 'transfers_total',
  help: 'Total data transfers',
  labelNames: ['status', 'format'],
  registers: [register],
});

export const transferDuration = new client.Histogram({
  name: 'transfer_duration_seconds',
  help: 'Duration of data transfers',
  labelNames: ['format'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const transferBytesTotal = new client.Counter({
  name: 'transfer_bytes_total',
  help: 'Total bytes transferred',
  labelNames: ['direction'],
  registers: [register],
});

// Identity Metrics

export const identityVerificationsTotal = new client.Counter({
  name: 'identity_verifications_total',
  help: 'Total identity/credential verifications',
  labelNames: ['type', 'result'],
  registers: [register],
});

// EDC Connectivity Metrics

export const edcConnectivityStatus = new client.Gauge({
  name: 'edc_connectivity_status',
  help: 'EDC connector connectivity (1=connected, 0=disconnected)',
  labelNames: ['connector', 'type'],
  registers: [register],
});

export const edcRequestDuration = new client.Histogram({
  name: 'edc_request_duration_seconds',
  help: 'Duration of requests to EDC connectors',
  labelNames: ['connector', 'endpoint'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

// Policy Metrics

export const policyEvaluationsTotal = new client.Counter({
  name: 'policy_evaluations_total',
  help: 'Total ODRL policy evaluations',
  labelNames: ['policy_type', 'result'],
  registers: [register],
});

// Consent Metrics

export const consentVerificationsTotal = new client.Counter({
  name: 'consent_verifications_total',
  help: 'Total consent verification attempts',
  labelNames: ['result'],
  registers: [register],
});

/**
 * Normalize path to prevent high cardinality
 */
function normalizePath(path: string): string {
  let normalized = path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
    .replace(/\/EHR\d+/g, '/:ehrId')
    .replace(/\/\d+/g, '/:id');
  return normalized;
}

/**
 * Metrics middleware for Express
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/metrics') {
    next();
    return;
  }

  activeRequests.inc();
  const end = httpRequestDuration.startTimer();
  
  res.on('finish', () => {
    const path = normalizePath(req.path);
    const labels = {
      method: req.method,
      path: path,
      status: String(res.statusCode),
    };
    
    end(labels);
    httpRequestsTotal.inc(labels);
    activeRequests.dec();
  });
  
  next();
}

// Helper functions for recording metrics

export function recordCatalogRequest(provider: string, status: 'success' | 'error'): () => void {
  catalogRequestsTotal.inc({ provider, status });
  return catalogResponseTime.startTimer({ provider });
}

export function recordNegotiationStart(): void {
  activeNegotiations.inc();
}

export function recordNegotiationEnd(outcome: 'success' | 'failure' | 'timeout', assetType: string): void {
  activeNegotiations.dec();
  negotiationsTotal.inc({ status: outcome, asset_type: assetType });
}

export function recordNegotiationDuration(outcome: string): () => void {
  return negotiationDuration.startTimer({ outcome });
}

export function recordTransfer(status: 'started' | 'completed' | 'failed', format: string): void {
  transfersTotal.inc({ status, format });
}

export function recordTransferBytes(bytes: number, direction: 'inbound' | 'outbound'): void {
  transferBytesTotal.inc({ direction }, bytes);
}

export function recordIdentityVerification(type: string, result: 'success' | 'failure'): void {
  identityVerificationsTotal.inc({ type, result });
}

export function recordEdcConnectivity(connector: string, type: string, connected: boolean): void {
  edcConnectivityStatus.set({ connector, type }, connected ? 1 : 0);
}

export function recordPolicyEvaluation(policyType: string, result: 'allow' | 'deny'): void {
  policyEvaluationsTotal.inc({ policy_type: policyType, result });
}

export function recordConsentVerification(result: 'valid' | 'invalid' | 'expired'): void {
  consentVerificationsTotal.inc({ result });
}
