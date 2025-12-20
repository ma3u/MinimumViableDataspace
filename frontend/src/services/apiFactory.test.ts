import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiClient, getApiMode, getBaseUrl } from './apiFactory';

describe('apiFactory', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Reset environment to defaults before each test
    import.meta.env.VITE_API_MODE = 'mock';
    import.meta.env.VITE_MOCK_API_URL = 'http://localhost:3001';
    import.meta.env.VITE_EDC_API_URL = 'http://localhost:3002';
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore original environment
    Object.assign(import.meta.env, originalEnv);
    vi.clearAllMocks();
  });

  describe('getApiMode', () => {
    it('should return mock mode by default', () => {
      import.meta.env.VITE_API_MODE = 'mock';
      expect(getApiMode()).toBe('mock');
    });

    it('should return hybrid mode when set', () => {
      import.meta.env.VITE_API_MODE = 'hybrid';
      expect(getApiMode()).toBe('hybrid');
    });

    it('should return full mode when set', () => {
      import.meta.env.VITE_API_MODE = 'full';
      expect(getApiMode()).toBe('full');
    });
  });

  describe('getBaseUrl', () => {
    it('should return mock URL in mock mode', () => {
      import.meta.env.VITE_API_MODE = 'mock';
      import.meta.env.VITE_MOCK_API_URL = 'http://localhost:3001';
      const url = getBaseUrl();
      expect(url).toBe('http://localhost:3001');
    });

    it('should return EDC URL in hybrid mode', () => {
      import.meta.env.VITE_API_MODE = 'hybrid';
      import.meta.env.VITE_EDC_API_URL = 'http://localhost:3002';
      const url = getBaseUrl();
      expect(url).toBe('http://localhost:3002');
    });

    it('should return EDC URL in full mode', () => {
      import.meta.env.VITE_API_MODE = 'full';
      import.meta.env.VITE_EDC_API_URL = 'http://localhost:3002';
      const url = getBaseUrl();
      expect(url).toBe('http://localhost:3002');
    });
  });

  describe('ApiClient', () => {
    let client: ApiClient;

    beforeEach(() => {
      // Ensure mock mode with correct URLs
      import.meta.env.VITE_API_MODE = 'mock';
      import.meta.env.VITE_MOCK_API_URL = 'http://localhost:3001';
      import.meta.env.VITE_EDC_API_URL = 'http://localhost:3002';
      client = new ApiClient();
      global.fetch = vi.fn();
    });

    describe('health', () => {
      it('should fetch health endpoint', async () => {
        const mockResponse = { status: 'healthy' };
        (global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });

        // Refresh client to pick up new environment
        client.refresh();
        const result = await client.health();
        
        // Check fetch was called with correct URL pattern
        expect(global.fetch).toHaveBeenCalled();
        const callUrl = (global.fetch as any).mock.calls[0][0];
        expect(callUrl).toContain('/health');
        expect(result).toEqual(mockResponse);
      });

      it('should throw error on failed request', async () => {
        (global.fetch as any).mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' }),
        });

        await expect(client.health()).rejects.toThrow('Server error');
      });
    });

    describe('getEhrList', () => {
      it('should fetch from mock API in mock mode', async () => {
        import.meta.env.VITE_API_MODE = 'mock';
        client.refresh();

        const mockData = {
          records: [
            { ehrId: 'EHR001', diagnosis: 'Test', diagnosisCode: 'E11.9' },
          ],
        };

        (global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => mockData,
        });

        const result = await client.getEhrList();
        
        // Verify the endpoint was called
        expect(global.fetch).toHaveBeenCalled();
        const callUrl = (global.fetch as any).mock.calls[0][0];
        expect(callUrl).toContain('/api/ehr');
        expect(result).toEqual(mockData.records);
      });

      it('should fetch from catalog API in hybrid mode', async () => {
        import.meta.env.VITE_API_MODE = 'hybrid';
        client.refresh();

        const mockCatalog = {
          assets: [
            {
              ehrId: 'EHR001',
              assetId: 'ehr:EHR001',
              title: 'EHR001',
              description: 'Test diagnosis',
              ageBand: '55-64',
              biologicalSex: 'male',
              clinicalPhase: 'Phase III',
              healthCategory: 'Cardiology',
              meddraVersion: '27.0',
              sensitiveCategory: 'none',
            },
          ],
          totalCount: 1,
          source: 'edc',
        };

        (global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => mockCatalog,
        });

        const result = await client.getEhrList();
        
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/catalog/assets',
          expect.any(Object)
        );
        expect(result).toHaveLength(1);
        expect(result[0].ehrId).toBe('EHR001');
      });
    });

    describe('initiateNegotiation', () => {
      it('should return mock response in mock mode', async () => {
        import.meta.env.VITE_API_MODE = 'mock';
        client.refresh();

        const result = await client.initiateNegotiation('ehr:EHR001', 'offer:123');
        
        expect(result).toMatchObject({
          state: 'FINALIZED',
          message: 'Mock negotiation completed instantly',
        });
        expect(result.negotiationId).toContain('mock-neg-');
      });

      it('should call EDC API in hybrid mode', async () => {
        import.meta.env.VITE_API_MODE = 'hybrid';
        client.refresh();

        const mockResponse = {
          negotiationId: 'neg-123',
          state: 'REQUESTING',
        };

        (global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await client.initiateNegotiation('ehr:EHR001', 'offer:123', 'policy:membership');
        
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/negotiations',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              assetId: 'ehr:EHR001',
              offerId: 'offer:123',
              policyId: 'policy:membership',
            }),
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('pollNegotiation', () => {
      it('should return finalized state in mock mode', async () => {
        import.meta.env.VITE_API_MODE = 'mock';
        client.refresh();

        const result = await client.pollNegotiation('neg-123');
        
        expect(result.state).toBe('FINALIZED');
      });

      it('should poll EDC API in hybrid mode', async () => {
        import.meta.env.VITE_API_MODE = 'hybrid';
        client.refresh();

        const mockResponse = {
          negotiationId: 'neg-123',
          state: 'FINALIZED',
          contractAgreementId: 'agreement-456',
        };

        (global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await client.pollNegotiation('neg-123', 30000);
        
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/negotiations/neg-123/poll?timeout=30000',
          expect.objectContaining({
            method: 'POST',
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('initiateTransfer', () => {
      it('should return mock response in mock mode', async () => {
        import.meta.env.VITE_API_MODE = 'mock';
        client.refresh();

        const result = await client.initiateTransfer('agreement-123', 'ehr:EHR001');
        
        expect(result).toMatchObject({
          state: 'COMPLETED',
          contractAgreementId: 'agreement-123',
        });
        expect(result.transferId).toContain('mock-transfer-');
      });

      it('should call EDC API in full mode', async () => {
        import.meta.env.VITE_API_MODE = 'full';
        client.refresh();

        const mockResponse = {
          transferId: 'transfer-789',
          state: 'INITIAL',
          contractAgreementId: 'agreement-123',
        };

        (global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await client.initiateTransfer('agreement-123', 'ehr:EHR001');
        
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/transfers',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              contractAgreementId: 'agreement-123',
              assetId: 'ehr:EHR001',
            }),
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getEhr', () => {
      it('should fetch from mock API in mock mode', async () => {
        import.meta.env.VITE_API_MODE = 'mock';
        import.meta.env.VITE_MOCK_API_URL = 'http://localhost:3001';
        client.refresh();

        const mockEhr = {
          credentialSubject: {
            ehrId: 'EHR001',
            diagnosis: 'Test diagnosis',
          },
        };

        (global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => mockEhr,
        });

        const result = await client.getEhr('EHR001');
        
        // Verify the endpoint was called
        expect(global.fetch).toHaveBeenCalled();
        const callUrl = (global.fetch as any).mock.calls[0][0];
        expect(callUrl).toContain('/api/ehr/EHR001');
        expect(result).toEqual(mockEhr);
      });

      it('should fetch via transfer API in hybrid mode', async () => {
        import.meta.env.VITE_API_MODE = 'hybrid';
        client.refresh();

        const mockEhr = {
          credentialSubject: {
            ehrId: 'EHR001',
            diagnosis: 'Test diagnosis',
          },
          _meta: {
            source: 'hybrid',
            mode: 'hybrid',
            fetchedAt: new Date().toISOString(),
          },
        };

        (global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => mockEhr,
        });

        const result = await client.getEhr('EHR001');
        
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/transfers/ehr/EHR001',
          expect.any(Object)
        );
        expect(result._meta?.source).toBe('hybrid');
      });
    });

    describe('error handling', () => {
      it('should handle network errors', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        await expect(client.health()).rejects.toThrow('Network error');
      });

      it('should handle invalid JSON responses', async () => {
        (global.fetch as any).mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => {
            throw new Error('Invalid JSON');
          },
        });

        await expect(client.health()).rejects.toThrow();
      });
    });
  });
});
