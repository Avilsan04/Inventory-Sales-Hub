import * as React from 'react';
import { useDebounce } from './useDebounce';

const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const MATCH_ALL = (): boolean => true;

interface TableFiltersState<T> {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  debouncedSearch: string;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageCount: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  filtered: T[];
  paginated: T[];
}

/**
 * Generic search + pagination for client-side tables.
 * @param predicate - Must be stable (wrap in `useCallback`). It is a `useMemo` dep;
 *   an inline arrow causes the filter to re-run on every render.
 *   Omit or pass `null` when no filtering is needed.
 */
export function useTableFilters<T>(
  data: T[] | undefined,
  predicate: ((item: T, query: string) => boolean) | null = null,
  initialPageSize: number = DEFAULT_PAGE_SIZE
): TableFiltersState<T> {
  const activePredicate = predicate ?? MATCH_ALL;
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSizeState] = React.useState(initialPageSize);

  const setPageSize = React.useCallback((size: number): void => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const filtered = React.useMemo((): T[] => {
    const items = data ?? [];
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((item) => activePredicate(item, q));
  }, [data, debouncedSearch, activePredicate]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Clamp page to valid range — prevents empty paginated result without user feedback
  const clampedPage = Math.min(Math.max(1, page), pageCount);
  const paginated = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  return {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    pageCount,
    pageSize,
    setPageSize,
    filtered,
    paginated,
  };
}
