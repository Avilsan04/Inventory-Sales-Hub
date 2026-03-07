import * as React from 'react';
import { AppRouter } from './router/AppRouter';
import { ThemeProvider } from './providers/ThemeProvider';
import { GlobalErrorBoundary } from './providers/ErrorBoundary';
import { Toaster } from '@shared/ui/composed/Toaster';

export function App(): React.ReactElement {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <AppRouter />
        <Toaster />
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}