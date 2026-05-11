import * as React from 'react';
import { telemetry } from '@shared/lib/observability';
import styles from '@shared/styles/themes/components/ErrorBoundary.module.scss';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  label: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    telemetry.captureException(error, {
      label: this.props.label,
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.section} role="alert">
          <span>{this.props.label} failed to load.</span>
          <button
            className={styles.sectionRetry}
            onClick={() => {
              this.setState({ hasError: false });
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
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
    telemetry.captureException(error, { componentStack: errorInfo.componentStack ?? undefined });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <h1>System Failure</h1>
          <p>The application encountered an irrecoverable error.</p>
          <button
            onClick={() => {
              window.location.reload();
            }}
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
