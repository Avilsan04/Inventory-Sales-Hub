import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

export function setupRequestInterceptor(
  client: AxiosInstance,
  getToken: () => string | null
): number {
  return client.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = getToken();
      if (token !== null && token.trim().length > 0) {
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
): number {
  return client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        onUnauthorized();
      }
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );
}