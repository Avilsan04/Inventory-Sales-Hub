import { httpClient } from '@core/http';
import { notificationListSchema, notificationSchema } from '@entities/notification';
import type { Notification } from '@entities/notification';

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const res = await httpClient.get<Notification[]>('/notifications');
    return notificationListSchema.parse(res);
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await httpClient.patch<Notification>(`/notifications/${id}/read`);
    return notificationSchema.parse(res);
  },

  markAllAsRead: async (): Promise<void> => {
    await httpClient.patch('/notifications/read-all');
  },
};
