import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import { saleKeys } from './useSales';
import type { Sale } from '@entities/sale';

export function useSale(id: string): UseQueryResult<Sale> {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => salesApi.getSale(id),
    enabled: id.trim().length > 0,
  });
}
