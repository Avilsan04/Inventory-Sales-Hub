import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import type { SaleFilters } from '../api/salesApi';
import { withTenant } from '@core/api/queryKeys';
import type { Sale, PaginatedSaleResponse } from '@entities/sale';

export type { SaleFilters };

export const saleKeys = {
  all: (): QueryKey => withTenant(['sales'] as const),
  lists: (filters?: SaleFilters): QueryKey => withTenant(['sales', 'list', filters ?? {}] as const),
  detail: (id: string): QueryKey => withTenant(['sales', 'detail', id] as const),
  items: (id: string): QueryKey => withTenant(['sales', 'items', id] as const),
  summary: (): QueryKey => withTenant(['sales', 'summary'] as const),
  myOrders: (): QueryKey => withTenant(['sales', 'my-orders'] as const),
};

export function useSales(filters?: SaleFilters): UseQueryResult<PaginatedSaleResponse> {
  return useQuery({
    queryKey: saleKeys.lists(filters),
    queryFn: () => salesApi.getSales(filters),
  });
}

/** Flat list variant for consumers that need Sale[] (e.g. status charts, statusSlices). */
export function useSalesFlat(
  filters?: Omit<SaleFilters, 'page' | 'pageSize'>
): UseQueryResult<Sale[]> {
  return useQuery({
    queryKey: withTenant(['sales', 'flat', filters ?? {}] as const),
    queryFn: () => salesApi.getSalesFlat(filters),
  });
}
