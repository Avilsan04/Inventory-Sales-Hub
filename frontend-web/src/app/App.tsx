import * as React from 'react';
import { AppRouter } from './router/AppRouter';
import { ThemeProvider, GlobalErrorBoundary, QueryProvider } from './providers';
import { Toaster } from '@shared/ui/composed/Toaster';

export function App(): React.ReactElement {
  return (
    <GlobalErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AppRouter />
          <Toaster />
        </ThemeProvider>
      </QueryProvider>
    </GlobalErrorBoundary>
  );
}