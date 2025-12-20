import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNegotiation } from './useNegotiation';
import { api } from '../services/apiFactory';

vi.mock('../services/apiFactory');

describe('useNegotiation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initiate negotiation and poll until finalized', async () => {
    vi.mocked(api.initiateNegotiation).mockResolvedValue({
      negotiationId: 'neg-123',
      state: 'REQUESTING',
    });

    vi.mocked(api.getNegotiation)
      .mockResolvedValueOnce({ negotiationId: 'neg-123', state: 'REQUESTED' })
      .mockResolvedValueOnce({ negotiationId: 'neg-123', state: 'OFFERED' })
      .mockResolvedValueOnce({
        negotiationId: 'neg-123',
        state: 'FINALIZED',
        contractAgreementId: 'agreement-456',
      });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useNegotiation({ onSuccess, pollInterval: 100 }));

    await act(async () => {
      await result.current.initiateNegotiation('ehr:EHR001', 'offer:123');
    });

    expect(result.current.state).toBe('REQUESTING');
    expect(result.current.isNegotiating).toBe(true);

    // Fast-forward through polling
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    await waitFor(() => expect(result.current.state).toBe('REQUESTED'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    await waitFor(() => expect(result.current.state).toBe('OFFERED'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    await waitFor(() => expect(result.current.state).toBe('FINALIZED'));

    expect(result.current.contractAgreementId).toBe('agreement-456');
    expect(result.current.isNegotiating).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith('agreement-456');
  });

  it('should handle terminated negotiation', async () => {
    vi.mocked(api.initiateNegotiation).mockResolvedValue({
      negotiationId: 'neg-123',
      state: 'REQUESTING',
    });

    vi.mocked(api.getNegotiation).mockResolvedValue({
      negotiationId: 'neg-123',
      state: 'TERMINATED',
      message: 'Policy not satisfied',
    });

    const onError = vi.fn();
    const { result } = renderHook(() => useNegotiation({ onError, pollInterval: 100 }));

    await act(async () => {
      await result.current.initiateNegotiation('ehr:EHR001', 'offer:123');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    await waitFor(() => expect(result.current.state).toBe('TERMINATED'));
    expect(result.current.isNegotiating).toBe(false);
    expect(result.current.error?.message).toContain('Policy not satisfied');
    expect(onError).toHaveBeenCalled();
  });

  it('should allow cancellation', async () => {
    vi.mocked(api.initiateNegotiation).mockResolvedValue({
      negotiationId: 'neg-123',
      state: 'REQUESTING',
    });

    const { result } = renderHook(() => useNegotiation({ pollInterval: 100 }));

    await act(async () => {
      await result.current.initiateNegotiation('ehr:EHR001', 'offer:123');
    });

    expect(result.current.isNegotiating).toBe(true);

    act(() => {
      result.current.cancelNegotiation();
    });

    expect(result.current.isNegotiating).toBe(false);
    expect(result.current.state).toBe('IDLE');
  });

  it('should reset state', async () => {
    vi.mocked(api.initiateNegotiation).mockResolvedValue({
      negotiationId: 'neg-123',
      state: 'FINALIZED',
      contractAgreementId: 'agreement-456',
    });

    const { result } = renderHook(() => useNegotiation());

    await act(async () => {
      await result.current.initiateNegotiation('ehr:EHR001', 'offer:123');
    });

    await waitFor(() => expect(result.current.contractAgreementId).toBe('agreement-456'));

    act(() => {
      result.current.reset();
    });

    expect(result.current.negotiationId).toBeNull();
    expect(result.current.state).toBe('IDLE');
    expect(result.current.contractAgreementId).toBeNull();
  });
});
