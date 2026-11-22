-- ==============================================================================
-- BRO SQUAD - Clean Room Initialization (Zero Demo Data)
-- ==============================================================================

DO $$
DECLARE
  v_room_id UUID := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert clean BRO SQUAD room
  INSERT INTO public.rooms (id, name, created_at)
  VALUES (v_room_id, 'BRO SQUAD', now())
  ON CONFLICT (id) DO NOTHING;

END $$;
