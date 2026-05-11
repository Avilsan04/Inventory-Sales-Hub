import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import { withTenant } from '@core/api/queryKeys';
import type { Notification } from '@entities/notification';

export const notificationKeys = {
  all: (): QueryKey => withTenant(['notifications'] as const),
  lists: (): QueryKey => withTenant(['notifications', 'list'] as const),
};

export function useNotifications(): UseQueryResult<Notification[]> {
  return useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: notificationsApi.getNotifications,
    refetchOnWindowFocus: true,
  });
}

export function useMarkAsRead(): UseMutationResult<Notification, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useMarkAllAsRead(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}
