import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import { saleKeys } from './useSales';
import type { Sale } from '@entities/sale';

export function useMyOrders(): UseQueryResult<Sale[]> {
  return useQuery({
    queryKey: saleKeys.myOrders(),
    queryFn: salesApi.getMyOrders,
    staleTime: 30_000,
  });
}
