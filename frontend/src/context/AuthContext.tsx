import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../config/axios';
import { clearAuth, readAuth, writeAuth } from '../lib/authStorage';
import type { StoredAuth } from '../lib/authStorage';

interface AuthContextValue {
  user: StoredAuth | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<StoredAuth | null>(readAuth);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post<StoredAuth>('/auth/login', { username, password });
    writeAuth(response.data);
    setUser(response.data);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
