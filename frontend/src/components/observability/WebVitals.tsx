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
 * Web Vitals Monitoring Component
 * 
 * Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB) and provides
 * real-time performance metrics for the frontend application.
 */

import { useEffect, useState } from 'react';

// Web Vitals types
interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

interface WebVitalsData {
  LCP?: WebVitalMetric;  // Largest Contentful Paint
  FID?: WebVitalMetric;  // First Input Delay
  CLS?: WebVitalMetric;  // Cumulative Layout Shift
  FCP?: WebVitalMetric;  // First Contentful Paint
  TTFB?: WebVitalMetric; // Time to First Byte
  INP?: WebVitalMetric;  // Interaction to Next Paint
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// Rate metric value
function rateMetric(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'needs-improvement';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Global store for web vitals data
let globalWebVitals: WebVitalsData = {};
const listeners: Set<(data: WebVitalsData) => void> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener({ ...globalWebVitals }));
}

// Initialize web-vitals monitoring
async function initWebVitals(onMetric: (metric: WebVitalMetric) => void) {
  // Use Performance API for basic metrics
  if (typeof window === 'undefined' || !window.performance) return;

  // Measure FCP using PerformanceObserver
  try {
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntriesByName('first-contentful-paint');
      if (entries.length > 0) {
        const fcp = entries[0];
        const metric: WebVitalMetric = {
          name: 'FCP',
          value: fcp.startTime,
          rating: rateMetric('FCP', fcp.startTime),
          delta: fcp.startTime,
          id: `fcp-${Date.now()}`,
          navigationType: 'navigate',
        };
        onMetric(metric);
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.debug('[WebVitals] FCP observer not supported');
  }

  // Measure LCP
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      if (lastEntry) {
        const metric: WebVitalMetric = {
          name: 'LCP',
          value: lastEntry.startTime,
          rating: rateMetric('LCP', lastEntry.startTime),
          delta: lastEntry.startTime,
          id: `lcp-${Date.now()}`,
          navigationType: 'navigate',
        };
        onMetric(metric);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.debug('[WebVitals] LCP observer not supported');
  }

  // Measure CLS
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[];
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      const metric: WebVitalMetric = {
        name: 'CLS',
        value: clsValue,
        rating: rateMetric('CLS', clsValue),
        delta: clsValue,
        id: `cls-${Date.now()}`,
        navigationType: 'navigate',
      };
      onMetric(metric);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.debug('[WebVitals] CLS observer not supported');
  }

  // Measure FID using first-input
  try {
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries() as (PerformanceEntry & { processingStart: number; startTime: number })[];
      const firstInput = entries[0];
      if (firstInput) {
        const fidValue = firstInput.processingStart - firstInput.startTime;
        const metric: WebVitalMetric = {
          name: 'FID',
          value: fidValue,
          rating: rateMetric('FID', fidValue),
          delta: fidValue,
          id: `fid-${Date.now()}`,
          navigationType: 'navigate',
        };
        onMetric(metric);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.debug('[WebVitals] FID observer not supported');
  }

  // Measure TTFB from navigation timing
  try {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      const metric: WebVitalMetric = {
        name: 'TTFB',
        value: ttfb,
        rating: rateMetric('TTFB', ttfb),
        delta: ttfb,
        id: `ttfb-${Date.now()}`,
        navigationType: 'navigate',
      };
      onMetric(metric);
    }
  } catch (e) {
    console.debug('[WebVitals] TTFB measurement failed');
  }
}

// Hook to use Web Vitals
export function useWebVitals(): WebVitalsData {
  const [vitals, setVitals] = useState<WebVitalsData>(globalWebVitals);

  useEffect(() => {
    const handleMetric = (metric: WebVitalMetric) => {
      globalWebVitals = {
        ...globalWebVitals,
        [metric.name]: metric,
      };
      notifyListeners();
    };

    initWebVitals(handleMetric);

    const listener = (data: WebVitalsData) => setVitals(data);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return vitals;
}

// Format metric value for display
function formatMetricValue(name: string, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

// Get color based on rating
function getRatingColor(rating: string): string {
  switch (rating) {
    case 'good':
      return 'text-green-600 bg-green-100';
    case 'needs-improvement':
      return 'text-yellow-600 bg-yellow-100';
    case 'poor':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Web Vitals Display Component
interface WebVitalsDisplayProps {
  compact?: boolean;
}

export function WebVitalsDisplay({ compact = false }: WebVitalsDisplayProps) {
  const vitals = useWebVitals();
  const metrics = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'] as const;

  if (compact) {
    return (
      <div className="flex gap-2 text-xs">
        {metrics.map((name) => {
          const metric = vitals[name];
          if (!metric) return null;
          return (
            <span
              key={name}
              className={`px-1.5 py-0.5 rounded ${getRatingColor(metric.rating)}`}
              title={`${name}: ${formatMetricValue(name, metric.value)}`}
            >
              {name}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {metrics.map((name) => {
        const metric = vitals[name];
        return (
          <div
            key={name}
            className={`p-2 rounded-lg text-center ${
              metric ? getRatingColor(metric.rating) : 'bg-gray-50 text-gray-400'
            }`}
          >
            <div className="text-xs font-medium">{name}</div>
            <div className="text-sm font-bold">
              {metric ? formatMetricValue(name, metric.value) : '—'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Export global getter for external use
export function getWebVitals(): WebVitalsData {
  return { ...globalWebVitals };
}
