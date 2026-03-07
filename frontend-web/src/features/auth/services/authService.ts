import { authApi } from '../api/authApi';
import type { LoginRequest } from '../models/auth.types';
import { tokenStorage } from '@core/storage/tokenStorage';

export const authService = {
  login: async (credentials: LoginRequest, rememberMe: boolean): Promise<void> => {
    const response = await authApi.login(credentials);
    tokenStorage.saveToken(response.token, rememberMe);
  },

  logout: (): void => {
    tokenStorage.removeToken();
    // Here you would also call the API logout endpoint if required
  }
};