import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Supplier, SupplierOrder } from '@entities/supplier';

const mockSuppliers: Supplier[] = [
    {
        id: 'supp-001-0000-0000-0000-000000000001',
        name: 'TechGlobal Distributors',
        email: 'orders@techglobal.com',
        phone: '+1 800 555 0100',
        address: '1 Commerce Park, San Jose, CA 95101',
        contactPerson: 'Michael Scott',
        createdAt: '2024-05-01T10:00:00.000Z',
        updatedAt: '2025-01-10T08:00:00.000Z',
    },
    {
        id: 'supp-002-0000-0000-0000-000000000002',
        name: 'PeripheralsPro Inc.',
        email: 'supply@peripheralspro.com',
        phone: '+1 800 555 0200',
        address: '250 Industrial Blvd, Austin, TX 78701',
        contactPerson: 'Jan Levinson',
        createdAt: '2024-08-01T10:00:00.000Z',
        updatedAt: '2025-02-05T09:00:00.000Z',
    },
    {
        id: 'supp-003-0000-0000-0000-000000000003',
        name: 'Apple Distribution EMEA',
        email: 'b2b@apple-dist.com',
        phone: '+1 408 555 0300',
        address: '1 Apple Park Way, Cupertino, CA 95014',
        contactPerson: 'Sarah Connor',
        createdAt: '2024-04-15T10:00:00.000Z',
        updatedAt: '2025-03-01T10:00:00.000Z',
    },
    {
        id: 'supp-004-0000-0000-0000-000000000004',
        name: 'Dell Technologies Direct',
        email: 'enterprise@dell.com',
        phone: '+1 512 555 0400',
        address: '1 Dell Way, Round Rock, TX 78682',
        contactPerson: 'John Connor',
        createdAt: '2024-06-10T10:00:00.000Z',
        updatedAt: '2025-01-25T11:00:00.000Z',
    },
    {
        id: 'supp-005-0000-0000-0000-000000000005',
        name: 'Logitech Business',
        email: 'business@logitech.com',
        phone: '+41 21 555 0500',
        address: '7700 Gateway Blvd, Newark, CA 94560',
        contactPerson: 'Hans Gruber',
        createdAt: '2024-07-20T10:00:00.000Z',
        updatedAt: '2025-02-18T14:00:00.000Z',
    },
    {
        id: 'supp-006-0000-0000-0000-000000000006',
        name: 'Sony Professional Solutions',
        email: 'pro@sony.com',
        phone: '+1 201 555 0600',
        address: '25 Madison Ave, New York, NY 10010',
        contactPerson: 'Akira Tanaka',
        createdAt: '2024-09-05T10:00:00.000Z',
        updatedAt: '2025-03-10T09:00:00.000Z',
    },
    {
        id: 'supp-007-0000-0000-0000-000000000007',
        name: 'Samsung B2B Solutions',
        email: 'b2b@samsung.com',
        phone: '+82 2 555 0700',
        address: '105 Challenger Rd, Ridgefield Park, NJ 07660',
        contactPerson: 'Ji-Ho Park',
        createdAt: '2024-08-20T10:00:00.000Z',
        updatedAt: '2025-01-30T12:00:00.000Z',
    },
    {
        id: 'supp-008-0000-0000-0000-000000000008',
        name: 'Corsair Gaming',
        email: 'wholesale@corsair.com',
        phone: '+1 510 555 0800',
        address: '47100 Bayside Pkwy, Fremont, CA 94538',
        contactPerson: 'Ryan Marshall',
        createdAt: '2024-10-01T10:00:00.000Z',
        updatedAt: '2025-02-12T10:00:00.000Z',
    },
    {
        id: 'supp-009-0000-0000-0000-000000000009',
        name: 'Kingston Technology',
        email: 'orders@kingston.com',
        phone: '+1 714 555 0900',
        address: '17600 Newhope St, Fountain Valley, CA 92708',
        contactPerson: 'Lisa Chang',
        createdAt: '2024-11-15T10:00:00.000Z',
        updatedAt: '2025-03-22T11:00:00.000Z',
    },
    {
        id: 'supp-010-0000-0000-0000-000000000010',
        name: 'Anker Innovations',
        email: 'business@anker.com',
        phone: '+1 800 555 1000',
        address: '3720 Vero Rd, Baltimore, MD 21227',
        contactPerson: 'Wei Zhang',
        createdAt: '2024-12-01T10:00:00.000Z',
        updatedAt: '2025-04-05T09:00:00.000Z',
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
        const newSupplier: Supplier = {
            id: crypto.randomUUID(),
            name: body.name ?? 'New Supplier',
            email: body.email,
            phone: body.phone,
            address: body.address,
            contactPerson: body.contactPerson,
            createdAt: now,
            updatedAt: now,
        };
        mockSuppliers.push(newSupplier);
        return HttpResponse.json<Supplier>(newSupplier, { status: 201 });
    }),

    http.put(`${API_BASE_URL}/suppliers/:id`, async ({ params, request }) => {
        await delay(500);
        const body = await request.json() as Partial<Supplier>;
        const idx = mockSuppliers.findIndex((s) => s.id === params['id']);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const existing = mockSuppliers[idx];
        if (existing === undefined) return new HttpResponse(null, { status: 404 });
        const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
        mockSuppliers[idx] = updated;
        return HttpResponse.json(updated);
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
