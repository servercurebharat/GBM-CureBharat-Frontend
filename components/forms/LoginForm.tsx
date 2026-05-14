'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api';
import { getDashboardRoute } from '@/lib/auth';

export default function LoginForm() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(mobile, password);
      const user = res.data.data;
      if (res.data.success && user) {
        document.cookie = `user_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
        window.location.href = getDashboardRoute(user.role);
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Mobile Number
          </label>
          <div className="flex">
            <span className="flex items-center px-3 bg-slate-800 border border-r-0 border-slate-600 rounded-l-xl text-slate-400 text-sm">
              +91
            </span>
            <input
              id="login-mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              maxLength={10}
              required
              className="flex-1 bg-slate-800 border border-slate-600 rounded-r-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || mobile.length < 10 || password.length < 4}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-emerald-500/20"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-4">
        New member?{' '}
        <a href="/register" className="text-emerald-400 hover:underline font-medium">
          Register here
        </a>
      </p>
    </div>
  );
}
