import { onlineManager } from '@core/api/queryClient';
import { HttpError } from '@core/http';
import { syncDb } from '@shared/lib';
import { salesApi } from '../api/salesApi';
import type { CreateSaleDTO } from '@entities/sale';

// HTTP status codes that signal the server definitively rejected the request.
// These must not be retried — retrying would not change the outcome.
const HARD_ERROR_STATUSES = new Set([400, 401, 403, 404, 405, 409, 410, 422]);
const FAILED_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isHardError(error: unknown): boolean {
  if (error instanceof HttpError) {
    return HARD_ERROR_STATUSES.has(error.status);
  }
  return false;
}

let isProcessing = false;

async function cleanupFailedEntries(): Promise<void> {
  const cutoff = Date.now() - FAILED_TTL_MS;
  await syncDb.syncQueue
    .where('status')
    .equals('failed')
    .and((entry) => entry.createdAt < cutoff)
    .delete();
}

async function processQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;
  try {
    void cleanupFailedEntries();

    const pending = await syncDb.syncQueue.where('status').equals('pending').sortBy('createdAt');

    for (const entry of pending) {
      await syncDb.syncQueue.update(entry.id, { status: 'processing', lastAttemptAt: Date.now() });

      try {
        await salesApi.createSale(entry.payload as CreateSaleDTO, {
          headers: { 'Idempotency-Key': entry.id },
        });
        await syncDb.syncQueue.update(entry.id, { status: 'completed' });
      } catch (error) {
        if (isHardError(error)) {
          await syncDb.syncQueue.update(entry.id, { status: 'failed' });
        } else {
          await syncDb.syncQueue.update(entry.id, {
            status: 'pending',
            retries: entry.retries + 1,
            lastAttemptAt: Date.now(),
          });
        }
      }
    }
  } finally {
    isProcessing = false;
  }
}

export async function retryFailedEntries(): Promise<void> {
  await syncDb.syncQueue.where('status').equals('failed').modify({ status: 'pending', retries: 0 });
  void processQueue();
}

/**
 * Start the sales sync worker. Call once on app mount inside a useEffect.
 * Returns an unsubscribe function for cleanup.
 */
export function startSalesSyncWorker(): () => void {
  const unsubscribe = onlineManager.subscribe((isOnline) => {
    if (isOnline) void processQueue();
  });

  // Process any queued entries from a previous offline session immediately on start
  void processQueue();

  return unsubscribe;
}
