import * as React from 'react';
import { AppRouter } from './router/AppRouter';
import { ThemeProvider, GlobalErrorBoundary, QueryProvider } from './providers';
import { DependencyProvider } from './providers/DependencyProvider';
import { Toaster } from '@shared/ui/composed/Toaster';
import { ViewModeProvider } from '@features/auth/context/ViewModeContext';

export function App(): React.ReactElement {
  return (
    <GlobalErrorBoundary>
      <DependencyProvider>
        <QueryProvider>
          <ViewModeProvider>
            <ThemeProvider>
              <AppRouter />
              <Toaster />
            </ThemeProvider>
          </ViewModeProvider>
        </QueryProvider>
      </DependencyProvider>
    </GlobalErrorBoundary>
  );
}