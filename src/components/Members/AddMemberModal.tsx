'use client';

import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../UI/Modal';
import { GlassButton } from '../UI/GlassButton';
import { UserPlus, User, Key, Phone, ShieldCheck, AtSign, AlertCircle } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { addMember } = useRoom();
  const { currentUser, switchUser } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Member name is required');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      setError('User ID / Username is required (letters and numbers only)');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const newM = await addMember({
        full_name: name.trim(),
        username: cleanUsername,
        password: password.trim(),
        phone: phone.trim() || undefined,
        role,
      });

      // If no active user is set yet, automatically set this member as active
      if (!currentUser) {
        await switchUser(newM.id);
      }

      setName('');
      setUsername('');
      setPassword('');
      setPhone('');
      setRole('member');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Roommate Account" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        {error && (
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold text-navy-800 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Asaduzzaman, Abdullah..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!username) {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                }
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* User ID / Username */}
        <div>
          <label className="block text-[11px] font-bold text-navy-800 mb-1">
            User ID / Username * <span className="text-text-muted font-normal">(Login identifier)</span>
          </label>
          <div className="relative">
            <AtSign className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. asad, milon, monir"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-bold text-navy-800 mb-1">
            Password *
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Password for this member"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[11px] font-bold text-navy-800 mb-1">
            Phone (Optional)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="+880 1700-000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-[11px] font-bold text-navy-800 mb-1">
            Role
          </label>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent appearance-none"
            >
              <option value="member">General Member</option>
              <option value="admin">Admin (Can manage users & all data)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <GlassButton type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            icon={<UserPlus className="w-3.5 h-3.5" />}
            className="flex-1"
          >
            Create Account
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
};
