import { describe, it, expect } from 'vitest';
import {
  formatOrderId,
  formatDate,
  formatDatetime,
  formatDateLocale,
  formatTimeLocale,
  formatDatetimeLocale,
  initials,
} from '../../src/shared/lib/formatters';

describe('formatOrderId', () => {
  it('formats a UUID-like string to uppercase first 8 chars with # prefix', () => {
    expect(formatOrderId('abcd1234-ef56-7890')).toBe('#ABCD1234');
  });

  it('handles short ids without crashing', () => {
    expect(formatOrderId('abc')).toBe('#ABC');
  });

  it('preserves ORD- prefixed ids as-is with # prefix', () => {
    expect(formatOrderId('ORD-2026-001')).toBe('#ORD-2026-001');
  });
});

describe('formatDate', () => {
  it('formats ISO string to a string containing the year', () => {
    const result = formatDate('2026-01-15T12:00:00Z');
    expect(result).toContain('2026');
  });
});

describe('formatDatetime', () => {
  it('returns a string containing the year', () => {
    const result = formatDatetime('2026-01-15T12:00:00Z');
    expect(result).toContain('2026');
  });
});

describe('formatDateLocale', () => {
  it('formats date for en locale', () => {
    const result = formatDateLocale('2026-06-01T00:00:00Z', 'en');
    expect(result).toMatch(/2026/);
  });

  it('formats date for es locale', () => {
    const result = formatDateLocale('2026-06-01T00:00:00Z', 'es');
    expect(result).toMatch(/2026/);
  });
});

describe('formatTimeLocale', () => {
  it('returns a time string with colon separator', () => {
    const result = formatTimeLocale('2026-01-15T14:30:00Z', 'en');
    expect(result).toMatch(/:/);
  });
});

describe('formatDatetimeLocale', () => {
  it('returns a string containing year and colon (time present)', () => {
    const result = formatDatetimeLocale('2026-01-15T14:30:00Z', 'en');
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/:/);
  });
});

describe('initials', () => {
  it('returns first 2 initials uppercase', () => {
    expect(initials('Alice Smith')).toBe('AS');
  });

  it('returns single initial for single word', () => {
    expect(initials('Alice')).toBe('A');
  });

  it('returns max 2 initials for 3+ word names', () => {
    expect(initials('Alice Marie Smith')).toBe('AM');
  });

  it('uppercases lowercase input', () => {
    expect(initials('john doe')).toBe('JD');
  });
});
