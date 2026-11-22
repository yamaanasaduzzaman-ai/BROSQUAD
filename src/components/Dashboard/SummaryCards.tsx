'use client';

import React from 'react';
import { GlassCard } from '../UI/GlassCard';
import { useRoom } from '../../context/RoomContext';
import { formatBDT } from '../../lib/formatters';
import { Wallet, TrendingUp, UserCheck, ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';

export const SummaryCards: React.FC = () => {
  const { overview } = useRoom();

  const isReceivable = overview.my_balance_paisa > 0;
  const isPayable = overview.my_balance_paisa < 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
      {/* 1. Total Room Expenses */}
      <GlassCard className="p-2.5 sm:p-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            Total
          </span>
          <div className="text-base sm:text-lg font-black text-navy-950 tracking-tight mt-0.5">
            {formatBDT(overview.total_expenses_paisa)}
          </div>
        </div>
      </GlassCard>

      {/* 2. My Contribution */}
      <GlassCard className="p-2.5 sm:p-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
            <Wallet className="w-3 h-3 text-accent" />
            Paid
          </span>
          <div className="text-base sm:text-lg font-black text-navy-950 tracking-tight mt-0.5">
            {formatBDT(overview.my_contribution_paisa)}
          </div>
        </div>
      </GlassCard>

      {/* 3. My Share */}
      <GlassCard className="p-2.5 sm:p-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-secondary" />
            Share
          </span>
          <div className="text-base sm:text-lg font-black text-navy-950 tracking-tight mt-0.5">
            {formatBDT(overview.my_share_paisa)}
          </div>
        </div>
      </GlassCard>

      {/* 4. My Balance */}
      <GlassCard
        className={`p-2.5 sm:p-3 flex items-center justify-between border ${
          isReceivable
            ? 'bg-emerald-500/10 border-emerald-400/40 text-emerald-800'
            : isPayable
            ? 'bg-rose-500/10 border-rose-400/40 text-rose-800'
            : 'border-white/80'
        }`}
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
            {isReceivable && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
            {isPayable && <ArrowUpRight className="w-3 h-3 text-rose-600" />}
            {!isReceivable && !isPayable && <Check className="w-3 h-3 text-navy-600" />}
            Balance
          </span>
          <div
            className={`text-base sm:text-lg font-black tracking-tight mt-0.5 ${
              isReceivable
                ? 'text-emerald-700'
                : isPayable
                ? 'text-rose-700'
                : 'text-navy-950'
            }`}
          >
            {overview.my_balance_paisa > 0 ? '+' : ''}
            {formatBDT(overview.my_balance_paisa)}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
