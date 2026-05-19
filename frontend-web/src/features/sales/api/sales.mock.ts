import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import {
  getTenantBucket,
  resolveTenant,
  requirePermission,
  resolveCustomerIdFromRequest,
} from '@app/mock/mockUtils';
import type { SaleStatus } from '@entities/sale';
import mockData from '@app/mock/mock-data.json';

const baseSales = [...mockData.sales];
const baseInventory = [...mockData.inventory];
const baseProducts = mockData.products as Array<{ id: number; name: string }>;

function makeProductNameMap(products: Array<{ id: number; name: string }>): Map<string, string> {
  return new Map(products.map((p) => [String(p.id), p.name]));
}

function getProductName(
  productId: string | number,
  inventory: typeof baseInventory,
  productNameMap: Map<string, string>
): string {
  const fromProduct = productNameMap.get(String(productId));
  if (fromProduct) return fromProduct;
  const fromInventory = inventory.find((i) => String(i.id) === String(productId));
  return fromInventory?.product.name ?? 'Unknown product';
}

function computeInventoryStatus(newQty: number, threshold: number): string {
  return newQty === 0 ? 'OUT_OF_STOCK' : newQty <= threshold ? 'LOW_STOCK' : 'IN_STOCK';
}

function deductInventoryForSale(
  sale: { items: Array<{ productId: number | string; productName: string; quantity: number }> },
  inventory: typeof baseInventory
): void {
  for (const item of sale.items) {
    const idx = inventory.findIndex(
      (i) => String(i.id) === String(item.productId) || i.product.name === item.productName
    );
    if (idx === -1) continue;
    const inv = inventory[idx];
    if (inv === undefined) continue;
    const newQty = Math.max(0, inv.quantity - item.quantity);
    const threshold = inv.minStock;
    inventory[idx] = {
      ...inv,
      quantity: newQty,
      isLowStock: newQty === 0 || newQty <= threshold,
    };
    void computeInventoryStatus; // suppress unused warning
  }
}

type CreateSaleBody = {
  customerId?: string;
  items: Array<{ productId: string | number; quantity: number; unitPrice: number }>;
  customer?: { id?: number | string; name?: string; email?: string | null; phone?: string | null };
  discountPercent?: number;
  taxPercent?: number;
  currency?: string;
};

export const salesHandlers = [
  http.get(`${API_BASE_URL}/sales/my-orders`, async ({ request }) => {
    await delay(500);
    const customerId = resolveCustomerIdFromRequest(request);
    if (customerId === null) return new HttpResponse(null, { status: 401 });
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const myOrders = sales.filter((s) => s.customer.id === customerId);
    return HttpResponse.json(myOrders);
  }),

  http.get(`${API_BASE_URL}/sales/summary`, async ({ request }) => {
    await delay(500);
    const tenantId = resolveTenant(request);
    const summary = getTenantBucket(tenantId, 'saleSummary', () => mockData.saleSummary);
    return HttpResponse.json(summary);
  }),

  http.get(`${API_BASE_URL}/sales`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);

    let results = sales;
    if (search) {
      results = results.filter(
        (s) =>
          String(s.id).toLowerCase().includes(search) ||
          String(s.customer.id).toLowerCase().includes(search) ||
          s.customer.name.toLowerCase().includes(search)
      );
    }
    if (dateFrom) results = results.filter((s) => s.createdAt.slice(0, 10) >= dateFrom);
    if (dateTo) results = results.filter((s) => s.createdAt.slice(0, 10) <= dateTo);

    const total = results.length;
    const data = results.slice(page * size, (page + 1) * size);
    return HttpResponse.json({ data, total, page, pageSize: size });
  }),

  http.get(`${API_BASE_URL}/sales/:id/items`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const sale = sales.find((s) => String(s.id) === params['id']);
    return HttpResponse.json(sale?.items ?? []);
  }),

  http.get(`${API_BASE_URL}/sales/:id`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const item = sales.find((s) => String(s.id) === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/sales`, async ({ request }) => {
    await delay(700);
    const denied = requirePermission(request, 'create:sale');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const products = getTenantBucket(tenantId, 'products', () => baseProducts);
    const productNameMap = makeProductNameMap(products);
    const body = (await request.json()) as CreateSaleBody;
    const now = new Date().toISOString();
    const nextNum = 2014 + (sales.length - baseSales.length + 1);

    let itemIdCounter = 101 + (sales.length - baseSales.length) * 10;
    const items = body.items.map((item) => ({
      id: itemIdCounter++,
      productId: typeof item.productId === 'string' ? parseInt(item.productId, 10) : item.productId,
      productName: getProductName(item.productId, inventory, productNameMap),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const discountPercent = body.discountPercent ?? 0;
    const taxPercent = body.taxPercent ?? 0;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const taxableBase = subtotal - discountAmount;
    const taxAmount = Math.round(taxableBase * (taxPercent / 100));
    const total = taxableBase + taxAmount;

    const resolvedCustomerId = body.customerId
      ? Number(body.customerId)
      : resolveCustomerIdFromRequest(request);
    const newSale = {
      id: nextNum,
      customer:
        body.customer ??
        (resolvedCustomerId !== null
          ? { id: resolvedCustomerId, name: 'Customer', email: null, phone: null }
          : null),
      status: 'pending',
      subtotal,
      taxRate: taxPercent,
      taxAmount,
      total,
      processedBy: null,
      items,
      createdAt: now,
      updatedAt: now,
    };
    sales.unshift(newSale as unknown as (typeof baseSales)[0]);
    return HttpResponse.json(newSale, { status: 201 });
  }),

  http.patch(`${API_BASE_URL}/sales/:id/status`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const body = (await request.json()) as { status: SaleStatus };
    const idx = sales.findIndex((s) => String(s.id) === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = sales[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, status: body.status, updatedAt: new Date().toISOString() };
    sales[idx] = updated;
    if (body.status === 'completed' && existing.status !== 'completed') {
      deductInventoryForSale(updated, inventory);
    }
    return HttpResponse.json(updated);
  }),
];
