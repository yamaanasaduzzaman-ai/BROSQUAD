'use client';

import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { SuggestedSettlements } from '../../components/Settlement/SuggestedSettlements';
import { SettlementHistory } from '../../components/Settlement/SettlementHistory';
import { RecordSettlementModal } from '../../components/Settlement/RecordSettlementModal';
import { GlassCard } from '../../components/UI/GlassCard';
import { GlassButton } from '../../components/UI/GlassButton';
import { formatBDT, getInitials, getAvatarColor } from '../../lib/formatters';
import { SuggestedSettlement } from '../../lib/types';
import { Scale, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';

export default function BalancePage() {
  const { memberBalances, suggestedSettlements, members } = useRoom();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<SuggestedSettlement | null>(null);

  const handleStartSettle = (suggestion?: SuggestedSettlement) => {
    setSelectedSuggestion(suggestion || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base sm:text-lg font-black text-navy-950 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-primary" />
          Balances & Settlements
        </h1>

        {members.length >= 2 && (
          <GlassButton
            variant="primary"
            size="sm"
            icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
            onClick={() => handleStartSettle()}
          >
            Record Payment
          </GlassButton>
        )}
      </div>

      {/* Member Balances Compact Grid */}
      {members.length === 0 ? (
        <GlassCard className="text-center py-6">
          <p className="text-xs text-text-secondary">Add roommates to see balance calculations.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {memberBalances.map((m) => {
            const isMe = m.user_id === currentUser?.id;
            const initials = getInitials(m.full_name);
            const color = getAvatarColor(m.user_id);
            const isReceivable = m.net_balance_paisa > 0;
            const isPayable = m.net_balance_paisa < 0;

            return (
              <GlassCard
                key={m.user_id}
                className={`p-2.5 flex flex-col justify-between border ${
                  isMe ? 'border-accent/40 shadow-xs' : 'border-white/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${color.bg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}
                    >
                      {initials}
                    </div>
                    <span className="text-xs font-bold text-navy-950 truncate">
                      {m.full_name.split(' ')[0]}
                    </span>
                  </div>

                  {isReceivable && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                  {isPayable && <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                  {!isReceivable && !isPayable && <Check className="w-3 h-3 text-navy-600" />}
                </div>

                <div className="text-[10px] text-text-secondary space-y-0.5 border-t border-navy-100/60 pt-1">
                  <div className="flex justify-between">
                    <span>Paid:</span>
                    <strong className="text-navy-900">{formatBDT(m.total_paid_paisa)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Share:</span>
                    <strong className="text-navy-900">{formatBDT(m.total_share_paisa)}</strong>
                  </div>
                </div>

                <div className="mt-1.5 pt-1 border-t border-navy-100/60">
                  <span
                    className={`text-xs font-black block ${
                      isReceivable
                        ? 'text-emerald-700'
                        : isPayable
                        ? 'text-rose-700'
                        : 'text-navy-900'
                    }`}
                  >
                    {isReceivable ? '+' : ''}
                    {formatBDT(m.net_balance_paisa)}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Suggested Settlements Section */}
      <SuggestedSettlements
        suggestions={suggestedSettlements}
        onSettle={(item) => handleStartSettle(item)}
      />

      {/* Recorded Settlement History */}
      <SettlementHistory />

      {/* Record Settlement Modal */}
      <RecordSettlementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSuggestion(null);
        }}
        initialSuggestion={selectedSuggestion}
      />
    </div>
  );
}
