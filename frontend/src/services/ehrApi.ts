/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import type { ElectronicHealthRecord } from '../types/health';

// Backend API configuration
const EHR_BACKEND_URL = import.meta.env.VITE_EHR_BACKEND_URL || 'http://localhost:3001';

// EDC API endpoints (for real dataspace operations)
const CONSUMER_API = '/consumer/api/management/v3';
const CONSUMER_CATALOG = '/consumer/catalog/v1alpha/catalog/query';

// EDC JSON-LD context
const EDC_CONTEXT = ['https://w3id.org/edc/connector/management/v0.0.1'];

// Provider configuration (for IntelliJ deployment)
const PROVIDER_ID = 'did:web:rheinland-uklinikum.de';
const PROVIDER_DSP_URL = 'http://localhost:8192';

// API client with default headers
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== BACKEND API (Direct EHR Access) ====================

/**
 * Fetch all available EHRs from the backend mock service
 */
export async function fetchAllEHRs(): Promise<ElectronicHealthRecord[]> {
  const response = await axios.get(`${EHR_BACKEND_URL}/api/ehr`);
  return response.data;
}

/**
 * Fetch a specific EHR by ID from the backend mock service
 */
export async function fetchEHRById(id: string): Promise<ElectronicHealthRecord> {
  // Extract the numeric part from asset:ehr:EHR001 -> EHR001
  const ehrId = id.replace('asset:ehr:', '');
  const response = await axios.get(`${EHR_BACKEND_URL}/api/ehr/${ehrId}`);
  return response.data;
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${EHR_BACKEND_URL}/health`);
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
}

// ==================== EDC CATALOG OPERATIONS ====================

export async function getCachedCatalog(): Promise<unknown[]> {
  const response = await apiClient.post(CONSUMER_CATALOG, {
    '@context': EDC_CONTEXT,
    '@type': 'QuerySpec',
  });
  return response.data;
}

export async function requestCatalog(counterPartyAddress: string, counterPartyId: string): Promise<unknown> {
  const response = await apiClient.post(`${CONSUMER_API}/catalog/request`, {
    '@context': EDC_CONTEXT,
    '@type': 'CatalogRequest',
    counterPartyAddress: `${counterPartyAddress}/api/dsp`,
    counterPartyId,
    protocol: 'dataspace-protocol-http',
    querySpec: {
      offset: 0,
      limit: 50,
    },
  });
  return response.data;
}

// ==================== CONTRACT NEGOTIATION ====================

export interface ContractNegotiation {
  '@id': string;
  state: string;
  contractAgreementId?: string;
}

export async function initiateNegotiation(
  assetId: string,
  policyId: string,
  obligation: unknown
): Promise<ContractNegotiation> {
  const response = await apiClient.post(`${CONSUMER_API}/contractnegotiations`, {
    '@context': EDC_CONTEXT,
    '@type': 'ContractRequest',
    counterPartyAddress: `${PROVIDER_DSP_URL}/api/dsp`,
    counterPartyId: PROVIDER_ID,
    protocol: 'dataspace-protocol-http',
    policy: {
      '@type': 'Offer',
      '@id': policyId,
      assigner: PROVIDER_ID,
      permission: [],
      prohibition: [{
        action: 'use',
        constraint: {
          leftOperand: 'DataAccess.reidentification',
          operator: 'eq',
          rightOperand: 'true',
        },
      }],
      obligation,
      target: assetId,
    },
    callbackAddresses: [],
  });
  return response.data;
}

export async function getNegotiations(): Promise<ContractNegotiation[]> {
  const response = await apiClient.post(`${CONSUMER_API}/contractnegotiations/request`, {
    '@context': EDC_CONTEXT,
    '@type': 'QuerySpec',
  });
  return response.data;
}

// ==================== TRANSFER PROCESS ====================

export interface TransferProcess {
  '@id': string;
  state: string;
}

export interface DataAddress {
  endpoint: string;
  authorization: string;
}

export async function initiateTransfer(
  assetId: string,
  contractId: string
): Promise<TransferProcess> {
  const response = await apiClient.post(`${CONSUMER_API}/transferprocesses`, {
    '@context': EDC_CONTEXT,
    assetId,
    counterPartyAddress: `${PROVIDER_DSP_URL}/api/dsp`,
    connectorId: PROVIDER_ID,
    contractId,
    dataDestination: {
      type: 'HttpProxy',
    },
    protocol: 'dataspace-protocol-http',
    transferType: 'HttpData-PULL',
  });
  return response.data;
}

export async function getTransferProcesses(): Promise<TransferProcess[]> {
  const response = await apiClient.post(`${CONSUMER_API}/transferprocesses/request`, {
    '@context': EDC_CONTEXT,
    '@type': 'QuerySpec',
  });
  return response.data;
}

export async function getEDRDataAddress(transferProcessId: string): Promise<DataAddress> {
  const response = await apiClient.get(`${CONSUMER_API}/edrs/${transferProcessId}/dataaddress`);
  return response.data;
}

// ==================== DATA FETCH VIA EDR ====================

export async function fetchEHRDataViaEDR(
  endpoint: string,
  authorization: string
): Promise<ElectronicHealthRecord> {
  // The endpoint from EDR might be internal, so we use the proxy
  const proxyEndpoint = endpoint.replace('http://localhost:11002', '/provider-public');
  
  const response = await axios.get(proxyEndpoint, {
    headers: {
      Authorization: authorization,
    },
  });
  return response.data;
}

// ==================== COMPLETE FLOW HELPER ====================

export interface TransferResult {
  negotiation: ContractNegotiation;
  transfer: TransferProcess;
  dataAddress: DataAddress;
  data: ElectronicHealthRecord;
}

export async function executeCompleteTransfer(
  assetId: string,
  policyId: string,
  obligation: unknown,
  onProgress?: (step: string, status: string) => void
): Promise<TransferResult> {
  // Step 1: Initiate negotiation
  onProgress?.('negotiation', 'starting');
  const negotiation = await initiateNegotiation(assetId, policyId, obligation);
  onProgress?.('negotiation', 'initiated');

  // Step 2: Wait for negotiation to complete
  let currentNegotiation = negotiation;
  let attempts = 0;
  const maxAttempts = 30;
  
  while (currentNegotiation.state !== 'FINALIZED' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const negotiations = await getNegotiations();
    currentNegotiation = negotiations.find(n => n['@id'] === negotiation['@id']) || currentNegotiation;
    onProgress?.('negotiation', currentNegotiation.state);
    attempts++;
    
    if (currentNegotiation.state === 'TERMINATED') {
      throw new Error('Contract negotiation was terminated - consent verification failed');
    }
  }

  if (currentNegotiation.state !== 'FINALIZED') {
    throw new Error('Contract negotiation timed out');
  }

  const contractAgreementId = currentNegotiation.contractAgreementId;
  if (!contractAgreementId) {
    throw new Error('No contract agreement ID received');
  }

  // Step 3: Initiate transfer
  onProgress?.('transfer', 'starting');
  const transfer = await initiateTransfer(assetId, contractAgreementId);
  onProgress?.('transfer', 'initiated');

  // Step 4: Wait for transfer to start
  let currentTransfer = transfer;
  attempts = 0;
  
  while (currentTransfer.state !== 'STARTED' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const transfers = await getTransferProcesses();
    currentTransfer = transfers.find(t => t['@id'] === transfer['@id']) || currentTransfer;
    onProgress?.('transfer', currentTransfer.state);
    attempts++;
    
    if (currentTransfer.state === 'TERMINATED') {
      throw new Error('Transfer process was terminated');
    }
  }

  if (currentTransfer.state !== 'STARTED') {
    throw new Error('Transfer process timed out');
  }

  // Step 5: Get EDR and fetch data
  onProgress?.('data', 'fetching');
  const dataAddress = await getEDRDataAddress(transfer['@id']);
  const data = await fetchEHRDataViaEDR(dataAddress.endpoint, dataAddress.authorization);
  onProgress?.('data', 'complete');

  return {
    negotiation: currentNegotiation,
    transfer: currentTransfer,
    dataAddress,
    data,
  };
}
