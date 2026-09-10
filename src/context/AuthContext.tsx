import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: UserRole; location?: string; phone?: string }) => Promise<User>;
  logout: () => void;
  quickLoginAs: (role: 'farmer' | 'consumer') => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('k2c_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('k2c_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const freshUser = await api.getMe();
          setUser(freshUser);
          localStorage.setItem('k2c_user', JSON.stringify(freshUser));
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  async function login(email: string, password: string): Promise<User> {
    const res = await api.login({ email, password });
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('k2c_token', res.access_token);
    localStorage.setItem('k2c_user', JSON.stringify(res.user));
    return res.user;
  }

  async function register(data: { name: string; email: string; password: string; role: UserRole; location?: string; phone?: string }): Promise<User> {
    const res = await api.register(data);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('k2c_token', res.access_token);
    localStorage.setItem('k2c_user', JSON.stringify(res.user));
    return res.user;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('k2c_token');
    localStorage.removeItem('k2c_user');
  }

  async function quickLoginAs(role: 'farmer' | 'consumer'): Promise<User> {
    if (role === 'farmer') {
      return login('raj@farmer.com', 'farmer123');
    } else {
      return login('priya@consumer.com', 'consumer123');
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickLoginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
