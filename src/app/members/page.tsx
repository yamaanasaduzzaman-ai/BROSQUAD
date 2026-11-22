'use client';

import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/UI/GlassCard';
import { GlassButton } from '../../components/UI/GlassButton';
import { AddMemberModal } from '../../components/Members/AddMemberModal';
import { Modal } from '../../components/UI/Modal';
import { formatBDT, formatDate, getInitials, getAvatarColor } from '../../lib/formatters';
import { MemberBalance } from '../../lib/types';
import {
  Users,
  UserPlus,
  Trash2,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export default function MembersPage() {
  const { members, memberBalances, expenses, deleteMember } = useRoom();
  const { currentUser, switchUser } = useAuth();

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberBalance | null>(null);

  const memberExpenses = React.useMemo(() => {
    if (!selectedMember) return [];
    return expenses.filter(
      (e) =>
        e.paid_by === selectedMember.user_id ||
        e.participants.some((p) => p.user_id === selectedMember.user_id)
    );
  }, [selectedMember, expenses]);

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base sm:text-lg font-black text-navy-950 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary" />
          Roommates ({members.length})
        </h1>

        <GlassButton
          variant="primary"
          size="sm"
          icon={<UserPlus className="w-3.5 h-3.5" />}
          onClick={() => setShowAddMember(true)}
        >
          Add Member
        </GlassButton>
      </div>

      {/* Members Grid */}
      {members.length === 0 ? (
        <GlassCard className="text-center py-8">
          <Users className="w-8 h-8 text-navy-300 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-navy-900">No roommates added yet</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Add yourself and your roommates to start tracking shared expenses.
          </p>
          <button
            onClick={() => setShowAddMember(true)}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add First Member
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {memberBalances.map((m) => {
            const isMe = m.user_id === currentUser?.id;
            const initials = getInitials(m.full_name);
            const color = getAvatarColor(m.user_id);
            const isReceivable = m.net_balance_paisa > 0;
            const isPayable = m.net_balance_paisa < 0;

            return (
              <GlassCard
                key={m.user_id}
                className={`p-3 border transition-all ${
                  isMe ? 'border-accent/40 shadow-xs' : 'border-white/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    onClick={() => setSelectedMember(m)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${color.bg} text-white font-black text-xs flex items-center justify-center shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy-950 truncate">
                        {m.full_name} {isMe && <span className="text-accent text-[10px]">(You)</span>}
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        Paid {formatBDT(m.total_paid_paisa)} · Share {formatBDT(m.total_share_paisa)}
                      </p>
                    </div>
                  </div>

                  {/* Net Balance & Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border flex items-center gap-0.5 ${
                        isReceivable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isPayable
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-navy-50 text-navy-700 border-navy-200'
                      }`}
                    >
                      {isReceivable && <ArrowDownLeft className="w-2.5 h-2.5" />}
                      {isPayable && <ArrowUpRight className="w-2.5 h-2.5" />}
                      {isReceivable ? '+' : ''}
                      {formatBDT(m.net_balance_paisa)}
                    </span>

                    <button
                      onClick={() => switchUser(m.user_id)}
                      className="p-1 rounded-lg hover:bg-navy-100 text-[10px] font-bold text-accent"
                      title="Switch to this user"
                    >
                      Switch
                    </button>

                    <button
                      onClick={() => deleteMember(m.user_id)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-text-muted hover:text-rose-600 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />

      {/* Member Details Modal */}
      <Modal
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        title={selectedMember?.full_name}
        maxWidth="sm"
      >
        {selectedMember && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-navy-50/80 border border-navy-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Balance</span>
                <p className="text-base font-black text-navy-950">
                  {formatBDT(selectedMember.net_balance_paisa)}
                </p>
              </div>
              <div className="text-right text-[11px] text-text-secondary">
                <p>Paid: <strong>{formatBDT(selectedMember.total_paid_paisa)}</strong></p>
                <p>Share: <strong>{formatBDT(selectedMember.total_share_paisa)}</strong></p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-navy-900 block mb-1">
                Participated Expenses ({memberExpenses.length})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {memberExpenses.length === 0 ? (
                  <p className="text-[11px] text-text-secondary py-2 text-center">No expenses yet</p>
                ) : (
                  memberExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-2 rounded-lg bg-white/70 border border-navy-100/70 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-navy-900 truncate">{exp.title}</span>
                      <span className="font-black text-navy-950">{formatBDT(exp.amount_paisa)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
