import React from 'react';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'receivable' | 'payable' | 'neutral' | 'category' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-xs px-3 py-1 rounded-full font-semibold',
  };

  const variantStyles = {
    receivable:
      'bg-emerald-500/15 text-emerald-800 border border-emerald-500/25 backdrop-blur-sm',
    payable:
      'bg-rose-500/15 text-rose-800 border border-rose-500/25 backdrop-blur-sm',
    neutral:
      'bg-navy-500/15 text-navy-800 border border-navy-500/25 backdrop-blur-sm',
    category:
      'bg-white/60 text-navy-700 border border-white/70 shadow-sm backdrop-blur-sm',
    gray: 'bg-slate-200/60 text-slate-700 border border-slate-300/60',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
