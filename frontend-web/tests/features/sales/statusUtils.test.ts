import { describe, it, expect } from 'vitest';
import { getSaleStatusBadgeVariant, lookupCustomerName } from '../../../src/entities/sale/lib/statusUtils';

describe('getSaleStatusBadgeVariant', () => {
  it('maps completed → success', () => {
    expect(getSaleStatusBadgeVariant('completed')).toBe('success');
  });

  it('maps pending → warning', () => {
    expect(getSaleStatusBadgeVariant('pending')).toBe('warning');
  });

  it('maps cancelled → destructive', () => {
    expect(getSaleStatusBadgeVariant('cancelled')).toBe('destructive');
  });

  it('maps unknown status → neutral fallback', () => {
    expect(getSaleStatusBadgeVariant('unknown')).toBe('neutral');
    expect(getSaleStatusBadgeVariant('')).toBe('neutral');
    expect(getSaleStatusBadgeVariant('COMPLETED')).toBe('neutral'); // case-sensitive
  });
});

describe('lookupCustomerName', () => {
  const map = new Map([
    ['cust-1', 'Alice Smith'],
    ['cust-2', 'Bob Jones'],
  ]);

  it('returns name from map when customerId present', () => {
    expect(lookupCustomerName('cust-1', map)).toBe('Alice Smith');
  });

  it('returns fallback with truncated id when customerId not in map', () => {
    expect(lookupCustomerName('unknown-id-12345', map)).toBe('#unknown-');
  });

  it('returns em dash when customerId is undefined', () => {
    expect(lookupCustomerName(undefined, map)).toBe('—');
  });

  it('handles short customerId in fallback (< 8 chars)', () => {
    expect(lookupCustomerName('abc', map)).toBe('#abc');
  });
});
