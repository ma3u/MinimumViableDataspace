/**
 * DSP Event Service
 * 
 * Centralized logging and streaming service for DSP protocol events.
 * Supports SSE (Server-Sent Events) for real-time updates to the frontend.
 */

import { EventEmitter } from 'events';
import { 
  sseActiveConnections, 
  sseTotalConnections, 
  dspEventsEmitted 
} from '../middleware/ehds-metrics.js';

// Event types matching frontend DspEvent interface
// Note: 'seeding' is a pre-protocol phase for initialization
export type DspPhase = 'seeding' | 'catalog' | 'negotiation' | 'transfer' | 'compute';
export type DspDirection = 'outbound' | 'inbound' | 'internal';
export type DspStatus = 'pending' | 'in-progress' | 'success' | 'error';

export interface DspEvent {
  id: string;
  timestamp: Date;
  phase: DspPhase;
  action: string;
  direction: DspDirection;
  status: DspStatus;
  actor?: string;
  target?: string;
  details?: Record<string, unknown>;
  dspMessageType?: string;
  errorMessage?: string;
  source?: 'mock' | 'edc' | 'sse'; // Source of the event
}

// SSE Connection tracking
interface SseConnection {
  id: string;
  connectedAt: Date;
  clientInfo?: string;
}

const sseConnections: Map<string, SseConnection> = new Map();
let connectionCounter = 0;

// Event store with max capacity
const MAX_EVENTS = 500;
const eventStore: DspEvent[] = [];

// Event emitter for SSE broadcasting
class DspEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Allow many SSE connections
  }
}

const eventEmitter = new DspEventEmitter();

/**
 * Generate unique event ID
 */
function generateId(): string {
  return `dsp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Emit a new DSP event
 */
export function emitDspEvent(
  event: Omit<DspEvent, 'id' | 'timestamp'>
): DspEvent {
  const fullEvent: DspEvent = {
    ...event,
    id: generateId(),
    timestamp: new Date()
  };

  // Add to store (FIFO if at capacity)
  eventStore.push(fullEvent);
  if (eventStore.length > MAX_EVENTS) {
    eventStore.shift();
  }

  // Broadcast to all SSE listeners
  eventEmitter.emit('dsp-event', fullEvent);
  
  // Update Prometheus metrics
  dspEventsEmitted.inc({ 
    phase: fullEvent.phase, 
    action: fullEvent.action.replace(/\s+/g, '_').toLowerCase(),
    status: fullEvent.status 
  });

  // Log for debugging
  console.log(`[DSP] ${fullEvent.phase}/${fullEvent.action} (${fullEvent.direction}) - ${fullEvent.status}`);

  return fullEvent;
}

/**
 * Get all stored events
 */
export function getStoredEvents(): DspEvent[] {
  return [...eventStore];
}

/**
 * Get events filtered by phase
 */
export function getEventsByPhase(phase: DspPhase): DspEvent[] {
  return eventStore.filter(e => e.phase === phase);
}

/**
 * Clear all stored events
 */
export function clearEvents(): void {
  eventStore.length = 0;
}

/**
 * Subscribe to DSP events (for SSE)
 */
export function subscribeToDspEvents(
  listener: (event: DspEvent) => void
): () => void {
  eventEmitter.on('dsp-event', listener);
  return () => eventEmitter.off('dsp-event', listener);
}

/**
 * Get event emitter for direct access
 */
export function getEventEmitter(): DspEventEmitter {
  return eventEmitter;
}

// ============================================================================
// SSE CONNECTION TRACKING
// ============================================================================

/**
 * Register a new SSE connection
 */
export function registerSseConnection(clientInfo?: string): string {
  connectionCounter++;
  const connectionId = `sse-${connectionCounter}-${Date.now()}`;
  sseConnections.set(connectionId, {
    id: connectionId,
    connectedAt: new Date(),
    clientInfo
  });
  
  // Update Prometheus metrics
  sseActiveConnections.inc();
  sseTotalConnections.inc();
  
  console.log(`[SSE] Connection registered: ${connectionId} (total: ${sseConnections.size})`);
  return connectionId;
}

/**
 * Unregister an SSE connection
 */
export function unregisterSseConnection(connectionId: string): void {
  if (sseConnections.delete(connectionId)) {
    // Update Prometheus metrics
    sseActiveConnections.dec();
    
    console.log(`[SSE] Connection unregistered: ${connectionId} (total: ${sseConnections.size})`);
  }
}

/**
 * Get current SSE connection count
 */
export function getSseConnectionCount(): number {
  return sseConnections.size;
}

/**
 * Get all SSE connections info
 */
export function getSseConnections(): SseConnection[] {
  return Array.from(sseConnections.values());
}

/**
 * Get SSE connection stats
 */
export function getSseConnectionStats(): {
  activeConnections: number;
  totalConnectionsEver: number;
  connections: Array<{ id: string; connectedAt: string; durationSeconds: number; clientInfo?: string }>;
} {
  const now = new Date();
  return {
    activeConnections: sseConnections.size,
    totalConnectionsEver: connectionCounter,
    connections: Array.from(sseConnections.values()).map(conn => ({
      id: conn.id,
      connectedAt: conn.connectedAt.toISOString(),
      durationSeconds: Math.floor((now.getTime() - conn.connectedAt.getTime()) / 1000),
      clientInfo: conn.clientInfo
    }))
  };
}

// ============================================================================
// DSP PROTOCOL HELPERS
// ============================================================================

/**
 * Emit catalog request event
 */
export function emitCatalogRequest(details?: Record<string, unknown>): DspEvent {
  return emitDspEvent({
    phase: 'catalog',
    action: 'Catalog Request',
    direction: 'outbound',
    status: 'in-progress',
    dspMessageType: 'CatalogRequestMessage',
    actor: 'Consumer',
    target: 'Provider',
    details
  });
}

/**
 * Emit catalog response event
 */
export function emitCatalogResponse(success: boolean, details?: Record<string, unknown>): DspEvent {
  return emitDspEvent({
    phase: 'catalog',
    action: 'Catalog Response',
    direction: 'inbound',
    status: success ? 'success' : 'error',
    dspMessageType: 'CatalogResponse',
    actor: 'Provider',
    target: 'Consumer',
    details
  });
}

/**
 * Emit contract negotiation event
 */
export function emitNegotiationEvent(
  action: string,
  direction: DspDirection,
  status: DspStatus,
  dspMessageType?: string,
  details?: Record<string, unknown>
): DspEvent {
  return emitDspEvent({
    phase: 'negotiation',
    action,
    direction,
    status,
    dspMessageType,
    actor: direction === 'outbound' ? 'Consumer' : 'Provider',
    target: direction === 'outbound' ? 'Provider' : 'Consumer',
    details
  });
}

/**
 * Emit transfer event
 */
export function emitTransferEvent(
  action: string,
  direction: DspDirection,
  status: DspStatus,
  dspMessageType?: string,
  details?: Record<string, unknown>
): DspEvent {
  return emitDspEvent({
    phase: 'transfer',
    action,
    direction,
    status,
    dspMessageType,
    actor: direction === 'outbound' ? 'Consumer' : direction === 'internal' ? 'Provider (Internal)' : 'Provider',
    target: direction === 'outbound' ? 'Provider' : direction === 'internal' ? undefined : 'Consumer',
    details
  });
}

/**
 * Emit confidential compute event
 */
export function emitComputeEvent(
  action: string,
  direction: DspDirection,
  status: DspStatus,
  details?: Record<string, unknown>
): DspEvent {
  return emitDspEvent({
    phase: 'compute',
    action,
    direction,
    status,
    actor: direction === 'internal' ? 'Enclave' : direction === 'outbound' ? 'Consumer' : 'Provider',
    details
  });
}
