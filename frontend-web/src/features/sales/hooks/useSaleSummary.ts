import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import { saleKeys } from './useSales';
import type { SaleSummary } from '@entities/sale';

export function useSaleSummary(): UseQueryResult<SaleSummary> {
  return useQuery({ queryKey: saleKeys.summary(), queryFn: salesApi.getSummary });
}
