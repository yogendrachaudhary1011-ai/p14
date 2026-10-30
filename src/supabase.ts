import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { safeStorage } from './utils/storage';

const STORAGE_KEYS = {
  URL: 'yc_portfolio_supabase_url',
  KEY: 'yc_portfolio_supabase_key'
};

// Supabase anon keys are intended for browser use; database access is controlled by RLS.
export const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieGdsbmdwc3F5cnBsenh5Y2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzU2NDMsImV4cCI6MjEwODkxMTY0M30.9WOc-4UDzQudkESGE4MUhVlS2-r4CzmRpdov69zKx_s';
export const SUGGESTED_SUPABASE_URL = 'https://ubxglngpsqyrplzxyciw.supabase.co';

// Helper to normalize any entered URL or project ID into full https URL
export function normalizeSupabaseUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/+$/, '');
  }
  if (trimmed.includes('.supabase.co')) {
    return `https://${trimmed.replace(/\/+$/, '')}`;
  }
  // Assume project ref ID was entered
  return `https://${trimmed.toLowerCase()}.supabase.co`;
}

// Initialize from env, localStorage, or defaults
export function getSavedCredentials(): { url: string; key: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl = safeStorage.getItem(STORAGE_KEYS.URL) || '';
  const localKey = safeStorage.getItem(STORAGE_KEYS.KEY) || '';

  const effectiveKey = envKey || localKey || DEFAULT_SUPABASE_KEY;
  const effectiveUrl = normalizeSupabaseUrl(envUrl || localUrl || SUGGESTED_SUPABASE_URL);

  return {
    url: effectiveUrl,
    key: effectiveKey
  };
}

let supabaseInstance: SupabaseClient | null = null;
let supabaseInstanceConfig = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSavedCredentials();
  if (!url || !key) {
    return null;
  }

  const configKey = `${url}:${key}`;
  if (!supabaseInstance || supabaseInstanceConfig !== configKey) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      supabaseInstanceConfig = configKey;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSavedCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

export function saveSupabaseCredentials(url: string, key: string): boolean {
  if (typeof window === 'undefined') return false;

  const cleanedUrl = normalizeSupabaseUrl(url);
  const cleanedKey = key.trim();

  if (cleanedUrl && cleanedKey) {
    safeStorage.setItem(STORAGE_KEYS.URL, cleanedUrl);
    safeStorage.setItem(STORAGE_KEYS.KEY, cleanedKey);
    try {
      supabaseInstance = createClient(cleanedUrl, cleanedKey);
      supabaseInstanceConfig = `${cleanedUrl}:${cleanedKey}`;
      return true;
    } catch (err) {
      console.error('Invalid Supabase configuration:', err);
      return false;
    }
  } else {
    safeStorage.removeItem(STORAGE_KEYS.URL);
    safeStorage.removeItem(STORAGE_KEYS.KEY);
    supabaseInstance = null;
    supabaseInstanceConfig = '';
    return true;
  }
}

/** Safe migration: public visitors may read; Supabase-authenticated users may edit. */
export const SUPABASE_SQL_SCHEMA = `CREATE TABLE IF NOT EXISTS public.portfolio_state (
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
  USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_state;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`;

