import { httpClient } from '@core/http';
import { parseOrThrow } from '@core/api/parseOrThrow';
import { notificationListSchema, notificationSchema } from '@entities/notification';
import type { Notification } from '@entities/notification';

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const res = await httpClient.get<unknown>('/notifications');
    return parseOrThrow(notificationListSchema, res);
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await httpClient.patch<unknown>(`/notifications/${id}/read`);
    return parseOrThrow(notificationSchema, res);
  },

  markAllAsRead: async (): Promise<void> => {
    await httpClient.patch('/notifications/read-all');
  },
};
