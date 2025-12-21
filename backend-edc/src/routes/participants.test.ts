/**
 * Participants Route Tests
 * 
 * Comprehensive test suite for Phase 9: Participant Identity Integration
 * Tests Identity Hub queries, caching, and static fallback.
 * 
 * @see participants.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import axios from 'axios';

// Mock axios before importing the router
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Mock config
vi.mock('../config.js', () => ({
  config: {
    consumer: {
      participantId: 'did:web:consumer.local',
      identityHubUrl: 'http://localhost:7082',
      managementUrl: 'http://localhost:8081',
    },
    provider: {
      participantId: 'did:web:provider.local',
      identityHubUrl: 'http://localhost:7092',
      dspUrl: 'http://localhost:8192/api/dsp',
    },
    backendMock: {
      url: 'http://localhost:4001',
    },
  },
}));

// Import router after mocks
import { participantsRouter } from './participants.js';

// ============================================================
// Test Setup
// ============================================================

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/participants', participantsRouter);
});

beforeEach(() => {
  vi.clearAllMocks();
  // Clear cache before each test
  // We'll use the cache clear endpoint
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================
// Test Data Fixtures
// ============================================================

const IDENTITY_HUB_CONSUMER_RESPONSE = {
  participantId: 'did:web:consumer.local',
  displayName: 'Nordstein Research Institute (from IH)',
  state: 'ACTIVE',
  verified: true,
  roles: ['data-consumer', 'research-organization'],
  membershipCredential: {
    issuedAt: '2025-06-01T00:00:00Z',
    expiresAt: '2026-06-01T00:00:00Z',
    issuer: 'did:web:dataspace-authority.eu',
  },
};

const IDENTITY_HUB_PROVIDER_RESPONSE = {
  participantId: 'did:web:provider.local',
  displayName: 'Rheinland Universitätsklinikum (from IH)',
  state: 'ACTIVE',
  verified: true,
  roles: ['data-provider', 'healthcare-provider', 'clinical-trial-site'],
  membershipCredential: {
    issuedAt: '2025-06-01T00:00:00Z',
    issuer: 'did:web:dataspace-authority.eu',
  },
};

// ============================================================
// GET /api/participants Tests
// ============================================================

describe('GET /api/participants', () => {
  describe('Identity Hub Available', () => {
    beforeEach(async () => {
      // Clear cache first
      await request(app).post('/api/participants/cache/clear');
    });

    it('should return participants from Identity Hub when available', async () => {
      // Mock both Identity Hub responses
      mockedAxios.get
        .mockResolvedValueOnce({ data: IDENTITY_HUB_CONSUMER_RESPONSE })
        .mockResolvedValueOnce({ data: IDENTITY_HUB_PROVIDER_RESPONSE });

      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      expect(response.body).toHaveProperty('consumer');
      expect(response.body).toHaveProperty('provider');
      expect(response.body.source).toBe('identity-hub');
    });

    it('should merge static data with Identity Hub data', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: IDENTITY_HUB_CONSUMER_RESPONSE })
        .mockResolvedValueOnce({ data: IDENTITY_HUB_PROVIDER_RESPONSE });

      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      // Should have data from both sources
      const consumer = response.body.consumer;
      expect(consumer.did).toBe('did:web:consumer.local');
      expect(consumer.type).toBe('consumer'); // From static
      expect(consumer.region).toBe('DE-NW'); // From static
    });

    it('should return provider roles from Identity Hub', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: IDENTITY_HUB_CONSUMER_RESPONSE })
        .mockResolvedValueOnce({ data: IDENTITY_HUB_PROVIDER_RESPONSE });

      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      expect(response.body.provider.roles).toContain('clinical-trial-site');
    });
  });

  describe('Identity Hub Unavailable', () => {
    beforeEach(async () => {
      await request(app).post('/api/participants/cache/clear');
    });

    it('should fall back to static config when Identity Hub fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      expect(response.body.source).toBe('static-config');
      expect(response.body.consumer.name).toBe('Nordstein Research Institute');
      expect(response.body.provider.name).toBe('Rheinland Universitätsklinikum');
    });

    it('should return static data when Identity Hub returns 404', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404 },
        isAxiosError: true,
      });

      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      expect(response.body.source).toBe('static-config');
    });

    it('should return static data when Identity Hub times out', async () => {
      mockedAxios.get.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      });

      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      expect(response.body.source).toBe('static-config');
    });
  });

  describe('Partial Identity Hub Availability', () => {
    beforeEach(async () => {
      await request(app).post('/api/participants/cache/clear');
    });

    it('should fall back to static when only consumer IH available', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: IDENTITY_HUB_CONSUMER_RESPONSE })
        .mockRejectedValueOnce(new Error('Provider IH unavailable'));

      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      // Should fall back to static when not both are available
      expect(response.body.source).toBe('static-config');
    });

    it('should fall back to static when only provider IH available', async () => {
      mockedAxios.get
        .mockRejectedValueOnce(new Error('Consumer IH unavailable'))
        .mockResolvedValueOnce({ data: IDENTITY_HUB_PROVIDER_RESPONSE });

      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      expect(response.body.source).toBe('static-config');
    });
  });
});

// ============================================================
// GET /api/participants/consumer Tests
// ============================================================

describe('GET /api/participants/consumer', () => {
  beforeEach(async () => {
    await request(app).post('/api/participants/cache/clear');
  });

  it('should return consumer participant info', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/consumer')
      .expect(200);

    expect(response.body.did).toBe('did:web:consumer.local');
    expect(response.body.type).toBe('consumer');
    expect(response.body.name).toBe('Nordstein Research Institute');
    expect(response.body.region).toBe('DE-NW');
  });

  it('should include source field', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/consumer')
      .expect(200);

    expect(response.body.source).toBe('static-config');
  });

  it('should return verified status', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/consumer')
      .expect(200);

    expect(response.body.verified).toBe(true);
  });

  it('should return roles array', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/consumer')
      .expect(200);

    expect(Array.isArray(response.body.roles)).toBe(true);
    expect(response.body.roles).toContain('data-consumer');
  });
});

// ============================================================
// GET /api/participants/provider Tests
// ============================================================

describe('GET /api/participants/provider', () => {
  beforeEach(async () => {
    await request(app).post('/api/participants/cache/clear');
  });

  it('should return provider participant info', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/provider')
      .expect(200);

    expect(response.body.did).toBe('did:web:provider.local');
    expect(response.body.type).toBe('provider');
    expect(response.body.name).toBe('Rheinland Universitätsklinikum');
  });

  it('should include membership credential info', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/provider')
      .expect(200);

    expect(response.body.membershipCredential).toBeDefined();
    expect(response.body.membershipCredential.issuer).toContain('issuer-service');
  });

  it('should return healthcare-provider role', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/provider')
      .expect(200);

    expect(response.body.roles).toContain('healthcare-provider');
  });
});

// ============================================================
// GET /api/participants/:did Tests
// ============================================================

describe('GET /api/participants/:did', () => {
  beforeEach(async () => {
    await request(app).post('/api/participants/cache/clear');
  });

  it('should return consumer by DID', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/did:web:consumer.local')
      .expect(200);

    expect(response.body.did).toBe('did:web:consumer.local');
    expect(response.body.type).toBe('consumer');
  });

  it('should return provider by DID', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/did:web:provider.local')
      .expect(200);

    expect(response.body.did).toBe('did:web:provider.local');
    expect(response.body.type).toBe('provider');
  });

  it('should handle URL-encoded DIDs', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const encodedDid = encodeURIComponent('did:web:consumer.local');
    const response = await request(app)
      .get(`/api/participants/${encodedDid}`)
      .expect(200);

    expect(response.body.did).toBe('did:web:consumer.local');
  });

  it('should return 404 for unknown DID', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/did:web:unknown.example.com')
      .expect(404);

    expect(response.body.error).toBe('Participant not found');
    expect(response.body.did).toBe('did:web:unknown.example.com');
  });

  it('should include source in response', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    const response = await request(app)
      .get('/api/participants/did:web:consumer.local')
      .expect(200);

    expect(response.body.source).toBe('static-config');
  });
});

// ============================================================
// POST /api/participants/cache/clear Tests
// ============================================================

describe('POST /api/participants/cache/clear', () => {
  it('should clear the cache and return success message', async () => {
    const response = await request(app)
      .post('/api/participants/cache/clear')
      .expect(200);

    expect(response.body.message).toBe('Participant cache cleared');
  });

  it('should force fresh fetch after cache clear', async () => {
    // First request caches the result
    mockedAxios.get
      .mockResolvedValueOnce({ data: IDENTITY_HUB_CONSUMER_RESPONSE })
      .mockResolvedValueOnce({ data: IDENTITY_HUB_PROVIDER_RESPONSE });
    
    await request(app).get('/api/participants');

    // Clear cache
    await request(app).post('/api/participants/cache/clear');

    // Next request should hit Identity Hub again
    mockedAxios.get
      .mockResolvedValueOnce({ data: IDENTITY_HUB_CONSUMER_RESPONSE })
      .mockResolvedValueOnce({ data: IDENTITY_HUB_PROVIDER_RESPONSE });
    
    await request(app).get('/api/participants');

    // Should have made 4 total calls (2 initial + 2 after clear)
    expect(mockedAxios.get).toHaveBeenCalledTimes(4);
  });
});

// ============================================================
// Caching Tests
// ============================================================

describe('Caching Behavior', () => {
  beforeEach(async () => {
    await request(app).post('/api/participants/cache/clear');
  });

  it('should cache Identity Hub results', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: IDENTITY_HUB_CONSUMER_RESPONSE })
      .mockResolvedValueOnce({ data: IDENTITY_HUB_PROVIDER_RESPONSE });

    // First request
    await request(app).get('/api/participants');
    // Second request (should use cache)
    await request(app).get('/api/participants');
    // Third request (should use cache)
    await request(app).get('/api/participants');

    // Should only have made 2 calls (initial consumer + provider)
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it('should return cached result for different endpoints', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: IDENTITY_HUB_CONSUMER_RESPONSE })
      .mockResolvedValueOnce({ data: IDENTITY_HUB_PROVIDER_RESPONSE });

    // Request all participants (caches)
    await request(app).get('/api/participants');
    
    // Request consumer (uses cache)
    await request(app).get('/api/participants/consumer');
    
    // Request provider (uses cache)
    await request(app).get('/api/participants/provider');

    // Should only have made 2 calls total
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed requests', async () => {
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));

    // First request fails
    await request(app).get('/api/participants');
    
    // Mock succeeds now
    mockedAxios.get
      .mockResolvedValueOnce({ data: IDENTITY_HUB_CONSUMER_RESPONSE })
      .mockResolvedValueOnce({ data: IDENTITY_HUB_PROVIDER_RESPONSE });
    
    // Second request should try again
    const response = await request(app).get('/api/participants');

    expect(response.body.source).toBe('identity-hub');
  });
});

// ============================================================
// Static Data Tests
// ============================================================

describe('Static Fallback Data', () => {
  beforeEach(async () => {
    await request(app).post('/api/participants/cache/clear');
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));
  });

  it('should have correct consumer static data', async () => {
    const response = await request(app).get('/api/participants');

    const consumer = response.body.consumer;
    expect(consumer.did).toBe('did:web:consumer.local');
    expect(consumer.name).toBe('Nordstein Research Institute');
    expect(consumer.type).toBe('consumer');
    expect(consumer.region).toBe('DE-NW');
    expect(consumer.verified).toBe(true);
    expect(consumer.roles).toContain('data-consumer');
    expect(consumer.roles).toContain('research-organization');
  });

  it('should have correct provider static data', async () => {
    const response = await request(app).get('/api/participants');

    const provider = response.body.provider;
    expect(provider.did).toBe('did:web:provider.local');
    expect(provider.name).toBe('Rheinland Universitätsklinikum');
    expect(provider.type).toBe('provider');
    expect(provider.region).toBe('DE-NW');
    expect(provider.verified).toBe(true);
    expect(provider.roles).toContain('data-provider');
    expect(provider.roles).toContain('healthcare-provider');
  });

  it('should have membership credential in static data', async () => {
    const response = await request(app).get('/api/participants');

    expect(response.body.consumer.membershipCredential).toBeDefined();
    expect(response.body.consumer.membershipCredential.issuedAt).toBeDefined();
    expect(response.body.consumer.membershipCredential.issuer).toContain('issuer-service');
  });
});

// ============================================================
// Error Handling Tests
// ============================================================

describe('Error Handling', () => {
  beforeEach(async () => {
    await request(app).post('/api/participants/cache/clear');
  });

  it('should handle network errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue({
      code: 'ENOTFOUND',
      message: 'getaddrinfo ENOTFOUND localhost',
    });

    const response = await request(app)
      .get('/api/participants')
      .expect(200);

    expect(response.body.source).toBe('static-config');
  });

  it('should handle malformed Identity Hub responses', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({ data: {} });

    const response = await request(app)
      .get('/api/participants')
      .expect(200);

    // Should fall back to static since IH data is incomplete
    expect(response.body).toBeDefined();
  });

  it('should return 404 for truly unknown DID when Identity Hub is down', async () => {
    // When IH is down, fallback to static data which doesn't have unknown DIDs
    mockedAxios.get.mockRejectedValue(new Error('Unexpected internal error'));

    const response = await request(app)
      .get('/api/participants/did:web:unknown.example.com')
      .expect(404);

    expect(response.body.error).toBe('Participant not found');
  });
});

// ============================================================
// Type Validation Tests
// ============================================================

describe('Response Type Validation', () => {
  beforeEach(async () => {
    await request(app).post('/api/participants/cache/clear');
    mockedAxios.get.mockRejectedValue(new Error('IH unavailable'));
  });

  it('should return valid Participant structure', async () => {
    const response = await request(app).get('/api/participants/consumer');

    const participant = response.body;
    
    // Required fields
    expect(typeof participant.did).toBe('string');
    expect(typeof participant.name).toBe('string');
    expect(['consumer', 'provider']).toContain(participant.type);
    expect(typeof participant.region).toBe('string');
    expect(typeof participant.verified).toBe('boolean');
    expect(Array.isArray(participant.roles)).toBe(true);
    
    // Optional fields
    if (participant.membershipCredential) {
      expect(typeof participant.membershipCredential.issuedAt).toBe('string');
      expect(typeof participant.membershipCredential.issuer).toBe('string');
    }
  });

  it('should return valid ParticipantsResponse structure', async () => {
    const response = await request(app).get('/api/participants');

    expect(response.body).toHaveProperty('consumer');
    expect(response.body).toHaveProperty('provider');
    expect(response.body).toHaveProperty('source');
    expect(['identity-hub', 'static-config']).toContain(response.body.source);
  });
});
