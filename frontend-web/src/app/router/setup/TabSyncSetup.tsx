import { useTabSync } from '@features/auth';

export function TabSyncSetup(): null {
  useTabSync();
  return null;
}
