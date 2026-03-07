import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { DeviceEventEmitter } from 'react-native';
import { API_BASE_URL } from '@core/config';
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors';

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

// Private instance, NEVER exported.
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor setup
setupRequestInterceptor(axiosInstance);
setupResponseInterceptor(axiosInstance, () => {
  DeviceEventEmitter.emit(AUTH_UNAUTHORIZED_EVENT);
});

// Strict API Contract: The application only knows about these generic methods.
export const httpClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },
  
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },
  
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },
  
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },
};