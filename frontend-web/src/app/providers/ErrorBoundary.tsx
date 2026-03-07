import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // In a production environment, emit this to a logging service (e.g., Sentry, Datadog)
    console.error('Uncaught React Exception:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
          <h1>System Failure</h1>
          <p>The application encountered an irrecoverable error.</p>
          <button
            onClick={() => { window.location.reload(); }}
            style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}