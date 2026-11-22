'use client';

import React from 'react';
import { SuggestedSettlement } from '../../lib/types';
import { GlassCard } from '../UI/GlassCard';
import { GlassButton } from '../UI/GlassButton';
import { formatBDT, getInitials, getAvatarColor } from '../../lib/formatters';
import { ArrowRight, Sparkles, CheckCircle2, Send } from 'lucide-react';

interface SuggestedSettlementsProps {
  suggestions: SuggestedSettlement[];
  onSettle: (item: SuggestedSettlement) => void;
}

export const SuggestedSettlements: React.FC<SuggestedSettlementsProps> = ({
  suggestions,
  onSettle,
}) => {
  return (
    <GlassCard className="p-3 mb-3">
      <div className="flex items-center gap-1.5 pb-2 border-b border-navy-100 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <h3 className="text-xs sm:text-sm font-bold text-navy-950">
          Settlement Plan ({suggestions.length})
        </h3>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-4 text-xs text-text-secondary">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <p className="font-semibold text-navy-900">All Balances Settled!</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {suggestions.map((item, idx) => {
            const senderColor = getAvatarColor(item.from_user_id);
            const receiverColor = getAvatarColor(item.to_user_id);

            return (
              <div
                key={`${item.from_user_id}-${item.to_user_id}-${idx}`}
                className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-white/80 gap-2 text-xs"
              >
                {/* Visual Flow: Sender -> Arrow -> Receiver */}
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <div className="flex items-center gap-1 truncate">
                    <div
                      className={`w-5 h-5 rounded-md bg-gradient-to-tr ${senderColor.bg} text-white font-bold text-[8px] flex items-center justify-center shrink-0`}
                    >
                      {getInitials(item.from_name)}
                    </div>
                    <span className="font-bold text-navy-900 truncate">
                      {item.from_name.split(' ')[0]}
                    </span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-accent shrink-0" />

                  <div className="flex items-center gap-1 truncate">
                    <div
                      className={`w-5 h-5 rounded-md bg-gradient-to-tr ${receiverColor.bg} text-white font-bold text-[8px] flex items-center justify-center shrink-0`}
                    >
                      {getInitials(item.to_name)}
                    </div>
                    <span className="font-bold text-navy-900 truncate">
                      {item.to_name.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Amount & Settle Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-navy-950">
                    {formatBDT(item.amount_paisa)}
                  </span>
                  <GlassButton
                    size="sm"
                    variant="primary"
                    onClick={() => onSettle(item)}
                    className="py-1 px-2.5 text-[11px]"
                  >
                    Settle
                  </GlassButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};
