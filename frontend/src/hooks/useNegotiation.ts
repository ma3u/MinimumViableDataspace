/**
 * Custom hook for managing contract negotiation flow
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../services/apiFactory';
import type { NegotiationResponse } from '../services/apiFactory';

export type NegotiationState = 
  | 'IDLE'
  | 'INITIAL'
  | 'REQUESTING'
  | 'REQUESTED'
  | 'OFFERING'
  | 'OFFERED'
  | 'ACCEPTING'
  | 'ACCEPTED'
  | 'AGREEING'
  | 'AGREED'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'FINALIZING'
  | 'FINALIZED'
  | 'TERMINATING'
  | 'TERMINATED';

interface UseNegotiationOptions {
  pollInterval?: number;
  maxPollAttempts?: number;
  retryAttempts?: number;
  retryDelay?: number;
  onSuccess?: (contractAgreementId: string) => void;
  onError?: (error: Error) => void;
}

interface UseNegotiationReturn {
  negotiationId: string | null;
  state: NegotiationState;
  contractAgreementId: string | null;
  isNegotiating: boolean;
  error: Error | null;
  message: string | null;
  initiateNegotiation: (assetId: string, offerId: string, policyId?: string) => Promise<void>;
  cancelNegotiation: () => void;
  reset: () => void;
}

export function useNegotiation(options: UseNegotiationOptions = {}): UseNegotiationReturn {
  const {
    pollInterval = 2000,
    maxPollAttempts = 30,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [negotiationId, setNegotiationId] = useState<string | null>(null);
  const [state, setState] = useState<NegotiationState>('IDLE');
  const [contractAgreementId, setContractAgreementId] = useState<string | null>(null);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);
  const isCancelledRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      isCancelledRef.current = true;
    };
  }, []);

  const pollNegotiation = useCallback(async (id: string) => {
    if (isCancelledRef.current) return;

    try {
      const response: NegotiationResponse = await api.getNegotiation(id);
      
      if (isCancelledRef.current) return;

      setState(response.state as NegotiationState);
      setMessage(response.message || null);

      // Terminal states
      if (response.state === 'FINALIZED') {
        setContractAgreementId(response.contractAgreementId || null);
        setIsNegotiating(false);
        if (onSuccess && response.contractAgreementId) {
          onSuccess(response.contractAgreementId);
        }
        return;
      }

      if (response.state === 'TERMINATED') {
        setIsNegotiating(false);
        const terminationError = new Error(response.message || 'Negotiation was terminated');
        setError(terminationError);
        if (onError) {
          onError(terminationError);
        }
        return;
      }

      // Continue polling
      pollCountRef.current += 1;
      if (pollCountRef.current < maxPollAttempts) {
        pollTimeoutRef.current = setTimeout(() => {
          pollNegotiation(id);
        }, pollInterval);
      } else {
        const timeoutError = new Error('Negotiation polling timeout - maximum attempts reached');
        setError(timeoutError);
        setIsNegotiating(false);
        if (onError) {
          onError(timeoutError);
        }
      }
    } catch (err) {
      if (isCancelledRef.current) return;

      const pollError = err instanceof Error ? err : new Error('Failed to poll negotiation');
      console.error('Negotiation polling error:', pollError);
      
      // Retry logic
      const currentAttempt = attemptCount + 1;
      setAttemptCount(currentAttempt);
      
      if (currentAttempt < retryAttempts) {
        console.warn(`Negotiation poll failed (attempt ${currentAttempt}/${retryAttempts}), retrying...`);
        pollTimeoutRef.current = setTimeout(() => {
          pollNegotiation(id);
        }, retryDelay * currentAttempt);
      } else {
        setError(pollError);
        setIsNegotiating(false);
        if (onError) {
          onError(pollError);
        }
      }
    }
  }, [pollInterval, maxPollAttempts, retryAttempts, retryDelay, attemptCount, onSuccess, onError]);

  const initiateNegotiation = useCallback(async (
    assetId: string,
    offerId: string,
    policyId?: string
  ) => {
    // Reset state
    setError(null);
    setMessage(null);
    setContractAgreementId(null);
    setAttemptCount(0);
    pollCountRef.current = 0;
    isCancelledRef.current = false;
    
    setIsNegotiating(true);
    setState('INITIAL');

    try {
      const response = await api.initiateNegotiation(assetId, offerId, policyId);
      
      if (isCancelledRef.current) return;

      setNegotiationId(response.negotiationId);
      setState(response.state as NegotiationState);
      setMessage(response.message || null);

      // Check if already finalized (mock mode)
      if (response.state === 'FINALIZED') {
        setContractAgreementId(response.contractAgreementId || null);
        setIsNegotiating(false);
        if (onSuccess && response.contractAgreementId) {
          onSuccess(response.contractAgreementId);
        }
      } else {
        // Start polling
        pollTimeoutRef.current = setTimeout(() => {
          pollNegotiation(response.negotiationId);
        }, pollInterval);
      }
    } catch (err) {
      const initiationError = err instanceof Error ? err : new Error('Failed to initiate negotiation');
      setError(initiationError);
      setIsNegotiating(false);
      setState('IDLE');
      if (onError) {
        onError(initiationError);
      }
    }
  }, [pollInterval, pollNegotiation, onSuccess, onError]);

  const cancelNegotiation = useCallback(() => {
    isCancelledRef.current = true;
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    setIsNegotiating(false);
    setState('IDLE');
  }, []);

  const reset = useCallback(() => {
    cancelNegotiation();
    setNegotiationId(null);
    setState('IDLE');
    setContractAgreementId(null);
    setError(null);
    setMessage(null);
    setAttemptCount(0);
    pollCountRef.current = 0;
  }, [cancelNegotiation]);

  return {
    negotiationId,
    state,
    contractAgreementId,
    isNegotiating,
    error,
    message,
    initiateNegotiation,
    cancelNegotiation,
    reset,
  };
}
