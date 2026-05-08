import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { withTenant } from '@core/api/queryKeys';
import type { Product } from '@entities/product';

export const productKeys = {
  all: (): QueryKey => withTenant(['products'] as const),
  lists: (): QueryKey => withTenant(['products', 'list'] as const),
  detail: (id: string): QueryKey => withTenant(['products', 'detail', id] as const),
  categories: (): QueryKey => withTenant(['products', 'categories'] as const),
};

export function useProducts(): UseQueryResult<Product[]> {
  return useQuery({ queryKey: productKeys.lists(), queryFn: productsApi.getProducts });
}
