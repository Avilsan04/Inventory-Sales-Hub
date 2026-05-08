import './axios.d';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

function toHttpError(error: AxiosError): HttpError {
  return new HttpError(error.message, error.response?.status ?? 0);
}

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

const MAX_QUEUE_SIZE = 20;
const QUEUE_TIMEOUT_MS = 10_000;

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason: Error) => void }> = [];

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function processQueue(error: unknown, token: string | null = null): void {
  const rejection = error === null ? null : normalizeError(error);
  failedQueue.forEach(({ resolve, reject }) => {
    if (rejection !== null) {
      reject(rejection);
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
        return Promise.reject(toHttpError(error));
      }

      if (isRefreshing) {
        if (failedQueue.length >= MAX_QUEUE_SIZE) {
          return Promise.reject(
            new Error('Token refresh queue overflow — too many concurrent requests.')
          );
        }
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error('Token refresh queue timeout.'));
          }, QUEUE_TIMEOUT_MS);
          failedQueue.push({
            resolve: (value) => {
              clearTimeout(timer);
              resolve(value);
            },
            reject: (reason) => {
              clearTimeout(timer);
              reject(reason);
            },
          });
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
        throw new HttpError('No original request to retry', 0);
      } catch (refreshError) {
        processQueue(refreshError, null);
        onUnauthorized();
        throw refreshError instanceof HttpError
          ? refreshError
          : new HttpError(
              refreshError instanceof Error ? refreshError.message : String(refreshError),
              401
            );
      } finally {
        isRefreshing = false;
      }
    }
  );
}
