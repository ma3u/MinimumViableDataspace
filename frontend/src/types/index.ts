/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

// EDC Types
export interface Asset {
  '@id': string;
  '@type': string;
  properties: AssetProperties;
}

export interface DataAddressInfo {
  '@type': string;
  type: string;
  baseUrl: string;
}

export interface AssetProperties {
  name?: string;
  description?: string;
  contenttype?: string;
  'aerospace:partType'?: string;
  'aerospace:manufacturer'?: string;
  'aerospace:serialNumber'?: string;
  'aerospace:status'?: string;
  dataAddress?: DataAddressInfo;
  [key: string]: string | DataAddressInfo | undefined;
}

export interface Policy {
  '@id': string;
  '@type': string;
  permission?: PolicyRule[];
  prohibition?: PolicyRule[];
  obligation?: PolicyRule[];
}

export interface PolicyRule {
  action: string;
  constraint?: PolicyConstraint;
}

export interface PolicyConstraint {
  leftOperand: string;
  operator: string;
  rightOperand: string;
}

export interface CatalogDataset {
  '@id': string;
  '@type': string;
  'odrl:hasPolicy': {
    '@id': string;
    '@type': string;
    'odrl:permission': PolicyRule[];
    'odrl:prohibition': PolicyRule[];
    'odrl:obligation': PolicyRule | PolicyRule[];
  };
  description?: string;
  name?: string;
  [key: string]: unknown;
}

export interface Catalog {
  '@id': string;
  '@type': string;
  'dcat:dataset': CatalogDataset[];
  'dcat:service': {
    '@id': string;
    'dcat:endpointUrl': string;
  };
}

export interface ContractNegotiation {
  '@id': string;
  '@type': string;
  state: string;
  counterPartyId: string;
  counterPartyAddress: string;
  contractAgreementId?: string;
  createdAt: number;
}

export interface TransferProcess {
  '@id': string;
  '@type': string;
  state: string;
  stateTimestamp: number;
  assetId: string;
  contractId: string;
  correlationId: string;
}

export interface EDR {
  '@id': string;
  transferProcessId: string;
  agreementId: string;
  assetId: string;
  providerId: string;
  createdAt: number;
}

export interface DataAddress {
  '@type': string;
  endpoint: string;
  authType: string;
  authorization: string;
  endpointType: string;
}

// Digital Product Passport Types
export interface DigitalProductPassport {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: DPPCredentialSubject;
}

export interface DPPCredentialSubject {
  id: string;
  partType: string;
  sku: string;
  identityNode: IdentityNode;
  airworthinessNode: AirworthinessNode;
  sustainabilityNode: SustainabilityNode;
  operationalNode: OperationalNode;
  technicalSpecifications?: TechnicalSpecifications;
}

export interface IdentityNode {
  manufacturerName: string;
  cageCode: string;
  partNumber: string;
  serialNumber: string;
  batchNumber?: string;
  manufacturingDate?: string;
  manufacturingLocation?: string;
}

export interface AirworthinessNode {
  formType: string;
  formTrackingNumber: string;
  status: 'NEW' | 'OVERHAULED' | 'SERVICEABLE' | 'UNSERVICEABLE';
  certificationAuthority?: string;
  approvalDate?: string;
  expiryDate?: string;
  qualityStandards?: string[];
}

export interface SustainabilityNode {
  pcfValue: number;
  pcfUnit: string;
  scope: string;
  recyclableContent?: number;
  recyclableContentUnit?: string;
  materialComposition?: MaterialComposition[];
  energyConsumption?: {
    value: number;
    unit: string;
  };
}

export interface MaterialComposition {
  material: string;
  percentage: number;
}

export interface OperationalNode {
  timeSinceNew: number;
  cyclesSinceNew: number;
  timeSinceOverhaul?: number;
  cyclesSinceOverhaul?: number;
  maximumOperatingHours?: number;
  maximumCycles?: number;
  maintenanceSchedule?: string;
  history?: {
    date: string;
    hours: number;
    cycles: number;
  }[];
}

export interface TechnicalSpecifications {
  engineModel: string;
  stage: string;
  weight?: {
    value: number;
    unit: string;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  operatingTemperature?: {
    max: number;
    unit: string;
  };
}

// Application State Types
export type UserRole = 'provider' | 'consumer';

export interface AppState {
  role: UserRole;
  selectedAsset: CatalogDataset | null;
  negotiation: ContractNegotiation | null;
  transfer: TransferProcess | null;
  dppData: DigitalProductPassport | null;
}
