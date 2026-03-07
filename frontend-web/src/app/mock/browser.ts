import { setupWorker } from 'msw/browser';
import { inventoryHandlers } from '@features/inventory/api/inventory.mock';
import { authHandlers } from '@features/auth/api/auth.mock';

export const worker = setupWorker(
    ...inventoryHandlers,
    ...authHandlers
);