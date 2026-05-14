'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from './api';
import { IUser } from '../types';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (mobile: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper: wipe all auth cookies instantly
const clearAuthCookies = () => {
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      // Backend now consistently returns { success, data }
      const userData = res.data.data;
      if (res.data.success && userData) {
        setUser(userData);
        document.cookie = `user_role=${userData.role}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        setUser(null);
      }
    } catch (err: any) {
      setUser(null);
      // ─── THE LOOP FIX ──────────────────────────────────────────────────────
      // If the server says "not authorized", the JWT is expired/invalid.
      // We MUST clear the cookies here — otherwise the Next.js middleware
      // will see the old cookies, think the user is logged in, and keep
      // redirecting back to the dashboard, creating an infinite loop.
      if (err?.response?.status === 401) {
        clearAuthCookies();
      }
      // ───────────────────────────────────────────────────────────────────────
    } finally {
      setLoading(false);
    }
  };

  const login = async (mobile: string, password: string) => {
    try {
      const res = await authAPI.login(mobile, password);

      if (res.data.success && res.data.data) {
        const userData = res.data.data;
        // Set role cookie so middleware knows where to route
        document.cookie = `user_role=${userData.role}; path=/; max-age=604800; SameSite=Lax`;
        // Refresh full user profile from DB
        await refreshUser();
        // Navigate to the correct dashboard
        window.location.href = `/${userData.role}`;
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('[LOGIN ERROR]', error.response?.status, error.response?.data);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // MUST call backend first — auth_token is httpOnly, JS cannot clear it.
      // Only the server can clear it via Set-Cookie with maxAge=0.
      await authAPI.logout();
    } catch (_) {
      // Even if the backend call fails, proceed with client-side cleanup
    } finally {
      clearAuthCookies();
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const getDashboardRoute = (role: string) => `/${role.toLowerCase()}`;
