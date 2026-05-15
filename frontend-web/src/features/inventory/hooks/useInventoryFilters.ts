import * as React from 'react';
import { useDebounce } from '@shared/hooks';
import type { InventoryListParams } from '../api/inventoryApi';
import { INVENTORY_PAGE_SIZE } from '../config';

export type StockTab = 'all' | 'low' | 'out';

const TAB_STATUS: Record<StockTab, string | undefined> = {
  all: undefined,
  low: 'LOW_STOCK',
  out: 'OUT_OF_STOCK',
};

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
  pageSize: number;
  params: InventoryListParams;
}

export function useInventoryFilters(): InventoryFiltersState {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search);
  const [tab, setTab] = React.useState<StockTab>('all');
  const [page, setPage] = React.useState(1);
  const [warehouseFilter, setWarehouseFilter] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch, warehouseFilter]);

  const params = React.useMemo(
    (): InventoryListParams => ({
      page: page - 1,
      pageSize: INVENTORY_PAGE_SIZE,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(TAB_STATUS[tab] !== undefined && { status: TAB_STATUS[tab] }),
      ...(warehouseFilter && { warehouseId: warehouseFilter }),
    }),
    [page, debouncedSearch, tab, warehouseFilter]
  );

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
    pageSize: INVENTORY_PAGE_SIZE,
    params,
  };
}
