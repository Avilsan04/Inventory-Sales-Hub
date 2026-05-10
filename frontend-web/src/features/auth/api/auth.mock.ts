import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  UserResponse,
} from '../models';
import mockData from '@app/mock/mock-data.json';

type MockUserType = 'admin' | 'customer' | 'test' | 'company';

const STORAGE_SESSION_KEY = 'mock-session-user';

function persistSession(user: MockUserType): void {
  localStorage.setItem(STORAGE_SESSION_KEY, user);
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_SESSION_KEY);
}

function getPersistedSession(): MockUserType | null {
  return localStorage.getItem(STORAGE_SESSION_KEY) as MockUserType | null;
}

// Restore session from localStorage so refresh survives page reloads.
let _activeUser: MockUserType = getPersistedSession() ?? 'admin';
let _isLoggedIn: boolean = getPersistedSession() !== null;

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
    const userType = CREDENTIAL_MAP[body.email];
    if (!userType) {
      return new HttpResponse(null, { status: 401 });
    }
    _activeUser = userType;
    _isLoggedIn = true;
    persistSession(_activeUser);
    return HttpResponse.json<LoginResponse>({ token: auth.tokens[_activeUser] });
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    await delay(1000);
    const body = (await request.json()) as RegisterRequest;
    const roleMap: Partial<Record<string, MockUserType>> = { admin: 'admin', company: 'company' };
    const profileKey: MockUserType = roleMap[body.role ?? ''] ?? 'customer';
    const profile = auth.profiles[profileKey];
    _activeUser = profileKey;
    _isLoggedIn = true;
    persistSession(_activeUser);
    return HttpResponse.json<UserResponse>({
      id: profile.id,
      username: body.username,
      email: body.email,
      token: auth.tokens[profileKey],
    });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, async () => {
    await delay(300);
    _isLoggedIn = false;
    clearSession();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_BASE_URL}/auth/me`, async ({ request }) => {
    await delay(400);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') ?? '';
    const resolvedUser: MockUserType = TOKEN_USER_MAP[token] ?? _activeUser;
    const profile = auth.profiles[resolvedUser] as UserProfile;
    return HttpResponse.json<UserProfile>(profile);
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, async () => {
    await delay(300);
    if (!_isLoggedIn) {
      return new HttpResponse(null, { status: 401 });
    }
    // Return the actual user token so it's valid in TOKEN_USER_MAP / requirePermission checks.
    return HttpResponse.json<LoginResponse>({ token: auth.tokens[_activeUser] });
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
