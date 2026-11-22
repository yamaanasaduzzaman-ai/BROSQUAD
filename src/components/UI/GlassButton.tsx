import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'py-2 px-3.5 text-xs rounded-xl font-medium gap-1.5',
    md: 'py-3 px-5 text-sm rounded-2xl font-semibold gap-2',
    lg: 'py-3.5 px-6 text-base rounded-2.5xl font-semibold gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-primary hover:bg-primary-light active:bg-primary-dark text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 border border-primary/20',
    secondary:
      'bg-secondary hover:bg-secondary-light text-white shadow-sm shadow-secondary/15',
    glass:
      'bg-white/70 hover:bg-white/90 active:bg-white text-navy-800 border border-white/80 shadow-glass backdrop-blur-md',
    outline:
      'bg-transparent hover:bg-white/40 text-primary border border-primary/30 active:bg-white/60',
    danger:
      'bg-expense hover:bg-expense-dark text-white shadow-sm shadow-expense/25 border border-expense/20',
    ghost:
      'bg-transparent hover:bg-white/30 text-navy-700 active:bg-white/50',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
