import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from './useProducts';
import type { Category } from '@entities/product';

export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({ queryKey: productKeys.categories(), queryFn: productsApi.getCategories });
}
