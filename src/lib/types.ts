export type ExpenseCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snacks'
  | 'Groceries'
  | 'Tea & Coffee'
  | 'Utilities'
  | 'Transportation'
  | 'Others';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
  'Groceries',
  'Tea & Coffee',
  'Utilities',
  'Transportation',
  'Others',
];

export type PaymentMethod =
  | 'Cash'
  | 'bKash'
  | 'Nagad'
  | 'Bank Transfer'
  | 'Other';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'bKash',
  'Nagad',
  'Bank Transfer',
  'Other',
];

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Room {
  id: string;
  name: string;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile: Profile;
}

export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  user_id: string;
  share_paisa: number;
  profile?: Profile;
}

export interface Expense {
  id: string;
  room_id: string;
  title: string;
  amount_paisa: number;
  category: ExpenseCategory;
  paid_by: string; // user_id
  created_by: string; // user_id
  expense_date: string; // YYYY-MM-DD
  notes?: string | null;
  created_at: string;
  updated_at: string;
  payer?: Profile;
  creator?: Profile;
  participants: ExpenseParticipant[];
}

export interface Settlement {
  id: string;
  room_id: string;
  sender_id: string; // owes money / paying
  receiver_id: string; // receives money
  amount_paisa: number;
  payment_method: PaymentMethod;
  payment_date: string; // YYYY-MM-DD
  notes?: string | null;
  created_by: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface NotificationItem {
  id: string;
  room_id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  room_id: string;
  user_id?: string | null;
  action: string;
  entity_type: 'expense' | 'settlement' | 'member' | 'profile';
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface MemberBalance {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  total_paid_paisa: number;
  total_share_paisa: number;
  settlements_sent_paisa: number;
  settlements_received_paisa: number;
  net_balance_paisa: number; // positive = receivable (+), negative = payable (-)
  expense_count: number;
}

export interface SuggestedSettlement {
  from_user_id: string;
  from_name: string;
  to_user_id: string;
  to_name: string;
  amount_paisa: number;
}

export interface RoomOverview {
  total_expenses_paisa: number;
  my_contribution_paisa: number;
  my_share_paisa: number;
  my_balance_paisa: number;
  member_balances: MemberBalance[];
  suggested_settlements: SuggestedSettlement[];
}
