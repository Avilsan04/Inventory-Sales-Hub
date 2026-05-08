import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';
import { withTenant } from '@core/api/queryKeys';
import type { AuditLog, AuditEntityType } from '@entities/audit';

const auditKeys = {
  all: (): QueryKey => withTenant(['audit'] as const),
  list: (params?: { entityType?: AuditEntityType; userId?: string }): QueryKey =>
    withTenant(['audit', params] as const),
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
