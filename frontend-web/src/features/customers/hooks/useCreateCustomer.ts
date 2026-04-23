import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import { customerKeys } from './useCustomers';
import type { Customer, CreateCustomerDTO } from '@entities/customer';

export function useCreateCustomer(): UseMutationResult<Customer, Error, CreateCustomerDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customersApi.createCustomer,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: customerKeys.lists() }); },
  });
}
