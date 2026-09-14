import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { login as loginRequest } from '../service/AuthService';
import { clearAuth, readAuth, writeAuth } from '../lib/authStorage';
import type { StoredAuth } from '../lib/authStorage';

interface AuthContextValue {
  user: StoredAuth | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  markPasswordChanged: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<StoredAuth | null>(readAuth);

  const login = useCallback(async (username: string, password: string) => {
    const auth = await loginRequest(username, password);
    writeAuth(auth);
    setUser(auth);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  // Called right after a successful password change - we already know it worked, so flip
  // the flag locally instead of a round-trip to /auth/me.
  const markPasswordChanged = useCallback(() => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, mustChangePassword: false };
      writeAuth(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, markPasswordChanged }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
