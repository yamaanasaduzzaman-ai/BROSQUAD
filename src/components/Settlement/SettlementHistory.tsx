'use client';

import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../UI/GlassCard';
import { formatBDT } from '../../lib/formatters';
import { ArrowRight, History, Trash2 } from 'lucide-react';

export const SettlementHistory: React.FC = () => {
  const { settlements, deleteSettlement } = useRoom();
  const { isAdmin } = useAuth();

  return (
    <GlassCard className="p-3">
      <div className="flex items-center gap-1.5 pb-2 border-b border-navy-100 mb-2">
        <History className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-xs sm:text-sm font-bold text-navy-950">
          Payment History ({settlements.length})
        </h3>
      </div>

      {settlements.length === 0 ? (
        <div className="text-center py-4 text-xs text-text-secondary">
          No payments recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-navy-100/70">
          {settlements.map((set) => {
            const senderName = set.sender?.full_name || 'Roommate';
            const receiverName = set.receiver?.full_name || 'Roommate';

            return (
              <div
                key={set.id}
                className="py-1.5 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-1 truncate min-w-0">
                  <span className="font-bold text-navy-900 truncate">
                    {senderName.split(' ')[0]}
                  </span>
                  <ArrowRight className="w-3 h-3 text-accent shrink-0" />
                  <span className="font-bold text-navy-900 truncate">
                    {receiverName.split(' ')[0]}
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-navy-100 text-navy-800 font-bold shrink-0 ml-1">
                    {set.payment_method}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-emerald-700">
                    {formatBDT(set.amount_paisa)}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => deleteSettlement(set.id)}
                      className="p-1 text-text-muted hover:text-rose-600 transition-colors"
                      title="Delete settlement"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};
