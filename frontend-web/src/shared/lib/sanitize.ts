export function sanitizeInput(value: string): string {
    return value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&(?!lt;|gt;|amp;|quot;|#\d+;)/g, '&amp;')
        .trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const v = obj[key];
        result[key] = typeof v === 'string' ? sanitizeInput(v) : v;
    }
    return result as T;
}
