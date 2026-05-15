import * as React from 'react';
import i18next from 'i18next';
import { telemetry } from '@shared/lib/observability';
import { Button } from '@shared/ui/primitives';
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
  retryCount: number;
}

export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true, retryCount: 0 };
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
          <span>
            {i18next.t('common.errorBoundary.sectionFailed', { label: this.props.label })}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              this.setState((s) => ({ hasError: false, retryCount: s.retryCount + 1 }));
            }}
          >
            {i18next.t('common.retry')}
          </Button>
        </div>
      );
    }
    return <React.Fragment key={this.state.retryCount}>{this.props.children}</React.Fragment>;
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
        <div className={styles.container} role="alert" aria-live="assertive">
          <h1>{i18next.t('common.errorBoundary.systemFailure')}</h1>
          <p>{i18next.t('common.errorBoundary.systemFailureDesc')}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.reload();
            }}
            className={styles.reload}
          >
            {i18next.t('common.errorBoundary.reloadApp')}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
