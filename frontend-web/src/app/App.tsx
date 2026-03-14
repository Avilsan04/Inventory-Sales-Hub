import * as React from 'react';
import { AppRouter } from './router/AppRouter';
import { ThemeProvider, GlobalErrorBoundary, QueryProvider } from './providers';
import { DependencyProvider } from './providers/DependencyProvider';
import { Toaster } from '@shared/ui/composed/Toaster';

export function App(): React.ReactElement {
  return (
    <GlobalErrorBoundary>
      <DependencyProvider>
        <QueryProvider>
          <ThemeProvider>
            <AppRouter />
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </DependencyProvider>
    </GlobalErrorBoundary>
  );
}