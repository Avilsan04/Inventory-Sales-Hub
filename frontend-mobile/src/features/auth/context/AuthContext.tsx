import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { tokenStorage } from '@core/storage';
import { AUTH_UNAUTHORIZED_EVENT } from '@core/http/httpClient';
import type { UserResponse } from '../models';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: UserResponse | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tokenStorage.isAuthenticated()
      .then(ok => { if (!ok) setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(AUTH_UNAUTHORIZED_EVENT, () => {
      setUser(null);
    });
    return () => sub.remove();
  }, []);

  const logout = async () => {
    await tokenStorage.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
