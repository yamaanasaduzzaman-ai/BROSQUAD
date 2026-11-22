'use client';

import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { ExpenseCharts } from '../../components/Analytics/ExpenseCharts';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const { expenses, settlements, members, memberBalances } = useRoom();

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      <h1 className="text-base sm:text-lg font-black text-navy-950 flex items-center gap-1.5">
        <BarChart3 className="w-4 h-4 text-primary" />
        Analytics
      </h1>

      <ExpenseCharts
        expenses={expenses}
        settlements={settlements}
        members={members}
        memberBalances={memberBalances}
      />
    </div>
  );
}
