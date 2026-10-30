-- Public visitors can read the published portfolio snapshot.
-- Writes require a signed-in Supabase Auth user. Disable public sign-ups and
-- create the portfolio administrator in Authentication before using the CMS.
CREATE TABLE IF NOT EXISTS public.portfolio_state (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.portfolio_state ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.portfolio_state TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_state TO authenticated;

DROP POLICY IF EXISTS "portfolio_state_public_read" ON public.portfolio_state;
CREATE POLICY "portfolio_state_public_read"
  ON public.portfolio_state FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "portfolio_state_authenticated_write" ON public.portfolio_state;
CREATE POLICY "portfolio_state_authenticated_write"
  ON public.portfolio_state FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_state;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

