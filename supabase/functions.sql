-- ==============================================================================
-- BRO SQUAD - Database Functions & Stored Procedures
-- ==============================================================================

-- 1. Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Updated At Auto-Refresh Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_expenses_updated_at ON public.expenses;
CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Room Member Balance Summary Function (Calculated in PAISA)
-- Net Balance = Total Paid - Total Personal Share + Net Settlements (Received - Sent)
CREATE OR REPLACE FUNCTION public.get_room_balances(p_room_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  total_paid_paisa BIGINT,
  total_share_paisa BIGINT,
  settlements_sent_paisa BIGINT,
  settlements_received_paisa BIGINT,
  net_balance_paisa BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  WITH members AS (
    SELECT 
      rm.user_id,
      p.full_name,
      p.email,
      p.avatar_url
    FROM public.room_members rm
    JOIN public.profiles p ON p.id = rm.user_id
    WHERE rm.room_id = p_room_id
  ),
  expense_paid AS (
    SELECT 
      paid_by AS user_id, 
      COALESCE(SUM(amount_paisa), 0) AS total_paid
    FROM public.expenses
    WHERE room_id = p_room_id
    GROUP BY paid_by
  ),
  expense_share AS (
    SELECT 
      ep.user_id, 
      COALESCE(SUM(ep.share_paisa), 0) AS total_share
    FROM public.expense_participants ep
    JOIN public.expenses e ON e.id = ep.expense_id
    WHERE e.room_id = p_room_id
    GROUP BY ep.user_id
  ),
  settlement_sent AS (
    SELECT 
      sender_id AS user_id,
      COALESCE(SUM(amount_paisa), 0) AS total_sent
    FROM public.settlements
    WHERE room_id = p_room_id
    GROUP BY sender_id
  ),
  settlement_received AS (
    SELECT 
      receiver_id AS user_id,
      COALESCE(SUM(amount_paisa), 0) AS total_received
    FROM public.settlements
    WHERE room_id = p_room_id
    GROUP BY receiver_id
  )
  SELECT 
    m.user_id,
    m.full_name,
    m.email,
    m.avatar_url,
    COALESCE(ep.total_paid, 0)::BIGINT AS total_paid_paisa,
    COALESCE(es.total_share, 0)::BIGINT AS total_share_paisa,
    COALESCE(ss.total_sent, 0)::BIGINT AS settlements_sent_paisa,
    COALESCE(sr.total_received, 0)::BIGINT AS settlements_received_paisa,
    (
      (COALESCE(ep.total_paid, 0) - COALESCE(es.total_share, 0)) +
      COALESCE(ss.total_sent, 0) - COALESCE(sr.total_received, 0)
    )::BIGINT AS net_balance_paisa
  FROM members m
  LEFT JOIN expense_paid ep ON ep.user_id = m.user_id
  LEFT JOIN expense_share es ON es.user_id = m.user_id
  LEFT JOIN settlement_sent ss ON ss.user_id = m.user_id
  LEFT JOIN settlement_received sr ON sr.user_id = m.user_id;
$$;
