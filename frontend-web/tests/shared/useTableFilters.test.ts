import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTableFilters } from '../../src/shared/hooks/useTableFilters';

interface Item {
  id: string;
  name: string;
  role: string;
}

const ITEMS: Item[] = [
  { id: '1', name: 'Alice', role: 'admin' },
  { id: '2', name: 'Bob', role: 'staff' },
  { id: '3', name: 'Carol', role: 'admin' },
  { id: '4', name: 'Dave', role: 'customer' },
];

const predicate = vi.fn((item: Item, q: string) => item.name.toLowerCase().includes(q));

describe('useTableFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    predicate.mockClear();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('returns all items when search is empty', () => {
    const { result } = renderHook(() => useTableFilters(ITEMS, predicate));
    expect(result.current.filtered).toHaveLength(4);
    expect(result.current.paginated).toHaveLength(4);
  });

  it('returns empty arrays when data is undefined', () => {
    const { result } = renderHook(() => useTableFilters<Item>(undefined, predicate));
    expect(result.current.filtered).toHaveLength(0);
    expect(result.current.paginated).toHaveLength(0);
  });

  it('filters after debounce elapses', () => {
    const { result } = renderHook(() => useTableFilters(ITEMS, predicate));

    act(() => { result.current.setSearch('alice'); });
    act(() => { vi.advanceTimersByTime(400); });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.name).toBe('Alice');
  });

  it('does NOT filter before debounce delay', () => {
    const { result } = renderHook(() => useTableFilters(ITEMS, predicate));

    act(() => { result.current.setSearch('alice'); });
    act(() => { vi.advanceTimersByTime(100); });

    // debouncedSearch not yet updated → all items still visible
    expect(result.current.filtered).toHaveLength(4);
  });

  it('resets page to 1 when search debounces', () => {
    const { result } = renderHook(() => useTableFilters(ITEMS, predicate));

    act(() => { result.current.setPage(3); });
    expect(result.current.page).toBe(3);

    act(() => { result.current.setSearch('bob'); });
    act(() => { vi.advanceTimersByTime(400); });

    expect(result.current.page).toBe(1);
  });

  it('setPageSize resets page to 1 and changes page size', () => {
    const { result } = renderHook(() => useTableFilters(ITEMS, predicate, 2));

    act(() => { result.current.setPage(2); });
    expect(result.current.page).toBe(2);

    act(() => { result.current.setPageSize(10); });

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it('paginates correctly with small page size', () => {
    const { result } = renderHook(() => useTableFilters(ITEMS, predicate, 2));

    expect(result.current.pageCount).toBe(2);
    expect(result.current.paginated).toHaveLength(2);

    act(() => { result.current.setPage(2); });
    expect(result.current.paginated).toHaveLength(2);
    expect(result.current.paginated[0]?.name).toBe('Carol');
  });

  it('pageCount is at least 1 even with empty data', () => {
    const { result } = renderHook(() => useTableFilters<Item>([], predicate));
    expect(result.current.pageCount).toBe(1);
  });

  it('returns debouncedSearch for external consumers', () => {
    const { result } = renderHook(() => useTableFilters(ITEMS, predicate));

    act(() => { result.current.setSearch('dave'); });
    expect(result.current.debouncedSearch).toBe('');

    act(() => { vi.advanceTimersByTime(400); });
    expect(result.current.debouncedSearch).toBe('dave');
  });
});
