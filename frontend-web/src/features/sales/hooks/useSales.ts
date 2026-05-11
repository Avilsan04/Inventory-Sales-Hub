import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import type { SaleFilters } from '../api/salesApi';
import { withTenant } from '@core/api/queryKeys';
import type { Sale } from '@entities/sale';

export type { SaleFilters };

export const saleKeys = {
  all: (): QueryKey => withTenant(['sales'] as const),
  lists: (filters?: SaleFilters): QueryKey => withTenant(['sales', 'list', filters ?? {}] as const),
  detail: (id: string): QueryKey => withTenant(['sales', 'detail', id] as const),
  items: (id: string): QueryKey => withTenant(['sales', 'items', id] as const),
  summary: (): QueryKey => withTenant(['sales', 'summary'] as const),
};

export function useSales(filters?: SaleFilters): UseQueryResult<Sale[]> {
  return useQuery({
    queryKey: saleKeys.lists(filters),
    queryFn: () => salesApi.getSales(filters),
    staleTime: 30_000,
  });
}
