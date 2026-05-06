import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Notification } from '@entities/notification';
import mockData from '@app/mock/mock-data.json';

// Deep copy — handlers mutate isRead directly on objects
const mockNotifications: Notification[] = mockData.notifications.map((n) => ({ ...n })) as Notification[];

export const notificationHandlers = [
    http.get(`${API_BASE_URL}/notifications`, async () => {
        await delay(500);
        return HttpResponse.json(mockNotifications);
    }),

    http.patch(`${API_BASE_URL}/notifications/read-all`, async () => {
        await delay(400);
        mockNotifications.forEach((n) => { n.isRead = true; });
        return new HttpResponse(null, { status: 204 });
    }),

    http.patch(`${API_BASE_URL}/notifications/:id/read`, async ({ params }) => {
        await delay(300);
        const item = mockNotifications.find((n) => n.id === params['id']);
        if (!item) return new HttpResponse(null, { status: 404 });
        item.isRead = true;
        return HttpResponse.json({ ...item, isRead: true });
    }),
];
