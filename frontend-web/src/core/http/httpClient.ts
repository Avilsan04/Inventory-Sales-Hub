import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@core/config';
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors';
import type { HttpClient, HttpRequestConfig } from './http.types';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mapConfig = (config?: HttpRequestConfig): AxiosRequestConfig => ({
  headers: config?.headers,
  params: config?.params,
  signal: config?.signal,
});

export const setupHttpEvents = (onUnauthorized: () => void): void => {
  setupRequestInterceptor(axiosInstance);
  setupResponseInterceptor(axiosInstance, onUnauthorized);
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

  delete: async <T>(url: string, config?: HttpRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, mapConfig(config));
    return response.data;
  },
};