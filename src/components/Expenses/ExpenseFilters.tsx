'use client';

import React from 'react';
import { EXPENSE_CATEGORIES, Profile } from '../../lib/types';
import { GlassCard } from '../UI/GlassCard';
import { Search, ArrowUpDown, X, Filter } from 'lucide-react';

interface ExpenseFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedPayer: string;
  onPayerChange: (payerId: string) => void;
  sortOrder: 'desc' | 'asc';
  onSortToggle: () => void;
  members: Profile[];
  filteredCount: number;
  totalFilteredAmountFormatted: string;
  onReset: () => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPayer,
  onPayerChange,
  sortOrder,
  onSortToggle,
  members,
  filteredCount,
  totalFilteredAmountFormatted,
  onReset,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) || Boolean(selectedCategory) || Boolean(selectedPayer);

  return (
    <GlassCard className="p-2 sm:p-2.5 mb-2 sm:mb-3 space-y-1.5">
      {/* Top Search & Filter row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-6 py-1.5 rounded-xl bg-white/80 border border-navy-200/70 text-navy-950 text-xs font-semibold placeholder:text-text-muted outline-none focus:border-accent"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy-900"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-2 py-1.5 rounded-xl bg-white/80 border border-navy-200/70 text-navy-900 text-xs font-semibold outline-none max-w-[100px] sm:max-w-[130px] truncate"
        >
          <option value="">Categories</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Payer dropdown */}
        {members.length > 0 && (
          <select
            value={selectedPayer}
            onChange={(e) => onPayerChange(e.target.value)}
            className="px-2 py-1.5 rounded-xl bg-white/80 border border-navy-200/70 text-navy-900 text-xs font-semibold outline-none max-w-[90px] sm:max-w-[120px] truncate"
          >
            <option value="">Payers</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name.split(' ')[0]}
              </option>
            ))}
          </select>
        )}

        {/* Sort toggle */}
        <button
          type="button"
          onClick={onSortToggle}
          className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-navy-800 border border-navy-200/70 text-xs shrink-0"
          title={`Sort ${sortOrder === 'desc' ? 'Oldest first' : 'Newest first'}`}
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-accent" />
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between text-[11px] px-1 text-text-secondary">
        <span>
          <strong className="text-navy-950">{filteredCount}</strong> items · <strong className="text-primary">{totalFilteredAmountFormatted}</strong>
        </span>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[10px] font-bold text-rose-600 hover:underline"
          >
            Reset
          </button>
        )}
      </div>
    </GlassCard>
  );
};
