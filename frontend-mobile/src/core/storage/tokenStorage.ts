import EncryptedStorage from 'react-native-encrypted-storage';

const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  saveToken: async (token: string): Promise<void> => {
    await EncryptedStorage.setItem(TOKEN_KEY, token);
  },

  getToken: async (): Promise<string | null> => {
    return await EncryptedStorage.getItem(TOKEN_KEY);
  },

  removeToken: async (): Promise<void> => {
    await EncryptedStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await EncryptedStorage.getItem(TOKEN_KEY);
    return token !== null;
  }
};