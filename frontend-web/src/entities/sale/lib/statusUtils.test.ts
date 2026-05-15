import { describe, it, expect } from 'vitest';
import { getSaleStatusBadgeVariant, lookupCustomerName } from './statusUtils';

describe('getSaleStatusBadgeVariant', () => {
  it('returns success for completed', () => {
    expect(getSaleStatusBadgeVariant('completed')).toBe('success');
  });

  it('returns warning for pending', () => {
    expect(getSaleStatusBadgeVariant('pending')).toBe('warning');
  });

  it('returns destructive for cancelled', () => {
    expect(getSaleStatusBadgeVariant('cancelled')).toBe('destructive');
  });

  it('returns neutral for unknown status', () => {
    expect(getSaleStatusBadgeVariant('unknown')).toBe('neutral');
    expect(getSaleStatusBadgeVariant('')).toBe('neutral');
  });
});

describe('lookupCustomerName', () => {
  const map = new Map([
    ['1', 'Alice Smith'],
    ['2', 'Bob Jones'],
  ]);

  it('returns customer name when customerId is in map', () => {
    expect(lookupCustomerName('1', map)).toBe('Alice Smith');
    expect(lookupCustomerName('2', map)).toBe('Bob Jones');
  });

  it('returns em dash when customerId is undefined', () => {
    expect(lookupCustomerName(undefined, map)).toBe('—');
  });

  it('returns truncated id when customerId not in map', () => {
    const result = lookupCustomerName('abcdef1234567890', map);
    expect(result).toBe('#abcdef12');
  });

  it('returns em dash for empty map', () => {
    expect(lookupCustomerName(undefined, new Map())).toBe('—');
  });
});
