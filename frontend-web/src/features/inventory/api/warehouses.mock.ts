import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type { Warehouse } from '@entities/warehouse';

const baseWarehouses: Warehouse[] = [
  { id: 'wh-001', name: 'Tienda Principal', location: 'Calle Mayor 1, Madrid', isActive: true },
  { id: 'wh-002', name: 'Bodega Central', location: 'Polígono Industrial, Alcalá', isActive: true },
  { id: 'wh-003', name: 'Tienda Norte', location: 'Av. de la Paz 15, Burgos', isActive: true },
];

export const warehouseHandlers = [
  http.get(`${API_BASE_URL}/warehouses`, async ({ request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const warehouses = getTenantBucket(tenantId, 'warehouses', () => baseWarehouses);
    return HttpResponse.json<Warehouse[]>(warehouses);
  }),

  http.post(`${API_BASE_URL}/inventory/transfer`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'transfer:stock');
    if (denied) return denied;
    resolveTenant(request);
    return HttpResponse.json({ success: true });
  }),
];
