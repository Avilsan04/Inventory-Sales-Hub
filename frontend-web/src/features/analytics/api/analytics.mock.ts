import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { DashboardKpi, SalesPeriod, TopProduct, TopCustomer, InventoryValue, LowStockAlert } from '@entities/analytics';

export const analyticsHandlers = [
    http.get(`${API_BASE_URL}/analytics/dashboard`, async () => {
        await delay(700);
        return HttpResponse.json<DashboardKpi>({
            totalRevenue: 87432.50,
            totalOrders: 248,
            totalCustomers: 18,
            totalProducts: 20,
            revenueGrowth: 18.4,
            ordersGrowth: 12.7,
            currency: 'USD',
        });
    }),

    http.get(`${API_BASE_URL}/analytics/sales`, async () => {
        await delay(600);
        const data: SalesPeriod[] = [
            { period: '2024-05', revenue: 4200, orders: 11 },
            { period: '2024-06', revenue: 5800, orders: 15 },
            { period: '2024-07', revenue: 6100, orders: 17 },
            { period: '2024-08', revenue: 5400, orders: 14 },
            { period: '2024-09', revenue: 7200, orders: 19 },
            { period: '2024-10', revenue: 8600, orders: 23 },
            { period: '2024-11', revenue: 9100, orders: 26 },
            { period: '2024-12', revenue: 12400, orders: 34 },
            { period: '2025-01', revenue: 8200, orders: 22 },
            { period: '2025-02', revenue: 9500, orders: 28 },
            { period: '2025-03', revenue: 11300, orders: 34 },
            { period: '2025-04', revenue: 12800, orders: 38 },
        ];
        return HttpResponse.json(data);
    }),

    http.get(`${API_BASE_URL}/analytics/top-products`, async () => {
        await delay(500);
        const data: TopProduct[] = [
            {
                productId: 'prod-001-0000-0000-0000-000000000001',
                productName: 'MacBook Pro 16" M3 Max',
                sku: 'PRD-MBP-16M3',
                totalSold: 18,
                revenue: 62999.82,
            },
            {
                productId: 'prod-004-0000-0000-0000-000000000004',
                productName: 'Dell XPS 15 9530',
                sku: 'PRD-DEL-XPS15',
                totalSold: 12,
                revenue: 27599.88,
            },
            {
                productId: 'prod-010-0000-0000-0000-000000000010',
                productName: 'ASUS ROG Zephyrus G14 2024',
                sku: 'PRD-ASU-G14',
                totalSold: 9,
                revenue: 16199.91,
            },
            {
                productId: 'prod-007-0000-0000-0000-000000000007',
                productName: 'Sony WH-1000XM5',
                sku: 'PRD-SON-WH5',
                totalSold: 32,
                revenue: 11199.68,
            },
            {
                productId: 'prod-002-0000-0000-0000-000000000002',
                productName: 'Keychron Q1 Pro',
                sku: 'PRD-KEY-Q1PRO',
                totalSold: 45,
                revenue: 8955.00,
            },
        ];
        return HttpResponse.json(data);
    }),

    http.get(`${API_BASE_URL}/analytics/top-customers`, async () => {
        await delay(500);
        const data: TopCustomer[] = [
            {
                customerId: 'cust-001-0000-0000-0000-000000000001',
                customerName: 'Alice Johnson',
                email: 'alice@example.com',
                totalOrders: 12,
                totalSpent: 24350.75,
            },
            {
                customerId: 'cust-002-0000-0000-0000-000000000002',
                customerName: 'Bob Martinez',
                email: 'bob@example.com',
                totalOrders: 8,
                totalSpent: 14890.25,
            },
            {
                customerId: 'cust-004-0000-0000-0000-000000000004',
                customerName: 'David Chen',
                email: 'david.chen@example.com',
                totalOrders: 6,
                totalSpent: 11580.50,
            },
            {
                customerId: 'cust-005-0000-0000-0000-000000000005',
                customerName: 'Emma Wilson',
                email: 'emma.wilson@example.com',
                totalOrders: 5,
                totalSpent: 9420.00,
            },
            {
                customerId: 'cust-003-0000-0000-0000-000000000003',
                customerName: 'Carol White',
                email: 'carol@example.com',
                totalOrders: 4,
                totalSpent: 6780.30,
            },
        ];
        return HttpResponse.json(data);
    }),

    http.get(`${API_BASE_URL}/analytics/inventory-value`, async () => {
        await delay(500);
        return HttpResponse.json<InventoryValue>({
            totalItems: 260,
            totalValue: 314825.42,
            currency: 'USD',
            byStatus: [
                { status: 'IN_STOCK', count: 13, value: 289450.00 },
                { status: 'LOW_STOCK', count: 4, value: 21375.42 },
                { status: 'OUT_OF_STOCK', count: 3, value: 4000.00 },
            ],
        });
    }),

    http.get(`${API_BASE_URL}/analytics/low-stock-alerts`, async () => {
        await delay(500);
        const data: LowStockAlert[] = [
            {
                itemId: 'inv-002-0000-0000-0000-000000000002',
                sku: 'KEY-MECH-Q1',
                name: 'Keychron Q1 Pro',
                currentQuantity: 2,
                threshold: 5,
            },
            {
                itemId: 'inv-006-0000-0000-0000-000000000006',
                sku: 'TAB-APL-IPP',
                name: 'iPad Pro 12.9" M2',
                currentQuantity: 3,
                threshold: 6,
            },
            {
                itemId: 'inv-011-0000-0000-0000-000000000011',
                sku: 'AUD-JAB-EV2',
                name: 'Jabra Evolve2 85',
                currentQuantity: 4,
                threshold: 6,
            },
            {
                itemId: 'inv-014-0000-0000-0000-000000000014',
                sku: 'ACC-BLK-TB4',
                name: 'Belkin Thunderbolt 4 Dock Pro',
                currentQuantity: 2,
                threshold: 4,
            },
            {
                itemId: 'inv-003-0000-0000-0000-000000000003',
                sku: 'MOU-LOG-MX3',
                name: 'Logitech MX Master 3S',
                currentQuantity: 0,
                threshold: 8,
            },
            {
                itemId: 'inv-009-0000-0000-0000-000000000009',
                sku: 'MOU-RZR-DA3',
                name: 'Razer DeathAdder V3',
                currentQuantity: 0,
                threshold: 10,
            },
            {
                itemId: 'inv-018-0000-0000-0000-000000000018',
                sku: 'STO-KNG-1TB',
                name: 'Kingston 1TB NVMe SSD KC3000',
                currentQuantity: 0,
                threshold: 10,
            },
        ];
        return HttpResponse.json(data);
    }),
];
