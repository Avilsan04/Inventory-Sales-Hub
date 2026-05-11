import type { ITokenStorage } from './ITokenStorage';

// Access token lives exclusively in module memory — never persisted to localStorage/sessionStorage.
// This neutralises XSS token-theft vectors. The refresh_token travels only via HttpOnly cookie
// (set by the backend); the browser forwards it automatically on /auth/refresh requests.
let _accessToken: string | null = null;

export const tokenStorage: ITokenStorage = {
  saveToken: (token: string): void => {
    _accessToken = token;
  },

  getToken: (): string | null => _accessToken,

  removeToken: (): void => {
    _accessToken = null;
  },
};
