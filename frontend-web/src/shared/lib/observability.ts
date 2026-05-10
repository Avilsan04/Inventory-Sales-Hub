import * as Sentry from '@sentry/react';
import { env } from '@core/config/env';
import { logger } from './logger';

// ── PII sanitization ─────────────────────────────────────────────────────────
// Fields that may contain Personally Identifiable Information (GDPR).
// Sanitize client-side before data leaves the browser (defense layer 1).
// Configure Sentry "Advanced Data Scrubbing" in the Sentry admin panel
// (Settings → Security & Privacy → Advanced Data Scrubbing) as layer 2.
const PII_KEYS = new Set([
  'email',
  'phone',
  'name',
  'firstName',
  'lastName',
  'customerName',
  'username',
  'password',
  'token',
  'address',
]);

function sanitizePII(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePII);
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    sanitized[key] = PII_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : sanitizePII(value);
  }
  return sanitized;
}

// ── Sentry initialization ────────────────────────────────────────────────────
const SENTRY_DSN = env.VITE_SENTRY_DSN;
const sentryEnabled = typeof SENTRY_DSN === 'string' && SENTRY_DSN.length > 0;

if (sentryEnabled) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: env.MODE,
    release: env.VITE_APP_VERSION ?? 'unknown',
    // Capture 100% of sessions in dev, 10% in production
    tracesSampleRate: env.MODE === 'production' ? 0.1 : 1.0,
    // Defense layer 1: sanitize PII before events leave the browser (GDPR)
    beforeSend(event) {
      const req = event.request;
      if (req != null && req.data != null) {
        req.data = sanitizePII(req.data) as typeof req.data;
      }
      if (event.extra != null) {
        event.extra = sanitizePII(event.extra) as typeof event.extra;
      }
      return event;
    },
  });
}

// ── Custom lightweight telemetry (fallback when Sentry is not configured) ────
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

export const telemetry = {
  captureException(error: Error, context?: TelemetryContext): void {
    if (sentryEnabled) {
      Sentry.captureException(error, { extra: context });
    } else {
      logger.error('[Telemetry] Uncaught exception', { error: error.message, ...context });
      sendTelemetry(baseEvent('exception', { message: error.message, ...context }));
    }
  },

  captureMessage(message: string, context?: TelemetryContext): void {
    if (sentryEnabled) {
      Sentry.captureMessage(message, { extra: context });
    } else {
      logger.warn('[Telemetry] ' + message, context);
      sendTelemetry(baseEvent('message', { message, ...context }));
    }
  },
} as const;

let rumStarted = false;

export function initRum(): void {
  if (rumStarted || typeof window === 'undefined') return;
  rumStarted = true;

  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav && !sentryEnabled) {
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

  if (!sentryEnabled && typeof PerformanceObserver !== 'undefined' && TELEMETRY_ENABLED) {
    const observe = (entryType: string, handler: (entry: PerformanceEntry) => void): void => {
      try {
        const obs = new PerformanceObserver((list) => {
          list.getEntries().forEach(handler);
        });
        obs.observe({ type: entryType, buffered: true });
      } catch {
        /* ignore unsupported entry types */
      }
    };

    observe('paint', (e) => {
      sendTelemetry(baseEvent('paint', { name: e.name, value: e.startTime }));
    });
    observe('largest-contentful-paint', (e) => {
      sendTelemetry(baseEvent('lcp', { value: e.startTime }));
    });
    observe('first-input', (e) => {
      const fi = e as PerformanceEventTiming;
      sendTelemetry(baseEvent('first-input', { delay: fi.processingStart - fi.startTime }));
    });
    observe('layout-shift', (e) => {
      const shift = e as PerformanceEntry & { value: number; hadRecentInput?: boolean };
      if (!shift.hadRecentInput) sendTelemetry(baseEvent('cls', { value: shift.value }));
    });
  }
}
