import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import type { Sale } from '@entities/sale';

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  detail: (id: string) => [...saleKeys.all, 'detail', id] as const,
  items: (id: string) => [...saleKeys.all, 'items', id] as const,
  summary: () => [...saleKeys.all, 'summary'] as const,
};

export function useSales(): UseQueryResult<Sale[]> {
  return useQuery({ queryKey: saleKeys.lists(), queryFn: salesApi.getSales, staleTime: 30_000 });
}
