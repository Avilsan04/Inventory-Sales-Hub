const isProd = import.meta.env.PROD;

function makeLogger(
  level: 'debug' | 'info' | 'warn' | 'error',
  fn: (...args: unknown[]) => void,
  enabledInProd: boolean
) {
  return (message: string, context?: unknown): void => {
    if (isProd && !enabledInProd) return;
    if (context !== undefined) {
      fn(`[${level.toUpperCase()}] ${message}`, context);
    } else {
      fn(`[${level.toUpperCase()}] ${message}`);
    }
  };
}

export const logger = {
  debug: makeLogger('debug', console.debug.bind(console), false),
  info: makeLogger('info', console.info.bind(console), false),
  warn: makeLogger('warn', console.warn.bind(console), true),
  error: makeLogger('error', console.error.bind(console), true),
} as const;
