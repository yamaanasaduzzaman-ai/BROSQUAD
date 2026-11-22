'use client';

import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { useAuth } from '../context/AuthContext';
import { SummaryCards } from '../components/Dashboard/SummaryCards';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { MemberBalancesOverview } from '../components/Dashboard/MemberBalancesOverview';
import { RecentExpenses } from '../components/Dashboard/RecentExpenses';
import { RecordSettlementModal } from '../components/Settlement/RecordSettlementModal';
import { ExpenseDetailModal } from '../components/Expenses/ExpenseDetailModal';
import { AddMemberModal } from '../components/Members/AddMemberModal';
import { Expense } from '../lib/types';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { expenses } = useRoom();

  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleSelectExpense = (expenseId: string) => {
    const exp = expenses.find((e) => e.id === expenseId);
    if (exp) setSelectedExpense(exp);
  };

  return (
    <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-200">
      {/* 4 Summary Cards */}
      <SummaryCards />

      {/* Quick Action Icon Row */}
      <QuickActions
        onOpenSettleModal={() => setIsSettleModalOpen(true)}
        onOpenAddMember={() => setIsAddMemberOpen(true)}
      />

      {/* Roommates Balances Overview */}
      <MemberBalancesOverview
        onOpenAddMember={() => setIsAddMemberOpen(true)}
      />

      {/* Recent Activity */}
      <RecentExpenses onSelectExpense={handleSelectExpense} />

      {/* Settle Up Payment Modal */}
      <RecordSettlementModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        onEdit={(exp) => router.push(`/expenses/${exp.id}`)}
      />
    </div>
  );
}
