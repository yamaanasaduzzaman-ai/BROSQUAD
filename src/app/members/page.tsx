'use client';

import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/UI/GlassCard';
import { GlassButton } from '../../components/UI/GlassButton';
import { AddMemberModal } from '../../components/Members/AddMemberModal';
import { EditMemberModal } from '../../components/Members/EditMemberModal';
import { Modal } from '../../components/UI/Modal';
import { Avatar } from '../../components/UI/Avatar';
import { formatBDT, formatDate } from '../../lib/formatters';
import { MemberBalance, Profile } from '../../lib/types';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Phone,
  AtSign,
  AlertTriangle,
} from 'lucide-react';

export default function MembersPage() {
  const { members, memberBalances, expenses, deleteMember } = useRoom();
  const { currentUser, isAdmin } = useAuth();

  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Profile | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberBalance | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const memberExpenses = React.useMemo(() => {
    if (!selectedMember) return [];
    return expenses.filter(
      (e) =>
        e.paid_by === selectedMember.user_id ||
        e.participants.some((p) => p.user_id === selectedMember.user_id)
    );
  }, [selectedMember, expenses]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? All associated data will be removed.`)) {
      try {
        setDeletingId(id);
        await deleteMember(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete member');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base sm:text-lg font-black text-navy-950 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary" />
          Roommates ({members.length})
        </h1>

        {isAdmin && (
          <GlassButton
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setShowAddMember(true)}
          >
            Add Member
          </GlassButton>
        )}
      </div>

      {/* Members Grid */}
      {members.length === 0 ? (
        <GlassCard className="text-center py-8">
          <Users className="w-8 h-8 text-navy-300 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-navy-900">No roommates added yet</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Add roommates to track shared expenses and debt settlement.
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowAddMember(true)}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add First Member
            </button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {members.map((m) => {
            const isMe = m.id === currentUser?.id;
            const balanceObj = memberBalances.find((b) => b.user_id === m.id);
            const netBalance = balanceObj?.net_balance_paisa || 0;
            const isReceivable = netBalance > 0;
            const isPayable = netBalance < 0;

            return (
              <GlassCard
                key={m.id}
                className={`p-3 border transition-all ${
                  isMe ? 'border-accent/40 shadow-xs' : 'border-white/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    onClick={() => {
                      if (balanceObj) setSelectedMember(balanceObj);
                    }}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <Avatar
                      name={m.full_name}
                      id={m.id}
                      avatarUrl={m.avatar_url}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-navy-950 truncate">
                          {m.full_name}
                        </p>
                        {m.role === 'admin' ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-accent/15 text-accent text-[9px] font-black uppercase flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Admin
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-md bg-navy-100 text-navy-600 text-[9px] font-bold uppercase">
                            Member
                          </span>
                        )}
                        {isMe && <span className="text-accent text-[10px] font-bold">(You)</span>}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-0.5">
                        {m.username && (
                          <span className="flex items-center gap-0.5 text-navy-700 font-semibold">
                            <AtSign className="w-2.5 h-2.5 text-text-muted" />
                            {m.username}
                          </span>
                        )}
                        {m.phone && (
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-2.5 h-2.5 text-text-muted" />
                            {m.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Net Balance & Actions */}
                  <div className="flex items-center gap-1 shrink-0">
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
                      {formatBDT(netBalance)}
                    </span>

                    {/* Admin Actions: Edit & Delete */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setEditingMember(m)}
                          className="p-1 rounded-lg hover:bg-navy-100 text-text-muted hover:text-accent transition-colors"
                          title="Edit member"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        {/* Can delete if not current user or if multiple admins */}
                        <button
                          onClick={() => handleDelete(m.id, m.full_name)}
                          disabled={deletingId === m.id}
                          className="p-1 rounded-lg hover:bg-rose-50 text-text-muted hover:text-rose-600 transition-colors disabled:opacity-50"
                          title="Delete member"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
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

      {/* Edit Member Modal */}
      <EditMemberModal
        member={editingMember}
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
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
            <div className="p-3 rounded-2xl bg-navy-50/80 border border-navy-100 grid grid-cols-2 gap-2 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary">
                  Total Paid
                </span>
                <p className="text-sm font-black text-navy-950 mt-0.5">
                  {formatBDT(selectedMember.total_paid_paisa)}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary">
                  Total Share
                </span>
                <p className="text-sm font-black text-navy-950 mt-0.5">
                  {formatBDT(selectedMember.total_share_paisa)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-navy-950 mb-1.5">
                Expenses Involving {selectedMember.full_name} ({memberExpenses.length})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {memberExpenses.length === 0 ? (
                  <p className="text-[11px] text-text-secondary text-center py-2">
                    No expense records found.
                  </p>
                ) : (
                  memberExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-2 rounded-xl bg-white/70 border border-navy-100/70 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-navy-950">{exp.title}</p>
                        <p className="text-[10px] text-text-secondary">
                          {formatDate(exp.expense_date)} · {exp.category}
                        </p>
                      </div>
                      <span className="font-black text-navy-900">
                        {formatBDT(exp.amount_paisa)}
                      </span>
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
