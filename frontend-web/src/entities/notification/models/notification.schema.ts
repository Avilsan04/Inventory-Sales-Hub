import { z } from 'zod';

export const notificationTypeSchema = z
  .string()
  .transform((t) => t.toLowerCase() as 'info' | 'warning' | 'error' | 'success');

const rawNotificationSchema = z.object({
  id: z.number(),
  message: z.string(),
  type: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const notificationSchema = rawNotificationSchema.transform(
  (n): {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    createdAt: string;
  } => ({
    id: String(n.id),
    title: n.message.substring(0, 50),
    message: n.message,
    type: n.type.toLowerCase() as 'info' | 'warning' | 'error' | 'success',
    isRead: n.isRead,
    createdAt: n.createdAt,
  })
);

export const notificationListSchema = z.array(notificationSchema);
