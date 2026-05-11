import { QueryClient, onlineManager } from '@tanstack/react-query';
import { TIMING } from '@core/config/timing';
import { HttpError } from '@core/http/interceptors';

export { onlineManager };

// 4xx errors (except 408/429/503) are not retryable — server rejected the request
const isHardError = (error: unknown): boolean => {
  if (error instanceof HttpError) {
    return (
      error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429
    );
  }
  return false;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: TIMING.CACHE_STALE_MS,
      gcTime: TIMING.CACHE_GC_MS,
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: (count: number, error: unknown): boolean => !isHardError(error) && count < 4,
      retryDelay: (attempt: number): number =>
        Math.min(1000 * 2 ** attempt, TIMING.MAX_RETRY_DELAY_MS),
    },
  },
});

/** Removes only auth-scoped queries. Prefer this over queryClient.clear() on logout. */
export function clearAuthCache(): void {
  queryClient.removeQueries({ queryKey: ['auth'] });
}

/** Clears all cached queries. Call when tenant changes to prevent stale cross-tenant data. */
export function clearAllCache(): void {
  queryClient.clear();
}
