import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Category, Product } from '@entities/product';

const mockCategories: Category[] = [
  { id: 'cat-0001-0000-0000-0000-000000000001', name: 'Electronics', description: 'Electronic devices and accessories' },
  { id: 'cat-0002-0000-0000-0000-000000000002', name: 'Peripherals', description: 'Computer peripherals' },
];

const mockProducts: Product[] = [
  {
    id: 'prod-001-0000-0000-0000-000000000001',
    sku: 'PRD-MBP-001',
    name: 'MacBook Pro 16" M3',
    description: 'Apple Silicon professional laptop',
    price: 3499.99,
    currency: 'USD',
    categoryId: 'cat-0001-0000-0000-0000-000000000001',
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-03-01T12:00:00.000Z',
  },
  {
    id: 'prod-002-0000-0000-0000-000000000002',
    sku: 'PRD-KEY-001',
    name: 'Keychron Q1 Pro',
    description: 'Wireless mechanical keyboard',
    price: 199.0,
    currency: 'USD',
    categoryId: 'cat-0002-0000-0000-0000-000000000002',
    createdAt: '2025-02-01T10:00:00.000Z',
    updatedAt: '2025-03-15T08:00:00.000Z',
  },
];

export const productHandlers = [
  http.get(`${API_BASE_URL}/products/categories`, async () => {
    await delay(400);
    return HttpResponse.json(mockCategories);
  }),

  http.post(`${API_BASE_URL}/products/categories`, async ({ request }) => {
    await delay(500);
    const body = await request.json() as Partial<Category>;
    return HttpResponse.json<Category>(
      { id: crypto.randomUUID(), name: body.name ?? 'New Category', description: body.description },
      { status: 201 }
    );
  }),

  http.get(`${API_BASE_URL}/products`, async () => {
    await delay(600);
    return HttpResponse.json(mockProducts);
  }),

  http.get(`${API_BASE_URL}/products/:id`, async ({ params }) => {
    await delay(400);
    const item = mockProducts.find((p) => p.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/products`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as Partial<Product>;
    const now = new Date().toISOString();
    return HttpResponse.json<Product>(
      {
        id: crypto.randomUUID(),
        sku: body.sku ?? 'NEW-SKU',
        name: body.name ?? 'New Product',
        description: body.description,
        price: body.price ?? 0,
        currency: body.currency ?? 'USD',
        categoryId: body.categoryId,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  }),

  http.put(`${API_BASE_URL}/products/:id`, async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as Partial<Product>;
    const existing = mockProducts.find((p) => p.id === params['id']);
    if (!existing) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_BASE_URL}/products/:id`, async () => {
    await delay(400);
    return new HttpResponse(null, { status: 204 });
  }),
];
