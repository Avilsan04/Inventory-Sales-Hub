export interface AuthTokens {
  token: string;
}

const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  saveToken: async (token: string): Promise<void> => {
    sessionStorage.setItem(TOKEN_KEY, token);
    return Promise.resolve();
  },

  getToken: async (): Promise<string | null> => {
    return Promise.resolve(sessionStorage.getItem(TOKEN_KEY));
  },

  removeToken: async (): Promise<void> => {
    sessionStorage.removeItem(TOKEN_KEY);
    return Promise.resolve();
  },

  isAuthenticated: async (): Promise<boolean> => {
    return Promise.resolve(sessionStorage.getItem(TOKEN_KEY) !== null);
  }
};