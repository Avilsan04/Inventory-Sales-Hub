import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { settingsApi, type TenantSettings } from '../api/settingsApi';
import { withTenant } from '@core/api/queryKeys';

export const settingsKeys = {
  all: (): QueryKey => withTenant(['settings'] as const),
};

export function useSettings(): UseQueryResult<TenantSettings> {
  return useQuery({
    queryKey: settingsKeys.all(),
    queryFn: settingsApi.getSettings,
    staleTime: 5 * 60 * 1000,
  });
}
