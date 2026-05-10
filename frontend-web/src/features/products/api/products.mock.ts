import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type { Category, Product } from '@entities/product';
import mockData from '@app/mock/mock-data.json';

const baseCategories: Category[] = [...mockData.productCategories] as Category[];
const baseProducts: Product[] = [...mockData.products] as Product[];

export const productHandlers = [
  http.get(`${API_BASE_URL}/products/categories`, async ({ request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const categories = getTenantBucket(tenantId, 'productCategories', () => baseCategories);
    return HttpResponse.json(categories);
  }),

  http.post(`${API_BASE_URL}/products/categories`, async ({ request }) => {
    await delay(500);
    const denied = requirePermission(request, 'create:product');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const categories = getTenantBucket(tenantId, 'productCategories', () => baseCategories);
    const body = (await request.json()) as Partial<Category>;
    const created: Category = {
      id: crypto.randomUUID(),
      name: body.name ?? 'Nueva categoría',
      description: body.description,
    };
    categories.push(created);
    return HttpResponse.json<Category>(created, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/products`, async ({ request }) => {
    await delay(600);
    const tenantId = resolveTenant(request);
    const products = getTenantBucket(tenantId, 'products', () => baseProducts);
    return HttpResponse.json(
      products
        .filter((p) => p.isActive)
        .map((p) => ({
          ...p,
          imageUrl: `https://picsum.photos/seed/${p.sku.split('-')[1] ?? '100'}/300/225`,
        }))
    );
  }),

  http.get(`${API_BASE_URL}/products/:id`, async ({ params, request }) => {
    await delay(400);
    const tenantId = resolveTenant(request);
    const products = getTenantBucket(tenantId, 'products', () => baseProducts);
    const item = products.find((p) => p.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/products`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'create:product');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const products = getTenantBucket(tenantId, 'products', () => baseProducts);
    const body = (await request.json()) as Partial<Product>;
    const now = new Date().toISOString();
    const newProduct: Product = {
      id: crypto.randomUUID(),
      sku: body.sku ?? 'SKU-NEW',
      name: body.name ?? 'Nuevo producto',
      description: body.description,
      price: body.price ?? 0,
      currency: body.currency ?? 'EUR',
      categoryId: body.categoryId,
      parentId: body.parentId,
      uom: body.uom ?? 'unit',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    products.push(newProduct);
    return HttpResponse.json<Product>(newProduct, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/products/:id`, async ({ params, request }) => {
    await delay(500);
    const denied = requirePermission(request, 'create:product');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const products = getTenantBucket(tenantId, 'products', () => baseProducts);
    const body = (await request.json()) as Partial<Product>;
    const idx = products.findIndex((p) => p.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = products[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    products[idx] = updated;
    return HttpResponse.json(updated);
  }),

  http.patch(`${API_BASE_URL}/products/:id`, async ({ params, request }) => {
    await delay(400);
    const denied = requirePermission(request, 'delete:product');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const products = getTenantBucket(tenantId, 'products', () => baseProducts);
    const body = (await request.json()) as { is_active?: boolean };
    const idx = products.findIndex((p) => p.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = products[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    if ('is_active' in body) {
      products[idx] = { ...existing, isActive: body.is_active ?? true };
      return new HttpResponse(null, { status: 204 });
    }
    return new HttpResponse(null, { status: 400 });
  }),
];
