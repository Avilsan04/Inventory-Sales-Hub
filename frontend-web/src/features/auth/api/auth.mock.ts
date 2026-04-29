import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { LoginRequest, LoginResponse, RegisterRequest, UserProfile, UserResponse } from '../models';
import mockData from '@app/mock/mock-data.json';

type MockUserType = 'admin' | 'customer' | 'test' | 'company';

let _activeUser: MockUserType = 'admin';

const CREDENTIAL_MAP: Record<string, MockUserType> = {
    'admin@ish.dev':   'admin',
    'cliente@ish.dev': 'customer',
    'test@ish.dev':    'test',
};

const { auth } = mockData;

export const authHandlers = [
    http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
        await delay(1000);
        const body = await request.json() as LoginRequest;
        _activeUser = CREDENTIAL_MAP[body.email] ?? 'admin';
        return HttpResponse.json<LoginResponse>({ token: auth.tokens[_activeUser] });
    }),

    http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
        await delay(1000);
        const body = await request.json() as RegisterRequest;
        const roleMap: Partial<Record<string, MockUserType>> = { admin: 'admin', company: 'company' };
        const profileKey: MockUserType = roleMap[body.role ?? ''] ?? 'customer';
        const profile = auth.profiles[profileKey];
        _activeUser = profileKey;
        return HttpResponse.json<UserResponse>({
            id: profile.id,
            username: body.username,
            email: body.email,
            token: auth.tokens[profileKey],
        });
    }),

    http.post(`${API_BASE_URL}/auth/logout`, async () => {
        await delay(300);
        return new HttpResponse(null, { status: 204 });
    }),

    http.get(`${API_BASE_URL}/auth/me`, async () => {
        await delay(400);
        return HttpResponse.json<UserProfile>(auth.profiles[_activeUser] as UserProfile);
    }),

    http.post(`${API_BASE_URL}/auth/refresh`, async () => {
        await delay(300);
        return HttpResponse.json<LoginResponse>({ token: auth.refreshToken });
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
        const current = auth.profiles[_activeUser];
        return HttpResponse.json<UserProfile>({
            ...current as UserProfile,
            username: body.username ?? current.username,
            email: body.email ?? current.email,
        });
    }),

    http.patch(`${API_BASE_URL}/auth/me/password`, async () => {
        await delay(500);
        return new HttpResponse(null, { status: 204 });
    }),
];
