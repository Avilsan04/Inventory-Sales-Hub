// why-did-you-render must be imported before React — dev only, tree-shaken in prod
import './wdyr';
import * as React from 'react';
import { AppRouter } from './router/AppRouter';
import { ThemeProvider, GlobalErrorBoundary, QueryProvider } from './providers';
import { DependencyProvider } from './providers/DependencyProvider';
import { Toaster } from '@shared/ui';
import { OfflineBanner } from '@shared/ui';
import { ViewModeProvider } from './providers/ViewModeContext';
import { startSalesSyncWorker } from '@features/sales';
import { SalesSyncBanner } from '@features/sales';

function AppContent(): React.ReactElement {
  React.useEffect(() => {
    const stop = startSalesSyncWorker();
    return (): void => {
      stop();
    };
  }, []);

  return (
    <ThemeProvider>
      <OfflineBanner />
      <SalesSyncBanner />
      <AppRouter />
      <Toaster />
    </ThemeProvider>
  );
}

export function App(): React.ReactElement {
  return (
    <GlobalErrorBoundary>
      <DependencyProvider>
        <QueryProvider>
          <ViewModeProvider>
            <AppContent />
          </ViewModeProvider>
        </QueryProvider>
      </DependencyProvider>
    </GlobalErrorBoundary>
  );
}
