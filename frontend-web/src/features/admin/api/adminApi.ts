import { httpClient } from '@core/http';
import type { Tenant, AdminMetrics, ImpersonationToken } from '@entities/admin';

export const adminApi = {
  getTenants: async (): Promise<Tenant[]> => {
    return httpClient.get<Tenant[]>('/admin/tenants');
  },

  getMetrics: async (): Promise<AdminMetrics> => {
    return httpClient.get<AdminMetrics>('/admin/metrics');
  },

  activateTenant: async (tenantId: string): Promise<Tenant> => {
    return httpClient.post<Tenant>(`/admin/tenants/${tenantId}/activate`);
  },

  suspendTenant: async (tenantId: string, reason?: string): Promise<Tenant> => {
    return httpClient.post<Tenant>(`/admin/tenants/${tenantId}/suspend`, { reason });
  },

  getImpersonationToken: async (tenantId: string): Promise<ImpersonationToken> => {
    return httpClient.post<ImpersonationToken>(`/admin/tenants/${tenantId}/impersonate`);
  },
};
