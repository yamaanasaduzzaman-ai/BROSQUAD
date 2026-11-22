'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Expense, Settlement, MemberBalance, Profile } from '../../lib/types';
import { GlassCard } from '../UI/GlassCard';
import { GlassButton } from '../UI/GlassButton';
import { paisaToBdt } from '../../lib/calculations';
import { formatBDT } from '../../lib/formatters';
import {
  PieChart as PieIcon,
  Users,
  Award,
  Flame,
  Download,
} from 'lucide-react';

interface ExpenseChartsProps {
  expenses: Expense[];
  settlements: Settlement[];
  members: Profile[];
  memberBalances: MemberBalance[];
}

const CATEGORY_COLORS = [
  '#173B67',
  '#4B8FE8',
  '#16A675',
  '#E15B67',
  '#F59E0B',
  '#8B5CF6',
  '#06B6D4',
  '#EC4899',
  '#64748B',
];

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  expenses,
  settlements,
  memberBalances,
}) => {
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const exp of expenses) {
      const current = map.get(exp.category) || 0;
      map.set(exp.category, current + exp.amount_paisa);
    }
    return Array.from(map.entries())
      .map(([name, paisa]) => ({
        name,
        value: paisaToBdt(paisa),
        paisa,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const memberData = useMemo(() => {
    return memberBalances.map((m) => ({
      name: m.full_name.split(' ')[0],
      paid: paisaToBdt(m.total_paid_paisa),
      share: paisaToBdt(m.total_share_paisa),
    }));
  }, [memberBalances]);

  const highestCategory = categoryData[0];
  const highestContributor = useMemo(() => {
    return [...memberBalances].sort(
      (a, b) => b.total_paid_paisa - a.total_paid_paisa
    )[0];
  }, [memberBalances]);

  const exportExpensesCSV = () => {
    const headers = ['ID', 'Title', 'Amount', 'Category', 'PaidBy', 'Date'];
    const rows = expenses.map((e) => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      paisaToBdt(e.amount_paisa),
      e.category,
      `"${e.payer?.full_name || e.paid_by}"`,
      e.expense_date,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportSettlementsCSV = () => {
    const headers = ['ID', 'Sender', 'Receiver', 'Amount', 'Method', 'Date'];
    const rows = settlements.map((s) => [
      s.id,
      `"${s.sender?.full_name || s.sender_id}"`,
      `"${s.receiver?.full_name || s.receiver_id}"`,
      paisaToBdt(s.amount_paisa),
      s.payment_method,
      s.payment_date,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `settlements_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (expenses.length === 0) {
    return (
      <GlassCard className="text-center py-8">
        <p className="text-xs text-text-secondary">No expenses to visualize yet.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top Highlights */}
      <div className="grid grid-cols-2 gap-2">
        {highestCategory && (
          <GlassCard className="p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-text-secondary flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-500" /> Top Cat
              </span>
              <p className="text-xs font-black text-navy-950 truncate mt-0.5">{highestCategory.name}</p>
              <span className="text-[10px] text-text-secondary">{formatBDT(highestCategory.paisa)}</span>
            </div>
          </GlassCard>
        )}

        {highestContributor && (
          <GlassCard className="p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-text-secondary flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" /> Top Payer
              </span>
              <p className="text-xs font-black text-navy-950 truncate mt-0.5">{highestContributor.full_name.split(' ')[0]}</p>
              <span className="text-[10px] text-text-secondary">{formatBDT(highestContributor.total_paid_paisa)}</span>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Category Distribution Chart */}
      <GlassCard className="p-3">
        <div className="flex items-center gap-1.5 pb-1.5 border-b border-navy-100 mb-2">
          <PieIcon className="w-3.5 h-3.5 text-accent" />
          <h3 className="text-xs font-bold text-navy-950">Categories</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`৳${val.toLocaleString()}`, 'BDT']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1">
            {categoryData.slice(0, 5).map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-[11px] p-1 rounded bg-white/60">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="font-semibold text-navy-900 truncate">{cat.name}</span>
                </div>
                <span className="font-black text-navy-950">{formatBDT(cat.paisa)}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Member Spending Bar Chart */}
      <GlassCard className="p-3">
        <div className="flex items-center gap-1.5 pb-1.5 border-b border-navy-100 mb-2">
          <Users className="w-3.5 h-3.5 text-primary" />
          <h3 className="text-xs font-bold text-navy-950">Roommate Spending (Paid vs Share)</h3>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#172B46', fontSize: 10, fontWeight: 700 }} />
              <YAxis tick={{ fill: '#71839B', fontSize: 9 }} />
              <Tooltip formatter={(val: number) => [`৳${val.toLocaleString()}`, 'BDT']} />
              <Bar dataKey="paid" fill="#173B67" name="Paid" radius={[4, 4, 0, 0]} />
              <Bar dataKey="share" fill="#4B8FE8" name="Share" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Export Buttons */}
      <div className="flex gap-2">
        <GlassButton
          variant="glass"
          size="sm"
          icon={<Download className="w-3 h-3 text-primary" />}
          onClick={exportExpensesCSV}
          className="flex-1 text-[11px]"
        >
          CSV Expenses
        </GlassButton>
        <GlassButton
          variant="glass"
          size="sm"
          icon={<Download className="w-3 h-3 text-emerald-600" />}
          onClick={exportSettlementsCSV}
          className="flex-1 text-[11px]"
        >
          CSV Settlements
        </GlassButton>
      </div>
    </div>
  );
};
