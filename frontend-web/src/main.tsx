import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global styles and core configurations
import '@assets/styles/main.scss';
import '@core/i18n';

// Absolute alias import to enforce consistency
import { App } from '@app/App';

const rootElement = document.getElementById('root');

// Fail-Fast Pattern: Do not fail silently
if (!rootElement) {
  throw new Error('Fatal: Root container element not found. Application cannot mount.');
}

// Global unhandled promise listener (Security/Telemetry layer)
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // Implementation note: Push to telemetry service here
});

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);