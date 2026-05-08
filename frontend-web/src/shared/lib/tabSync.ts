type TabSyncMessage =
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_LOGIN' }
  | { type: 'TENANT_CHANGED'; tenantId: string }
  | { type: 'CART_UPDATED' };

const CHANNEL_NAME = 'ish-tab-sync';
const isBrowser = typeof BroadcastChannel !== 'undefined';

let _channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (!isBrowser) return null;
  if (!_channel) _channel = new BroadcastChannel(CHANNEL_NAME);
  return _channel;
}

export function broadcastTabSync(message: TabSyncMessage): void {
  getChannel()?.postMessage(message);
}

export function subscribeTabSync(handler: (message: TabSyncMessage) => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const listener = (event: MessageEvent<TabSyncMessage>): void => {
    handler(event.data);
  };
  ch.addEventListener('message', listener);
  return () => {
    ch.removeEventListener('message', listener);
  };
}
