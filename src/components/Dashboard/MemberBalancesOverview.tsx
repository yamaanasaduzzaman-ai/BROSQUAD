'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from '../UI/GlassCard';
import { Avatar } from '../UI/Avatar';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { formatBDT } from '../../lib/formatters';
import { Users, UserPlus, ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';

interface MemberBalancesOverviewProps {
  onOpenAddMember?: () => void;
}

export const MemberBalancesOverview: React.FC<MemberBalancesOverviewProps> = ({
  onOpenAddMember,
}) => {
  const { memberBalances, members } = useRoom();
  const { currentUser, isAdmin } = useAuth();

  return (
    <GlassCard className="p-3 sm:p-4 mb-3">
      <div className="flex items-center justify-between pb-2 border-b border-navy-100">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-navy-950">
            Roommates ({members.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && onOpenAddMember && (
            <button
              onClick={onOpenAddMember}
              className="p-1 rounded-lg bg-navy-50 hover:bg-navy-100 text-accent transition-colors"
              title="Add Roommate"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          )}
          <Link
            href="/balance"
            className="text-[11px] font-semibold text-accent hover:underline flex items-center"
          >
            All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs font-semibold text-navy-800">No roommates added yet</p>
          <button
            onClick={onOpenAddMember}
            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add First Roommate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
          {memberBalances.map((m) => {
            const isMe = m.user_id === currentUser?.id;
            const isReceivable = m.net_balance_paisa > 0;
            const isPayable = m.net_balance_paisa < 0;

            return (
              <div
                key={m.user_id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                  isMe
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-white/60 border-white/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    name={m.full_name}
                    id={m.user_id}
                    avatarUrl={m.avatar_url}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-navy-900 truncate leading-tight">
                      {m.full_name} {isMe && <span className="text-accent text-[10px]">(You)</span>}
                    </p>
                    <p className="text-[10px] text-text-secondary leading-none mt-0.5">
                      P: {formatBDT(m.total_paid_paisa)} · S: {formatBDT(m.total_share_paisa)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-black px-1.5 py-0.5 rounded-lg border ${
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};
