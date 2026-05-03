import './axios.d';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

export function setupRequestInterceptor(
  client: AxiosInstance,
  getToken: () => string | null,
  getImpersonationToken: () => string | null = () => null,
  getTenantId: () => string | null = () => null
): number {
  return client.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = getToken();
      if (token !== null && token.trim().length > 0) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      const impersonationToken = getImpersonationToken();
      if (impersonationToken !== null) {
        config.headers.set('X-Impersonation-Token', impersonationToken);
      }
      const tenantId = getTenantId();
      if (tenantId !== null) {
        config.headers.set('X-Tenant-ID', tenantId);
      }
      return config;
    },
    (error: unknown) => {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> =
  [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error !== null) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

export function setupResponseInterceptor(
  client: AxiosInstance,
  onRefresh: () => Promise<string>,
  onUnauthorized: () => void
): number {
  return client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }

      const originalRequest = error.config;

      if (error.response?.status !== 401 || originalRequest?._retry === true) {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest) {
            originalRequest.headers.set('Authorization', `Bearer ${String(token)}`);
            return client(originalRequest);
          }
          return Promise.reject(new Error('No original request to retry'));
        });
      }

      if (originalRequest) {
        originalRequest._retry = true;
      }
      isRefreshing = true;

      try {
        const newToken = await onRefresh();
        processQueue(null, newToken);
        if (originalRequest) {
          originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
          return await client(originalRequest);
        }
        throw new Error('No original request to retry');
      } catch (refreshError) {
        processQueue(refreshError, null);
        onUnauthorized();
        throw refreshError instanceof Error ? refreshError : new Error(String(refreshError));
      } finally {
        isRefreshing = false;
      }
    }
  );
}
