import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type { InventoryMovement } from '@entities/inventory';
import mockData from '@app/mock/mock-data.json';

const baseInventory = [...mockData.inventory];
const baseMovements = [...mockData.inventoryMovements] as unknown as InventoryMovement[];

export const inventoryHandlers = [
  http.get(`${API_BASE_URL}/inventory`, async ({ request }) => {
    await delay(800);
    const tenantId = resolveTenant(request);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '0', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20', 10);
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    const status = url.searchParams.get('status') ?? '';

    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    let filtered = inventory.filter((i) => i.product.isActive);

    if (status === 'LOW_STOCK') {
      filtered = filtered.filter((i) => i.quantity > 0 && i.isLowStock);
    } else if (status === 'OUT_OF_STOCK') {
      filtered = filtered.filter((i) => i.quantity === 0);
    }
    if (search) {
      filtered = filtered.filter(
        (i) =>
          i.product.name.toLowerCase().includes(search) ||
          i.product.sku.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const start = page * pageSize;
    const data = filtered.slice(start, start + pageSize);
    return HttpResponse.json({ data, total, page, pageSize });
  }),

  http.get(`${API_BASE_URL}/inventory/low-stock`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    return HttpResponse.json(inventory.filter((i) => i.product.isActive && i.isLowStock));
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
    const item = inventory.find((i) => String(i.id) === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/inventory`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'create:inventory');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const body = (await request.json()) as Record<string, unknown>;
    const qty = (body['quantity'] as number | undefined) ?? 0;
    const minStock = (body['minStock'] as number | undefined) ?? 0;
    const nextId = inventory.length + 1;
    const newItem = {
      id: nextId,
      product: (body['product'] as Record<string, unknown> | undefined) ?? {
        id: nextId,
        name: body['name'] ?? 'New item',
        description: body['description'] ?? null,
        sku: body['sku'] ?? 'SKU-NEW',
        purchasePrice: body['purchasePrice'] ?? 0,
        salePrice: body['salePrice'] ?? 0,
        category: body['category'] ?? null,
        isActive: true,
      },
      quantity: qty,
      minStock,
      isLowStock: qty === 0 || qty <= minStock,
    };
    inventory.push(newItem as (typeof baseInventory)[0]);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/inventory/:id`, async ({ params, request }) => {
    await delay(500);
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = inventory.findIndex((i) => String(i.id) === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = inventory[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, ...body };
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
    const existing = inventory.find((i) => String(i.id) === params['id']);
    if (!existing) return new HttpResponse(null, { status: 404 });
    const newQty = existing.quantity + body.quantity;
    const threshold = existing.minStock;
    return HttpResponse.json({
      ...existing,
      quantity: newQty,
      isLowStock: newQty === 0 || newQty <= threshold,
    });
  }),

  http.patch(`${API_BASE_URL}/inventory/:id`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const body = (await request.json()) as { is_active?: boolean };
    const idx = inventory.findIndex((i) => String(i.id) === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = inventory[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    if ('is_active' in body) {
      inventory[idx] = {
        ...existing,
        product: { ...existing.product, isActive: body.is_active ?? true },
      };
      return new HttpResponse(null, { status: 204 });
    }
    return new HttpResponse(null, { status: 400 });
  }),
];
