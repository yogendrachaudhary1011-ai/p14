import React, { useState, useEffect, useRef } from 'react';
import { isVideoMedia, getInstantFallbackSvg } from '../utils/media';

interface MediaPreviewProps {
  src: string;
  alt?: string;
  mimeType?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
  fallbackSrc?: string;
  controls?: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  src,
  alt = '',
  mimeType,
  className = '',
  style,
  onLoad,
  onError,
  loading = 'lazy',
  priority = false,
  fallbackSrc,
  controls = true
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src || '');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Clean fallback: never hit slow external placehold.co services
  const resolvedFallback =
    !fallbackSrc || fallbackSrc.includes('placehold.co')
      ? getInstantFallbackSvg(alt || 'Image asset')
    : fallbackSrc;

  // Immediate check for cached images that already resolved complete
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

    // If the browser already has the image decoded from memory or disk cache
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src, resolvedFallback]);

  // Secondary check in next frame for fast network/cache hits
  useEffect(() => {
    if (!isLoaded && imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [isLoaded, currentSrc]);

  if (isVideoMedia(src, mimeType)) {
    return (
      <video
        src={src}
        className={className}
        style={style}
        controls={controls}
        playsInline
        preload="metadata"
        aria-label={alt || 'Video preview'}
      />
    );
  }

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
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
      }, 350);
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
    <div className="relative w-full min-w-0 flex items-center justify-center overflow-hidden">
      {/* Sleek loading shimmer skeleton while image is fetching */}
      {!isLoaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 min-h-[160px] bg-white/[0.03] animate-pulse pointer-events-none rounded-[inherit] flex items-center justify-center z-10"
        >
          <div className="w-6 h-6 border-2 border-white/10 border-t-[#f37021]/60 rounded-full animate-spin" />
        </div>
      )}

      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={style}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : loading}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' } : {})}
      />
    </div>
  );
};
