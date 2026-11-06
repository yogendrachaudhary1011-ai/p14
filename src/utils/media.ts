const VIDEO_EXTENSIONS = /\.(mp4|webm|ogv|mov|m4v)(?:$|[?#])/i;

export function isVideoMedia(url: string, mimeType?: string): boolean {
  if (!url) return false;
  return mimeType?.startsWith('video/') ?? VIDEO_EXTENSIONS.test(url);
}

export function inferMediaMimeType(url: string): string {
  if (!url) return 'image/webp';
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

/**
 * Generates an instantaneous inline SVG data URI fallback.
 * Zero network requests, 0ms latency, matching portfolio dark theme.
 */
export function getInstantFallbackSvg(label = 'Image preview', width = 1200, height = 750): string {
  const cleanLabel = String(label || 'Image asset')
    .replace(/[<>&"']/g, '')
    .slice(0, 48);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#0d0e14"/>
    <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="6" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <g transform="translate(${Math.round(width / 2)}, ${Math.round(height / 2 - 12)})" text-anchor="middle">
      <circle cx="0" cy="-14" r="16" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>
      <path d="M-8 -6 L0 -14 L8 -6" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round"/>
      <text y="24" fill="#a1a1aa" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" letter-spacing="0.5">${cleanLabel}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Retains original uncompressed image to guarantee 100% full visual fidelity:
 * - Does NOT downscale, re-encode, or compress image files
 * - Preserves original format, color accuracy, and pixel-crisp quality
 * - Returns original uncompressed File and dataUrl
 */
export async function compressAndOptimizeImage(
  file: File,
  _maxDimension = 2400,
  _quality = 1.0
): Promise<{ file: File; dataUrl: string }> {
  const dataUrl = await fileToDataUrl(file);
  return { file, dataUrl };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
