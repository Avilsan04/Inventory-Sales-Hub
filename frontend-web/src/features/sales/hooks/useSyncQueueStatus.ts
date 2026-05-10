import * as React from 'react';
import { syncDb } from '@shared/lib';

export interface SyncQueueStatus {
  readonly pending: number;
  readonly processing: number;
  readonly failed: number;
}

const DEFAULT_POLL_MS = 5_000;

async function fetchQueueStatus(): Promise<SyncQueueStatus> {
  const [pending, processing, failed] = await Promise.all([
    syncDb.syncQueue.where('status').equals('pending').count(),
    syncDb.syncQueue.where('status').equals('processing').count(),
    syncDb.syncQueue.where('status').equals('failed').count(),
  ]);
  return { pending, processing, failed };
}

/** Polls the offline sync queue to surface pending and failed operations. */
export function useSyncQueueStatus(pollMs: number = DEFAULT_POLL_MS): SyncQueueStatus {
  const [status, setStatus] = React.useState<SyncQueueStatus>({
    pending: 0,
    processing: 0,
    failed: 0,
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    let alive = true;

    const tick = async (): Promise<void> => {
      try {
        const next = await fetchQueueStatus();
        if (alive) setStatus(next);
      } catch {
        if (alive) setStatus({ pending: 0, processing: 0, failed: 0 });
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, pollMs);

    return (): void => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [pollMs]);

  return status;
}
