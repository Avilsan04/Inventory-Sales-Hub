import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { adminKeys } from './useTenants';
import type { AdminMetrics } from '@entities/admin';

export function useAdminMetrics(): UseQueryResult<AdminMetrics> {
  return useQuery({
    queryKey: adminKeys.metrics(),
    queryFn: adminApi.getMetrics,
    staleTime: 60_000,
  });
}
