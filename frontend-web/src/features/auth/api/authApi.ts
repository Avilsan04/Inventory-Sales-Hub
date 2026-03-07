import { httpClient } from '@core/http';
import type { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '../models';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // httpClient.post<T> directly returns T. It already unwrapped response.data.
    return await httpClient.post<LoginResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterRequest): Promise<UserResponse> => {
    return await httpClient.post<UserResponse>('/auth/register', data);
  },

  // Future method example
  logout: async (): Promise<void> => {
    await httpClient.post<unknown>('/auth/logout');
  }
};