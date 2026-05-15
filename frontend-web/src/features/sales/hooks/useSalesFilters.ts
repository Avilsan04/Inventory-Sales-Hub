import * as React from 'react';
import { useDebounce } from '@shared/hooks';
import { useSales } from './useSales';
import type { Sale } from '@entities/sale';
import type { DateRange } from '@shared/ui/composed';
import { SALES_PAGE_SIZE } from '../config';

interface SalesFiltersState {
  data: Sale[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
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
  totalSales: number;
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
      page: page - 1, // backend is 0-indexed
      pageSize: SALES_PAGE_SIZE,
    }),
    [debouncedSearch, dateFilter, page]
  );

  const { data: paginatedData, isLoading, isFetching, isError } = useSales(filters);

  const paginated = paginatedData?.data ?? [];
  const totalSales = paginatedData?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalSales / SALES_PAGE_SIZE));

  const toggleDateFilter = (): void => {
    setShowDateFilter((v) => !v);
    if (showDateFilter) setDateFilter(null);
  };

  return {
    data: paginated,
    isLoading,
    isFetching,
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
    totalSales,
    paginated,
  };
}
