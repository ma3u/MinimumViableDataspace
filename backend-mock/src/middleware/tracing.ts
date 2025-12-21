/**
 * OpenTelemetry Tracing Setup for Backend-Mock
 * 
 * Provides distributed tracing with automatic instrumentation
 * for Express HTTP requests.
 * 
 * @see https://opentelemetry.io/docs/instrumentation/js/
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { trace, SpanStatusCode, Span } from '@opentelemetry/api';

// Service configuration
const SERVICE_NAME = 'backend-mock';
const SERVICE_VERSION = '1.0.0';

// Jaeger/OTLP endpoint (configurable via environment)
const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
const TRACING_ENABLED = process.env.TRACING_ENABLED !== 'false';

let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry SDK
 * Call this before starting the Express server
 */
export function initTracing(): void {
  if (!TRACING_ENABLED) {
    console.log('[Tracing] Tracing disabled via TRACING_ENABLED=false');
    return;
  }

  try {
    sdk = new NodeSDK({
      resource: new Resource({
        [ATTR_SERVICE_NAME]: SERVICE_NAME,
        [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
        'deployment.environment': process.env.NODE_ENV || 'development',
      }),
      traceExporter: new OTLPTraceExporter({
        url: OTLP_ENDPOINT,
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable fs instrumentation to reduce noise
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
        }),
      ],
    });

    sdk.start();
    console.log(`[Tracing] OpenTelemetry initialized - exporting to ${OTLP_ENDPOINT}`);
  } catch (error) {
    console.error('[Tracing] Failed to initialize OpenTelemetry:', error);
  }
}

/**
 * Shutdown tracing gracefully
 */
export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    console.log('[Tracing] OpenTelemetry shut down');
  }
}

/**
 * Get the current tracer
 */
export function getTracer() {
  return trace.getTracer(SERVICE_NAME, SERVICE_VERSION);
}

/**
 * Create a custom span for tracking specific operations
 */
export function createSpan(name: string, fn: (span: Span) => Promise<void> | void): Promise<void> {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, async (span) => {
    try {
      await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Add attributes to the current span
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    currentSpan.setAttributes(attributes);
  }
}

/**
 * Add an event to the current span
 */
export function addSpanEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    currentSpan.addEvent(name, attributes);
  }
}

/**
 * Record an error on the current span
 */
export function recordSpanError(error: Error): void {
  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    currentSpan.recordException(error);
    currentSpan.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  }
}

/**
 * Get trace context for propagation
 */
export function getTraceContext(): { traceId: string; spanId: string } | null {
  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    const spanContext = currentSpan.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
    };
  }
  return null;
}
