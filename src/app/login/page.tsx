'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { GlassCard } from '../../components/UI/GlassCard';
import { GlassButton } from '../../components/UI/GlassButton';
import { AddMemberModal } from '../../components/Members/AddMemberModal';
import { getInitials, getAvatarColor } from '../../lib/formatters';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchUser } = useAuth();
  const { members } = useRoom();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailOrUsername.trim()) {
      setError('Please enter your email or name.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(emailOrUsername, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (memberId: string) => {
    await switchUser(memberId);
    router.push('/');
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-4 px-2 animate-in fade-in duration-200">
      <div className="w-full max-w-sm space-y-3">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-black text-lg mx-auto shadow-sm">
            BS
          </div>
          <h1 className="text-xl font-black text-navy-950 tracking-tight">
            BRO SQUAD
          </h1>
        </div>

        {/* Login Form Card */}
        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-navy-100">
            <h2 className="text-xs font-bold uppercase text-navy-950">Member Login</h2>
            <button
              type="button"
              onClick={() => setShowAddMember(true)}
              className="text-[11px] font-bold text-accent hover:underline flex items-center gap-0.5"
            >
              <UserPlus className="w-3 h-3" /> Add Roommate
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Email or Name"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-bold outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy-900"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="sm"
              fullWidth
              isLoading={isLoading}
            >
              Log In
            </GlassButton>
          </form>
        </GlassCard>

        {/* 1-Tap Quick Switcher if members exist */}
        {members.length > 0 && (
          <GlassCard className="p-3">
            <span className="text-[10px] font-bold uppercase text-navy-900 block mb-1.5">
              Select Profile
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {members.map((m) => {
                const inits = getInitials(m.full_name);
                const color = getAvatarColor(m.id);

                return (
                  <button
                    key={m.id}
                    onClick={() => handleQuickLogin(m.id)}
                    className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/70 hover:bg-white border border-white/80 text-left transition-all truncate"
                  >
                    <div
                      className={`w-5 h-5 rounded-md bg-gradient-to-tr ${color.bg} text-white font-bold text-[8px] flex items-center justify-center shrink-0`}
                    >
                      {inits}
                    </div>
                    <span className="text-xs font-bold text-navy-900 truncate">
                      {m.full_name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        )}
      </div>

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />
    </div>
  );
}
