import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-white/70 backdrop-blur-xl border border-white/80 shadow-glass',
    elevated:
      'bg-white/80 backdrop-blur-2xl border border-white/90 shadow-glass-lg',
    subtle:
      'bg-white/50 backdrop-blur-md border border-white/40 shadow-glass-sm',
    interactive:
      'bg-white/70 hover:bg-white/85 backdrop-blur-xl border border-white/80 shadow-glass hover:shadow-glass-lg active:scale-[0.99] transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={`rounded-2xl p-3 sm:p-4 transition-all ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
