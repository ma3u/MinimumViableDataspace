/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Eye, 
  Trash2, 
  Wifi, 
  WifiOff,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  ExternalLink,
  FileText,
  Key,
  User,
  Building2,
  Shield,
  Activity
} from 'lucide-react';
import { 
  useDspEventLog, 
  DSP_PHASES,
  type DspEvent,
  type DspPhase
} from '../contexts/DspEventLogContext';

interface DataspaceInsiderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isBackendOnline: boolean;
}

// Observability links configuration
const OBSERVABILITY_LINKS = {
  apiDocs: 'https://your-org.github.io/MVD-health/api/#api-events', // API documentation on GitHub Pages
  logs: '/api/events', // Backend events API (local)
  dockerLogs: 'http://localhost:3002/health/detailed', // Backend-EDC health/logs
  grafana: 'http://localhost:3000/d/edc-health', // Grafana dashboard (if available)
  prometheus: 'http://localhost:9090', // Prometheus (if available)
  jaeger: 'http://localhost:16686', // Jaeger tracing (if available)
};

// Format timestamp for display
function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Format full timestamp with date
function formatFullTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Get direction icon and styling
function getDirectionDisplay(direction: DspEvent['direction']) {
  switch (direction) {
    case 'outbound':
      return { icon: ArrowRight, color: 'text-green-600', bg: 'bg-green-50', label: 'Consumer → Provider' };
    case 'inbound':
      return { icon: ArrowLeft, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Provider → Consumer' };
    case 'internal':
      return { icon: RotateCw, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Internal' };
    default:
      return { icon: ArrowRight, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Unknown' };
  }
}

// Get status icon
function getStatusIcon(status: DspEvent['status']) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'in-progress':
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'pending':
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

// Extract and format identity details from event
function extractIdentityDetails(event: DspEvent): {
  consumer?: string;
  provider?: string;
  did?: string;
  jwt?: string;
  contractId?: string;
  transferId?: string;
} {
  const details = event.details || {};
  return {
    consumer: (details.consumer as string) || (details.participantId as string) || event.actor,
    provider: (details.provider as string) || (details.counterPartyId as string) || event.target,
    did: (details.did as string) || (details.participantDid as string),
    jwt: (details.jwt as string) || (details.token as string) || (details.authToken as string),
    contractId: (details.contractId as string) || (details.contractNegotiationId as string) || (details.agreementId as string),
    transferId: (details.transferId as string) || (details.transferProcessId as string),
  };
}

// Truncate long strings (like JWTs)
function truncateString(str: string, maxLength: number = 50): string {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength / 2) + '...' + str.substring(str.length - maxLength / 2);
}

// Event card component with enhanced details
function EventCard({ event, isLast }: { event: DspEvent; isLast: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const directionDisplay = getDirectionDisplay(event.direction);
  const DirectionIcon = directionDisplay.icon;
  const identityDetails = extractIdentityDetails(event);

  // Log event to console for debugging
  useEffect(() => {
    console.log(`[DSP Event] ${event.phase}/${event.action}`, {
      id: event.id,
      direction: event.direction,
      status: event.status,
      timestamp: event.timestamp.toISOString(),
      dspMessageType: event.dspMessageType,
      actor: event.actor,
      target: event.target,
      details: event.details
    });
  }, [event]);

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200" />
      )}
      
      <div 
        className={`relative flex gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
          event.status === 'error' ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-white'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Timeline dot */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${directionDisplay.bg}`}>
          <DirectionIcon className={`w-5 h-5 ${directionDisplay.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(event.status)}
              <span className="font-medium text-gray-900 text-sm truncate">
                {event.action}
              </span>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>

          {/* Participant info row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {identityDetails.consumer && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                <User className="w-3 h-3" />
                {identityDetails.consumer}
              </span>
            )}
            {identityDetails.provider && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                <Building2 className="w-3 h-3" />
                {identityDetails.provider}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full ${directionDisplay.bg} ${directionDisplay.color}`}>
              {directionDisplay.label}
            </span>
            {event.dspMessageType && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                {event.dspMessageType}
              </span>
            )}
            {/* Source indicator: Mock, EDC, or SSE */}
            {event.source && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                event.source === 'edc' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : event.source === 'sse'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
                {event.source === 'edc' ? '⚡ EDC' : event.source === 'sse' ? '📡 SSE' : '🎭 Mock'}
              </span>
            )}
          </div>

          {/* Quick identity badges */}
          {(identityDetails.did || identityDetails.contractId || identityDetails.transferId) && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {identityDetails.did && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-mono">
                  <Shield className="w-2.5 h-2.5" />
                  DID
                </span>
              )}
              {identityDetails.contractId && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                  <FileText className="w-2.5 h-2.5" />
                  Contract
                </span>
              )}
              {identityDetails.transferId && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  <Activity className="w-2.5 h-2.5" />
                  Transfer
                </span>
              )}
              {identityDetails.jwt && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                  <Key className="w-2.5 h-2.5" />
                  JWT
                </span>
              )}
            </div>
          )}

          {/* Expandable details */}
          <div className="flex items-center gap-1 mt-2">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
            <span className="text-xs text-gray-400">
              {isExpanded ? 'Hide details' : 'Show details'}
            </span>
          </div>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {/* Identity details section */}
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <div className="text-[10px] font-medium text-slate-500 uppercase mb-1.5">Identity & Context</div>
                <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <dt className="text-gray-500">Event ID:</dt>
                  <dd className="font-mono text-gray-700 truncate">{event.id}</dd>
                  
                  <dt className="text-gray-500">Timestamp:</dt>
                  <dd className="text-gray-700">{formatFullTimestamp(event.timestamp)}</dd>
                  
                  {identityDetails.consumer && (
                    <>
                      <dt className="text-gray-500">Consumer:</dt>
                      <dd className="text-gray-700">{identityDetails.consumer}</dd>
                    </>
                  )}
                  
                  {identityDetails.provider && (
                    <>
                      <dt className="text-gray-500">Provider:</dt>
                      <dd className="text-gray-700">{identityDetails.provider}</dd>
                    </>
                  )}
                  
                  {identityDetails.did && (
                    <>
                      <dt className="text-gray-500 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> DID:
                      </dt>
                      <dd className="font-mono text-gray-700 truncate text-[10px]" title={identityDetails.did}>
                        {identityDetails.did}
                      </dd>
                    </>
                  )}
                  
                  {identityDetails.contractId && (
                    <>
                      <dt className="text-gray-500">Contract ID:</dt>
                      <dd className="font-mono text-gray-700 truncate text-[10px]" title={identityDetails.contractId}>
                        {truncateString(identityDetails.contractId, 30)}
                      </dd>
                    </>
                  )}
                  
                  {identityDetails.transferId && (
                    <>
                      <dt className="text-gray-500">Transfer ID:</dt>
                      <dd className="font-mono text-gray-700 truncate text-[10px]" title={identityDetails.transferId}>
                        {truncateString(identityDetails.transferId, 30)}
                      </dd>
                    </>
                  )}
                </dl>
              </div>

              {/* JWT Token section */}
              {identityDetails.jwt && (
                <div className="p-2 bg-rose-50 rounded border border-rose-100">
                  <div className="flex items-center gap-1 text-[10px] font-medium text-rose-600 uppercase mb-1">
                    <Key className="w-3 h-3" /> JWT Token
                  </div>
                  <pre className="text-[10px] font-mono text-rose-800 break-all whitespace-pre-wrap">
                    {identityDetails.jwt}
                  </pre>
                </div>
              )}

              {/* Raw details */}
              {event.details && Object.keys(event.details).length > 0 && (
                <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="text-[10px] font-medium text-gray-500 uppercase mb-1">Raw Payload</div>
                  <pre className="text-[10px] font-mono text-gray-600 overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(event.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Phase progress component
function PhaseProgress({ 
  phase, 
  isActive, 
  isComplete,
  eventCount 
}: { 
  phase: typeof DSP_PHASES[0]; 
  isActive: boolean;
  isComplete: boolean;
  eventCount: number;
}) {
  return (
    <div 
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : isComplete
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-400'
      }`}
    >
      <div className="flex-1">
        <div className="text-xs font-medium">{phase.label}</div>
        <div className="text-[10px] opacity-75">
          {eventCount}/{phase.steps.length} steps
        </div>
      </div>
      {isComplete && <CheckCircle2 className="w-4 h-4" />}
      {isActive && <Loader2 className="w-4 h-4 animate-spin" />}
    </div>
  );
}

// Connection status component with clear states
function ConnectionStatus({ 
  isConnected, 
  isBackendOnline, 
  eventSource 
}: { 
  isConnected: boolean; 
  isBackendOnline: boolean;
  eventSource: 'sse' | 'localStorage' | 'mock';
}) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
        <Wifi className="w-3 h-3" />
        <span>Live ({eventSource.toUpperCase()})</span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
    );
  }
  
  if (isBackendOnline) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Connecting to SSE...</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
      <WifiOff className="w-3 h-3" />
      <span>Offline (localStorage)</span>
    </div>
  );
}

// Observability links component
function ObservabilityLinks() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
        title="View logs & dashboards"
      >
        <FileText className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
          <div className="px-3 py-1.5 text-[10px] font-medium text-gray-400 uppercase">
            Documentation
          </div>
          <a
            href={OBSERVABILITY_LINKS.apiDocs}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            API Documentation
            <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
          </a>
          <div className="px-3 py-1.5 text-[10px] font-medium text-gray-400 uppercase mt-1">
            Observability
          </div>
          <a
            href={OBSERVABILITY_LINKS.logs}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText className="w-4 h-4 text-gray-400" />
            Event Logs API
            <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
          </a>
          <a
            href={OBSERVABILITY_LINKS.grafana}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Activity className="w-4 h-4 text-orange-500" />
            Grafana Dashboard
            <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
          </a>
          <a
            href={OBSERVABILITY_LINKS.prometheus}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Activity className="w-4 h-4 text-red-500" />
            Prometheus
            <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
          </a>
          <div className="border-t border-gray-100 mt-1 pt-1">
            <div className="px-3 py-1.5 text-[10px] text-gray-400">
              Console: Open DevTools → Console
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DataspaceInsiderPanel({ isOpen, onClose, isBackendOnline }: DataspaceInsiderPanelProps) {
  const { 
    events, 
    isConnected, 
    currentPhase, 
    completedPhases,
    clearEvents,
    connectToSSE,
    disconnectSSE
  } = useDspEventLog();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<DspPhase | 'all'>('all');

  // Determine event source for status display
  const eventSource: 'sse' | 'localStorage' | 'mock' = isConnected 
    ? 'sse' 
    : events.length > 0 
      ? 'localStorage' 
      : 'mock';

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current && events.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  // Connect to SSE when backend is online
  useEffect(() => {
    if (isBackendOnline && !isConnected) {
      console.log('[Dataspace Insider] Attempting SSE connection...');
      connectToSSE('/api/events/stream');
    } else if (!isBackendOnline && isConnected) {
      console.log('[Dataspace Insider] Backend offline, disconnecting SSE');
      disconnectSSE();
    }
  }, [isBackendOnline, isConnected, connectToSSE, disconnectSSE]);

  // Log connection state changes
  useEffect(() => {
    console.log('[Dataspace Insider] Connection state:', {
      isConnected,
      isBackendOnline,
      eventSource,
      eventCount: events.length
    });
  }, [isConnected, isBackendOnline, eventSource, events.length]);

  // Filter events
  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.phase === filter);

  // Count events per phase
  const phaseEventCounts = DSP_PHASES.reduce((acc, phase) => {
    acc[phase.id] = events.filter(e => e.phase === phase.id && e.status === 'success').length;
    return acc;
  }, {} as Record<DspPhase, number>);

  // Side panel that doesn't overlay content
  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-40 
        flex flex-col border-l border-gray-200
        transition-all duration-300 ease-out
        ${isOpen ? 'w-[420px]' : 'w-0 overflow-hidden'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-slate-50 to-blue-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Dataspace Insider</h2>
            <p className="text-xs text-gray-500">DSP Protocol Messages</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Connection status */}
          <ConnectionStatus 
            isConnected={isConnected} 
            isBackendOnline={isBackendOnline}
            eventSource={eventSource}
          />

          {/* Observability links */}
          <ObservabilityLinks />

          {/* Clear button */}
          <button
            onClick={() => {
              console.log('[Dataspace Insider] Clearing all events');
              clearEvents();
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear all events"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
        <div className="grid grid-cols-4 gap-2">
          {DSP_PHASES.map(phase => (
            <PhaseProgress
              key={phase.id}
              phase={phase}
              isActive={currentPhase === phase.id}
              isComplete={completedPhases.includes(phase.id)}
              eventCount={phaseEventCounts[phase.id]}
            />
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({events.length})
        </button>
        {DSP_PHASES.map(phase => (
          <button
            key={phase.id}
            onClick={() => setFilter(phase.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
              filter === phase.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {phase.label.split(' ')[0]} ({events.filter(e => e.phase === phase.id).length})
          </button>
        ))}
      </div>

      {/* Events timeline */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Eye className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No events yet</p>
            <p className="text-xs mt-1 text-center px-4">
              Start the demo to see DSP protocol messages.
              <br />
              Events are logged to browser console.
            </p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <EventCard 
              key={event.id} 
              event={event} 
              isLast={index === filteredEvents.length - 1}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-white/95 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{events.length} total events</span>
          <a 
            href={OBSERVABILITY_LINKS.apiDocs}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
          >
            <FileText className="w-3 h-3" />
            API Docs
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// Trigger button component (FAB style) - positioned to avoid overlap with panel
export function DataspaceInsiderTrigger({ onClick, isPanelOpen }: { onClick: () => void; isPanelOpen?: boolean }) {
  const { events } = useDspEventLog();
  const hasNewEvents = events.length > 0;

  return (
    <button
      onClick={onClick}
      className={`fixed top-1/2 -translate-y-1/2 z-30
        flex items-center gap-2 px-3 py-3 
        bg-blue-600 hover:bg-blue-700 text-white 
        rounded-l-xl shadow-lg hover:shadow-xl
        transition-all duration-300 group
        ${isPanelOpen ? 'right-[420px]' : 'right-0'}`}
      title="Open Dataspace Insider"
    >
      <Eye className="w-5 h-5" />
      <span className="text-sm font-medium hidden group-hover:inline transition-all">
        DSP Insider
      </span>
      {hasNewEvents && (
        <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full 
          flex items-center justify-center text-[10px] font-bold animate-pulse">
          {events.length > 99 ? '99+' : events.length}
        </span>
      )}
    </button>
  );
}
