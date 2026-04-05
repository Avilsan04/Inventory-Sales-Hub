import { z } from 'zod';
import { notificationSchema, notificationTypeSchema } from './notification.schema';

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
