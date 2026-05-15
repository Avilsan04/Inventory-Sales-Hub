import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { settingsApi, type TenantSettings, type UpdateSettingsDTO } from '../api/settingsApi';
import { settingsKeys } from './useSettings';

export function useUpdateSettings(): UseMutationResult<TenantSettings, Error, UpdateSettingsDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.all(), data);
    },
  });
}
