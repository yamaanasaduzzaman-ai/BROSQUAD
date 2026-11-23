import {
  Profile,
  Room,
  Expense,
  Settlement,
  AuditLogItem,
  NotificationItem,
  ExpenseParticipant,
} from './types';
import { supabase, isSupabaseConfigured } from './supabase/client';
import { calculateSplitShares } from './calculations';

export const INITIAL_ROOM: Room = {
  id: 'r-brosquad-001',
  name: 'BRO SQUAD',
  created_at: '2026-11-01T00:00:00Z',
};

// Clean empty slate: no mock/demo members or expenses
export const INITIAL_MEMBERS: Profile[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_SETTLEMENTS: Settlement[] = [];

const LOCAL_STORAGE_KEY = 'brosquad_db_v2';

interface LocalDatabaseState {
  room: Room;
  members: Profile[];
  expenses: Expense[];
  settlements: Settlement[];
  auditLogs: AuditLogItem[];
  notifications: NotificationItem[];
}

function loadLocalDB(): LocalDatabaseState {
  if (typeof window === 'undefined') {
    return {
      room: INITIAL_ROOM,
      members: INITIAL_MEMBERS,
      expenses: INITIAL_EXPENSES,
      settlements: INITIAL_SETTLEMENTS,
      auditLogs: [],
      notifications: [],
    };
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial: LocalDatabaseState = {
        room: INITIAL_ROOM,
        members: [],
        expenses: [],
        settlements: [],
        auditLogs: [],
        notifications: [],
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse local database state:', err);
    return {
      room: INITIAL_ROOM,
      members: [],
      expenses: [],
      settlements: [],
      auditLogs: [],
      notifications: [],
    };
  }
}

function saveLocalDB(state: LocalDatabaseState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// -----------------------------------------------------------------------------
// UNIFIED DATA REPOSITORY (Supabase Cloud + Resilient Local Fallback)
// -----------------------------------------------------------------------------

export const DataRepository = {
  // Members
  async getMembers(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true })
        .order('created_at', { ascending: true });
      if (!error && data) return data as Profile[];
    }
    return loadLocalDB().members;
  },

  async addMember(data: {
    full_name: string;
    username: string;
    password?: string;
    email?: string;
    phone?: string;
    role?: 'admin' | 'member';
    avatar_url?: string | null;
  }): Promise<Profile> {
    const name = data.full_name.trim();
    if (!name) throw new Error('Member name is required');
    const username = data.username.trim().toLowerCase();
    if (!username) throw new Error('User ID / Username is required');
    const password = data.password?.trim() || '123456';
    const role = data.role || 'member';

    const id = `u-${username.replace(/[^a-z0-9]/g, '') || 'user'}-${Date.now().toString(36)}`;
    const email = data.email?.trim() || `${username}@brosquad.local`;

    const newMember: Profile = {
      id,
      username,
      password,
      full_name: name,
      email,
      phone: data.phone?.trim() || null,
      role,
      avatar_url: data.avatar_url || null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('profiles').insert(newMember);
      if (error) throw error;
      await supabase.from('room_members').insert({
        room_id: INITIAL_ROOM.id,
        user_id: id,
        role,
      });
    }

    const db = loadLocalDB();
    db.members.push(newMember);
    saveLocalDB(db);
    return newMember;
  },

  async deleteMember(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
    }
    const db = loadLocalDB();
    db.members = db.members.filter((m) => m.id !== userId);
    db.expenses = db.expenses.filter((e) => e.paid_by !== userId && e.created_by !== userId);
    db.expenses.forEach((exp) => {
      exp.participants = exp.participants.filter((p) => p.user_id !== userId);
    });
    db.settlements = db.settlements.filter((s) => s.sender_id !== userId && s.receiver_id !== userId);
    saveLocalDB(db);
  },

  async updateMemberProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        const db = loadLocalDB();
        const index = db.members.findIndex((m) => m.id === userId);
        if (index !== -1) {
          db.members[index] = { ...db.members[index], ...updates };
          saveLocalDB(db);
        }
        return data as Profile;
      }
    }

    const db = loadLocalDB();
    const index = db.members.findIndex((m) => m.id === userId);
    if (index === -1) throw new Error('Member not found');
    const updated = { ...db.members[index], ...updates };
    db.members[index] = updated;
    saveLocalDB(db);
    return updated;
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          payer:paid_by(id, full_name, email, avatar_url),
          creator:created_by(id, full_name, email, avatar_url),
          participants:expense_participants(
            id,
            expense_id,
            user_id,
            share_paisa,
            profile:user_id(id, full_name, email, avatar_url)
          )
        `)
        .order('expense_date', { ascending: false });

      if (!error && data) {
        return data as Expense[];
      }
    }

    const db = loadLocalDB();
    const memberMap = new Map(db.members.map((m) => [m.id, m]));
    return db.expenses.map((e) => ({
      ...e,
      payer: memberMap.get(e.paid_by),
      creator: memberMap.get(e.created_by),
      participants: e.participants.map((p) => ({
        ...p,
        profile: memberMap.get(p.user_id),
      })),
    }));
  },

  async addExpense(expenseData: {
    title: string;
    amount_paisa: number;
    category: Expense['category'];
    paid_by: string;
    created_by: string;
    expense_date: string;
    notes?: string;
    participant_user_ids: string[];
  }): Promise<Expense> {
    if (expenseData.amount_paisa <= 0) {
      throw new Error('Expense amount must be greater than zero');
    }
    if (!expenseData.participant_user_ids || expenseData.participant_user_ids.length === 0) {
      throw new Error('Please select at least one participant');
    }

    const splitShares = calculateSplitShares(
      expenseData.amount_paisa,
      expenseData.participant_user_ids
    );

    if (isSupabaseConfigured && supabase) {
      const { data: newExp, error: expErr } = await supabase
        .from('expenses')
        .insert({
          room_id: INITIAL_ROOM.id,
          title: expenseData.title.trim(),
          amount_paisa: expenseData.amount_paisa,
          category: expenseData.category,
          paid_by: expenseData.paid_by,
          created_by: expenseData.created_by,
          expense_date: expenseData.expense_date,
          notes: expenseData.notes?.trim() || null,
        })
        .select()
        .single();

      if (expErr) throw expErr;

      const participantRows = splitShares.map((s) => ({
        expense_id: newExp.id,
        user_id: s.userId,
        share_paisa: s.sharePaisa,
      }));

      const { error: partErr } = await supabase
        .from('expense_participants')
        .insert(participantRows);

      if (partErr) throw partErr;

      return newExp as Expense;
    }

    const db = loadLocalDB();
    const newId = `exp-${Date.now()}`;
    const participants: ExpenseParticipant[] = splitShares.map((s, idx) => ({
      id: `ep-${newId}-${idx}`,
      expense_id: newId,
      user_id: s.userId,
      share_paisa: s.sharePaisa,
    }));

    const newExpense: Expense = {
      id: newId,
      room_id: db.room.id,
      title: expenseData.title.trim(),
      amount_paisa: expenseData.amount_paisa,
      category: expenseData.category,
      paid_by: expenseData.paid_by,
      created_by: expenseData.created_by,
      expense_date: expenseData.expense_date,
      notes: expenseData.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participants,
    };

    db.expenses.unshift(newExpense);
    saveLocalDB(db);
    return newExpense;
  },

  async updateExpense(
    expenseId: string,
    updates: {
      title: string;
      amount_paisa: number;
      category: Expense['category'];
      paid_by: string;
      expense_date: string;
      notes?: string;
      participant_user_ids: string[];
      userId: string;
    }
  ): Promise<Expense> {
    const splitShares = calculateSplitShares(
      updates.amount_paisa,
      updates.participant_user_ids
    );

    if (isSupabaseConfigured && supabase) {
      const { error: upErr } = await supabase
        .from('expenses')
        .update({
          title: updates.title.trim(),
          amount_paisa: updates.amount_paisa,
          category: updates.category,
          paid_by: updates.paid_by,
          expense_date: updates.expense_date,
          notes: updates.notes?.trim() || null,
        })
        .eq('id', expenseId);

      if (upErr) throw upErr;

      await supabase.from('expense_participants').delete().eq('expense_id', expenseId);

      const participantRows = splitShares.map((s) => ({
        expense_id: expenseId,
        user_id: s.userId,
        share_paisa: s.sharePaisa,
      }));

      await supabase.from('expense_participants').insert(participantRows);
    }

    const db = loadLocalDB();
    const idx = db.expenses.findIndex((e) => e.id === expenseId);
    if (idx === -1) throw new Error('Expense not found');

    const participants: ExpenseParticipant[] = splitShares.map((s, i) => ({
      id: `ep-${expenseId}-${i}-${Date.now()}`,
      expense_id: expenseId,
      user_id: s.userId,
      share_paisa: s.sharePaisa,
    }));

    const updated: Expense = {
      ...db.expenses[idx],
      title: updates.title.trim(),
      amount_paisa: updates.amount_paisa,
      category: updates.category,
      paid_by: updates.paid_by,
      expense_date: updates.expense_date,
      notes: updates.notes?.trim() || null,
      updated_at: new Date().toISOString(),
      participants,
    };

    db.expenses[idx] = updated;
    saveLocalDB(db);
    return updated;
  },

  async deleteExpense(expenseId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;
      return;
    }

    const db = loadLocalDB();
    db.expenses = db.expenses.filter((e) => e.id !== expenseId);
    saveLocalDB(db);
  },

  // Settlements
  async getSettlements(): Promise<Settlement[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('settlements')
        .select(`
          *,
          sender:sender_id(id, full_name, email, avatar_url),
          receiver:receiver_id(id, full_name, email, avatar_url)
        `)
        .order('payment_date', { ascending: false });

      if (!error && data) return data as Settlement[];
    }

    const db = loadLocalDB();
    const memberMap = new Map(db.members.map((m) => [m.id, m]));
    return db.settlements.map((s) => ({
      ...s,
      sender: memberMap.get(s.sender_id),
      receiver: memberMap.get(s.receiver_id),
    }));
  },

  async addSettlement(data: {
    sender_id: string;
    receiver_id: string;
    amount_paisa: number;
    payment_method: Settlement['payment_method'];
    payment_date: string;
    notes?: string;
    created_by: string;
  }): Promise<Settlement> {
    if (data.sender_id === data.receiver_id) {
      throw new Error('Sender and Receiver must be different members');
    }
    if (data.amount_paisa <= 0) {
      throw new Error('Settlement amount must be greater than zero');
    }

    if (isSupabaseConfigured && supabase) {
      const { data: newSet, error } = await supabase
        .from('settlements')
        .insert({
          room_id: INITIAL_ROOM.id,
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
          amount_paisa: data.amount_paisa,
          payment_method: data.payment_method,
          payment_date: data.payment_date,
          notes: data.notes?.trim() || null,
          created_by: data.created_by,
        })
        .select()
        .single();

      if (error) throw error;
      return newSet as Settlement;
    }

    const db = loadLocalDB();
    const newId = `set-${Date.now()}`;
    const newSettlement: Settlement = {
      id: newId,
      room_id: db.room.id,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      amount_paisa: data.amount_paisa,
      payment_method: data.payment_method,
      payment_date: data.payment_date,
      notes: data.notes?.trim() || null,
      created_by: data.created_by,
      created_at: new Date().toISOString(),
    };

    db.settlements.unshift(newSettlement);
    saveLocalDB(db);
    return newSettlement;
  },

  async deleteSettlement(settlementId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('settlements').delete().eq('id', settlementId);
      if (error) throw error;
      return;
    }

    const db = loadLocalDB();
    db.settlements = db.settlements.filter((s) => s.id !== settlementId);
    saveLocalDB(db);
  },

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('brosquad_current_user_id');
  },
};
