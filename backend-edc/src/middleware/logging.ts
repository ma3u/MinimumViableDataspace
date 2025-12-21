/**
 * Structured Logging with Winston for Backend-EDC
 * 
 * Provides JSON-structured logging with correlation IDs,
 * trace context, and sensitive data masking.
 */

import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Custom format for JSON structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  defaultMeta: { service: 'backend-edc' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development' 
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : structuredFormat
    }),
  ],
});

// Patterns to mask in logs
const SENSITIVE_KEYS = ['password', 'apiKey', 'authorization', 'x-api-key', 'token', 'secret', 'credential'];

/**
 * Mask sensitive data in objects
 */
function maskSensitiveData(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveData);
  }

  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
      masked[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

// Extend Express Request to include correlation context
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId: string;
      traceId?: string;
      spanId?: string;
      startTime: number;
      log: typeof logger;
    }
  }
}

/**
 * Logging middleware
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Generate or extract correlation ID
  req.correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  req.startTime = Date.now();
  
  // Extract OpenTelemetry trace context if present
  const traceparent = req.headers['traceparent'] as string;
  if (traceparent) {
    const parts = traceparent.split('-');
    if (parts.length >= 4) {
      req.traceId = parts[1];
      req.spanId = parts[2];
    }
  }
  
  // Create a child logger with request context
  req.log = logger.child({
    correlationId: req.correlationId,
    traceId: req.traceId,
    spanId: req.spanId,
  });
  
  // Add correlation ID to response headers
  res.setHeader('X-Correlation-Id', req.correlationId);
  
  // Log request
  req.log.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.headers['user-agent'],
  });
  
  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    
    req.log.log(level, 'Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration_ms: duration,
    });
  });
  
  next();
}

/**
 * Create a contextual logger for specific operations
 */
export function createOperationLogger(operation: string, context: Record<string, unknown> = {}) {
  return logger.child({
    operation,
    ...maskSensitiveData(context) as Record<string, unknown>,
  });
}

/**
 * Log EDC request/response
 */
export function logEdcRequest(
  operation: string,
  url: string,
  method: string,
  correlationId?: string
) {
  return {
    start: () => {
      logger.info(`EDC request started: ${operation}`, {
        correlationId,
        edc: { url, method, operation },
      });
      return Date.now();
    },
    end: (startTime: number, status: number, error?: string) => {
      const duration = Date.now() - startTime;
      const level = error ? 'error' : status >= 400 ? 'warn' : 'info';
      
      logger.log(level, `EDC request completed: ${operation}`, {
        correlationId,
        edc: { url, method, operation, status, duration_ms: duration },
        error,
      });
    },
  };
}
