import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { InventoryItem } from '@entities/inventory';

// Generate strict, valid UUIDs for the mock data
const mockInventory: InventoryItem[] = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
        sku: 'LAP-PRO-16',
        name: 'MacBook Pro 16" M3 Max',
        description: 'Apple Silicon laptop for professionals',
        quantity: 42,
        price: 3499.99,
        currency: 'USD',
        status: 'IN_STOCK',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Valid UUID
        sku: 'KEY-MECH-01',
        name: 'Keychron Q1 Pro',
        description: 'Wireless custom mechanical keyboard',
        quantity: 2,
        price: 199.00,
        currency: 'USD',
        status: 'LOW_STOCK',
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
        sku: 'MOU-MX-M3',
        name: 'Logitech MX Master 3S',
        quantity: 0,
        price: 99.99,
        currency: 'USD',
        status: 'OUT_OF_STOCK',
        lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    }
];

export const inventoryHandlers = [
    http.get(`${API_BASE_URL}/inventory`, async () => {
        await delay(800);
        return HttpResponse.json(mockInventory);
    }),
];