import { onlineManager } from '@core/api/queryClient';
import { syncDb } from '@shared/lib/db/syncDb';
import { salesApi } from '../api/salesApi';
import type { CreateSaleDTO } from '@entities/sale';

// HTTP status codes that signal the server definitively rejected the request.
// These must not be retried — retrying would not change the outcome.
const HARD_ERROR_STATUSES = new Set([400, 401, 403, 404, 405, 409, 410, 422]);

function isHardError(error: unknown): boolean {
  if (error instanceof Error && 'status' in error) {
    return HARD_ERROR_STATUSES.has((error as Error & { status: number }).status);
  }
  return false;
}

async function processQueue(): Promise<void> {
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
