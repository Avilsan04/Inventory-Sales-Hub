import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Category, Product } from '@entities/product';

const mockCategories: Category[] = [
    { id: 'cat-001-0000-0000-0000-000000000001', name: 'Laptops', description: 'Portable computers and workstations' },
    { id: 'cat-002-0000-0000-0000-000000000002', name: 'Peripherals', description: 'Keyboards, mice, and input devices' },
    { id: 'cat-003-0000-0000-0000-000000000003', name: 'Monitors', description: 'Displays and screens' },
    { id: 'cat-004-0000-0000-0000-000000000004', name: 'Audio', description: 'Headphones, speakers, and microphones' },
    { id: 'cat-005-0000-0000-0000-000000000005', name: 'Accessories', description: 'Chargers, hubs, and adapters' },
    { id: 'cat-006-0000-0000-0000-000000000006', name: 'Storage', description: 'SSDs, HDDs, and flash drives' },
];

const mockProducts: Product[] = [
    {
        id: 'prod-001-0000-0000-0000-000000000001',
        sku: 'PRD-MBP-16M3',
        name: 'MacBook Pro 16" M3 Max',
        description: 'Apple Silicon professional laptop with 128GB unified memory',
        price: 3499.99,
        currency: 'USD',
        categoryId: 'cat-001-0000-0000-0000-000000000001',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-03-01T12:00:00.000Z',
    },
    {
        id: 'prod-002-0000-0000-0000-000000000002',
        sku: 'PRD-KEY-Q1PRO',
        name: 'Keychron Q1 Pro',
        description: 'Wireless custom mechanical keyboard with hot-swappable switches',
        price: 199.00,
        currency: 'USD',
        categoryId: 'cat-002-0000-0000-0000-000000000002',
        createdAt: '2025-02-01T10:00:00.000Z',
        updatedAt: '2025-03-15T08:00:00.000Z',
    },
    {
        id: 'prod-003-0000-0000-0000-000000000003',
        sku: 'PRD-MOU-MX3S',
        name: 'Logitech MX Master 3S',
        description: 'Advanced wireless mouse with MagSpeed electromagnetic scroll',
        price: 99.99,
        currency: 'USD',
        categoryId: 'cat-002-0000-0000-0000-000000000002',
        createdAt: '2025-01-15T10:00:00.000Z',
        updatedAt: '2025-02-10T09:00:00.000Z',
    },
    {
        id: 'prod-004-0000-0000-0000-000000000004',
        sku: 'PRD-DEL-XPS15',
        name: 'Dell XPS 15 9530',
        description: 'Intel Core i9 premium laptop with 3.5K OLED display',
        price: 2299.99,
        currency: 'USD',
        categoryId: 'cat-001-0000-0000-0000-000000000001',
        createdAt: '2025-01-20T10:00:00.000Z',
        updatedAt: '2025-03-05T11:00:00.000Z',
    },
    {
        id: 'prod-005-0000-0000-0000-000000000005',
        sku: 'PRD-SAM-27K',
        name: 'Samsung 27" 4K Monitor S27A800',
        description: 'IPS 4K UHD monitor with USB-C 90W PD and built-in KVM',
        price: 599.99,
        currency: 'USD',
        categoryId: 'cat-003-0000-0000-0000-000000000003',
        createdAt: '2025-02-05T10:00:00.000Z',
        updatedAt: '2025-02-28T14:00:00.000Z',
    },
    {
        id: 'prod-006-0000-0000-0000-000000000006',
        sku: 'PRD-APL-IPPM2',
        name: 'iPad Pro 12.9" M2',
        description: 'Apple tablet with Liquid Retina XDR display and ProMotion 120Hz',
        price: 1299.00,
        currency: 'USD',
        categoryId: 'cat-001-0000-0000-0000-000000000001',
        createdAt: '2025-01-25T10:00:00.000Z',
        updatedAt: '2025-03-10T10:00:00.000Z',
    },
    {
        id: 'prod-007-0000-0000-0000-000000000007',
        sku: 'PRD-SON-WH5',
        name: 'Sony WH-1000XM5',
        description: 'Industry-leading noise canceling over-ear headphones, 30h battery',
        price: 349.99,
        currency: 'USD',
        categoryId: 'cat-004-0000-0000-0000-000000000004',
        createdAt: '2025-02-10T10:00:00.000Z',
        updatedAt: '2025-03-20T09:00:00.000Z',
    },
    {
        id: 'prod-008-0000-0000-0000-000000000008',
        sku: 'PRD-LG-5K27',
        name: 'LG UltraFine 5K 27MD5KL',
        description: '5K Retina display with Thunderbolt 3 and built-in speakers',
        price: 1299.95,
        currency: 'USD',
        categoryId: 'cat-003-0000-0000-0000-000000000003',
        createdAt: '2025-01-30T10:00:00.000Z',
        updatedAt: '2025-02-25T15:00:00.000Z',
    },
    {
        id: 'prod-009-0000-0000-0000-000000000009',
        sku: 'PRD-RZR-DAV3',
        name: 'Razer DeathAdder V3',
        description: 'Ultra-lightweight gaming mouse 59g with Focus Pro 30K sensor',
        price: 79.99,
        currency: 'USD',
        categoryId: 'cat-002-0000-0000-0000-000000000002',
        createdAt: '2025-02-15T10:00:00.000Z',
        updatedAt: '2025-03-01T08:00:00.000Z',
    },
    {
        id: 'prod-010-0000-0000-0000-000000000010',
        sku: 'PRD-ASU-G14',
        name: 'ASUS ROG Zephyrus G14 2024',
        description: 'AMD Ryzen 9 8945HS gaming laptop with RTX 4060 and OLED',
        price: 1799.99,
        currency: 'USD',
        categoryId: 'cat-001-0000-0000-0000-000000000001',
        createdAt: '2025-02-20T10:00:00.000Z',
        updatedAt: '2025-03-25T11:00:00.000Z',
    },
    {
        id: 'prod-011-0000-0000-0000-000000000011',
        sku: 'PRD-JAB-EV85',
        name: 'Jabra Evolve2 85',
        description: 'Professional wireless ANC headset with 8-mic array, 40h battery',
        price: 449.00,
        currency: 'USD',
        categoryId: 'cat-004-0000-0000-0000-000000000004',
        createdAt: '2025-01-18T10:00:00.000Z',
        updatedAt: '2025-02-14T12:00:00.000Z',
    },
    {
        id: 'prod-012-0000-0000-0000-000000000012',
        sku: 'PRD-COR-K100',
        name: 'Corsair K100 RGB',
        description: 'Optical-mechanical gaming keyboard with iCUE and OPX switches',
        price: 229.99,
        currency: 'USD',
        categoryId: 'cat-002-0000-0000-0000-000000000002',
        createdAt: '2025-02-08T10:00:00.000Z',
        updatedAt: '2025-03-12T10:00:00.000Z',
    },
    {
        id: 'prod-013-0000-0000-0000-000000000013',
        sku: 'PRD-ANK-65W',
        name: 'Anker 65W USB-C GaN Charger',
        description: 'Compact 3-port GaN fast charger with PowerIQ 3.0 and PIQ 2.0',
        price: 49.99,
        currency: 'USD',
        categoryId: 'cat-005-0000-0000-0000-000000000005',
        createdAt: '2025-01-12T10:00:00.000Z',
        updatedAt: '2025-02-20T08:00:00.000Z',
    },
    {
        id: 'prod-014-0000-0000-0000-000000000014',
        sku: 'PRD-BLK-TB4',
        name: 'Belkin Thunderbolt 4 Dock Pro',
        description: '18-port Thunderbolt 4 dock with 96W host charging and dual 4K',
        price: 399.99,
        currency: 'USD',
        categoryId: 'cat-005-0000-0000-0000-000000000005',
        createdAt: '2025-01-22T10:00:00.000Z',
        updatedAt: '2025-03-18T09:00:00.000Z',
    },
    {
        id: 'prod-015-0000-0000-0000-000000000015',
        sku: 'PRD-APL-TRK',
        name: 'Apple Magic Trackpad',
        description: 'Multi-Touch surface with Force Touch and Haptic Feedback',
        price: 129.00,
        currency: 'USD',
        categoryId: 'cat-002-0000-0000-0000-000000000002',
        createdAt: '2025-02-03T10:00:00.000Z',
        updatedAt: '2025-02-22T14:00:00.000Z',
    },
    {
        id: 'prod-016-0000-0000-0000-000000000016',
        sku: 'PRD-VWS-24HD',
        name: 'ViewSonic VA2456-MHD 24"',
        description: 'Full HD 1080p IPS monitor with HDMI, DisplayPort, and speakers',
        price: 189.99,
        currency: 'USD',
        categoryId: 'cat-003-0000-0000-0000-000000000003',
        createdAt: '2025-01-28T10:00:00.000Z',
        updatedAt: '2025-03-02T11:00:00.000Z',
    },
    {
        id: 'prod-017-0000-0000-0000-000000000017',
        sku: 'PRD-LOG-C920',
        name: 'Logitech C920s HD Webcam',
        description: '1080p/30fps HD webcam with privacy shutter and stereo microphones',
        price: 69.99,
        currency: 'USD',
        categoryId: 'cat-002-0000-0000-0000-000000000002',
        createdAt: '2025-02-12T10:00:00.000Z',
        updatedAt: '2025-03-08T10:00:00.000Z',
    },
    {
        id: 'prod-018-0000-0000-0000-000000000018',
        sku: 'PRD-KNG-1TBNV',
        name: 'Kingston 1TB NVMe SSD KC3000',
        description: 'PCIe 4.0 x4 NVMe SSD with 7000MB/s read and 6000MB/s write',
        price: 119.99,
        currency: 'USD',
        categoryId: 'cat-006-0000-0000-0000-000000000006',
        createdAt: '2025-01-08T10:00:00.000Z',
        updatedAt: '2025-02-18T12:00:00.000Z',
    },
    {
        id: 'prod-019-0000-0000-0000-000000000019',
        sku: 'PRD-WD-PP2TB',
        name: 'WD My Passport 2TB',
        description: 'Portable external hard drive with 256-bit AES hardware encryption',
        price: 79.99,
        currency: 'USD',
        categoryId: 'cat-006-0000-0000-0000-000000000006',
        createdAt: '2025-02-06T10:00:00.000Z',
        updatedAt: '2025-03-06T09:00:00.000Z',
    },
    {
        id: 'prod-020-0000-0000-0000-000000000020',
        sku: 'PRD-ELG-SD15',
        name: 'Elgato Stream Deck MK.2',
        description: '15 customizable LCD keys for streaming, editing and productivity',
        price: 149.99,
        currency: 'USD',
        categoryId: 'cat-005-0000-0000-0000-000000000005',
        createdAt: '2025-02-25T10:00:00.000Z',
        updatedAt: '2025-03-22T10:00:00.000Z',
    },
];

export const productHandlers = [
    http.get(`${API_BASE_URL}/products/categories`, async () => {
        await delay(400);
        return HttpResponse.json(mockCategories);
    }),

    http.post(`${API_BASE_URL}/products/categories`, async ({ request }) => {
        await delay(500);
        const body = await request.json() as Partial<Category>;
        return HttpResponse.json<Category>(
            { id: crypto.randomUUID(), name: body.name ?? 'New Category', description: body.description },
            { status: 201 }
        );
    }),

    http.get(`${API_BASE_URL}/products`, async () => {
        await delay(600);
        return HttpResponse.json(mockProducts);
    }),

    http.get(`${API_BASE_URL}/products/:id`, async ({ params }) => {
        await delay(400);
        const item = mockProducts.find((p) => p.id === params['id']);
        if (!item) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(item);
    }),

    http.post(`${API_BASE_URL}/products`, async ({ request }) => {
        await delay(600);
        const body = await request.json() as Partial<Product>;
        const now = new Date().toISOString();
        const newProduct: Product = {
            id: crypto.randomUUID(),
            sku: body.sku ?? 'NEW-SKU',
            name: body.name ?? 'New Product',
            description: body.description,
            price: body.price ?? 0,
            currency: body.currency ?? 'USD',
            categoryId: body.categoryId,
            createdAt: now,
            updatedAt: now,
        };
        mockProducts.push(newProduct);
        return HttpResponse.json<Product>(newProduct, { status: 201 });
    }),

    http.put(`${API_BASE_URL}/products/:id`, async ({ params, request }) => {
        await delay(500);
        const body = await request.json() as Partial<Product>;
        const idx = mockProducts.findIndex((p) => p.id === params['id']);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const existing = mockProducts[idx];
        if (existing === undefined) return new HttpResponse(null, { status: 404 });
        const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
        mockProducts[idx] = updated;
        return HttpResponse.json(updated);
    }),

    http.delete(`${API_BASE_URL}/products/:id`, async () => {
        await delay(400);
        return new HttpResponse(null, { status: 204 });
    }),
];
