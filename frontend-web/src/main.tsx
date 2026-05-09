import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { env } from './core/config/env';
import { bootstrapAuth } from './features/auth/lib/bootstrapAuth';
import { initRum } from './shared/lib/observability';
import '@assets/styles/main.scss';
import './core/i18n';

async function bootstrapApplication(): Promise<void> {
  try {
    if (env.VITE_MOCK_ENABLED || import.meta.env.DEV) {
      const { worker } = await import('./app/mock/browser');
      const { seed } = await import('./app/mock/seed');
      const { db } = await import('./app/mock/db');
      await seed(db);
      await worker.start({
        serviceWorker: { url: '/mockServiceWorker.js' },
        onUnhandledRequest: 'bypass',
      });
    } else {
      // Production: register real Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          /* SW optional in prod */
        });
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown bootstrap error';
    console.error('[Bootstrap] Critical failure during startup:', errorMessage);
  }

  initRum();

  // Attempt silent token refresh before mounting the React tree.
  // This ensures ProtectedRoute sees a valid token after a hard page refresh.
  await bootstrapAuth();

  const container = document.getElementById('root');

  if (!container) {
    throw new Error('[Architecture Violation] Root container missing in index.html');
  }

  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

void bootstrapApplication();
