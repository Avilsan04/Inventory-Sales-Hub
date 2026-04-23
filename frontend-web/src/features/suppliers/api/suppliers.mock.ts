import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Supplier, SupplierOrder } from '@entities/supplier';

const mockSuppliers: Supplier[] = [
  {
    id: 'supp-001-0000-0000-0000-000000000001',
    name: 'TechGlobal Distributors',
    email: 'orders@techglobal.com',
    phone: '+1 800 555 0100',
    address: '1 Commerce Park, San Jose, CA',
    contactPerson: 'Michael Scott',
    createdAt: '2024-05-01T10:00:00.000Z',
    updatedAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'supp-002-0000-0000-0000-000000000002',
    name: 'PeripheralsPro Inc.',
    email: 'supply@peripheralspro.com',
    phone: '+1 800 555 0200',
    contactPerson: 'Jan Levinson',
    createdAt: '2024-08-01T10:00:00.000Z',
    updatedAt: '2024-08-01T10:00:00.000Z',
  },
];

export const supplierHandlers = [
  http.get(`${API_BASE_URL}/suppliers`, async () => {
    await delay(600);
    return HttpResponse.json(mockSuppliers);
  }),

  http.get(`${API_BASE_URL}/suppliers/:id/products`, async () => {
    await delay(500);
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE_URL}/suppliers/:id`, async ({ params }) => {
    await delay(400);
    const item = mockSuppliers.find((s) => s.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/suppliers`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as Partial<Supplier>;
    const now = new Date().toISOString();
    return HttpResponse.json<Supplier>(
      {
        id: crypto.randomUUID(),
        name: body.name ?? 'New Supplier',
        email: body.email,
        phone: body.phone,
        address: body.address,
        contactPerson: body.contactPerson,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  }),

  http.put(`${API_BASE_URL}/suppliers/:id`, async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as Partial<Supplier>;
    const existing = mockSuppliers.find((s) => s.id === params['id']);
    if (!existing) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_BASE_URL}/suppliers/:id`, async () => {
    await delay(400);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE_URL}/suppliers/:id/orders`, async ({ params }) => {
    await delay(700);
    const now = new Date().toISOString();
    return HttpResponse.json<SupplierOrder>(
      {
        id: crypto.randomUUID(),
        supplierId: params['id'] as string,
        status: 'pending',
        items: [],
        total: 0,
        currency: 'USD',
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  }),
];
