/**
 * Custom hook for managing data transfer flow
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../services/apiFactory';
import type { TransferResponse } from '../services/apiFactory';

export type TransferState =
  | 'IDLE'
  | 'INITIAL'
  | 'PROVISIONING'
  | 'PROVISIONED'
  | 'REQUESTING'
  | 'REQUESTED'
  | 'STARTING'
  | 'STARTED'
  | 'SUSPENDING'
  | 'SUSPENDED'
  | 'RESUMING'
  | 'COMPLETING'
  | 'COMPLETED'
  | 'DEPROVISIONING'
  | 'DEPROVISIONED'
  | 'TERMINATING'
  | 'TERMINATED';

interface UseTransferOptions {
  pollInterval?: number;
  maxPollAttempts?: number;
  retryAttempts?: number;
  retryDelay?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseTransferReturn {
  transferId: string | null;
  state: TransferState;
  isTransferring: boolean;
  error: Error | null;
  message: string | null;
  data: unknown | null;
  initiateTransfer: (contractAgreementId: string, assetId: string) => Promise<void>;
  cancelTransfer: () => void;
  reset: () => void;
}

export function useTransfer(options: UseTransferOptions = {}): UseTransferReturn {
  const {
    pollInterval = 2000,
    maxPollAttempts = 30,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [transferId, setTransferId] = useState<string | null>(null);
  const [state, setState] = useState<TransferState>('IDLE');
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<unknown | null>(null);
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

  const fetchTransferData = useCallback(async (id: string) => {
    try {
      const transferData = await api.fetchTransferData(id);
      if (!isCancelledRef.current) {
        setData(transferData);
        setIsTransferring(false);
        if (onSuccess) {
          onSuccess(transferData);
        }
      }
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch transfer data');
      console.error('Transfer data fetch error:', fetchError);
      
      // Try retry logic
      const currentAttempt = attemptCount + 1;
      setAttemptCount(currentAttempt);
      
      if (currentAttempt < retryAttempts) {
        console.warn(`Data fetch failed (attempt ${currentAttempt}/${retryAttempts}), retrying...`);
        setTimeout(() => {
          fetchTransferData(id);
        }, retryDelay * currentAttempt);
      } else {
        setError(fetchError);
        setIsTransferring(false);
        if (onError) {
          onError(fetchError);
        }
      }
    }
  }, [attemptCount, retryAttempts, retryDelay, onSuccess, onError]);

  const pollTransfer = useCallback(async (id: string) => {
    if (isCancelledRef.current) return;

    try {
      const response: TransferResponse = await api.getTransfer(id);
      
      if (isCancelledRef.current) return;

      setState(response.state as TransferState);
      setMessage(response.message || null);

      // Terminal states
      if (response.state === 'COMPLETED' || response.state === 'DEPROVISIONED') {
        // Fetch the actual data via EDR
        await fetchTransferData(id);
        return;
      }

      if (response.state === 'TERMINATED') {
        setIsTransferring(false);
        const terminationError = new Error(response.message || 'Transfer was terminated');
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
          pollTransfer(id);
        }, pollInterval);
      } else {
        const timeoutError = new Error('Transfer polling timeout - maximum attempts reached');
        setError(timeoutError);
        setIsTransferring(false);
        if (onError) {
          onError(timeoutError);
        }
      }
    } catch (err) {
      if (isCancelledRef.current) return;

      const pollError = err instanceof Error ? err : new Error('Failed to poll transfer');
      console.error('Transfer polling error:', pollError);
      
      // Retry logic
      const currentAttempt = attemptCount + 1;
      setAttemptCount(currentAttempt);
      
      if (currentAttempt < retryAttempts) {
        console.warn(`Transfer poll failed (attempt ${currentAttempt}/${retryAttempts}), retrying...`);
        pollTimeoutRef.current = setTimeout(() => {
          pollTransfer(id);
        }, retryDelay * currentAttempt);
      } else {
        setError(pollError);
        setIsTransferring(false);
        if (onError) {
          onError(pollError);
        }
      }
    }
  }, [pollInterval, maxPollAttempts, retryAttempts, retryDelay, attemptCount, fetchTransferData, onError]);

  const initiateTransfer = useCallback(async (
    contractAgreementId: string,
    assetId: string
  ) => {
    // Reset state
    setError(null);
    setMessage(null);
    setData(null);
    setAttemptCount(0);
    pollCountRef.current = 0;
    isCancelledRef.current = false;
    
    setIsTransferring(true);
    setState('INITIAL');

    try {
      const response = await api.initiateTransfer(contractAgreementId, assetId);
      
      if (isCancelledRef.current) return;

      setTransferId(response.transferId);
      setState(response.state as TransferState);
      setMessage(response.message || null);

      // Check if already completed (mock mode)
      if (response.state === 'COMPLETED') {
        await fetchTransferData(response.transferId);
      } else {
        // Start polling
        pollTimeoutRef.current = setTimeout(() => {
          pollTransfer(response.transferId);
        }, pollInterval);
      }
    } catch (err) {
      const initiationError = err instanceof Error ? err : new Error('Failed to initiate transfer');
      setError(initiationError);
      setIsTransferring(false);
      setState('IDLE');
      if (onError) {
        onError(initiationError);
      }
    }
  }, [pollInterval, pollTransfer, fetchTransferData, onError]);

  const cancelTransfer = useCallback(() => {
    isCancelledRef.current = true;
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    setIsTransferring(false);
    setState('IDLE');
  }, []);

  const reset = useCallback(() => {
    cancelTransfer();
    setTransferId(null);
    setState('IDLE');
    setError(null);
    setMessage(null);
    setData(null);
    setAttemptCount(0);
    pollCountRef.current = 0;
  }, [cancelTransfer]);

  return {
    transferId,
    state,
    isTransferring,
    error,
    message,
    data,
    initiateTransfer,
    cancelTransfer,
    reset,
  };
}
