'use client';

import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../UI/Modal';
import { GlassButton } from '../UI/GlassButton';
import { UserPlus, User, Mail, Phone, AlertCircle } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { addMember } = useRoom();
  const { currentUser, switchUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Member name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const newM = await addMember({
        full_name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });

      // If no active user is set yet, automatically set this member as active
      if (!currentUser) {
        await switchUser(newM.id);
      }

      setName('');
      setPhone('');
      setEmail('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Roommate" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-navy-800 mb-1">
            Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Asad, Abdullah, Milon..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
            />
          </div>
        </div>

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

        <div>
          <label className="block text-[11px] font-bold text-navy-800 mb-1">
            Email (Optional)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="name@brosquad.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs font-semibold outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
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
            Add Member
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
};
