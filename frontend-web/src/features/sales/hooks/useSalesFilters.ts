import * as React from 'react';
import { useDebounce } from '@shared/hooks';
import { useSales } from './useSales';
import type { Sale } from '@entities/sale';
import type { DateRange } from '@shared/ui/composed';

const PAGE_SIZE = 20;

interface SalesFiltersState {
  data: Sale[] | undefined;
  isLoading: boolean;
  isError: boolean;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  debouncedSearch: string;
  dateFilter: DateRange | null;
  setDateFilter: React.Dispatch<React.SetStateAction<DateRange | null>>;
  showDateFilter: boolean;
  toggleDateFilter: () => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageCount: number;
  paginated: Sale[];
}

export function useSalesFilters(): SalesFiltersState {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search);
  const [dateFilter, setDateFilter] = React.useState<DateRange | null>(null);
  const [showDateFilter, setShowDateFilter] = React.useState(false);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, dateFilter]);

  const filters = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      dateFrom: dateFilter?.from || undefined,
      dateTo: dateFilter?.to || undefined,
    }),
    [debouncedSearch, dateFilter]
  );

  const { data, isLoading, isError } = useSales(filters);

  const pageCount = Math.ceil((data?.length ?? 0) / PAGE_SIZE);
  const paginated = (data ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleDateFilter = (): void => {
    setShowDateFilter((v) => !v);
    if (showDateFilter) setDateFilter(null);
  };

  return {
    data,
    isLoading,
    isError,
    search,
    setSearch,
    debouncedSearch,
    dateFilter,
    setDateFilter,
    showDateFilter,
    toggleDateFilter,
    page,
    setPage,
    pageCount,
    paginated,
  };
}

export { PAGE_SIZE as SALES_PAGE_SIZE };
