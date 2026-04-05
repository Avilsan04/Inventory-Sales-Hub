import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';
import type { SupplierOrder, CreateSupplierOrderDTO } from '@entities/supplier';

export function useCreateSupplierOrder(supplierId: string): UseMutationResult<SupplierOrder, Error, CreateSupplierOrderDTO> {
  return useMutation({ mutationFn: (data) => suppliersApi.createOrder(supplierId, data) });
}
