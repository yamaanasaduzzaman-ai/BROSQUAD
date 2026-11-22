'use client';

import React from 'react';
import { Expense } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../UI/GlassCard';
import { formatBDT, formatDate, getInitials, getAvatarColor } from '../../lib/formatters';
import { Calendar, Tag, ChevronRight } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  onViewDetails: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onViewDetails,
}) => {
  const { currentUser } = useAuth();
  const isPayerMe = expense.paid_by === currentUser?.id;
  const myParticipant = expense.participants.find((p) => p.user_id === currentUser?.id);

  const payerName = expense.payer?.full_name || 'Roommate';
  const payerInitials = getInitials(payerName);
  const payerColor = getAvatarColor(expense.paid_by);

  return (
    <GlassCard
      variant="interactive"
      onClick={() => onViewDetails(expense)}
      className="p-2.5 sm:p-3 relative group"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${payerColor.bg} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}
            title={`Paid by ${isPayerMe ? 'You' : payerName}`}
          >
            {payerInitials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-navy-950 truncate">
                {expense.title}
              </h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-navy-100 text-navy-800 font-semibold shrink-0">
                {expense.category}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-text-secondary mt-0.5 truncate">
              <span>{isPayerMe ? 'You paid' : payerName.split(' ')[0]}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {formatDate(expense.expense_date)}
              </span>
              <span>•</span>
              <span>{expense.participants.length} split</span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Share */}
        <div className="text-right shrink-0 flex items-center gap-2">
          <div>
            <div className="text-xs sm:text-sm font-black text-navy-950">
              {formatBDT(expense.amount_paisa)}
            </div>
            {myParticipant && (
              <span className="text-[9px] font-bold text-accent">
                Share: {formatBDT(myParticipant.share_paisa)}
              </span>
            )}
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-navy-900 transition-colors" />
        </div>
      </div>
    </GlassCard>
  );
};
