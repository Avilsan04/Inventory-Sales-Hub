import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { LoginResponse } from '../models';

export const authHandlers = [
    http.post(`${API_BASE_URL}/auth/login`, async () => {
        // Simulamos 1 segundo de latencia
        await delay(1000);

        const mockResponse: LoginResponse = {
            token: 'mock-jwt-token-777',
        };

        return HttpResponse.json(mockResponse);
    }),
];