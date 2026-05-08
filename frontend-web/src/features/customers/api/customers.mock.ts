import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant } from '@app/mock/mockUtils';
import type { Customer } from '@entities/customer';
import mockData from '@app/mock/mock-data.json';

const baseCustomers: Customer[] = [...mockData.customers] as Customer[];

export const customerHandlers = [
  http.get(`${API_BASE_URL}/customers`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const customers = getTenantBucket(tenantId, 'customers', () => baseCustomers);
    return HttpResponse.json(customers);
  }),

  http.get(`${API_BASE_URL}/customers/:id/sales`, async ({ request }) => {
    await delay(500);
    resolveTenant(request);
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE_URL}/customers/:id`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const customers = getTenantBucket(tenantId, 'customers', () => baseCustomers);
    const item = customers.find((c) => c.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/customers`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const customers = getTenantBucket(tenantId, 'customers', () => baseCustomers);
    const body = (await request.json()) as Partial<Customer>;
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name: body.name ?? 'Nueva empresa',
      email: body.email ?? 'contacto@empresa.es',
      phone: body.phone,
      address: body.address,
      createdAt: now,
      updatedAt: now,
    };
    customers.push(newCustomer);
    return HttpResponse.json<Customer>(newCustomer, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/customers/:id`, async ({ params, request }) => {
    await delay(500);
    const tenantId = resolveTenant(request);
    const customers = getTenantBucket(tenantId, 'customers', () => baseCustomers);
    const body = (await request.json()) as Partial<Customer>;
    const idx = customers.findIndex((c) => c.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = customers[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    customers[idx] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete(`${API_BASE_URL}/customers/:id`, async () => {
    await delay(400);
    return new HttpResponse(null, { status: 204 });
  }),
];
