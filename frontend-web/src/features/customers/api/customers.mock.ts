import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Customer } from '@entities/customer';

const mockCustomers: Customer[] = [
  {
    id: 'cust-001-0000-0000-0000-000000000001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555 0101',
    address: '123 Main St, New York, NY',
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-03-01T12:00:00.000Z',
  },
  {
    id: 'cust-002-0000-0000-0000-000000000002',
    name: 'Bob Martinez',
    email: 'bob@example.com',
    phone: '+1 555 0202',
    createdAt: '2025-02-10T10:00:00.000Z',
    updatedAt: '2025-02-20T08:00:00.000Z',
  },
  {
    id: 'cust-003-0000-0000-0000-000000000003',
    name: 'Carol White',
    email: 'carol@example.com',
    address: '456 Oak Ave, Chicago, IL',
    createdAt: '2025-03-05T10:00:00.000Z',
    updatedAt: '2025-03-05T10:00:00.000Z',
  },
];

export const customerHandlers = [
  http.get(`${API_BASE_URL}/customers`, async () => {
    await delay(600);
    return HttpResponse.json(mockCustomers);
  }),

  http.get(`${API_BASE_URL}/customers/:id/sales`, async () => {
    await delay(500);
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE_URL}/customers/:id`, async ({ params }) => {
    await delay(400);
    const item = mockCustomers.find((c) => c.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/customers`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as Partial<Customer>;
    const now = new Date().toISOString();
    return HttpResponse.json<Customer>(
      {
        id: crypto.randomUUID(),
        name: body.name ?? 'New Customer',
        email: body.email ?? 'new@example.com',
        phone: body.phone,
        address: body.address,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  }),

  http.put(`${API_BASE_URL}/customers/:id`, async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as Partial<Customer>;
    const existing = mockCustomers.find((c) => c.id === params['id']);
    if (!existing) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_BASE_URL}/customers/:id`, async () => {
    await delay(400);
    return new HttpResponse(null, { status: 204 });
  }),
];
