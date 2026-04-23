import { QueryClient } from '@tanstack/react-query';

// Enterprise-grade cache configuration
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: true,
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 15,
        },
        mutations: {
            retry: 0
        },
    },
});