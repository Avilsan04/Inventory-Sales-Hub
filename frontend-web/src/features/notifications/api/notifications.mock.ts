import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Notification } from '@entities/notification';

const mockNotifications: Notification[] = [
  {
    id: 'notif-01-0000-0000-0000-000000000001',
    title: 'Low Stock Alert',
    message: 'Keychron Q1 Pro has only 2 units remaining.',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-02-0000-0000-0000-000000000002',
    title: 'Out of Stock',
    message: 'Logitech MX Master 3S is out of stock.',
    type: 'error',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-03-0000-0000-0000-000000000003',
    title: 'New Sale Completed',
    message: 'Sale #sale-001 has been completed successfully.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const notificationHandlers = [
  http.get(`${API_BASE_URL}/notifications`, async () => {
    await delay(500);
    return HttpResponse.json(mockNotifications);
  }),

  http.patch(`${API_BASE_URL}/notifications/read-all`, async () => {
    await delay(400);
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${API_BASE_URL}/notifications/:id/read`, async ({ params }) => {
    await delay(300);
    const item = mockNotifications.find((n) => n.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...item, isRead: true });
  }),
];
