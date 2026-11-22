'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/UI/GlassCard';
import { GlassButton } from '../../components/UI/GlassButton';
import {
  Lock,
  AtSign,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter your User ID or Username.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(username, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Login failed. Check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-6 px-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm space-y-3.5">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
            BS
          </div>
          <h1 className="text-xl font-black text-navy-950 tracking-tight">
            BRO SQUAD
          </h1>
          <p className="text-xs text-text-secondary">
            Shared Room Expense Management
          </p>
        </div>

        {/* Login Form Card */}
        <GlassCard className="p-4 space-y-3.5 shadow-glass-md">
          <div className="pb-2 border-b border-navy-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent" />
              Member Login
            </h2>
            <span className="text-[10px] text-text-muted">Enter credentials</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-navy-800 mb-1">
                User ID / Username
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin, asad, milon..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-bold outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy-800 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy-900"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </GlassButton>
          </form>
        </GlassCard>

        {/* Initial Setup Info Callout */}
        <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 text-center space-y-1 shadow-xs">
          <p className="text-[11px] font-bold text-navy-900">
            👑 Initial Admin Credentials
          </p>
          <p className="text-[10px] text-text-secondary">
            User ID: <span className="font-mono font-bold text-navy-950 bg-navy-100/80 px-1 py-0.5 rounded">admin</span>
            {' '}· Password: <span className="font-mono font-bold text-navy-950 bg-navy-100/80 px-1 py-0.5 rounded">admin123</span>
          </p>
          <p className="text-[9px] text-text-muted">
            Admin can create roommate accounts and change password from the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
