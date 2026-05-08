import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import { withTenant } from '@core/api/queryKeys';
import type { Customer } from '@entities/customer';

export const customerKeys = {
  all: (): QueryKey => withTenant(['customers'] as const),
  lists: (): QueryKey => withTenant(['customers', 'list'] as const),
  detail: (id: string): QueryKey => withTenant(['customers', 'detail', id] as const),
};

export function useCustomers(): UseQueryResult<Customer[]> {
  return useQuery({ queryKey: customerKeys.lists(), queryFn: customersApi.getCustomers });
}
