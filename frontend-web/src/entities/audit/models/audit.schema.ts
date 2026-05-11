import { z } from 'zod';

export const auditActionSchema = z.enum([
  'create',
  'update',
  'delete',
  'adjust_stock',
  'status_change',
  'login',
  'logout',
]);

export const auditEntityTypeSchema = z.enum([
  'product',
  'inventory',
  'sale',
  'employee',
  'customer',
  'supplier',
]);

export const auditLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  action: auditActionSchema,
  entityType: auditEntityTypeSchema,
  entityId: z.string(),
  before: z.record(z.string(), z.unknown()).optional(),
  after: z.record(z.string(), z.unknown()).optional(),
  reason: z.string().optional(),
  timestamp: z.iso.datetime(),
});

export const auditLogsSchema = z.array(auditLogSchema);

export type AuditLog = z.infer<typeof auditLogSchema>;
export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditEntityType = z.infer<typeof auditEntityTypeSchema>;
