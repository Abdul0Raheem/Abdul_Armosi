'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

interface ProductImageFrameProps {
  src?: string;
  alt: string;
  fallbackText?: string;
  background?: string;
  height?: number;
  className?: string;
  style?: CSSProperties;
}

export function ProductImageFrame({
  src,
  alt,
  fallbackText = 'No image',
  background,
  height = 160,
  className = '',
  style,
}: ProductImageFrameProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const normalizedSrc = src?.trim() || '';
  const showImage = Boolean(normalizedSrc) && failedSrc !== normalizedSrc;

  return (
    <div
      className={`product-image-frame ${className}`}
      style={{
        background,
        minHeight: height,
        height,
        ...style,
      }}
    >
      {showImage ? (
        <img
          src={normalizedSrc}
          alt={alt}
          className="product-image-fill"
          onError={() => setFailedSrc(normalizedSrc)}
          loading="lazy"
        />
      ) : (
        <div className="product-image-fallback">{fallbackText}</div>
      )}
    </div>
  );
}
