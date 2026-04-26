import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Notification } from '@entities/notification';

const mockNotifications: Notification[] = [
    {
        id: 'notif-01-0000-0000-0000-000000000001',
        title: 'Low Stock Alert',
        message: 'Keychron Q1 Pro has only 2 units remaining. Reorder threshold is 5.',
        type: 'warning',
        isRead: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
        id: 'notif-02-0000-0000-0000-000000000002',
        title: 'Out of Stock',
        message: 'Logitech MX Master 3S is out of stock. Last unit sold on April 14.',
        type: 'error',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'notif-03-0000-0000-0000-000000000003',
        title: 'New Sale Completed',
        message: 'Sale #sale-020 from Liam Anderson totaling $819.98 has been confirmed.',
        type: 'success',
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: 'notif-04-0000-0000-0000-000000000004',
        title: 'Low Stock Alert',
        message: 'iPad Pro 12.9" M2 has only 3 units remaining. Reorder threshold is 6.',
        type: 'warning',
        isRead: false,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
        id: 'notif-05-0000-0000-0000-000000000005',
        title: 'Sale Cancelled',
        message: 'Sale #sale-017 from Katherine Lee ($129.00) was cancelled by the customer.',
        type: 'error',
        isRead: false,
        createdAt: new Date(Date.now() - 28800000).toISOString(),
    },
    {
        id: 'notif-06-0000-0000-0000-000000000006',
        title: 'Restock Received',
        message: 'MacBook Pro 16" M3 Max: +10 units received from TechGlobal Distributors. New stock: 42.',
        type: 'success',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'notif-07-0000-0000-0000-000000000007',
        title: 'New Customer Registered',
        message: 'Rachel Turner (rachel.t@example.com) created a new account.',
        type: 'info',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: 'notif-08-0000-0000-0000-000000000008',
        title: 'Large Order Alert',
        message: 'Alice Johnson placed a high-value order (sale-016) for $5,099.98. Review required.',
        type: 'info',
        isRead: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
        id: 'notif-09-0000-0000-0000-000000000009',
        title: 'Out of Stock',
        message: 'Razer DeathAdder V3 is out of stock. Last restock was 18 days ago.',
        type: 'error',
        isRead: true,
        createdAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
        id: 'notif-10-0000-0000-0000-000000000010',
        title: 'New Employee Added',
        message: 'Scott Lang (scott@company.com) joined as Staff. Onboarding pending.',
        type: 'info',
        isRead: true,
        createdAt: new Date(Date.now() - 432000000).toISOString(),
    },
    {
        id: 'notif-11-0000-0000-0000-000000000011',
        title: 'Monthly Revenue Milestone',
        message: 'April 2025 revenue reached $12,800 — up 13.3% from March. Great performance!',
        type: 'success',
        isRead: true,
        createdAt: new Date(Date.now() - 518400000).toISOString(),
    },
    {
        id: 'notif-12-0000-0000-0000-000000000012',
        title: 'Low Stock Alert',
        message: 'Jabra Evolve2 85 has only 4 units remaining. Reorder threshold is 6.',
        type: 'warning',
        isRead: true,
        createdAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
        id: 'notif-13-0000-0000-0000-000000000013',
        title: 'Supplier Order Placed',
        message: 'Purchase order sent to Sony Professional Solutions for 15x WH-1000XM5 units.',
        type: 'info',
        isRead: true,
        createdAt: new Date(Date.now() - 691200000).toISOString(),
    },
    {
        id: 'notif-14-0000-0000-0000-000000000014',
        title: 'Out of Stock',
        message: 'Kingston 1TB NVMe SSD KC3000 is out of stock. 10 back-orders pending.',
        type: 'error',
        isRead: true,
        createdAt: new Date(Date.now() - 777600000).toISOString(),
    },
    {
        id: 'notif-15-0000-0000-0000-000000000015',
        title: 'Low Stock Alert',
        message: 'Belkin Thunderbolt 4 Dock Pro has only 2 units remaining. Reorder threshold is 4.',
        type: 'warning',
        isRead: true,
        createdAt: new Date(Date.now() - 864000000).toISOString(),
    },
];

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
