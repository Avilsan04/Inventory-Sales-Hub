import { z } from 'zod';

export const notificationTypeSchema = z.enum(['info', 'warning', 'error', 'success']);

export const notificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  message: z.string(),
  type: notificationTypeSchema,
  isRead: z.boolean().default(false),
  createdAt: z.iso.datetime(),
});

export const notificationListSchema = z.array(notificationSchema);
