import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { tokenStorage } from '../storage/tokenStorage';

export function setupRequestInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = tokenStorage.getToken();

      // Abstracting header injection safely
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    },
    (error: unknown) => {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );
}

export function setupResponseInterceptor(
  client: AxiosInstance,
  onUnauthorized: () => void
): void {
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        tokenStorage.removeToken();
        onUnauthorized();
      }
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );
}