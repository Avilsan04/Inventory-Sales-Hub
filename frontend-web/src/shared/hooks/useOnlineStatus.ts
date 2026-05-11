import * as React from 'react';
import { onlineManager } from '@core/api/queryClient';

/** Reactive online/offline status backed by React Query's onlineManager. */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = React.useState(() => onlineManager.isOnline());

  React.useEffect(() => {
    return onlineManager.subscribe((online) => {
      setIsOnline(online);
    });
  }, []);

  return isOnline;
}
