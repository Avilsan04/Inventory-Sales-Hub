import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from './useProducts';
import type { Product } from '@entities/product';

export function useProduct(id: string): UseQueryResult<Product> {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: id.trim().length > 0,
  });
}
