import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Customer } from '@entities/customer';

const mockCustomers: Customer[] = [
    {
        id: 'cust-001-0000-0000-0000-000000000001',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1 555 0101',
        address: '123 Main St, New York, NY 10001',
        createdAt: '2025-01-15T10:00:00.000Z',
        updatedAt: '2025-03-01T12:00:00.000Z',
    },
    {
        id: 'cust-002-0000-0000-0000-000000000002',
        name: 'Bob Martinez',
        email: 'bob@example.com',
        phone: '+1 555 0202',
        address: '456 Broadway, Los Angeles, CA 90001',
        createdAt: '2025-02-10T10:00:00.000Z',
        updatedAt: '2025-02-20T08:00:00.000Z',
    },
    {
        id: 'cust-003-0000-0000-0000-000000000003',
        name: 'Carol White',
        email: 'carol@example.com',
        phone: '+1 555 0303',
        address: '789 Oak Ave, Chicago, IL 60601',
        createdAt: '2025-03-05T10:00:00.000Z',
        updatedAt: '2025-03-05T10:00:00.000Z',
    },
    {
        id: 'cust-004-0000-0000-0000-000000000004',
        name: 'David Chen',
        email: 'david.chen@example.com',
        phone: '+1 555 0404',
        address: '321 Pine St, San Francisco, CA 94101',
        createdAt: '2025-01-20T10:00:00.000Z',
        updatedAt: '2025-04-02T09:00:00.000Z',
    },
    {
        id: 'cust-005-0000-0000-0000-000000000005',
        name: 'Emma Wilson',
        email: 'emma.wilson@example.com',
        phone: '+1 555 0505',
        address: '654 Elm Rd, Seattle, WA 98101',
        createdAt: '2025-01-25T10:00:00.000Z',
        updatedAt: '2025-03-18T14:00:00.000Z',
    },
    {
        id: 'cust-006-0000-0000-0000-000000000006',
        name: 'Frank Rodriguez',
        email: 'frank.rodriguez@example.com',
        phone: '+1 555 0606',
        address: '987 Maple Dr, Miami, FL 33101',
        createdAt: '2025-02-03T10:00:00.000Z',
        updatedAt: '2025-02-25T11:00:00.000Z',
    },
    {
        id: 'cust-007-0000-0000-0000-000000000007',
        name: 'Grace Kim',
        email: 'grace.kim@example.com',
        phone: '+1 555 0707',
        address: '147 Cedar Blvd, Boston, MA 02101',
        createdAt: '2025-02-08T10:00:00.000Z',
        updatedAt: '2025-03-28T10:00:00.000Z',
    },
    {
        id: 'cust-008-0000-0000-0000-000000000008',
        name: 'Henry Thompson',
        email: 'henry.t@example.com',
        phone: '+1 555 0808',
        address: '258 Willow Ln, Austin, TX 78701',
        createdAt: '2025-01-30T10:00:00.000Z',
        updatedAt: '2025-03-10T13:00:00.000Z',
    },
    {
        id: 'cust-009-0000-0000-0000-000000000009',
        name: 'Isabella Santos',
        email: 'isabella.s@example.com',
        phone: '+1 555 0909',
        address: '369 Birch Ave, Denver, CO 80201',
        createdAt: '2025-02-14T10:00:00.000Z',
        updatedAt: '2025-04-01T08:00:00.000Z',
    },
    {
        id: 'cust-010-0000-0000-0000-000000000010',
        name: "James O'Brien",
        email: 'james.obrien@example.com',
        phone: '+1 555 1010',
        address: '741 Spruce St, Portland, OR 97201',
        createdAt: '2025-03-01T10:00:00.000Z',
        updatedAt: '2025-03-22T15:00:00.000Z',
    },
    {
        id: 'cust-011-0000-0000-0000-000000000011',
        name: 'Katherine Lee',
        email: 'kat.lee@example.com',
        phone: '+1 555 1111',
        address: '852 Aspen Way, Nashville, TN 37201',
        createdAt: '2025-01-18T10:00:00.000Z',
        updatedAt: '2025-02-28T10:00:00.000Z',
    },
    {
        id: 'cust-012-0000-0000-0000-000000000012',
        name: 'Liam Anderson',
        email: 'liam.anderson@example.com',
        phone: '+1 555 1212',
        address: '963 Walnut Ct, Phoenix, AZ 85001',
        createdAt: '2025-02-22T10:00:00.000Z',
        updatedAt: '2025-04-05T09:00:00.000Z',
    },
    {
        id: 'cust-013-0000-0000-0000-000000000013',
        name: 'Maya Patel',
        email: 'maya.patel@example.com',
        phone: '+1 555 1313',
        address: '174 Chestnut Pl, Houston, TX 77001',
        createdAt: '2025-03-10T10:00:00.000Z',
        updatedAt: '2025-03-30T11:00:00.000Z',
    },
    {
        id: 'cust-014-0000-0000-0000-000000000014',
        name: 'Noah Williams',
        email: 'noah.w@example.com',
        phone: '+1 555 1414',
        address: '285 Poplar Dr, Charlotte, NC 28201',
        createdAt: '2025-01-28T10:00:00.000Z',
        updatedAt: '2025-03-15T14:00:00.000Z',
    },
    {
        id: 'cust-015-0000-0000-0000-000000000015',
        name: 'Olivia Brown',
        email: 'olivia.b@example.com',
        phone: '+1 555 1515',
        address: '396 Hickory Rd, Indianapolis, IN 46201',
        createdAt: '2025-02-18T10:00:00.000Z',
        updatedAt: '2025-04-03T10:00:00.000Z',
    },
    {
        id: 'cust-016-0000-0000-0000-000000000016',
        name: 'Patrick Davis',
        email: 'patrick.d@example.com',
        phone: '+1 555 1616',
        address: '507 Magnolia Blvd, Atlanta, GA 30301',
        createdAt: '2025-03-20T10:00:00.000Z',
        updatedAt: '2025-04-10T12:00:00.000Z',
    },
    {
        id: 'cust-017-0000-0000-0000-000000000017',
        name: 'Quinn Foster',
        email: 'quinn.f@example.com',
        phone: '+1 555 1717',
        address: '618 Sycamore St, Las Vegas, NV 89101',
        createdAt: '2025-02-28T10:00:00.000Z',
        updatedAt: '2025-03-25T09:00:00.000Z',
    },
    {
        id: 'cust-018-0000-0000-0000-000000000018',
        name: 'Rachel Turner',
        email: 'rachel.t@example.com',
        phone: '+1 555 1818',
        address: '729 Cottonwood Ave, Minneapolis, MN 55401',
        createdAt: '2025-04-02T10:00:00.000Z',
        updatedAt: '2025-04-12T08:00:00.000Z',
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
        const newCustomer: Customer = {
            id: crypto.randomUUID(),
            name: body.name ?? 'New Customer',
            email: body.email ?? 'new@example.com',
            phone: body.phone,
            address: body.address,
            createdAt: now,
            updatedAt: now,
        };
        mockCustomers.push(newCustomer);
        return HttpResponse.json<Customer>(newCustomer, { status: 201 });
    }),

    http.put(`${API_BASE_URL}/customers/:id`, async ({ params, request }) => {
        await delay(500);
        const body = await request.json() as Partial<Customer>;
        const idx = mockCustomers.findIndex((c) => c.id === params['id']);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const existing = mockCustomers[idx];
        if (existing === undefined) return new HttpResponse(null, { status: 404 });
        const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
        mockCustomers[idx] = updated;
        return HttpResponse.json(updated);
    }),

    http.delete(`${API_BASE_URL}/customers/:id`, async () => {
        await delay(400);
        return new HttpResponse(null, { status: 204 });
    }),
];
