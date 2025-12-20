import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTransfer } from './useTransfer';
import { api } from '../services/apiFactory';

vi.mock('../services/apiFactory');

describe('useTransfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initiate transfer and poll until completed', async () => {
    vi.mocked(api.initiateTransfer).mockResolvedValue({
      transferId: 'transfer-123',
      state: 'PROVISIONING',
      contractAgreementId: 'agreement-456',
    });

    vi.mocked(api.getTransfer)
      .mockResolvedValueOnce({ transferId: 'transfer-123', state: 'PROVISIONED' })
      .mockResolvedValueOnce({ transferId: 'transfer-123', state: 'STARTED' })
      .mockResolvedValueOnce({ transferId: 'transfer-123', state: 'COMPLETED' });

    vi.mocked(api.fetchTransferData).mockResolvedValue({
      credentialSubject: { ehrId: 'EHR001', diagnosis: 'Test' },
    });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useTransfer({ onSuccess, pollInterval: 100 }));

    await act(async () => {
      await result.current.initiateTransfer('agreement-456', 'ehr:EHR001');
    });

    expect(result.current.state).toBe('PROVISIONING');
    expect(result.current.isTransferring).toBe(true);

    // Fast-forward through polling
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    await waitFor(() => expect(result.current.state).toBe('PROVISIONED'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    await waitFor(() => expect(result.current.state).toBe('STARTED'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    await waitFor(() => expect(result.current.state).toBe('COMPLETED'));

    expect(result.current.isTransferring).toBe(false);
    expect(result.current.data).toEqual({
      credentialSubject: { ehrId: 'EHR001', diagnosis: 'Test' },
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should handle terminated transfer', async () => {
    vi.mocked(api.initiateTransfer).mockResolvedValue({
      transferId: 'transfer-123',
      state: 'PROVISIONING',
    });

    vi.mocked(api.getTransfer).mockResolvedValue({
      transferId: 'transfer-123',
      state: 'TERMINATED',
      message: 'Transfer was cancelled',
    });

    const onError = vi.fn();
    const { result } = renderHook(() => useTransfer({ onError, pollInterval: 100 }));

    await act(async () => {
      await result.current.initiateTransfer('agreement-456', 'ehr:EHR001');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    await waitFor(() => expect(result.current.state).toBe('TERMINATED'));
    expect(result.current.isTransferring).toBe(false);
    expect(result.current.error?.message).toContain('cancelled');
    expect(onError).toHaveBeenCalled();
  });

  it('should handle mock mode with instant completion', async () => {
    vi.mocked(api.initiateTransfer).mockResolvedValue({
      transferId: 'mock-transfer-123',
      state: 'COMPLETED',
      contractAgreementId: 'mock-agreement',
      message: 'Mock transfer completed instantly',
    });

    vi.mocked(api.fetchTransferData).mockResolvedValue({
      credentialSubject: { ehrId: 'EHR001' },
    });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useTransfer({ onSuccess }));

    await act(async () => {
      await result.current.initiateTransfer('mock-agreement', 'ehr:EHR001');
    });

    await waitFor(() => expect(result.current.state).toBe('COMPLETED'));
    expect(result.current.isTransferring).toBe(false);
    expect(api.fetchTransferData).toHaveBeenCalledWith('mock-transfer-123');
  });

  it('should allow cancellation during polling', async () => {
    vi.mocked(api.initiateTransfer).mockResolvedValue({
      transferId: 'transfer-123',
      state: 'PROVISIONING',
    });

    const { result } = renderHook(() => useTransfer({ pollInterval: 100 }));

    await act(async () => {
      await result.current.initiateTransfer('agreement-456', 'ehr:EHR001');
    });

    expect(result.current.isTransferring).toBe(true);

    act(() => {
      result.current.cancelTransfer();
    });

    expect(result.current.isTransferring).toBe(false);
    expect(result.current.state).toBe('IDLE');
  });

  it('should reset all state', async () => {
    vi.mocked(api.initiateTransfer).mockResolvedValue({
      transferId: 'transfer-123',
      state: 'COMPLETED',
    });

    vi.mocked(api.fetchTransferData).mockResolvedValue({ test: 'data' });

    const { result } = renderHook(() => useTransfer());

    await act(async () => {
      await result.current.initiateTransfer('agreement', 'asset');
    });

    await waitFor(() => expect(result.current.data).not.toBeNull());

    act(() => {
      result.current.reset();
    });

    expect(result.current.transferId).toBeNull();
    expect(result.current.state).toBe('IDLE');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should retry on polling failure', async () => {
    vi.mocked(api.initiateTransfer).mockResolvedValue({
      transferId: 'transfer-123',
      state: 'PROVISIONING',
    });

    const networkError = new Error('Network error');
    vi.mocked(api.getTransfer)
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce({ transferId: 'transfer-123', state: 'COMPLETED' });

    vi.mocked(api.fetchTransferData).mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() => useTransfer({ 
      pollInterval: 100, 
      retryAttempts: 3,
      retryDelay: 50 
    }));

    await act(async () => {
      await result.current.initiateTransfer('agreement', 'asset');
    });

    // First poll attempt fails
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    // First retry
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    // Second retry
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    // Third attempt succeeds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    await waitFor(() => {
      expect(result.current.state).toBe('COMPLETED');
    }, { timeout: 1000 });
  });

  it('should handle data fetch failure with retry', async () => {
    vi.mocked(api.initiateTransfer).mockResolvedValue({
      transferId: 'transfer-123',
      state: 'COMPLETED',
    });

    const fetchError = new Error('EDR expired');
    vi.mocked(api.fetchTransferData)
      .mockRejectedValueOnce(fetchError)
      .mockRejectedValueOnce(fetchError)
      .mockResolvedValueOnce({ data: 'success' });

    const { result } = renderHook(() => useTransfer({ 
      retryAttempts: 3,
      retryDelay: 50 
    }));

    await act(async () => {
      await result.current.initiateTransfer('agreement', 'asset');
    });

    // Allow retries
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'success' });
    }, { timeout: 1000 });
  });
});
