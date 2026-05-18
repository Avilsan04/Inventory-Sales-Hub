import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@core/config';
import { tokenStorage } from '../storage/tokenStorage';
import { tenantStorage } from '../storage/tenantStorage';
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors';
import type { HttpClient, HttpRequestConfig } from './http.types';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // forwards HttpOnly refresh_token cookie on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor registered at module init so bootstrapAuth() (which runs before React
// mounts) can attach the Authorization header when calling /auth/me after a silent refresh.
setupRequestInterceptor(
  axiosInstance,
  () => tokenStorage.getToken(),
  () => {
    // Client sends the token as-is; backend validates signature and expiry.
    // No client-side JWT payload inspection — trust the server.
    try {
      const raw = sessionStorage.getItem('ish.impersonation');
      if (!raw) return null;
      const session = JSON.parse(raw) as { token?: string };
      return session.token ?? null;
    } catch {
      return null;
    }
  },
  () => tenantStorage.getTenantId()
);

const mapConfig = (config?: HttpRequestConfig): AxiosRequestConfig => ({
  headers: config?.headers,
  params: config?.params,
  signal: config?.signal,
});

// Only sets up the response interceptor (401 handler + token refresh).
// Kept in a React provider because the onUnauthorized callback needs React Router context.
export const setupHttpEvents = (onUnauthorized: () => void): (() => void) => {
  const resInterceptorId = setupResponseInterceptor(
    axiosInstance,
    async () => {
      // Browser automatically sends the HttpOnly refresh_token cookie here
      const response = await axiosInstance.post<{ accessToken: string }>('/auth/refresh');
      const newToken = response.data.accessToken;
      tokenStorage.saveToken(newToken);
      return newToken;
    },
    () => {
      tokenStorage.removeToken();
      onUnauthorized();
    }
  );

  return (): void => {
    axiosInstance.interceptors.response.eject(resInterceptorId);
  };
};

export const httpClient: HttpClient = {
  get: async <T>(url: string, config?: HttpRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, mapConfig(config));
    return response.data;
  },

  post: async <T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, mapConfig(config));
    return response.data;
  },

  put: async <T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, mapConfig(config));
    return response.data;
  },

  patch: async <T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, mapConfig(config));
    return response.data;
  },

  delete: async <T>(url: string, config?: HttpRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, mapConfig(config));
    return response.data;
  },
};
