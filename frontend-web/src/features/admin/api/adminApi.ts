import { httpClient } from '@core/http';
import { parseOrThrow } from '@core/api/parseOrThrow';
import {
  tenantSchema,
  tenantListSchema,
  adminMetricsSchema,
  impersonationTokenSchema,
  type Tenant,
  type AdminMetrics,
  type ImpersonationToken,
} from '@entities/admin';

export const adminApi = {
  getTenants: async (): Promise<Tenant[]> => {
    const res = await httpClient.get<unknown>('/admin/tenants');
    return parseOrThrow(tenantListSchema, res);
  },

  getMetrics: async (): Promise<AdminMetrics> => {
    const res = await httpClient.get<unknown>('/admin/metrics');
    return parseOrThrow(adminMetricsSchema, res);
  },

  activateTenant: async (tenantId: string): Promise<Tenant> => {
    const res = await httpClient.post<unknown>(`/admin/tenants/${tenantId}/activate`);
    return parseOrThrow(tenantSchema, res);
  },

  suspendTenant: async (tenantId: string, reason?: string): Promise<Tenant> => {
    const res = await httpClient.post<unknown>(`/admin/tenants/${tenantId}/suspend`, { reason });
    return parseOrThrow(tenantSchema, res);
  },

  getImpersonationToken: async (tenantId: string): Promise<ImpersonationToken> => {
    const res = await httpClient.post<unknown>(`/admin/tenants/${tenantId}/impersonate`);
    return parseOrThrow(impersonationTokenSchema, res);
  },
};
