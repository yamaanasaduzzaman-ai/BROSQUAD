'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoom } from '../../../context/RoomContext';
import { ExpenseForm } from '../../../components/Expenses/ExpenseForm';
import { GlassCard } from '../../../components/UI/GlassCard';
import { ArrowLeft, Edit3, AlertCircle } from 'lucide-react';

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const { expenses } = useRoom();

  const expenseId = params?.id as string;
  const expense = expenses.find((e) => e.id === expenseId);

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
