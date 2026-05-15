import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { TenantSettings } from './settingsApi';

let mockSettings: TenantSettings = {
  companyName: 'Inventory Sales Hub',
  logoUrl: null,
  currency: 'EUR',
  timezone: 'Europe/Madrid',
};

export const settingsHandlers = [
  http.get(`${API_BASE_URL}/settings`, async () => {
    await delay(300);
    return HttpResponse.json(mockSettings);
  }),

  http.put(`${API_BASE_URL}/settings`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as Partial<TenantSettings>;
    mockSettings = { ...mockSettings, ...body };
    return HttpResponse.json(mockSettings);
  }),
];
