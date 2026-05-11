import * as React from 'react';
import { WifiOffIcon } from 'lucide-react';
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';
import styles from './OfflineBanner.module.scss';

export function OfflineBanner(): React.ReactElement | null {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <WifiOffIcon size={14} aria-hidden="true" />
      <span>You are offline. Changes will sync when connection restores.</span>
    </div>
  );
}
