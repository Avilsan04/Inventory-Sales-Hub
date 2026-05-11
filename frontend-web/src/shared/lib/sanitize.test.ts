import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeObject } from './sanitize';

describe('sanitizeInput', () => {
    it('escapes < and > together', () => {
        expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes < in tag with slash', () => {
        expect(sanitizeInput('</script>')).toBe('&lt;/script&gt;');
    });

    it('trims leading and trailing whitespace', () => {
        expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('leaves safe strings unchanged', () => {
        expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
    });

    it('handles empty string', () => {
        expect(sanitizeInput('')).toBe('');
    });

    it('escapes bare & not part of entity', () => {
        expect(sanitizeInput('a & b')).toBe('a &amp; b');
    });

    it('preserves existing HTML entities', () => {
        expect(sanitizeInput('&lt;already&gt;')).toBe('&lt;already&gt;');
    });
});

describe('sanitizeObject', () => {
    it('sanitizes string values and leaves non-strings intact', () => {
        const input = { name: '<b>Test</b>', age: 30, active: true };
        const result = sanitizeObject(input);
        expect(result.name).toBe('&lt;b&gt;Test&lt;/b&gt;');
        expect(result.age).toBe(30);
        expect(result.active).toBe(true);
    });

    it('handles empty object', () => {
        expect(sanitizeObject({})).toEqual({});
    });
});
