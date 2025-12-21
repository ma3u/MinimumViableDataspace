/**
 * Data Fetcher Service
 * 
 * Handles data retrieval in both hybrid and full modes:
 * - hybrid: Fetches data directly from backend-mock after EDC negotiation/transfer
 * - full: Fetches data via EDR from EDC data plane
 */

import axios from 'axios';
import { config } from '../config.js';
import { edcConsumerClient, EndpointDataReference } from './edcClient.js';

export interface EHRRecord {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate?: string;
  credentialSubject: Record<string, unknown>;
}

export interface FetchResult {
  data: EHRRecord;
  source: 'edc' | 'mock';
  transferId?: string;
  fetchTimeMs: number;
  fromCache?: boolean;
}

export class DataFetcher {
  /**
   * Fetch EHR data based on current backend mode
   */
  async fetch(
    ehrId: string,
    transferId?: string,
    mode: 'hybrid' | 'full' = config.mode
  ): Promise<FetchResult> {
    const startTime = Date.now();

    if (mode === 'hybrid') {
      const data = await this.fetchViaMock(ehrId);
      return {
        data,
        source: 'mock',
        transferId,
        fetchTimeMs: Date.now() - startTime,
      };
    }

    // Full mode: fetch via EDC
    if (!transferId) {
      throw new Error('Transfer ID required for full mode data fetch');
    }

    const data = await this.fetchViaEdc(transferId);
    return {
      data,
      source: 'edc',
      transferId,
      fetchTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Fetch EHR data directly from backend-mock
   */
  async fetchViaMock(ehrId: string): Promise<EHRRecord> {
    // Extract just the EHR ID if full asset ID is provided
    const cleanId = ehrId.replace(/^asset:ehr:/, '').replace(/^ehr:/, '');
    
    const url = `${config.backendMock.url}/api/ehr/${cleanId}`;
    const response = await axios.get<EHRRecord>(url, {
      timeout: 10000,
    });
    
    return response.data;
  }

  /**
   * Fetch EHR data via EDC transfer (using EDR)
   */
  async fetchViaEdc(transferId: string): Promise<EHRRecord> {
    // Get the EDR (Endpoint Data Reference)
    const edr = await edcConsumerClient.getEdrDataAddress(transferId);
    
    // Validate EDR
    if (!edr.endpoint || !edr.authKey || !edr.authCode) {
      throw new Error(`Invalid EDR for transfer ${transferId}: missing endpoint or auth`);
    }

    // Fetch data using EDR credentials
    const data = await edcConsumerClient.fetchDataViaEdr(edr);
    return data as EHRRecord;
  }

  /**
   * Get EDR details without fetching data (useful for debugging)
   */
  async getEdrDetails(transferId: string): Promise<EndpointDataReference> {
    return edcConsumerClient.getEdrDataAddress(transferId);
  }

  /**
   * Check if backend-mock is healthy
   */
  async checkMockHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${config.backendMock.url}/health`, {
        timeout: 5000,
      });
      return response.data?.status === 'healthy';
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const dataFetcher = new DataFetcher();
