-- Publicly readable portfolio media; only authenticated administrators can
-- upload, replace, or remove files. Keep this aligned with uploadMediaToSupabase.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  TRUE,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "portfolio_media_public_read" ON storage.objects;
CREATE POLICY "portfolio_media_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "portfolio_media_authenticated_insert" ON storage.objects;
CREATE POLICY "portfolio_media_authenticated_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "portfolio_media_authenticated_update" ON storage.objects;
CREATE POLICY "portfolio_media_authenticated_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-media')
  WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "portfolio_media_authenticated_delete" ON storage.objects;
CREATE POLICY "portfolio_media_authenticated_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-media');
