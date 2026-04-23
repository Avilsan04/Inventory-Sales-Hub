import * as React from 'react';
import styles from '@shared/styles/themes/components/ErrorBoundary.module.scss';

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
        <div className={styles.container}>
          <h1>System Failure</h1>
          <p>The application encountered an irrecoverable error.</p>
          <button
            onClick={() => { window.location.reload(); }}
            className={styles.reload}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
