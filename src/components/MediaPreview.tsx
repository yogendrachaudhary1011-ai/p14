import React, { useState, useEffect, useRef } from 'react';
import { isVideoMedia, getInstantFallbackSvg } from '../utils/media';

interface MediaPreviewProps {
  src: string;
  alt?: string;
  mimeType?: string;
  className?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
  fallbackSrc?: string;
  controls?: boolean;
}

// Global cache of URLs that have already successfully loaded in this session
const loadedMediaCache = new Set<string>();

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  src,
  alt = '',
  mimeType,
  className = '',
  containerClassName,
  style,
  onLoad,
  onError,
  loading = 'lazy',
  priority = false,
  fallbackSrc,
  controls = true
}) => {
  const isPrecached = Boolean(
    src && (
      loadedMediaCache.has(src) ||
      src.startsWith('data:') ||
      src.startsWith('blob:')
    )
  );

  const [currentSrc, setCurrentSrc] = useState<string>(src || '');
  const [isLoaded, setIsLoaded] = useState<boolean>(isPrecached);
  const [hasError, setHasError] = useState<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Clean fallback: never hit slow external placehold.co services
  const resolvedFallback =
    !fallbackSrc || fallbackSrc.includes('placehold.co')
      ? getInstantFallbackSvg(alt || 'Image asset')
      : fallbackSrc;

  // Immediate synchronous cache check and warm probe
  useEffect(() => {
    retryCountRef.current = 0;
    setHasError(false);

    if (!src || !src.trim()) {
      setCurrentSrc(resolvedFallback);
      setHasError(true);
      setIsLoaded(true);
      return;
    }

    setCurrentSrc(src);

    if (loadedMediaCache.has(src)) {
      setIsLoaded(true);
      return;
    }

    // Check DOM img element status directly
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      loadedMediaCache.add(src);
      setIsLoaded(true);
    }
  }, [src, resolvedFallback]);

  if (isVideoMedia(src, mimeType)) {
    return (
      <video
        src={src}
        className={className}
        style={style}
        controls={controls}
        playsInline
        preload={priority ? 'metadata' : 'none'}
        aria-label={alt || 'Video preview'}
      />
    );
  }

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (currentSrc) loadedMediaCache.add(currentSrc);
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (retryCountRef.current === 0 && currentSrc && !currentSrc.startsWith('data:') && !currentSrc.startsWith('blob:')) {
      retryCountRef.current += 1;
      // Retry once after brief delay
      setTimeout(() => {
        const separator = currentSrc.includes('?') ? '&' : '?';
        setCurrentSrc(`${currentSrc}${separator}retry=${Date.now()}`);
      }, 200);
      return;
    }

    setHasError(true);
    setIsLoaded(true);
    if (currentSrc !== resolvedFallback) {
      setCurrentSrc(resolvedFallback);
    }
    onError?.(event);
  };

  return (
    <div
      className={`relative w-full min-w-0 ${
        containerClassName || 'flex items-center justify-center overflow-hidden'
      }`}
    >
      {/* Subtle non-blocking background skeleton while image streams in */}
      {!isLoaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-white/[0.02] pointer-events-none rounded-none"
        />
      )}

      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={className}
        style={style}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : loading}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  );
};
