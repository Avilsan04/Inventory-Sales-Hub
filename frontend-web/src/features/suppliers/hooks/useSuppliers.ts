import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';
import type { Supplier } from '@entities/supplier';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  detail: (id: string) => [...supplierKeys.all, 'detail', id] as const,
  products: (id: string) => [...supplierKeys.all, 'products', id] as const,
};

export function useSuppliers(): UseQueryResult<Supplier[]> {
  return useQuery({ queryKey: supplierKeys.lists(), queryFn: suppliersApi.getSuppliers });
}
