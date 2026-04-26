import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { DashboardKpi, SalesPeriod, TopProduct, TopCustomer, InventoryValue, LowStockAlert } from '@entities/analytics';
import mockData from '@app/mock/mock-data.json';

const { analytics } = mockData;

export const analyticsHandlers = [
    http.get(`${API_BASE_URL}/analytics/dashboard`, async () => {
        await delay(700);
        return HttpResponse.json<DashboardKpi>(analytics.dashboard as DashboardKpi);
    }),

    http.get(`${API_BASE_URL}/analytics/sales`, async () => {
        await delay(600);
        return HttpResponse.json<SalesPeriod[]>(analytics.salesPeriod as SalesPeriod[]);
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
];
