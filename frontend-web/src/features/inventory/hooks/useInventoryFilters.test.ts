import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInventoryFilters } from './useInventoryFilters';
import { INVENTORY_PAGE_SIZE } from '../config';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('useInventoryFilters – page reset', () => {
  it('resets page to 1 when tab changes', () => {
    const { result } = renderHook(() => useInventoryFilters());

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.setTab('low');
    });
    expect(result.current.page).toBe(1);
  });

  it('resets page to 1 when debouncedSearch fires', async () => {
    const { result } = renderHook(() => useInventoryFilters());

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.setSearch('bolt');
    });
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
      await Promise.resolve();
    });
    expect(result.current.page).toBe(1);
  });

  it('resets page to 1 when warehouseFilter changes', () => {
    const { result } = renderHook(() => useInventoryFilters());

    act(() => {
      result.current.setPage(4);
    });
    expect(result.current.page).toBe(4);

    act(() => {
      result.current.setWarehouseFilter('wh-001');
    });
    expect(result.current.page).toBe(1);
  });
});

describe('useInventoryFilters – params construction', () => {
  it('omits optional params when filters are empty', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => {
      vi.runAllTimers();
    });

    const { params } = result.current;
    expect(params.page).toBe(0);
    expect(params.pageSize).toBe(INVENTORY_PAGE_SIZE);
    expect(params.search).toBeUndefined();
    expect(params.status).toBeUndefined();
    expect(params.warehouseId).toBeUndefined();
  });

  it('includes search in params after debounce', async () => {
    const { result } = renderHook(() => useInventoryFilters());

    act(() => {
      result.current.setSearch('widget');
    });
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
      await Promise.resolve();
    });
    expect(result.current.params.search).toBe('widget');
  });

  it('includes status when tab is low', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => {
      result.current.setTab('low');
    });
    expect(result.current.params.status).toBe('LOW_STOCK');
  });

  it('includes status when tab is out', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => {
      result.current.setTab('out');
    });
    expect(result.current.params.status).toBe('OUT_OF_STOCK');
  });

  it('includes warehouseId when warehouseFilter is set', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => {
      result.current.setWarehouseFilter('wh-42');
    });
    expect(result.current.params.warehouseId).toBe('wh-42');
  });

  it('exposes pageSize matching config', () => {
    const { result } = renderHook(() => useInventoryFilters());
    expect(result.current.pageSize).toBe(INVENTORY_PAGE_SIZE);
  });
});
