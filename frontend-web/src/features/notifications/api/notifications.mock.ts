import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant } from '@app/mock/mockUtils';
import mockData from '@app/mock/mock-data.json';

const baseNotifications = mockData.notifications.map((n) => ({ ...n }));

export const notificationHandlers = [
  http.get(`${API_BASE_URL}/notifications`, async ({ request }) => {
    await delay(500);
    const tenantId = resolveTenant(request);
    const notifications = getTenantBucket(tenantId, 'notifications', () => baseNotifications);
    return HttpResponse.json(notifications);
  }),

  http.patch(`${API_BASE_URL}/notifications/read-all`, async ({ request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const notifications = getTenantBucket(tenantId, 'notifications', () => baseNotifications);
    notifications.forEach((n) => {
      n.isRead = true;
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${API_BASE_URL}/notifications/:id/read`, async ({ params, request }) => {
    await delay(300);
    const tenantId = resolveTenant(request);
    const notifications = getTenantBucket(tenantId, 'notifications', () => baseNotifications);
    const item = notifications.find((n) => String(n.id) === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    item.isRead = true;
    return HttpResponse.json({ ...item, isRead: true });
  }),
];
