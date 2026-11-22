-- ==============================================================================
-- BRO SQUAD - Clean Production Database Schema (Role-Based Admin & Custom Auth)
-- ==============================================================================

-- 1. DROP ALL OLD TABLES & CONSTRAINTS (Wipes any orphan or undeletable dummy data)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.settlements CASCADE;
DROP TABLE IF EXISTS public.expense_participants CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.room_members CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;

-- 2. ROOMS TABLE
CREATE TABLE public.rooms (
    id TEXT PRIMARY KEY DEFAULT 'r-brosquad-001',
    name TEXT NOT NULL DEFAULT 'BRO SQUAD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PROFILES TABLE (Stores Admin and Roommate credentials)
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ROOM MEMBERS TABLE (Junction with CASCADE)
CREATE TABLE public.room_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_room_member UNIQUE(room_id, user_id)
);

-- 5. EXPENSES TABLE (CASCADE on delete ensures no locked records)
CREATE TABLE public.expenses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount_paisa BIGINT NOT NULL CHECK (amount_paisa > 0),
    category TEXT NOT NULL,
    paid_by TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_by TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. EXPENSE PARTICIPANTS TABLE
CREATE TABLE public.expense_participants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    expense_id TEXT NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    share_paisa BIGINT NOT NULL CHECK (share_paisa >= 0),
    CONSTRAINT unique_expense_participant UNIQUE(expense_id, user_id)
);

-- 7. SETTLEMENTS TABLE
CREATE TABLE public.settlements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_paisa BIGINT NOT NULL CHECK (amount_paisa > 0),
    payment_method TEXT NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. GRANT FULL PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 9. DISABLE RLS FOR SEAMLESS CLIENT-SIDE REST ACCESS
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements DISABLE ROW LEVEL SECURITY;

-- 10. CLEAN SEED DATA (ZERO DEMO EXPENSES / ZERO DUMMY MEMBERS)
-- 1 Room
INSERT INTO public.rooms (id, name)
VALUES ('r-brosquad-001', 'BRO SQUAD')
ON CONFLICT (id) DO NOTHING;

-- 1 Default Admin Profile (User ID: admin, Password: admin123)
INSERT INTO public.profiles (id, username, password, full_name, email, role)
VALUES ('admin-001', 'admin', 'admin123', 'Room Admin', 'admin@brosquad.local', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Link Admin to the Room
INSERT INTO public.room_members (room_id, user_id, role)
VALUES ('r-brosquad-001', 'admin-001', 'admin')
ON CONFLICT (room_id, user_id) DO NOTHING;
