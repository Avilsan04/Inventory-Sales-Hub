import Dexie, { type Table } from 'dexie';

export type SyncOperationType = 'CREATE_SALE';

export type SyncEntryStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SyncQueueEntry {
  id: string; // UUIDv4 — used as Idempotency-Key on the request
  type: SyncOperationType;
  payload: unknown; // JSON-serialisable DTO
  status: SyncEntryStatus;
  retries: number;
  createdAt: number; // Date.now()
  lastAttemptAt?: number;
}

export const MAX_SYNC_QUEUE_SIZE = 100;

class SyncDatabase extends Dexie {
  syncQueue!: Table<SyncQueueEntry>;

  constructor() {
    super('ISH_SyncQueue');
    this.version(1).stores({
      syncQueue: 'id, status, createdAt',
    });
  }
}

export const syncDb = new SyncDatabase();
