import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@core/api/queryClient';

export function QueryProvider({ children }: React.PropsWithChildren): React.ReactElement {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}