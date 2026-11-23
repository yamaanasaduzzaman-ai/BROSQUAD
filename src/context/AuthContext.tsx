'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../lib/types';
import { DataRepository } from '../lib/storage';

interface AuthContextType {
  currentUser: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'brosquad_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAdmin = currentUser?.role === 'admin';

  // Initialize persistent session (Strict: No auto-login without valid saved session)
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const members = await DataRepository.getMembers();
        const savedUserId = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null;

        const matched = savedUserId ? members.find((m) => m.id === savedUserId) : null;

        if (mounted) {
          setCurrentUser(matched || null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (
    emailOrUsername: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const query = emailOrUsername.trim().toLowerCase();
      const enteredPass = password?.trim() || '';

      const members = await DataRepository.getMembers();
      const matched = members.find(
        (m) =>
          (m.username && m.username.toLowerCase() === query) ||
          (m.email && m.email.toLowerCase() === query) ||
          m.full_name.toLowerCase() === query ||
          m.id === query
      );

      if (!matched) {
        return {
          success: false,
          error: 'User ID or Username not found.',
        };
      }

      // Check password if profile has password set
      if (matched.password) {
        if (!enteredPass || matched.password !== enteredPass) {
          return {
            success: false,
            error: 'Incorrect password. Please try again.',
          };
        }
      }

      setCurrentUser(matched);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, matched.id);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setCurrentUser(null);
    setIsLoading(false);
  };

  const switchUser = async (userId: string): Promise<void> => {
    const members = await DataRepository.getMembers();
    const target = members.find((m) => m.id === userId);
    if (target) {
      setCurrentUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, target.id);
      }
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<Profile> => {
    if (!currentUser) throw new Error('Not logged in');
    const updated = await DataRepository.updateMemberProfile(currentUser.id, updates);
    setCurrentUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoading,
        login,
        logout,
        switchUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
