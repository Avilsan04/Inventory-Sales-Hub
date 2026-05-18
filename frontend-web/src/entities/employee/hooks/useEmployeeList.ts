import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { httpClient } from '@core/http/httpClient';
import { withTenant } from '@core/api/queryKeys';
import { employeeListSchema } from '../models/employee.schema';
import type { Employee } from '../models/employee.types';

export function useEmployeeList(): UseQueryResult<Employee[]> {
  return useQuery({
    queryKey: withTenant(['employees', 'list'] as const),
    queryFn: async () => {
      const res = await httpClient.get<unknown>('/employees?page=0&size=500');
      return employeeListSchema.parse(res);
    },
  });
}
