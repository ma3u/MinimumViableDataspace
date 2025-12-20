/**
 * Backend-EDC Configuration
 * 
 * Centralizes all configuration for the EDC-integrated backend.
 * Supports two modes:
 * - hybrid: Uses EDC for catalog/negotiation but fetches data from backend-mock
 * - full: Uses EDC for the complete data flow including transfer
 */

export type BackendMode = 'hybrid' | 'full';

export interface Config {
  // Server settings
  port: number;
  mode: BackendMode;
  
  // EDC Consumer Connector
  edc: {
    consumerManagementUrl: string;
    consumerCatalogUrl: string;
    consumerDspUrl: string;
    apiKey: string;
  };
  
  // EDC Provider Connector
  provider: {
    managementUrl: string;
    dspUrl: string;
    participantId: string;
  };
  
  // Backend Mock (for hybrid mode)
  backendMock: {
    url: string;
  };
  
  // Timeouts
  timeouts: {
    negotiationPollMs: number;
    negotiationMaxWaitMs: number;
    transferPollMs: number;
    transferMaxWaitMs: number;
  };
  
  // Logging
  logging: {
    level: string;
    format: 'json' | 'simple';
  };
}

function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function getEnvAsInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const config: Config = {
  port: getEnvAsInt('PORT', 3002),
  mode: (getEnvOrDefault('BACKEND_MODE', 'hybrid') as BackendMode),
  
  edc: {
    consumerManagementUrl: getEnvOrDefault(
      'EDC_CONSUMER_MANAGEMENT_URL',
      'http://localhost:8081/api/management/v3'
    ),
    consumerCatalogUrl: getEnvOrDefault(
      'EDC_CONSUMER_CATALOG_URL',
      'http://localhost:8084/api/catalog/v1alpha'
    ),
    consumerDspUrl: getEnvOrDefault(
      'EDC_CONSUMER_DSP_URL',
      'http://localhost:8082/api/dsp'
    ),
    apiKey: getEnvOrDefault('EDC_API_KEY', 'password'),
  },
  
  provider: {
    managementUrl: getEnvOrDefault(
      'EDC_PROVIDER_MANAGEMENT_URL',
      'http://localhost:8191/api/management/v3'
    ),
    dspUrl: getEnvOrDefault(
      'EDC_PROVIDER_DSP_URL',
      'http://localhost:8192/api/dsp'
    ),
    participantId: getEnvOrDefault(
      'EDC_PROVIDER_PARTICIPANT_ID',
      'did:web:localhost%3A7093'
    ),
  },
  
  backendMock: {
    url: getEnvOrDefault('BACKEND_MOCK_URL', 'http://localhost:3001'),
  },
  
  timeouts: {
    negotiationPollMs: getEnvAsInt('NEGOTIATION_POLL_MS', 1000),
    negotiationMaxWaitMs: getEnvAsInt('NEGOTIATION_MAX_WAIT_MS', 30000),
    transferPollMs: getEnvAsInt('TRANSFER_POLL_MS', 1000),
    transferMaxWaitMs: getEnvAsInt('TRANSFER_MAX_WAIT_MS', 60000),
  },
  
  logging: {
    level: getEnvOrDefault('LOG_LEVEL', 'info'),
    format: getEnvOrDefault('LOG_FORMAT', 'simple') as 'json' | 'simple',
  },
};

// EDC JSON-LD Context
export const EDC_CONTEXT = ['https://w3id.org/edc/connector/management/v0.0.1'];
export const ODRL_CONTEXT = 'http://www.w3.org/ns/odrl.jsonld';

// Log configuration on startup
export function logConfig(): void {
  console.log('='.repeat(60));
  console.log('Backend-EDC Configuration');
  console.log('='.repeat(60));
  console.log(`Mode: ${config.mode}`);
  console.log(`Port: ${config.port}`);
  console.log(`Consumer Management URL: ${config.edc.consumerManagementUrl}`);
  console.log(`Provider DSP URL: ${config.provider.dspUrl}`);
  console.log(`Provider Participant ID: ${config.provider.participantId}`);
  if (config.mode === 'hybrid') {
    console.log(`Backend Mock URL: ${config.backendMock.url} (used for data fetch)`);
  }
  console.log('='.repeat(60));
}
