import { http, HttpResponse, delay, type DefaultBodyType } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type {
  SalesPeriod,
  TopProduct,
  TopCustomer,
  LowStockAlert,
  CashFlowEntry,
  WasteAlert,
} from '@entities/analytics';
import mockData from '@app/mock/mock-data.json';

const baseAnalytics = mockData.analytics;

function getAnalyticsFor(request: Request): typeof baseAnalytics {
  const tenantId = resolveTenant(request);
  return getTenantBucket(tenantId, 'analytics', () => baseAnalytics);
}

function requireAnalyticsAccess(request: Request): HttpResponse<DefaultBodyType> | null {
  return requirePermission(request, 'view:analytics');
}

function generateDailySales(
  from: string,
  to: string
): Array<{ date: string; revenue: number; ordersCount: number }> {
  const result: Array<{ date: string; revenue: number; ordersCount: number }> = [];
  const curr = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (curr <= end) {
    const dateStr = curr.toISOString().slice(0, 10);
    // Deterministic values per date — same date always returns same data
    const seed = curr.getUTCMonth() * 31 + curr.getUTCDate();
    result.push({
      date: dateStr,
      revenue: ((seed * 73_856 + 450_000) % 1_200_000) + 50_000,
      ordersCount: ((seed * 7 + 5) % 35) + 2,
    });
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return result;
}

export const analyticsHandlers = [
  http.get(`${API_BASE_URL}/analytics/dashboard`, async ({ request }) => {
    await delay(700);
    const denied = requireAnalyticsAccess(request);
    if (denied) return denied;
    const analytics = getAnalyticsFor(request);
    return HttpResponse.json(analytics.dashboard);
  }),

  http.get(`${API_BASE_URL}/analytics/sales`, async ({ request }) => {
    await delay(600);
    const denied = requireAnalyticsAccess(request);
    if (denied) return denied;
    const analytics = getAnalyticsFor(request);
    const url = new URL(request.url);
    const from = url.searchParams.get('from') ?? url.searchParams.get('start');
    const to = url.searchParams.get('to') ?? url.searchParams.get('end');
    if (from && to) {
      return HttpResponse.json<SalesPeriod[]>(
        generateDailySales(from, to) as unknown as SalesPeriod[]
      );
    }
    return HttpResponse.json<SalesPeriod[]>(analytics.salesPeriod as unknown as SalesPeriod[]);
  }),

  http.get(`${API_BASE_URL}/analytics/top-products`, async ({ request }) => {
    await delay(500);
    const denied = requireAnalyticsAccess(request);
    if (denied) return denied;
    const analytics = getAnalyticsFor(request);
    return HttpResponse.json<TopProduct[]>(analytics.topProducts as unknown as TopProduct[]);
  }),

  http.get(`${API_BASE_URL}/analytics/top-customers`, async ({ request }) => {
    await delay(500);
    const denied = requireAnalyticsAccess(request);
    if (denied) return denied;
    const analytics = getAnalyticsFor(request);
    return HttpResponse.json<TopCustomer[]>(analytics.topCustomers as unknown as TopCustomer[]);
  }),

  http.get(`${API_BASE_URL}/analytics/inventory-value`, async ({ request }) => {
    await delay(500);
    const denied = requireAnalyticsAccess(request);
    if (denied) return denied;
    const analytics = getAnalyticsFor(request);
    return HttpResponse.json(analytics.inventoryValue);
  }),

  http.get(`${API_BASE_URL}/analytics/recent-sales`, async ({ request }) => {
    await delay(300);
    const denied = requireAnalyticsAccess(request);
    if (denied) return denied;
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '5');
    const tenantId = resolveTenant(request);
    const salesBucket: unknown[] = getTenantBucket(
      tenantId,
      'sales',
      () => mockData.sales as unknown[]
    );
    return HttpResponse.json(salesBucket.slice(0, limit));
  }),

  http.get(`${API_BASE_URL}/analytics/low-stock-alerts`, async ({ request }) => {
    await delay(500);
    const denied = requireAnalyticsAccess(request);
    if (denied) return denied;
    const analytics = getAnalyticsFor(request);
    return HttpResponse.json<LowStockAlert[]>(
      analytics.lowStockAlerts as unknown as LowStockAlert[]
    );
  }),

  http.get(`${API_BASE_URL}/analytics/cash-flow`, async ({ request }) => {
    await delay(600);
    const denied = requireAnalyticsAccess(request);
    if (denied) return denied;
    const cashFlow: CashFlowEntry[] = [
      { period: 'Mon', inflow: 450000, outflow: 120000, net: 330000 },
      { period: 'Tue', inflow: 380000, outflow: 95000, net: 285000 },
      { period: 'Wed', inflow: 620000, outflow: 200000, net: 420000 },
      { period: 'Thu', inflow: 510000, outflow: 160000, net: 350000 },
      { period: 'Fri', inflow: 840000, outflow: 230000, net: 610000 },
      { period: 'Sat', inflow: 290000, outflow: 80000, net: 210000 },
      { period: 'Sun', inflow: 150000, outflow: 40000, net: 110000 },
    ];
    return HttpResponse.json<CashFlowEntry[]>(cashFlow);
  }),

  http.get(`${API_BASE_URL}/analytics/waste-alerts`, async ({ request }) => {
    await delay(500);
    const denied = requireAnalyticsAccess(request);
    if (denied) return denied;
    const wasteAlerts: WasteAlert[] = [
      {
        productId: 'p-001',
        productName: 'Organic Milk',
        sku: 'MILK-ORG-001',
        expiredUnits: 12,
        estimatedLoss: 2400,
        currency: 'EUR',
      },
      {
        productId: 'p-002',
        productName: 'Fresh Bread',
        sku: 'BREAD-001',
        expiredUnits: 8,
        estimatedLoss: 960,
        currency: 'EUR',
      },
      {
        productId: 'p-003',
        productName: 'Greek Yogurt',
        sku: 'YOGURT-GR-001',
        expiredUnits: 5,
        estimatedLoss: 1500,
        currency: 'EUR',
      },
    ];
    return HttpResponse.json<WasteAlert[]>(wasteAlerts);
  }),
];
