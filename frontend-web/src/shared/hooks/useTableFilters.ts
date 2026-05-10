import * as React from 'react';
import { useDebounce } from './useDebounce';

const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

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
 * Pass a `predicate` that returns true when the item matches the debounced search string.
 */
export function useTableFilters<T>(
  data: T[] | undefined,
  predicate: (item: T, query: string) => boolean,
  initialPageSize: number = DEFAULT_PAGE_SIZE
): TableFiltersState<T> {
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
    return items.filter((item) => predicate(item, q));
  }, [data, debouncedSearch, predicate]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

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
