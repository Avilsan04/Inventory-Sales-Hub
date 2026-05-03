import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Sale, SaleSummary, SaleStatus, CreateSaleDTO } from '@entities/sale';
import type { InventoryItem } from '@entities/inventory';
import mockData from '@app/mock/mock-data.json';

const mockSales: Sale[] = [...mockData.sales] as Sale[];
const mockInventory: InventoryItem[] = mockData.inventory as InventoryItem[];

const productNameMap = new Map<string, string>(
  (mockData.products as Array<{ id: string; name: string }>).map((p) => [p.id, p.name])
);

function getProductName(productId: string): string {
  // Try direct product ID match first, then inventory name
  const fromProduct = productNameMap.get(productId);
  if (fromProduct) return fromProduct;
  const fromInventory = mockInventory.find((i) => i.id === productId);
  return fromInventory?.name ?? 'Unknown product';
}

function computeInventoryStatus(qty: number, threshold: number): InventoryItem['status'] {
  if (qty === 0) return 'OUT_OF_STOCK';
  if (qty <= threshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}

function deductInventoryForSale(sale: Sale): void {
  for (const item of sale.items) {
    // Match inventory item by direct ID (POS flow) or by product name (SaleCreateDialog flow)
    const idx = mockInventory.findIndex(
      (i) => i.id === item.productId || i.name === item.productName
    );
    if (idx === -1) continue;
    const inv = mockInventory[idx];
    if (inv === undefined) continue;
    const newQty = Math.max(0, inv.quantity - item.quantity);
    const threshold = inv.reorderThreshold ?? 5;
    mockInventory[idx] = {
      ...inv,
      quantity: newQty,
      status: computeInventoryStatus(newQty, threshold),
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const salesHandlers = [
  http.get(`${API_BASE_URL}/sales/summary`, async () => {
    await delay(500);
    return HttpResponse.json<SaleSummary>(mockData.saleSummary as SaleSummary);
  }),

  http.get(`${API_BASE_URL}/sales`, async () => {
    await delay(600);
    return HttpResponse.json(mockSales);
  }),

  http.get(`${API_BASE_URL}/sales/:id/items`, async ({ params }) => {
    await delay(400);
    const sale = mockSales.find((s) => s.id === params['id']);
    return HttpResponse.json(sale?.items ?? []);
  }),

  http.get(`${API_BASE_URL}/sales/:id`, async ({ params }) => {
    await delay(400);
    const item = mockSales.find((s) => s.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/sales`, async ({ request }) => {
    await delay(700);
    const body = (await request.json()) as CreateSaleDTO;
    const now = new Date().toISOString();
    const nextNum = 2014 + (mockSales.length - mockData.sales.length + 1);
    const newId = `ORD-${String(nextNum).padStart(4, '0')}`;

    const items = body.items.map((item, i) => ({
      id: `si-${newId}-${String(i + 1).padStart(2, '0')}`,
      saleId: newId,
      productId: item.productId,
      productName: getProductName(item.productId),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));

    const total = items.reduce((sum, i) => sum + i.subtotal, 0);

    const newSale: Sale = {
      id: newId,
      customerId: body.customerId,
      status: 'pending',
      total,
      currency: body.currency,
      items,
      createdAt: now,
      updatedAt: now,
    };
    mockSales.unshift(newSale);
    return HttpResponse.json<Sale>(newSale, { status: 201 });
  }),

  http.patch(`${API_BASE_URL}/sales/:id/status`, async ({ params, request }) => {
    await delay(400);
    const body = (await request.json()) as { status: SaleStatus };
    const idx = mockSales.findIndex((s) => s.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = mockSales[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, status: body.status, updatedAt: new Date().toISOString() };
    mockSales[idx] = updated;
    // Deduct inventory when sale is completed (only if not already completed)
    if (body.status === 'completed' && existing.status !== 'completed') {
      deductInventoryForSale(updated);
    }
    return HttpResponse.json(updated);
  }),
];
