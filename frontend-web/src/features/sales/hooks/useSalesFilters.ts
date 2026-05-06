import * as React from 'react';
import { useDebounce } from '@shared/hooks';
import type { Sale } from '@entities/sale';
import type { DateRange } from '@shared/ui/composed';

interface SalesFiltersState {
  filtered: Sale[];
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  debouncedSearch: string;
  dateFilter: DateRange | null;
  setDateFilter: React.Dispatch<React.SetStateAction<DateRange | null>>;
  showDateFilter: boolean;
  toggleDateFilter: () => void;
}

export function useSalesFilters(sales: Sale[] | undefined): SalesFiltersState {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search);
  const [dateFilter, setDateFilter] = React.useState<DateRange | null>(null);
  const [showDateFilter, setShowDateFilter] = React.useState(false);

  const filtered = React.useMemo((): Sale[] => {
    if (!sales) return [];
    return sales.filter((s) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!s.id.toLowerCase().includes(q) && !(s.customerId ?? '').toLowerCase().includes(q))
          return false;
      }
      if (dateFilter) {
        const d = s.createdAt.slice(0, 10);
        if (d < dateFilter.from || d > dateFilter.to) return false;
      }
      return true;
    });
  }, [sales, debouncedSearch, dateFilter]);

  const toggleDateFilter = (): void => {
    setShowDateFilter((v) => !v);
    if (showDateFilter) setDateFilter(null);
  };

  return {
    filtered,
    search,
    setSearch,
    debouncedSearch,
    dateFilter,
    setDateFilter,
    showDateFilter,
    toggleDateFilter,
  };
}
