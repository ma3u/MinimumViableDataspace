/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ArrowRight,
  CheckCircle,
  Loader2,
  BookOpen,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Play,
  RotateCcw,
  Code,
  Shield,
  Send,
  Github,
  Lock,
  Stethoscope,
  Search,
  FileJson,
  AlertCircle,
  Download
} from 'lucide-react';
import { EHRViewer } from './components/EHRViewer';
import { DataspaceInsiderPanel, DataspaceInsiderTrigger } from './components/DataspaceInsiderPanel';
import { CatalogCard } from './components/CatalogCard';
import { CollapsibleSection } from './components/CollapsibleSection';
import { DspEventLogProvider, useDspEventLog } from './contexts/DspEventLogContext';
import { downloadHealthDCATAP } from './services/HealthDCATAPSerializer';
import { api, getApiMode, isStaticDemo } from './services/apiFactory';
import type { CatalogAsset } from './services/apiFactory';
import { useCatalog } from './hooks/useCatalog';
import { participantConfig as _participantConfig, logConfig, DEBUG as _DEBUG } from './config';
import { ErrorBoundary, DebugPanel } from './components/observability';
import { 
  mockEHRCatalogAssets, 
  mockEHRData, 
  healthDspPhases,
  healthDspMessages,
  healthParticipants,
  mockNegotiationFlow,
  mockTransferFlow,
  mockComputeFlow,
  medicalCategories,
  categoryBackgrounds,
  consentPurposes,
  consentRestrictions,
  sponsorTypes,
  emaTherapeuticAreas,
  memberStateFlags
} from './services/mockData-health';
import { fetchEHRById, checkBackendHealth } from './services/ehrApi';
import type { ElectronicHealthRecord } from './types/health';

// Log configuration on startup
logConfig();

// GitHub repository URL
const GITHUB_REPO_URL = 'https://github.com/ma3u/MinimumViableDataspace/tree/health-demo';

type DemoPhase = 'intro' | 'catalog' | 'negotiation' | 'transfer' | 'compute' | 'complete';

interface MockEHRAsset {
  '@id': string;
  'dct:title': string;
  'dct:description': string;
  'healthdcatap:icdCode': string;
  'healthdcatap:diagnosis': string;
  'healthdcatap:category': string;
  'healthdcatap:ageRange': string;
  'healthdcatap:biologicalSex': string;
  'healthdcatap:consentStatus': string;
  'healthdcatap:sensitiveCategory'?: string;
  'healthdcatap:clinicalTrialPhase'?: string;
  // EU CTR 536/2014 Fields
  'healthdcatap:euCtNumber'?: string;
  'healthdcatap:sponsor'?: {
    name: string;
    type: 'commercial' | 'academic' | 'non-profit';
    country: string;
  };
  'healthdcatap:therapeuticArea'?: {
    code: string;
    name: string;
  };
  'healthdcatap:memberStates'?: string[];
  'healthdcatap:medDRA'?: {
    socCode: string;
    socName: string;
    ptCode: string;
    ptName: string;
  };
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
}

// Type guard to check if asset is a MockEHRAsset
function isMockEHRAsset(asset: CatalogAsset | MockEHRAsset | null): asset is MockEHRAsset {
  return asset !== null && 'healthdcatap:category' in asset;
}

// Helper to get MockEHRAsset properties safely
function getMockAsset(asset: CatalogAsset | MockEHRAsset | null): MockEHRAsset | null {
  return isMockEHRAsset(asset) ? asset : null;
}

function AppHealth() {
  const [phase, setPhase] = useState<DemoPhase>('intro');
  // Protocol Phases hover effect state
  // ...existing code...
  const [selectedAsset, setSelectedAsset] = useState<CatalogAsset | MockEHRAsset | null>(null);
  const [negotiationStep, setNegotiationStep] = useState(0);
  const [transferStep, setTransferStep] = useState(0);
  const [computeStep, setComputeStep] = useState(0);
  const [ehrData, setEhrData] = useState<ElectronicHealthRecord | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ageBandFilter, setAgeBandFilter] = useState<string>('all');
  
  // Contract agreement tracking for real EDC negotiation
  const [contractAgreementId, setContractAgreementId] = useState<string | null>(null);
  
  // Negotiation and transfer timestamps for real EDC flow
  const [negotiationStartTime, setNegotiationStartTime] = useState<Date | null>(null);
  const [negotiationEndTime, setNegotiationEndTime] = useState<Date | null>(null);
  const [transferStartTime, setTransferStartTime] = useState<Date | null>(null);
  const [transferEndTime, setTransferEndTime] = useState<Date | null>(null);
  
  // Use dynamic catalog hook for EDC-sourced assets
  const { 
    assets: catalogAssets, 
    isLoading: catalogLoading, 
    error: catalogError,
    source: catalogSource,
    enhanced: catalogEnhanced,
    refetch: refetchCatalog 
  } = useCatalog({ autoFetch: true });
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [medDRAFilter, setMedDRAFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFhirJson, setShowFhirJson] = useState(false);
  const [showInsiderPanel, setShowInsiderPanel] = useState(false);
  
  // Advanced EU CTR 536/2014 Filters (persist across demo phases)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sponsorTypeFilter, setSponsorTypeFilter] = useState<string>('all');
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all');
  
  // DSP Event logging hook
  const { emitEvent, setCurrentPhase, completePhase, resetPhases, clearEvents, events: dspEvents, seedingStatus } = useDspEventLog();

  // Auto-open Insider Panel if seeding events exist and demo hasn't started
  useEffect(() => {
    const hasSeedingEvents = dspEvents.some(e => e.phase === 'seeding');
    if (phase === 'intro' && hasSeedingEvents && seedingStatus === 'completed' && !showInsiderPanel) {
      console.log('[App-health] Auto-opening Insider Panel - seeding completed with', dspEvents.filter(e => e.phase === 'seeding').length, 'events');
      setShowInsiderPanel(true);
    }
  }, [phase, dspEvents, seedingStatus, showInsiderPanel]);

  // Determine which assets to use: dynamic catalog or mock data
  // In hybrid/full mode with catalog data, use catalogAssets; otherwise fall back to mock
  const useDynamicCatalog = catalogAssets.length > 0 && !catalogLoading && !catalogError;
  
  // Convert CatalogAsset to MockEHRAsset-compatible format for filtering
  const assetsToFilter = useDynamicCatalog 
    ? catalogAssets.map(asset => ({
        '@id': asset.assetId,
        'dct:title': asset.title,
        'dct:description': asset.description,
        'healthdcatap:icdCode': asset.healthTheme?.[0] ?? '',
        'healthdcatap:diagnosis': asset.description,
        'healthdcatap:category': asset.healthCategory,
        'healthdcatap:ageRange': asset.ageBand,
        'healthdcatap:biologicalSex': asset.biologicalSex,
        'healthdcatap:consentStatus': 'active',
        'healthdcatap:sensitiveCategory': asset.sensitiveCategory,
        'healthdcatap:clinicalTrialPhase': asset.clinicalPhase,
        'healthdcatap:euCtNumber': asset.euCtNumber,
        'healthdcatap:sponsor': asset.sponsor as MockEHRAsset['healthdcatap:sponsor'],
        'healthdcatap:therapeuticArea': asset.therapeuticArea ? { 
          code: asset.therapeuticArea, 
          name: asset.therapeuticArea 
        } : undefined,
        'healthdcatap:medDRA': (asset as unknown as Record<string, unknown>)['healthdcatap:medDRA'] as MockEHRAsset['healthdcatap:medDRA'],
        'healthdcatap:memberStates': asset['healthdcatap:memberStates'] as string[] | undefined,
        'healthdcatap:signalStatus': asset['healthdcatap:signalStatus'] as MockEHRAsset['healthdcatap:signalStatus'],
        'healthdcatap:consent': asset['healthdcatap:consent'] as MockEHRAsset['healthdcatap:consent'],
        // Preserve enhanced catalog data for display
        _catalogAsset: asset,
      }) as MockEHRAsset & { _catalogAsset: CatalogAsset })
    : mockEHRCatalogAssets;

  // Filter assets based on category, age band, phase, MedDRA SOC, EU CTR fields, and search
  const filteredAssets = assetsToFilter.filter(asset => {
    const matchesCategory = categoryFilter === 'all' || asset['healthdcatap:category'] === categoryFilter;
    const matchesAgeBand = ageBandFilter === 'all' || asset['healthdcatap:ageRange'] === ageBandFilter;
    const matchesPhase = phaseFilter === 'all' || asset['healthdcatap:clinicalTrialPhase'] === phaseFilter;
    const matchesMedDRA = medDRAFilter === 'all' || asset['healthdcatap:medDRA']?.socCode === medDRAFilter;
    const matchesSponsorType = sponsorTypeFilter === 'all' || asset['healthdcatap:sponsor']?.type === sponsorTypeFilter;
    const matchesTherapeuticArea = therapeuticAreaFilter === 'all' || asset['healthdcatap:therapeuticArea']?.code === therapeuticAreaFilter;
    const matchesSearch = searchTerm === '' || 
      asset['dct:title'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['healthdcatap:icdCode']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['healthdcatap:diagnosis']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['healthdcatap:medDRA']?.socName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['healthdcatap:medDRA']?.ptName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['healthdcatap:clinicalTrialPhase']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['healthdcatap:euCtNumber']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['healthdcatap:sponsor']?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['healthdcatap:therapeuticArea']?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesAgeBand && matchesPhase && matchesMedDRA && matchesSponsorType && matchesTherapeuticArea && matchesSearch;
  });

  // Check backend availability on mount
  useEffect(() => {
    checkBackendHealth().then(setBackendAvailable);
  }, []);

  const resetDemo = () => {
    setPhase('intro');
    setSelectedAsset(null);
    setNegotiationStep(0);
    setTransferStep(0);
    setComputeStep(0);
    setEhrData(null);
    setIsAnimating(false);
    setShowJson(false);
    setContractAgreementId(null);
    setNegotiationStartTime(null);
    setNegotiationEndTime(null);
    setTransferStartTime(null);
    setTransferEndTime(null);
    resetPhases(); // Reset DSP event phases
    clearEvents(); // Clear the Dataspace Insider Panel events
  };

  // Start the demo and emit catalog events
  const startDemo = () => {
    setPhase('catalog');
    setCurrentPhase('catalog');
    
    // Emit catalog discovery events
    emitEvent({
      phase: 'catalog',
      action: 'Catalog Request',
      direction: 'outbound',
      status: 'success',
      dspMessageType: 'CatalogRequestMessage',
      actor: 'Consumer (Nordstein Research)',
      target: 'Provider (Rheinland Klinikum)',
      details: { filter: 'healthdcatap:studyEligibility' },
      source: 'mock'
    });
    
    // Simulate catalog response after short delay
    setTimeout(() => {
      emitEvent({
        phase: 'catalog',
        action: 'Catalog Response',
        direction: 'inbound',
        status: 'success',
        dspMessageType: 'CatalogResponse',
        actor: 'Provider (Rheinland Klinikum)',
        target: 'Consumer (Nordstein Research)',
        details: { datasetsCount: 21, format: 'HealthDCAT-AP' },
        source: 'mock'
      });
      completePhase('catalog');
    }, 500);
  };

  const simulateNegotiation = async () => {
    setIsAnimating(true);
    setCurrentPhase('negotiation');
    setNegotiationStartTime(new Date());
    const mode = getApiMode();
    
    try {
      if (mode === 'mock') {
        // Mock mode: simulate with timeouts and emit DSP events
        const negotiationEvents = [
          { action: 'Contract Request', direction: 'outbound' as const, dspMessageType: 'ContractRequestMessage' },
          { action: 'Contract Offer', direction: 'inbound' as const, dspMessageType: 'ContractOfferMessage' },
          { action: 'Negotiation Accepted', direction: 'outbound' as const, dspMessageType: 'ContractNegotiationEventMessage' },
          { action: 'Contract Agreement', direction: 'inbound' as const, dspMessageType: 'ContractAgreementMessage' },
          { action: 'Agreement Verification', direction: 'outbound' as const, dspMessageType: 'ContractAgreementVerificationMessage' },
          { action: 'Negotiation Finalized', direction: 'inbound' as const, dspMessageType: 'ContractNegotiationEventMessage' },
        ];
        
        for (let i = 0; i < mockNegotiationFlow.length; i++) {
          setNegotiationStep(i);
          
          // Emit DSP event for this step
          if (negotiationEvents[i]) {
            emitEvent({
              phase: 'negotiation',
              action: negotiationEvents[i].action,
              direction: negotiationEvents[i].direction,
              status: 'success',
              dspMessageType: negotiationEvents[i].dspMessageType,
              actor: negotiationEvents[i].direction === 'outbound' ? 'Consumer (Nordstein)' : 'Provider (Rheinland)',
              target: negotiationEvents[i].direction === 'outbound' ? 'Provider (Rheinland)' : 'Consumer (Nordstein)',
              details: { assetId: selectedAsset?.['@id'], step: i + 1 },
              source: 'mock'
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } else {
        // Hybrid/Full mode: use real EDC negotiation
        const assetId = selectedAsset?.['@id'] || '';
        const offerId = `offer:${assetId}`;
        
        // Step through mock UI while negotiation happens
        setNegotiationStep(0); // Requesting
        emitEvent({ 
          phase: 'negotiation', 
          action: 'Contract Request', 
          direction: 'outbound', 
          status: 'in-progress', 
          dspMessageType: 'ContractRequestMessage',
          actor: healthParticipants.consumer.name,
          target: healthParticipants.provider.name,
          details: {
            consumer: healthParticipants.consumer.name,
            provider: healthParticipants.provider.name,
            consumerDid: healthParticipants.consumer.did,
            providerDid: healthParticipants.provider.did,
            assetId,
            offerId
          }
        });
        
        const negResponse = await api.initiateNegotiation(assetId, offerId);
        emitEvent({ 
          phase: 'negotiation', 
          action: 'Contract Request Sent', 
          direction: 'outbound', 
          status: 'success', 
          actor: healthParticipants.consumer.name,
          target: healthParticipants.provider.name,
          details: { 
            negotiationId: negResponse.negotiationId,
            consumer: healthParticipants.consumer.name,
            consumerDid: healthParticipants.consumer.did 
          } 
        });
        
        setNegotiationStep(1); // Processing
        
        if (negResponse.state !== 'FINALIZED') {
          // Poll for completion
          setNegotiationStep(2); // Verifying
          emitEvent({ 
            phase: 'negotiation', 
            action: 'Polling Negotiation Status', 
            direction: 'internal', 
            status: 'in-progress',
            details: { negotiationId: negResponse.negotiationId }
          });
          
          const finalStatus = await api.pollNegotiation(negResponse.negotiationId, 30000);
          setContractAgreementId(finalStatus.contractAgreementId || null);
          setNegotiationStep(3); // Completed
          
          emitEvent({ 
            phase: 'negotiation', 
            action: 'Contract Agreement Received', 
            direction: 'inbound', 
            status: 'success', 
            dspMessageType: 'ContractAgreementMessage', 
            actor: healthParticipants.provider.name,
            target: healthParticipants.consumer.name,
            details: { 
              contractAgreementId: finalStatus.contractAgreementId,
              provider: healthParticipants.provider.name,
              providerDid: healthParticipants.provider.did,
              consumer: healthParticipants.consumer.name
            } 
          });
        } else {
          setContractAgreementId(negResponse.contractAgreementId || null);
          setNegotiationStep(mockNegotiationFlow.length - 1); // Jump to complete
          emitEvent({ 
            phase: 'negotiation', 
            action: 'Negotiation Finalized', 
            direction: 'inbound', 
            status: 'success', 
            dspMessageType: 'ContractNegotiationEventMessage',
            actor: healthParticipants.provider.name,
            target: healthParticipants.consumer.name,
            details: { 
              contractAgreementId: negResponse.contractAgreementId,
              provider: healthParticipants.provider.name,
              providerDid: healthParticipants.provider.did
            } 
          });
        }
      }
    } catch (error) {
      console.error('Negotiation failed:', error);
      emitEvent({ phase: 'negotiation', action: 'Negotiation Failed', direction: 'internal', status: 'error', details: { error: String(error) } });
      
      // Fall back to completing the mock flow for demo purposes
      for (let i = negotiationStep; i < mockNegotiationFlow.length; i++) {
        setNegotiationStep(i);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
    
    setNegotiationEndTime(new Date());
    completePhase('negotiation');
    setIsAnimating(false);
    
    // Check if asset requires confidential compute
    const mockAsset = getMockAsset(selectedAsset);
    if (mockAsset?.['healthdcatap:sensitiveCategory'] === 'genomics' || mockAsset?.['healthdcatap:sensitiveCategory'] === 'mental-health') {
      setPhase('compute');
      simulateCompute();
    } else {
      setPhase('transfer');
    }
  };

  const simulateCompute = async () => {
    setIsAnimating(true);
    setCurrentPhase('compute');
    
    const computeEvents = [
      { action: 'Compute Request', direction: 'outbound' as const },
      { action: 'Enclave Attestation', direction: 'internal' as const },
      { action: 'Encrypted Ingestion', direction: 'internal' as const },
      { action: 'Secure Execution', direction: 'internal' as const },
      { action: 'Result Delivery', direction: 'inbound' as const },
    ];
    
    for (let i = 0; i < mockComputeFlow.length; i++) {
      setComputeStep(i);
      
      if (computeEvents[i]) {
        emitEvent({
          phase: 'compute',
          action: computeEvents[i].action,
          direction: computeEvents[i].direction,
          status: 'success',
          actor: computeEvents[i].direction === 'internal' ? 'Enclave' : computeEvents[i].direction === 'outbound' ? 'Consumer' : 'Provider',
          details: { step: i + 1, assetId: selectedAsset?.['@id'] }
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    completePhase('compute');
    setIsAnimating(false);
    setPhase('complete');
    loadEhrData();
  };

  const simulateTransfer = async () => {
    setIsAnimating(true);
    setCurrentPhase('transfer');
    setTransferStartTime(new Date());
    const mode = getApiMode();
    
    try {
      if (mode === 'mock') {
        // Mock mode: simulate with timeouts and emit DSP events
        const transferEvents = [
          { action: 'Transfer Request', direction: 'outbound' as const, dspMessageType: 'TransferRequestMessage' },
          { action: 'De-identification Pipeline', direction: 'internal' as const },
          { action: 'Transfer Start + EDR', direction: 'inbound' as const, dspMessageType: 'TransferStartMessage' },
          { action: 'FHIR Bundle Pull', direction: 'inbound' as const },
          { action: 'Transfer Complete', direction: 'outbound' as const, dspMessageType: 'TransferCompletionMessage' },
        ];
        
        for (let i = 0; i < mockTransferFlow.length; i++) {
          setTransferStep(i);
          
          if (transferEvents[i]) {
            emitEvent({
              phase: 'transfer',
              action: transferEvents[i].action,
              direction: transferEvents[i].direction,
              status: 'success',
              dspMessageType: transferEvents[i].dspMessageType,
              actor: transferEvents[i].direction === 'internal' ? 'Provider (De-ID)' : transferEvents[i].direction === 'outbound' ? 'Consumer' : 'Provider',
              details: { assetId: selectedAsset?.['@id'], step: i + 1 }
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } else {
        // Hybrid/Full mode: use real EDC transfer
        const assetId = selectedAsset?.['@id'] || '';
        const agreementId = contractAgreementId || `mock-agreement-${Date.now()}`;
        
        setTransferStep(0); // Initiating
        emitEvent({ 
          phase: 'transfer', 
          action: 'Transfer Request', 
          direction: 'outbound', 
          status: 'in-progress', 
          dspMessageType: 'TransferRequestMessage',
          actor: healthParticipants.consumer.name,
          target: healthParticipants.provider.name,
          details: {
            consumer: healthParticipants.consumer.name,
            consumerDid: healthParticipants.consumer.did,
            provider: healthParticipants.provider.name,
            providerDid: healthParticipants.provider.did,
            assetId,
            agreementId
          }
        });
        
        const transferResponse = await api.initiateTransfer(agreementId, assetId);
        emitEvent({ 
          phase: 'transfer', 
          action: 'Transfer Initiated', 
          direction: 'outbound', 
          status: 'success',
          actor: healthParticipants.consumer.name,
          target: healthParticipants.provider.name, 
          details: { 
            transferId: transferResponse.transferId,
            consumer: healthParticipants.consumer.name,
            consumerDid: healthParticipants.consumer.did
          } 
        });
        
        setTransferStep(1); // Provisioning
        emitEvent({ 
          phase: 'transfer', 
          action: 'Data Provisioning', 
          direction: 'internal', 
          status: 'in-progress',
          details: { 
            transferId: transferResponse.transferId,
            provider: healthParticipants.provider.name 
          }
        });
        
        if (transferResponse.state !== 'COMPLETED') {
          setTransferStep(2); // Transferring
          emitEvent({ 
            phase: 'transfer', 
            action: 'Polling Transfer Status', 
            direction: 'internal', 
            status: 'in-progress',
            details: { transferId: transferResponse.transferId }
          });
          
          await api.pollTransfer(transferResponse.transferId, 30000);
          setTransferStep(3); // Completing
          
          emitEvent({ 
            phase: 'transfer', 
            action: 'Data Received via EDR', 
            direction: 'inbound', 
            status: 'success', 
            dspMessageType: 'TransferStartMessage',
            actor: healthParticipants.provider.name,
            target: healthParticipants.consumer.name,
            details: {
              transferId: transferResponse.transferId,
              provider: healthParticipants.provider.name,
              providerDid: healthParticipants.provider.did
            }
          });
        }
        
        setTransferStep(mockTransferFlow.length - 1); // Complete
        emitEvent({ 
          phase: 'transfer', 
          action: 'Transfer Complete', 
          direction: 'outbound', 
          status: 'success', 
          dspMessageType: 'TransferCompletionMessage',
          actor: healthParticipants.consumer.name,
          target: healthParticipants.provider.name,
          details: {
            transferId: transferResponse.transferId,
            consumer: healthParticipants.consumer.name,
            provider: healthParticipants.provider.name
          }
        });
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      emitEvent({ phase: 'transfer', action: 'Transfer Failed', direction: 'internal', status: 'error', details: { error: String(error) } });
      
      // Fall back to completing the mock flow for demo purposes
      for (let i = transferStep; i < mockTransferFlow.length; i++) {
        setTransferStep(i);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
    
    setTransferEndTime(new Date());
    completePhase('transfer');
    setIsAnimating(false);
    // Removed auto-jump - user must click "View EHR Data" button
  };

  const loadEhrData = async () => {
    // Load the EHR data - use apiFactory for consistent mode handling
    if (selectedAsset) {
      const mode = getApiMode();
      // Get ID from either MockEHRAsset or CatalogAsset format
      const ehrId = selectedAsset['@id'] ?? (selectedAsset as CatalogAsset).assetId ?? '';
      
      if (!ehrId) {
        console.warn('No EHR ID available');
        return;
      }
      
      try {
        if (mode === 'mock') {
          // Mock mode: try backend first, fall back to mock data
          if (backendAvailable) {
            const data = await fetchEHRById(ehrId);
            setEhrData(data);
          } else {
            setEhrData(mockEHRData[ehrId as keyof typeof mockEHRData]);
          }
        } else {
          // Hybrid/Full mode: use apiFactory
          const data = await api.getEhr(ehrId);
          setEhrData(data as unknown as ElectronicHealthRecord);
        }
      } catch (error) {
        console.warn('EHR fetch failed, using mock data:', error);
        // Fallback to mock data
        setEhrData(mockEHRData[ehrId as keyof typeof mockEHRData]);
      }
    }
  };

  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-300 ${showInsiderPanel ? 'mr-[420px]' : ''}`}>
      {/* Dataspace Insider Panel */}
      <DataspaceInsiderPanel 
        isOpen={showInsiderPanel} 
        isBackendOnline={backendAvailable ?? false}
      />
      <DataspaceInsiderTrigger onClick={() => setShowInsiderPanel(!showInsiderPanel)} isPanelOpen={showInsiderPanel} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Health Dataspace - EHR2EDC Demo
                </h1>
                <p className="text-sm text-gray-500">Electronic Health Records to Electronic Data Capture</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* API Mode Indicator */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isStaticDemo()
                  ? 'bg-amber-100 text-amber-700'
                  : getApiMode() === 'full' 
                    ? 'bg-purple-100 text-purple-700'
                    : getApiMode() === 'hybrid'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isStaticDemo()
                    ? 'bg-amber-500'
                    : getApiMode() === 'full' 
                      ? 'bg-purple-500'
                      : getApiMode() === 'hybrid'
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                }`} />
                {isStaticDemo() 
                  ? 'Static Demo' 
                  : getApiMode() === 'full' 
                    ? 'Full EDC' 
                    : getApiMode() === 'hybrid' 
                      ? 'Hybrid' 
                      : 'Mock Mode'}
              </div>
              {/* Backend Status Indicator */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                backendAvailable === null 
                  ? 'bg-gray-100 text-gray-600'
                  : backendAvailable 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  backendAvailable === null 
                    ? 'bg-gray-400 animate-pulse'
                    : backendAvailable 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                }`} />
                {backendAvailable === null ? 'Checking...' : backendAvailable ? 'Backend Online' : 'Backend Offline'}
              </div>

              {phase !== 'intro' && (
                <button
                  onClick={resetDemo}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart Demo
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {phase !== 'intro' && (
        <div className="bg-white border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {[
                { id: 'catalog', label: 'EHR Catalog', icon: Database },
                { id: 'negotiation', label: 'Consent Verification', icon: Lock },
                { id: 'transfer', label: 'EHR Transfer', icon: Send },
                { id: 'complete', label: 'EDC Ready', icon: CheckCircle },
              ].map((step, i, arr) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    phase === step.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : arr.findIndex(x => x.id === phase) > i
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                    <span className="font-medium text-sm hidden md:block">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <ChevronRight className={`w-5 h-5 mx-2 ${
                      arr.findIndex(x => x.id === phase) > i ? 'text-green-500' : 'text-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white">
              <div className="w-full">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h2 className="text-3xl font-bold">
                    Sovereign Health Data Exchange via Dataspace Protocol
                  </h2>
                  <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full border border-white/30">
                    HealthDCAT-AP v1.0
                  </span>
                </div>
                <p className="text-blue-100 text-lg mb-6">
                  This demo illustrates how anonymized Electronic Health Records (EHR) can be securely 
                  exchanged between hospitals and research institutes using the Dataspace Protocol (DSP). 
                  All 21 datasets are fully compliant with <strong>HealthDCAT-AP</strong> for EHDS interoperability, 
                  including mandatory metadata for sensitive health data discovery across EU health data portals.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={startDemo}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start Demo
                  </button>
                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/30 rounded-lg font-semibold hover:bg-white/20 text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    View Code on GitHub
                  </a>
                  <a
                    href="https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 border border-white/30 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    <BookOpen className="w-5 h-5" />
                    EHDS Information
                  </a>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{healthParticipants.provider.logo}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{healthParticipants.provider.name}</h3>
                    <p className="text-blue-600 font-medium">{healthParticipants.provider.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{healthParticipants.provider.description}</p>
                <div className="bg-blue-50 rounded-lg p-3 font-mono text-sm text-blue-900">
                  DID: {healthParticipants.provider.did}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{healthParticipants.consumer.logo}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{healthParticipants.consumer.name}</h3>
                    <p className="text-indigo-600 font-medium">{healthParticipants.consumer.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{healthParticipants.consumer.description}</p>
                <div className="bg-indigo-50 rounded-lg p-3 font-mono text-sm text-indigo-900">
                  DID: {healthParticipants.consumer.did}
                </div>
              </div>
            </div>

 

            {/* Technical Details - Collapsible */}
            <CollapsibleSection
              title="Technical Standards & Compliance Details"
              defaultOpen={false}
              className="mt-6"
            >
              {/* Compliance Badges */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory & Standards Compliance</h3>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { name: 'HealthDCAT-AP', desc: 'Health Data Catalog Application Profile', color: 'teal' },
                    { name: 'EHDS 2025/327', desc: 'European Health Data Space Regulation', color: 'blue' },
                    { name: 'EU CTR 536/2014', desc: 'Clinical Trials Regulation', color: 'green' },
                    { name: 'GDPR', desc: 'General Data Protection Regulation', color: 'green' },
                    { name: 'GDNG', desc: 'Gesundheitsdatennutzungsgesetz', color: 'green' },
                    { name: 'FHIR R4', desc: 'HL7 Fast Healthcare Interoperability', color: 'purple' },
                    { name: 'MedDRA v27.0', desc: 'Medical Dictionary for Regulatory Activities', color: 'purple' },
                    { name: 'k-Anonymity', desc: 'De-identification Standard (k=5)', color: 'green' },
                  ].map((badge) => (
                    <div key={badge.name} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      badge.color === 'teal' ? 'bg-teal-50 border border-teal-200' :
                      badge.color === 'blue' ? 'bg-blue-50 border border-blue-200' :
                      badge.color === 'purple' ? 'bg-purple-50 border border-purple-200' :
                      'bg-green-50 border border-green-200'
                    }`}>
                      <Shield className={`w-4 h-4 ${
                        badge.color === 'teal' ? 'text-teal-600' :
                        badge.color === 'blue' ? 'text-blue-600' :
                        badge.color === 'purple' ? 'text-purple-600' :
                        'text-green-600'
                      }`} />
                      <div>
                        <div className={`font-medium ${
                          badge.color === 'teal' ? 'text-teal-800' :
                          badge.color === 'blue' ? 'text-blue-800' :
                          badge.color === 'purple' ? 'text-purple-800' :
                          'text-green-800'
                        }`}>{badge.name}</div>
                        <div className={`text-xs ${
                          badge.color === 'teal' ? 'text-teal-600' :
                          badge.color === 'blue' ? 'text-blue-600' :
                          badge.color === 'purple' ? 'text-purple-600' :
                          'text-green-600'
                        }`}>{badge.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol Overview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Protocol Phases</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {Object.entries(healthDspPhases).map(([key, phaseData]) => {
                    const isHovered = hoveredPhase === key;
                    return (
                      <div
                        key={key}
                        className={`relative border rounded-lg p-4 transition-all duration-200 ${isHovered ? 'shadow-lg bg-blue-50 scale-105 z-10' : 'hover:shadow-md'} min-h-[180px]`}
                        style={isHovered ? { minHeight: '260px' } : {}}
                        onMouseEnter={() => setHoveredPhase(key)}
                        onMouseLeave={() => setHoveredPhase(null)}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {/* Dynamically render the Lucide icon for each phase */}
                          {(() => {
                            const iconMap = {
                              Database: Database,
                              ArrowRight: ArrowRight,
                              CheckCircle: CheckCircle,
                              Loader2: Loader2,
                              BookOpen: BookOpen,
                              ExternalLink: ExternalLink,
                              ChevronRight: ChevronRight,
                              ChevronDown: ChevronDown,
                              Play: Play,
                              RotateCcw: RotateCcw,
                              Code: Code,
                              Shield: Shield,
                              Send: Send,
                              Github: Github,
                              Lock: Lock,
                              Stethoscope: Stethoscope,
                              Search: Search,
                              FileJson: FileJson,
                              AlertCircle: AlertCircle,
                              Download: Download
                            };
                            const IconComponent = iconMap[phaseData.icon as keyof typeof iconMap];
                            if (IconComponent) {
                              return <IconComponent className="w-5 h-5 text-blue-600" />;
                            }
                            return null;
                          })()}
                          <h4 className="font-semibold text-gray-900">{phaseData.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {isHovered ? phaseData.description : (phaseData.description.length > 150 ? `${phaseData.description.substring(0, 150)}...` : phaseData.description)}
                        </p>
                        <a
                          href={phaseData.specLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View specification <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

           {/* HealthDCAT-AP Compliance Highlight */}
            <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-xl p-6 shadow-sm border border-teal-200">
              <div className="flex items-start gap-4">
                <div className="bg-teal-600 p-3 rounded-xl">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">HealthDCAT-AP v1.0 Compliant</h3>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xs font-medium rounded-full">NEW</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    All 21 EHR datasets are fully compliant with the HealthDCAT-AP specification for the European Health Data Space (EHDS). 
                    Each dataset includes mandatory properties for sensitive health data, enabling seamless discovery and interoperability across EU health data portals.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/60 rounded-lg p-3 border border-teal-100">
                      <div className="text-2xl font-bold text-teal-700">21</div>
                      <div className="text-sm text-gray-600">EHR Datasets with full metadata</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-teal-100">
                      <div className="text-2xl font-bold text-teal-700">20+</div>
                      <div className="text-sm text-gray-600">Mandatory properties per dataset</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-teal-100">
                      <div className="text-2xl font-bold text-teal-700">100%</div>
                      <div className="text-sm text-gray-600">EHDS Regulation compliant</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      'dcat:contactPoint',
                      'dct:publisher',
                      'healthdcatap:hdab',
                      'healthdcatap:healthTheme',
                      'dqv:hasQualityAnnotation',
                      'healthdcatap:analytics',
                      'dpv:hasPurpose',
                      'dpv:hasLegalBasis'
                    ].map((prop) => (
                      <span key={prop} className="px-2 py-1 bg-white text-teal-700 text-xs font-mono rounded border border-teal-200">
                        {prop}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="https://ehds.healthdataportal.eu/editor2/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open EHDS Data Model Editor
                    </a>
                    <a
                      href="https://www.healthinformationportal.eu/healthdcat-ap"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white text-teal-700 border border-teal-300 rounded-lg font-medium hover:bg-teal-50 transition-colors text-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      HealthDCAT-AP Specification
                    </a>
                  </div>
                </div>
              </div>
            </div>

              {/* HealthDCAT-AP Dataset Properties */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">HealthDCAT-AP Dataset Properties</h3>
                    <p className="text-sm text-gray-500 mt-1">Each EHR dataset includes these mandatory and recommended properties for EHDS sensitive data compliance. You can export the meta data and develop your own data schema in <a target="_blank" style={{textDecoration: 'underline'}}  href="https://ehds.healthdataportal.eu/editor2/">HealthDCAT-AP editor</a>.</p>
                  </div>
                  <a
                    href="https://healthdataeu.pages.code.europa.eu/healthdcat-ap/releases/release-5/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Full Specification <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { 
                      prop: 'dcat:contactPoint', 
                      desc: 'Research Data Steward contact information',
                      type: 'MANDATORY',
                      example: 'vcard:Kind with email, phone, organization'
                    },
                    { 
                      prop: 'dct:publisher', 
                      desc: 'Publishing organization with full address',
                      type: 'MANDATORY',
                      example: 'foaf:Agent with name, homepage, address'
                    },
                    { 
                      prop: 'healthdcatap:hdab', 
                      desc: 'Health Data Access Body (HDAB)',
                      type: 'MANDATORY',
                      example: 'Forschungsdatenzentrum Gesundheit (FDZ)'
                    },
                    { 
                      prop: 'healthdcatap:healthTheme', 
                      desc: 'Wikidata URIs for health topics',
                      type: 'MANDATORY',
                      example: 'Q12206 (Diabetes), Q12078 (Cancer)...'
                    },
                    { 
                      prop: 'dqv:hasQualityAnnotation', 
                      desc: 'Data quality certificate',
                      type: 'RECOMMENDED',
                      example: 'Quality assessment with oa:hasTarget'
                    },
                    { 
                      prop: 'healthdcatap:analytics', 
                      desc: 'Pre-computed analytics distribution',
                      type: 'RECOMMENDED',
                      example: 'CSV/PDF reports with accessURL'
                    },
                    { 
                      prop: 'dpv:hasPurpose', 
                      desc: 'Data processing purposes',
                      type: 'MANDATORY',
                      example: 'AcademicResearch, ClinicalResearch'
                    },
                    { 
                      prop: 'dpv:hasLegalBasis', 
                      desc: 'GDPR legal basis for processing',
                      type: 'MANDATORY',
                      example: 'GDPR Art. 6(1)(a), Art. 9(2)(j)'
                    },
                    { 
                      prop: 'dcatap:applicableLegislation', 
                      desc: 'Applicable EU regulations',
                      type: 'MANDATORY',
                      example: 'EHDS 2025/327, GDPR, DGA'
                    },
                  ].map((item) => (
                    <div key={item.prop} className={`rounded-lg p-4 border ${
                      item.type === 'MANDATORY' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <code className={`text-sm font-medium ${
                          item.type === 'MANDATORY' ? 'text-blue-800' : 'text-gray-800'
                        }`}>{item.prop}</code>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.type === 'MANDATORY' 
                            ? 'bg-blue-200 text-blue-800' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>{item.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{item.desc}</p>
                      <p className="text-xs text-gray-500 italic">e.g., {item.example}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* CATALOG PHASE */}
        {phase === 'catalog' && (
          <div className="space-y-6">
            <PhaseHeader 
              phase={healthDspPhases.catalog}
              icon={<Database className="w-6 h-6" />}
            />
            <div className="flex justify-end -mt-4 mb-2 gap-4 items-center">
               <button 
                 onClick={downloadHealthDCATAP}
                 className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium"
               >
                 Export for EHDS Editor <Download className="w-3 h-3" />
               </button>
               <div className="h-4 w-px bg-gray-300"></div>
               <a href="https://www.healthinformationportal.eu/healthdcat-ap" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                 View HealthDCAT-AP Specification <ExternalLink className="w-3 h-3" />
               </a>
               <a href="https://ehds.healthdataportal.eu/editor2/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                 Open Data Model Editor <ExternalLink className="w-3 h-3" />
               </a>
            </div>

            {/* Protocol Flow */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Protocol Flow</h3>
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg"
                >
                  <Code className="w-4 h-4" />
                  {showJson ? 'Hide' : 'Show'} JSON Messages
                </button>
              </div>
              
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">{healthParticipants.consumer.logo}</div>
                  <div className="font-medium text-sm">Research Institute</div>
                  <div className="text-xs text-gray-500">(Data Consumer)</div>
                </div>
                <div className="flex-1 px-4">
                  <div className="flex items-center justify-center gap-2 text-sm mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">CatalogRequestMessage</span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-blue-600 rotate-180" />
                    <span className="bg-blue-100 text-teal-800 px-2 py-1 rounded">dcat:Catalog (EHR Datasets)</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">{healthParticipants.provider.logo}</div>
                  <div className="font-medium text-sm">Hospital</div>
                  <div className="text-xs text-gray-500">(Data Provider)</div>
                </div>
              </div>

              {showJson && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Request Message</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(healthDspMessages.catalogRequest, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Response (Catalog)</h4>
                    <pre className="bg-gray-900 text-teal-400 p-4 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(healthDspMessages.catalogResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="space-y-4">
                {/* Search and Filter Row */}
                <div className="flex flex-col lg:flex-row gap-3">
                  {/* Search */}
                  <div className="flex-[2]">
                    <label htmlFor="search-input" className="text-xs font-medium text-gray-600 mb-1 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="search-input"
                        type="text"
                        placeholder="diabetes, E11.9, Phase III, Cardiac disorders, 55-64..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap lg:flex-nowrap gap-3 flex-[3]">
                    {/* Category Filter */}
                    <div>
                    <label htmlFor="category-filter" className="text-xs font-medium text-gray-600 mb-1 block">Medical Category</label>
                    <select
                      id="category-filter"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All Categories ({mockEHRCatalogAssets.length})</option>
                      {Object.entries(medicalCategories).map(([key, cat]) => {
                        const count = mockEHRCatalogAssets.filter(a => a['healthdcatap:category'] === key).length;
                        if (count === 0) return null;
                        return (
                          <option key={key} value={key}>
                            {cat.icon} {cat.label} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Age Band Filter */}
                  <div>
                    <label htmlFor="age-filter" className="text-xs font-medium text-gray-600 mb-1 block">Age Band</label>
                    <select
                      id="age-filter"
                      value={ageBandFilter}
                      onChange={(e) => setAgeBandFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All Ages</option>
                      {Array.from(new Set(mockEHRCatalogAssets.map(a => a['healthdcatap:ageRange']))).sort().map(age => {
                        const count = mockEHRCatalogAssets.filter(a => a['healthdcatap:ageRange'] === age).length;
                        return (
                          <option key={age} value={age}>
                            {age} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Study Phase Filter */}
                  <div>
                    <label htmlFor="phase-filter" className="text-xs font-medium text-gray-600 mb-1 block">Study Phase</label>
                    <select
                      id="phase-filter"
                      value={phaseFilter}
                      onChange={(e) => setPhaseFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All Phases</option>
                      {Array.from(new Set(mockEHRCatalogAssets.map(a => a['healthdcatap:clinicalTrialPhase']).filter(Boolean))).sort().map(phase => {
                        const count = mockEHRCatalogAssets.filter(a => a['healthdcatap:clinicalTrialPhase'] === phase).length;
                        const phaseName = phase === 'Phase I' ? 'Phase I - First-in-Human' :
                                        phase === 'Phase II' ? 'Phase II - Efficacy' :
                                        phase === 'Phase III' ? 'Phase III - Confirmation' :
                                        phase === 'Phase IV' ? 'Phase IV - Post-Marketing' : phase;
                        return (
                          <option key={phase} value={phase}>
                            {phaseName} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* MedDRA SOC Filter */}
                  <div>
                    <label htmlFor="meddra-filter" className="text-xs font-medium text-gray-600 mb-1 block">MedDRA SOC</label>
                    <select
                      id="meddra-filter"
                      value={medDRAFilter}
                      onChange={(e) => setMedDRAFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All SOCs</option>
                      {Array.from(new Set(mockEHRCatalogAssets.map(a => a['healthdcatap:medDRA']?.socCode).filter(Boolean))).sort().map(socCode => {
                        const asset = mockEHRCatalogAssets.find(a => a['healthdcatap:medDRA']?.socCode === socCode);
                        const socName = asset?.['healthdcatap:medDRA']?.socName;
                        const count = mockEHRCatalogAssets.filter(a => a['healthdcatap:medDRA']?.socCode === socCode).length;
                        return (
                          <option key={socCode} value={socCode}>
                            {socName} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Advanced Filters Toggle - EU CTR 536/2014 */}
                <div>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showAdvancedFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    EU CTR 536/2014 Filters
                  </button>
                  
                  {showAdvancedFilters && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex flex-wrap gap-3">
                        {/* Sponsor Type Filter */}
                        <div className="min-w-[180px]">
                          <label htmlFor="sponsor-type-filter" className="text-xs font-medium text-blue-800 mb-1 block">Sponsor Type</label>
                          <select
                            id="sponsor-type-filter"
                            value={sponsorTypeFilter}
                            onChange={(e) => setSponsorTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                          >
                            <option value="all">All Types</option>
                            {Object.entries(sponsorTypes).map(([key, sponsor]) => {
                              const count = mockEHRCatalogAssets.filter(a => a['healthdcatap:sponsor']?.type === key).length;
                              if (count === 0) return null;
                              return (
                                <option key={key} value={key}>
                                  {sponsor.icon} {sponsor.label} ({count})
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Therapeutic Area Filter */}
                        <div className="min-w-[220px]">
                          <label htmlFor="therapeutic-area-filter" className="text-xs font-medium text-blue-800 mb-1 block">EMA Therapeutic Area</label>
                          <select
                            id="therapeutic-area-filter"
                            value={therapeuticAreaFilter}
                            onChange={(e) => setTherapeuticAreaFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                          >
                            <option value="all">All Areas</option>
                            {Array.from(new Set(mockEHRCatalogAssets.map(a => a['healthdcatap:therapeuticArea']?.code).filter(Boolean))).sort().map(code => {
                              const area = emaTherapeuticAreas[code as keyof typeof emaTherapeuticAreas];
                              const count = mockEHRCatalogAssets.filter(a => a['healthdcatap:therapeuticArea']?.code === code).length;
                              return (
                                <option key={code} value={code}>
                                  {area?.name || code} ({count})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Filters Summary */}
                {(categoryFilter !== 'all' || ageBandFilter !== 'all' || phaseFilter !== 'all' || medDRAFilter !== 'all' || sponsorTypeFilter !== 'all' || therapeuticAreaFilter !== 'all' || searchTerm) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-600">Active filters:</span>
                    {categoryFilter !== 'all' && (
                      <button onClick={() => setCategoryFilter('all')} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex items-center gap-1 hover:bg-blue-200">
                        {medicalCategories[categoryFilter as keyof typeof medicalCategories]?.label} ×
                      </button>
                    )}
                    {ageBandFilter !== 'all' && (
                      <button onClick={() => setAgeBandFilter('all')} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs flex items-center gap-1 hover:bg-purple-200">
                        Age: {ageBandFilter} ×
                      </button>
                    )}
                    {phaseFilter !== 'all' && (
                      <button onClick={() => setPhaseFilter('all')} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs flex items-center gap-1 hover:bg-indigo-200">
                        {phaseFilter} ×
                      </button>
                    )}
                    {medDRAFilter !== 'all' && (
                      <button onClick={() => setMedDRAFilter('all')} className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs flex items-center gap-1 hover:bg-pink-200">
                        {mockEHRCatalogAssets.find(a => a['healthdcatap:medDRA']?.socCode === medDRAFilter)?.['healthdcatap:medDRA']?.socName} ×
                      </button>
                    )}
                    {sponsorTypeFilter !== 'all' && (
                      <button onClick={() => setSponsorTypeFilter('all')} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs flex items-center gap-1 hover:bg-green-200">
                        {sponsorTypes[sponsorTypeFilter as keyof typeof sponsorTypes]?.icon} {sponsorTypes[sponsorTypeFilter as keyof typeof sponsorTypes]?.label} ×
                      </button>
                    )}
                    {therapeuticAreaFilter !== 'all' && (
                      <button onClick={() => setTherapeuticAreaFilter('all')} className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs flex items-center gap-1 hover:bg-teal-200">
                        {emaTherapeuticAreas[therapeuticAreaFilter as keyof typeof emaTherapeuticAreas]?.name} ×
                      </button>
                    )}
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs flex items-center gap-1 hover:bg-gray-200">
                        Search: "{searchTerm}" ×
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCategoryFilter('all');
                        setAgeBandFilter('all');
                        setPhaseFilter('all');
                        setMedDRAFilter('all');
                        setSponsorTypeFilter('all');
                        setTherapeuticAreaFilter('all');
                        setSearchTerm('');
                      }}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Catalog Results */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">Available EHR Datasets (Anonymized)</h3>
                  {/* Catalog Source Indicator */}
                  {catalogLoading ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading catalog...
                    </span>
                  ) : catalogError ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs" title={catalogError.message}>
                      <AlertCircle className="w-3 h-3" />
                      Using mock data
                    </span>
                  ) : useDynamicCatalog ? (
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      catalogEnhanced ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Database className="w-3 h-3" />
                      {catalogSource === 'edc-federated' ? 'Live EDC Catalog' : catalogSource}
                      {catalogEnhanced && ' (DCAT-AP Enhanced)'}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{filteredAssets.length} records found</span>
                  {useDynamicCatalog && (
                    <button
                      onClick={() => refetchCatalog()}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Refresh
                    </button>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map(asset => {
                  // Check if this is an enhanced asset from dynamic catalog
                  const catalogAsset = (asset as { _catalogAsset?: CatalogAsset })._catalogAsset;
                  
                  if (catalogAsset) {
                    // Use the new CatalogCard component for enhanced assets
                    return (
                      <CatalogCard
                        key={asset['@id']}
                        asset={catalogAsset}
                        isSelected={selectedAsset?.['@id'] === asset['@id'] || (selectedAsset as CatalogAsset | null)?.assetId === asset['@id']}
                        onSelect={(a) => setSelectedAsset({ ...asset, _catalogAsset: a } as MockEHRAsset & { _catalogAsset: CatalogAsset })}
                        showEnhancedInfo={catalogEnhanced}
                      />
                    );
                  }
                  
                  // Fall back to inline rendering for mock assets
                  const category = medicalCategories[asset['healthdcatap:category'] as keyof typeof medicalCategories];
                  const bgImage = categoryBackgrounds[asset['healthdcatap:category']];
                  return (
                    <div 
                      key={asset['@id']}
                        className={`relative overflow-hidden border rounded-lg cursor-pointer transition-all group hover:border-blue-300 hover:shadow-lg`}
                      onClick={() => setSelectedAsset(asset as MockEHRAsset)}
                    >
                      {/* Background Image */}
                      {bgImage && (
                        <div className="absolute inset-0 z-0">
                          <img 
                            src={bgImage} 
                            alt="" 
                            className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/70" />
                        </div>
                      )}
                      
                      <div className="relative z-10 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category?.icon || '📋'}</span>
                            <span className="font-mono text-xs text-gray-600 bg-white/80 px-1.5 py-0.5 rounded">{asset['healthdcatap:icdCode']}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            asset['healthdcatap:consentStatus'] === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            Consent: {asset['healthdcatap:consentStatus']}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{asset['dct:title']}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{asset['dct:description']}</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {category && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${category.color}`}>
                              {category.label}
                            </span>
                          )}
                          <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs">
                            Age: {asset['healthdcatap:ageRange']}
                          </span>
                          <span className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded text-xs capitalize">
                            {asset['healthdcatap:biologicalSex']}
                          </span>
                        </div>
                        {asset['healthdcatap:clinicalTrialPhase'] && (
                          <div className="mb-2">
                            <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-xs font-medium">
                              📋 {asset['healthdcatap:clinicalTrialPhase']}
                            </span>
                          </div>
                        )}
                        {/* EU CTR 536/2014 Fields */}
                        {asset['healthdcatap:euCtNumber'] && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs font-mono">
                              🇪🇺 {asset['healthdcatap:euCtNumber']}
                            </span>
                            {asset['healthdcatap:sponsor'] && (
                              <span className={`px-2 py-1 rounded text-xs ${
                                sponsorTypes[asset['healthdcatap:sponsor'].type as keyof typeof sponsorTypes]?.color || 'bg-gray-100 text-gray-700'
                              }`}>
                                {sponsorTypes[asset['healthdcatap:sponsor'].type as keyof typeof sponsorTypes]?.icon} {asset['healthdcatap:sponsor'].name}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Member States - only show for multinational trials */}
                        {asset['healthdcatap:memberStates'] && asset['healthdcatap:memberStates'].length > 1 && (
                          <div className="mb-2 flex items-center gap-1 text-xs">
                            <span className="text-gray-500">Countries:</span>
                            {asset['healthdcatap:memberStates'].map(code => (
                              <span key={code} title={memberStateFlags[code]?.name}>
                                {memberStateFlags[code]?.flag}
                              </span>
                            ))}
                          </div>
                        )}
                        {asset['healthdcatap:medDRA'] && (
                          <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                            <div className="flex items-center gap-1 text-gray-700">
                              <span className="font-semibold">MedDRA SOC:</span>
                              <span>{asset['healthdcatap:medDRA'].socName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="font-semibold">PT:</span>
                              <span>{asset['healthdcatap:medDRA'].ptName}</span>
                              <span className="font-mono ml-1 text-gray-500">({asset['healthdcatap:medDRA'].ptCode})</span>
                            </div>
                          </div>
                        )}
                        {asset['healthdcatap:signalStatus'] && asset['healthdcatap:signalStatus'].adrCount > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-orange-700">
                            <AlertCircle className="w-3 h-3" />
                            <span>{asset['healthdcatap:signalStatus'].adrCount} ADR(s) reported</span>
                          </div>
                        )}
                        {asset['healthdcatap:sensitiveCategory'] && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                            <Shield className="w-3 h-3" />
                            <span>Sensitive: {asset['healthdcatap:sensitiveCategory'].replace('-', ' ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredAssets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No EHR records match your filters. Try adjusting your search criteria.
                </div>
              )}
            </div>

            {/* Continue Button */}
            {selectedAsset && (
              <div className="flex justify-end">
                <button
                  onClick={() => setPhase('negotiation')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Request Consent Verification for "{selectedAsset['dct:title']}"
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          </div>
        )}

        {/* NEGOTIATION PHASE */}
        {phase === 'negotiation' && selectedAsset && (
          <div className="space-y-6">
            <PhaseHeader 
              phase={healthDspPhases.negotiation}
              icon={<Lock className="w-6 h-6" />}
            />

            {/* Patient Consent Display - MOVED TO TOP */}
            {getMockAsset(selectedAsset)?.['healthdcatap:consent'] && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Patient Consent Declaration
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <div>
                        <div className="font-medium text-green-900">Consent Active</div>
                        <div className="text-sm text-green-700">Granted by: {getMockAsset(selectedAsset)?.['healthdcatap:consent']?.grantor}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Valid Until</div>
                      <div className="font-medium text-green-900">{getMockAsset(selectedAsset)?.['healthdcatap:consent']?.validUntil}</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Permitted Purposes */}
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                      ✓ Permitted Data Use Purposes
                    </h4>
                    <div className="space-y-2">
                      {getMockAsset(selectedAsset)?.['healthdcatap:consent']?.purposes.map((purpose) => {
                        const purposeInfo = consentPurposes[purpose as keyof typeof consentPurposes];
                        return purposeInfo ? (
                          <div key={purpose} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                            <span className="text-xl">{purposeInfo.icon}</span>
                            <div>
                              <div className="font-medium text-green-900">{purposeInfo.label}</div>
                              <div className="text-xs text-green-700">{purposeInfo.description}</div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                      ✗ Consent Restrictions
                    </h4>
                    <div className="space-y-2">
                      {getMockAsset(selectedAsset)?.['healthdcatap:consent']?.restrictions.map((restriction) => {
                        const restrictionInfo = consentRestrictions[restriction as keyof typeof consentRestrictions];
                        return restrictionInfo ? (
                          <div key={restriction} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
                            <span className="text-xl">{restrictionInfo.icon}</span>
                            <div>
                              <div className="font-medium text-red-900">{restrictionInfo.label}</div>
                              <div className="text-xs text-red-700">{restrictionInfo.description}</div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Protocol Details - COLLAPSIBLE */}
            <CollapsibleSection 
              title="Technical Protocol Details" 
              defaultOpen={false}
              icon={<Code className="w-5 h-5" />}
              className="border-purple-200"
            >
              <div className="space-y-6">
                {/* State Machine Visualization */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Contract Negotiation State Machine</h3>
                  <div className="flex items-center justify-between overflow-x-auto pb-4">
                    {mockNegotiationFlow.map((state, i) => (
                      <div key={i} className="flex items-center">
                        <div className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all ${
                          i < negotiationStep 
                            ? 'bg-green-100 text-green-900'
                            : i === negotiationStep
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          {i < negotiationStep ? (
                            <CheckCircle className="w-6 h-6 mb-1" />
                          ) : i === negotiationStep && isAnimating ? (
                            <Loader2 className="w-6 h-6 mb-1 animate-spin" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 mb-1" />
                          )}
                          <span className="text-xs font-medium whitespace-nowrap">
                            {state['dspace:state']}
                          </span>
                        </div>
                        {i < mockNegotiationFlow.length - 1 && (
                          <ArrowRight className={`w-5 h-5 mx-1 ${
                            i < negotiationStep ? 'text-green-500' : 'text-gray-300'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Sequence */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Protocol Messages</h3>
                  <div className="space-y-3">
                    {healthDspPhases.negotiation.steps.map((step, i) => (
                      <div 
                        key={i}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                          i <= negotiationStep
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-gray-200 opacity-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          i < negotiationStep
                            ? 'bg-green-500 text-white'
                            : i === negotiationStep
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-300 text-gray-600'
                        }`}>
                          {i < negotiationStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{step.name}</div>
                          <div className="text-sm text-gray-600">{step.description}</div>
                        </div>
                        <div className="text-sm text-blue-600 font-mono">{step.direction}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Policy (ODRL) */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    Technical Policy Enforcement (ODRL)
                  </h3>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-purple-900 mb-2">Permission</h4>
                        <div className="bg-white rounded p-3 text-sm">
                          <code>MembershipCredential = active</code>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-purple-900 mb-2">Obligation</h4>
                        <div className="bg-white rounded p-3 text-sm">
                          <code>DataAccess.level = processing</code>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-900 mb-2">Prohibition</h4>
                        <div className="bg-white rounded p-3 text-sm border border-red-200">
                          <code>Re-identification = forbidden</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Contract Agreement Status (Real EDC) */}
            {contractAgreementId && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Contract Agreement Established
                </h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Agreement ID:</span>
                      <code className="ml-2 bg-white px-2 py-1 rounded text-xs font-mono break-all">
                        {contractAgreementId}
                      </code>
                    </div>
                    <div>
                      <span className="text-gray-600">Source:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {getApiMode() === 'full' ? 'EDC Control Plane' : 'Hybrid (EDC + Mock)'}
                      </span>
                    </div>
                    {negotiationStartTime && negotiationEndTime && (
                      <>
                        <div>
                          <span className="text-gray-600">Started:</span>
                          <span className="ml-2 text-xs">{negotiationStartTime.toLocaleTimeString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 text-xs font-medium text-green-700">
                            {((negotiationEndTime.getTime() - negotiationStartTime.getTime()) / 1000).toFixed(2)}s
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end">
              {negotiationStep < mockNegotiationFlow.length - 1 ? (
                <button
                  onClick={simulateNegotiation}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isAnimating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying Consent...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Run Consent Verification
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setPhase('transfer')}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Consent Verified - Start Transfer
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* TRANSFER PHASE */}
        {phase === 'transfer' && selectedAsset && (
          <div className="space-y-6">
            <PhaseHeader 
              phase={healthDspPhases.transfer}
              icon={<Send className="w-6 h-6" />}
            />

            {/* De-identification Notice - MOVED TO TOP */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-900 font-medium">
                <Shield className="w-5 h-5" />
                De-identification Applied (k-anonymity, k=5)
              </div>
              <p className="text-sm text-yellow-800 mt-2">
                Data is processed through k-anonymity pipeline before transfer. All direct identifiers removed, 
                indirect identifiers generalized to ensure patient privacy.
              </p>
            </div>

            {/* Transfer Protocol Details - COLLAPSIBLE */}
            <CollapsibleSection 
              title="Transfer Protocol Details" 
              defaultOpen={false}
              icon={<Send className="w-5 h-5" />}
              className="border-green-200"
            >
              <div className="space-y-6">
                {/* Transfer State Machine */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Transfer Process State Machine</h3>
                  <div className="flex items-center justify-center gap-4 overflow-x-auto pb-4">
                    {mockTransferFlow.map((state, i) => (
                      <div key={i} className="flex items-center">
                        <div className={`flex flex-col items-center px-6 py-3 rounded-lg transition-all ${
                          i < transferStep 
                            ? 'bg-green-100 text-green-900'
                            : i === transferStep
                              ? 'bg-green-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          {i < transferStep ? (
                            <CheckCircle className="w-8 h-8 mb-1" />
                          ) : i === transferStep && isAnimating ? (
                            <Loader2 className="w-8 h-8 mb-1 animate-spin" />
                          ) : (
                            <Send className="w-8 h-8 mb-1" />
                          )}
                          <span className="text-sm font-medium whitespace-nowrap">
                            {state['dspace:state']}
                          </span>
                        </div>
                        {i < mockTransferFlow.length - 1 && (
                          <ArrowRight className={`w-6 h-6 mx-2 ${
                            i < transferStep ? 'text-green-500' : 'text-gray-300'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transfer Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Transfer Configuration</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-900 mb-2">Transfer Type</h4>
                      <div className="bg-white rounded p-3">
                        <code className="text-sm">HttpData-PULL (FHIR Bundle)</code>
                      </div>
                      <p className="text-xs text-green-700 mt-2">
                        Research institute pulls de-identified EHR from Hospital&apos;s data plane
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-teal-900 mb-2">Data Address</h4>
                      <div className="bg-white rounded p-3 font-mono text-xs break-all">
                        https://provider.rheinland-uklinikum.de/fhir/Bundle/{(selectedAsset['@id'] ?? '').split(':').pop()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Real EDC Contract Reference */}
                  {contractAgreementId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Contract Agreement:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {contractAgreementId.slice(0, 20)}...
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">Transfer Mode:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          getApiMode() === 'full' 
                            ? 'bg-purple-100 text-purple-700'
                            : getApiMode() === 'hybrid'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                      {getApiMode() === 'full' ? 'Full EDC' : getApiMode() === 'hybrid' ? 'Hybrid' : 'Mock'}
                    </span>
                  </div>
                  {transferStartTime && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Transfer Started:</span>
                      <span className="text-xs">{transferStartTime.toLocaleTimeString()}</span>
                    </div>
                  )}
                  {transferEndTime && transferStartTime && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Transfer Duration:</span>
                      <span className="text-xs font-medium text-green-700">
                        {((transferEndTime.getTime() - transferStartTime.getTime()) / 1000).toFixed(2)}s
                      </span>
                    </div>
                  )}
                </div>
              )}
                </div>
              </div>
            </CollapsibleSection>

            {/* Action Button */}
            <div className="flex justify-end">
              {transferStep < mockTransferFlow.length - 1 ? (
                <button
                  onClick={simulateTransfer}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isAnimating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Transferring EHR...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Transfer
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPhase('complete');
                    loadEhrData();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  View EHR Data
                </button>
              )}
            </div>
          </div>
        )}

        {/* COMPUTE PHASE */}
        {phase === 'compute' && selectedAsset && (
          <div className="space-y-6">
            <PhaseHeader 
              phase={healthDspPhases.compute}
              icon={<Lock className="w-6 h-6" />}
            />

            {/* Compute State Machine */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Confidential Compute Workflow</h3>
              <div className="flex items-center justify-center gap-4 overflow-x-auto pb-4">
                {mockComputeFlow.map((state, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`flex flex-col items-center px-6 py-3 rounded-lg transition-all ${
                      i < computeStep 
                        ? 'bg-indigo-100 text-indigo-800'
                        : i === computeStep
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < computeStep ? (
                        <CheckCircle className="w-8 h-8 mb-1" />
                      ) : i === computeStep && isAnimating ? (
                        <Loader2 className="w-8 h-8 mb-1 animate-spin" />
                      ) : (
                        <Lock className="w-8 h-8 mb-1" />
                      )}
                      <span className="text-sm font-medium whitespace-nowrap">
                        {state.label}
                      </span>
                    </div>
                    {i < mockComputeFlow.length - 1 && (
                      <ArrowRight className={`w-6 h-6 mx-2 ${
                        i < computeStep ? 'text-indigo-500' : 'text-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Compute Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Secure Enclave Configuration</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-indigo-800 mb-2">Execution Environment</h4>
                  <div className="bg-white rounded p-3">
                    <code className="text-sm">Intel SGX / AMD SEV-SNP</code>
                  </div>
                  <p className="text-xs text-indigo-700 mt-2">
                    Code and data are isolated from the host OS and hypervisor.
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Encryption Policy</h4>
                  <div className="bg-white rounded p-3 font-mono text-xs">
                    Security.confidentialComputing = true
                    <br/>
                    Security.encryptionInTransit = true
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              {computeStep < mockComputeFlow.length - 1 ? (
                <button
                  onClick={simulateCompute}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isAnimating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Running Secure Analysis...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Secure Analysis
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* COMPLETE PHASE */}
        {phase === 'complete' && selectedAsset && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold">EHR Transfer Complete!</h2>
                  <p className="text-green-100">
                    The de-identified Electronic Health Record has been successfully received and is ready for EDC integration.
                  </p>
                </div>
              </div>
            </div>

            {/* EHR Viewer - if detailed data available */}
            {ehrData ? (
              <EHRViewer ehr={ehrData} />
            ) : (
              /* Fallback: Show summary from catalog asset when detailed EHR data not available */
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">Electronic Health Record</h2>
                      <p className="text-blue-200 mt-1">FHIR Bundle - De-identified for Research</p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {getMockAsset(selectedAsset)?.['healthdcatap:consentStatus'] || 'Unknown'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-200">Pseudonym ID:</span>
                      <span className="ml-2 font-mono">{getMockAsset(selectedAsset)?.['healthdcatap:consent']?.grantor.match(/[A-Z0-9]+\)?$/)?.[0]?.replace(')', '') || 'ANON-' + (selectedAsset['@id'] ?? '').split(':').pop()}</span>
                    </div>
                    <div>
                      <span className="text-blue-200">Transfer Date:</span>
                      <span className="ml-2">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Consent Scope */}
                  {getMockAsset(selectedAsset)?.['healthdcatap:consent'] && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Consent Scope</h3>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Permitted Purposes:</span>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {getMockAsset(selectedAsset)?.['healthdcatap:consent']?.purposes.map((purpose) => {
                                const purposeInfo = consentPurposes[purpose as keyof typeof consentPurposes];
                                return purposeInfo ? (
                                  <span key={purpose} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                                    <CheckCircle className="w-3 h-3" />
                                    {purposeInfo.label}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Restrictions:</span>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {getMockAsset(selectedAsset)?.['healthdcatap:consent']?.restrictions.map((restriction) => {
                                const restrictionInfo = consentRestrictions[restriction as keyof typeof consentRestrictions];
                                return restrictionInfo ? (
                                  <span key={restriction} className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                                    {restrictionInfo.icon}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Valid Until:</span>
                            <div className="font-medium text-gray-900">{getMockAsset(selectedAsset)?.['healthdcatap:consent']?.validUntil}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Jurisdiction:</span>
                            <div className="font-medium text-gray-900">DE-NW (Germany)</div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Demographics */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Demographics (Anonymized)</h3>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm text-gray-600">Age Band</div>
                        <div className="text-xl font-bold text-gray-900">{getMockAsset(selectedAsset)?.['healthdcatap:ageRange'] || 'N/A'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm text-gray-600">Biological Sex</div>
                        <div className="text-xl font-bold text-gray-900 capitalize">{getMockAsset(selectedAsset)?.['healthdcatap:biologicalSex'] || 'N/A'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm text-gray-600">Region</div>
                        <div className="font-medium text-gray-900">Nordrhein-Westfalen</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm text-gray-600">Category</div>
                        <div className="font-medium text-gray-900 capitalize">
                          {medicalCategories[getMockAsset(selectedAsset)?.['healthdcatap:category'] as keyof typeof medicalCategories]?.icon}{' '}
                          {medicalCategories[getMockAsset(selectedAsset)?.['healthdcatap:category'] as keyof typeof medicalCategories]?.label}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Primary Diagnosis */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Primary Diagnosis (ICD-10-GM)</h3>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-red-800">Primary Diagnosis</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-mono">
                            {getMockAsset(selectedAsset)?.['healthdcatap:icdCode'] || 'N/A'}
                          </span>
                        </div>
                        <div className="text-lg font-medium text-gray-900">
                          {getMockAsset(selectedAsset)?.['healthdcatap:diagnosis'] || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {selectedAsset['dct:description']}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Study Eligibility */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-cyan-600" />
                      <h3 className="text-lg font-semibold text-gray-900">EDC Integration Ready</h3>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        EHR-TO-EDC-{(getMockAsset(selectedAsset)?.['healthdcatap:category'] || 'UNKNOWN').toUpperCase()}-2025
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        REGISTRY-{(getMockAsset(selectedAsset)?.['healthdcatap:icdCode'] || 'N/A').split('.')[0]}-2025
                      </span>
                    </div>
                  </section>

                  {/* Data Provenance */}
                  <section className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-5 h-5 text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-700">Data Provenance</h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Source System:</span>
                        <div className="font-medium text-gray-900">Rheinland-UK-EHR-v4</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Extraction Date:</span>
                        <div className="font-medium text-gray-900">{new Date().toISOString().slice(0, 7)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">De-identification:</span>
                        <div className="font-medium text-gray-900">k-anonymity (k=5)</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Quality Score:</span>
                        <div className="font-medium text-green-600">94%</div>
                      </div>
                    </div>
                  </section>

                  {/* Credential Info */}
                  <section className="border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Verifiable Credential issued by did:web:rheinland-uklinikum.de</span>
                    </div>
                    <div className="mt-2 text-xs font-mono text-gray-400 break-all">
                      ID: did:web:rheinland-uklinikum.de:ehr:{(selectedAsset['@id'] ?? '').split(':').pop()}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* Collapsible FHIR JSON Viewer */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <button
                onClick={() => setShowFhirJson(!showFhirJson)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileJson className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">FHIR Bundle (JSON-LD)</h3>
                    <p className="text-sm text-gray-500">View raw de-identified health record data</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showFhirJson ? 'rotate-180' : ''}`} />
              </button>
              
              {showFhirJson && (
                <div className="border-t">
                  <div className="p-4 bg-slate-900 overflow-auto max-h-[600px]">
                    <pre className="text-sm font-mono">
                      <FhirJsonHighlighter 
                        data={ehrData || (getMockAsset(selectedAsset) ? generateFhirBundle(getMockAsset(selectedAsset)!) : null)} 
                      />
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Restart */}
            <div className="flex justify-center">
              <button
                onClick={resetDemo}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Try Another EHR
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-6">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-row justify-between items-center gap-4 flex-wrap">
            <div className="text-sm text-gray-500 flex items-center gap-2 flex-shrink-0">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />Health Dataspace Demo</a>
              <span>based on</span>
              <a href="https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                <BookOpen className="w-4 h-4" /> Dataspace Protocol 2025-1
              </a>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <a
                href="https://github.com/eclipse-edc/MinimumViableDataspace"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                Eclipse Dataspace Components (Minimum Viable Dataspace)
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Phase Header Component
interface PhaseHeaderProps {
  phase: {
    title: string;
    description: string;
    specLink: string;
  };
  icon: React.ReactNode;
}

function PhaseHeader({ phase, icon }: PhaseHeaderProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{phase.title}</h2>
            <p className="text-gray-600 max-w-2xl">{phase.description}</p>
          </div>
        </div>
        <a
          href={phase.specLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
        >
          <BookOpen className="w-4 h-4" />
          View Spec
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// Generate FHIR Bundle from catalog asset when detailed data not available
function generateFhirBundle(asset: MockEHRAsset) {
  const pseudonymId = asset['healthdcatap:consent']?.grantor.match(/[A-Z0-9]+\)?$/)?.[0]?.replace(')', '') || 'ANON-' + asset['@id'].split(':').pop();
  
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/ehds/ehr/v1',
      'http://hl7.org/fhir'
    ],
    id: `did:web:rheinland-uklinikum.de:ehr:${asset['@id'].split(':').pop()}`,
    type: ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    issuer: 'did:web:rheinland-uklinikum.de',
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: `did:web:rheinland-uklinikum.de:patient:pseudonym:${pseudonymId}`,
      resourceType: 'Bundle',
      studyEligibility: [
        `EHR-TO-EDC-${asset['healthdcatap:category'].toUpperCase()}-2025`,
        `REGISTRY-${asset['healthdcatap:icdCode'].split('.')[0]}-2025`
      ],
      consentScope: {
        purposes: asset['healthdcatap:consent']?.purposes || ['clinical-research'],
        dataCategories: ['demographics', 'conditions', 'observations', 'medications'],
        retentionPeriod: '10-years',
        jurisdiction: 'DE-NW',
        restrictions: asset['healthdcatap:consent']?.restrictions || ['no-reidentification'],
        validUntil: asset['healthdcatap:consent']?.validUntil || '2027-12-31'
      },
      demographicsNode: {
        pseudonymId: pseudonymId,
        ageBand: asset['healthdcatap:ageRange'],
        biologicalSex: asset['healthdcatap:biologicalSex'],
        region: 'Nordrhein-Westfalen',
        enrollmentPeriod: '2024-Q4'
      },
      conditionsNode: {
        primaryDiagnosis: {
          code: asset['healthdcatap:icdCode'],
          system: 'ICD-10-GM',
          display: asset['healthdcatap:diagnosis'],
          clinicalStatus: 'active'
        },
        comorbidities: []
      },
      observationsNode: {
        latestVitals: {
          recordPeriod: new Date().toISOString().slice(0, 7).replace('-', '-Q'),
          bmiCategory: 'normal',
          bloodPressureCategory: 'normal'
        },
        labResults: []
      },
      medicationsNode: {
        activeTherapies: []
      },
      provenanceNode: {
        sourceSystem: 'Rheinland-UK-EHR-v4',
        extractionDate: new Date().toISOString().slice(0, 7),
        deIdentificationMethod: 'k-anonymity-k5',
        qualityScore: 0.94
      }
    }
  };
}

// FHIR JSON Syntax Highlighter Component
function FhirJsonHighlighter({ data }: { data: unknown }) {
  const colorize = (json: string): JSX.Element[] => {
    const lines = json.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Colorize the line - order matters!
      let coloredLine = line;
      
      // First: Escape any HTML in the content
      coloredLine = coloredLine.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Brackets and braces - make them bright
      coloredLine = coloredLine.replace(/([[\]{}])/g, 
        '<span class="text-yellow-300">$1</span>');
      
      // Commas - subtle but visible
      coloredLine = coloredLine.replace(/,$/g, 
        '<span class="text-gray-400">,</span>');
      
      // String values in arrays (no colon before them)
      coloredLine = coloredLine.replace(/^(\s*)"([^"]+)"(?=[,\]]|$)/gm, 
        '$1<span class="text-emerald-300">"$2"</span>');
      
      // Keys (property names) - before colon
      coloredLine = coloredLine.replace(/"(@?[\w:]+)"(\s*:)/g, 
        '<span class="text-sky-300">"$1"</span><span class="text-gray-400">$2</span>');
      
      // String values (after colon)
      coloredLine = coloredLine.replace(/:(\s*)"([^"]*)"/g, 
        ':<span class="text-gray-400">$1</span><span class="text-emerald-300">"$2"</span>');
      
      // Numbers - bright orange
      coloredLine = coloredLine.replace(/:(\s*)(\d+\.?\d*)(?=[,\s\n\]}<]|$)/g, 
        ':<span class="text-gray-400">$1</span><span class="text-orange-300">$2</span>');
      
      // Booleans - purple
      coloredLine = coloredLine.replace(/:(\s*)(true|false)/g, 
        ':<span class="text-gray-400">$1</span><span class="text-violet-400">$2</span>');
      
      // null - gray
      coloredLine = coloredLine.replace(/:(\s*)(null)/g, 
        ':<span class="text-gray-400">$1</span><span class="text-gray-500">$2</span>');
      
      // Special FHIR/VC keywords highlighting - pink/magenta
      const specialKeys = ['@context', '@id', '@type', 'resourceType', 'credentialSubject', 'issuer', 'type', 'id'];
      specialKeys.forEach(key => {
        coloredLine = coloredLine.replace(
          new RegExp(`<span class="text-sky-300">"(${key})"</span>`, 'g'),
          '<span class="text-pink-300 font-medium">"$1"</span>'
        );
      });
      
      // Health-specific keys - bright blue bold
      const healthKeys = ['consentScope', 'demographicsNode', 'conditionsNode', 'observationsNode', 'medicationsNode', 'provenanceNode', 'studyEligibility'];
      healthKeys.forEach(key => {
        coloredLine = coloredLine.replace(
          new RegExp(`<span class="text-sky-300">"(${key})"</span>`, 'g'),
          '<span class="text-blue-300 font-bold">"$1"</span>'
        );
      });
      
      return (
        <div key={lineIndex} className="hover:bg-slate-700/50 px-2 -mx-2 leading-relaxed">
          <span className="text-slate-500 select-none w-10 inline-block text-right mr-4 text-xs">{lineIndex + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: coloredLine }} />
        </div>
      );
    });
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  
  return <div className="text-slate-100">{colorize(jsonString)}</div>;
}

// Wrap AppHealth with the DSP Event Log Provider and Error Boundary
function AppHealthWithProvider() {
  return (
    <ErrorBoundary>
      <DspEventLogProvider>
        <AppHealth />
        <DebugPanel />
      </DspEventLogProvider>
    </ErrorBoundary>
  );
}

export default AppHealthWithProvider;
