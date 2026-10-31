-- Permit administrator uploads of the portfolio resume PDF.
-- Public reads and authenticated-only writes remain unchanged.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
  'video/mp4', 'video/webm', 'application/pdf'
]::text[]
WHERE id = 'portfolio-media';
