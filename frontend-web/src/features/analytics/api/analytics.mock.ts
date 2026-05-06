import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type {
  DashboardKpi,
  SalesPeriod,
  TopProduct,
  TopCustomer,
  InventoryValue,
  LowStockAlert,
  CashFlowEntry,
  WasteAlert,
} from '@entities/analytics';
import mockData from '@app/mock/mock-data.json';

const { analytics } = mockData;

export const analyticsHandlers = [
  http.get(`${API_BASE_URL}/analytics/dashboard`, async () => {
    await delay(700);
    return HttpResponse.json<DashboardKpi>(analytics.dashboard as DashboardKpi);
  }),

  http.get(`${API_BASE_URL}/analytics/sales`, async ({ request }) => {
    await delay(600);
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const period = url.searchParams.get('period');
    let data = analytics.salesPeriod as SalesPeriod[];
    if (from || to || period) {
      const now = new Date();
      let cutoff: Date | null = null;
      if (period === '7d') cutoff = new Date(now.getTime() - 7 * 86400_000);
      else if (period === '30d') cutoff = new Date(now.getTime() - 30 * 86400_000);
      if (from && to) {
        data = data.filter((p) => p.period >= from && p.period <= to);
      } else if (cutoff) {
        const cutoffStr = cutoff.toISOString().slice(0, 10);
        data = data.filter((p) => !p.period || p.period >= cutoffStr);
      }
    }
    return HttpResponse.json<SalesPeriod[]>(data);
  }),

  http.get(`${API_BASE_URL}/analytics/top-products`, async () => {
    await delay(500);
    return HttpResponse.json<TopProduct[]>(analytics.topProducts as TopProduct[]);
  }),

  http.get(`${API_BASE_URL}/analytics/top-customers`, async () => {
    await delay(500);
    return HttpResponse.json<TopCustomer[]>(analytics.topCustomers as TopCustomer[]);
  }),

  http.get(`${API_BASE_URL}/analytics/inventory-value`, async () => {
    await delay(500);
    return HttpResponse.json<InventoryValue>(analytics.inventoryValue as InventoryValue);
  }),

  http.get(`${API_BASE_URL}/analytics/low-stock-alerts`, async () => {
    await delay(500);
    return HttpResponse.json<LowStockAlert[]>(analytics.lowStockAlerts as LowStockAlert[]);
  }),

  http.get(`${API_BASE_URL}/analytics/cash-flow`, async () => {
    await delay(600);
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

  http.get(`${API_BASE_URL}/analytics/waste-alerts`, async () => {
    await delay(500);
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
