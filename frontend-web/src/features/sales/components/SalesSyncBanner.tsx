import * as React from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';
import { useSyncQueueStatus } from '../hooks/useSyncQueueStatus';
import styles from './SalesSyncBanner.module.scss';

function formatCount(value: number, label: string): string {
  return value === 1 ? `1 ${label}` : `${value} ${label}s`;
}

export function SalesSyncBanner(): React.ReactElement | null {
  const isOnline = useOnlineStatus();
  const { pending, processing, failed } = useSyncQueueStatus();
  const queued = pending + processing;

  if (queued === 0 && failed === 0) return null;

  if (!isOnline) {
    return (
      <div className={styles.banner} role="status" aria-live="polite">
        <RefreshCwIcon size={14} aria-hidden="true" />
        <span>Offline — {formatCount(queued, 'sale')} queued for sync.</span>
      </div>
    );
  }

  if (failed > 0 && queued === 0) {
    return (
      <div className={styles.bannerError} role="status" aria-live="polite">
        <AlertTriangleIcon size={14} aria-hidden="true" />
        <span>{formatCount(failed, 'sale')} failed to sync. Review and retry.</span>
      </div>
    );
  }

  return (
    <div className={styles.bannerInfo} role="status" aria-live="polite">
      <RefreshCwIcon size={14} aria-hidden="true" />
      <span>Syncing {formatCount(queued, 'sale')}…</span>
    </div>
  );
}
