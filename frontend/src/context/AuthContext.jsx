import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pulsepoll_auth_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pulsepoll_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Validate token with backend on mount
  useEffect(() => {
    if (token) {
      api.getMe()
        .then((userData) => {
          const updated = { ...userData, role: 'Creator' };
          setUser(updated);
          localStorage.setItem('pulsepoll_user', JSON.stringify(updated));
        })
        .catch(() => {
          // Token is invalid/expired -> clear state
          setToken('');
          setUser(null);
          localStorage.removeItem('pulsepoll_auth_token');
          localStorage.removeItem('pulsepoll_user');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const u = { ...res.user, role: 'Creator' };
    setToken(res.token);
    setUser(u);
    localStorage.setItem('pulsepoll_auth_token', res.token);
    localStorage.setItem('pulsepoll_user', JSON.stringify(u));
    return u;
  };

  const signup = async (name, email, password) => {
    const res = await api.signup({ name, email, password });
    const u = { ...res.user, role: 'Creator' };
    setToken(res.token);
    setUser(u);
    localStorage.setItem('pulsepoll_auth_token', res.token);
    localStorage.setItem('pulsepoll_user', JSON.stringify(u));
    return u;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setToken('');
    localStorage.removeItem('pulsepoll_auth_token');
    localStorage.removeItem('pulsepoll_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const userData = await api.getMe();
      const updated = { ...userData, role: 'Creator' };
      setUser(updated);
      localStorage.setItem('pulsepoll_user', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
