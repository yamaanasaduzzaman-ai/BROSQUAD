'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, UserPlus, ArrowRightLeft, BarChart3, Receipt } from 'lucide-react';

interface QuickActionsProps {
  onOpenSettleModal?: () => void;
  onOpenAddMember?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenSettleModal,
  onOpenAddMember,
}) => {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-2 sm:my-3">
      {/* 1. Add Expense */}
      <Link
        href="/expenses/new"
        className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-primary text-white shadow-sm hover:bg-primary-light active:scale-95 transition-all text-center"
      >
        <PlusCircle className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] font-bold tracking-tight">+ Expense</span>
      </Link>

      {/* 2. Add Member */}
      <button
        type="button"
        onClick={onOpenAddMember}
        className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/75 hover:bg-white text-navy-900 border border-white/80 active:scale-95 transition-all text-center shadow-glass-sm"
      >
        <UserPlus className="w-4 h-4 text-accent mb-0.5" />
        <span className="text-[10px] font-bold text-navy-900 tracking-tight">+ Member</span>
      </button>

      {/* 3. Settle Up */}
      <button
        type="button"
        onClick={onOpenSettleModal}
        className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/75 hover:bg-white text-navy-900 border border-white/80 active:scale-95 transition-all text-center shadow-glass-sm"
      >
        <ArrowRightLeft className="w-4 h-4 text-emerald-600 mb-0.5" />
        <span className="text-[10px] font-bold text-navy-900 tracking-tight">Settle</span>
      </button>

      {/* 4. Reports */}
      <Link
        href="/reports"
        className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/75 hover:bg-white text-navy-900 border border-white/80 active:scale-95 transition-all text-center shadow-glass-sm"
      >
        <BarChart3 className="w-4 h-4 text-secondary mb-0.5" />
        <span className="text-[10px] font-bold text-navy-900 tracking-tight">Reports</span>
      </Link>
    </div>
  );
};
