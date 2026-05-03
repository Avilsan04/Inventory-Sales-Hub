import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  UserResponse,
  UserRole,
} from '../models';
import mockData from '@app/mock/mock-data.json';

type MockUserType = 'admin' | 'customer' | 'test' | 'company';

let _activeUser: MockUserType = 'admin';

const CREDENTIAL_MAP: Record<string, MockUserType> = {
  'admin@ish.dev': 'admin',
  'cliente@ish.dev': 'customer',
  'test@ish.dev': 'test',
};

const TOKEN_USER_MAP: Record<string, MockUserType> = {
  'mock-token-admin-001': 'admin',
  'mock-token-customer-002': 'customer',
  'mock-token-test-003': 'test',
  'mock-token-company-004': 'company',
};

const { auth } = mockData;

export const authHandlers = [
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    await delay(1000);
    const body = (await request.json()) as LoginRequest;
    _activeUser = CREDENTIAL_MAP[body.email] ?? 'admin';
    return HttpResponse.json<LoginResponse>({ token: auth.tokens[_activeUser] });
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    await delay(1000);
    const body = (await request.json()) as RegisterRequest;
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

  http.get(`${API_BASE_URL}/auth/me`, async ({ request }) => {
    await delay(400);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') ?? '';
    const resolvedUser: MockUserType = TOKEN_USER_MAP[token] ?? _activeUser;
    const baseProfile = auth.profiles[resolvedUser] as UserProfile;
    const storedRole = localStorage.getItem('TEST_MODE_ROLE') as UserRole | null;
    const profile: UserProfile = storedRole ? { ...baseProfile, role: storedRole } : baseProfile;
    return HttpResponse.json<UserProfile>(profile);
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
    const body = (await request.json()) as Partial<UserProfile>;
    const current = auth.profiles[_activeUser];
    return HttpResponse.json<UserProfile>({
      ...(current as UserProfile),
      username: body.username ?? current.username,
      email: body.email ?? current.email,
    });
  }),

  http.patch(`${API_BASE_URL}/auth/me/password`, async () => {
    await delay(500);
    return new HttpResponse(null, { status: 204 });
  }),
];
