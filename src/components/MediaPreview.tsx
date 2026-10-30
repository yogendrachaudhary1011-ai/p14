import React from 'react';
import { isVideoMedia } from '../utils/media';

interface MediaPreviewProps {
  src: string;
  alt?: string;
  mimeType?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  fallbackSrc?: string;
  controls?: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  src,
  alt = '',
  mimeType,
  className,
  loading = 'lazy',
  fallbackSrc,
  controls = true
}) => {
  if (isVideoMedia(src, mimeType)) {
    return <video src={src} className={className} controls={controls} playsInline preload="metadata" aria-label={alt || 'Video preview'} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={(event) => {
        if (fallbackSrc && event.currentTarget.src !== new URL(fallbackSrc, window.location.href).href) {
          event.currentTarget.src = fallbackSrc;
        }
      }}
    />
  );
};
