'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, Plus, Scale, Users, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Expenses', href: '/expenses', icon: Receipt },
    { label: 'Add', href: '/expenses/new', icon: Plus, isAction: true },
    { label: 'Balances', href: '/balance', icon: Scale },
    { label: 'Members', href: '/members', icon: Users },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-2xl border-t border-white/70 shadow-floating px-2 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative -top-3.5 flex flex-col items-center focus:outline-none"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center shadow-md shadow-accent/35 border-2 border-white active:scale-95 transition-transform">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-navy-700'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive ? 'bg-accent/15 text-primary' : 'bg-transparent'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span
                className={`text-[9px] mt-0.5 ${
                  isActive ? 'font-bold text-primary' : 'font-medium text-text-secondary'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
