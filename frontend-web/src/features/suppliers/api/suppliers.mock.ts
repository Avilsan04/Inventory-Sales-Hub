import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type { SupplierOrder } from '@entities/supplier';
import mockData from '@app/mock/mock-data.json';

const baseSuppliers = [...mockData.suppliers];

export const supplierHandlers = [
  http.get(`${API_BASE_URL}/suppliers`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const suppliers = getTenantBucket(tenantId, 'suppliers', () => baseSuppliers) as unknown[];
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 200);
    let results = suppliers as Array<{ name: string; email?: string }>;
    if (search)
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(search) || (s.email ?? '').toLowerCase().includes(search)
      );
    return HttpResponse.json({
      data: results.slice(page * size, (page + 1) * size),
      total: results.length,
      page,
      pageSize: size,
    });
  }),

  http.get(`${API_BASE_URL}/suppliers/:id/products`, async ({ request }) => {
    await delay(500);
    resolveTenant(request);
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE_URL}/suppliers/:id`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const suppliers = getTenantBucket(tenantId, 'suppliers', () => baseSuppliers);
    const item = suppliers.find((s) => String(s.id) === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/suppliers`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'manage:suppliers');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const suppliers = getTenantBucket(tenantId, 'suppliers', () => baseSuppliers);
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    const newSupplier = {
      id: suppliers.length + 1,
      name: (body['name'] as string | undefined) ?? 'New supplier',
      email: body['email'] as string | null | undefined,
      phone: body['phone'] as string | null | undefined,
      address: body['address'] as string | null | undefined,
      createdAt: now,
      updatedAt: now,
    };
    suppliers.push(newSupplier as (typeof baseSuppliers)[0]);
    return HttpResponse.json(newSupplier, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/suppliers/:id`, async ({ params, request }) => {
    await delay(500);
    const denied = requirePermission(request, 'manage:suppliers');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const suppliers = getTenantBucket(tenantId, 'suppliers', () => baseSuppliers);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = suppliers.findIndex((s) => String(s.id) === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = suppliers[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    suppliers[idx] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete(`${API_BASE_URL}/suppliers/:id`, async ({ request }) => {
    await delay(400);
    const denied = requirePermission(request, 'manage:suppliers');
    if (denied) return denied;
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE_URL}/suppliers/:id/orders`, async ({ params, request }) => {
    await delay(700);
    const denied = requirePermission(request, 'manage:suppliers');
    if (denied) return denied;
    resolveTenant(request);
    const now = new Date().toISOString();
    return HttpResponse.json<SupplierOrder>(
      {
        id: String(Date.now()),
        supplierId: params['id'] as string,
        status: 'pending',
        items: [],
        total: 0,
        currency: 'EUR',
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  }),
];
