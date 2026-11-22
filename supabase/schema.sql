-- ==============================================================================
-- BRO SQUAD - Shared Room Expense Management System
-- Supabase PostgreSQL Database Schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'BRO SQUAD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ROOM MEMBERS TABLE (Junction between rooms and profiles)
CREATE TABLE IF NOT EXISTS public.room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_room_member UNIQUE(room_id, user_id)
);

-- 4. EXPENSES TABLE (Financial values stored in integer PAISA: 1 BDT = 100 Paisa)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount_paisa BIGINT NOT NULL CHECK (amount_paisa > 0),
    category TEXT NOT NULL CHECK (
        category IN (
            'Breakfast',
            'Lunch',
            'Dinner',
            'Snacks',
            'Groceries',
            'Tea & Coffee',
            'Utilities',
            'Transportation',
            'Others'
        )
    ),
    paid_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. EXPENSE PARTICIPANTS TABLE (Stores exact calculated share in PAISA)
CREATE TABLE IF NOT EXISTS public.expense_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    share_paisa BIGINT NOT NULL CHECK (share_paisa >= 0),
    CONSTRAINT unique_expense_participant UNIQUE(expense_id, user_id)
);

-- 6. SETTLEMENTS TABLE (Separate from expenses, tracks direct member-to-member debt clearances)
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount_paisa BIGINT NOT NULL CHECK (amount_paisa > 0),
    payment_method TEXT NOT NULL CHECK (
        payment_method IN ('Cash', 'bKash', 'Nagad', 'Bank Transfer', 'Other')
    ),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_different_parties CHECK (sender_id <> receiver_id)
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON public.room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_room ON public.expenses(room_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expense_parts_expense ON public.expense_participants(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_parts_user ON public.expense_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_room ON public.settlements(room_id);
CREATE INDEX IF NOT EXISTS idx_settlements_sender ON public.settlements(sender_id);
CREATE INDEX IF NOT EXISTS idx_settlements_receiver ON public.settlements(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_room ON public.audit_logs(room_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current auth user belongs to a room
CREATE OR REPLACE FUNCTION public.is_member_of_room(_room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_id = _room_id AND user_id = auth.uid()
  );
$$;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ROOMS POLICIES
CREATE POLICY "Members can view their rooms"
ON public.rooms FOR SELECT
TO authenticated
USING (public.is_member_of_room(id));

-- ROOM MEMBERS POLICIES
CREATE POLICY "Members can view members in their rooms"
ON public.room_members FOR SELECT
TO authenticated
USING (public.is_member_of_room(room_id));

-- EXPENSES POLICIES
CREATE POLICY "Members can view room expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (public.is_member_of_room(room_id));

CREATE POLICY "Members can create room expenses"
ON public.expenses FOR INSERT
TO authenticated
WITH CHECK (public.is_member_of_room(room_id) AND auth.uid() = created_by);

CREATE POLICY "Creators and payers can update expenses"
ON public.expenses FOR UPDATE
TO authenticated
USING (
  public.is_member_of_room(room_id) AND
  (auth.uid() = created_by OR auth.uid() = paid_by)
);

CREATE POLICY "Creators and payers can delete expenses"
ON public.expenses FOR DELETE
TO authenticated
USING (
  public.is_member_of_room(room_id) AND
  (auth.uid() = created_by OR auth.uid() = paid_by)
);

-- EXPENSE PARTICIPANTS POLICIES
CREATE POLICY "Members can view expense participants"
ON public.expense_participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.expenses e
    WHERE e.id = expense_participants.expense_id
    AND public.is_member_of_room(e.room_id)
  )
);

CREATE POLICY "Members can insert expense participants"
ON public.expense_participants FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.expenses e
    WHERE e.id = expense_participants.expense_id
    AND public.is_member_of_room(e.room_id)
  )
);

CREATE POLICY "Members can delete expense participants"
ON public.expense_participants FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.expenses e
    WHERE e.id = expense_participants.expense_id
    AND public.is_member_of_room(e.room_id)
  )
);

-- SETTLEMENTS POLICIES
CREATE POLICY "Members can view room settlements"
ON public.settlements FOR SELECT
TO authenticated
USING (public.is_member_of_room(room_id));

CREATE POLICY "Members can insert room settlements"
ON public.settlements FOR INSERT
TO authenticated
WITH CHECK (
  public.is_member_of_room(room_id) AND
  auth.uid() = created_by
);

CREATE POLICY "Settlement creator can delete settlement"
ON public.settlements FOR DELETE
TO authenticated
USING (
  public.is_member_of_room(room_id) AND
  auth.uid() = created_by
);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- AUDIT LOGS POLICIES
CREATE POLICY "Members can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_member_of_room(room_id));

CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.is_member_of_room(room_id));
