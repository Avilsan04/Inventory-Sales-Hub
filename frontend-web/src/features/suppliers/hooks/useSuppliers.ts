import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';
import { withTenant } from '@core/api/queryKeys';
import type { Supplier } from '@entities/supplier';

export const supplierKeys = {
  all: (): QueryKey => withTenant(['suppliers'] as const),
  lists: (): QueryKey => withTenant(['suppliers', 'list'] as const),
  detail: (id: string): QueryKey => withTenant(['suppliers', 'detail', id] as const),
  products: (id: string): QueryKey => withTenant(['suppliers', 'products', id] as const),
};

export function useSuppliers(): UseQueryResult<Supplier[]> {
  return useQuery({ queryKey: supplierKeys.lists(), queryFn: suppliersApi.getSuppliers });
}
