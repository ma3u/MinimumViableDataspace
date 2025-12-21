/**
 * Backend EDC Server
 * 
 * Express server that proxies requests to EDC connectors.
 * Supports hybrid mode (mock fallback) and full EDC mode.
 * 
 * Usage:
 *   npm run dev          # Default hybrid mode
 *   npm run dev:hybrid   # Explicit hybrid mode
 *   npm run dev:full     # Full EDC mode (no mock fallback)
 */

// Initialize OpenTelemetry tracing FIRST (before other imports)
import { initTracing, shutdownTracing } from './middleware/tracing.js';
initTracing();

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { config, logConfig } from './config.js';
import { catalogRouter } from './routes/catalog.js';
import { negotiationRouter } from './routes/negotiation.js';
import { transferRouter } from './routes/transfer.js';
import { identityRouter } from './routes/identity.js';
import { healthRouter } from './routes/health.js';
import { eventsRouter } from './routes/events.js';
import { participantsRouter } from './routes/participants.js';
import { metricsMiddleware, register } from './middleware/metrics.js';
import { loggingMiddleware, logger } from './middleware/logging.js';
import { initializeEhdsMetrics, startMetricsSimulation } from './middleware/ehds-metrics.js';

// Initialize EHDS metrics with baseline values
initializeEhdsMetrics();
startMetricsSimulation();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:4000'],
  credentials: true,
}));
app.use(express.json());

// Observability middleware
app.use(loggingMiddleware);
app.use(metricsMiddleware);

// Prometheus metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err instanceof Error ? err.message : 'Error generating metrics');
  }
});

// Health check routes (no /api prefix)
app.use('/health', healthRouter);

// API routes
app.use('/api/catalog', catalogRouter);
app.use('/api/negotiations', negotiationRouter);
app.use('/api/transfers', transferRouter);
app.use('/api/identity', identityRouter);
app.use('/api/events', eventsRouter);
app.use('/api/participants', participantsRouter);

// Legacy /api/ehr routes for compatibility
app.get('/api/ehr', async (_req: Request, res: Response) => {
  // Redirect to catalog assets endpoint
  res.redirect('/api/catalog/assets');
});

app.get('/api/ehr/:id', async (req: Request, res: Response) => {
  // Redirect to transfer EHR endpoint
  res.redirect(`/api/transfers/ehr/${req.params.id}`);
});

// Mode info endpoint
app.get('/api/mode', (_req: Request, res: Response) => {
  res.json({
    mode: config.mode,
    description: config.mode === 'hybrid' 
      ? 'Hybrid mode: Uses mock backend with EDC catalog/metadata' 
      : 'Full mode: All data flows through EDC connectors',
    endpoints: {
      catalog: '/api/catalog',
      negotiations: '/api/negotiations',
      transfers: '/api/transfers',
      identity: '/api/identity',
      health: '/health',
    },
    edc: {
      consumer: {
        management: config.edc.consumerManagementUrl,
        dsp: config.edc.consumerDspUrl,
      },
      provider: {
        management: config.provider.managementUrl,
        dsp: config.provider.dspUrl,
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /health/detailed',
      'GET /api/mode',
      'GET /api/catalog',
      'GET /api/catalog/assets',
      'GET /api/catalog/cached',
      'POST /api/negotiations',
      'GET /api/negotiations/:id',
      'POST /api/negotiations/:id/poll',
      'GET /api/negotiations/:id/agreement',
      'POST /api/transfers',
      'GET /api/transfers/:id',
      'POST /api/transfers/:id/poll',
      'GET /api/transfers/:id/edr',
      'GET /api/transfers/:id/data',
      'GET /api/transfers/ehr/:id',
      'POST /api/transfers/ehr/:id/transfer',
      'GET /api/identity/participant',
      'GET /api/identity/credentials',
      'POST /api/identity/attestation/membership',
      'POST /api/identity/attestation/consent',
      'GET /api/identity/consent/:patientDid',
      'POST /api/identity/consent/:patientDid/revoke',
      'GET /api/identity/provider/verify',
      'GET /api/events',
      'GET /api/events/stream',
      'GET /api/events/stats',
      'DELETE /api/events',
    ],
  });
});

// Error handler
const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  logger.error('Unhandled error', {
    correlationId: req.correlationId,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    correlationId: req.correlationId,
  });
};
app.use(errorHandler);

// Start server
const PORT = process.env.PORT ?? 3002;

const server = app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, mode: config.mode });
  console.log('================================================');
  console.log('    EHR2EDC Backend (EDC Integration)');
  console.log('================================================');
  logConfig();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('================================================');
  console.log('');
  console.log('Endpoints:');
  console.log(`  Health:       http://localhost:${PORT}/health`);
  console.log(`  Metrics:      http://localhost:${PORT}/metrics`);
  console.log(`  Catalog:      http://localhost:${PORT}/api/catalog`);
  console.log(`  Negotiations: http://localhost:${PORT}/api/negotiations`);
  console.log(`  Transfers:    http://localhost:${PORT}/api/transfers`);
  console.log(`  Identity:     http://localhost:${PORT}/api/identity`);
  console.log(`  Participants: http://localhost:${PORT}/api/participants`);
  console.log(`  Events SSE:   http://localhost:${PORT}/api/events/stream`);
  console.log(`  Mode Info:    http://localhost:${PORT}/api/mode`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await shutdownTracing();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await shutdownTracing();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
