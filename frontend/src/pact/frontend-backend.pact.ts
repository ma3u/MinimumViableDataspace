/**
 * Pact Consumer Tests for Frontend-to-Backend API contracts
 * 
 * These tests define the expected API contract between the frontend
 * and backend-edc service. They generate Pact files that can be used
 * for provider verification.
 */

import { describe, it, expect } from 'vitest';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

const { like, eachLike, string, integer } = MatchersV3;

// Create Pact instance
const provider = new PactV3({
  consumer: 'HealthFrontend',
  provider: 'BackendEDC',
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
});

describe('Frontend-BackendEDC Pact', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      await provider
        .given('the service is healthy')
        .uponReceiving('a request for health status')
        .withRequest({
          method: 'GET',
          path: '/health',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            status: string('healthy'),
            mode: string('hybrid'),
          },
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/health`);
          const data = await response.json();
          expect(data.status).toBe('healthy');
        });
    });
  });

  describe('Catalog API', () => {
    it('should return catalog assets', async () => {
      await provider
        .given('catalog contains EHR assets')
        .uponReceiving('a request for catalog assets')
        .withRequest({
          method: 'GET',
          path: '/api/catalog/assets',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            assets: eachLike({
              ehrId: string('EHR001'),
              assetId: string('ehr:EHR001'),
              title: string('EHR001 - Cardiology Patient'),
              description: string('Hypertension diagnosis'),
              healthCategory: string('Cardiology'),
              ageBand: string('45-54'),
              biologicalSex: string('male'),
              clinicalPhase: string('Phase III'),
              meddraVersion: string('27.0'),
              sensitiveCategory: string('none'),
              policies: [],
            }),
            totalCount: integer(21),
            source: string('edc-catalog'),
            providerDsp: string('http://localhost:8192/api/dsp'),
          },
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/api/catalog/assets`);
          const data = await response.json();
          expect(data.assets).toBeInstanceOf(Array);
          expect(data.assets.length).toBeGreaterThan(0);
          expect(data.assets[0]).toHaveProperty('ehrId');
        });
    });
  });

  describe('Negotiation API', () => {
    it('should initiate contract negotiation', async () => {
      await provider
        .given('provider has asset available')
        .uponReceiving('a request to initiate negotiation')
        .withRequest({
          method: 'POST',
          path: '/api/negotiations',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            assetId: 'ehr:EHR001',
            offerId: 'offer:ehr:EHR001',
          },
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            negotiationId: string('neg-12345'),
            state: string('REQUESTED'),
            message: string('Negotiation initiated'),
          },
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/api/negotiations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId: 'ehr:EHR001',
              offerId: 'offer:ehr:EHR001',
            }),
          });
          const data = await response.json();
          expect(data.negotiationId).toBeDefined();
          expect(data.state).toBe('REQUESTED');
        });
    });

    it('should poll negotiation status', async () => {
      await provider
        .given('negotiation is finalized')
        .uponReceiving('a request to poll negotiation status')
        .withRequest({
          method: 'POST',
          path: '/api/negotiations/neg-12345/poll',
          query: { timeout: '30000' },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            negotiationId: string('neg-12345'),
            state: string('FINALIZED'),
            contractAgreementId: string('agreement-67890'),
          },
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(
            `${mockServer.url}/api/negotiations/neg-12345/poll?timeout=30000`,
            { method: 'POST' }
          );
          const data = await response.json();
          expect(data.state).toBe('FINALIZED');
          expect(data.contractAgreementId).toBeDefined();
        });
    });
  });

  describe('Transfer API', () => {
    it('should initiate data transfer', async () => {
      await provider
        .given('contract agreement exists')
        .uponReceiving('a request to initiate transfer')
        .withRequest({
          method: 'POST',
          path: '/api/transfers',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            contractAgreementId: 'agreement-67890',
            assetId: 'ehr:EHR001',
          },
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            transferId: string('transfer-11111'),
            state: string('STARTED'),
            contractAgreementId: string('agreement-67890'),
          },
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/api/transfers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contractAgreementId: 'agreement-67890',
              assetId: 'ehr:EHR001',
            }),
          });
          const data = await response.json();
          expect(data.transferId).toBeDefined();
          expect(data.state).toBe('STARTED');
        });
    });

    it('should poll transfer status until completed', async () => {
      await provider
        .given('transfer is completed')
        .uponReceiving('a request to poll transfer status')
        .withRequest({
          method: 'POST',
          path: '/api/transfers/transfer-11111/poll',
          query: { timeout: '30000' },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            transferId: string('transfer-11111'),
            state: string('COMPLETED'),
          },
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(
            `${mockServer.url}/api/transfers/transfer-11111/poll?timeout=30000`,
            { method: 'POST' }
          );
          const data = await response.json();
          expect(data.state).toBe('COMPLETED');
        });
    });
  });

  describe('EHR Data API', () => {
    it('should fetch EHR data via EDR', async () => {
      await provider
        .given('transfer completed and EDR available')
        .uponReceiving('a request to fetch EHR data')
        .withRequest({
          method: 'GET',
          path: '/api/transfers/ehr/EHR001',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            credentialSubject: like({
              ehrId: string('EHR001'),
              diagnosis: string('Essential hypertension'),
              diagnosisCode: string('I10'),
              ageBand: string('45-54'),
              biologicalSex: string('male'),
            }),
            _meta: like({
              source: string('edc-transfer'),
              mode: string('hybrid'),
              transferId: string('transfer-11111'),
              fetchedAt: string('2025-01-01T00:00:00Z'),
            }),
          },
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/api/transfers/ehr/EHR001`);
          const data = await response.json();
          expect(data.credentialSubject).toBeDefined();
          expect(data.credentialSubject.ehrId).toBe('EHR001');
        });
    });
  });
});
