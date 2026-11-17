-- Silent portfolio visitor session & activity log table:
-- Public visitors can insert/append their own session activity via SECURITY DEFINER RPC;
-- only authenticated administrators can read or clear logs.
CREATE TABLE IF NOT EXISTS public.visitor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  ip_address TEXT NOT NULL DEFAULT 'Unavailable',
  browser_name TEXT NOT NULL DEFAULT 'Unknown',
  os_name TEXT NOT NULL DEFAULT 'Unknown',
  device_type TEXT NOT NULL DEFAULT 'Desktop',
  page_path TEXT NOT NULL DEFAULT '/',
  pages_visited JSONB NOT NULL DEFAULT '[]'::jsonb,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  referrer TEXT NOT NULL DEFAULT '',
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.visitor_logs ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE public.visitor_logs ADD COLUMN IF NOT EXISTS pages_visited JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.visitor_logs ADD COLUMN IF NOT EXISTS activities JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.visitor_logs ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS visitor_logs_session_id_uidx
  ON public.visitor_logs (session_id);

CREATE INDEX IF NOT EXISTS visitor_logs_visited_at_idx
  ON public.visitor_logs (visited_at DESC);

CREATE INDEX IF NOT EXISTS visitor_logs_last_active_at_idx
  ON public.visitor_logs (last_active_at DESC);

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

CREATE OR REPLACE FUNCTION public.upsert_visitor_session(
  p_session_id TEXT,
  p_ip_address TEXT DEFAULT 'Unavailable',
  p_browser_name TEXT DEFAULT 'Unknown',
  p_os_name TEXT DEFAULT 'Unknown',
  p_device_type TEXT DEFAULT 'Desktop',
  p_page_path TEXT DEFAULT '/',
  p_pages_visited JSONB DEFAULT '[]'::jsonb,
  p_activities JSONB DEFAULT '[]'::jsonb,
  p_timezone TEXT DEFAULT 'UTC',
  p_referrer TEXT DEFAULT '',
  p_visited_at TIMESTAMPTZ DEFAULT NOW(),
  p_last_active_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.visitor_logs (
    session_id,
    ip_address,
    browser_name,
    os_name,
    device_type,
    page_path,
    pages_visited,
    activities,
    timezone,
    referrer,
    visited_at,
    last_active_at
  )
  VALUES (
    p_session_id,
    COALESCE(p_ip_address, 'Unavailable'),
    COALESCE(p_browser_name, 'Unknown'),
    COALESCE(p_os_name, 'Unknown'),
    COALESCE(p_device_type, 'Desktop'),
    COALESCE(p_page_path, '/'),
    COALESCE(p_pages_visited, '[]'::jsonb),
    COALESCE(p_activities, '[]'::jsonb),
    COALESCE(p_timezone, 'UTC'),
    COALESCE(p_referrer, ''),
    COALESCE(p_visited_at, NOW()),
    COALESCE(p_last_active_at, NOW())
  )
  ON CONFLICT (session_id) DO UPDATE SET
    ip_address = CASE
      WHEN EXCLUDED.ip_address <> 'Unavailable' THEN EXCLUDED.ip_address
      ELSE public.visitor_logs.ip_address
    END,
    pages_visited = EXCLUDED.pages_visited,
    activities = EXCLUDED.activities,
    last_active_at = EXCLUDED.last_active_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_visitor_session(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ
) TO anon, authenticated;
