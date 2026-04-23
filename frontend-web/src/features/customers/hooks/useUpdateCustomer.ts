import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import { customerKeys } from './useCustomers';
import type { Customer, UpdateCustomerDTO } from '@entities/customer';

export function useUpdateCustomer(id: string): UseMutationResult<Customer, Error, UpdateCustomerDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => customersApi.updateCustomer(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}
