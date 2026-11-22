'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EXPENSE_CATEGORIES, ExpenseCategory, Expense } from '../../lib/types';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { bdtToPaisa, paisaToBdt, calculateSplitShares } from '../../lib/calculations';
import { formatBDT, getInitials, getAvatarColor } from '../../lib/formatters';
import { GlassCard } from '../UI/GlassCard';
import { GlassButton } from '../UI/GlassButton';
import { AddMemberModal } from '../Members/AddMemberModal';
import {
  Calendar,
  CheckSquare,
  Square,
  AlertCircle,
  Plus,
  UserPlus,
} from 'lucide-react';

interface ExpenseFormProps {
  initialExpense?: Expense;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialExpense,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const { members, addExpense, updateExpense } = useRoom();
  const { currentUser } = useAuth();

  const isEditing = Boolean(initialExpense);

  const [title, setTitle] = useState(initialExpense?.title || '');
  const [amountStr, setAmountStr] = useState(
    initialExpense ? String(paisaToBdt(initialExpense.amount_paisa)) : ''
  );
  const [category, setCategory] = useState<ExpenseCategory>(
    initialExpense?.category || 'Groceries'
  );
  const [paidBy, setPaidBy] = useState<string>(
    initialExpense?.paid_by || currentUser?.id || (members[0]?.id ?? '')
  );
  const [expenseDate, setExpenseDate] = useState<string>(
    initialExpense?.expense_date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(initialExpense?.notes || '');
  const [showAddMember, setShowAddMember] = useState(false);

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(() => {
    if (initialExpense?.participants && initialExpense.participants.length > 0) {
      return initialExpense.participants.map((p) => p.user_id);
    }
    return members.map((m) => m.id);
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update selected participants if members list changes
  React.useEffect(() => {
    if (!initialExpense && selectedParticipants.length === 0 && members.length > 0) {
      setSelectedParticipants(members.map((m) => m.id));
      if (!paidBy) setPaidBy(currentUser?.id || members[0].id);
    }
  }, [members, initialExpense, selectedParticipants.length, paidBy, currentUser]);

  const previewPaisa = useMemo(() => {
    return bdtToPaisa(amountStr);
  }, [amountStr]);

  const splitPreview = useMemo(() => {
    if (previewPaisa <= 0 || selectedParticipants.length === 0) return [];
    try {
      return calculateSplitShares(previewPaisa, selectedParticipants);
    } catch {
      return [];
    }
  }, [previewPaisa, selectedParticipants]);

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedParticipants.length === members.length) {
      setSelectedParticipants(currentUser ? [currentUser.id] : [members[0]?.id]);
    } else {
      setSelectedParticipants(members.map((m) => m.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter an expense title.');
      return;
    }

    const amountPaisa = bdtToPaisa(amountStr);
    if (amountPaisa <= 0) {
      setError('Please enter an amount > 0.');
      return;
    }

    if (selectedParticipants.length === 0) {
      setError('Select at least 1 participant.');
      return;
    }

    try {
      setIsSubmitting(true);
      const activePayer = paidBy || currentUser?.id || members[0]?.id;

      if (isEditing && initialExpense) {
        await updateExpense(initialExpense.id, {
          title: title.trim(),
          amount_paisa: amountPaisa,
          category,
          paid_by: activePayer,
          expense_date: expenseDate,
          notes: notes.trim(),
          participant_user_ids: selectedParticipants,
        });
      } else {
        await addExpense({
          title: title.trim(),
          amount_paisa: amountPaisa,
          category,
          paid_by: activePayer,
          expense_date: expenseDate,
          notes: notes.trim(),
          participant_user_ids: selectedParticipants,
        });
      }

      if (onSuccess) onSuccess();
      else router.push('/expenses');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        {error && (
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Title & Amount */}
        <GlassCard className="p-3 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Breakfast, Groceries..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 font-bold text-xs outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1">
                Amount (BDT) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-navy-500 font-bold text-sm">
                  ৳
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 font-black text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 2. Category Pills */}
        <GlassCard className="p-2.5">
          <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1.5">
            Category
          </label>
          <div className="flex flex-wrap gap-1">
            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white/60 hover:bg-white text-navy-800 border border-navy-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* 3. Payer & Date */}
        <GlassCard className="p-2.5 grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-navy-800">
                Payer
              </label>
              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="text-[10px] font-bold text-accent hover:underline flex items-center"
              >
                <Plus className="w-2.5 h-2.5" /> Roommate
              </button>
            </div>
            {members.length === 0 ? (
              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="w-full py-1.5 px-2 rounded-xl bg-accent/15 text-primary text-xs font-bold border border-dashed border-accent/40"
              >
                + Add Roommate First
              </button>
            ) : (
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 font-bold text-xs outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} {m.id === currentUser?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1">
              Date
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 font-semibold text-xs outline-none"
            />
          </div>
        </GlassCard>

        {/* 4. Participants */}
        <GlassCard className="p-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-navy-100">
            <span className="text-[10px] font-bold uppercase text-navy-900">
              Participants ({selectedParticipants.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="text-[10px] font-bold text-accent hover:underline flex items-center gap-0.5"
              >
                <UserPlus className="w-3 h-3" /> Add
              </button>
              {members.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[10px] font-bold text-navy-700 hover:text-navy-950"
                >
                  {selectedParticipants.length === members.length ? 'Clear' : 'All'}
                </button>
              )}
            </div>
          </div>

          {members.length === 0 ? (
            <div className="py-3 text-center">
              <p className="text-xs text-text-secondary">No roommates in list</p>
              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="mt-1.5 px-3 py-1 rounded-xl bg-primary text-white text-xs font-bold"
              >
                + Add Roommates Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {members.map((m) => {
                const isChecked = selectedParticipants.includes(m.id);
                const initials = getInitials(m.full_name);
                const avatarStyle = getAvatarColor(m.id);
                const splitItem = splitPreview.find((s) => s.userId === m.id);

                return (
                  <div
                    key={m.id}
                    onClick={() => toggleParticipant(m.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer select-none text-xs transition-all ${
                      isChecked
                        ? 'bg-accent/15 border-accent/40 shadow-xs'
                        : 'bg-white/40 border-navy-100/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-accent shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-navy-300 shrink-0" />
                      )}
                      <span className="font-bold text-navy-950 truncate">
                        {m.full_name.split(' ')[0]}
                      </span>
                    </div>

                    {isChecked && splitItem && previewPaisa > 0 && (
                      <span className="text-[10px] font-black text-navy-900 shrink-0 ml-1">
                        {formatBDT(splitItem.sharePaisa)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* 5. Notes */}
        <GlassCard className="p-2.5">
          <input
            type="text"
            placeholder="Notes (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 text-navy-950 text-xs outline-none focus:border-accent"
          />
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {onCancel && (
            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </GlassButton>
          )}
          <GlassButton
            type="submit"
            variant="primary"
            size="sm"
            fullWidth={!onCancel}
            isLoading={isSubmitting}
            className="flex-1"
          >
            {isEditing ? 'Save Changes' : 'Save Expense'}
          </GlassButton>
        </div>
      </form>

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />
    </>
  );
};
