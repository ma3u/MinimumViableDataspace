/**
 * Prometheus Metrics Middleware for Backend-Mock
 * 
 * Provides HTTP request metrics and custom application metrics
 * for monitoring dataspace operations.
 * 
 * @see https://github.com/siimon/prom-client
 */

import { Request, Response, NextFunction } from 'express';
import * as client from 'prom-client';

// Create a Registry
export const register = new client.Registry();

// Add default metrics (CPU, memory, event loop)
client.collectDefaultMetrics({ register });

// Custom metrics

/**
 * HTTP Request Duration Histogram
 * Tracks request latency by method, path, and status code
 */
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  registers: [register],
});

/**
 * HTTP Request Counter
 * Counts total requests by method, path, and status
 */
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

/**
 * EHR Records Served Counter
 * Tracks how many EHR records have been requested
 */
export const ehrRecordsServed = new client.Counter({
  name: 'ehr_records_served_total',
  help: 'Total number of EHR records served',
  labelNames: ['record_id', 'category'],
  registers: [register],
});

/**
 * Active Requests Gauge
 * Shows currently processing requests
 */
export const activeRequests = new client.Gauge({
  name: 'http_requests_active',
  help: 'Number of requests currently being processed',
  registers: [register],
});

/**
 * Health Check Counter
 * Tracks health check requests
 */
export const healthChecksTotal = new client.Counter({
  name: 'health_checks_total',
  help: 'Total number of health check requests',
  labelNames: ['endpoint', 'status'],
  registers: [register],
});

/**
 * Data Access Duration
 * Measures time to fetch EHR data
 */
export const dataAccessDuration = new client.Histogram({
  name: 'ehr_data_access_duration_seconds',
  help: 'Duration to access EHR data',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});

/**
 * Normalize path to prevent high cardinality
 * Replaces IDs with placeholders
 */
function normalizePath(path: string): string {
  // Replace EHR IDs like /api/ehr/EHR001 -> /api/ehr/:id
  let normalized = path.replace(/\/EHR\d+/g, '/:id');
  // Replace UUIDs
  normalized = normalized.replace(
    /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    '/:uuid'
  );
  // Replace numeric IDs
  normalized = normalized.replace(/\/\d+/g, '/:id');
  return normalized;
}

/**
 * Metrics middleware
 * Records request duration and counts for each request
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip metrics endpoint to avoid recursion
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
    
    // Track health checks separately
    if (req.path.startsWith('/health')) {
      healthChecksTotal.inc({
        endpoint: req.path,
        status: res.statusCode < 400 ? 'success' : 'failure',
      });
    }
  });
  
  next();
}

/**
 * Record EHR access for metrics
 */
export function recordEhrAccess(recordId: string, category: string): void {
  ehrRecordsServed.inc({ record_id: recordId, category });
}

/**
 * Measure data access operation
 */
export function measureDataAccess(operation: string): () => void {
  return dataAccessDuration.startTimer({ operation });
}
