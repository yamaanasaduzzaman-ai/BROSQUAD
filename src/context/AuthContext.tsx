'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../lib/types';
import { INITIAL_MEMBERS, DataRepository } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

interface AuthContextType {
  currentUser: Profile | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'brosquad_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize persistent session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sessionData.session.user.id)
              .single();

            if (profile && mounted) {
              setCurrentUser(profile as Profile);
              setIsLoading(false);
              return;
            }
          }
        }

        // Check local storage session
        const savedUserId = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
        const members = await DataRepository.getMembers();

        let matched = members.find((m) => m.id === savedUserId);
        // Default to first member (Asaduzzaman) if no previous session
        if (!matched && members.length > 0) {
          matched = members[0];
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, matched.id);
          }
        }

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

    // Listen to Supabase auth state changes if configured
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { data: authListener } = client.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const { data: profile } = await client
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (profile) setCurrentUser(profile as Profile);
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
          }
        }
      );
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (
    emailOrUsername: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const query = emailOrUsername.trim().toLowerCase();

      // If Supabase is configured and valid email format
      if (isSupabaseConfigured && supabase && query.includes('@') && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: query,
          password: password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setCurrentUser(profile as Profile);
            localStorage.setItem(AUTH_STORAGE_KEY, profile.id);
            return { success: true };
          }
        }
      }

      // Check among room members (by email, full name, or username)
      const members = await DataRepository.getMembers();
      const matched = members.find(
        (m) =>
          m.email.toLowerCase() === query ||
          m.full_name.toLowerCase() === query ||
          m.email.split('@')[0].toLowerCase() === query ||
          m.full_name.toLowerCase().includes(query)
      );

      if (!matched) {
        return {
          success: false,
          error: 'No registered member found with this name or email.',
        };
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
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
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

  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!currentUser) return;
    const updated = await DataRepository.updateMemberProfile(currentUser.id, updates);
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
