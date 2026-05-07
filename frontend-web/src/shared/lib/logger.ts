const noop = (): void => undefined;

const isDev = !import.meta.env.PROD;

export const logger = {
  warn: isDev ? console.warn.bind(console) : noop,
  error: isDev ? console.error.bind(console) : noop,
} as const;
