import { QueryClient, onlineManager } from '@tanstack/react-query';
import { TIMING } from '@core/config/timing';

export { onlineManager };

// 4xx errors (except 408/429/503) are not retryable — server rejected the request
const isHardError = (error: unknown): boolean => {
  if (error instanceof Error && 'status' in error) {
    const status = (error as Error & { status: number }).status;
    return status >= 400 && status < 500 && status !== 408 && status !== 429;
  }
  return false;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
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

export function clearAuthCache(): void {
  queryClient.removeQueries();
}
