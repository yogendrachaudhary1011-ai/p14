import { useEffect, useState } from 'react';
import { fileToDataUrl, inferMediaMimeType } from './media';

export type LandingMediaSlot = 'id-card' | 'work-cover' | 'about-poster';

export interface LandingCompressionResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  wasCompressed: boolean;
}

export interface LandingVideoCompressionResult {
  file: File;
  posterDataUrl: string | null;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  wasCompressed: boolean;
}

const SLOT_CONFIG: Record<LandingMediaSlot, { maxDimension: number; quality: number; suffix: string }> = {
  'id-card': { maxDimension: 800, quality: 0.82, suffix: '-landing-id' },
  'work-cover': { maxDimension: 900, quality: 0.78, suffix: '-landing-cover' },
  'about-poster': { maxDimension: 900, quality: 0.8, suffix: '-landing-poster' }
};

/**
 * Maps default static landing page assets to their pre-compressed WebP variants.
 * Used ONLY on the landing page (HomePage / IdCard) so case-study detail pages
 * continue to serve full-fidelity assets untouched.
 */
const LANDING_STATIC_IMAGE_MAP: Record<string, string> = {
  '/assets/media/hero-id-portrait.jpeg': '/assets/media/hero-id-portrait.webp',
  '/assets/media/about-profile-poster.png': '/assets/media/about-profile-poster.webp',
  '/assets/media/somtu-cover.webp': '/assets/media/somtu-thumb.webp',
  '/assets/media/home-media-04-f775f2921176.webp': '/assets/media/somtu-thumb.webp',
  '/assets/media/home-media-01-a8072a2c986d.png': '/assets/media/vedic-sewa-thumb.webp',
  '/assets/media/vedic-sewa-cover.png': '/assets/media/vedic-sewa-thumb.webp'
};

const compressedDataUrlCache = new Map<string, string>();

export function resolveLandingImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const [pathname, query] = trimmed.split('?');
  const mapped = LANDING_STATIC_IMAGE_MAP[pathname];
  if (!mapped) return trimmed;
  return query ? `${mapped}?${query}` : mapped;
}

export function resolveLandingPosterUrl(posterUrl?: string): string {
  if (!posterUrl) return '/assets/media/about-profile-poster.webp';
  return resolveLandingImageUrl(posterUrl);
}

export function getLandingVideoSources(videoUrl?: string): Array<{ src: string; type: string }> {
  const effectiveUrl = (videoUrl || '/assets/media/about-profile-video.mp4').trim();
  const [pathname] = effectiveUrl.split('?');

  if (pathname === '/assets/media/about-profile-video.mp4') {
    return [
      { src: '/assets/media/about-profile-video.mp4', type: 'video/mp4' },
      { src: '/assets/media/about-profile-video.webm', type: 'video/webm' }
    ];
  }

  return [{ src: effectiveUrl, type: inferMediaMimeType(effectiveUrl) }];
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function isSaveDataEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g');
}

/**
 * Compresses an uploaded image specifically for a landing page slot
 * (ID Card portrait, Selected Work cover thumbnail, or About poster).
 */
export async function compressLandingImage(
  file: File,
  slot: LandingMediaSlot = 'work-cover'
): Promise<LandingCompressionResult> {
  const { maxDimension, quality, suffix } = SLOT_CONFIG[slot];
  const originalSize = file.size;

  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      dataUrl,
      originalSize,
      compressedSize: originalSize,
      savingsPercent: 0,
      wasCompressed: false
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          const dataUrl = await fileToDataUrl(file);
          resolve({ file, dataUrl, originalSize, compressedSize: originalSize, savingsPercent: 0, wasCompressed: false });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let exportMime = 'image/webp';
        if (!canvas.toDataURL('image/webp').startsWith('data:image/webp')) {
          exportMime = 'image/jpeg';
        }

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              const dataUrl = await fileToDataUrl(file);
              resolve({ file, dataUrl, originalSize, compressedSize: originalSize, savingsPercent: 0, wasCompressed: false });
              return;
            }

            const wasResized = canvas.width < (img.naturalWidth || 0) || canvas.height < (img.naturalHeight || 0);
            if (blob.size < originalSize || wasResized) {
              const ext = exportMime === 'image/webp' ? '.webp' : '.jpg';
              const baseName = file.name.replace(/\.[^/.]+$/, '') || 'landing-image';
              const compressedFile = new File([blob], `${baseName}${suffix}${ext}`, {
                type: exportMime,
                lastModified: Date.now()
              });
              const dataUrl = await fileToDataUrl(compressedFile);
              const compressedSize = compressedFile.size;
              const savingsPercent = originalSize > 0
                ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
                : 0;

              resolve({
                file: compressedFile,
                dataUrl,
                originalSize,
                compressedSize,
                savingsPercent,
                wasCompressed: true
              });
            } else {
              const dataUrl = await fileToDataUrl(file);
              resolve({ file, dataUrl, originalSize, compressedSize: originalSize, savingsPercent: 0, wasCompressed: false });
            }
          },
          exportMime,
          quality
        );
      } catch {
        const dataUrl = await fileToDataUrl(file);
        resolve({ file, dataUrl, originalSize, compressedSize: originalSize, savingsPercent: 0, wasCompressed: false });
      }
    };

    img.onerror = async () => {
      URL.revokeObjectURL(objectUrl);
      const dataUrl = await fileToDataUrl(file);
      resolve({ file, dataUrl, originalSize, compressedSize: originalSize, savingsPercent: 0, wasCompressed: false });
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses an inline data:image/* URI in the browser for landing page rendering.
 * Never alters remote http(s) URLs or non-landing pages.
 */
export async function compressLandingDataUrl(
  dataUrl: string,
  maxDimension = 900,
  quality = 0.8
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  if (dataUrl.startsWith('data:image/svg+xml') || dataUrl.startsWith('data:image/gif')) return dataUrl;
  if (dataUrl.length < 48 * 1024) return dataUrl;

  const cacheKey = `${maxDimension}:${quality}:${dataUrl.slice(0, 64)}:${dataUrl.length}`;
  const cached = compressedDataUrlCache.get(cacheKey);
  if (cached) return cached;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const webp = canvas.toDataURL('image/webp', quality);
        const nextUrl = webp.startsWith('data:image/webp') && webp.length < dataUrl.length ? webp : dataUrl;
        compressedDataUrlCache.set(cacheKey, nextUrl);
        resolve(nextUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Hook used strictly on landing page components (HomePage & IdCard)
 * to serve pre-compressed static WebP assets and lazily compress oversized inline data URIs.
 */
export function useCompressedLandingImage(src?: string, maxDimension = 900): string {
  const mappedStatic = resolveLandingImageUrl(src);
  const [resolvedSrc, setResolvedSrc] = useState<string>(mappedStatic);

  useEffect(() => {
    const nextMapped = resolveLandingImageUrl(src);
    setResolvedSrc(nextMapped);

    if (!nextMapped.startsWith('data:image/') || nextMapped.length < 48 * 1024) {
      return;
    }

    let cancelled = false;
    void compressLandingDataUrl(nextMapped, maxDimension, 0.8).then((compressed) => {
      if (!cancelled && compressed !== nextMapped) {
        setResolvedSrc(compressed);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src, maxDimension]);

  return resolvedSrc;
}

function getSupportedVideoMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4'
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

/**
 * Compresses the landing page About video directly in the browser before upload
 * (scales to max 960x720, 30fps, ~900kbps muted stream) and extracts a WebP poster.
 * Falls back safely to the original file if compression isn't supported or doesn't save space.
 */
export async function compressLandingVideo(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    targetBitrate?: number;
    fps?: number;
    onProgress?: (percent: number) => void;
  } = {}
): Promise<LandingVideoCompressionResult> {
  const originalSize = file.size;
  const maxWidth = options.maxWidth ?? 960;
  const maxHeight = options.maxHeight ?? 720;
  const targetBitrate = options.targetBitrate ?? 900_000;
  const fps = options.fps ?? 30;

  const mimeType = getSupportedVideoMimeType();
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !mimeType ||
    !file.type.startsWith('video/')
  ) {
    return {
      file,
      posterDataUrl: null,
      originalSize,
      compressedSize: originalSize,
      savingsPercent: 0,
      wasCompressed: false
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    let settled = false;
    let rafId = 0;
    let timeoutId = 0;

    const cleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) window.clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    const fallbackOriginal = (posterDataUrl: string | null = null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        file,
        posterDataUrl,
        originalSize,
        compressedSize: originalSize,
        savingsPercent: 0,
        wasCompressed: false
      });
    };

    video.onerror = () => fallbackOriginal();

    video.onloadedmetadata = async () => {
      const srcWidth = video.videoWidth || 960;
      const srcHeight = video.videoHeight || 720;
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;

      // Skip transcoding long videos (> 45s) or already tiny videos (< 350 KB)
      if (!duration || duration > 45 || originalSize < 350 * 1024) {
        fallbackOriginal();
        return;
      }

      const scale = Math.min(1, maxWidth / srcWidth, maxHeight / srcHeight);
      const targetWidth = Math.max(2, Math.round((srcWidth * scale) / 2) * 2);
      const targetHeight = Math.max(2, Math.round((srcHeight * scale) / 2) * 2);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx || typeof canvas.captureStream !== 'function') {
        fallbackOriginal();
        return;
      }

      const stream = canvas.captureStream(fps);
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: targetBitrate
        });
      } catch {
        fallbackOriginal();
        return;
      }

      const chunks: Blob[] = [];
      let posterDataUrl: string | null = null;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onerror = () => fallbackOriginal(posterDataUrl);

      recorder.onstop = () => {
        if (settled) return;
        settled = true;
        cleanup();

        const baseMime = mimeType.split(';')[0];
        const blob = new Blob(chunks, { type: baseMime });

        // Only keep compressed output if it meaningfully reduced file size
        if (blob.size > 0 && blob.size < originalSize * 0.92) {
          const ext = baseMime === 'video/mp4' ? '.mp4' : '.webm';
          const baseName = file.name.replace(/\.[^/.]+$/, '') || 'about-video';
          const compressedFile = new File([blob], `${baseName}-landing${ext}`, {
            type: baseMime,
            lastModified: Date.now()
          });
          const savingsPercent = Math.max(1, Math.round(((originalSize - compressedFile.size) / originalSize) * 100));
          options.onProgress?.(100);
          resolve({
            file: compressedFile,
            posterDataUrl,
            originalSize,
            compressedSize: compressedFile.size,
            savingsPercent,
            wasCompressed: true
          });
        } else {
          resolve({
            file,
            posterDataUrl,
            originalSize,
            compressedSize: originalSize,
            savingsPercent: 0,
            wasCompressed: false
          });
        }
      };

      // Safety timeout (duration + 20s)
      timeoutId = window.setTimeout(() => {
        if (recorder.state === 'recording') {
          try {
            recorder.stop();
          } catch {
            fallbackOriginal(posterDataUrl);
          }
        } else {
          fallbackOriginal(posterDataUrl);
        }
      }, Math.max(25_000, (duration + 20) * 1000));

      const drawFrame = () => {
        if (settled || video.ended || video.paused) return;
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        if (!posterDataUrl) {
          try {
            posterDataUrl = canvas.toDataURL('image/webp', 0.8);
          } catch {
            posterDataUrl = null;
          }
        }
        if (duration > 0) {
          const pct = Math.min(98, Math.round((video.currentTime / duration) * 100));
          options.onProgress?.(pct);
        }
        rafId = requestAnimationFrame(drawFrame);
      };

      video.onended = () => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      };

      try {
        video.currentTime = 0;
        recorder.start(250);
        await video.play();
        drawFrame();
      } catch {
        if (recorder.state === 'recording') {
          try {
            recorder.stop();
          } catch {
            fallbackOriginal(posterDataUrl);
          }
        } else {
          fallbackOriginal(posterDataUrl);
        }
      }
    };

    video.src = objectUrl;
  });
}
