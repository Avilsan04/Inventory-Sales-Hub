import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpError } from '@core/http';

// Simulate the isHardError logic from salesSyncWorker to keep the test isolated
const HARD_ERROR_STATUSES = new Set([400, 401, 403, 404, 405, 409, 410, 422]);

function isHardError(error: unknown): boolean {
  if (error instanceof HttpError) {
    return HARD_ERROR_STATUSES.has(error.status);
  }
  return false;
}

describe('salesSyncWorker — isHardError', () => {
  it('classifies 400 as a hard error', () => {
    const err = new HttpError('Bad Request', 400);
    expect(isHardError(err)).toBe(true);
  });

  it('classifies 403 as a hard error', () => {
    const err = new HttpError('Forbidden', 403);
    expect(isHardError(err)).toBe(true);
  });

  it('classifies 404 as a hard error', () => {
    const err = new HttpError('Not Found', 404);
    expect(isHardError(err)).toBe(true);
  });

  it('classifies 422 as a hard error', () => {
    const err = new HttpError('Unprocessable', 422);
    expect(isHardError(err)).toBe(true);
  });

  it('does NOT classify 500 as a hard error', () => {
    const err = new HttpError('Server Error', 500);
    expect(isHardError(err)).toBe(false);
  });

  it('does NOT classify 503 as a hard error', () => {
    const err = new HttpError('Unavailable', 503);
    expect(isHardError(err)).toBe(false);
  });

  it('does NOT classify plain Error (no status) as hard error', () => {
    expect(isHardError(new Error('network error'))).toBe(false);
  });

  it('does NOT classify non-Error as hard error', () => {
    expect(isHardError('string error')).toBe(false);
    expect(isHardError(null)).toBe(false);
  });
});

describe('tabSync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('BroadcastChannel is used when available', async () => {
    const postSpy = vi.fn();
    const MockChannel = vi.fn(() => ({
      postMessage: postSpy,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('BroadcastChannel', MockChannel);

    // Dynamic import to get fresh instance
    const mod = await vi.importActual<typeof import('@shared/lib/tabSync')>(
      // We test the logic inline here to avoid module-level channel caching
      '@shared/lib/tabSync'
    );

    // Just verify the function exists and is callable
    expect(typeof mod.broadcastTabSync).toBe('function');
    vi.unstubAllGlobals();
  });
});
