import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCatalog } from './useCatalog';
import { api } from '../services/apiFactory';

vi.mock('../services/apiFactory');

describe('useCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks before setting up specific behaviors
    vi.mocked(api.getMode).mockReset();
    vi.mocked(api.getCatalogAssets).mockReset();
    vi.mocked(api.getEhrList).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch catalog on mount when autoFetch is true', async () => {
    const mockAssets = [
      {
        ehrId: 'EHR001',
        assetId: 'ehr:EHR001',
        title: 'Test EHR',
        description: 'Test diagnosis',
        healthCategory: 'Cardiology',
        ageBand: '55-64',
        biologicalSex: 'male',
        clinicalPhase: 'Phase III',
        meddraVersion: '27.0',
        sensitiveCategory: 'none',
        policies: [],
      },
    ];

    vi.mocked(api.getMode).mockReturnValue('hybrid');
    vi.mocked(api.getCatalogAssets).mockResolvedValue({
      assets: mockAssets,
      totalCount: 1,
      source: 'edc',
    });

    const { result } = renderHook(() => useCatalog({ retryAttempts: 0 }));

    // Initial state should have loading true
    expect(result.current.isLoading).toBe(true);

    // Wait for the async fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 2000 });

    expect(result.current.assets).toEqual(mockAssets);
    expect(result.current.error).toBeNull();
    expect(api.getCatalogAssets).toHaveBeenCalledTimes(1);
  });

  it('should not auto-fetch when autoFetch is false', async () => {
    vi.mocked(api.getMode).mockReturnValue('mock');
    vi.mocked(api.getEhrList).mockResolvedValue([]);
    
    const { result } = renderHook(() => useCatalog({ autoFetch: false }));

    // Give it a tick 
    await new Promise(r => setTimeout(r, 50));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.assets).toEqual([]);
    expect(api.getCatalogAssets).not.toHaveBeenCalled();
    expect(api.getEhrList).not.toHaveBeenCalled();
  });

  it('should set error on fetch failure', async () => {
    vi.mocked(api.getMode).mockReturnValue('hybrid');
    vi.mocked(api.getCatalogAssets).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCatalog({ retryAttempts: 1, retryDelay: 10 }));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    }, { timeout: 2000 });

    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should retry on failure and eventually succeed', async () => {
    let callCount = 0;
    vi.mocked(api.getMode).mockReturnValue('hybrid');
    vi.mocked(api.getCatalogAssets).mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        throw new Error(`Attempt ${callCount} failed`);
      }
      return {
        assets: [{ ehrId: 'EHR001', assetId: 'ehr:EHR001', title: 'Success', description: 'Test', healthCategory: 'General', ageBand: '35-44', biologicalSex: 'male', clinicalPhase: 'N/A', meddraVersion: '27.0', sensitiveCategory: 'none', policies: [] }],
        totalCount: 1,
        source: 'edc' as const,
      };
    });

    const { result } = renderHook(() => useCatalog({ retryAttempts: 3, retryDelay: 10 }));

    // Should eventually succeed after retries
    await waitFor(() => {
      expect(result.current.assets.length).toBe(1);
      expect(result.current.error).toBeNull();
    }, { timeout: 3000 });

    expect(callCount).toBe(3);
  });

  it('should stop retrying after max attempts', async () => {
    vi.mocked(api.getMode).mockReturnValue('hybrid');
    vi.mocked(api.getCatalogAssets).mockRejectedValue(new Error('Always fails'));

    const { result } = renderHook(() => useCatalog({ retryAttempts: 2, retryDelay: 10 }));

    // Wait for all retries to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error?.message).toBe('Always fails');
    }, { timeout: 3000 });

    // Should have tried initial + 1 retry = 2 calls
    expect(api.getCatalogAssets).toHaveBeenCalledTimes(2);
  });

  it('should allow manual refetch', async () => {
    vi.mocked(api.getMode).mockReturnValue('mock');
    vi.mocked(api.getEhrList).mockResolvedValue([
      {
        ehrId: 'EHR002',
        title: 'Manual fetch result',
        diagnosis: 'Test',
        healthCategory: 'General',
        ageBand: '35-44',
        biologicalSex: 'female',
      } as any,
    ]);

    const { result } = renderHook(() => useCatalog({ autoFetch: false }));

    // Manual refetch
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.assets.length).toBeGreaterThan(0);
    });

    expect(api.getEhrList).toHaveBeenCalled();
  });

  it('should use mock API when mode is mock', async () => {
    vi.mocked(api.getMode).mockReturnValue('mock');
    vi.mocked(api.getEhrList).mockResolvedValue([
      {
        ehrId: 'EHR001',
        diagnosis: 'Type 2 Diabetes',
        healthCategory: 'Endocrinology',
        ageBand: '45-54',
        biologicalSex: 'male',
      } as any,
    ]);

    const { result } = renderHook(() => useCatalog({ retryAttempts: 0 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.getEhrList).toHaveBeenCalled();
    expect(api.getCatalogAssets).not.toHaveBeenCalled();
    expect(result.current.assets.length).toBe(1);
  });

  it('should reset state on refetch', async () => {
    vi.mocked(api.getMode).mockReturnValue('mock');
    vi.mocked(api.getEhrList).mockResolvedValue([]);

    const { result } = renderHook(() => useCatalog({ autoFetch: false }));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.assets).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
