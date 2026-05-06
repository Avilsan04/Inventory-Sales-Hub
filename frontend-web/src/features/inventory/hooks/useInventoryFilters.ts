import * as React from 'react';
import { useDebounce } from '@shared/hooks';
import type { InventoryItem } from '@entities/inventory';

type StockTab = 'all' | 'low' | 'out';

const PAGE_SIZE = 10;

interface TabDef {
  id: StockTab;
  labelKey: string;
  count: number;
}

interface InventoryFiltersState {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  tab: StockTab;
  setTab: React.Dispatch<React.SetStateAction<StockTab>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  warehouseFilter: string | null;
  setWarehouseFilter: React.Dispatch<React.SetStateAction<string | null>>;
  debouncedSearch: string;
  tabs: TabDef[];
  filtered: InventoryItem[];
  paginated: InventoryItem[];
  pageCount: number;
}

export function useInventoryFilters(data: InventoryItem[] | undefined): InventoryFiltersState {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search);
  const [tab, setTab] = React.useState<StockTab>('all');
  const [page, setPage] = React.useState(1);
  const [warehouseFilter, setWarehouseFilter] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch]);

  const tabs = React.useMemo((): TabDef[] => {
    const all = data ?? [];
    return [
      { id: 'all', labelKey: 'inventory.allProducts', count: all.length },
      {
        id: 'low',
        labelKey: 'inventory.lowStockTab',
        count: all.filter((i) => i.status === 'LOW_STOCK').length,
      },
      {
        id: 'out',
        labelKey: 'inventory.outOfStockTab',
        count: all.filter((i) => i.status === 'OUT_OF_STOCK').length,
      },
    ];
  }, [data]);

  const filtered = React.useMemo((): InventoryItem[] => {
    return (data ?? []).filter((item) => {
      if (tab === 'low' && item.status !== 'LOW_STOCK') return false;
      if (tab === 'out' && item.status !== 'OUT_OF_STOCK') return false;
      if (warehouseFilter && item.warehouseId !== warehouseFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [data, tab, debouncedSearch, warehouseFilter]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    search,
    setSearch,
    tab,
    setTab,
    page,
    setPage,
    warehouseFilter,
    setWarehouseFilter,
    debouncedSearch,
    tabs,
    filtered,
    paginated,
    pageCount,
  };
}

export { PAGE_SIZE };
