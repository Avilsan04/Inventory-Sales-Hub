import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';
import type { AuditLog, AuditEntityType } from '@entities/audit';

const auditKeys = {
  all: ['audit'] as const,
  list: (params?: { entityType?: AuditEntityType; userId?: string }) =>
    [...auditKeys.all, params] as const,
};

export function useAuditLog(params?: {
  entityType?: AuditEntityType;
  userId?: string;
}): UseQueryResult<AuditLog[]> {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => auditApi.getAuditLogs(params),
    staleTime: 60_000,
  });
}
