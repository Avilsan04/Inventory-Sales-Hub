import * as React from 'react';
import { AlertTriangleIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui';
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';
import { tokenStorage } from '@core/storage/tokenStorage';
import { useSyncQueueStatus } from '../hooks/useSyncQueueStatus';
import {
  retryFailedEntries,
  cancelQueuedEntries,
  clearSyncQueue,
} from '../services/salesSyncWorker';
import styles from './SalesSyncBanner.module.scss';

export function SalesSyncBanner(): React.ReactElement | null {
  const { translate: t } = useTranslationAdapter();
  const isOnline = useOnlineStatus();
  const { pending, processing, failed } = useSyncQueueStatus();
  const queued = pending + processing;

  if (!tokenStorage.getToken()) return null;
  if (queued === 0 && failed === 0) return null;

  if (!isOnline) {
    return (
      <div className={styles.banner} role="status" aria-live="polite">
        <RefreshCwIcon size={14} aria-hidden="true" />
        <span>{t('sales.sync.offline', { count: queued })}</span>
      </div>
    );
  }

  if (failed > 0 && queued === 0) {
    return (
      <div className={styles.bannerError} role="status" aria-live="polite">
        <AlertTriangleIcon size={14} aria-hidden="true" />
        <span>{t('sales.sync.failedToSync', { count: failed })}</span>
        <Button
          variant="ghost"
          size="sm"
          className={styles.retryBtn}
          onClick={(): void => {
            void retryFailedEntries();
          }}
        >
          {t('sales.sync.retry')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={styles.retryBtn}
          onClick={(): void => {
            void clearSyncQueue();
          }}
          aria-label="Descartar errores de sincronización"
        >
          <XIcon size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.bannerInfo} role="status" aria-live="polite">
      <RefreshCwIcon size={14} aria-hidden="true" />
      <span>{t('sales.sync.syncing', { count: queued })}</span>
      <Button
        variant="ghost"
        size="sm"
        className={styles.retryBtn}
        onClick={(): void => {
          void cancelQueuedEntries();
        }}
        aria-label="Cancelar sincronización"
      >
        <XIcon size={14} />
      </Button>
    </div>
  );
}
