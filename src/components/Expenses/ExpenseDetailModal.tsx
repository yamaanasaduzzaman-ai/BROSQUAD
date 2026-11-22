'use client';

import React, { useState } from 'react';
import { Expense } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { Modal } from '../UI/Modal';
import { GlassButton } from '../UI/GlassButton';
import { GlassBadge } from '../UI/GlassBadge';
import { formatBDT, formatDate, getInitials, getAvatarColor } from '../../lib/formatters';
import {
  Calendar,
  CreditCard,
  User,
  Users,
  FileText,
  Trash2,
  Edit,
  AlertTriangle,
} from 'lucide-react';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { currentUser } = useAuth();
  const { deleteExpense } = useRoom();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!expense) return null;

  const isPayer = expense.paid_by === currentUser?.id;
  const isCreator = expense.created_by === currentUser?.id;
  const payerName = expense.payer?.full_name || 'Roommate';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteExpense(expense.id);
      setShowConfirmDelete(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense.title}
      description={`Added on ${formatDate(expense.created_at)}`}
    >
      <div className="space-y-4">
        {/* Total Amount Banner */}
        <div className="p-4 rounded-2.5xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-white/70">
              Total Expense
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-0.5">
              {formatBDT(expense.amount_paisa)}
            </div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-xs font-semibold">
            {expense.category}
          </div>
        </div>

        {/* Paid By & Date Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-navy-50/80 border border-navy-100">
            <span className="text-[10px] uppercase font-bold text-text-secondary flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-accent" />
              Paid By
            </span>
            <p className="text-xs sm:text-sm font-bold text-navy-950 mt-1">
              {isPayer ? 'You' : payerName}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-navy-50/80 border border-navy-100">
            <span className="text-[10px] uppercase font-bold text-text-secondary flex items-center gap-1">
              <Calendar className="w-3 h-3 text-accent" />
              Expense Date
            </span>
            <p className="text-xs sm:text-sm font-bold text-navy-950 mt-1">
              {formatDate(expense.expense_date)}
            </p>
          </div>
        </div>

        {/* Participants Breakdown */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-navy-900 block mb-2">
            Participants Breakdown ({expense.participants.length})
          </span>
          <div className="space-y-2">
            {expense.participants.map((p) => {
              const name = p.profile?.full_name || 'Roommate';
              const isThisMe = p.user_id === currentUser?.id;
              const color = getAvatarColor(p.user_id);
              const inits = getInitials(name);

              return (
                <div
                  key={p.user_id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    isThisMe
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-white/80 border-navy-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${color.bg} text-white font-bold text-[10px] flex items-center justify-center`}
                    >
                      {inits}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-950">
                        {name} {isThisMe ? '(You)' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-navy-900">
                      {formatBDT(p.share_paisa)}
                    </span>
                    <p className="text-[9px] text-text-secondary">Share</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        {expense.notes && (
          <div className="p-3 rounded-2xl bg-navy-50/70 border border-navy-100 text-xs">
            <span className="font-bold text-navy-900 block mb-0.5">Notes:</span>
            <p className="text-text-secondary">{expense.notes}</p>
          </div>
        )}

        {/* Confirm Delete Alert */}
        {showConfirmDelete ? (
          <div className="p-4 rounded-2.5xl bg-rose-50 border border-rose-200 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Confirm Deletion
            </div>
            <p className="text-xs text-rose-700 mb-3">
              Are you sure you want to delete this expense? All roommate balances will update automatically.
            </p>
            <div className="flex items-center gap-2">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1"
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDelete}
                className="flex-1"
              >
                Yes, Delete
              </GlassButton>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-2">
            <GlassButton
              variant="outline"
              size="md"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onEdit(expense);
              }}
              className="flex-1"
            >
              Edit Expense
            </GlassButton>

            <GlassButton
              variant="danger"
              size="md"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowConfirmDelete(true)}
              className="flex-1"
            >
              Delete
            </GlassButton>
          </div>
        )}
      </div>
    </Modal>
  );
};
