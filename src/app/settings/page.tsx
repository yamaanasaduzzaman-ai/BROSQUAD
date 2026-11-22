'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { useToast } from '../../context/ToastContext';
import { GlassCard } from '../../components/UI/GlassCard';
import { GlassButton } from '../../components/UI/GlassButton';
import { AddMemberModal } from '../../components/Members/AddMemberModal';
import { getInitials, getAvatarColor } from '../../lib/formatters';
import {
  User,
  LogOut,
  UserPlus,
  Trash2,
  RefreshCw,
  Save,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, updateProfile, logout, switchUser } = useAuth();
  const { members, room, deleteMember, refreshData } = useRoom();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [showAddMember, setShowAddMember] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleResetData = () => {
    if (confirm('Clear all local expenses, settlements, and room data?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('brosquad_db_v2');
        localStorage.removeItem('brosquad_current_user_id');
      }
      refreshData();
      showToast('Database reset to clean slate.', 'info');
      router.push('/');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-3 animate-in fade-in duration-200">
      <h1 className="text-base sm:text-lg font-black text-navy-950 flex items-center gap-1.5">
        <User className="w-4 h-4 text-primary" />
        Settings
      </h1>

      {/* Profile Overview Card */}
      <GlassCard className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${color.bg} text-white font-black text-sm flex items-center justify-center shrink-0`}
          >
            {initials}
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-navy-950">
              {currentUser?.full_name || 'No Active Member'}
            </h2>
            <p className="text-[11px] text-text-secondary">{currentUser?.email || 'Tap Switch or Add Member below'}</p>
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
          Logout
        </GlassButton>
      </GlassCard>

      {/* Edit Profile Form */}
      {currentUser && (
        <GlassCard className="p-3">
          <h3 className="text-xs font-bold uppercase text-navy-900 mb-2">
            Edit My Details
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 font-bold text-xs outline-none"
              />
              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs outline-none"
              />
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save
            </GlassButton>
          </form>
        </GlassCard>
      )}

      {/* Room Roster */}
      <GlassCard className="p-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-navy-100 mb-2">
          <span className="text-xs font-bold uppercase text-navy-900">
            Roommates ({members.length})
          </span>
          <button
            onClick={() => setShowAddMember(true)}
            className="text-[11px] font-bold text-accent hover:underline flex items-center gap-0.5"
          >
            <UserPlus className="w-3 h-3" /> Add
          </button>
        </div>

        {members.length === 0 ? (
          <p className="text-xs text-text-secondary py-2 text-center">
            No roommates added yet.
          </p>
        ) : (
          <div className="space-y-1">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-1.5 rounded-xl bg-white/60 border border-navy-100/70 text-xs"
              >
                <span className="font-bold text-navy-900 truncate">
                  {m.full_name} {m.id === currentUser?.id ? '(You)' : ''}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => switchUser(m.id)}
                    className="text-[10px] font-bold text-accent hover:underline"
                  >
                    Switch
                  </button>
                  <button
                    onClick={() => deleteMember(m.id)}
                    className="text-text-muted hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Clear/Reset Data */}
      <GlassCard className="p-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-navy-950 block">Reset Data</span>
          <span className="text-[10px] text-text-secondary">Wipe all local expenses and start clean</span>
        </div>
        <GlassButton
          variant="outline"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5 text-rose-600" />}
          onClick={handleResetData}
        >
          Reset All
        </GlassButton>
      </GlassCard>

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />
    </div>
  );
}
