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

const THUMBNAIL_IDENTIFIERS = /\b(thumbnail|thumb|cover|card|preview-card|listing|listing-cover)\b/i;

/**
 * Checks whether an image name, label, or path represents a thumbnail image.
 */
export function isThumbnailLabelOrName(nameOrLabel?: string): boolean {
  if (!nameOrLabel) return false;
  return THUMBNAIL_IDENTIFIERS.test(nameOrLabel);
}

export interface ThumbnailCompressionOptions {
  maxDimension?: number;
  quality?: number;
  targetMimeType?: string;
}

/**
 * Compresses thumbnail images to provide optimal card loading performance while
 * preserving visual sharpness on high-DPI displays.
 * Scales down to maxDimension (default: 1200px) and applies WebP/JPEG compression.
 */
export async function compressThumbnailImage(
  file: File,
  options: ThumbnailCompressionOptions = {}
): Promise<{ file: File; dataUrl: string; wasCompressed: boolean }> {
  const maxDimension = options.maxDimension ?? 1200;
  const quality = options.quality ?? 0.8;
  const targetMimeType = options.targetMimeType ?? 'image/webp';

  // If not in browser environment or file is not an image, return original
  if (typeof window === 'undefined' || typeof document === 'undefined' || !file.type.startsWith('image/')) {
    const dataUrl = await fileToDataUrl(file);
    return { file, dataUrl, wasCompressed: false };
  }

  // If already a tiny SVG or GIF animation, keep original
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    const dataUrl = await fileToDataUrl(file);
    return { file, dataUrl, wasCompressed: false };
  }

  return new Promise<{ file: File; dataUrl: string; wasCompressed: boolean }>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Downscale proportionally if dimensions exceed maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: true });

        if (!ctx) {
          const dataUrl = await fileToDataUrl(file);
          resolve({ file, dataUrl, wasCompressed: false });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Check if WebP is supported
        let exportMime = targetMimeType;
        const testWebp = canvas.toDataURL('image/webp');
        if (!testWebp.startsWith('data:image/webp')) {
          exportMime = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        }

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              const dataUrl = await fileToDataUrl(file);
              resolve({ file, dataUrl, wasCompressed: false });
              return;
            }

            // Only use compressed if it actually reduced file size or resized
            const wasResized = width < (img.naturalWidth || 0) || height < (img.naturalHeight || 0);
            if (blob.size < file.size || wasResized) {
              const ext = exportMime === 'image/webp' ? '.webp' : exportMime === 'image/jpeg' ? '.jpg' : '.png';
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${baseName}-thumb${ext}`, {
                type: exportMime,
                lastModified: Date.now()
              });
              const dataUrl = await fileToDataUrl(compressedFile);
              resolve({ file: compressedFile, dataUrl, wasCompressed: true });
            } else {
              const dataUrl = await fileToDataUrl(file);
              resolve({ file, dataUrl, wasCompressed: false });
            }
          },
          exportMime,
          quality
        );
      } catch (err) {
        console.warn('Thumbnail compression error, using original file:', err);
        const dataUrl = await fileToDataUrl(file);
        resolve({ file, dataUrl, wasCompressed: false });
      }
    };

    img.onerror = async () => {
      URL.revokeObjectURL(objectUrl);
      const dataUrl = await fileToDataUrl(file);
      resolve({ file, dataUrl, wasCompressed: false });
    };

    img.src = objectUrl;
  });
}

/**
 * Helper to compress a thumbnail data URL (e.g. pasted or in-memory preview).
 */
export async function compressThumbnailDataUrl(
  dataUrlOrUrl: string,
  maxDimension = 1200,
  quality = 0.8
): Promise<string> {
  if (!dataUrlOrUrl || !dataUrlOrUrl.startsWith('data:image/')) return dataUrlOrUrl;
  if (dataUrlOrUrl.startsWith('data:image/svg+xml') || dataUrlOrUrl.startsWith('data:image/gif')) return dataUrlOrUrl;

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrlOrUrl);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/webp', quality);
        if (compressed.length < dataUrlOrUrl.length) {
          resolve(compressed);
        } else {
          resolve(dataUrlOrUrl);
        }
      } catch {
        resolve(dataUrlOrUrl);
      }
    };
    img.onerror = () => resolve(dataUrlOrUrl);
    img.src = dataUrlOrUrl;
  });
}

export interface ImageOptimizationOptions {
  isThumbnail?: boolean;
  maxDimension?: number;
  quality?: number;
}

/**
 * Selective image compression:
 * - Applies compression ONLY to thumbnail images (card covers, project listings, previews).
 * - Non-thumbnail images (hero banners, section visuals, full-width screens, design systems)
 *   remain 100% uncompressed to preserve pristine visual fidelity, color, and sharpness.
 */
export async function compressAndOptimizeImage(
  file: File,
  optionsOrMaxDimension?: ImageOptimizationOptions | number,
  legacyQuality?: number
): Promise<{ file: File; dataUrl: string; wasCompressed: boolean }> {
  const isOptionsObject = typeof optionsOrMaxDimension === 'object' && optionsOrMaxDimension !== null;
  const isThumbnail = isOptionsObject
    ? Boolean(optionsOrMaxDimension.isThumbnail)
    : isThumbnailLabelOrName(file.name);

  // If this image is a thumbnail, apply thumbnail compression!
  if (isThumbnail) {
    const maxDim = isOptionsObject
      ? optionsOrMaxDimension.maxDimension
      : typeof optionsOrMaxDimension === 'number'
      ? optionsOrMaxDimension
      : 1200;
    const q = isOptionsObject
      ? optionsOrMaxDimension.quality
      : typeof legacyQuality === 'number'
      ? legacyQuality
      : 0.8;
    return compressThumbnailImage(file, { maxDimension: maxDim ?? 1200, quality: q ?? 0.8 });
  }

  // For non-thumbnail images: zero compression, 100% pristine visual fidelity
  const dataUrl = await fileToDataUrl(file);
  return { file, dataUrl, wasCompressed: false };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
