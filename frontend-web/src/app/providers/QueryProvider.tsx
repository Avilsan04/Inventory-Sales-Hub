import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@core/api/queryClient';

interface QueryProviderProps {
    children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps): React.ReactElement {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}