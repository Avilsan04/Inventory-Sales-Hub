/**
 * Converts a snake_case string to camelCase.
 * e.g. "is_active" → "isActive", "last_updated_at" → "lastUpdatedAt"
 */
export function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

/**
 * Recursively maps all object keys from snake_case to camelCase.
 * Handles nested objects and arrays.
 * Use before Zod parsing when the backend returns snake_case JSON.
 */
export function mapKeysCamel<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(mapKeysCamel) as T;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        toCamelCase(k),
        mapKeysCamel(v),
      ])
    ) as T;
  }
  return value;
}
