'use client';

import React from 'react';
import { getInitials, getAvatarColor } from '../../lib/formatters';

interface AvatarProps {
  name: string;
  id?: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  id = name,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-5 h-5 text-[8px] rounded-md',
    sm: 'w-6 h-6 text-[10px] rounded-lg',
    md: 'w-8 h-8 text-xs rounded-xl',
    lg: 'w-10 h-10 text-sm rounded-xl',
    xl: 'w-14 h-14 text-base rounded-2xl',
  };

  if (avatarUrl && avatarUrl.trim()) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} object-cover shadow-xs border border-white/80 shrink-0 ${className}`}
      />
    );
  }

  const initials = getInitials(name);
  const color = getAvatarColor(id || name);

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-tr ${color.bg} text-white font-black flex items-center justify-center shrink-0 shadow-xs border border-white/60 ${className}`}
    >
      {initials}
    </div>
  );
};
