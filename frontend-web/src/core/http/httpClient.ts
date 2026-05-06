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

const mapConfig = (config?: HttpRequestConfig): AxiosRequestConfig => ({
  headers: config?.headers,
  params: config?.params,
  signal: config?.signal,
});

export const setupHttpEvents = (onUnauthorized: () => void): (() => void) => {
  const reqInterceptorId = setupRequestInterceptor(
    axiosInstance,
    () => tokenStorage.getToken(),
    () => sessionStorage.getItem('impersonation_token'),
    () => tenantStorage.getTenantId()
  );

  const resInterceptorId = setupResponseInterceptor(
    axiosInstance,
    async () => {
      // Browser automatically sends the HttpOnly refresh_token cookie here
      const response = await axiosInstance.post<{ token: string }>('/auth/refresh');
      const newToken = response.data.token;
      tokenStorage.saveToken(newToken);
      return newToken;
    },
    () => {
      tokenStorage.removeToken();
      onUnauthorized();
    }
  );

  return (): void => {
    axiosInstance.interceptors.request.eject(reqInterceptorId);
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
