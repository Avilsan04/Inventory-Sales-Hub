import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import type { Customer } from '@entities/customer';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
};

export function useCustomers(): UseQueryResult<Customer[]> {
  return useQuery({ queryKey: customerKeys.lists(), queryFn: customersApi.getCustomers });
}
