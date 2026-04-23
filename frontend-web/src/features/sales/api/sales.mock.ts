import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Sale, SaleItem, SaleSummary, SaleStatus } from '@entities/sale';

const mockSales: Sale[] = [
  {
    id: 'sale-001-0000-0000-0000-000000000001',
    customerId: 'cust-001-0000-0000-0000-000000000001',
    status: 'completed',
    total: 3499.99,
    currency: 'USD',
    items: [],
    createdAt: '2025-03-10T14:00:00.000Z',
    updatedAt: '2025-03-10T14:30:00.000Z',
  },
  {
    id: 'sale-002-0000-0000-0000-000000000002',
    status: 'pending',
    total: 298.99,
    currency: 'USD',
    items: [],
    createdAt: '2025-04-01T09:00:00.000Z',
    updatedAt: '2025-04-01T09:00:00.000Z',
  },
];

const mockSummary: SaleSummary = {
  totalSales: 2,
  totalRevenue: 3798.98,
  currency: 'USD',
  byStatus: [
    { status: 'completed', count: 1, revenue: 3499.99 },
    { status: 'pending', count: 1, revenue: 298.99 },
    { status: 'cancelled', count: 0, revenue: 0 },
  ],
};

export const salesHandlers = [
  http.get(`${API_BASE_URL}/sales/summary`, async () => {
    await delay(500);
    return HttpResponse.json(mockSummary);
  }),

  http.get(`${API_BASE_URL}/sales`, async () => {
    await delay(600);
    return HttpResponse.json(mockSales);
  }),

  http.get(`${API_BASE_URL}/sales/:id/items`, async ({ params }) => {
    await delay(400);
    const items: SaleItem[] = [
      {
        id: 'item-001-0000-0000-0000-000000000001',
        saleId: params['id'] as string,
        productId: 'prod-001-0000-0000-0000-000000000001',
        productName: 'MacBook Pro 16" M3',
        quantity: 1,
        unitPrice: 3499.99,
        subtotal: 3499.99,
      },
    ];
    return HttpResponse.json(items);
  }),

  http.get(`${API_BASE_URL}/sales/:id`, async ({ params }) => {
    await delay(400);
    const item = mockSales.find((s) => s.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/sales`, async ({ request }) => {
    await delay(700);
    const body = await request.json() as Partial<Sale>;
    const now = new Date().toISOString();
    return HttpResponse.json<Sale>(
      {
        id: crypto.randomUUID(),
        customerId: body.customerId,
        status: 'pending',
        total: body.total ?? 0,
        currency: body.currency ?? 'USD',
        items: [],
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  }),

  http.patch(`${API_BASE_URL}/sales/:id/status`, async ({ params, request }) => {
    await delay(400);
    const body = await request.json() as { status: SaleStatus };
    const existing = mockSales.find((s) => s.id === params['id']);
    if (!existing) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...existing, status: body.status, updatedAt: new Date().toISOString() });
  }),
];
