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
 * Error Boundary Component with Error Reporting
 * 
 * Catches JavaScript errors in the component tree and displays
 * a fallback UI while reporting errors for debugging.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Bug, Copy, Check } from 'lucide-react';

interface ErrorReport {
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  apiMode?: string;
}

// Global error store
const errorReports: ErrorReport[] = [];

export function getErrorReports(): ErrorReport[] {
  return [...errorReports];
}

export function clearErrorReports(): void {
  errorReports.length = 0;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Store error info
    this.setState({ errorInfo });

    // Create error report
    const report: ErrorReport = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack ?? undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      apiMode: import.meta.env.VITE_API_MODE,
    };

    // Store in global error reports
    errorReports.push(report);

    // Log to console
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send to an error tracking service
    if (import.meta.env.PROD) {
      this.reportError(report);
    }
  }

  private async reportError(report: ErrorReport): Promise<void> {
    // Placeholder for error reporting service integration
    // Could integrate with Sentry, LogRocket, or custom backend
    try {
      // Example: POST to backend-edc for aggregation
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });
      console.debug('[ErrorBoundary] Error reported:', report.timestamp);
    } catch (e) {
      console.error('[ErrorBoundary] Failed to report error:', e);
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
  };

  private handleCopyError = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (e) {
      console.error('Failed to copy error:', e);
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, copied } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-semibold text-red-800">
                  Something went wrong
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              <p className="text-gray-600">
                An unexpected error occurred in the application. This has been logged for investigation.
              </p>

              {/* Error Message */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Bug className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {error?.message || 'Unknown error'}
                    </p>
                    {import.meta.env.DEV && error?.stack && (
                      <pre className="mt-2 text-xs text-gray-500 overflow-x-auto max-h-32 overflow-y-auto">
                        {error.stack.split('\n').slice(0, 5).join('\n')}
                      </pre>
                    )}
                  </div>
                </div>
              </div>

              {/* Development Info */}
              {import.meta.env.DEV && errorInfo?.componentStack && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Component Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleCopyError}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Error
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Hook to manually report errors
export function useErrorReporting() {
  const reportError = (error: Error, context?: Record<string, unknown>) => {
    const report: ErrorReport = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      apiMode: import.meta.env.VITE_API_MODE,
    };

    errorReports.push(report);
    console.error('[ErrorReporting] Manual error report:', error, context);
  };

  return { reportError, getReports: getErrorReports, clearReports: clearErrorReports };
}
