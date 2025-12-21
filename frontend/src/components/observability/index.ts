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
 * Observability Components Index
 * 
 * Exports all observability-related components for easy import.
 */

export { WebVitalsDisplay, useWebVitals, getWebVitals } from './WebVitals';
export { ErrorBoundary, useErrorReporting, getErrorReports, clearErrorReports } from './ErrorBoundary';
export { DebugPanel, trackApiCall } from './DebugPanel';
