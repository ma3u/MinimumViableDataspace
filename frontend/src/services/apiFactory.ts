/**
 * API Factory for Mode Switching
 * 
 * Provides a unified API interface that switches between:
 * - mock: Direct calls to backend-mock (port 3001)
 * - hybrid: Calls to backend-edc (port 3002) which uses mock data + EDC metadata
 * - full: Calls to backend-edc (port 3002) with complete EDC data flow
 */

// API Mode type
export type ApiMode = 'mock' | 'hybrid' | 'full';

// Get current mode from environment
export function getApiMode(): ApiMode {
  const mode = import.meta.env.VITE_API_MODE as string;
  if (mode === 'hybrid' || mode === 'full') {
    return mode;
  }
  return 'mock'; // Default to mock for safety
}

// Check if running as static demo (GitHub Pages)
export function isStaticDemo(): boolean {
  // GitHub Pages builds have base path /MinimumViableDataspace/
  // or the mock API URL is empty (no backend available)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const mockUrl = import.meta.env.VITE_MOCK_API_URL || '';
  return baseUrl.includes('MinimumViableDataspace') || 
         (getApiMode() === 'mock' && mockUrl === '');
}

// Get base URL for current mode
export function getBaseUrl(): string {
  const mode = getApiMode();
  
  if (mode === 'mock') {
    const mockUrl = import.meta.env.VITE_MOCK_API_URL;
    return mockUrl && mockUrl.trim() !== '' ? mockUrl : 'http://localhost:3001';
  }
  
  // hybrid and full both use backend-edc
  const edcUrl = import.meta.env.VITE_EDC_API_URL;
  return edcUrl && edcUrl.trim() !== '' ? edcUrl : 'http://localhost:3002';
}

// API Response types
export interface EhrSummary {
  ehrId: string;
  assetId?: string;
  title?: string;
  diagnosis: string;
  diagnosisCode: string;
  ageBand: string;
  biologicalSex: string;
  clinicalPhase?: string;
  healthCategory?: string;
  meddraVersion?: string;
  sensitiveCategory?: string;
}

export interface EhrRecord {
  credentialSubject: {
    ehrId: string;
    diagnosis: string;
    diagnosisCode: string;
    ageBand: string;
    biologicalSex: string;
    vitalSigns?: unknown;
    medications?: unknown[];
    clinicalTrialNode?: {
      phase: string;
      protocolId: string;
      studyName: string;
    };
    medDRANode?: {
      primarySOC: { code: string; name: string };
      preferredTerms: { code: string; name: string }[];
    };
    signalVerificationNode?: {
      adverseEvents: unknown[];
    };
    anamnesisNode?: unknown;
  };
  _meta?: {
    source: string;
    mode: string;
    transferId?: string;
    fromCache?: boolean;
    fetchedAt: string;
  };
}

/**
 * Publisher information following DCAT-AP publisher requirements
 */
export interface Publisher {
  name: string;
  identifier: string;
  type: 'public-body' | 'research-institution' | 'hospital' | 'biobank' | 'registry' | 'pharma' | 'unknown';
  homepage?: string;
}

/**
 * Contact point following DCAT-AP contactPoint pattern
 */
export interface ContactPoint {
  email?: string;
  url?: string;
  name?: string;
}

/**
 * Distribution information (how the data can be accessed)
 */
export interface Distribution {
  format: string;
  mediaType?: string;
  accessService?: string;
  byteSize?: number;
}

/**
 * Policy summary derived from ODRL policies
 */
export interface PolicySummary {
  type: 'open' | 'consent-required' | 'restricted';
  requiredConsents?: string[];
  constraints?: string[];
}

/**
 * Catalog Asset with full DCAT-AP and HealthDCAT-AP properties
 */
export interface CatalogAsset {
  // Core identifiers (support both normalized and JSON-LD formats)
  '@id'?: string;
  ehrId: string;
  assetId: string;
  
  // DCT core properties (support both normalized and JSON-LD formats)
  'dct:title'?: string;
  'dct:description'?: string;
  title: string;
  description: string;
  language?: string[];
  issued?: string;
  modified?: string;
  
  // Publisher & contact (optional for backward compatibility)
  publisher?: Publisher;
  contactPoint?: ContactPoint;
  
  // HealthDCAT-AP properties (support both normalized and JSON-LD formats)
  'healthdcatap:category'?: string;
  'healthdcatap:ageRange'?: string;
  'healthdcatap:biologicalSex'?: string;
  'healthdcatap:consentStatus'?: string;
  'healthdcatap:icdCode'?: string;
  'healthdcatap:diagnosis'?: string;
  'healthdcatap:sensitiveCategory'?: string;
  'healthdcatap:clinicalTrialPhase'?: string;
  'healthdcatap:euCtNumber'?: string;
  'healthdcatap:memberStates'?: string[];
  'healthdcatap:signalStatus'?: {
    hasActiveSignal: boolean;
    adrCount: number;
  };
  'healthdcatap:consent'?: {
    purposes: string[];
    restrictions: string[];
    validUntil: string;
    grantor: string;
  };
  'healthdcatap:sponsor'?: {
    name: string;
    type: 'commercial' | 'academic' | 'non-profit' | string;
    country: string;
  };
  'healthdcatap:therapeuticArea'?: {
    code: string;
    name: string;
  };
  'healthdcatap:medDRA'?: {
    socCode: string;
    socName: string;
    ptCode: string;
    ptName: string;
  };
  healthCategory: string;
  healthTheme?: string[];
  ageBand: string;
  minAge?: number;
  maxAge?: number;
  biologicalSex: string;
  populationCoverage?: string;
  clinicalPhase: string;
  meddraVersion: string;
  sensitiveCategory: string;
  
  // Clinical context
  sponsor?: {
    name: string;
    type: string;
    country: string;
  };
  therapeuticArea?: string;
  euCtNumber?: string;
  
  // DCAT distribution (optional for backward compatibility)
  distributions?: Distribution[];
  
  // Policy information
  policy?: PolicySummary;
  policies?: unknown[];  // Legacy field for backward compatibility
  
  // Quality & provenance
  qualityScore?: number;
  sourceSystem?: string;
  deIdentificationMethod?: string;
}

export interface CatalogResponse {
  assets: CatalogAsset[];
  totalCount: number;
  source: string;
  providerDsp?: string;
  enhanced?: boolean;
  message?: string;
}

export interface NegotiationResponse {
  negotiationId: string;
  state: string;
  contractAgreementId?: string;
  message?: string;
}

export interface TransferResponse {
  transferId: string;
  state: string;
  contractAgreementId?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

/**
 * API Client class
 */
class ApiClient {
  private baseUrl: string;
  private mode: ApiMode;

  constructor() {
    this.mode = getApiMode();
    this.baseUrl = getBaseUrl();
  }

  /**
   * Refresh configuration (call after mode change)
   */
  refresh(): void {
    this.mode = getApiMode();
    this.baseUrl = getBaseUrl();
  }

  /**
   * Get current mode
   */
  getMode(): ApiMode {
    return this.mode;
  }

  /**
   * Make a fetch request with error handling
   */
  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.message ?? error.error ?? `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string; mode?: string }> {
    return this.fetch('/health');
  }

  // ============================================================
  // Catalog APIs
  // ============================================================

  /**
   * Get all EHR records (summary)
   * In mock mode: returns mock data directly
   * In hybrid/full mode: returns catalog assets from EDC
   */
  async getEhrList(): Promise<EhrSummary[]> {
    if (this.mode === 'mock') {
      const response = await this.fetch<{ records: EhrSummary[] }>('/api/ehr');
      return response.records ?? [];
    }

    // hybrid/full - use catalog endpoint
    const response = await this.fetch<CatalogResponse>('/api/catalog/assets');
    return response.assets.map(asset => ({
      ehrId: asset.ehrId,
      assetId: asset.assetId,
      title: asset.title,
      diagnosis: asset.description,
      diagnosisCode: '',
      ageBand: asset.ageBand,
      biologicalSex: asset.biologicalSex,
      clinicalPhase: asset.clinicalPhase,
      healthCategory: asset.healthCategory,
      meddraVersion: asset.meddraVersion,
      sensitiveCategory: asset.sensitiveCategory,
    }));
  }

  /**
   * Get raw catalog from EDC (only available in hybrid/full mode)
   */
  async getCatalog(): Promise<unknown> {
    if (this.mode === 'mock') {
      throw new Error('Catalog endpoint not available in mock mode');
    }
    return this.fetch('/api/catalog');
  }

  /**
   * Get catalog assets (only available in hybrid/full mode)
   */
  async getCatalogAssets(): Promise<CatalogResponse> {
    if (this.mode === 'mock') {
      throw new Error('Catalog assets endpoint not available in mock mode');
    }
    return this.fetch('/api/catalog/assets');
  }

  // ============================================================
  // EHR Data APIs
  // ============================================================

  /**
   * Get single EHR record
   * In mock mode: returns mock data directly
   * In hybrid/full mode: returns data via EDC (hybrid uses mock data, full uses EDC transfer)
   */
  async getEhr(ehrId: string): Promise<EhrRecord> {
    if (this.mode === 'mock') {
      return this.fetch(`/api/ehr/${ehrId}`);
    }
    return this.fetch(`/api/transfers/ehr/${ehrId}`);
  }

  // ============================================================
  // Contract Negotiation APIs (hybrid/full mode only)
  // ============================================================

  /**
   * Initiate contract negotiation
   */
  async initiateNegotiation(assetId: string, offerId: string, policyId?: string): Promise<NegotiationResponse> {
    if (this.mode === 'mock') {
      // Simulate negotiation in mock mode
      return {
        negotiationId: `mock-neg-${Date.now()}`,
        state: 'FINALIZED',
        contractAgreementId: `mock-agreement-${Date.now()}`,
        message: 'Mock negotiation completed instantly',
      };
    }

    return this.fetch('/api/negotiations', {
      method: 'POST',
      body: JSON.stringify({ assetId, offerId, policyId }),
    });
  }

  /**
   * Get negotiation status
   */
  async getNegotiation(negotiationId: string): Promise<NegotiationResponse> {
    if (this.mode === 'mock') {
      return {
        negotiationId,
        state: 'FINALIZED',
        contractAgreementId: `mock-agreement-${negotiationId}`,
      };
    }
    return this.fetch(`/api/negotiations/${negotiationId}`);
  }

  /**
   * Poll negotiation until complete
   */
  async pollNegotiation(negotiationId: string, timeout = 30000): Promise<NegotiationResponse> {
    if (this.mode === 'mock') {
      return this.getNegotiation(negotiationId);
    }
    return this.fetch(`/api/negotiations/${negotiationId}/poll?timeout=${timeout}`, {
      method: 'POST',
    });
  }

  // ============================================================
  // Data Transfer APIs (hybrid/full mode only)
  // ============================================================

  /**
   * Initiate data transfer
   */
  async initiateTransfer(contractAgreementId: string, assetId: string): Promise<TransferResponse> {
    if (this.mode === 'mock') {
      return {
        transferId: `mock-transfer-${Date.now()}`,
        state: 'COMPLETED',
        contractAgreementId,
        message: 'Mock transfer completed instantly',
      };
    }

    return this.fetch('/api/transfers', {
      method: 'POST',
      body: JSON.stringify({ contractAgreementId, assetId }),
    });
  }

  /**
   * Get transfer status
   */
  async getTransfer(transferId: string): Promise<TransferResponse> {
    if (this.mode === 'mock') {
      return {
        transferId,
        state: 'COMPLETED',
      };
    }
    return this.fetch(`/api/transfers/${transferId}`);
  }

  /**
   * Poll transfer until complete
   */
  async pollTransfer(transferId: string, timeout = 30000): Promise<TransferResponse> {
    if (this.mode === 'mock') {
      return this.getTransfer(transferId);
    }
    return this.fetch(`/api/transfers/${transferId}/poll?timeout=${timeout}`, {
      method: 'POST',
    });
  }

  /**
   * Fetch data via EDR (after transfer complete)
   */
  async fetchTransferData(transferId: string): Promise<unknown> {
    if (this.mode === 'mock') {
      throw new Error('EDR data fetch not available in mock mode');
    }
    return this.fetch(`/api/transfers/${transferId}/data`);
  }

  /**
   * Initiate full EHR transfer (negotiation + transfer in one call)
   */
  async initiateEhrTransfer(ehrId: string, offerId: string, policyId?: string): Promise<{
    ehrId: string;
    negotiationId: string;
    contractAgreementId: string;
    transferId: string;
    state: string;
  }> {
    if (this.mode === 'mock') {
      const ts = Date.now();
      return {
        ehrId,
        negotiationId: `mock-neg-${ts}`,
        contractAgreementId: `mock-agreement-${ts}`,
        transferId: `mock-transfer-${ts}`,
        state: 'COMPLETED',
      };
    }

    return this.fetch(`/api/transfers/ehr/${ehrId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ offerId, policyId }),
    });
  }

  // ============================================================
  // Identity APIs (hybrid/full mode only)
  // ============================================================

  /**
   * Verify provider membership
   */
  async verifyProvider(): Promise<{ verified: boolean; providerId?: string }> {
    if (this.mode === 'mock') {
      return { verified: true, providerId: 'mock-provider' };
    }
    return this.fetch('/api/identity/provider/verify');
  }

  /**
   * Get consent status for patient
   */
  async getConsentStatus(patientDid: string, studyId?: string): Promise<{
    patientDid: string;
    consents: unknown[];
  }> {
    if (this.mode === 'mock') {
      return {
        patientDid,
        consents: [{
          studyId: studyId ?? 'MOCK-STUDY',
          status: 'active',
          grantedAt: new Date().toISOString(),
        }],
      };
    }

    const query = studyId ? `?studyId=${encodeURIComponent(studyId)}` : '';
    return this.fetch(`/api/identity/consent/${encodeURIComponent(patientDid)}${query}`);
  }

  /**
   * Submit consent attestation
   */
  async submitConsent(patientDid: string, studyId: string, purpose: string, options?: {
    ehrIds?: string[];
    scope?: Record<string, boolean>;
    expirationDate?: string;
  }): Promise<{ message: string; status: string }> {
    if (this.mode === 'mock') {
      return { message: 'Mock consent recorded', status: 'active' };
    }

    return this.fetch('/api/identity/attestation/consent', {
      method: 'POST',
      body: JSON.stringify({
        patientDid,
        studyId,
        purpose,
        ...options,
      }),
    });
  }

  /**
   * Revoke consent
   */
  async revokeConsent(patientDid: string, studyId: string, reason?: string): Promise<{ message: string }> {
    if (this.mode === 'mock') {
      return { message: 'Mock consent revoked' };
    }

    return this.fetch(`/api/identity/consent/${encodeURIComponent(patientDid)}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ studyId, reason }),
    });
  }

  // ============================================================
  // Mode Info
  // ============================================================

  /**
   * Get mode information from backend
   */
  async getModeInfo(): Promise<{
    mode: string;
    description: string;
    endpoints: Record<string, string>;
  }> {
    if (this.mode === 'mock') {
      return {
        mode: 'mock',
        description: 'Mock mode: Using simulated data from backend-mock',
        endpoints: {
          health: '/health',
          ehr: '/api/ehr',
        },
      };
    }
    return this.fetch('/api/mode');
  }
}

// Singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };
