export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Environment-safe adapter generator
const createBrowserStorage = (storageType: 'local' | 'session'): StorageAdapter => {
  const isBrowser = typeof window !== 'undefined';
  const storage = isBrowser
    ? (storageType === 'local' ? window.localStorage : window.sessionStorage)
    : null;

  return {
    getItem: (key: string): string | null => storage?.getItem(key) ?? null,
    setItem: (key: string, value: string): void => storage?.setItem(key, value),
    removeItem: (key: string): void => storage?.removeItem(key),
  };
};

const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  saveToken: (token: string, persistent: boolean = false): void => {
    const adapter = createBrowserStorage(persistent ? 'local' : 'session');
    // Ensure cleanup across both storages to prevent stale state
    createBrowserStorage('local').removeItem(TOKEN_KEY);
    createBrowserStorage('session').removeItem(TOKEN_KEY);

    adapter.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    const local = createBrowserStorage('local').getItem(TOKEN_KEY);
    const session = createBrowserStorage('session').getItem(TOKEN_KEY);
    return local ?? session;
  },

  removeToken: (): void => {
    createBrowserStorage('local').removeItem(TOKEN_KEY);
    createBrowserStorage('session').removeItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return tokenStorage.getToken() !== null;
  }
};