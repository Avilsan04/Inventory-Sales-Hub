import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Tenant, AdminMetrics } from '@entities/admin';
import mockData from '@app/mock/mock-data.json';

const mockTenants: Tenant[] = [...mockData.tenants] as Tenant[];

export const adminHandlers = [
  http.get(`${API_BASE_URL}/admin/tenants`, async () => {
    await delay(500);
    return HttpResponse.json(mockTenants);
  }),

  http.get(`${API_BASE_URL}/admin/metrics`, async () => {
    await delay(400);
    const metrics: AdminMetrics = {
      totalTenants: mockTenants.length,
      activeTenants: mockTenants.filter((t) => t.status === 'active').length,
      suspendedTenants: mockTenants.filter((t) => t.status === 'suspended').length,
      totalRevenueMrr: 18_450,
    };
    return HttpResponse.json(metrics);
  }),

  http.post(`${API_BASE_URL}/admin/tenants/:tenantId/activate`, async ({ params }) => {
    await delay(400);
    const idx = mockTenants.findIndex((t) => t.id === params['tenantId']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const tenant = mockTenants[idx];
    if (tenant === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...tenant, status: 'active' as const };
    mockTenants[idx] = updated;
    return HttpResponse.json(updated);
  }),

  http.post(`${API_BASE_URL}/admin/tenants/:tenantId/suspend`, async ({ params }) => {
    await delay(400);
    const idx = mockTenants.findIndex((t) => t.id === params['tenantId']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const tenant = mockTenants[idx];
    if (tenant === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...tenant, status: 'suspended' as const };
    mockTenants[idx] = updated;
    return HttpResponse.json(updated);
  }),

  http.post(`${API_BASE_URL}/admin/tenants/:tenantId/impersonate`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({
      token: `impersonation-token-${String(params['tenantId'])}-${String(Date.now())}`,
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    });
  }),
];
