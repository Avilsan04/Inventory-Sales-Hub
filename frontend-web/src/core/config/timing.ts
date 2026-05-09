export const TIMING = {
  CACHE_STALE_MS: 5 * 60 * 1000,
  CACHE_GC_MS: 15 * 60 * 1000,
  MAX_RETRY_DELAY_MS: 30_000,
  TOAST_DISPLAY_MS: 5_000,
  /** User profile TTL — re-fetched after 10 minutes so permissions stay fresh. */
  USER_PROFILE_STALE_MS: 10 * 60 * 1000,
} as const;
