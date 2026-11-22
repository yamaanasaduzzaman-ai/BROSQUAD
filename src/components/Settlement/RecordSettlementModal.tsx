'use client';

import React, { useState, useEffect } from 'react';
import { PaymentMethod, PAYMENT_METHODS, SuggestedSettlement } from '../../lib/types';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../UI/Modal';
import { GlassButton } from '../UI/GlassButton';
import { bdtToPaisa, paisaToBdt } from '../../lib/calculations';
import { AlertCircle } from 'lucide-react';

interface RecordSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSuggestion?: SuggestedSettlement | null;
}

export const RecordSettlementModal: React.FC<RecordSettlementModalProps> = ({
  isOpen,
  onClose,
  initialSuggestion,
}) => {
  const { members, recordSettlement } = useRoom();
  const { currentUser } = useAuth();

  const [senderId, setSenderId] = useState<string>('');
  const [receiverId, setReceiverId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialSuggestion) {
      setSenderId(initialSuggestion.from_user_id);
      setReceiverId(initialSuggestion.to_user_id);
      setAmountStr(String(paisaToBdt(initialSuggestion.amount_paisa)));
    } else if (members.length >= 2) {
      setSenderId(currentUser?.id || members[0].id);
      setReceiverId(members.find((m) => m.id !== (currentUser?.id || members[0].id))?.id || members[1].id);
      setAmountStr('');
    }
    setError(null);
  }, [initialSuggestion, isOpen, members, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (senderId === receiverId) {
      setError('Sender and receiver must be different.');
      return;
    }

    const amountPaisa = bdtToPaisa(amountStr);
    if (amountPaisa <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await recordSettlement({
        sender_id: senderId,
        receiver_id: receiverId,
        amount_paisa: amountPaisa,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
        {error && (
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sender & Receiver in 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1">
              Payer (Sent)
            </label>
            <select
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 font-bold outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} {m.id === currentUser?.id ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1">
              Receiver (Got)
            </label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 font-bold outline-none"
            >
              {members
                .filter((m) => m.id !== senderId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} {m.id === currentUser?.id ? '(You)' : ''}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1">
            Amount (BDT)
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
              className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 font-black text-sm outline-none"
            />
          </div>
        </div>

        {/* Payment Method Pills */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1">
            Method
          </label>
          <div className="flex flex-wrap gap-1">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white/60 hover:bg-white text-navy-800 border-navy-200/70'
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Note */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1">
              Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 font-semibold outline-none text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-navy-800 mb-1">
              TrxID / Note
            </label>
            <input
              type="text"
              placeholder="Optional..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white/80 border border-navy-200/80 outline-none text-xs"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-2 pt-2">
          <GlassButton type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="flex-1">
            Confirm
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
};
