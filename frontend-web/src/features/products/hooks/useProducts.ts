import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import type { Product } from '@entities/product';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
};

export function useProducts(): UseQueryResult<Product[]> {
  return useQuery({ queryKey: productKeys.lists(), queryFn: productsApi.getProducts });
}
