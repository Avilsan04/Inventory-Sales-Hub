import type { ITokenStorage } from './ITokenStorage';

const TOKEN_KEY = 'auth_token';

// Evaluate environment ONCE during module initialization
const isBrowser = typeof window !== 'undefined';

// Safe extraction of native APIs
const getStorage = (type: 'local' | 'session'): Storage | null => {
  if (!isBrowser) {
    console.warn(`[Storage Warning] Attempting to access ${type}Storage outside browser environment.`);
    return null;
  }
  return type === 'local' ? window.localStorage : window.sessionStorage;
};

const localStorageAdapter = getStorage('local');
const sessionStorageAdapter = getStorage('session');

// Strict enforcement of the ITokenStorage contract
export const tokenStorage: ITokenStorage = {
  saveToken: (token: string, rememberMe: boolean): void => {
    localStorageAdapter?.removeItem(TOKEN_KEY);
    sessionStorageAdapter?.removeItem(TOKEN_KEY);

    const targetStorage = rememberMe ? localStorageAdapter : sessionStorageAdapter;
    targetStorage?.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    // Architectural Correction: Coerce optional chaining 'undefined' into interface-compliant 'null'
    const local = localStorageAdapter?.getItem(TOKEN_KEY) ?? null;

    if (local !== null) {
      return local;
    }

    return sessionStorageAdapter?.getItem(TOKEN_KEY) ?? null;
  },

  removeToken: (): void => {
    localStorageAdapter?.removeItem(TOKEN_KEY);
    sessionStorageAdapter?.removeItem(TOKEN_KEY);
  }
};