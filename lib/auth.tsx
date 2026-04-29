'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from './api';
import { IUser } from '../types';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (mobile: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      const userData = res.data.data || res.data.user;
      if (res.data.success && userData) {
        setUser(userData);
        // Set role cookie for middleware
        document.cookie = `user_role=${userData.role}; path=/; max-age=604800`;
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (mobile: string, otp: string) => {
    try {
      const res = await authAPI.verifyOTP(mobile, otp);
      console.log('Raw Login Response:', res.data); // TEMP DEBUG LOG

      if (res.data.success) {
        // Handle inconsistent backend (some endpoints use .data, some use .user)
        const user = res.data.data || (res.data as any).user;
        
        if (user) {
          document.cookie = `user_role=${user.role}; path=/; max-age=604800`;
          await refreshUser();
          window.location.href = `/${user.role}`;
        } else {
          console.error('Login Error: No user object found in response. Response keys:', Object.keys(res.data));
          throw new Error('Login failed: Server response missing user data');
        }
      } else if (res.data.message) {
        throw new Error(res.data.message);
      }
    } catch (error: any) {
      console.error('--- LOGIN ERROR DETAIL ---');
      console.error('Status:', error.response?.status);
      console.error('Response Data:', error.response?.data);
      console.error('Config URL:', error.config?.url);
      
      const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      throw error;
    }
  };

  const logout = async () => {
    // Clear cookies
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    window.location.href = '/login';
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

