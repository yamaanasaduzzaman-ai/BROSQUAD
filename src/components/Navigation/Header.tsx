'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { getInitials, getAvatarColor } from '../../lib/formatters';
import { AddMemberModal } from '../Members/AddMemberModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, switchUser, logout } = useAuth();
  const { room, members } = useRoom();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const initials = currentUser ? getInitials(currentUser.full_name) : 'BS';
  const avatarStyle = currentUser ? getAvatarColor(currentUser.id) : { bg: 'from-primary to-accent', text: 'text-white', border: 'border-white' };

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

            {/* Quick Add Member button */}
            <button
              onClick={() => setShowAddMember(true)}
              className="p-1.5 rounded-xl bg-white/70 hover:bg-white text-navy-800 border border-white/80 shadow-sm flex items-center gap-1 text-[11px] font-bold ml-1 transition-all"
              title="Add Roommate"
            >
              <UserPlus className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Add Member</span>
            </button>
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
                <div
                  className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${avatarStyle.bg} flex items-center justify-center text-white font-bold text-[10px]`}
                >
                  {initials}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-navy-900 truncate max-w-[80px]">
                  {currentUser?.full_name?.split(' ')[0] || 'Member'}
                </span>
                <ChevronDown className="w-3 h-3 text-text-secondary" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-1 w-56 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-floating p-2 z-50 animate-in fade-in">
                  <div className="px-2 py-1 border-b border-navy-100 mb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-text-secondary">
                      Switch Member
                    </span>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowAddMember(true);
                      }}
                      className="text-[10px] font-bold text-accent hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> New
                    </button>
                  </div>

                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {members.length === 0 ? (
                      <p className="text-[11px] text-text-secondary px-2 py-1.5">
                        No members yet. Click &apos;New&apos; to add.
                      </p>
                    ) : (
                      members.map((m) => {
                        const isSelected = m.id === currentUser?.id;
                        const mInit = getInitials(m.full_name);
                        const mColor = getAvatarColor(m.id);

                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              switchUser(m.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                              isSelected
                                ? 'bg-primary text-white font-bold'
                                : 'hover:bg-navy-50 text-navy-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div
                                className={`w-5 h-5 rounded-md bg-gradient-to-tr ${mColor.bg} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}
                              >
                                {mInit}
                              </div>
                              <span className="truncate">{m.full_name}</span>
                            </div>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-navy-100 flex flex-col gap-0.5">
                    <Link
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-navy-800 hover:bg-navy-50"
                    >
                      <Sliders className="w-3.5 h-3.5 text-text-secondary" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-expense hover:bg-rose-50 w-full text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-expense" />
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
