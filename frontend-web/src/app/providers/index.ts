// Strictly export ONLY the providers. Hooks MUST be imported directly from @shared by the consumers.
export { ThemeProvider } from './ThemeProvider';
// If you implemented the GlobalErrorBoundary from the previous audit, export it here too:
export { GlobalErrorBoundary } from './ErrorBoundary';