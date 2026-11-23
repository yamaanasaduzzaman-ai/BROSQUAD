'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Users,
  UserPlus,
  ChevronDown,
  LogOut,
  Sliders,
  Receipt,
  Scale,
  BarChart3,
  Plus,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { AddMemberModal } from '../Members/AddMemberModal';
import { Avatar } from '../UI/Avatar';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAdmin, logout } = useAuth();
  const { room, members } = useRoom();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-glass-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between">
          {/* Brand & Room Info */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-sm font-black text-xs">
                BS
              </div>
              <span className="font-black text-sm sm:text-base tracking-tight text-navy-950">
                BRO SQUAD
              </span>
            </Link>

            {/* Quick Add Member button (Admin only) */}
            {isAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="p-1.5 rounded-xl bg-white/70 hover:bg-white text-navy-800 border border-white/80 shadow-sm flex items-center gap-1 text-[11px] font-bold ml-1 transition-all"
                title="Add Roommate"
              >
                <UserPlus className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline">Add Member</span>
              </button>
            )}
          </div>

          {/* Compact Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Dashboard', href: '/', icon: Receipt },
              { label: 'Expenses', href: '/expenses', icon: Receipt },
              { label: 'Balances', href: '/balance', icon: Scale },
              { label: 'Members', href: '/members', icon: Users },
              { label: 'Reports', href: '/reports', icon: BarChart3 },
            ].map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-navy-700 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Icon Actions: Quick New Expense + User Switcher */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/expenses/new"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-primary text-white flex items-center gap-1 text-xs font-bold shadow-sm hover:bg-primary-light transition-all"
              title="Add Expense"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Expense</span>
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-white/70 hover:bg-white text-navy-900 border border-white/80 transition-all"
              >
                <Avatar
                  name={currentUser?.full_name || 'Member'}
                  id={currentUser?.id}
                  avatarUrl={currentUser?.avatar_url}
                  size="sm"
                />
                <span className="hidden sm:inline text-xs font-bold text-navy-900 truncate max-w-[80px]">
                  {currentUser?.full_name?.split(' ')[0] || 'Member'}
                </span>
                {isAdmin && (
                  <span className="hidden sm:inline text-[9px] bg-accent/15 text-accent font-black px-1 rounded">
                    Admin
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-text-secondary" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-1 w-52 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-floating p-2 z-50 animate-in fade-in">
                  {/* Current User Card */}
                  <div className="p-2 rounded-xl bg-navy-50/80 mb-1.5 flex items-center gap-2">
                    <Avatar
                      name={currentUser?.full_name || 'Member'}
                      id={currentUser?.id}
                      avatarUrl={currentUser?.avatar_url}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-navy-950 truncate">
                        {currentUser?.full_name}
                      </p>
                      <p className="text-[10px] text-text-secondary truncate">
                        @{currentUser?.username || 'user'} · {currentUser?.role === 'admin' ? 'Admin' : 'Member'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <Link
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-navy-800 hover:bg-navy-50 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-text-secondary" />
                      Account Settings
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        router.push('/login');
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 w-full text-left transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />
    </>
  );
};
