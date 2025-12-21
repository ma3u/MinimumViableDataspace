/**
 * Participants Routes
 * 
 * Provides endpoints to fetch participant information from Identity Hub.
 * Falls back to static configuration when Identity Hub is unavailable.
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config.js';

export const participantsRouter = Router();

// ============================================================
// Type Definitions
// ============================================================

interface Participant {
  did: string;
  name: string;
  type: 'consumer' | 'provider';
  region: string;
  verified: boolean;
  roles: string[];
  membershipCredential?: {
    issuedAt: string;
    expiresAt?: string;
    issuer: string;
  };
}

interface ParticipantsResponse {
  consumer: Participant;
  provider: Participant;
  source: 'identity-hub' | 'static-config';
}

// ============================================================
// Static Fallback Data
// ============================================================

const STATIC_PARTICIPANTS: ParticipantsResponse = {
  consumer: {
    did: config.consumer.participantId,
    name: 'Nordstein Research Institute',
    type: 'consumer',
    region: 'DE-NW',
    verified: true,
    roles: ['data-consumer', 'research-organization'],
    membershipCredential: {
      issuedAt: '2025-01-01T00:00:00Z',
      issuer: 'did:web:issuer-service%3A10100',
    },
  },
  provider: {
    did: config.provider.participantId,
    name: 'Rheinland Universitätsklinikum',
    type: 'provider',
    region: 'DE-NW',
    verified: true,
    roles: ['data-provider', 'healthcare-provider'],
    membershipCredential: {
      issuedAt: '2025-01-01T00:00:00Z',
      issuer: 'did:web:issuer-service%3A10100',
    },
  },
  source: 'static-config',
};

// Cache for Identity Hub responses
let participantCache: ParticipantsResponse | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL_MS = 60000; // 1 minute

// ============================================================
// Helper Functions
// ============================================================

/**
 * Fetch participant from Identity Hub
 */
async function fetchParticipantFromIH(
  identityHubUrl: string,
  participantId: string
): Promise<Partial<Participant> | null> {
  try {
    // Try to resolve the participant via Identity Hub API
    const response = await axios.get(
      `${identityHubUrl}/api/identity/v1alpha/participants/${encodeURIComponent(participantId)}`,
      {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    const data = response.data;
    return {
      did: data.participantId || participantId,
      name: data.displayName || data.participantId,
      verified: data.state === 'ACTIVE' || data.verified === true,
      roles: data.roles || [],
      membershipCredential: data.membershipCredential,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.debug(`[Participants] Identity Hub unavailable for ${participantId}: ${error.message}`);
    }
    return null;
  }
}

/**
 * Fetch all participants from Identity Hubs
 */
async function fetchParticipants(): Promise<ParticipantsResponse> {
  // Check cache
  if (participantCache && Date.now() < cacheExpiry) {
    return participantCache;
  }
  
  // Try to fetch from Identity Hubs in parallel
  const [consumerData, providerData] = await Promise.all([
    fetchParticipantFromIH(config.consumer.identityHubUrl, config.consumer.participantId),
    fetchParticipantFromIH(config.provider.identityHubUrl, config.provider.participantId),
  ]);
  
  // If both are available, use Identity Hub data
  if (consumerData && providerData) {
    const result: ParticipantsResponse = {
      consumer: {
        ...STATIC_PARTICIPANTS.consumer,
        ...consumerData,
      } as Participant,
      provider: {
        ...STATIC_PARTICIPANTS.provider,
        ...providerData,
      } as Participant,
      source: 'identity-hub',
    };
    
    participantCache = result;
    cacheExpiry = Date.now() + CACHE_TTL_MS;
    return result;
  }
  
  // Fall back to static config
  return STATIC_PARTICIPANTS;
}

// ============================================================
// Routes
// ============================================================

/**
 * GET /api/participants
 * Get both consumer and provider participant info
 */
participantsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const participants = await fetchParticipants();
    res.json(participants);
  } catch (error) {
    console.error('[Participants] Error fetching participants:', error);
    // Return static data as fallback
    res.json(STATIC_PARTICIPANTS);
  }
});

/**
 * GET /api/participants/consumer
 * Get consumer participant info
 */
participantsRouter.get('/consumer', async (_req: Request, res: Response) => {
  try {
    const participants = await fetchParticipants();
    res.json({
      ...participants.consumer,
      source: participants.source,
    });
  } catch (error) {
    res.json({
      ...STATIC_PARTICIPANTS.consumer,
      source: 'static-config',
    });
  }
});

/**
 * GET /api/participants/provider
 * Get provider participant info
 */
participantsRouter.get('/provider', async (_req: Request, res: Response) => {
  try {
    const participants = await fetchParticipants();
    res.json({
      ...participants.provider,
      source: participants.source,
    });
  } catch (error) {
    res.json({
      ...STATIC_PARTICIPANTS.provider,
      source: 'static-config',
    });
  }
});

/**
 * GET /api/participants/:did
 * Get participant by DID
 */
participantsRouter.get('/:did', async (req: Request, res: Response) => {
  const requestedDid = decodeURIComponent(req.params.did);
  
  try {
    const participants = await fetchParticipants();
    
    if (participants.consumer.did === requestedDid) {
      res.json({
        ...participants.consumer,
        source: participants.source,
      });
    } else if (participants.provider.did === requestedDid) {
      res.json({
        ...participants.provider,
        source: participants.source,
      });
    } else {
      res.status(404).json({
        error: 'Participant not found',
        did: requestedDid,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch participant',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/participants/cache/clear
 * Clear the participant cache (useful for testing)
 */
participantsRouter.post('/cache/clear', (_req: Request, res: Response) => {
  participantCache = null;
  cacheExpiry = 0;
  res.json({ message: 'Participant cache cleared' });
});
