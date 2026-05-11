// Encodes HTML special characters to prevent injection when rendering as text.
// NOT a full XSS sanitizer — do not use with dangerouslySetInnerHTML.
export function encodeHtmlEntities(value: string): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&(?!lt;|gt;|amp;|quot;|#\d+;)/g, '&amp;')
    .trim();
}

export function encodeObjectValues<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    result[key] = typeof v === 'string' ? encodeHtmlEntities(v) : v;
  }
  return result as T;
}

// Backward-compat aliases — prefer the explicit names above
export const sanitizeInput = encodeHtmlEntities;
export const sanitizeObject = encodeObjectValues;
