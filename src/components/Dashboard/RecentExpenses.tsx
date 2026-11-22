'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from '../UI/GlassCard';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { formatBDT, formatDate } from '../../lib/formatters';
import { Receipt, ChevronRight, PlusCircle, Tag } from 'lucide-react';

interface RecentExpensesProps {
  onSelectExpense?: (expenseId: string) => void;
}

export const RecentExpenses: React.FC<RecentExpensesProps> = ({ onSelectExpense }) => {
  const { expenses } = useRoom();
  const { currentUser } = useAuth();

  const recent = expenses.slice(0, 5);

  return (
    <GlassCard className="p-3 sm:p-4">
      <div className="flex items-center justify-between pb-2 border-b border-navy-100">
        <div className="flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-accent" />
          <h3 className="text-xs sm:text-sm font-bold text-navy-950">
            Recent Expenses ({expenses.length})
          </h3>
        </div>
        <Link
          href="/expenses"
          className="text-[11px] font-semibold text-accent hover:underline flex items-center"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-6">
          <Receipt className="w-8 h-8 text-navy-300 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-navy-800">No expenses recorded</p>
          <Link
            href="/expenses/new"
            className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Expense
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-navy-100/70 mt-1">
          {recent.map((exp) => {
            const isPayerMe = exp.paid_by === currentUser?.id;
            const payerName = exp.payer?.full_name || 'Roommate';

            return (
              <div
                key={exp.id}
                onClick={() => onSelectExpense && onSelectExpense(exp.id)}
                className="py-2 sm:py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-white/50 -mx-1 px-1 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/80 border border-white/80 shadow-sm flex items-center justify-center shrink-0 text-primary">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-navy-950 truncate">
                        {exp.title}
                      </p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-navy-100/80 text-navy-800 font-semibold shrink-0">
                        {exp.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-secondary truncate mt-0.5">
                      {isPayerMe ? 'You' : payerName.split(' ')[0]} · {formatDate(exp.expense_date)} · {exp.participants.length}p
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-black text-navy-950">
                    {formatBDT(exp.amount_paisa)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};
