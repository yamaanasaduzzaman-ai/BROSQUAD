'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExpenseForm } from '../../../components/Expenses/ExpenseForm';
import { ArrowLeft, PlusCircle } from 'lucide-react';

export default function NewExpensePage() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto space-y-2 animate-in fade-in duration-200">
      {/* Top back navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-xl bg-white/70 hover:bg-white text-navy-800 border border-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm sm:text-base font-black text-navy-950 flex items-center gap-1.5">
          <PlusCircle className="w-4 h-4 text-accent" />
          Add Expense
        </h1>
      </div>

      <ExpenseForm
        onSuccess={() => router.push('/expenses')}
        onCancel={() => router.back()}
      />
    </div>
  );
}
