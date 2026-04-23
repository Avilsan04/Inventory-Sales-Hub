import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { InventoryItem, InventoryMovement } from '@entities/inventory';

// Generate strict, valid UUIDs for the mock data
const mockInventory: InventoryItem[] = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        sku: 'LAP-PRO-16',
        name: 'MacBook Pro 16" M3 Max',
        description: 'Apple Silicon laptop for professionals',
        quantity: 42,
        price: 3499.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Laptops',
        reorderThreshold: 10,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        sku: 'KEY-MECH-01',
        name: 'Keychron Q1 Pro',
        description: 'Wireless custom mechanical keyboard',
        quantity: 2,
        price: 199.00,
        currency: 'USD',
        status: 'LOW_STOCK',
        category: 'Peripherals',
        reorderThreshold: 5,
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174000',
        sku: 'MOU-MX-M3',
        name: 'Logitech MX Master 3S',
        quantity: 0,
        price: 99.99,
        currency: 'USD',
        status: 'OUT_OF_STOCK',
        category: 'Peripherals',
        reorderThreshold: 8,
        lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    }
];

const mockMovements: InventoryMovement[] = [
    {
        id: 'mov-0001-0000-0000-0000-000000000001',
        inventoryItemId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'in',
        quantity: 10,
        previousQuantity: 32,
        newQuantity: 42,
        note: 'Restock from supplier',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'mov-0002-0000-0000-0000-000000000002',
        inventoryItemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        type: 'out',
        quantity: 3,
        previousQuantity: 5,
        newQuantity: 2,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
];

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
            sku: body.sku ?? 'NEW-SKU',
            name: body.name ?? 'New Item',
            description: body.description,
            quantity: body.quantity ?? 0,
            price: body.price ?? 0,
            currency: body.currency ?? 'USD',
            status: body.status ?? 'IN_STOCK',
            lastUpdated: new Date().toISOString(),
        };
        return HttpResponse.json(newItem, { status: 201 });
    }),

    http.put(`${API_BASE_URL}/inventory/:id`, async ({ params, request }) => {
        await delay(500);
        const body = await request.json() as Partial<InventoryItem>;
        const existing = mockInventory.find((i) => i.id === params['id']);
        if (!existing) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json({ ...existing, ...body, lastUpdated: new Date().toISOString() });
    }),

    http.patch(`${API_BASE_URL}/inventory/:id/stock`, async ({ params, request }) => {
        await delay(400);
        const body = await request.json() as { quantity: number };
        const existing = mockInventory.find((i) => i.id === params['id']);
        if (!existing) return new HttpResponse(null, { status: 404 });
        const newQty = existing.quantity + body.quantity;
        return HttpResponse.json({
            ...existing,
            quantity: newQty,
            status: newQty === 0 ? 'OUT_OF_STOCK' : newQty <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
            lastUpdated: new Date().toISOString(),
        });
    }),

    http.delete(`${API_BASE_URL}/inventory/:id`, async () => {
        await delay(400);
        return new HttpResponse(null, { status: 204 });
    }),
];