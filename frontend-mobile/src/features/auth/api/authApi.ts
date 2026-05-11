import { httpClient } from '@core/http';
import { ENABLE_MOCK, mockUser } from '@core/mock/mockData';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserProfile } from '../models';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    if (ENABLE_MOCK) {
      await new Promise(r => setTimeout(r, 800));
      if (!credentials.email || !credentials.password) {
        throw new Error('Credenciales incorrectas');
      }
      return { accessToken: mockUser.token, refreshToken: 'mock-refresh-token' };
    }
    return await httpClient.post<LoginResponse>('/api/auth/login', credentials);
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    if (ENABLE_MOCK) {
      await new Promise(r => setTimeout(r, 800));
      return {
        id: mockUser.id,
        username: data.username,
        email: data.email,
        accessToken: mockUser.token,
        refreshToken: 'mock-refresh-token',
      };
    }
    return await httpClient.post<RegisterResponse>('/api/auth/register', data);
  },

  getMe: async (): Promise<UserProfile> => {
    if (ENABLE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      return { id: mockUser.id, username: mockUser.username, email: mockUser.email };
    }
    return await httpClient.get<UserProfile>('/api/auth/me');
  },

  logout: async (refreshToken: string): Promise<void> => {
    if (ENABLE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return;
    }
    return await httpClient.post<void>('/api/auth/logout', { refreshToken });
  },
};
