'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoom } from '../../../context/RoomContext';
import { useAuth } from '../../../context/AuthContext';
import { ExpenseForm } from '../../../components/Expenses/ExpenseForm';
import { GlassCard } from '../../../components/UI/GlassCard';
import { ArrowLeft, Edit3, AlertCircle, ShieldAlert } from 'lucide-react';

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const { expenses } = useRoom();
  const { isAdmin } = useAuth();

  const expenseId = params?.id as string;
  const expense = expenses.find((e) => e.id === expenseId);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto space-y-4 pt-6">
        <GlassCard className="text-center py-10 space-y-2">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-1" />
          <h2 className="text-sm font-bold text-navy-950">Access Restricted</h2>
          <p className="text-xs text-text-secondary">
            Only the Admin has permission to edit or modify expenses.
          </p>
          <button
            onClick={() => router.push('/expenses')}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold"
          >
            Back to Expenses
          </button>
        </GlassCard>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-2xl bg-white/70 hover:bg-white text-navy-800 border border-white/80 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-navy-950">Expense Not Found</h1>
        </div>
        <GlassCard className="text-center py-10">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-navy-900">
            This expense could not be found or was deleted.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-2 animate-in fade-in duration-200">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-xl bg-white/70 hover:bg-white text-navy-800 border border-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm sm:text-base font-black text-navy-950 flex items-center gap-1.5">
          <Edit3 className="w-4 h-4 text-accent" />
          Edit Expense
        </h1>
      </div>

      <ExpenseForm
        initialExpense={expense}
        onSuccess={() => router.push('/expenses')}
        onCancel={() => router.back()}
      />
    </div>
  );
}
