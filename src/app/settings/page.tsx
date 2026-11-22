'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { useToast } from '../../context/ToastContext';
import { GlassCard } from '../../components/UI/GlassCard';
import { GlassButton } from '../../components/UI/GlassButton';
import { getInitials, getAvatarColor } from '../../lib/formatters';
import {
  User,
  LogOut,
  Key,
  ShieldCheck,
  RefreshCw,
  Save,
  AtSign,
  Phone,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, isAdmin, updateProfile, logout } = useAuth();
  const { refreshData } = useRoom();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const initials = currentUser ? getInitials(currentUser.full_name) : 'BS';
  const color = currentUser ? getAvatarColor(currentUser.id) : { bg: 'from-primary to-accent', text: 'text-white', border: 'border-white' };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      });
      showToast('Profile updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showToast('Password cannot be empty', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      setIsChangingPass(true);
      await updateProfile({
        password: newPassword.trim(),
      });
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleResetLocalCache = () => {
    if (confirm('Clear local browser cache and reload fresh data from database?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('brosquad_db_v2');
        localStorage.removeItem('brosquad_current_user_id');
      }
      refreshData();
      showToast('Local cache cleared. Reloading...', 'info');
      router.push('/');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-3 animate-in fade-in duration-200">
      <h1 className="text-base sm:text-lg font-black text-navy-950 flex items-center gap-1.5">
        <User className="w-4 h-4 text-primary" />
        Account & Settings
      </h1>

      {/* Profile Overview Card */}
      <GlassCard className="p-3 flex items-center justify-between shadow-glass-sm">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${color.bg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm`}
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-navy-950">
                {currentUser?.full_name || 'No Active Member'}
              </h2>
              {currentUser?.role === 'admin' ? (
                <span className="px-1.5 py-0.2 rounded-md bg-accent/15 text-accent text-[9px] font-black uppercase flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> Admin
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-md bg-navy-100 text-navy-600 text-[9px] font-bold uppercase">
                  Member
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-secondary">
              User ID: @{currentUser?.username || 'user'}
            </p>
          </div>
        </div>

        <GlassButton
          variant="danger"
          size="sm"
          icon={<LogOut className="w-3.5 h-3.5" />}
          onClick={() => {
            logout();
            router.push('/login');
          }}
        >
          Log Out
        </GlassButton>
      </GlassCard>

      {/* Edit Profile Info Form */}
      <GlassCard className="p-3 space-y-3">
        <h3 className="text-xs font-bold uppercase text-navy-950 flex items-center gap-1.5 pb-1.5 border-b border-navy-100">
          <User className="w-3.5 h-3.5 text-primary" />
          Edit Personal Details
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-bold text-navy-800 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-bold outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-navy-800 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+880 1700-000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
            />
          </div>

          <GlassButton
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Details
          </GlassButton>
        </form>
      </GlassCard>

      {/* Change Password Form */}
      <GlassCard className="p-3 space-y-3">
        <h3 className="text-xs font-bold uppercase text-navy-950 flex items-center gap-1.5 pb-1.5 border-b border-navy-100">
          <Key className="w-3.5 h-3.5 text-accent" />
          Change Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-navy-800 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy-800 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
              />
            </div>
          </div>

          <GlassButton
            type="submit"
            variant="outline"
            size="sm"
            isLoading={isChangingPass}
            icon={<Key className="w-3.5 h-3.5" />}
          >
            Update Password
          </GlassButton>
        </form>
      </GlassCard>

      {/* Cache & Maintenance */}
      <GlassCard className="p-3 space-y-2 border border-navy-100">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-navy-950 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-text-secondary" />
              Sync & Clear Local Cache
            </h4>
            <p className="text-[10px] text-text-secondary mt-0.5">
              Purges local storage and re-downloads fresh data from Supabase.
            </p>
          </div>
          <button
            onClick={handleResetLocalCache}
            className="px-2.5 py-1.5 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-900 text-xs font-bold transition-colors"
          >
            Sync / Reset Cache
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
