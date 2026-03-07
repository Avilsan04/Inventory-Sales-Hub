import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@core/config';
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors';

// Private instance, NEVER exported.
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true REMOVED. Only required for HttpOnly cookies, not Bearer JWT.
});

// Interceptor setup
setupRequestInterceptor(axiosInstance);
setupResponseInterceptor(axiosInstance, () => {
  // Safe cross-platform decoupling
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  } else {
    // For React Native, use a global event emitter or generic observer pattern
    // e.g., DeviceEventEmitter.emit('auth:unauthorized');
  }
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