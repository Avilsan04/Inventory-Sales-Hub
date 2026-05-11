import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant } from '@app/mock/mockUtils';
import type { Notification } from '@entities/notification';
import mockData from '@app/mock/mock-data.json';

// Deep copy — handlers mutate isRead directly on objects
const baseNotifications: Notification[] = mockData.notifications.map((n) => ({
  ...n,
})) as Notification[];

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
    const item = notifications.find((n) => n.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    item.isRead = true;
    return HttpResponse.json({ ...item, isRead: true });
  }),
];
