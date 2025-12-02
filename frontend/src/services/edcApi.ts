/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import type { 
  Asset, 
  ContractNegotiation, 
  TransferProcess, 
  DataAddress,
  DigitalProductPassport 
} from '../types';

const CONSUMER_API = '/consumer/api/management/v3';
const CONSUMER_CATALOG = '/consumer/catalog/v1alpha/catalog/query';
const PROVIDER_QNA_API = '/provider-qna/api/management/v3';

// EDC JSON-LD context
const EDC_CONTEXT = ['https://w3id.org/edc/connector/management/v0.0.1'];

// Provider configuration (for IntelliJ deployment)
const PROVIDER_ID = 'did:web:localhost%3A7093';
const PROVIDER_DSP_URL = 'http://localhost:8192';

// API client with default headers
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== CATALOG OPERATIONS ====================

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

// ==================== ASSET OPERATIONS ====================

export async function getProviderAssets(): Promise<Asset[]> {
  const response = await apiClient.post(`${PROVIDER_QNA_API}/assets/request`, {
    '@context': {
      '@vocab': 'https://w3id.org/edc/v0.0.1/ns/',
    },
    '@type': 'QuerySpec',
  });
  return response.data;
}

export async function getConsumerAssets(): Promise<Asset[]> {
  const response = await apiClient.post(`${CONSUMER_API}/assets/request`, {
    '@context': {
      '@vocab': 'https://w3id.org/edc/v0.0.1/ns/',
    },
    '@type': 'QuerySpec',
  });
  return response.data;
}

// ==================== CONTRACT NEGOTIATION ====================

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
      prohibition: [],
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

export async function getNegotiationById(id: string): Promise<ContractNegotiation> {
  const response = await apiClient.get(`${CONSUMER_API}/contractnegotiations/${id}`);
  return response.data;
}

// ==================== TRANSFER PROCESS ====================

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

export async function getTransferById(id: string): Promise<TransferProcess> {
  const response = await apiClient.get(`${CONSUMER_API}/transferprocesses/${id}`);
  return response.data;
}

// ==================== EDR (Endpoint Data Reference) ====================

export async function getEDRs(): Promise<unknown[]> {
  const response = await apiClient.post(`${CONSUMER_API}/edrs/request`, {
    '@context': EDC_CONTEXT,
    '@type': 'QuerySpec',
  });
  return response.data;
}

export async function getEDRDataAddress(transferProcessId: string): Promise<DataAddress> {
  const response = await apiClient.get(`${CONSUMER_API}/edrs/${transferProcessId}/dataaddress`);
  return response.data;
}

// ==================== DATA FETCH ====================

export async function fetchDPPData(
  endpoint: string,
  authorization: string
): Promise<DigitalProductPassport> {
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
  data: DigitalProductPassport;
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
      throw new Error('Contract negotiation was terminated');
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
  const data = await fetchDPPData(dataAddress.endpoint, dataAddress.authorization);
  onProgress?.('data', 'complete');

  return {
    negotiation: currentNegotiation,
    transfer: currentTransfer,
    dataAddress,
    data,
  };
}
