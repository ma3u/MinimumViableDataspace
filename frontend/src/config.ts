/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * Frontend Configuration
 * 
 * Centralizes all environment-based configuration for the Health Dataspace demo.
 * Environment variables are prefixed with VITE_ to be exposed to the frontend.
 */

// API Mode: 'mock' | 'hybrid' | 'full'
export const API_MODE = import.meta.env.VITE_API_MODE ?? 'mock';

// Backend URLs
export const MOCK_API_URL = import.meta.env.VITE_MOCK_API_URL ?? 'http://localhost:3001';
export const EDC_API_URL = import.meta.env.VITE_EDC_API_URL ?? 'http://localhost:3002';
export const EHR_BACKEND_URL = import.meta.env.VITE_EHR_BACKEND_URL ?? MOCK_API_URL;
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? MOCK_API_URL;

// EDC Participant Configuration
export const PROVIDER_DID = import.meta.env.VITE_PROVIDER_DID ?? 'did:web:provider-identityhub%3A7083:api:identity';
export const CONSUMER_DID = import.meta.env.VITE_CONSUMER_DID ?? 'did:web:consumer-identityhub%3A7093:api:identity';
export const PROVIDER_DSP_URL = import.meta.env.VITE_PROVIDER_DSP_URL ?? 'http://localhost:8193/api/dsp';

// Debug mode
export const DEBUG = import.meta.env.VITE_DEBUG === 'true';

/**
 * Participant configuration derived from environment
 */
export const participantConfig = {
  provider: {
    did: PROVIDER_DID,
    dspUrl: PROVIDER_DSP_URL,
    name: 'Rheinland Klinikum',
    logo: '🏥',
    type: 'hospital' as const,
  },
  consumer: {
    did: CONSUMER_DID,
    name: 'Nordstein Research Institute',
    logo: '🔬',
    type: 'research-institution' as const,
  },
};

/**
 * Get the base URL for API calls based on current mode
 */
export function getApiBaseUrl(): string {
  switch (API_MODE) {
    case 'full':
    case 'hybrid':
      return EDC_API_URL;
    case 'mock':
    default:
      return MOCK_API_URL;
  }
}

/**
 * Check if we're in static demo mode (no backend)
 */
export function isStaticDemoMode(): boolean {
  return typeof window !== 'undefined' && 
    (window.location.hostname.includes('github.io') || 
     window.location.protocol === 'file:');
}

/**
 * Log configuration on startup (debug mode only)
 */
export function logConfig(): void {
  if (DEBUG) {
    console.log('[Config] API Mode:', API_MODE);
    console.log('[Config] Provider DID:', PROVIDER_DID);
    console.log('[Config] Consumer DID:', CONSUMER_DID);
    console.log('[Config] Provider DSP URL:', PROVIDER_DSP_URL);
    console.log('[Config] EDC API URL:', EDC_API_URL);
    console.log('[Config] Mock API URL:', MOCK_API_URL);
  }
}

export default {
  API_MODE,
  MOCK_API_URL,
  EDC_API_URL,
  PROVIDER_DID,
  CONSUMER_DID,
  PROVIDER_DSP_URL,
  DEBUG,
  participantConfig,
  getApiBaseUrl,
  isStaticDemoMode,
  logConfig,
};
