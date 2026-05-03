import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { AuditLog, AuditEntityType } from '@entities/audit';

const seededLogs: AuditLog[] = [
  {
    id: 'a-001',
    userId: 'usr-admin',
    userName: 'Admin User',
    action: 'create',
    entityType: 'product',
    entityId: 'p-001',
    after: { name: 'Organic Milk', price: 200 },
    timestamp: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'a-002',
    userId: 'usr-manager',
    userName: 'Manager User',
    action: 'adjust_stock',
    entityType: 'inventory',
    entityId: 'inv-001',
    before: { quantity: 50 },
    after: { quantity: 35 },
    reason: 'Manual correction',
    timestamp: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: 'a-003',
    userId: 'usr-staff',
    userName: 'Staff User',
    action: 'status_change',
    entityType: 'sale',
    entityId: 'ORD-001',
    before: { status: 'pending' },
    after: { status: 'completed' },
    timestamp: new Date(Date.now() - 10800_000).toISOString(),
  },
  {
    id: 'a-004',
    userId: 'usr-admin',
    userName: 'Admin User',
    action: 'delete',
    entityType: 'employee',
    entityId: 'emp-007',
    before: { name: 'John Doe', isActive: true },
    after: { isActive: false },
    timestamp: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id: 'a-005',
    userId: 'usr-manager',
    userName: 'Manager User',
    action: 'update',
    entityType: 'product',
    entityId: 'p-002',
    before: { price: 150 },
    after: { price: 175 },
    timestamp: new Date(Date.now() - 172800_000).toISOString(),
  },
];

export const auditHandlers = [
  http.get(`${API_BASE_URL}/audit`, async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const entityType = url.searchParams.get('entityType') as AuditEntityType | null;
    const userId = url.searchParams.get('userId');

    let filtered = seededLogs;
    if (entityType) filtered = filtered.filter((l) => l.entityType === entityType);
    if (userId) filtered = filtered.filter((l) => l.userId === userId);

    return HttpResponse.json(filtered);
  }),
];
