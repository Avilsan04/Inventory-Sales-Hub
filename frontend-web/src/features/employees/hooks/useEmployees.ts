import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { employeesApi } from '../api/employeesApi';
import { withTenant } from '@core/api/queryKeys';
import type { Employee } from '@entities/employee';

export const employeeKeys = {
  all: (): QueryKey => withTenant(['employees'] as const),
  lists: (): QueryKey => withTenant(['employees', 'list'] as const),
  detail: (id: string): QueryKey => withTenant(['employees', 'detail', id] as const),
};

export function useEmployees(): UseQueryResult<Employee[]> {
  return useQuery({ queryKey: employeeKeys.lists(), queryFn: employeesApi.getEmployees });
}
