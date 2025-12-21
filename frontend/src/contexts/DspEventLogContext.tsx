/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable react-refresh/only-export-components */
// This file exports types, hooks, and components together by design (Context pattern)

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { getApiMode } from '../services/apiFactory';

// ============================================================================
// DSP EVENT TYPES
// ============================================================================

export type DspPhase = 'catalog' | 'negotiation' | 'transfer' | 'compute';
export type DspDirection = 'outbound' | 'inbound' | 'internal';
export type DspStatus = 'pending' | 'in-progress' | 'success' | 'error';

export interface DspEvent {
  id: string;
  timestamp: Date;
  phase: DspPhase;
  action: string;
  direction: DspDirection;
  status: DspStatus;
  actor?: string;
  target?: string;
  details?: Record<string, unknown>;
  dspMessageType?: string;
  errorMessage?: string;
  source?: 'mock' | 'edc' | 'sse'; // Source of the event: mock demo, EDC callback, or SSE stream
}

// DSP Protocol steps for progress indicator
export const DSP_PHASES: { id: DspPhase; label: string; steps: string[] }[] = [
  { 
    id: 'catalog', 
    label: 'Catalog Discovery', 
    steps: ['CatalogRequestMessage', 'CatalogResponse'] 
  },
  { 
    id: 'negotiation', 
    label: 'Contract Negotiation', 
    steps: [
      'ContractRequestMessage',
      'ContractOfferMessage', 
      'ContractNegotiationEventMessage (ACCEPTED)',
      'ContractAgreementMessage',
      'ContractAgreementVerificationMessage',
      'ContractNegotiationEventMessage (FINALIZED)'
    ] 
  },
  { 
    id: 'transfer', 
    label: 'Data Transfer', 
    steps: [
      'TransferRequestMessage',
      'De-identification Pipeline',
      'TransferStartMessage + EDR',
      'FHIR Bundle (HTTP PULL)',
      'TransferCompletionMessage'
    ] 
  },
  { 
    id: 'compute', 
    label: 'Confidential Compute', 
    steps: [
      'ComputeRequestMessage',
      'Enclave Attestation',
      'Encrypted Ingestion',
      'Secure Execution',
      'Result Delivery'
    ] 
  }
];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

interface DspEventLogState {
  events: DspEvent[];
  isConnected: boolean;
  currentPhase: DspPhase | null;
  completedPhases: DspPhase[];
}

type DspEventLogAction =
  | { type: 'ADD_EVENT'; payload: DspEvent }
  | { type: 'ADD_EVENTS'; payload: DspEvent[] }
  | { type: 'CLEAR_EVENTS' }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_CURRENT_PHASE'; payload: DspPhase | null }
  | { type: 'COMPLETE_PHASE'; payload: DspPhase }
  | { type: 'RESET_PHASES' }
  | { type: 'LOAD_FROM_STORAGE'; payload: DspEvent[] };

const STORAGE_KEY = 'dsp-event-log';

function dspEventLogReducer(state: DspEventLogState, action: DspEventLogAction): DspEventLogState {
  switch (action.type) {
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload]
      };
    case 'ADD_EVENTS':
      return {
        ...state,
        events: [...state.events, ...action.payload]
      };
    case 'CLEAR_EVENTS':
      return {
        ...state,
        events: [],
        currentPhase: null,
        completedPhases: []
      };
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload
      };
    case 'SET_CURRENT_PHASE':
      return {
        ...state,
        currentPhase: action.payload
      };
    case 'COMPLETE_PHASE':
      return {
        ...state,
        completedPhases: state.completedPhases.includes(action.payload)
          ? state.completedPhases
          : [...state.completedPhases, action.payload]
      };
    case 'RESET_PHASES':
      return {
        ...state,
        currentPhase: null,
        completedPhases: []
      };
    case 'LOAD_FROM_STORAGE':
      return {
        ...state,
        events: action.payload
      };
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface DspEventLogContextValue {
  events: DspEvent[];
  isConnected: boolean;
  currentPhase: DspPhase | null;
  completedPhases: DspPhase[];
  emitEvent: (event: Omit<DspEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  setCurrentPhase: (phase: DspPhase | null) => void;
  completePhase: (phase: DspPhase) => void;
  resetPhases: () => void;
  connectToSSE: (url: string) => void;
  disconnectSSE: () => void;
}

const DspEventLogContext = createContext<DspEventLogContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface DspEventLogProviderProps {
  children: React.ReactNode;
}

export function DspEventLogProvider({ children }: DspEventLogProviderProps) {
  const [state, dispatch] = useReducer(dspEventLogReducer, {
    events: [],
    isConnected: false,
    currentPhase: null,
    completedPhases: []
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<Omit<DspEvent, 'timestamp'> & { timestamp: string }>;
        const events = parsed.map(e => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }));
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: events });
      }
    } catch (error) {
      console.warn('Failed to load DSP events from storage:', error);
    }
  }, []);

  // Persist events to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
    } catch (error) {
      console.warn('Failed to persist DSP events to storage:', error);
    }
  }, [state.events]);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `dsp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Emit a new event
  const emitEvent = useCallback((event: Omit<DspEvent, 'id' | 'timestamp'>) => {
    const fullEvent: DspEvent = {
      ...event,
      id: generateId(),
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_EVENT', payload: fullEvent });
  }, [generateId]);

  // Clear all events
  const clearEvents = useCallback(() => {
    dispatch({ type: 'CLEAR_EVENTS' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Set current phase
  const setCurrentPhase = useCallback((phase: DspPhase | null) => {
    dispatch({ type: 'SET_CURRENT_PHASE', payload: phase });
  }, []);

  // Mark phase as complete
  const completePhase = useCallback((phase: DspPhase) => {
    dispatch({ type: 'COMPLETE_PHASE', payload: phase });
  }, []);

  // Reset all phases
  const resetPhases = useCallback(() => {
    dispatch({ type: 'RESET_PHASES' });
  }, []);

  // Connect to SSE endpoint for live events (full EDC mode)
  const connectToSSE = useCallback((url: string) => {
    // Only connect in full/hybrid mode
    const mode = getApiMode();
    if (mode === 'mock') {
      console.log('SSE not available in mock mode');
      return;
    }

    // Disconnect existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        dispatch({ type: 'SET_CONNECTED', payload: true });
        console.log('SSE connected to:', url);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'dsp-event') {
            const dspEvent: DspEvent = {
              id: data.id || generateId(),
              timestamp: new Date(data.timestamp || Date.now()),
              phase: data.phase,
              action: data.action,
              direction: data.direction,
              status: data.status,
              actor: data.actor,
              target: data.target,
              details: data.details,
              dspMessageType: data.dspMessageType
            };
            dispatch({ type: 'ADD_EVENT', payload: dspEvent });
          }
        } catch (error) {
          console.warn('Failed to parse SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        dispatch({ type: 'SET_CONNECTED', payload: false });
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current === eventSource) {
            connectToSSE(url);
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      dispatch({ type: 'SET_CONNECTED', payload: false });
    }
  }, [generateId]);

  // Disconnect SSE
  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      dispatch({ type: 'SET_CONNECTED', payload: false });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const value: DspEventLogContextValue = {
    events: state.events,
    isConnected: state.isConnected,
    currentPhase: state.currentPhase,
    completedPhases: state.completedPhases,
    emitEvent,
    clearEvents,
    setCurrentPhase,
    completePhase,
    resetPhases,
    connectToSSE,
    disconnectSSE
  };

  return (
    <DspEventLogContext.Provider value={value}>
      {children}
    </DspEventLogContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useDspEventLog(): DspEventLogContextValue {
  const context = useContext(DspEventLogContext);
  if (!context) {
    throw new Error('useDspEventLog must be used within a DspEventLogProvider');
  }
  return context;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPhaseProgress(
  phase: DspPhase,
  events: DspEvent[]
): { current: number; total: number; percentage: number } {
  const phaseConfig = DSP_PHASES.find(p => p.id === phase);
  if (!phaseConfig) {
    return { current: 0, total: 0, percentage: 0 };
  }

  const phaseEvents = events.filter(e => e.phase === phase && e.status === 'success');
  const current = phaseEvents.length;
  const total = phaseConfig.steps.length;
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return { current, total, percentage };
}

export function getEventIcon(direction: DspDirection): string {
  switch (direction) {
    case 'outbound':
      return '→';
    case 'inbound':
      return '←';
    case 'internal':
      return '⟳';
    default:
      return '•';
  }
}

export function getStatusColor(status: DspStatus): string {
  switch (status) {
    case 'pending':
      return 'text-gray-400';
    case 'in-progress':
      return 'text-blue-500';
    case 'success':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
}
