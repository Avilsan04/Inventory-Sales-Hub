import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useInventoryFilters } from '../../../src/features/inventory/hooks/useInventoryFilters';

describe('useInventoryFilters', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  describe('page reset', () => {
    it('resets page to 1 when tab changes', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setPage(2); });
      expect(result.current.page).toBe(2);

      act(() => { result.current.setTab('low'); });

      expect(result.current.page).toBe(1);
    });

    it('resets page to 1 when warehouseFilter changes', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setPage(3); });
      expect(result.current.page).toBe(3);

      act(() => { result.current.setWarehouseFilter('wh-a'); });

      expect(result.current.page).toBe(1);
    });

    it('resets page to 1 when search debounces', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setPage(2); });
      act(() => { result.current.setSearch('laptop'); });
      act(() => { vi.advanceTimersByTime(400); });

      expect(result.current.page).toBe(1);
    });

    it('does NOT reset page before debounce delay elapses', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setPage(2); });
      act(() => { result.current.setSearch('laptop'); });
      act(() => { vi.advanceTimersByTime(100); });

      expect(result.current.page).toBe(2);
    });
  });

  describe('params output', () => {
    it('defaults to page 0, no status, no search, no warehouseId', () => {
      const { result } = renderHook(() => useInventoryFilters());
      const { params } = result.current;

      expect(params.page).toBe(0);
      expect(params.status).toBeUndefined();
      expect(params.search).toBeUndefined();
      expect(params.warehouseId).toBeUndefined();
    });

    it('sets status to LOW_STOCK when tab is "low"', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setTab('low'); });

      expect(result.current.params.status).toBe('LOW_STOCK');
    });

    it('sets status to OUT_OF_STOCK when tab is "out"', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setTab('out'); });

      expect(result.current.params.status).toBe('OUT_OF_STOCK');
    });

    it('omits status when tab is "all"', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setTab('low'); });
      act(() => { result.current.setTab('all'); });

      expect(result.current.params.status).toBeUndefined();
    });

    it('sets warehouseId when warehouseFilter is set', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setWarehouseFilter('wh-a'); });

      expect(result.current.params.warehouseId).toBe('wh-a');
    });

    it('omits warehouseId when warehouseFilter is null', () => {
      const { result } = renderHook(() => useInventoryFilters());

      expect(result.current.params.warehouseId).toBeUndefined();
    });

    it('sets search after debounce elapses', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setSearch('laptop'); });
      act(() => { vi.advanceTimersByTime(400); });

      expect(result.current.params.search).toBe('laptop');
    });

    it('omits search before debounce elapses', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setSearch('laptop'); });
      act(() => { vi.advanceTimersByTime(100); });

      expect(result.current.params.search).toBeUndefined();
    });

    it('encodes page as 0-based index', () => {
      const { result } = renderHook(() => useInventoryFilters());

      act(() => { result.current.setPage(3); });

      expect(result.current.params.page).toBe(2);
    });
  });
});
