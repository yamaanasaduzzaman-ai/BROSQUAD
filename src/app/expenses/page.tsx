'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRoom } from '../../context/RoomContext';
import { ExpenseFilters } from '../../components/Expenses/ExpenseFilters';
import { ExpenseCard } from '../../components/Expenses/ExpenseCard';
import { ExpenseDetailModal } from '../../components/Expenses/ExpenseDetailModal';
import { GlassButton } from '../../components/UI/GlassButton';
import { GlassCard } from '../../components/UI/GlassCard';
import { Expense } from '../../lib/types';
import { formatBDT } from '../../lib/formatters';
import { Plus, Receipt, AlertCircle } from 'lucide-react';

export default function ExpensesPage() {
  const router = useRouter();
  const { expenses, members } = useRoom();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPayer, setSelectedPayer] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        if (
          searchQuery &&
          !exp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !exp.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        if (selectedCategory && exp.category !== selectedCategory) {
          return false;
        }

        if (selectedPayer && exp.paid_by !== selectedPayer) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.expense_date).getTime();
        const dateB = new Date(b.expense_date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [expenses, searchQuery, selectedCategory, selectedPayer, sortOrder]);

  const totalFilteredPaisa = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount_paisa, 0);
  }, [filteredExpenses]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedPayer('');
  };

  return (
    <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-200">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base sm:text-lg font-black text-navy-950 flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-primary" />
          Expenses ({expenses.length})
        </h1>

        <Link href="/expenses/new">
          <GlassButton variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            New
          </GlassButton>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <ExpenseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPayer={selectedPayer}
        onPayerChange={setSelectedPayer}
        sortOrder={sortOrder}
        onSortToggle={() =>
          setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
        }
        members={members}
        filteredCount={filteredExpenses.length}
        totalFilteredAmountFormatted={formatBDT(totalFilteredPaisa)}
        onReset={handleResetFilters}
      />

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <GlassCard className="text-center py-8">
          <AlertCircle className="w-7 h-7 text-navy-300 mx-auto mb-1.5" />
          <h3 className="text-xs font-bold text-navy-900">No expenses found</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Tap &apos;New&apos; to record a shared expense.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-1.5">
          {filteredExpenses.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onViewDetails={(item) => setSelectedExpense(item)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        onEdit={(exp) => router.push(`/expenses/${exp.id}`)}
      />
    </div>
  );
}
