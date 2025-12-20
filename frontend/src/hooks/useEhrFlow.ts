/**
 * Unified hook for EHR data flow management
 * 
 * Orchestrates catalog fetching, negotiation, and transfer in a single flow.
 * Adapts to mock/hybrid/full modes automatically via apiFactory.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { api, getApiMode } from '../services/apiFactory';
import type { CatalogAsset } from '../services/apiFactory';
import type { ElectronicHealthRecord } from '../types/health';

export type FlowState = 
  | 'IDLE'
  | 'LOADING_CATALOG'
  | 'CATALOG_READY'
  | 'NEGOTIATING'
  | 'NEGOTIATION_COMPLETE'
  | 'TRANSFERRING'
  | 'TRANSFER_COMPLETE'
  | 'COMPUTING'
  | 'COMPLETE'
  | 'ERROR';

export interface FlowStep {
  label: string;
  description: string;
  state: 'pending' | 'active' | 'complete' | 'error';
  detail?: string;
}

interface UseEhrFlowOptions {
  pollInterval?: number;
  maxPollAttempts?: number;
  retryAttempts?: number;
  onNegotiationStep?: (step: FlowStep) => void;
  onTransferStep?: (step: FlowStep) => void;
}

interface UseEhrFlowReturn {
  // Catalog state
  assets: CatalogAsset[];
  catalogLoading: boolean;
  catalogError: Error | null;
  
  // Flow state
  flowState: FlowState;
  negotiationSteps: FlowStep[];
  transferSteps: FlowStep[];
  
  // Results
  contractAgreementId: string | null;
  transferId: string | null;
  ehrData: ElectronicHealthRecord | null;
  
  // Actions
  fetchCatalog: () => Promise<void>;
  startNegotiation: (assetId: string, offerId: string, policyId?: string) => Promise<void>;
  startTransfer: (contractAgreementId: string, assetId: string) => Promise<void>;
  startFullFlow: (assetId: string, offerId?: string, policyId?: string) => Promise<void>;
  reset: () => void;
  
  // Error handling
  error: Error | null;
  mode: 'mock' | 'hybrid' | 'full';
}

// DSP Negotiation states to display labels
const NEGOTIATION_STATE_LABELS: Record<string, string> = {
  'INITIAL': 'Initializing',
  'REQUESTING': 'Requesting Contract',
  'REQUESTED': 'Contract Requested',
  'OFFERING': 'Provider Offering',
  'OFFERED': 'Offer Received',
  'ACCEPTING': 'Accepting Offer',
  'ACCEPTED': 'Offer Accepted',
  'AGREEING': 'Finalizing Agreement',
  'AGREED': 'Agreement Ready',
  'VERIFYING': 'Verifying Credentials',
  'VERIFIED': 'Credentials Verified',
  'FINALIZING': 'Finalizing Contract',
  'FINALIZED': 'Contract Finalized',
  'TERMINATED': 'Negotiation Failed',
};

// DSP Transfer states to display labels
const TRANSFER_STATE_LABELS: Record<string, string> = {
  'INITIAL': 'Initializing Transfer',
  'PROVISIONING': 'Provisioning Resources',
  'PROVISIONED': 'Resources Ready',
  'REQUESTING': 'Requesting Data',
  'REQUESTED': 'Request Sent',
  'STARTING': 'Starting Transfer',
  'STARTED': 'Transfer In Progress',
  'COMPLETING': 'Completing Transfer',
  'COMPLETED': 'Transfer Complete',
  'DEPROVISIONING': 'Cleaning Up',
  'DEPROVISIONED': 'Cleanup Complete',
  'TERMINATED': 'Transfer Failed',
};

export function useEhrFlow(options: UseEhrFlowOptions = {}): UseEhrFlowReturn {
  const {
    pollInterval = 2000,
    maxPollAttempts = 30,
    // retryAttempts reserved for future use
    onNegotiationStep,
    onTransferStep,
  } = options;

  // Catalog state
  const [assets, setAssets] = useState<CatalogAsset[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<Error | null>(null);

  // Flow state
  const [flowState, setFlowState] = useState<FlowState>('IDLE');
  const [negotiationSteps, setNegotiationSteps] = useState<FlowStep[]>([]);
  const [transferSteps, setTransferSteps] = useState<FlowStep[]>([]);

  // Results
  const [contractAgreementId, setContractAgreementId] = useState<string | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [ehrData, setEhrData] = useState<ElectronicHealthRecord | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Refs for cleanup
  const isCancelledRef = useRef(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mode = getApiMode();

  // Cleanup
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  // Update negotiation step
  const updateNegotiationStep = useCallback((state: string, detail?: string) => {
    const step: FlowStep = {
      label: NEGOTIATION_STATE_LABELS[state] || state,
      description: `DSP State: ${state}`,
      state: state === 'FINALIZED' ? 'complete' : state === 'TERMINATED' ? 'error' : 'active',
      detail,
    };
    setNegotiationSteps(prev => [...prev, step]);
    onNegotiationStep?.(step);
  }, [onNegotiationStep]);

  // Update transfer step
  const updateTransferStep = useCallback((state: string, detail?: string) => {
    const step: FlowStep = {
      label: TRANSFER_STATE_LABELS[state] || state,
      description: `DSP State: ${state}`,
      state: state === 'COMPLETED' ? 'complete' : state === 'TERMINATED' ? 'error' : 'active',
      detail,
    };
    setTransferSteps(prev => [...prev, step]);
    onTransferStep?.(step);
  }, [onTransferStep]);

  // Fetch catalog
  const fetchCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    setFlowState('LOADING_CATALOG');

    try {
      if (mode === 'mock') {
        // In mock mode, use getEhrList
        const ehrList = await api.getEhrList();
        setAssets(ehrList.map(ehr => ({
          ehrId: ehr.ehrId,
          assetId: ehr.assetId || `ehr:${ehr.ehrId}`,
          title: ehr.title || `${ehr.ehrId} - ${ehr.diagnosis}`,
          description: ehr.diagnosis,
          healthCategory: ehr.healthCategory || 'General',
          ageBand: ehr.ageBand,
          biologicalSex: ehr.biologicalSex,
          clinicalPhase: ehr.clinicalPhase || 'N/A',
          meddraVersion: ehr.meddraVersion || '27.0',
          sensitiveCategory: ehr.sensitiveCategory || 'none',
          policies: [],
        })));
      } else {
        // In hybrid/full mode, use catalog API
        const response = await api.getCatalogAssets();
        setAssets(response.assets);
      }
      setFlowState('CATALOG_READY');
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch catalog');
      setCatalogError(fetchError);
      setError(fetchError);
      setFlowState('ERROR');
    } finally {
      setCatalogLoading(false);
    }
  }, [mode]);

  // Start negotiation
  const startNegotiation = useCallback(async (
    assetId: string, 
    offerId: string, 
    policyId?: string
  ) => {
    setFlowState('NEGOTIATING');
    setNegotiationSteps([]);
    setError(null);

    try {
      updateNegotiationStep('INITIAL');

      // In mock mode, negotiation is instant
      if (mode === 'mock') {
        const steps = ['REQUESTING', 'OFFERED', 'ACCEPTING', 'VERIFYING', 'FINALIZED'];
        for (const step of steps) {
          await new Promise(resolve => setTimeout(resolve, 400));
          if (isCancelledRef.current) return;
          updateNegotiationStep(step);
        }
        const mockId = `mock-agreement-${Date.now()}`;
        setContractAgreementId(mockId);
        setFlowState('NEGOTIATION_COMPLETE');
        return;
      }

      // Real negotiation flow
      const response = await api.initiateNegotiation(assetId, offerId, policyId);
      updateNegotiationStep(response.state, response.message);

      if (response.state === 'FINALIZED') {
        setContractAgreementId(response.contractAgreementId || null);
        setFlowState('NEGOTIATION_COMPLETE');
        return;
      }

      // Poll for completion
      let pollCount = 0;
      const poll = async () => {
        if (isCancelledRef.current || pollCount >= maxPollAttempts) return;
        
        try {
          const status = await api.pollNegotiation(response.negotiationId, pollInterval);
          updateNegotiationStep(status.state, status.message);

          if (status.state === 'FINALIZED') {
            setContractAgreementId(status.contractAgreementId || null);
            setFlowState('NEGOTIATION_COMPLETE');
          } else if (status.state === 'TERMINATED') {
            throw new Error(status.message || 'Negotiation terminated');
          } else {
            pollCount++;
            pollTimeoutRef.current = setTimeout(poll, pollInterval);
          }
        } catch (err) {
          const pollError = err instanceof Error ? err : new Error('Polling failed');
          setError(pollError);
          setFlowState('ERROR');
        }
      };

      pollTimeoutRef.current = setTimeout(poll, pollInterval);
    } catch (err) {
      const negError = err instanceof Error ? err : new Error('Negotiation failed');
      setError(negError);
      setFlowState('ERROR');
      updateNegotiationStep('TERMINATED', negError.message);
    }
  }, [mode, maxPollAttempts, pollInterval, updateNegotiationStep]);

  // Start transfer
  const startTransfer = useCallback(async (
    agreementId: string,
    assetId: string
  ) => {
    setFlowState('TRANSFERRING');
    setTransferSteps([]);
    setError(null);

    try {
      updateTransferStep('INITIAL');

      // In mock mode, transfer is instant
      if (mode === 'mock') {
        const steps = ['PROVISIONING', 'STARTING', 'STARTED', 'COMPLETING', 'COMPLETED'];
        for (const step of steps) {
          await new Promise(resolve => setTimeout(resolve, 400));
          if (isCancelledRef.current) return;
          updateTransferStep(step);
        }
        setTransferId(`mock-transfer-${Date.now()}`);
        setFlowState('TRANSFER_COMPLETE');
        return;
      }

      // Real transfer flow
      const response = await api.initiateTransfer(agreementId, assetId);
      setTransferId(response.transferId);
      updateTransferStep(response.state, response.message);

      if (response.state === 'COMPLETED') {
        setFlowState('TRANSFER_COMPLETE');
        return;
      }

      // Poll for completion
      let pollCount = 0;
      const poll = async () => {
        if (isCancelledRef.current || pollCount >= maxPollAttempts) return;
        
        try {
          const status = await api.pollTransfer(response.transferId, pollInterval);
          updateTransferStep(status.state, status.message);

          if (status.state === 'COMPLETED') {
            setFlowState('TRANSFER_COMPLETE');
          } else if (status.state === 'TERMINATED') {
            throw new Error(status.message || 'Transfer terminated');
          } else {
            pollCount++;
            pollTimeoutRef.current = setTimeout(poll, pollInterval);
          }
        } catch (err) {
          const pollError = err instanceof Error ? err : new Error('Transfer polling failed');
          setError(pollError);
          setFlowState('ERROR');
        }
      };

      pollTimeoutRef.current = setTimeout(poll, pollInterval);
    } catch (err) {
      const transferError = err instanceof Error ? err : new Error('Transfer failed');
      setError(transferError);
      setFlowState('ERROR');
      updateTransferStep('TERMINATED', transferError.message);
    }
  }, [mode, maxPollAttempts, pollInterval, updateTransferStep]);

  // Full flow: negotiate + transfer + fetch data
  const startFullFlow = useCallback(async (
    assetId: string,
    offerId?: string,
    policyId?: string
  ) => {
    // Reset state
    setNegotiationSteps([]);
    setTransferSteps([]);
    setContractAgreementId(null);
    setTransferId(null);
    setEhrData(null);
    setError(null);

    // Step 1: Negotiate
    setFlowState('NEGOTIATING');
    
    try {
      updateNegotiationStep('INITIAL');

      // In mock mode, simulate the full flow
      if (mode === 'mock') {
        // Simulate negotiation
        const negSteps = ['REQUESTING', 'OFFERED', 'ACCEPTING', 'VERIFYING', 'FINALIZED'];
        for (const step of negSteps) {
          await new Promise(resolve => setTimeout(resolve, 400));
          if (isCancelledRef.current) return;
          updateNegotiationStep(step);
        }
        const mockAgreementId = `mock-agreement-${Date.now()}`;
        setContractAgreementId(mockAgreementId);
        setFlowState('NEGOTIATION_COMPLETE');

        // Small pause between phases
        await new Promise(resolve => setTimeout(resolve, 500));
        if (isCancelledRef.current) return;

        // Simulate transfer
        setFlowState('TRANSFERRING');
        updateTransferStep('INITIAL');
        const transferSteps = ['PROVISIONING', 'STARTING', 'STARTED', 'COMPLETING', 'COMPLETED'];
        for (const step of transferSteps) {
          await new Promise(resolve => setTimeout(resolve, 400));
          if (isCancelledRef.current) return;
          updateTransferStep(step);
        }
        const mockTransferId = `mock-transfer-${Date.now()}`;
        setTransferId(mockTransferId);
        setFlowState('TRANSFER_COMPLETE');

        // Fetch EHR data
        await new Promise(resolve => setTimeout(resolve, 300));
        if (isCancelledRef.current) return;

        const ehrId = assetId.replace('ehr:', '');
        const data = await api.getEhr(ehrId);
        setEhrData(data as unknown as ElectronicHealthRecord);
        setFlowState('COMPLETE');
        return;
      }

      // Real flow: negotiate first
      const negResponse = await api.initiateNegotiation(assetId, offerId || assetId, policyId);
      updateNegotiationStep(negResponse.state, negResponse.message);

      // Wait for negotiation to complete (simplified - real impl would poll)
      if (negResponse.state !== 'FINALIZED') {
        const finalNeg = await api.pollNegotiation(negResponse.negotiationId, 30000);
        updateNegotiationStep(finalNeg.state, finalNeg.message);
        if (finalNeg.state !== 'FINALIZED') {
          throw new Error('Negotiation did not complete');
        }
        setContractAgreementId(finalNeg.contractAgreementId || null);
      } else {
        setContractAgreementId(negResponse.contractAgreementId || null);
      }
      setFlowState('NEGOTIATION_COMPLETE');

      // Step 2: Transfer
      await new Promise(resolve => setTimeout(resolve, 500));
      setFlowState('TRANSFERRING');
      updateTransferStep('INITIAL');

      const agreementId = contractAgreementId || negResponse.contractAgreementId;
      if (!agreementId) throw new Error('No contract agreement ID');

      const transferResponse = await api.initiateTransfer(agreementId, assetId);
      setTransferId(transferResponse.transferId);
      updateTransferStep(transferResponse.state, transferResponse.message);

      if (transferResponse.state !== 'COMPLETED') {
        const finalTransfer = await api.pollTransfer(transferResponse.transferId, 30000);
        updateTransferStep(finalTransfer.state, finalTransfer.message);
        if (finalTransfer.state !== 'COMPLETED') {
          throw new Error('Transfer did not complete');
        }
      }
      setFlowState('TRANSFER_COMPLETE');

      // Step 3: Fetch data via EDR
      const data = await api.fetchTransferData(transferResponse.transferId);
      setEhrData(data as ElectronicHealthRecord);
      setFlowState('COMPLETE');

    } catch (err) {
      const flowError = err instanceof Error ? err : new Error('Flow failed');
      setError(flowError);
      setFlowState('ERROR');
    }
  }, [mode, contractAgreementId, updateNegotiationStep, updateTransferStep]);

  // Reset
  const reset = useCallback(() => {
    isCancelledRef.current = false;
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
    setFlowState('IDLE');
    setNegotiationSteps([]);
    setTransferSteps([]);
    setContractAgreementId(null);
    setTransferId(null);
    setEhrData(null);
    setError(null);
    setCatalogError(null);
  }, []);

  return {
    assets,
    catalogLoading,
    catalogError,
    flowState,
    negotiationSteps,
    transferSteps,
    contractAgreementId,
    transferId,
    ehrData,
    fetchCatalog,
    startNegotiation,
    startTransfer,
    startFullFlow,
    reset,
    error,
    mode,
  };
}
