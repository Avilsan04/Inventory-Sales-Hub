import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { InventoryItem, InventoryMovement } from '@entities/inventory';

const mockInventory: InventoryItem[] = [
    {
        id: 'inv-001-0000-0000-0000-000000000001',
        sku: 'LAP-MBP-16',
        name: 'MacBook Pro 16" M3 Max',
        description: 'Apple Silicon laptop for professionals',
        quantity: 42,
        price: 3499.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Laptops',
        reorderThreshold: 10,
        lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'inv-002-0000-0000-0000-000000000002',
        sku: 'KEY-MECH-Q1',
        name: 'Keychron Q1 Pro',
        description: 'Wireless custom mechanical keyboard with aluminum frame',
        quantity: 2,
        price: 199.00,
        currency: 'USD',
        status: 'LOW_STOCK',
        category: 'Peripherals',
        reorderThreshold: 5,
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'inv-003-0000-0000-0000-000000000003',
        sku: 'MOU-LOG-MX3',
        name: 'Logitech MX Master 3S',
        description: 'Advanced wireless mouse with MagSpeed scroll',
        quantity: 0,
        price: 99.99,
        currency: 'USD',
        status: 'OUT_OF_STOCK',
        category: 'Peripherals',
        reorderThreshold: 8,
        lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: 'inv-004-0000-0000-0000-000000000004',
        sku: 'LAP-DEL-XPS',
        name: 'Dell XPS 15 9530',
        description: 'Intel Core i9 laptop with OLED display',
        quantity: 15,
        price: 2299.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Laptops',
        reorderThreshold: 5,
        lastUpdated: new Date(Date.now() - 259200000).toISOString(),
    },
    {
        id: 'inv-005-0000-0000-0000-000000000005',
        sku: 'MON-SAM-27K',
        name: 'Samsung 27" 4K Monitor S27A800',
        description: 'IPS 4K UHD monitor with USB-C 90W PD',
        quantity: 8,
        price: 599.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Monitors',
        reorderThreshold: 3,
        lastUpdated: new Date(Date.now() - 432000000).toISOString(),
    },
    {
        id: 'inv-006-0000-0000-0000-000000000006',
        sku: 'TAB-APL-IPP',
        name: 'iPad Pro 12.9" M2',
        description: 'Apple tablet with Liquid Retina XDR display',
        quantity: 3,
        price: 1299.00,
        currency: 'USD',
        status: 'LOW_STOCK',
        category: 'Tablets',
        reorderThreshold: 6,
        lastUpdated: new Date(Date.now() - 518400000).toISOString(),
    },
    {
        id: 'inv-007-0000-0000-0000-000000000007',
        sku: 'AUD-SON-WH5',
        name: 'Sony WH-1000XM5',
        description: 'Industry-leading noise canceling wireless headphones',
        quantity: 25,
        price: 349.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Audio',
        reorderThreshold: 8,
        lastUpdated: new Date(Date.now() - 604800000).toISOString(),
    },
    {
        id: 'inv-008-0000-0000-0000-000000000008',
        sku: 'MON-LG-5K',
        name: 'LG UltraFine 5K 27MD5KL',
        description: '5K Retina display with Thunderbolt 3',
        quantity: 6,
        price: 1299.95,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Monitors',
        reorderThreshold: 3,
        lastUpdated: new Date(Date.now() - 691200000).toISOString(),
    },
    {
        id: 'inv-009-0000-0000-0000-000000000009',
        sku: 'MOU-RZR-DA3',
        name: 'Razer DeathAdder V3',
        description: 'Ultra-lightweight gaming mouse 59g',
        quantity: 0,
        price: 79.99,
        currency: 'USD',
        status: 'OUT_OF_STOCK',
        category: 'Peripherals',
        reorderThreshold: 10,
        lastUpdated: new Date(Date.now() - 777600000).toISOString(),
    },
    {
        id: 'inv-010-0000-0000-0000-000000000010',
        sku: 'LAP-ASU-G14',
        name: 'ASUS ROG Zephyrus G14',
        description: 'AMD Ryzen 9 gaming laptop with RTX 4060',
        quantity: 10,
        price: 1799.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Laptops',
        reorderThreshold: 4,
        lastUpdated: new Date(Date.now() - 864000000).toISOString(),
    },
    {
        id: 'inv-011-0000-0000-0000-000000000011',
        sku: 'AUD-JAB-EV2',
        name: 'Jabra Evolve2 85',
        description: 'Professional wireless headset with ANC',
        quantity: 4,
        price: 449.00,
        currency: 'USD',
        status: 'LOW_STOCK',
        category: 'Audio',
        reorderThreshold: 6,
        lastUpdated: new Date(Date.now() - 950400000).toISOString(),
    },
    {
        id: 'inv-012-0000-0000-0000-000000000012',
        sku: 'KEY-COR-K100',
        name: 'Corsair K100 RGB',
        description: 'Optical-mechanical gaming keyboard with iCUE',
        quantity: 18,
        price: 229.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Peripherals',
        reorderThreshold: 5,
        lastUpdated: new Date(Date.now() - 1036800000).toISOString(),
    },
    {
        id: 'inv-013-0000-0000-0000-000000000013',
        sku: 'ACC-ANK-65W',
        name: 'Anker 65W USB-C GaN Charger',
        description: 'Compact 3-port fast charger with PowerIQ 3.0',
        quantity: 55,
        price: 49.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Accessories',
        reorderThreshold: 15,
        lastUpdated: new Date(Date.now() - 1123200000).toISOString(),
    },
    {
        id: 'inv-014-0000-0000-0000-000000000014',
        sku: 'ACC-BLK-TB4',
        name: 'Belkin Thunderbolt 4 Dock Pro',
        description: '18-port Thunderbolt 4 dock with 96W charging',
        quantity: 2,
        price: 399.99,
        currency: 'USD',
        status: 'LOW_STOCK',
        category: 'Accessories',
        reorderThreshold: 4,
        lastUpdated: new Date(Date.now() - 1209600000).toISOString(),
    },
    {
        id: 'inv-015-0000-0000-0000-000000000015',
        sku: 'PER-APL-TRK',
        name: 'Apple Magic Trackpad',
        description: 'Multi-Touch trackpad with Force Touch',
        quantity: 30,
        price: 129.00,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Peripherals',
        reorderThreshold: 8,
        lastUpdated: new Date(Date.now() - 1296000000).toISOString(),
    },
    {
        id: 'inv-016-0000-0000-0000-000000000016',
        sku: 'MON-VWS-24',
        name: 'ViewSonic VA2456-MHD 24"',
        description: '1080p IPS monitor with HDMI and DisplayPort',
        quantity: 12,
        price: 189.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Monitors',
        reorderThreshold: 5,
        lastUpdated: new Date(Date.now() - 1382400000).toISOString(),
    },
    {
        id: 'inv-017-0000-0000-0000-000000000017',
        sku: 'WEB-LOG-C920',
        name: 'Logitech C920s HD Webcam',
        description: '1080p 30fps Full HD webcam with privacy shutter',
        quantity: 22,
        price: 69.99,
        currency: 'USD',
        status: 'IN_STOCK',
        category: 'Peripherals',
        reorderThreshold: 8,
        lastUpdated: new Date(Date.now() - 1468800000).toISOString(),
    },
    {
        id: 'inv-018-0000-0000-0000-000000000018',
        sku: 'STO-KNG-1TB',
        name: 'Kingston 1TB NVMe SSD KC3000',
        description: 'PCIe 4.0 NVMe SSD with 7000MB/s read',
        quantity: 0,
        price: 119.99,
        currency: 'USD',
        status: 'OUT_OF_STOCK',
        category: 'Storage',
        reorderThreshold: 10,
        lastUpdated: new Date(Date.now() - 1555200000).toISOString(),
    },
];

const mockMovements: InventoryMovement[] = [
    {
        id: 'mov-001-0000-0000-0000-000000000001',
        inventoryItemId: 'inv-001-0000-0000-0000-000000000001',
        type: 'in',
        quantity: 10,
        previousQuantity: 32,
        newQuantity: 42,
        note: 'Restock from TechGlobal Distributors',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'mov-002-0000-0000-0000-000000000002',
        inventoryItemId: 'inv-002-0000-0000-0000-000000000002',
        type: 'out',
        quantity: 3,
        previousQuantity: 5,
        newQuantity: 2,
        note: 'Sale #sale-015',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: 'mov-003-0000-0000-0000-000000000003',
        inventoryItemId: 'inv-003-0000-0000-0000-000000000003',
        type: 'out',
        quantity: 8,
        previousQuantity: 8,
        newQuantity: 0,
        note: 'Bulk order fulfilled',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: 'mov-004-0000-0000-0000-000000000004',
        inventoryItemId: 'inv-004-0000-0000-0000-000000000004',
        type: 'in',
        quantity: 5,
        previousQuantity: 10,
        newQuantity: 15,
        note: 'Restock from Dell Technologies Direct',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
        id: 'mov-005-0000-0000-0000-000000000005',
        inventoryItemId: 'inv-007-0000-0000-0000-000000000007',
        type: 'in',
        quantity: 15,
        previousQuantity: 10,
        newQuantity: 25,
        note: 'Restock from Sony Professional',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
        id: 'mov-006-0000-0000-0000-000000000006',
        inventoryItemId: 'inv-013-0000-0000-0000-000000000013',
        type: 'in',
        quantity: 30,
        previousQuantity: 25,
        newQuantity: 55,
        note: 'Bulk restock from Anker Innovations',
        createdAt: new Date(Date.now() - 432000000).toISOString(),
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
