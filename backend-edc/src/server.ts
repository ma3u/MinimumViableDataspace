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

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { config, logConfig } from './config.js';
import { catalogRouter } from './routes/catalog.js';
import { negotiationRouter } from './routes/negotiation.js';
import { transferRouter } from './routes/transfer.js';
import { identityRouter } from './routes/identity.js';
import { healthRouter } from './routes/health.js';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check routes (no /api prefix)
app.use('/health', healthRouter);

// API routes
app.use('/api/catalog', catalogRouter);
app.use('/api/negotiations', negotiationRouter);
app.use('/api/transfers', transferRouter);
app.use('/api/identity', identityRouter);

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
    ],
  });
});

// Error handler
const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
};
app.use(errorHandler);

// Start server
const PORT = process.env.PORT ?? 3002;

app.listen(PORT, () => {
  console.log('================================================');
  console.log('    EHR2EDC Backend (EDC Integration)');
  console.log('================================================');
  logConfig();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('================================================');
  console.log('');
  console.log('Endpoints:');
  console.log(`  Health:       http://localhost:${PORT}/health`);
  console.log(`  Catalog:      http://localhost:${PORT}/api/catalog`);
  console.log(`  Negotiations: http://localhost:${PORT}/api/negotiations`);
  console.log(`  Transfers:    http://localhost:${PORT}/api/transfers`);
  console.log(`  Identity:     http://localhost:${PORT}/api/identity`);
  console.log(`  Mode Info:    http://localhost:${PORT}/api/mode`);
  console.log('');
});

export default app;
