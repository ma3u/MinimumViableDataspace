/**
 * Events Router
 * 
 * SSE (Server-Sent Events) endpoint for real-time DSP event streaming.
 * Also provides REST endpoints for event history and management.
 * Includes EDC callback endpoint for receiving native EDC events.
 */

import { Router, Request, Response } from 'express';
import { 
  getStoredEvents, 
  clearEvents, 
  subscribeToDspEvents,
  emitDspEvent,
  type DspEvent,
  type DspPhase,
  type DspDirection,
  type DspStatus
} from '../services/dspEventService.js';

export const eventsRouter = Router();

// ============================================================================
// EDC EVENT TYPES & MAPPING
// ============================================================================

/**
 * EDC EventEnvelope structure (from EDC Connector)
 * @see https://github.com/eclipse-edc/Connector/blob/main/spi/common/core-spi/src/main/java/org/eclipse/edc/spi/event/EventEnvelope.java
 */
interface EdcEventEnvelope {
  id: string;
  at: number; // Epoch milliseconds
  payload: EdcEventPayload;
}

interface EdcEventPayload {
  // Common fields
  '@type'?: string;
  type?: string;
  
  // Contract Negotiation events
  contractNegotiationId?: string;
  counterPartyAddress?: string;
  counterPartyId?: string;
  protocol?: string;
  
  // Transfer Process events
  transferProcessId?: string;
  dataFlowType?: string;
  
  // Asset events
  assetId?: string;
  
  // Additional context
  [key: string]: unknown;
}

/**
 * Map EDC event type to frontend phase and action
 */
function mapEdcEventType(eventType: string): { phase: DspPhase; action: string; direction: DspDirection } | null {
  const mappings: Record<string, { phase: DspPhase; action: string; direction: DspDirection }> = {
    // Contract Negotiation Events
    'contract.negotiation.initiated': { phase: 'negotiation', action: 'Negotiation Initiated', direction: 'outbound' },
    'contract.negotiation.requested': { phase: 'negotiation', action: 'Offer Requested', direction: 'inbound' },
    'contract.negotiation.offered': { phase: 'negotiation', action: 'Offer Received', direction: 'inbound' },
    'contract.negotiation.accepted': { phase: 'negotiation', action: 'Offer Accepted', direction: 'inbound' },
    'contract.negotiation.agreed': { phase: 'negotiation', action: 'Agreement Sent', direction: 'outbound' },
    'contract.negotiation.verified': { phase: 'negotiation', action: 'Verification Complete', direction: 'outbound' },
    'contract.negotiation.finalized': { phase: 'negotiation', action: 'Finalized', direction: 'inbound' },
    'contract.negotiation.terminated': { phase: 'negotiation', action: 'Terminated', direction: 'internal' },
    
    // Transfer Process Events
    'transfer.process.initiated': { phase: 'transfer', action: 'Transfer Initiated', direction: 'outbound' },
    'transfer.process.provisioning.requested': { phase: 'transfer', action: 'Provisioning Requested', direction: 'outbound' },
    'transfer.process.provisioned': { phase: 'transfer', action: 'Resources Provisioned', direction: 'inbound' },
    'transfer.process.requested': { phase: 'transfer', action: 'Transfer Requested', direction: 'outbound' },
    'transfer.process.started': { phase: 'transfer', action: 'Transfer Started', direction: 'inbound' },
    'transfer.process.completed': { phase: 'transfer', action: 'Transfer Completed', direction: 'inbound' },
    'transfer.process.deprovisioning.requested': { phase: 'transfer', action: 'Deprovisioning Requested', direction: 'outbound' },
    'transfer.process.deprovisioned': { phase: 'transfer', action: 'Resources Deprovisioned', direction: 'inbound' },
    'transfer.process.terminated': { phase: 'transfer', action: 'Transfer Terminated', direction: 'internal' },
    
    // Asset Events (for catalog phase)
    'asset.created': { phase: 'catalog', action: 'Asset Created', direction: 'internal' },
    'asset.deleted': { phase: 'catalog', action: 'Asset Deleted', direction: 'internal' },
    'asset.updated': { phase: 'catalog', action: 'Asset Updated', direction: 'internal' },
    
    // Policy Events
    'policy.created': { phase: 'catalog', action: 'Policy Created', direction: 'internal' },
    'policy.deleted': { phase: 'catalog', action: 'Policy Deleted', direction: 'internal' },
    
    // Contract Definition Events
    'contract.definition.created': { phase: 'catalog', action: 'Contract Definition Created', direction: 'internal' },
    'contract.definition.deleted': { phase: 'catalog', action: 'Contract Definition Deleted', direction: 'internal' },
    
    // Seeding Events (initialization phase)
    'seeding.started': { phase: 'seeding', action: 'Seeding Started', direction: 'internal' },
    'seeding.identity.consumer': { phase: 'seeding', action: 'Consumer Identity Created', direction: 'internal' },
    'seeding.identity.provider': { phase: 'seeding', action: 'Provider Identity Created', direction: 'internal' },
    'seeding.identity.issuer': { phase: 'seeding', action: 'Issuer Identity Created', direction: 'internal' },
    'seeding.vault.secret': { phase: 'seeding', action: 'Secret Stored in Vault', direction: 'internal' },
    'seeding.credential.issued': { phase: 'seeding', action: 'Credential Issued', direction: 'internal' },
    'seeding.policy.created': { phase: 'seeding', action: 'ODRL Policy Created', direction: 'internal' },
    'seeding.asset.created': { phase: 'seeding', action: 'EHR Asset Created', direction: 'internal' },
    'seeding.contract.created': { phase: 'seeding', action: 'Contract Definition Created', direction: 'internal' },
    'seeding.completed': { phase: 'seeding', action: 'Seeding Completed', direction: 'internal' },
  };
  
  return mappings[eventType] || null;
}

/**
 * Determine status based on event type
 */
function determineStatus(eventType: string): DspStatus {
  if (eventType.includes('terminated') || eventType.includes('deleted')) {
    return 'error';
  }
  if (eventType.includes('completed') || eventType.includes('finalized') || eventType.includes('created')) {
    return 'success';
  }
  if (eventType.includes('initiated') || eventType.includes('requested')) {
    return 'pending';
  }
  return 'in-progress';
}

/**
 * Extract DSP message type from EDC event
 */
function getDspMessageType(eventType: string): string | undefined {
  const dspMessages: Record<string, string> = {
    'contract.negotiation.initiated': 'ContractRequestMessage',
    'contract.negotiation.offered': 'ContractOfferMessage',
    'contract.negotiation.agreed': 'ContractAgreementMessage',
    'contract.negotiation.verified': 'ContractAgreementVerificationMessage',
    'contract.negotiation.finalized': 'ContractNegotiationEventMessage',
    'contract.negotiation.terminated': 'ContractNegotiationTerminationMessage',
    'transfer.process.initiated': 'TransferRequestMessage',
    'transfer.process.started': 'TransferStartMessage',
    'transfer.process.completed': 'TransferCompletionMessage',
    'transfer.process.terminated': 'TransferTerminationMessage',
  };
  
  return dspMessages[eventType];
}

/**
 * GET /stream
 * 
 * SSE endpoint for real-time event streaming.
 * Clients connect and receive events as they occur.
 */
eventsRouter.get('/stream', (req: Request, res: Response) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  
  // CORS headers for SSE
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  console.log('[SSE] Client connected for event stream');

  // Send initial connection event
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ message: 'Connected to DSP event stream' })}\n\n`);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(`event: heartbeat\n`);
    res.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
  }, 30000);

  // Subscribe to DSP events
  const unsubscribe = subscribeToDspEvents((event: DspEvent) => {
    const eventData = {
      type: 'dsp-event',
      ...event,
      timestamp: event.timestamp.toISOString()
    };
    res.write(`event: message\n`);
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  });

  // Cleanup on client disconnect
  req.on('close', () => {
    console.log('[SSE] Client disconnected from event stream');
    clearInterval(heartbeatInterval);
    unsubscribe();
  });
});

/**
 * GET /
 * 
 * Get all stored events (paginated).
 */
eventsRouter.get('/', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const offset = parseInt(req.query.offset as string) || 0;
  const phase = req.query.phase as string | undefined;

  let events = getStoredEvents();

  // Filter by phase if specified
  if (phase && ['catalog', 'negotiation', 'transfer', 'compute'].includes(phase)) {
    events = events.filter(e => e.phase === phase);
  }

  // Apply pagination
  const total = events.length;
  const paginatedEvents = events.slice(offset, offset + limit);

  res.json({
    events: paginatedEvents,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  });
});

/**
 * DELETE /
 * 
 * Clear all stored events.
 */
eventsRouter.delete('/', (_req: Request, res: Response) => {
  clearEvents();
  res.json({ message: 'All events cleared' });
});

/**
 * GET /stats
 * 
 * Get event statistics.
 */
eventsRouter.get('/stats', (_req: Request, res: Response) => {
  const events = getStoredEvents();
  
  const stats = {
    total: events.length,
    byPhase: {
      catalog: events.filter(e => e.phase === 'catalog').length,
      negotiation: events.filter(e => e.phase === 'negotiation').length,
      transfer: events.filter(e => e.phase === 'transfer').length,
      compute: events.filter(e => e.phase === 'compute').length
    },
    byStatus: {
      pending: events.filter(e => e.status === 'pending').length,
      'in-progress': events.filter(e => e.status === 'in-progress').length,
      success: events.filter(e => e.status === 'success').length,
      error: events.filter(e => e.status === 'error').length
    },
    lastEventAt: events.length > 0 
      ? events[events.length - 1].timestamp.toISOString() 
      : null
  };

  res.json(stats);
});

// ============================================================================
// EDC CALLBACK ENDPOINT
// ============================================================================

/**
 * POST /callback
 * 
 * Webhook endpoint for receiving EDC events via the callback-http-dispatcher extension.
 * EDC sends EventEnvelope payloads when configured with:
 *   edc.callback.<name>.uri=http://backend-edc:3002/api/events/callback
 *   edc.callback.<name>.events=contract.negotiation,transfer.process
 * 
 * @see https://github.com/eclipse-edc/Connector/tree/main/extensions/control-plane/callback/callback-static-endpoint
 */
eventsRouter.post('/callback', (req: Request, res: Response) => {
  try {
    const envelope = req.body as EdcEventEnvelope;
    
    console.log('[EDC Callback] Received event:', JSON.stringify(envelope, null, 2));
    
    // Extract event type from payload
    const eventType = envelope.payload?.type || envelope.payload?.['@type'] || 'unknown';
    const normalizedType = eventType
      .replace(/([A-Z])/g, '.$1')
      .toLowerCase()
      .replace(/^\./, '')
      .replace(/\.event$/, '');
    
    // Map EDC event to our format
    const mapping = mapEdcEventType(normalizedType);
    
    if (!mapping) {
      console.log(`[EDC Callback] Unknown event type: ${eventType} (normalized: ${normalizedType})`);
      // Still store as internal event for debugging
      emitDspEvent({
        phase: 'catalog',
        action: `Unknown: ${eventType}`,
        direction: 'internal',
        status: 'in-progress',
        details: {
          source: 'edc-callback',
          originalType: eventType,
          payload: envelope.payload
        }
      });
      return res.status(200).json({ received: true, mapped: false });
    }
    
    // Determine actor based on event payload
    let actor = 'EDC';
    let target = 'EDC';
    
    if (envelope.payload.counterPartyId) {
      if (mapping.direction === 'outbound') {
        actor = 'Consumer';
        target = envelope.payload.counterPartyId;
      } else {
        actor = envelope.payload.counterPartyId;
        target = 'Consumer';
      }
    }
    
    // Build details object
    const details: Record<string, unknown> = {
      source: 'edc-callback',
      edcEventId: envelope.id,
      originalType: eventType
    };
    
    // Add relevant fields from payload
    if (envelope.payload.contractNegotiationId) {
      details.contractNegotiationId = envelope.payload.contractNegotiationId;
    }
    if (envelope.payload.transferProcessId) {
      details.transferProcessId = envelope.payload.transferProcessId;
    }
    if (envelope.payload.counterPartyAddress) {
      details.counterPartyAddress = envelope.payload.counterPartyAddress;
    }
    if (envelope.payload.protocol) {
      details.protocol = envelope.payload.protocol;
    }
    if (envelope.payload.assetId) {
      details.assetId = envelope.payload.assetId;
    }
    
    // Emit the mapped event
    const dspEvent = emitDspEvent({
      phase: mapping.phase,
      action: mapping.action,
      direction: mapping.direction,
      status: determineStatus(normalizedType),
      actor,
      target,
      dspMessageType: getDspMessageType(normalizedType),
      details,
      source: 'edc' // Mark as EDC callback event
    });
    
    console.log(`[EDC Callback] Mapped to DSP event: ${dspEvent.phase}/${dspEvent.action}`);
    
    res.status(200).json({ 
      received: true, 
      mapped: true,
      eventId: dspEvent.id 
    });
    
  } catch (error) {
    console.error('[EDC Callback] Error processing event:', error);
    res.status(500).json({ 
      error: 'Failed to process EDC callback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /callback/test
 * 
 * Test endpoint to simulate EDC callback for development/debugging.
 */
eventsRouter.get('/callback/test', (_req: Request, res: Response) => {
  // Simulate a contract negotiation initiated event
  const testEnvelope: EdcEventEnvelope = {
    id: 'test-' + Date.now(),
    at: Date.now(),
    payload: {
      type: 'ContractNegotiationInitiated',
      contractNegotiationId: 'test-negotiation-' + Date.now(),
      counterPartyAddress: 'http://provider:8191/api/dsp',
      counterPartyId: 'provider',
      protocol: 'dataspace-protocol-http'
    }
  };
  
  // Process as if it came from EDC
  const normalizedType = 'contract.negotiation.initiated';
  const mapping = mapEdcEventType(normalizedType);
  
  if (mapping) {
    const dspEvent = emitDspEvent({
      phase: mapping.phase,
      action: mapping.action,
      direction: mapping.direction,
      status: 'in-progress',
      actor: 'Consumer',
      target: 'provider',
      dspMessageType: getDspMessageType(normalizedType),
      details: {
        source: 'edc-callback-test',
        edcEventId: testEnvelope.id,
        ...testEnvelope.payload
      }
    });
    
    res.json({
      message: 'Test event emitted successfully',
      event: dspEvent
    });
  } else {
    res.status(500).json({ error: 'Failed to map test event' });
  }
});

/**
 * POST /seeding
 * 
 * Endpoint for the seeding script to emit events during initialization.
 * This allows the Dataspace Insider Panel to show seeding progress.
 * 
 * @body {
 *   eventType: string - One of the seeding event types (e.g., 'seeding.started')
 *   actor?: string - Who is performing the action (default: 'Seed Script')
 *   target?: string - The target of the action
 *   details?: object - Additional details about the seeding step
 * }
 */
eventsRouter.post('/seeding', (req: Request, res: Response) => {
  try {
    const { eventType, actor = 'Seed Script', target, details = {} } = req.body;
    
    if (!eventType) {
      return res.status(400).json({ error: 'eventType is required' });
    }
    
    const mapping = mapEdcEventType(eventType);
    
    if (!mapping) {
      return res.status(400).json({ 
        error: 'Unknown seeding event type',
        eventType,
        validTypes: [
          'seeding.started',
          'seeding.identity.consumer',
          'seeding.identity.provider',
          'seeding.identity.issuer',
          'seeding.vault.secret',
          'seeding.credential.issued',
          'seeding.policy.created',
          'seeding.asset.created',
          'seeding.contract.created',
          'seeding.completed'
        ]
      });
    }
    
    const dspEvent = emitDspEvent({
      phase: mapping.phase,
      action: mapping.action,
      direction: mapping.direction,
      status: eventType === 'seeding.completed' ? 'success' : 'in-progress',
      actor,
      target: target || undefined,
      dspMessageType: eventType,
      details: {
        source: 'seed-script',
        ...details
      }
    });
    
    res.json({
      message: 'Seeding event emitted successfully',
      event: dspEvent
    });
  } catch (error) {
    console.error('Error processing seeding event:', error);
    res.status(500).json({
      error: 'Failed to emit seeding event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /seeding/status
 * 
 * Get the current seeding status based on events.
 */
eventsRouter.get('/seeding/status', (_req: Request, res: Response) => {
  const allEvents = getStoredEvents();
  const seedingEvents = allEvents.filter((e: DspEvent) => e.phase === 'seeding');
  
  const hasStarted = seedingEvents.some((e: DspEvent) => e.dspMessageType === 'seeding.started');
  const hasCompleted = seedingEvents.some((e: DspEvent) => e.dspMessageType === 'seeding.completed');
  
  const stats = {
    identities: seedingEvents.filter((e: DspEvent) => e.dspMessageType?.startsWith('seeding.identity')).length,
    vaultSecrets: seedingEvents.filter((e: DspEvent) => e.dspMessageType === 'seeding.vault.secret').length,
    credentials: seedingEvents.filter((e: DspEvent) => e.dspMessageType === 'seeding.credential.issued').length,
    policies: seedingEvents.filter((e: DspEvent) => e.dspMessageType === 'seeding.policy.created').length,
    assets: seedingEvents.filter((e: DspEvent) => e.dspMessageType === 'seeding.asset.created').length,
    contracts: seedingEvents.filter((e: DspEvent) => e.dspMessageType === 'seeding.contract.created').length
  };
  
  res.json({
    status: hasCompleted ? 'completed' : (hasStarted ? 'in-progress' : 'not-started'),
    totalEvents: seedingEvents.length,
    stats,
    events: seedingEvents
  });
});
