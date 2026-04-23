import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { LoginResponse, UserProfile, UserResponse } from '../models';

export const authHandlers = [
    http.post(`${API_BASE_URL}/auth/login`, async () => {
        await delay(1000);
        return HttpResponse.json<LoginResponse>({ token: 'mock-jwt-token-777' });
    }),

    http.post(`${API_BASE_URL}/auth/register`, async () => {
        await delay(1000);
        return HttpResponse.json<UserResponse>({
            id: 1,
            username: 'mockuser',
            email: 'mock@example.com',
            token: 'mock-register-jwt-token-888',
        });
    }),

    http.post(`${API_BASE_URL}/auth/logout`, async () => {
        await delay(300);
        return new HttpResponse(null, { status: 204 });
    }),

    http.get(`${API_BASE_URL}/auth/me`, async () => {
        await delay(400);
        return HttpResponse.json<UserProfile>({
            id: 1,
            username: 'mockuser',
            email: 'mock@example.com',
            role: 'admin',
            createdAt: '2025-01-01T00:00:00.000Z',
        });
    }),

    http.post(`${API_BASE_URL}/auth/refresh`, async () => {
        await delay(300);
        return HttpResponse.json<LoginResponse>({ token: 'mock-refreshed-jwt-token-999' });
    }),

    http.post(`${API_BASE_URL}/auth/forgot-password`, async () => {
        await delay(800);
        return new HttpResponse(null, { status: 204 });
    }),

    http.post(`${API_BASE_URL}/auth/reset-password`, async () => {
        await delay(800);
        return new HttpResponse(null, { status: 204 });
    }),

    http.patch(`${API_BASE_URL}/auth/me`, async ({ request }) => {
        await delay(500);
        const body = await request.json() as Partial<UserProfile>;
        return HttpResponse.json<UserProfile>({
            id: 1,
            username: body.username ?? 'mockuser',
            email: body.email ?? 'mock@example.com',
            role: 'admin',
            createdAt: '2025-01-01T00:00:00.000Z',
        });
    }),

    http.patch(`${API_BASE_URL}/auth/me/password`, async () => {
        await delay(500);
        return new HttpResponse(null, { status: 204 });
    }),
];