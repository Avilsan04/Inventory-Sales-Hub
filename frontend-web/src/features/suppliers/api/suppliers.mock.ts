import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type { Supplier, SupplierOrder } from '@entities/supplier';
import mockData from '@app/mock/mock-data.json';

const baseSuppliers: Supplier[] = [...mockData.suppliers] as Supplier[];

export const supplierHandlers = [
  http.get(`${API_BASE_URL}/suppliers`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const suppliers = getTenantBucket(tenantId, 'suppliers', () => baseSuppliers);
    return HttpResponse.json(suppliers);
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
    const item = suppliers.find((s) => s.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/suppliers`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'manage:suppliers');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const suppliers = getTenantBucket(tenantId, 'suppliers', () => baseSuppliers);
    const body = (await request.json()) as Partial<Supplier>;
    const now = new Date().toISOString();
    const newSupplier: Supplier = {
      id: crypto.randomUUID(),
      name: body.name ?? 'Nuevo proveedor',
      email: body.email,
      phone: body.phone,
      address: body.address,
      contactPerson: body.contactPerson,
      createdAt: now,
      updatedAt: now,
    };
    suppliers.push(newSupplier);
    return HttpResponse.json<Supplier>(newSupplier, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/suppliers/:id`, async ({ params, request }) => {
    await delay(500);
    const denied = requirePermission(request, 'manage:suppliers');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const suppliers = getTenantBucket(tenantId, 'suppliers', () => baseSuppliers);
    const body = (await request.json()) as Partial<Supplier>;
    const idx = suppliers.findIndex((s) => s.id === params['id']);
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
        id: crypto.randomUUID(),
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
