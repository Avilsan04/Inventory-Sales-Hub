import type { AuditLog, AuditEntityType } from '@entities/audit';

export interface IAuditApi {
  readonly getAuditLogs: (params?: {
    entityType?: AuditEntityType;
    userId?: string;
  }) => Promise<AuditLog[]>;
}
