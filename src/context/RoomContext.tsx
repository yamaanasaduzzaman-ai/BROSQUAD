'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Profile,
  Room,
  Expense,
  Settlement,
  MemberBalance,
  SuggestedSettlement,
  RoomOverview,
} from '../lib/types';
import { DataRepository, INITIAL_ROOM } from '../lib/storage';
import { calculateMemberBalances, calculateSuggestedSettlements } from '../lib/calculations';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface RoomContextType {
  room: Room;
  members: Profile[];
  expenses: Expense[];
  settlements: Settlement[];
  memberBalances: MemberBalance[];
  suggestedSettlements: SuggestedSettlement[];
  overview: RoomOverview;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addMember: (data: { full_name: string; email?: string; phone?: string }) => Promise<Profile>;
  deleteMember: (id: string) => Promise<void>;
  addExpense: (expenseData: {
    title: string;
    amount_paisa: number;
    category: Expense['category'];
    paid_by: string;
    expense_date: string;
    notes?: string;
    participant_user_ids: string[];
  }) => Promise<Expense>;
  updateExpense: (
    id: string,
    updates: {
      title: string;
      amount_paisa: number;
      category: Expense['category'];
      paid_by: string;
      expense_date: string;
      notes?: string;
      participant_user_ids: string[];
    }
  ) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  recordSettlement: (data: {
    sender_id: string;
    receiver_id: string;
    amount_paisa: number;
    payment_method: Settlement['payment_method'];
    payment_date: string;
    notes?: string;
  }) => Promise<Settlement>;
  deleteSettlement: (id: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [room, setRoom] = useState<Room>(INITIAL_ROOM);
  const [members, setMembers] = useState<Profile[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedMembers, fetchedExpenses, fetchedSettlements] = await Promise.all([
        DataRepository.getMembers(),
        DataRepository.getExpenses(),
        DataRepository.getSettlements(),
      ]);

      setMembers(fetchedMembers);
      setExpenses(fetchedExpenses);
      setSettlements(fetchedSettlements);
    } catch (err: any) {
      console.error('Error fetching room data:', err);
      showToast(err.message || 'Failed to load room data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Reactive Member Balances
  const memberBalances = useMemo(() => {
    return calculateMemberBalances(members, expenses, settlements);
  }, [members, expenses, settlements]);

  // Reactive Suggested Settlements (Greedy Min-Cash-Flow)
  const suggestedSettlements = useMemo(() => {
    return calculateSuggestedSettlements(memberBalances);
  }, [memberBalances]);

  // Overall Financial Statistics for the Logged-in User
  const overview = useMemo<RoomOverview>(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount_paisa, 0);

    const currentMemberBalance = memberBalances.find((b) => b.user_id === currentUser?.id);

    return {
      total_expenses_paisa: totalExpenses,
      my_contribution_paisa: currentMemberBalance?.total_paid_paisa || 0,
      my_share_paisa: currentMemberBalance?.total_share_paisa || 0,
      my_balance_paisa: currentMemberBalance?.net_balance_paisa || 0,
      member_balances: memberBalances,
      suggested_settlements: suggestedSettlements,
    };
  }, [expenses, memberBalances, suggestedSettlements, currentUser?.id]);

  // Add Member
  const handleAddMember = async (data: {
    full_name: string;
    email?: string;
    phone?: string;
  }): Promise<Profile> => {
    const created = await DataRepository.addMember(data);
    await refreshData();
    showToast(`Member "${created.full_name}" added`, 'success');
    return created;
  };

  // Delete Member
  const handleDeleteMember = async (id: string): Promise<void> => {
    await DataRepository.deleteMember(id);
    await refreshData();
    showToast('Member removed', 'info');
  };

  // Add Expense
  const handleAddExpense = async (expenseData: {
    title: string;
    amount_paisa: number;
    category: Expense['category'];
    paid_by: string;
    expense_date: string;
    notes?: string;
    participant_user_ids: string[];
  }): Promise<Expense> => {
    if (!currentUser) throw new Error('You must be logged in to add an expense');

    const created = await DataRepository.addExpense({
      ...expenseData,
      created_by: currentUser.id,
    });

    await refreshData();
    showToast(`Expense "${created.title}" added successfully!`, 'success');
    return created;
  };

  // Update Expense
  const handleUpdateExpense = async (
    id: string,
    updates: {
      title: string;
      amount_paisa: number;
      category: Expense['category'];
      paid_by: string;
      expense_date: string;
      notes?: string;
      participant_user_ids: string[];
    }
  ): Promise<Expense> => {
    if (!currentUser) throw new Error('You must be logged in');

    const updated = await DataRepository.updateExpense(id, {
      ...updates,
      userId: currentUser.id,
    });

    await refreshData();
    showToast(`Expense "${updated.title}" updated successfully!`, 'success');
    return updated;
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in');

    await DataRepository.deleteExpense(id, currentUser.id);
    await refreshData();
    showToast('Expense removed', 'info');
  };

  // Record Settlement
  const handleRecordSettlement = async (data: {
    sender_id: string;
    receiver_id: string;
    amount_paisa: number;
    payment_method: Settlement['payment_method'];
    payment_date: string;
    notes?: string;
  }): Promise<Settlement> => {
    if (!currentUser) throw new Error('You must be logged in');

    const newSet = await DataRepository.addSettlement({
      ...data,
      created_by: currentUser.id,
    });

    await refreshData();
    showToast('Settlement payment recorded successfully!', 'success');
    return newSet;
  };

  // Delete Settlement
  const handleDeleteSettlement = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in');

    await DataRepository.deleteSettlement(id, currentUser.id);
    await refreshData();
    showToast('Settlement record deleted', 'info');
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        members,
        expenses,
        settlements,
        memberBalances,
        suggestedSettlements,
        overview,
        isLoading,
        refreshData,
        addMember: handleAddMember,
        deleteMember: handleDeleteMember,
        addExpense: handleAddExpense,
        updateExpense: handleUpdateExpense,
        deleteExpense: handleDeleteExpense,
        recordSettlement: handleRecordSettlement,
        deleteSettlement: handleDeleteSettlement,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export function useRoom(): RoomContextType {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
