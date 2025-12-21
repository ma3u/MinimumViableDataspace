/**
 * Structured Logging Middleware for Backend-Mock
 * 
 * Provides JSON-structured logging with correlation IDs,
 * trace context propagation, and sensitive data masking.
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface LogContext {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  service: string;
  correlationId: string;
  traceId?: string;
  spanId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration_ms?: number;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  [key: string]: unknown;
}

// Log level configuration
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL?.toUpperCase() as keyof typeof LOG_LEVELS || 'INFO';

// Patterns to mask in logs
const SENSITIVE_PATTERNS = [
  /("password"\s*:\s*)"[^"]*"/gi,
  /("apiKey"\s*:\s*)"[^"]*"/gi,
  /("authorization"\s*:\s*)"[^"]*"/gi,
  /("x-api-key"\s*:\s*)"[^"]*"/gi,
  /("token"\s*:\s*)"[^"]*"/gi,
  /("secret"\s*:\s*)"[^"]*"/gi,
];

/**
 * Mask sensitive data in strings
 */
function maskSensitiveData(data: string): string {
  let masked = data;
  for (const pattern of SENSITIVE_PATTERNS) {
    masked = masked.replace(pattern, '$1"[REDACTED]"');
  }
  return masked;
}

/**
 * Get current timestamp in ISO format
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Check if log level is enabled
 */
function isLevelEnabled(level: keyof typeof LOG_LEVELS): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogContext['level'],
  message: string,
  context: Partial<LogContext> = {}
): LogContext {
  return {
    timestamp: getTimestamp(),
    level,
    service: 'backend-mock',
    correlationId: context.correlationId || 'unknown',
    message,
    ...context,
  };
}

/**
 * Output log entry as JSON
 */
function outputLog(entry: LogContext): void {
  const output = maskSensitiveData(JSON.stringify(entry));
  
  switch (entry.level) {
    case 'ERROR':
      console.error(output);
      break;
    case 'WARN':
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

/**
 * Logger instance that can be used throughout the application
 */
export const logger = {
  debug: (message: string, context: Partial<LogContext> = {}) => {
    if (isLevelEnabled('DEBUG')) {
      outputLog(createLogEntry('DEBUG', message, context));
    }
  },
  info: (message: string, context: Partial<LogContext> = {}) => {
    if (isLevelEnabled('INFO')) {
      outputLog(createLogEntry('INFO', message, context));
    }
  },
  warn: (message: string, context: Partial<LogContext> = {}) => {
    if (isLevelEnabled('WARN')) {
      outputLog(createLogEntry('WARN', message, context));
    }
  },
  error: (message: string, error?: Error, context: Partial<LogContext> = {}) => {
    if (isLevelEnabled('ERROR')) {
      const errorContext = error ? {
        error: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      } : {};
      outputLog(createLogEntry('ERROR', message, { ...context, ...errorContext }));
    }
  },
};

// Extend Express Request to include correlation context
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId: string;
      traceId?: string;
      spanId?: string;
      startTime: number;
    }
  }
}

/**
 * Logging middleware
 * Adds correlation ID, extracts trace context, and logs requests
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
  
  // Add correlation ID to response headers
  res.setHeader('X-Correlation-Id', req.correlationId);
  
  // Log request
  logger.info(`Incoming request: ${req.method} ${req.path}`, {
    correlationId: req.correlationId,
    traceId: req.traceId,
    spanId: req.spanId,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
  });
  
  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const context = {
      correlationId: req.correlationId,
      traceId: req.traceId,
      spanId: req.spanId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration_ms: duration,
    };
    
    if (res.statusCode >= 500) {
      logger.error(`Request completed: ${req.method} ${req.path} ${res.statusCode}`, undefined, context);
    } else if (res.statusCode >= 400) {
      logger.warn(`Request completed: ${req.method} ${req.path} ${res.statusCode}`, context);
    } else {
      logger.info(`Request completed: ${req.method} ${req.path} ${res.statusCode}`, context);
    }
  });
  
  next();
}

/**
 * Create a child logger with context
 */
export function createChildLogger(context: Partial<LogContext>) {
  return {
    debug: (message: string, additionalContext: Partial<LogContext> = {}) => 
      logger.debug(message, { ...context, ...additionalContext }),
    info: (message: string, additionalContext: Partial<LogContext> = {}) => 
      logger.info(message, { ...context, ...additionalContext }),
    warn: (message: string, additionalContext: Partial<LogContext> = {}) => 
      logger.warn(message, { ...context, ...additionalContext }),
    error: (message: string, error?: Error, additionalContext: Partial<LogContext> = {}) => 
      logger.error(message, error, { ...context, ...additionalContext }),
  };
}
