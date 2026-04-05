import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { DashboardKpi, SalesPeriod, TopProduct, TopCustomer, InventoryValue, LowStockAlert } from '@entities/analytics';

export const analyticsHandlers = [
  http.get(`${API_BASE_URL}/analytics/dashboard`, async () => {
    await delay(700);
    return HttpResponse.json<DashboardKpi>({
      totalRevenue: 48750.25,
      totalOrders: 134,
      totalCustomers: 87,
      totalProducts: 42,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      currency: 'USD',
    });
  }),

  http.get(`${API_BASE_URL}/analytics/sales`, async () => {
    await delay(600);
    const data: SalesPeriod[] = [
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
        productName: 'MacBook Pro 16" M3',
        sku: 'PRD-MBP-001',
        totalSold: 14,
        revenue: 48999.86,
      },
      {
        productId: 'prod-002-0000-0000-0000-000000000002',
        productName: 'Keychron Q1 Pro',
        sku: 'PRD-KEY-001',
        totalSold: 38,
        revenue: 7562.0,
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
        totalOrders: 8,
        totalSpent: 14200.5,
      },
      {
        customerId: 'cust-002-0000-0000-0000-000000000002',
        customerName: 'Bob Martinez',
        email: 'bob@example.com',
        totalOrders: 5,
        totalSpent: 7800.0,
      },
    ];
    return HttpResponse.json(data);
  }),

  http.get(`${API_BASE_URL}/analytics/inventory-value`, async () => {
    await delay(500);
    return HttpResponse.json<InventoryValue>({
      totalItems: 44,
      totalValue: 154897.58,
      currency: 'USD',
      byStatus: [
        { status: 'IN_STOCK', count: 38, value: 142000.0 },
        { status: 'LOW_STOCK', count: 4, value: 9897.58 },
        { status: 'OUT_OF_STOCK', count: 2, value: 3000.0 },
      ],
    });
  }),

  http.get(`${API_BASE_URL}/analytics/low-stock-alerts`, async () => {
    await delay(500);
    const data: LowStockAlert[] = [
      {
        itemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        sku: 'KEY-MECH-01',
        name: 'Keychron Q1 Pro',
        currentQuantity: 2,
        threshold: 5,
      },
      {
        itemId: '123e4567-e89b-12d3-a456-426614174000',
        sku: 'MOU-MX-M3',
        name: 'Logitech MX Master 3S',
        currentQuantity: 0,
        threshold: 5,
      },
    ];
    return HttpResponse.json(data);
  }),
];
