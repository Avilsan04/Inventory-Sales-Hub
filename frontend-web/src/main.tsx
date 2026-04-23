import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import '@assets/styles/main.scss';
import './core/i18n';

async function bootstrapApplication(): Promise<void> {
  try {
    // Architecture Correction: Use Vite's native environment variables
    if (import.meta.env.DEV) {
      const { worker } = await import('./app/mock/browser');
      await worker.start({
        serviceWorker: {
          url: '/mockServiceWorker.js'
        },
        onUnhandledRequest: 'bypass'
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown bootstrap error';
    console.error('[Bootstrap Exception] Critical failure during application startup:', errorMessage);
    // Note: Do not block execution in DEV if mocking fails, unless strict simulation is required.
  }

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