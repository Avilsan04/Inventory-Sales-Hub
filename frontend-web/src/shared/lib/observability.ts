import { env } from '@core/config/env';
import { logger } from './logger';

interface TelemetryContext {
  componentStack?: string;
  [key: string]: unknown;
}

interface TelemetryEvent {
  type: string;
  ts: number;
  sessionId: string;
  page: string;
  appVersion?: string;
  data?: Record<string, unknown>;
}

const TELEMETRY_URL = env.VITE_TELEMETRY_URL;
const TELEMETRY_ENABLED = typeof TELEMETRY_URL === 'string' && TELEMETRY_URL.length > 0;

const SESSION_ID = ((): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
})();

function sendTelemetry(payload: TelemetryEvent): void {
  if (!TELEMETRY_ENABLED || typeof window === 'undefined') return;
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(TELEMETRY_URL, body);
      return;
    }
  } catch {
    // Fall through to fetch
  }
  void fetch(TELEMETRY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  });
}

function baseEvent(type: string, data?: Record<string, unknown>): TelemetryEvent {
  return {
    type,
    ts: Date.now(),
    sessionId: SESSION_ID,
    page: typeof window !== 'undefined' ? window.location.pathname : 'server',
    appVersion: env.VITE_APP_VERSION,
    data,
  };
}

/**
 * Thin telemetry adapter.
 * Replace the stub bodies with Sentry/Datadog calls when API keys are available:
 *   import * as Sentry from '@sentry/react';
 *   captureException: (e, ctx) => Sentry.captureException(e, { extra: ctx }),
 */
export const telemetry = {
  captureException(error: Error, context?: TelemetryContext): void {
    logger.error('[Telemetry] Uncaught exception', { error: error.message, ...context });
    sendTelemetry(baseEvent('exception', { message: error.message, ...context }));
  },

  captureMessage(message: string, context?: TelemetryContext): void {
    logger.warn('[Telemetry] ' + message, context);
    sendTelemetry(baseEvent('message', { message, ...context }));
  },
} as const;

let rumStarted = false;

/** Starts lightweight RUM/perf telemetry when VITE_TELEMETRY_URL is configured. */
export function initRum(): void {
  if (rumStarted || !TELEMETRY_ENABLED || typeof window === 'undefined') return;
  rumStarted = true;

  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav) {
      sendTelemetry(
        baseEvent('navigation', {
          ttfb: nav.responseStart,
          domContentLoaded: nav.domContentLoadedEventEnd,
          load: nav.loadEventEnd,
          transferSize: nav.transferSize,
        })
      );
    }
  } catch {
    // ignore
  }

  if (typeof PerformanceObserver === 'undefined') return;

  const observe = (entryType: string, handler: (entry: PerformanceEntry) => void): void => {
    try {
      const obs = new PerformanceObserver((list) => {
        list.getEntries().forEach(handler);
      });
      obs.observe({ type: entryType, buffered: true });
    } catch {
      // ignore unsupported entry types
    }
  };

  observe('paint', (entry) => {
    sendTelemetry(baseEvent('paint', { name: entry.name, value: entry.startTime }));
  });

  observe('largest-contentful-paint', (entry) => {
    sendTelemetry(baseEvent('lcp', { value: entry.startTime }));
  });

  observe('first-input', (entry) => {
    const firstInput = entry as PerformanceEventTiming;
    sendTelemetry(
      baseEvent('first-input', { delay: firstInput.processingStart - firstInput.startTime })
    );
  });

  observe('layout-shift', (entry) => {
    const shift = entry as PerformanceEntry & { value: number; hadRecentInput?: boolean };
    if (shift.hadRecentInput) return;
    sendTelemetry(baseEvent('cls', { value: shift.value }));
  });
}
