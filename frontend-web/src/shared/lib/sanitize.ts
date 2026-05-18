// Pre-compiled regex patterns — avoid recompilation on every call
const RE_LT = /</g;
const RE_GT = />/g;
// Matches & not already part of an HTML entity (decimal, hex, or named)
const RE_AMP = /&(?!lt;|gt;|amp;|quot;|#(?:\d+|x[\da-fA-F]+);)/g;

// Encodes HTML special characters to prevent injection when rendering as text.
// NOT a full XSS sanitizer — do not use with dangerouslySetInnerHTML.
export function encodeHtmlEntities(value: string): string {
  return value.replace(RE_LT, '&lt;').replace(RE_GT, '&gt;').replace(RE_AMP, '&amp;').trim();
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
