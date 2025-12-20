import { vi } from 'vitest';

export type ApiMode = 'mock' | 'hybrid' | 'full';

export const getApiMode = vi.fn().mockReturnValue('mock' as ApiMode);
export const getBaseUrl = vi.fn().mockReturnValue('http://localhost:3001');

export const api = {
  getMode: vi.fn().mockReturnValue('mock' as ApiMode),
  setMode: vi.fn(),
  getEhrList: vi.fn().mockResolvedValue([]),
  getEhr: vi.fn().mockResolvedValue({}),
  checkHealth: vi.fn().mockResolvedValue({ status: 'healthy' }),
  getCatalogAssets: vi.fn().mockResolvedValue({ assets: [], totalCount: 0, source: 'mock' }),
  initiateNegotiation: vi.fn().mockResolvedValue({ negotiationId: 'test-neg-id', state: 'REQUESTED' }),
  getNegotiationState: vi.fn().mockResolvedValue({ state: 'FINALIZED' }),
  getNegotiation: vi.fn().mockResolvedValue({ state: 'FINALIZED', contractAgreementId: 'test-agreement' }),
  pollNegotiation: vi.fn().mockResolvedValue({ state: 'FINALIZED', contractAgreementId: 'test-agreement' }),
  initiateTransfer: vi.fn().mockResolvedValue({ transferId: 'test-transfer-id', state: 'STARTED' }),
  getTransferState: vi.fn().mockResolvedValue({ state: 'COMPLETED' }),
  getTransfer: vi.fn().mockResolvedValue({ state: 'COMPLETED', endpointDataReference: { endpoint: 'http://test' } }),
  pollTransfer: vi.fn().mockResolvedValue({ state: 'COMPLETED' }),
  getEndpointDataReference: vi.fn().mockResolvedValue({ endpoint: 'http://test', authKey: 'key', authCode: 'code' }),
  fetchTransferData: vi.fn().mockResolvedValue({ data: 'test-data' }),
  refresh: vi.fn(),
  health: vi.fn().mockResolvedValue({ status: 'healthy' }),
};
