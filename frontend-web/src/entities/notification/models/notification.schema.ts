import { z } from 'zod';

export const notificationTypeSchema = z
  .string()
  .transform((t) => t.toLowerCase() as 'info' | 'warning' | 'error' | 'success');

const rawNotificationSchema = z.object({
  id: z.number(),
  messageKey: z.string(),
  messageParams: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  type: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const notificationSchema = rawNotificationSchema.transform(
  (
    n
  ): {
    id: string;
    messageKey: string;
    messageParams: Record<string, string | number>;
    type: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    createdAt: string;
  } => ({
    id: String(n.id),
    messageKey: n.messageKey,
    messageParams: n.messageParams ?? {},
    type: n.type.toLowerCase() as 'info' | 'warning' | 'error' | 'success',
    isRead: n.isRead,
    createdAt: n.createdAt,
  })
);

export const notificationListSchema = z.array(notificationSchema);
