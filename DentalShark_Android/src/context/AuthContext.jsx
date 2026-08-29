import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { api, getToken, setToken, ApiError } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Sync body classes
  useEffect(() => {
    const loggedIn = !!user && user.uid !== 'guest' && user.id !== 'guest';
    document.body.classList.toggle('logged-in', loggedIn);
    // Always add has-user when any user (including guest) is set
    document.body.classList.toggle('has-user', !!user);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const token = getToken();
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const data = await api.me();
        if (!cancelled && data?.user) setUser(data.user);
        else if (!cancelled) setToken(null); // invalid token
      } catch {
        setToken(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async ({ email, password, selectedRole, guest }) => {
    const data = await api.login({ email, password, selectedRole, guest });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const isGuest = !user || (user.uid || '').startsWith('guest') || user.role === 'guest' || user.role === 'Guest';
  const isStaffOrAdmin = !!user && ['admin', 'ceo', 'staff'].includes((user.role || '').toLowerCase());

  const value = useMemo(
    () => ({ user, initializing, isGuest, isStaffOrAdmin, login, register, logout, setUser }),
    [user, initializing, isGuest, isStaffOrAdmin, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export { ApiError };
