import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import type { Tenant } from '@entities/admin';

export const adminKeys = {
  all: ['admin'] as const,
  tenants: () => [...adminKeys.all, 'tenants'] as const,
  metrics: () => [...adminKeys.all, 'metrics'] as const,
};

export function useTenants(): UseQueryResult<Tenant[]> {
  return useQuery({
    queryKey: adminKeys.tenants(),
    queryFn: adminApi.getTenants,
    staleTime: 60_000,
  });
}

export function useActivateTenant(): UseMutationResult<Tenant, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => adminApi.activateTenant(tenantId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.tenants() });
    },
  });
}

export function useSuspendTenant(): UseMutationResult<Tenant, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => adminApi.suspendTenant(tenantId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.tenants() });
    },
  });
}
