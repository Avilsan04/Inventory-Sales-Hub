import { describe, it, expect } from 'vitest';
import { isStaleSession } from './sessionUtils';

describe('isStaleSession', () => {
  it('returns true when openedAt is from a previous day', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isStaleSession(yesterday.toISOString())).toBe(true);
  });

  it('returns false when openedAt is from today', () => {
    expect(isStaleSession(new Date().toISOString())).toBe(false);
  });

  it('returns true when openedAt is from two days ago', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    expect(isStaleSession(twoDaysAgo.toISOString())).toBe(true);
  });
});
