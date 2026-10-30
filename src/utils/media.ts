const VIDEO_EXTENSIONS = /\.(mp4|webm|ogv|mov|m4v)(?:$|[?#])/i;

export function isVideoMedia(url: string, mimeType?: string): boolean {
  return mimeType?.startsWith('video/') ?? VIDEO_EXTENSIONS.test(url);
}

export function inferMediaMimeType(url: string): string {
  const path = url.split(/[?#]/, 1)[0].toLowerCase();
  if (/\.(mp4|m4v)$/.test(path)) return 'video/mp4';
  if (path.endsWith('.webm')) return 'video/webm';
  if (path.endsWith('.mov')) return 'video/quicktime';
  if (path.endsWith('.ogv')) return 'video/ogg';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.avif')) return 'image/avif';
  if (/\.(jpe?g)$/.test(path)) return 'image/jpeg';
  return 'image/webp';
}
