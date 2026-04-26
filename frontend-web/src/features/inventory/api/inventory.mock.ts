import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { InventoryItem, InventoryMovement } from '@entities/inventory';
import mockData from '@app/mock/mock-data.json';

const mockInventory: InventoryItem[] = [...mockData.inventory] as InventoryItem[];
const mockMovements: InventoryMovement[] = [...mockData.inventoryMovements] as InventoryMovement[];

export const inventoryHandlers = [
    http.get(`${API_BASE_URL}/inventory`, async () => {
        await delay(800);
        return HttpResponse.json(mockInventory);
    }),

    http.get(`${API_BASE_URL}/inventory/low-stock`, async () => {
        await delay(600);
        return HttpResponse.json(mockInventory.filter((i) => i.status !== 'IN_STOCK'));
    }),

    http.get(`${API_BASE_URL}/inventory/movements`, async () => {
        await delay(600);
        return HttpResponse.json(mockMovements);
    }),

    http.get(`${API_BASE_URL}/inventory/:id`, async ({ params }) => {
        await delay(400);
        const item = mockInventory.find((i) => i.id === params['id']);
        if (!item) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(item);
    }),

    http.post(`${API_BASE_URL}/inventory`, async ({ request }) => {
        await delay(600);
        const body = await request.json() as Partial<InventoryItem>;
        const newItem: InventoryItem = {
            id: crypto.randomUUID(),
            sku: body.sku ?? 'SKU-NEW',
            name: body.name ?? 'New item',
            description: body.description,
            quantity: body.quantity ?? 0,
            price: body.price ?? 0,
            currency: body.currency ?? 'EUR',
            status: body.status ?? 'IN_STOCK',
            category: body.category,
            reorderThreshold: body.reorderThreshold,
            lastUpdated: new Date().toISOString(),
        };
        mockInventory.push(newItem);
        return HttpResponse.json(newItem, { status: 201 });
    }),

    http.put(`${API_BASE_URL}/inventory/:id`, async ({ params, request }) => {
        await delay(500);
        const body = await request.json() as Partial<InventoryItem>;
        const idx = mockInventory.findIndex((i) => i.id === params['id']);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const existing = mockInventory[idx];
        if (existing === undefined) return new HttpResponse(null, { status: 404 });
        const updated = { ...existing, ...body, lastUpdated: new Date().toISOString() };
        mockInventory[idx] = updated;
        return HttpResponse.json(updated);
    }),

    http.patch(`${API_BASE_URL}/inventory/:id/stock`, async ({ params, request }) => {
        await delay(400);
        const body = await request.json() as { quantity: number };
        const existing = mockInventory.find((i) => i.id === params['id']);
        if (!existing) return new HttpResponse(null, { status: 404 });
        const newQty = existing.quantity + body.quantity;
        const threshold = existing.reorderThreshold ?? 5;
        return HttpResponse.json({
            ...existing,
            quantity: newQty,
            status: newQty === 0 ? 'OUT_OF_STOCK' : newQty <= threshold ? 'LOW_STOCK' : 'IN_STOCK',
            lastUpdated: new Date().toISOString(),
        });
    }),

    http.delete(`${API_BASE_URL}/inventory/:id`, async () => {
        await delay(400);
        return new HttpResponse(null, { status: 204 });
    }),
];
