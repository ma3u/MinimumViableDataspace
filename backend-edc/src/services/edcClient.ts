/**
 * EDC Client Service
 * 
 * Provides typed access to EDC Management API endpoints.
 * Handles JSON-LD context, authentication, and error handling.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { config, EDC_CONTEXT, ODRL_CONTEXT } from '../config.js';

export interface CatalogRequest {
  counterPartyAddress: string;
  counterPartyId: string;
  protocol?: string;
  querySpec?: {
    offset?: number;
    limit?: number;
  };
}

export interface ContractRequest {
  counterPartyAddress: string;
  counterPartyId: string;
  providerId?: string;  // Optional for backwards compatibility
  protocol?: string;
  policy?: {
    '@type': string;
    '@id': string;
    assigner: string;
    target: string;
    permission?: unknown[];
    prohibition?: unknown[];
    obligation?: unknown;
  };
  offer?: {
    offerId: string;
    assetId: string;
    policyId?: string;
  };
}

export interface TransferRequest {
  assetId: string;
  counterPartyAddress: string;
  connectorId?: string;  // Optional
  contractId: string;
  dataDestination: {
    type: string;
  };
  protocol?: string;
  transferType: string;
}

export interface NegotiationState {
  '@id': string;
  '@type': string;
  state: string;
  counterPartyId: string;
  counterPartyAddress: string;
  contractAgreementId?: string;
  createdAt: number;
  // Allow JSON-LD style property access for EDC responses
  [key: string]: unknown;
}

export interface TransferState {
  '@id': string;
  '@type': string;
  state: string;
  assetId: string;
  contractId: string;
  transferType: string;
  createdAt: number;
  // Allow JSON-LD style property access for EDC responses
  [key: string]: unknown;
}

export interface EndpointDataReference {
  '@type': string;
  id: string;
  endpoint: string;
  authKey: string;
  authCode: string;
  properties?: Record<string, unknown>;
  // Allow JSON-LD style property access for EDC responses
  [key: string]: unknown;
}

export interface IdResponse {
  '@id': string;
  createdAt?: number;
  // Allow JSON-LD style property access for EDC responses
  [key: string]: unknown;
}

export interface ContractAgreement {
  '@id': string;
  '@type': string;
  assetId: string;
  providerId: string;
  consumerId: string;
  [key: string]: unknown;
}

export interface FetchResult {
  data: unknown;
  fromCache?: boolean;
  [key: string]: unknown;
}

export class EdcClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = config.edc.consumerManagementUrl) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.edc.apiKey,
      },
      timeout: 30000,
    });
  }

  /**
   * Request catalog from a provider
   */
  async requestCatalog(request: CatalogRequest): Promise<unknown> {
    const payload = {
      '@context': EDC_CONTEXT,
      '@type': 'CatalogRequest',
      counterPartyAddress: request.counterPartyAddress,
      counterPartyId: request.counterPartyId,
      protocol: request.protocol ?? 'dataspace-protocol-http',
      querySpec: request.querySpec ?? { offset: 0, limit: 50 },
    };

    const response = await this.client.post('/catalog/request', payload);
    return response.data;
  }

  /**
   * Query cached catalogs from federated catalog
   */
  async queryCachedCatalog(querySpec?: { offset?: number; limit?: number }): Promise<unknown> {
    const catalogClient = axios.create({
      baseURL: config.edc.consumerCatalogUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.edc.apiKey,
      },
    });

    const payload = {
      '@context': EDC_CONTEXT,
      '@type': 'QuerySpec',
      ...querySpec,
    };

    const response = await catalogClient.post('/catalog/query', payload);
    return response.data;
  }

  /**
   * Initiate contract negotiation
   * 
   * Supports two modes:
   * 1. Direct policy: Pass a complete ODRL policy object
   * 2. Offer-based: Pass offer.offerId, offer.assetId, offer.policyId to build policy
   */
  async initiateNegotiation(request: ContractRequest): Promise<IdResponse> {
    // Build policy from offer if not provided directly
    let policy = request.policy;
    
    if (!policy && request.offer) {
      // Construct ODRL policy from offer details
      // The offerId from the catalog already contains the policy definition
      policy = {
        '@type': 'Offer',
        '@id': request.offer.offerId,
        assigner: request.providerId || request.counterPartyId,
        target: request.offer.assetId,
        permission: [
          {
            action: 'use',
            constraint: []
          }
        ]
      };
    }

    if (!policy) {
      throw new Error('Either policy or offer must be provided for contract negotiation');
    }

    const payload = {
      '@context': [...EDC_CONTEXT, ODRL_CONTEXT],
      '@type': 'ContractRequest',
      counterPartyAddress: request.counterPartyAddress,
      counterPartyId: request.counterPartyId,
      protocol: request.protocol ?? 'dataspace-protocol-http',
      policy: policy,
    };

    console.log('[EDC Client] Initiating negotiation with payload:', JSON.stringify(payload, null, 2));

    const response = await this.client.post('/contractnegotiations', payload);
    return response.data;
  }

  /**
   * Get negotiation by ID
   */
  async getNegotiation(negotiationId: string): Promise<NegotiationState> {
    const response = await this.client.get(`/contractnegotiations/${negotiationId}`);
    return response.data;
  }

  /**
   * Poll negotiation until terminal state
   */
  async pollNegotiation(
    negotiationId: string,
    maxWaitMs: number = config.timeouts.negotiationMaxWaitMs,
    _pollIntervalMs?: number  // Kept for API compatibility
  ): Promise<NegotiationState> {
    const startTime = Date.now();
    const pollInterval = _pollIntervalMs ?? config.timeouts.negotiationPollMs;

    while (Date.now() - startTime < maxWaitMs) {
      const state = await this.getNegotiation(negotiationId);
      
      if (state.state === 'FINALIZED' || state.state === 'TERMINATED') {
        return state;
      }

      await this.sleep(pollInterval);
    }

    throw new Error(`Negotiation ${negotiationId} did not complete within ${maxWaitMs}ms`);
  }

  /**
   * Query all negotiations
   */
  async queryNegotiations(querySpec?: { offset?: number; limit?: number }): Promise<NegotiationState[]> {
    const payload = {
      '@context': EDC_CONTEXT,
      '@type': 'QuerySpec',
      ...querySpec,
    };

    const response = await this.client.post('/contractnegotiations/request', payload);
    return response.data;
  }

  /**
   * Get contract agreement by ID
   */
  async getAgreement(agreementId: string): Promise<ContractAgreement> {
    const response = await this.client.get(`/contractagreements/${agreementId}`);
    return response.data;
  }

  /**
   * Initiate transfer process
   */
  async initiateTransfer(request: TransferRequest): Promise<IdResponse> {
    const payload = {
      '@context': EDC_CONTEXT,
      assetId: request.assetId,
      counterPartyAddress: request.counterPartyAddress,
      connectorId: request.connectorId,
      contractId: request.contractId,
      dataDestination: request.dataDestination,
      protocol: request.protocol ?? 'dataspace-protocol-http',
      transferType: request.transferType,
    };

    const response = await this.client.post('/transferprocesses', payload);
    return response.data;
  }

  /**
   * Get transfer process by ID
   */
  async getTransfer(transferId: string): Promise<TransferState> {
    const response = await this.client.get(`/transferprocesses/${transferId}`);
    return response.data;
  }

  /**
   * Poll transfer until started
   */
  async pollTransfer(
    transferId: string,
    maxWaitMs: number = config.timeouts.transferMaxWaitMs,
    _pollIntervalMs?: number  // Kept for API compatibility
  ): Promise<TransferState> {
    const startTime = Date.now();
    const pollInterval = _pollIntervalMs ?? config.timeouts.transferPollMs;

    while (Date.now() - startTime < maxWaitMs) {
      const state = await this.getTransfer(transferId);
      
      if (state.state === 'STARTED' || state.state === 'COMPLETED' || state.state === 'TERMINATED') {
        return state;
      }

      await this.sleep(pollInterval);
    }

    throw new Error(`Transfer ${transferId} did not start within ${maxWaitMs}ms`);
  }

  /**
   * Query all transfers
   */
  async queryTransfers(querySpec?: { offset?: number; limit?: number }): Promise<TransferState[]> {
    const payload = {
      '@context': EDC_CONTEXT,
      '@type': 'QuerySpec',
      ...querySpec,
    };

    const response = await this.client.post('/transferprocesses/request', payload);
    return response.data;
  }

  /**
   * Get EDR data address for a transfer
   */
  async getEdrDataAddress(transferId: string): Promise<EndpointDataReference> {
    const response = await this.client.get(`/edrs/${transferId}/dataaddress`);
    return response.data;
  }

  /**
   * Fetch data using EDR
   */
  async fetchDataViaEdr(edr: EndpointDataReference): Promise<unknown> {
    const response = await axios.get(edr.endpoint, {
      headers: {
        [edr.authKey]: edr.authCode,
      },
    });
    return response.data;
  }

  /**
   * Query assets
   */
  async queryAssets(querySpec?: { offset?: number; limit?: number }): Promise<unknown[]> {
    const payload = {
      '@context': EDC_CONTEXT,
      '@type': 'QuerySpec',
      ...querySpec,
    };

    const response = await this.client.post('/assets/request', payload);
    return response.data;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for consumer connector
export const edcConsumerClient = new EdcClient(config.edc.consumerManagementUrl);

// Provider client for asset management
export const edcProviderClient = new EdcClient(config.provider.managementUrl);

export function handleEdcError(error: unknown): { status: number; message: string } {
  console.error('[EDC Client Error]', error);
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string; [key: string]: unknown }>;
    const responseData = axiosError.response?.data;
    
    // Try to extract meaningful error message from EDC response
    let message = axiosError.message;
    if (responseData) {
      if (typeof responseData === 'string') {
        message = responseData;
      } else if (responseData.message) {
        message = responseData.message;
      } else if (responseData.error) {
        message = responseData.error;
      } else if (responseData['edc:errorDetail']) {
        message = responseData['edc:errorDetail'] as string;
      } else {
        // Log the full response for debugging
        console.error('[EDC Client] Full error response:', JSON.stringify(responseData, null, 2));
        message = JSON.stringify(responseData);
      }
    }
    
    return {
      status: axiosError.response?.status ?? 500,
      message: message,
    };
  }
  
  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }
  
  return { status: 500, message: 'Unknown error occurred' };
}
