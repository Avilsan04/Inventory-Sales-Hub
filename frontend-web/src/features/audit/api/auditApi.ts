import { httpClient } from '@core/http';
import { auditLogsSchema } from '@entities/audit';
import type { AuditLog, AuditEntityType } from '@entities/audit';

export const auditApi = {
  getAuditLogs: async (params?: {
    entityType?: AuditEntityType;
    userId?: string;
  }): Promise<AuditLog[]> => {
    const res = await httpClient.get<unknown>('/audit', {
      params: params as Record<string, unknown>,
    });
    return auditLogsSchema.parse(res);
  },
};
