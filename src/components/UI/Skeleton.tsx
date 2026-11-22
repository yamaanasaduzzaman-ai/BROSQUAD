import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
  rounded?: string;
}> = ({ className = 'h-6 w-full', rounded = 'rounded-xl' }) => {
  return (
    <div
      className={`animate-pulse bg-navy-200/50 backdrop-blur-sm ${rounded} ${className}`}
    />
  );
};
