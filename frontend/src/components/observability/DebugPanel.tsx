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
 * Debug Panel Component
 * 
 * Displays development-mode debugging information including:
 * - Current configuration and API mode
 * - Web Vitals metrics
 * - API call timing and error rates
 * - Recent error reports
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Bug, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  AlertTriangle,
  Clock,
  Zap,
  Server,
  RefreshCw
} from 'lucide-react';
import { WebVitalsDisplay } from './WebVitals';
import { getErrorReports, clearErrorReports } from './ErrorBoundary';
import { getApiMode } from '../../services/apiFactory';

interface ApiCallMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  success: boolean;
}

// Global API call metrics store
const apiCallMetrics: ApiCallMetric[] = [];
const MAX_METRICS = 50;

// Function to track API calls - can be called from apiFactory
export function trackApiCall(metric: Omit<ApiCallMetric, 'timestamp'>): void {
  apiCallMetrics.unshift({
    ...metric,
    timestamp: Date.now(),
  });
  
  // Keep only last N metrics
  if (apiCallMetrics.length > MAX_METRICS) {
    apiCallMetrics.pop();
  }
}

// Get API metrics summary
function getApiMetrics() {
  const now = Date.now();
  const last5Min = apiCallMetrics.filter(m => now - m.timestamp < 5 * 60 * 1000);
  
  const totalCalls = last5Min.length;
  const successfulCalls = last5Min.filter(m => m.success).length;
  const errorRate = totalCalls > 0 ? ((totalCalls - successfulCalls) / totalCalls) * 100 : 0;
  const avgDuration = totalCalls > 0 
    ? last5Min.reduce((sum, m) => sum + m.duration, 0) / totalCalls 
    : 0;

  return {
    totalCalls,
    successfulCalls,
    errorRate,
    avgDuration,
    recentCalls: last5Min.slice(0, 10),
  };
}

interface DebugPanelProps {
  defaultOpen?: boolean;
}

export function DebugPanel({ defaultOpen = false }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'vitals' | 'api' | 'errors'>('config');
  const [refreshKey, setRefreshKey] = useState(0);

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Force re-render when refreshKey changes
  void refreshKey;

  // Auto-refresh every 5 seconds when open
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [isOpen, isMinimized, refresh]);

  const apiMode = getApiMode();
  const apiMetrics = getApiMetrics();
  const errorReports = getErrorReports();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Open Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white rounded-lg shadow-lg">
        <div className="flex items-center gap-2 px-3 py-2">
          <Bug className="w-4 h-4" />
          <span className="text-sm font-medium">Debug</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold">Debug Panel</span>
          <span className="px-1.5 py-0.5 text-xs bg-yellow-600 rounded">DEV</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refresh}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'config', label: 'Config', icon: Server },
          { id: 'vitals', label: 'Vitals', icon: Activity },
          { id: 'api', label: 'API', icon: Zap },
          { id: 'errors', label: `Errors (${errorReports.length})`, icon: AlertTriangle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs transition-colors ${
              activeTab === id
                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {activeTab === 'config' && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">API Mode</span>
              <span className={`font-mono px-2 py-0.5 rounded ${
                apiMode === 'full' ? 'bg-green-900 text-green-300' :
                apiMode === 'hybrid' ? 'bg-yellow-900 text-yellow-300' :
                'bg-blue-900 text-blue-300'
              }`}>
                {apiMode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Environment</span>
              <span className="font-mono text-gray-200">
                {import.meta.env.MODE}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Build Time</span>
              <span className="font-mono text-gray-200">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Backend Mock</span>
              <span className="font-mono text-gray-200">
                {import.meta.env.VITE_MOCK_BACKEND_URL || 'default'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Backend EDC</span>
              <span className="font-mono text-gray-200">
                {import.meta.env.VITE_EDC_BACKEND_URL || 'default'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-4">
            <WebVitalsDisplay />
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="text-green-400">●</span> Good</p>
              <p><span className="text-yellow-400">●</span> Needs Improvement</p>
              <p><span className="text-red-400">●</span> Poor</p>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800 rounded p-2">
                <div className="text-gray-400 text-xs">Calls (5min)</div>
                <div className="text-lg font-bold">{apiMetrics.totalCalls}</div>
              </div>
              <div className="bg-gray-800 rounded p-2">
                <div className="text-gray-400 text-xs">Error Rate</div>
                <div className={`text-lg font-bold ${
                  apiMetrics.errorRate > 5 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {apiMetrics.errorRate.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-800 rounded p-2">
                <div className="text-gray-400 text-xs">Avg Duration</div>
                <div className="text-lg font-bold">
                  {apiMetrics.avgDuration.toFixed(0)}ms
                </div>
              </div>
              <div className="bg-gray-800 rounded p-2">
                <div className="text-gray-400 text-xs">Success</div>
                <div className="text-lg font-bold text-green-400">
                  {apiMetrics.successfulCalls}
                </div>
              </div>
            </div>

            {apiMetrics.recentCalls.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-gray-400 font-medium">Recent Calls</div>
                {apiMetrics.recentCalls.slice(0, 5).map((call, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs bg-gray-800 rounded px-2 py-1"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      call.success ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="text-gray-400">{call.method}</span>
                    <span className="flex-1 truncate font-mono">{call.endpoint}</span>
                    <span className="text-gray-500">{call.duration}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-3">
            {errorReports.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No errors captured</p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    clearErrorReports();
                    refresh();
                  }}
                  className="w-full text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  Clear All Errors
                </button>
                {errorReports.slice(0, 5).map((report, i) => (
                  <div key={i} className="bg-gray-800 rounded p-2 text-xs">
                    <div className="flex items-center gap-2 text-red-400 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(report.timestamp).toLocaleTimeString()}
                    </div>
                    <p className="mt-1 text-gray-200 truncate">{report.message}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-500">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

// Export the tracking function for use in API services
export { trackApiCall as recordApiCall };
