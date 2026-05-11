import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type { InventoryItem, InventoryMovement } from '@entities/inventory';
import mockData from '@app/mock/mock-data.json';

const baseInventory: InventoryItem[] = [...mockData.inventory] as InventoryItem[];
const baseMovements: InventoryMovement[] = [...mockData.inventoryMovements] as InventoryMovement[];

export const inventoryHandlers = [
  http.get(`${API_BASE_URL}/inventory`, async ({ request }) => {
    await delay(800);
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    return HttpResponse.json(inventory.filter((i) => (i.isActive as boolean | undefined) ?? true));
  }),

  http.get(`${API_BASE_URL}/inventory/low-stock`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    return HttpResponse.json(
      inventory.filter(
        (i) => ((i.isActive as boolean | undefined) ?? true) && i.status !== 'IN_STOCK'
      )
    );
  }),

  http.get(`${API_BASE_URL}/inventory/movements`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const movements = getTenantBucket(tenantId, 'inventoryMovements', () => baseMovements);
    return HttpResponse.json(movements);
  }),

  http.get(`${API_BASE_URL}/inventory/:id`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const item = inventory.find((i) => i.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/inventory`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'create:inventory');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const body = (await request.json()) as Partial<InventoryItem>;
    const qty = body.quantity ?? 0;
    const threshold = body.reorderThreshold ?? body.minStock ?? 0;
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      productId: body.productId ?? crypto.randomUUID(),
      sku: body.sku ?? 'SKU-NEW',
      name: body.name ?? 'New item',
      description: body.description,
      quantity: qty,
      price: body.price ?? 0,
      currency: body.currency ?? 'EUR',
      status: qty === 0 ? 'OUT_OF_STOCK' : qty <= threshold ? 'LOW_STOCK' : 'IN_STOCK',
      category: body.category,
      reorderThreshold: threshold,
      minStock: threshold,
      isActive: true,
      lastUpdated: new Date().toISOString(),
    };
    inventory.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/inventory/:id`, async ({ params, request }) => {
    await delay(500);
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const body = (await request.json()) as Partial<InventoryItem>;
    const idx = inventory.findIndex((i) => i.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = inventory[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, ...body, lastUpdated: new Date().toISOString() };
    inventory[idx] = updated;
    return HttpResponse.json(updated);
  }),

  http.patch(`${API_BASE_URL}/inventory/:id/stock`, async ({ params, request }) => {
    await delay(400);
    const denied = requirePermission(request, 'adjust:stock');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const body = (await request.json()) as { quantity: number };
    const existing = inventory.find((i) => i.id === params['id']);
    if (!existing) return new HttpResponse(null, { status: 404 });
    const newQty = existing.quantity + body.quantity;
    const threshold = existing.reorderThreshold ?? 5;
    return HttpResponse.json({
      ...existing,
      quantity: newQty,
      status: newQty === 0 ? 'OUT_OF_STOCK' : newQty <= threshold ? 'LOW_STOCK' : 'IN_STOCK',
      lastUpdated: new Date().toISOString(),
    });
  }),

  http.patch(`${API_BASE_URL}/inventory/:id`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const body = (await request.json()) as { is_active?: boolean };
    const idx = inventory.findIndex((i) => i.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = inventory[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    if ('is_active' in body) {
      inventory[idx] = { ...existing, isActive: body.is_active ?? true };
      return new HttpResponse(null, { status: 204 });
    }
    return new HttpResponse(null, { status: 400 });
  }),
];
