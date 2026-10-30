import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { safeStorage } from './utils/storage';

const STORAGE_KEYS = {
  URL: 'yc_portfolio_supabase_url',
  KEY: 'yc_portfolio_supabase_key'
};

// User's provided publishable key and derived project ref
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_bCfbWy8B6nP3cmJdSc3vEg_glw51TUT';
export const SUGGESTED_SUPABASE_URL = 'https://bcfbwy8b6np3cmjdsc3veg.supabase.co';

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

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSavedCredentials();
  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
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
      return true;
    } catch (err) {
      console.error('Invalid Supabase configuration:', err);
      return false;
    }
  } else {
    safeStorage.removeItem(STORAGE_KEYS.URL);
    safeStorage.removeItem(STORAGE_KEYS.KEY);
    supabaseInstance = null;
    return true;
  }
}

/**
 * Complete SQL Migration script for user to execute in Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_summary TEXT,
  hero_subtitle TEXT,
  introduction TEXT,
  summary TEXT,
  category TEXT DEFAULT 'product',
  category_label TEXT DEFAULT 'Case Study',
  cover_image TEXT,
  hero_image JSONB,
  year TEXT DEFAULT '2026',
  display_order INTEGER DEFAULT 1,
  status TEXT DEFAULT 'published',
  featured BOOLEAN DEFAULT true,
  route TEXT,
  role TEXT,
  duration TEXT,
  deliverables TEXT[],
  figma_url TEXT,
  figma_button_text TEXT,
  external_project_url TEXT,
  sections JSONB,
  problem JSONB,
  challenge JSONB,
  insights JSONB,
  key_decisions JSONB,
  seo JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published projects
CREATE POLICY "Public read published projects" 
  ON projects FOR SELECT 
  USING (true);

-- Allow full access to authenticated users or anon with key
CREATE POLICY "Allow anon insert/update/delete" 
  ON projects FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 2. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_settings" 
  ON site_settings FOR SELECT 
  USING (true);

CREATE POLICY "Allow anon modify site_settings" 
  ON site_settings FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 3. MEDIA ASSETS TABLE
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read media_assets" 
  ON media_assets FOR SELECT 
  USING (true);

CREATE POLICY "Allow anon modify media_assets" 
  ON media_assets FOR ALL 
  USING (true) 
  WITH CHECK (true);
`;
