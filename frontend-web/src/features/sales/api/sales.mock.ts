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
        createdAt: '2025-01-12T14:00:00.000Z',
        updatedAt: '2025-01-12T14:45:00.000Z',
    },
    {
        id: 'sale-002-0000-0000-0000-000000000002',
        customerId: 'cust-002-0000-0000-0000-000000000002',
        status: 'completed',
        total: 298.99,
        currency: 'USD',
        items: [],
        createdAt: '2025-01-18T09:00:00.000Z',
        updatedAt: '2025-01-18T09:30:00.000Z',
    },
    {
        id: 'sale-003-0000-0000-0000-000000000003',
        customerId: 'cust-003-0000-0000-0000-000000000003',
        status: 'completed',
        total: 1299.95,
        currency: 'USD',
        items: [],
        createdAt: '2025-01-25T11:00:00.000Z',
        updatedAt: '2025-01-25T11:20:00.000Z',
    },
    {
        id: 'sale-004-0000-0000-0000-000000000004',
        customerId: 'cust-004-0000-0000-0000-000000000004',
        status: 'pending',
        total: 599.99,
        currency: 'USD',
        items: [],
        createdAt: '2025-02-03T10:30:00.000Z',
        updatedAt: '2025-02-03T10:30:00.000Z',
    },
    {
        id: 'sale-005-0000-0000-0000-000000000005',
        customerId: 'cust-005-0000-0000-0000-000000000005',
        status: 'completed',
        total: 2299.99,
        currency: 'USD',
        items: [],
        createdAt: '2025-02-08T13:00:00.000Z',
        updatedAt: '2025-02-08T13:50:00.000Z',
    },
    {
        id: 'sale-006-0000-0000-0000-000000000006',
        customerId: 'cust-001-0000-0000-0000-000000000001',
        status: 'completed',
        total: 449.00,
        currency: 'USD',
        items: [],
        createdAt: '2025-02-14T15:00:00.000Z',
        updatedAt: '2025-02-14T15:30:00.000Z',
    },
    {
        id: 'sale-007-0000-0000-0000-000000000007',
        customerId: 'cust-006-0000-0000-0000-000000000006',
        status: 'cancelled',
        total: 79.99,
        currency: 'USD',
        items: [],
        createdAt: '2025-02-19T09:00:00.000Z',
        updatedAt: '2025-02-20T11:00:00.000Z',
    },
    {
        id: 'sale-008-0000-0000-0000-000000000008',
        customerId: 'cust-007-0000-0000-0000-000000000007',
        status: 'completed',
        total: 549.98,
        currency: 'USD',
        items: [],
        createdAt: '2025-02-22T10:00:00.000Z',
        updatedAt: '2025-02-22T10:45:00.000Z',
    },
    {
        id: 'sale-009-0000-0000-0000-000000000009',
        customerId: 'cust-002-0000-0000-0000-000000000002',
        status: 'completed',
        total: 3499.99,
        currency: 'USD',
        items: [],
        createdAt: '2025-03-01T14:00:00.000Z',
        updatedAt: '2025-03-01T14:30:00.000Z',
    },
    {
        id: 'sale-010-0000-0000-0000-000000000010',
        customerId: 'cust-008-0000-0000-0000-000000000008',
        status: 'pending',
        total: 229.99,
        currency: 'USD',
        items: [],
        createdAt: '2025-03-05T11:00:00.000Z',
        updatedAt: '2025-03-05T11:00:00.000Z',
    },
    {
        id: 'sale-011-0000-0000-0000-000000000011',
        customerId: 'cust-004-0000-0000-0000-000000000004',
        status: 'completed',
        total: 1799.99,
        currency: 'USD',
        items: [],
        createdAt: '2025-03-10T09:30:00.000Z',
        updatedAt: '2025-03-10T10:00:00.000Z',
    },
    {
        id: 'sale-012-0000-0000-0000-000000000012',
        customerId: 'cust-009-0000-0000-0000-000000000009',
        status: 'completed',
        total: 399.99,
        currency: 'USD',
        items: [],
        createdAt: '2025-03-15T16:00:00.000Z',
        updatedAt: '2025-03-15T16:25:00.000Z',
    },
    {
        id: 'sale-013-0000-0000-0000-000000000013',
        customerId: 'cust-003-0000-0000-0000-000000000003',
        status: 'pending',
        total: 349.99,
        currency: 'USD',
        items: [],
        createdAt: '2025-03-20T10:00:00.000Z',
        updatedAt: '2025-03-20T10:00:00.000Z',
    },
    {
        id: 'sale-014-0000-0000-0000-000000000014',
        customerId: 'cust-005-0000-0000-0000-000000000005',
        status: 'completed',
        total: 258.98,
        currency: 'USD',
        items: [],
        createdAt: '2025-03-25T13:00:00.000Z',
        updatedAt: '2025-03-25T13:30:00.000Z',
    },
    {
        id: 'sale-015-0000-0000-0000-000000000015',
        customerId: 'cust-010-0000-0000-0000-000000000010',
        status: 'completed',
        total: 199.00,
        currency: 'USD',
        items: [],
        createdAt: '2025-03-28T15:00:00.000Z',
        updatedAt: '2025-03-28T15:20:00.000Z',
    },
    {
        id: 'sale-016-0000-0000-0000-000000000016',
        customerId: 'cust-001-0000-0000-0000-000000000001',
        status: 'completed',
        total: 5099.98,
        currency: 'USD',
        items: [],
        createdAt: '2025-04-01T09:00:00.000Z',
        updatedAt: '2025-04-01T09:45:00.000Z',
    },
    {
        id: 'sale-017-0000-0000-0000-000000000017',
        customerId: 'cust-011-0000-0000-0000-000000000011',
        status: 'cancelled',
        total: 129.00,
        currency: 'USD',
        items: [],
        createdAt: '2025-04-03T11:00:00.000Z',
        updatedAt: '2025-04-04T09:00:00.000Z',
    },
    {
        id: 'sale-018-0000-0000-0000-000000000018',
        customerId: 'cust-006-0000-0000-0000-000000000006',
        status: 'pending',
        total: 469.98,
        currency: 'USD',
        items: [],
        createdAt: '2025-04-08T14:00:00.000Z',
        updatedAt: '2025-04-08T14:00:00.000Z',
    },
    {
        id: 'sale-019-0000-0000-0000-000000000019',
        customerId: 'cust-002-0000-0000-0000-000000000002',
        status: 'completed',
        total: 1299.00,
        currency: 'USD',
        items: [],
        createdAt: '2025-04-10T10:30:00.000Z',
        updatedAt: '2025-04-10T11:00:00.000Z',
    },
    {
        id: 'sale-020-0000-0000-0000-000000000020',
        customerId: 'cust-012-0000-0000-0000-000000000012',
        status: 'pending',
        total: 819.98,
        currency: 'USD',
        items: [],
        createdAt: '2025-04-14T16:00:00.000Z',
        updatedAt: '2025-04-14T16:00:00.000Z',
    },
];

const mockSummary: SaleSummary = {
    totalSales: 20,
    totalRevenue: 28784.73,
    currency: 'USD',
    byStatus: [
        { status: 'completed', count: 13, revenue: 22556.83 },
        { status: 'pending', count: 5, revenue: 2919.94 },
        { status: 'cancelled', count: 2, revenue: 209.99 },
    ],
};

const saleItemsMap: Record<string, SaleItem[]> = {
    'sale-001-0000-0000-0000-000000000001': [
        { id: 'si-001', saleId: 'sale-001-0000-0000-0000-000000000001', productId: 'prod-001-0000-0000-0000-000000000001', productName: 'MacBook Pro 16" M3 Max', quantity: 1, unitPrice: 3499.99, subtotal: 3499.99 },
    ],
    'sale-002-0000-0000-0000-000000000002': [
        { id: 'si-002', saleId: 'sale-002-0000-0000-0000-000000000002', productId: 'prod-002-0000-0000-0000-000000000002', productName: 'Keychron Q1 Pro', quantity: 1, unitPrice: 199.00, subtotal: 199.00 },
        { id: 'si-003', saleId: 'sale-002-0000-0000-0000-000000000002', productId: 'prod-003-0000-0000-0000-000000000003', productName: 'Logitech MX Master 3S', quantity: 1, unitPrice: 99.99, subtotal: 99.99 },
    ],
    'sale-005-0000-0000-0000-000000000005': [
        { id: 'si-005', saleId: 'sale-005-0000-0000-0000-000000000005', productId: 'prod-004-0000-0000-0000-000000000004', productName: 'Dell XPS 15 9530', quantity: 1, unitPrice: 2299.99, subtotal: 2299.99 },
    ],
    'sale-009-0000-0000-0000-000000000009': [
        { id: 'si-009', saleId: 'sale-009-0000-0000-0000-000000000009', productId: 'prod-001-0000-0000-0000-000000000001', productName: 'MacBook Pro 16" M3 Max', quantity: 1, unitPrice: 3499.99, subtotal: 3499.99 },
    ],
    'sale-016-0000-0000-0000-000000000016': [
        { id: 'si-016a', saleId: 'sale-016-0000-0000-0000-000000000016', productId: 'prod-001-0000-0000-0000-000000000001', productName: 'MacBook Pro 16" M3 Max', quantity: 1, unitPrice: 3499.99, subtotal: 3499.99 },
        { id: 'si-016b', saleId: 'sale-016-0000-0000-0000-000000000016', productId: 'prod-008-0000-0000-0000-000000000008', productName: 'LG UltraFine 5K 27MD5KL', quantity: 1, unitPrice: 1299.99, subtotal: 1299.99 },
        { id: 'si-016c', saleId: 'sale-016-0000-0000-0000-000000000016', productId: 'prod-002-0000-0000-0000-000000000002', productName: 'Keychron Q1 Pro', quantity: 1, unitPrice: 199.00, subtotal: 199.00 },
        { id: 'si-016d', saleId: 'sale-016-0000-0000-0000-000000000016', productId: 'prod-015-0000-0000-0000-000000000015', productName: 'Apple Magic Trackpad', quantity: 1, unitPrice: 100.00, subtotal: 100.00 },
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
        const saleId = params['id'] as string;
        const items = saleItemsMap[saleId] ?? [
            {
                id: `si-${saleId}-default`,
                saleId,
                productId: 'prod-001-0000-0000-0000-000000000001',
                productName: 'MacBook Pro 16" M3 Max',
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
        const newSale: Sale = {
            id: crypto.randomUUID(),
            customerId: body.customerId,
            status: 'pending',
            total: body.total ?? 0,
            currency: body.currency ?? 'USD',
            items: [],
            createdAt: now,
            updatedAt: now,
        };
        mockSales.push(newSale);
        return HttpResponse.json<Sale>(newSale, { status: 201 });
    }),

    http.patch(`${API_BASE_URL}/sales/:id/status`, async ({ params, request }) => {
        await delay(400);
        const body = await request.json() as { status: SaleStatus };
        const idx = mockSales.findIndex((s) => s.id === params['id']);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const existing = mockSales[idx];
        if (existing === undefined) return new HttpResponse(null, { status: 404 });
        const updated = { ...existing, status: body.status, updatedAt: new Date().toISOString() };
        mockSales[idx] = updated;
        return HttpResponse.json(updated);
    }),
];
