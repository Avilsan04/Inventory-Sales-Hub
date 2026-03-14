import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { LoginResponse, UserResponse } from '../models';

export const authHandlers = [
    http.post(`${API_BASE_URL}/auth/login`, async () => {
        await delay(1000);

        const mockResponse: LoginResponse = {
            token: 'mock-jwt-token-777',
        };

        return HttpResponse.json(mockResponse);
    }),

    http.post(`${API_BASE_URL}/auth/register`, async () => {
        await delay(1000);

        const mockResponse: UserResponse = {
            id: 1,
            username: 'mockuser',
            email: 'mock@example.com',
            token: 'mock-register-jwt-token-888',
        };

        return HttpResponse.json(mockResponse);
    }),
];