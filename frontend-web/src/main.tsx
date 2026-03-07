import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import '@assets/styles/main.scss';
import './core/i18n';

// Defer React mounting until MSW is ready in development mode
async function enableMocking(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./app/mock/browser');
  await worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js'
    },
    onUnhandledRequest: 'bypass'
  });
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container missing in index.html');
}

const root = createRoot(container);

// Initialize mocks, THEN render the application
void enableMocking().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});