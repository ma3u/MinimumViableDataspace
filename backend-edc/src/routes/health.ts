/**
 * Health Routes
 * 
 * Health check and status endpoints for the backend-edc service.
 */

import { Router, Request, Response } from 'express';
import { config } from '../config.js';

export const healthRouter = Router();

interface ServiceStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  latencyMs?: number;
  error?: string;
}

/**
 * GET /health
 * Basic health check
 */
healthRouter.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ehr2edc-backend-edc',
    mode: config.mode,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/detailed
 * Detailed health check with dependency status
 */
healthRouter.get('/detailed', async (req: Request, res: Response) => {
  const checks: Record<string, ServiceStatus> = {};
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

  // Check mock backend (only in hybrid mode)
  if (config.mode === 'hybrid') {
    const mockCheck = await checkService(config.mock.baseUrl, '/health');
    checks.mockBackend = mockCheck;
    if (mockCheck.status !== 'healthy') {
      overallStatus = 'degraded';
    }
  }

  // Check Consumer Control Plane
  const consumerCheck = await checkService(
    config.consumer.managementUrl,
    '/api/management/v3/assets/request',
    'POST',
    { offset: 0, limit: 1 }
  );
  checks.consumerControlPlane = consumerCheck;
  if (consumerCheck.status !== 'healthy') {
    overallStatus = config.mode === 'hybrid' ? 'degraded' : 'unhealthy';
  }

  // Check Provider Control Plane
  const providerCheck = await checkService(
    config.provider.managementUrl,
    '/api/management/v3/assets/request',
    'POST',
    { offset: 0, limit: 1 }
  );
  checks.providerControlPlane = providerCheck;
  if (providerCheck.status !== 'healthy') {
    overallStatus = config.mode === 'hybrid' ? 'degraded' : 'unhealthy';
  }

  // Check Consumer Identity Hub
  const consumerIdHubCheck = await checkService(
    config.consumer.identityHubUrl,
    '/api/identity/v1alpha/participants'
  );
  checks.consumerIdentityHub = consumerIdHubCheck;

  // Check Provider Identity Hub
  const providerIdHubCheck = await checkService(
    config.provider.identityHubUrl,
    '/api/identity/v1alpha/participants'
  );
  checks.providerIdentityHub = providerIdHubCheck;

  res.status(overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503).json({
    status: overallStatus,
    service: 'ehr2edc-backend-edc',
    mode: config.mode,
    timestamp: new Date().toISOString(),
    checks,
    config: {
      consumerManagement: config.consumer.managementUrl,
      providerManagement: config.provider.managementUrl,
      providerDsp: config.provider.dspUrl,
      mockBackend: config.mode === 'hybrid' ? config.mock.baseUrl : 'disabled',
    },
  });
});

/**
 * GET /health/ready
 * Readiness check for container orchestration
 */
healthRouter.get('/ready', async (req: Request, res: Response) => {
  try {
    // Quick check of consumer control plane
    const response = await fetch(
      `${config.consumer.managementUrl}/api/management/v3/assets/request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': config.edc.apiKey,
        },
        body: JSON.stringify({ offset: 0, limit: 1 }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.ok) {
      res.json({ ready: true });
    } else {
      res.status(503).json({ ready: false, reason: 'EDC not responding' });
    }
  } catch (error) {
    res.status(503).json({ 
      ready: false, 
      reason: error instanceof Error ? error.message : 'Health check failed',
    });
  }
});

/**
 * GET /health/live
 * Liveness check for container orchestration
 */
healthRouter.get('/live', (req: Request, res: Response) => {
  res.json({ alive: true });
});

/**
 * Helper to check service health
 */
async function checkService(
  baseUrl: string, 
  path: string, 
  method: 'GET' | 'POST' = 'GET',
  body?: unknown
): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.edc.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });

    const latencyMs = Date.now() - start;

    if (response.ok) {
      return { status: 'healthy', latencyMs };
    } else if (response.status >= 500) {
      return { status: 'unhealthy', latencyMs, error: `HTTP ${response.status}` };
    } else {
      // 4xx might still indicate service is up
      return { status: 'degraded', latencyMs, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    const latencyMs = Date.now() - start;
    return { 
      status: 'unhealthy', 
      latencyMs,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
