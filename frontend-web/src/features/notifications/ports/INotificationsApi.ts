import type { Notification } from '@entities/notification';

export interface INotificationsApi {
  readonly getNotifications: () => Promise<Notification[]>;
  readonly markAsRead: (id: string) => Promise<Notification>;
  readonly markAllAsRead: () => Promise<void>;
}
