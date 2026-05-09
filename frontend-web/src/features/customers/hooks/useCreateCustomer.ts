import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import { customerKeys } from './useCustomers';
import type { Customer, CreateCustomerDTO } from '@entities/customer';

export function useCreateCustomer(): UseMutationResult<
  Customer,
  Error,
  CreateCustomerDTO,
  { previousCustomers: Customer[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.createCustomer,

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() });

      const previousCustomers = queryClient.getQueryData<Customer[]>(customerKeys.lists()) ?? [];
      const optimisticCustomer: Customer = {
        ...dto,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Customer[]>(customerKeys.lists(), (old) =>
        old ? [...old, optimisticCustomer] : [optimisticCustomer]
      );

      return { previousCustomers };
    },

    onError: (_err, _dto, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(customerKeys.lists(), context.previousCustomers);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
