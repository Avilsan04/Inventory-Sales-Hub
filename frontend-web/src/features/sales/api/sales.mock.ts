import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type { Sale, SaleSummary, SaleStatus, CreateSaleDTO } from '@entities/sale';
import type { InventoryItem } from '@entities/inventory';
import mockData from '@app/mock/mock-data.json';

const baseSales: Sale[] = [...mockData.sales] as Sale[];
const baseInventory: InventoryItem[] = mockData.inventory as InventoryItem[];
const baseProducts = mockData.products as Array<{ id: string; name: string }>;

function makeProductNameMap(products: Array<{ id: string; name: string }>): Map<string, string> {
  return new Map(products.map((p) => [p.id, p.name]));
}

function getProductName(
  productId: string,
  inventory: InventoryItem[],
  productNameMap: Map<string, string>
): string {
  const fromProduct = productNameMap.get(productId);
  if (fromProduct) return fromProduct;
  const fromInventory = inventory.find((i) => i.id === productId);
  return fromInventory?.name ?? 'Unknown product';
}

function computeInventoryStatus(qty: number, threshold: number): InventoryItem['status'] {
  if (qty === 0) return 'OUT_OF_STOCK';
  if (qty <= threshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}

function deductInventoryForSale(sale: Sale, inventory: InventoryItem[]): void {
  for (const item of sale.items) {
    // Match inventory item by direct ID (POS flow) or by product name (SaleCreateDialog flow)
    const idx = inventory.findIndex((i) => i.id === item.productId || i.name === item.productName);
    if (idx === -1) continue;
    const inv = inventory[idx];
    if (inv === undefined) continue;
    const newQty = Math.max(0, inv.quantity - item.quantity);
    const threshold = inv.reorderThreshold ?? 5;
    inventory[idx] = {
      ...inv,
      quantity: newQty,
      status: computeInventoryStatus(newQty, threshold),
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const salesHandlers = [
  http.get(`${API_BASE_URL}/sales/summary`, async ({ request }) => {
    await delay(500);
    const tenantId = resolveTenant(request);
    const summary = getTenantBucket(tenantId, 'saleSummary', () => mockData.saleSummary);
    return HttpResponse.json<SaleSummary>(summary as unknown as SaleSummary);
  }),

  http.get(`${API_BASE_URL}/sales`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    let results = sales;
    if (search) {
      results = results.filter(
        (s) =>
          s.id.toLowerCase().includes(search) || (s.customerId ?? '').toLowerCase().includes(search)
      );
    }
    if (dateFrom) results = results.filter((s) => s.createdAt.slice(0, 10) >= dateFrom);
    if (dateTo) results = results.filter((s) => s.createdAt.slice(0, 10) <= dateTo);

    return HttpResponse.json(results);
  }),

  http.get(`${API_BASE_URL}/sales/:id/items`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const sale = sales.find((s) => s.id === params['id']);
    return HttpResponse.json(sale?.items ?? []);
  }),

  http.get(`${API_BASE_URL}/sales/:id`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const item = sales.find((s) => s.id === params['id']);
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
    const body = (await request.json()) as CreateSaleDTO;
    const now = new Date().toISOString();
    const nextNum = 2014 + (sales.length - baseSales.length + 1);
    const newId = `ORD-${String(nextNum).padStart(4, '0')}`;

    const items = body.items.map((item, i) => ({
      id: `si-${newId}-${String(i + 1).padStart(2, '0')}`,
      saleId: newId,
      productId: item.productId,
      productName: getProductName(item.productId, inventory, productNameMap),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const discountPercent = body.discountPercent;
    const taxPercent = body.taxPercent;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const taxableBase = subtotal - discountAmount;
    const taxAmount = Math.round(taxableBase * (taxPercent / 100));
    const total = taxableBase + taxAmount;

    const newSale: Sale = {
      id: newId,
      customerId: body.customerId,
      status: 'pending',
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      total,
      currency: body.currency,
      items,
      createdAt: now,
      updatedAt: now,
    };
    sales.unshift(newSale);
    return HttpResponse.json<Sale>(newSale, { status: 201 });
  }),

  http.patch(`${API_BASE_URL}/sales/:id/status`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const sales = getTenantBucket(tenantId, 'sales', () => baseSales);
    const inventory = getTenantBucket(tenantId, 'inventory', () => baseInventory);
    const body = (await request.json()) as { status: SaleStatus };
    const idx = sales.findIndex((s) => s.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = sales[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, status: body.status, updatedAt: new Date().toISOString() };
    sales[idx] = updated;
    // Deduct inventory when sale is completed (only if not already completed)
    if (body.status === 'completed' && existing.status !== 'completed') {
      deductInventoryForSale(updated, inventory);
    }
    return HttpResponse.json(updated);
  }),
];
