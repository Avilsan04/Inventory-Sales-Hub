// src/core/http/interceptors.ts
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { tokenStorage } from '../storage/tokenStorage'; // Path must point to the namespace object

export function setupRequestInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      try {
        const token = await tokenStorage.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      } catch (error) {
        // Log secure storage failure if necessary, but reject the request
        return Promise.reject(error);
      }
    },
    (error: unknown) => Promise.reject(error)
  );
}

export function setupResponseInterceptor(
  client: AxiosInstance,
  onUnauthorized: () => void
): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          await tokenStorage.removeToken();
        } finally {
          // Regardless of storage deletion success, force UI logout flow
          onUnauthorized();
        }
      }
      return Promise.reject(error);
    }
  );
}