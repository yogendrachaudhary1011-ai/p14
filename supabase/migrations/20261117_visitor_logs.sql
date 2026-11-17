-- Silent portfolio visitor log table:
-- Public visitors can insert their visit metadata; only authenticated administrators can read or clear logs.
CREATE TABLE IF NOT EXISTS public.visitor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL DEFAULT 'Unavailable',
  browser_name TEXT NOT NULL DEFAULT 'Unknown',
  os_name TEXT NOT NULL DEFAULT 'Unknown',
  device_type TEXT NOT NULL DEFAULT 'Desktop',
  page_path TEXT NOT NULL DEFAULT '/',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  referrer TEXT NOT NULL DEFAULT '',
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS visitor_logs_visited_at_idx
  ON public.visitor_logs (visited_at DESC);

ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.visitor_logs TO anon, authenticated;
GRANT SELECT, DELETE ON public.visitor_logs TO authenticated;

DROP POLICY IF EXISTS "visitor_logs_public_insert" ON public.visitor_logs;
CREATE POLICY "visitor_logs_public_insert"
  ON public.visitor_logs FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "visitor_logs_authenticated_read" ON public.visitor_logs;
CREATE POLICY "visitor_logs_authenticated_read"
  ON public.visitor_logs FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "visitor_logs_authenticated_delete" ON public.visitor_logs;
CREATE POLICY "visitor_logs_authenticated_delete"
  ON public.visitor_logs FOR DELETE TO authenticated
  USING (true);
