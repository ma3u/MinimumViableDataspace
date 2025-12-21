/**
 * Custom hook for fetching and managing catalog data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/apiFactory';
import type { CatalogAsset } from '../services/apiFactory';

interface UseCatalogOptions {
  autoFetch?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseCatalogReturn {
  assets: CatalogAsset[];
  isLoading: boolean;
  error: Error | null;
  source: string | null;  // 'edc-federated' | 'mock-fallback' | 'mock'
  enhanced: boolean;      // Whether full DCAT properties are available
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
}

export function useCatalog(options: UseCatalogOptions = {}): UseCatalogReturn {
  const { autoFetch = true, retryAttempts = 3, retryDelay = 1000 } = options;
  
  const [assets, setAssets] = useState<CatalogAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  
  // Use ref instead of state to avoid stale closure issues in retry logic
  const attemptCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCatalog = useCallback(async (isRetry = false) => {
    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (!isRetry) {
      setIsLoading(true);
      setError(null);
      attemptCountRef.current = 0;
    }

    try {
      const mode = api.getMode();
      
      if (mode === 'mock') {
        // In mock mode, use getEhrList which returns mock data
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
        setSource('mock');
        setEnhanced(false);
      } else {
        // In hybrid/full mode, use catalog API (returns enhanced DCAT properties)
        const response = await api.getCatalogAssets();
        setAssets(response.assets);
        setSource(response.source);
        setEnhanced(response.enhanced || false);
      }
      
      setError(null);
      attemptCountRef.current = 0;
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch catalog');
      setError(error);
      
      // Retry logic using ref to avoid stale closure
      attemptCountRef.current += 1;
      const currentAttempt = attemptCountRef.current;
      
      if (currentAttempt < retryAttempts) {
        console.warn(`Catalog fetch failed (attempt ${currentAttempt}/${retryAttempts}), retrying in ${retryDelay * currentAttempt}ms...`);
        retryTimeoutRef.current = setTimeout(() => {
          fetchCatalog(true);
        }, retryDelay * currentAttempt); // Exponential backoff
      } else {
        console.error('Catalog fetch failed after all retry attempts:', error);
        setIsLoading(false);
      }
    }
  }, [retryAttempts, retryDelay]);

  const refetch = useCallback(async () => {
    attemptCountRef.current = 0;
    await fetchCatalog();
  }, [fetchCatalog]);

  const retry = useCallback(async () => {
    await fetchCatalog(true);
  }, [fetchCatalog]);

  useEffect(() => {
    if (autoFetch) {
      fetchCatalog();
    }
    
    // Cleanup: cancel any pending retry timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [autoFetch, fetchCatalog]);

  return {
    assets,
    isLoading,
    error,
    source,
    enhanced,
    refetch,
    retry,
  };
}
