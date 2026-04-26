import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Category, Product } from '@entities/product';
import mockData from '@app/mock/mock-data.json';

const mockCategories: Category[] = [...mockData.productCategories] as Category[];
const mockProducts: Product[] = [...mockData.products] as Product[];

export const productHandlers = [
    http.get(`${API_BASE_URL}/products/categories`, async () => {
        await delay(400);
        return HttpResponse.json(mockCategories);
    }),

    http.post(`${API_BASE_URL}/products/categories`, async ({ request }) => {
        await delay(500);
        const body = await request.json() as Partial<Category>;
        return HttpResponse.json<Category>(
            { id: crypto.randomUUID(), name: body.name ?? 'Nueva categoría', description: body.description },
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
        const newProduct: Product = {
            id: crypto.randomUUID(),
            sku: body.sku ?? 'SKU-NEW',
            name: body.name ?? 'Nuevo producto',
            description: body.description,
            price: body.price ?? 0,
            currency: body.currency ?? 'EUR',
            categoryId: body.categoryId,
            createdAt: now,
            updatedAt: now,
        };
        mockProducts.push(newProduct);
        return HttpResponse.json<Product>(newProduct, { status: 201 });
    }),

    http.put(`${API_BASE_URL}/products/:id`, async ({ params, request }) => {
        await delay(500);
        const body = await request.json() as Partial<Product>;
        const idx = mockProducts.findIndex((p) => p.id === params['id']);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const existing = mockProducts[idx];
        if (existing === undefined) return new HttpResponse(null, { status: 404 });
        const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
        mockProducts[idx] = updated;
        return HttpResponse.json(updated);
    }),

    http.delete(`${API_BASE_URL}/products/:id`, async () => {
        await delay(400);
        return new HttpResponse(null, { status: 204 });
    }),
];
