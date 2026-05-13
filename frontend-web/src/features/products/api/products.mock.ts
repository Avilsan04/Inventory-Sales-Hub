import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import mockData from '@app/mock/mock-data.json';

const baseCategories = [...mockData.productCategories];
const baseProducts = [...mockData.products];

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
    const body = (await request.json()) as Record<string, unknown>;
    const created = {
      id: categories.length + 1,
      name: (body['name'] as string | undefined) ?? 'Nueva categoría',
      description: (body['description'] as string | undefined) ?? null,
    };
    categories.push(created as (typeof baseCategories)[0]);
    return HttpResponse.json(created, { status: 201 });
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
    const item = products.find((p) => String(p.id) === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/products`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'create:product');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const products = getTenantBucket(tenantId, 'products', () => baseProducts);
    const body = (await request.json()) as Record<string, unknown>;
    const salePrice = (body['salePrice'] as number | undefined) ?? 0;
    const newProduct = {
      id: products.length + 1,
      sku: (body['sku'] as string | undefined) ?? 'SKU-NEW',
      name: (body['name'] as string | undefined) ?? 'Nuevo producto',
      description: (body['description'] as string | undefined) ?? null,
      purchasePrice: (body['purchasePrice'] as number | undefined) ?? Math.round(salePrice * 0.75),
      salePrice,
      category: (body['category'] as Record<string, unknown> | undefined) ?? null,
      supplierId: (body['supplierId'] as number | undefined) ?? null,
      supplierName: null,
      isActive: true,
    };
    products.push(newProduct as (typeof baseProducts)[0]);
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/products/:id`, async ({ params, request }) => {
    await delay(500);
    const denied = requirePermission(request, 'create:product');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const products = getTenantBucket(tenantId, 'products', () => baseProducts);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = products.findIndex((p) => String(p.id) === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = products[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, ...body };
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
    const idx = products.findIndex((p) => String(p.id) === params['id']);
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
