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
  protocol?: string;
  policy: {
    '@type': string;
    '@id': string;
    assigner: string;
    target: string;
    permission?: unknown[];
    prohibition?: unknown[];
    obligation?: unknown;
  };
}

export interface TransferRequest {
  assetId: string;
  counterPartyAddress: string;
  connectorId: string;
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
}

export interface TransferState {
  '@id': string;
  '@type': string;
  state: string;
  assetId: string;
  contractId: string;
  transferType: string;
  createdAt: number;
}

export interface EndpointDataReference {
  '@type': string;
  id: string;
  endpoint: string;
  authKey: string;
  authCode: string;
  properties?: Record<string, unknown>;
}

export interface IdResponse {
  '@id': string;
  createdAt?: number;
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
   */
  async initiateNegotiation(request: ContractRequest): Promise<IdResponse> {
    const payload = {
      '@context': [...EDC_CONTEXT, ODRL_CONTEXT],
      '@type': 'ContractRequest',
      counterPartyAddress: request.counterPartyAddress,
      counterPartyId: request.counterPartyId,
      protocol: request.protocol ?? 'dataspace-protocol-http',
      policy: request.policy,
    };

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
    maxWaitMs: number = config.timeouts.negotiationMaxWaitMs
  ): Promise<NegotiationState> {
    const startTime = Date.now();
    const pollInterval = config.timeouts.negotiationPollMs;

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
    maxWaitMs: number = config.timeouts.transferMaxWaitMs
  ): Promise<TransferState> {
    const startTime = Date.now();
    const pollInterval = config.timeouts.transferPollMs;

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
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      status: axiosError.response?.status ?? 500,
      message: axiosError.response?.data?.message ?? axiosError.message,
    };
  }
  
  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }
  
  return { status: 500, message: 'Unknown error occurred' };
}
