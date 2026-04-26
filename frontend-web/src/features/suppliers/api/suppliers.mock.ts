import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Supplier, SupplierOrder } from '@entities/supplier';
import mockData from '@app/mock/mock-data.json';

const mockSuppliers: Supplier[] = [...mockData.suppliers] as Supplier[];

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
            name: body.name ?? 'Nuevo proveedor',
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
                currency: 'EUR',
                createdAt: now,
                updatedAt: now,
            },
            { status: 201 }
        );
    }),
];
