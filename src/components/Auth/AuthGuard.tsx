'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../Navigation/Header';
import { BottomNav } from '../Navigation/BottomNav';
import { Loader2 } from 'lucide-react';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser && !isLoginPage) {
        router.replace('/login');
      } else if (currentUser && isLoginPage) {
        router.replace('/');
      }
    }
  }, [currentUser, isLoading, isLoginPage, router]);

  // If loading authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-md font-black text-xl mb-3 animate-pulse">
          BS
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-navy-800">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span>Loading BRO SQUAD...</span>
        </div>
      </div>
    );
  }

  // If on login page, render clean login view without navigation bars
  if (isLoginPage) {
    return <main className="min-h-screen flex items-center justify-center p-3">{children}</main>;
  }

  // If not logged in and not on login page, prevent flash of content while redirecting
  if (!currentUser) {
    return null;
  }

  // Authenticated: Render full application with Header and BottomNav
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-2 sm:px-4 pt-2 sm:pt-3">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
