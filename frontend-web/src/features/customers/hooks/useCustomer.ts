import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import { customerKeys } from './useCustomers';
import type { Customer } from '@entities/customer';

export function useCustomer(id: string): UseQueryResult<Customer> {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getCustomer(id),
    enabled: id.trim().length > 0,
  });
}
