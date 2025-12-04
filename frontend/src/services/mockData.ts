/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import type { DigitalProductPassport } from '../types';

// ============================================================================
// MOCK CATALOG DATA - Simulates DSP Catalog Protocol Response
// ============================================================================

export const mockCatalogAssets = [
  {
    '@id': 'asset:dpp:RR001',
    '@type': 'dcat:Dataset',
    'dct:title': 'HP Turbine Blade',
    'dct:description': 'Digital Product Passport for Rolls-Royce Trent XWB High-Pressure Turbine Blade',
    'dcat:keyword': ['turbine', 'blade', 'aerospace', 'DPP'],
    'dct:creator': 'did:web:rolls-royce.com',
    'aerospace:partType': 'HighPressureTurbineBlade',
    'aerospace:serialNumber': 'SN-HPT-78001',
    'aerospace:status': 'NEW',
    'odrl:hasPolicy': {
      '@id': 'policy:aerospace-dpp-contract:RR001',
      '@type': 'odrl:Offer',
      'odrl:permission': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'MembershipCredential',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'active'
        }
      }],
      'odrl:obligation': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'DataAccess.level',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'processing'
        }
      }]
    }
  },
  {
    '@id': 'asset:dpp:RR002',
    '@type': 'dcat:Dataset',
    'dct:title': 'HP Compressor Blade',
    'dct:description': 'Digital Product Passport for Rolls-Royce Trent XWB High-Pressure Compressor Blade',
    'dcat:keyword': ['compressor', 'blade', 'aerospace', 'DPP'],
    'dct:creator': 'did:web:rolls-royce.com',
    'aerospace:partType': 'HighPressureCompressorBlade',
    'aerospace:serialNumber': 'SN-HPC-78002',
    'aerospace:status': 'NEW',
    'odrl:hasPolicy': {
      '@id': 'policy:aerospace-dpp-contract:RR002',
      '@type': 'odrl:Offer',
      'odrl:permission': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'MembershipCredential',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'active'
        }
      }],
      'odrl:obligation': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'DataAccess.level',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'processing'
        }
      }]
    }
  },
  {
    '@id': 'asset:dpp:RR003',
    '@type': 'dcat:Dataset',
    'dct:title': 'Combustor Liner',
    'dct:description': 'Digital Product Passport for Rolls-Royce Trent XWB Combustor Liner',
    'dcat:keyword': ['combustor', 'liner', 'aerospace', 'DPP'],
    'dct:creator': 'did:web:rolls-royce.com',
    'aerospace:partType': 'CombustorLiner',
    'aerospace:serialNumber': 'SN-CMB-78003',
    'aerospace:status': 'OVERHAULED',
    'odrl:hasPolicy': {
      '@id': 'policy:aerospace-dpp-contract:RR003',
      '@type': 'odrl:Offer',
      'odrl:permission': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'MembershipCredential',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'active'
        }
      }],
      'odrl:obligation': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'DataAccess.level',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'processing'
        }
      }]
    }
  },
  {
    '@id': 'asset:dpp:RR004',
    '@type': 'dcat:Dataset',
    'dct:title': 'Fan Blade',
    'dct:description': 'Digital Product Passport for Rolls-Royce Trent XWB Carbon Fiber Fan Blade',
    'dcat:keyword': ['fan', 'blade', 'carbon fiber', 'aerospace', 'DPP'],
    'dct:creator': 'did:web:rolls-royce.com',
    'aerospace:partType': 'FanBlade',
    'aerospace:serialNumber': 'SN-FAN-78004',
    'aerospace:status': 'NEW',
    'odrl:hasPolicy': {
      '@id': 'policy:aerospace-dpp-contract:RR004',
      '@type': 'odrl:Offer',
      'odrl:permission': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'MembershipCredential',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'active'
        }
      }],
      'odrl:obligation': [{
        'odrl:action': 'use',
        'odrl:constraint': {
          'odrl:leftOperand': 'DataAccess.level',
          'odrl:operator': 'eq',
          'odrl:rightOperand': 'processing'
        }
      }]
    }
  }
];

// ============================================================================
// MOCK NEGOTIATION STATES - Simulates DSP Contract Negotiation Protocol
// ============================================================================

export interface NegotiationState {
  '@id': string;
  '@type': string;
  'dspace:state': 'REQUESTED' | 'OFFERED' | 'ACCEPTED' | 'AGREED' | 'VERIFIED' | 'FINALIZED' | 'TERMINATED';
  'dspace:consumerPid': string;
  'dspace:providerPid': string;
  timestamp: string;
}

export const mockNegotiationFlow: NegotiationState[] = [
  {
    '@id': 'urn:uuid:negotiation-001',
    '@type': 'dspace:ContractNegotiation',
    'dspace:state': 'REQUESTED',
    'dspace:consumerPid': 'urn:uuid:consumer-process-001',
    'dspace:providerPid': 'urn:uuid:provider-process-001',
    timestamp: new Date().toISOString()
  },
  {
    '@id': 'urn:uuid:negotiation-001',
    '@type': 'dspace:ContractNegotiation',
    'dspace:state': 'OFFERED',
    'dspace:consumerPid': 'urn:uuid:consumer-process-001',
    'dspace:providerPid': 'urn:uuid:provider-process-001',
    timestamp: new Date().toISOString()
  },
  {
    '@id': 'urn:uuid:negotiation-001',
    '@type': 'dspace:ContractNegotiation',
    'dspace:state': 'ACCEPTED',
    'dspace:consumerPid': 'urn:uuid:consumer-process-001',
    'dspace:providerPid': 'urn:uuid:provider-process-001',
    timestamp: new Date().toISOString()
  },
  {
    '@id': 'urn:uuid:negotiation-001',
    '@type': 'dspace:ContractNegotiation',
    'dspace:state': 'AGREED',
    'dspace:consumerPid': 'urn:uuid:consumer-process-001',
    'dspace:providerPid': 'urn:uuid:provider-process-001',
    timestamp: new Date().toISOString()
  },
  {
    '@id': 'urn:uuid:negotiation-001',
    '@type': 'dspace:ContractNegotiation',
    'dspace:state': 'VERIFIED',
    'dspace:consumerPid': 'urn:uuid:consumer-process-001',
    'dspace:providerPid': 'urn:uuid:provider-process-001',
    timestamp: new Date().toISOString()
  },
  {
    '@id': 'urn:uuid:negotiation-001',
    '@type': 'dspace:ContractNegotiation',
    'dspace:state': 'FINALIZED',
    'dspace:consumerPid': 'urn:uuid:consumer-process-001',
    'dspace:providerPid': 'urn:uuid:provider-process-001',
    timestamp: new Date().toISOString()
  }
];

// ============================================================================
// MOCK TRANSFER STATES - Simulates DSP Transfer Process Protocol
// ============================================================================

export interface TransferState {
  '@id': string;
  '@type': string;
  'dspace:state': 'REQUESTED' | 'STARTED' | 'SUSPENDED' | 'COMPLETED' | 'TERMINATED';
  'dspace:consumerPid': string;
  'dspace:providerPid': string;
  timestamp: string;
}

export const mockTransferFlow: TransferState[] = [
  {
    '@id': 'urn:uuid:transfer-001',
    '@type': 'dspace:TransferProcess',
    'dspace:state': 'REQUESTED',
    'dspace:consumerPid': 'urn:uuid:consumer-transfer-001',
    'dspace:providerPid': 'urn:uuid:provider-transfer-001',
    timestamp: new Date().toISOString()
  },
  {
    '@id': 'urn:uuid:transfer-001',
    '@type': 'dspace:TransferProcess',
    'dspace:state': 'STARTED',
    'dspace:consumerPid': 'urn:uuid:consumer-transfer-001',
    'dspace:providerPid': 'urn:uuid:provider-transfer-001',
    timestamp: new Date().toISOString()
  },
  {
    '@id': 'urn:uuid:transfer-001',
    '@type': 'dspace:TransferProcess',
    'dspace:state': 'COMPLETED',
    'dspace:consumerPid': 'urn:uuid:consumer-transfer-001',
    'dspace:providerPid': 'urn:uuid:provider-transfer-001',
    timestamp: new Date().toISOString()
  }
];

// ============================================================================
// MOCK DPP DATA - Sample Digital Product Passport
// ============================================================================

export const mockDPPData: Record<string, DigitalProductPassport> = {
  'asset:dpp:RR001': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/aerospace/dpp/v1'],
    id: 'did:web:rolls-royce.com:parts:RR001',
    type: ['VerifiableCredential', 'AerospacePartPassport'],
    issuer: 'did:web:rolls-royce.com',
    issuanceDate: '2025-10-01T10:00:00Z',
    credentialSubject: {
      id: 'did:web:rolls-royce.com:parts:RR001',
      partType: 'HighPressureTurbineBlade',
      sku: 'RR-TXWB-HPT-001',
      identityNode: {
        manufacturerName: 'Rolls-Royce plc',
        cageCode: 'K1039',
        partNumber: 'HPT-BLD-001',
        serialNumber: 'SN-HPT-78001',
        batchNumber: 'BATCH-2025-HPT-01',
        manufacturingDate: '2025-09-15',
        manufacturingLocation: 'Derby, United Kingdom'
      },
      airworthinessNode: {
        formType: 'EASA_FORM_1',
        formTrackingNumber: 'RR-2025-HPT-001',
        status: 'NEW',
        certificationAuthority: 'EASA',
        qualityStandards: ['AS9100D', 'ISO9001:2015']
      },
      sustainabilityNode: {
        pcfValue: 45.2,
        pcfUnit: 'kgCO2e',
        scope: 'Cradle-to-Gate',
        recyclableContent: 15,
        materialComposition: [
          { material: 'Nickel Superalloy', percentage: 85 },
          { material: 'Thermal Barrier Coating', percentage: 15 }
        ]
      },
      operationalNode: {
        timeSinceNew: 1250,
        cyclesSinceNew: 450,
        maximumOperatingHours: 25000,
        maximumCycles: 15000,
        history: [
          { date: '2025-01', hours: 100, cycles: 40 },
          { date: '2025-02', hours: 250, cycles: 90 },
          { date: '2025-03', hours: 400, cycles: 150 },
          { date: '2025-04', hours: 600, cycles: 220 },
          { date: '2025-05', hours: 850, cycles: 310 },
          { date: '2025-06', hours: 1050, cycles: 380 },
          { date: '2025-07', hours: 1250, cycles: 450 }
        ]
      },
      technicalSpecifications: {
        engineModel: 'Trent XWB-97',
        stage: 'HP Turbine Stage 1',
        weight: { value: 0.85, unit: 'kg' },
        operatingTemperature: { max: 1700, unit: '°C' }
      }
    }
  },
  'asset:dpp:RR002': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/aerospace/dpp/v1'],
    id: 'did:web:rolls-royce.com:parts:RR002',
    type: ['VerifiableCredential', 'AerospacePartPassport'],
    issuer: 'did:web:rolls-royce.com',
    issuanceDate: '2025-10-02T11:00:00Z',
    credentialSubject: {
      id: 'did:web:rolls-royce.com:parts:RR002',
      partType: 'HighPressureCompressorBlade',
      sku: 'RR-TXWB-HPC-001',
      identityNode: {
        manufacturerName: 'Rolls-Royce plc',
        cageCode: 'K1039',
        partNumber: 'HPC-BLD-001',
        serialNumber: 'SN-HPC-78002',
        manufacturingDate: '2025-09-16',
        manufacturingLocation: 'Derby, United Kingdom'
      },
      airworthinessNode: {
        formType: 'EASA_FORM_1',
        formTrackingNumber: 'RR-2025-HPC-001',
        status: 'NEW',
        certificationAuthority: 'EASA'
      },
      sustainabilityNode: {
        pcfValue: 32.1,
        pcfUnit: 'kgCO2e',
        scope: 'Cradle-to-Gate',
        materialComposition: [
          { material: 'Titanium Alloy', percentage: 95 },
          { material: 'Coating', percentage: 5 }
        ]
      },
      operationalNode: {
        timeSinceNew: 3400,
        cyclesSinceNew: 1200,
        maximumOperatingHours: 30000,
        maximumCycles: 20000,
        history: [
          { date: '2025-01', hours: 500, cycles: 180 },
          { date: '2025-02', hours: 950, cycles: 340 },
          { date: '2025-03', hours: 1400, cycles: 500 },
          { date: '2025-04', hours: 1900, cycles: 680 },
          { date: '2025-05', hours: 2400, cycles: 850 },
          { date: '2025-06', hours: 2900, cycles: 1020 },
          { date: '2025-07', hours: 3400, cycles: 1200 }
        ]
      },
      technicalSpecifications: {
        engineModel: 'Trent XWB-97',
        stage: 'HP Compressor Stage 6',
        weight: { value: 0.45, unit: 'kg' }
      }
    }
  },
  'asset:dpp:RR003': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/aerospace/dpp/v1'],
    id: 'did:web:rolls-royce.com:parts:RR003',
    type: ['VerifiableCredential', 'AerospacePartPassport'],
    issuer: 'did:web:rolls-royce.com',
    issuanceDate: '2025-10-03T09:00:00Z',
    credentialSubject: {
      id: 'did:web:rolls-royce.com:parts:RR003',
      partType: 'CombustorLiner',
      sku: 'RR-TXWB-CMB-001',
      identityNode: {
        manufacturerName: 'Rolls-Royce plc',
        cageCode: 'K1039',
        partNumber: 'CMB-LNR-001',
        serialNumber: 'SN-CMB-78003',
        manufacturingDate: '2025-08-20',
        manufacturingLocation: 'Derby, United Kingdom'
      },
      airworthinessNode: {
        formType: 'EASA_FORM_1',
        formTrackingNumber: 'RR-2025-CMB-001',
        status: 'OVERHAULED',
        certificationAuthority: 'EASA'
      },
      sustainabilityNode: {
        pcfValue: 78.5,
        pcfUnit: 'kgCO2e',
        scope: 'Cradle-to-Gate',
        materialComposition: [
          { material: 'Hastelloy X', percentage: 90 },
          { material: 'Thermal Coating', percentage: 10 }
        ]
      },
      operationalNode: {
        timeSinceNew: 5000,
        cyclesSinceNew: 2500,
        timeSinceOverhaul: 1500,
        cyclesSinceOverhaul: 600,
        maximumOperatingHours: 20000,
        maximumCycles: 10000,
        history: [
          { date: '2025-01', hours: 3500, cycles: 1900 },
          { date: '2025-02', hours: 3800, cycles: 2000 },
          { date: '2025-03', hours: 4100, cycles: 2150 },
          { date: '2025-04', hours: 4400, cycles: 2280 },
          { date: '2025-05', hours: 4700, cycles: 2390 },
          { date: '2025-06', hours: 4900, cycles: 2450 },
          { date: '2025-07', hours: 5000, cycles: 2500 }
        ]
      },
      technicalSpecifications: {
        engineModel: 'Trent XWB-97',
        stage: 'Combustor',
        weight: { value: 12.5, unit: 'kg' },
        operatingTemperature: { max: 2000, unit: '°C' }
      }
    }
  },
  'asset:dpp:RR004': {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/aerospace/dpp/v1'],
    id: 'did:web:rolls-royce.com:parts:RR004',
    type: ['VerifiableCredential', 'AerospacePartPassport'],
    issuer: 'did:web:rolls-royce.com',
    issuanceDate: '2025-10-04T08:00:00Z',
    credentialSubject: {
      id: 'did:web:rolls-royce.com:parts:RR004',
      partType: 'FanBlade',
      sku: 'RR-TXWB-FAN-001',
      identityNode: {
        manufacturerName: 'Rolls-Royce plc',
        cageCode: 'K1039',
        partNumber: 'FAN-BLD-001',
        serialNumber: 'SN-FAN-78004',
        manufacturingDate: '2025-09-01',
        manufacturingLocation: 'Derby, United Kingdom'
      },
      airworthinessNode: {
        formType: 'EASA_FORM_1',
        formTrackingNumber: 'RR-2025-FAN-001',
        status: 'NEW',
        certificationAuthority: 'EASA'
      },
      sustainabilityNode: {
        pcfValue: 125.0,
        pcfUnit: 'kgCO2e',
        scope: 'Cradle-to-Gate',
        materialComposition: [
          { material: 'Carbon Fiber Composite', percentage: 70 },
          { material: 'Titanium Leading Edge', percentage: 30 }
        ]
      },
      operationalNode: {
        timeSinceNew: 850,
        cyclesSinceNew: 180,
        maximumOperatingHours: 40000,
        maximumCycles: 25000,
        history: [
          { date: '2025-01', hours: 120, cycles: 25 },
          { date: '2025-02', hours: 250, cycles: 50 },
          { date: '2025-03', hours: 380, cycles: 80 },
          { date: '2025-04', hours: 510, cycles: 110 },
          { date: '2025-05', hours: 640, cycles: 135 },
          { date: '2025-06', hours: 750, cycles: 160 },
          { date: '2025-07', hours: 850, cycles: 180 }
        ]
      },
      technicalSpecifications: {
        engineModel: 'Trent XWB-97',
        stage: 'Fan',
        weight: { value: 22.0, unit: 'kg' }
      }
    }
  }
};

// ============================================================================
// DSP PROTOCOL MESSAGE EXAMPLES - For educational display
// ============================================================================

export const dspMessages = {
  catalogRequest: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dspace:CatalogRequestMessage',
    'dspace:filter': {
      '@type': 'dspace:QuerySpec',
      'dspace:filterExpression': []
    }
  },
  
  catalogResponse: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dcat:Catalog',
    '@id': 'urn:uuid:catalog-001',
    'dcat:dataset': '... (array of datasets)',
    'dcat:service': {
      '@type': 'dcat:DataService',
      'dcat:endpointUrl': 'https://provider.example/dsp'
    }
  },

  contractRequestMessage: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dspace:ContractRequestMessage',
    'dspace:consumerPid': 'urn:uuid:consumer-process-001',
    'dspace:offer': {
      '@type': 'odrl:Offer',
      '@id': 'urn:uuid:offer-001',
      'odrl:target': 'asset:dpp:RR001'
    },
    'dspace:callbackAddress': 'https://consumer.example/callback'
  },

  contractOfferMessage: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dspace:ContractOfferMessage',
    'dspace:providerPid': 'urn:uuid:provider-process-001',
    'dspace:consumerPid': 'urn:uuid:consumer-process-001',
    'dspace:offer': {
      '@type': 'odrl:Offer',
      '@id': 'urn:uuid:offer-001'
    },
    'dspace:callbackAddress': 'https://provider.example/callback'
  },

  contractAgreementMessage: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dspace:ContractAgreementMessage',
    'dspace:providerPid': 'urn:uuid:provider-process-001',
    'dspace:consumerPid': 'urn:uuid:consumer-process-001',
    'dspace:agreement': {
      '@type': 'odrl:Agreement',
      '@id': 'urn:uuid:agreement-001',
      'odrl:target': 'asset:dpp:RR001',
      'dspace:timestamp': '2025-12-04T08:00:00Z'
    },
    'dspace:callbackAddress': 'https://provider.example/callback'
  },

  transferRequestMessage: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dspace:TransferRequestMessage',
    'dspace:consumerPid': 'urn:uuid:consumer-transfer-001',
    'dspace:agreementId': 'urn:uuid:agreement-001',
    'dct:format': 'HttpData-PULL',
    'dspace:callbackAddress': 'https://consumer.example/callback'
  },

  transferStartMessage: {
    '@context': 'https://w3id.org/dspace/2025/1/context.json',
    '@type': 'dspace:TransferStartMessage',
    'dspace:providerPid': 'urn:uuid:provider-transfer-001',
    'dspace:consumerPid': 'urn:uuid:consumer-transfer-001',
    'dspace:dataAddress': {
      '@type': 'dspace:DataAddress',
      'dspace:endpointType': 'https://w3id.org/idsa/v4.1/HTTP',
      'dspace:endpoint': 'https://provider.example/public/data',
      'dspace:endpointProperties': [
        { '@type': 'dspace:EndpointProperty', 'dspace:name': 'authorization', 'dspace:value': 'Bearer ...' }
      ]
    }
  }
};

// ============================================================================
// PARTICIPANT INFORMATION - For the demo scenario
// ============================================================================

export const participants = {
  provider: {
    name: 'Rolls-Royce plc',
    role: 'Data Provider',
    did: 'did:web:rolls-royce.com',
    description: 'Engine OEM providing Digital Product Passports for aerospace components',
    logo: '🏭',
    connectorEndpoint: 'https://provider.rolls-royce.com/dsp'
  },
  consumer: {
    name: 'Airbus SE',
    role: 'Data Consumer',
    did: 'did:web:airbus.com',
    description: 'Airframe OEM consuming DPP data for Skywise fleet management',
    logo: '✈️',
    connectorEndpoint: 'https://consumer.airbus.com/dsp'
  }
};

// ============================================================================
// DSP PROTOCOL PHASES - Educational content
// ============================================================================

export const dspPhases = {
  catalog: {
    title: 'Catalog Protocol',
    description: 'The Catalog Protocol defines how a Consumer discovers data offerings from a Provider. The Consumer sends a CatalogRequestMessage and receives a DCAT Catalog containing available datasets and their usage policies.',
    specLink: 'https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#catalog-protocol',
    steps: [
      { name: 'CatalogRequestMessage', direction: 'Consumer → Provider', description: 'Consumer requests the catalog' },
      { name: 'dcat:Catalog', direction: 'Provider → Consumer', description: 'Provider responds with available datasets' }
    ]
  },
  negotiation: {
    title: 'Contract Negotiation Protocol',
    description: 'The Contract Negotiation Protocol defines how a Consumer and Provider negotiate a usage agreement. The protocol uses a state machine with states: REQUESTED, OFFERED, ACCEPTED, AGREED, VERIFIED, and FINALIZED.',
    specLink: 'https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#negotiation-protocol',
    steps: [
      { name: 'ContractRequestMessage', direction: 'Consumer → Provider', description: 'Consumer requests contract based on offer' },
      { name: 'ContractOfferMessage', direction: 'Provider → Consumer', description: 'Provider sends formal offer' },
      { name: 'ContractNegotiationEventMessage (ACCEPTED)', direction: 'Consumer → Provider', description: 'Consumer accepts the offer' },
      { name: 'ContractAgreementMessage', direction: 'Provider → Consumer', description: 'Provider confirms agreement' },
      { name: 'ContractAgreementVerificationMessage', direction: 'Consumer → Provider', description: 'Consumer verifies agreement' },
      { name: 'ContractNegotiationEventMessage (FINALIZED)', direction: 'Provider → Consumer', description: 'Negotiation complete' }
    ]
  },
  transfer: {
    title: 'Transfer Process Protocol',
    description: 'The Transfer Process Protocol defines how data is transferred after a contract is agreed. It supports both PUSH and PULL transfer types. The protocol uses states: REQUESTED, STARTED, SUSPENDED, COMPLETED, and TERMINATED.',
    specLink: 'https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#transfer-protocol',
    steps: [
      { name: 'TransferRequestMessage', direction: 'Consumer → Provider', description: 'Consumer requests data transfer' },
      { name: 'TransferStartMessage', direction: 'Provider → Consumer', description: 'Provider starts transfer with data address' },
      { name: 'Data Transfer', direction: 'Provider → Consumer', description: 'Actual data is transferred (HTTP PULL)' },
      { name: 'TransferCompletionMessage', direction: 'Consumer → Provider', description: 'Consumer confirms receipt' }
    ]
  }
};
