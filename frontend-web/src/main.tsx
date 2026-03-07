import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@assets/styles/main.scss';
import App from './app/App';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
