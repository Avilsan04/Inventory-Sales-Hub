import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableFilters } from './useTableFilters';

type Item = { id: string; name: string };

const items: Item[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
  { id: '3', name: 'Gamma' },
  { id: '4', name: 'Delta' },
  { id: '5', name: 'Epsilon' },
];

const predicate = (item: Item, q: string): boolean => item.name.toLowerCase().includes(q);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('useTableFilters – filtering', () => {
  it('returns all items when search is empty', () => {
    const { result } = renderHook(() => useTableFilters(items, predicate));
    expect(result.current.filtered).toHaveLength(5);
  });

  it('filters items by debounced search', async () => {
    const { result } = renderHook(() => useTableFilters(items, predicate));

    act(() => {
      result.current.setSearch('alp');
    });
    expect(result.current.filtered).toHaveLength(5); // debounce not yet fired

    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
      await Promise.resolve();
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.name).toBe('Alpha');
  });

  it('is case-insensitive', async () => {
    const { result } = renderHook(() => useTableFilters(items, predicate));
    act(() => {
      result.current.setSearch('BETA');
    });
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
      await Promise.resolve();
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.name).toBe('Beta');
  });

  it('resets page to 1 when search changes', async () => {
    const { result } = renderHook(() => useTableFilters(items, predicate, 2));

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.setSearch('a');
    });
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
      await Promise.resolve();
    });
    expect(result.current.page).toBe(1);
  });
});

describe('useTableFilters – pagination', () => {
  it('paginates correctly with pageSize=2', () => {
    const { result } = renderHook(() => useTableFilters(items, predicate, 2));
    expect(result.current.pageCount).toBe(3);
    expect(result.current.paginated).toHaveLength(2);
    expect(result.current.paginated[0]?.id).toBe('1');
  });

  it('page 2 returns correct slice', () => {
    const { result } = renderHook(() => useTableFilters(items, predicate, 2));
    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.paginated[0]?.id).toBe('3');
    expect(result.current.paginated[1]?.id).toBe('4');
  });

  it('setPageSize resets page to 1', () => {
    const { result } = renderHook(() => useTableFilters(items, predicate, 2));
    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.setPageSize(10);
    });
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it('handles empty data without crashing', () => {
    const { result } = renderHook(() => useTableFilters<Item>(undefined, predicate));
    expect(result.current.filtered).toHaveLength(0);
    expect(result.current.pageCount).toBe(1);
    expect(result.current.paginated).toHaveLength(0);
  });

  it('last page may have fewer items', () => {
    const { result } = renderHook(() => useTableFilters(items, predicate, 2));
    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.paginated).toHaveLength(1);
  });
});
