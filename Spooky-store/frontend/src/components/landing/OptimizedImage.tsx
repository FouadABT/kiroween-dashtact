'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createLazyLoadObserver, generateSrcSet, generateBlurDataUrl } from '@/lib/performance-utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
  lazyLoad?: boolean;
  blurPlaceholder?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  onLoad,
  lazyLoad = true,
  blurPlaceholder = true,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad || priority);
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blurPlaceholder && width && height) {
      const dataUrl = generateBlurDataUrl(10, 10);
      setBlurDataUrl(dataUrl);
    }
  }, [blurPlaceholder, width, height]);

  useEffect(() => {
    if (!lazyLoad || priority || shouldLoad) return;

    const observer = createLazyLoadObserver(
      (entry) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer?.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (observer && imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, [lazyLoad, priority, shouldLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  if (!shouldLoad) {
    return (
      <div
        ref={imgRef}
        className={`bg-muted animate-pulse ${className}`}
        style={{ width, height }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  const imageProps: any = {
    src,
    alt,
    quality,
    onLoad: handleLoad,
    className: `transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`,
  };

  if (fill) {
    imageProps.fill = true;
    imageProps.sizes = sizes || '100vw';
  } else if (width && height) {
    imageProps.width = width;
    imageProps.height = height;
  }

  if (priority) {
    imageProps.priority = true;
  }

  if (blurDataUrl && blurPlaceholder) {
    imageProps.placeholder = 'blur';
    imageProps.blurDataURL = blurDataUrl;
  }

  return (
    <div ref={imgRef} className="relative">
      <Image {...imageProps} />
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'src'> {
  src: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
    default: string;
  };
  artDirection?: boolean;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
  quality,
  onLoad,
  lazyLoad,
  blurPlaceholder,
  artDirection = false,
}: ResponsiveImageProps) {
  if (!artDirection) {
    // Use srcset for resolution switching
    const srcset = generateSrcSet(src.default);
    return (
      <OptimizedImage
        src={src.default}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        quality={quality}
        onLoad={onLoad}
        lazyLoad={lazyLoad}
        blurPlaceholder={blurPlaceholder}
      />
    );
  }

  // Use picture element for art direction
  return (
    <picture>
      {src.wide && (
        <source media="(min-width: 1280px)" srcSet={src.wide} />
      )}
      {src.desktop && (
        <source media="(min-width: 1024px)" srcSet={src.desktop} />
      )}
      {src.tablet && (
        <source media="(min-width: 768px)" srcSet={src.tablet} />
      )}
      {src.mobile && (
        <source media="(max-width: 767px)" srcSet={src.mobile} />
      )}
      <OptimizedImage
        src={src.default}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        quality={quality}
        onLoad={onLoad}
        lazyLoad={lazyLoad}
        blurPlaceholder={blurPlaceholder}
      />
    </picture>
  );
}

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  captions?: { src: string; label: string; srclang: string }[];
}

export function LazyVideo({
  src,
  poster,
  className = '',
  autoPlay = false,
  loop = false,
  muted = true,
  controls = true,
  captions = [],
}: LazyVideoProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = createLazyLoadObserver(
      (entry) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer?.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (observer && videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  if (!shouldLoad) {
    return (
      <div
        ref={videoRef}
        className={`bg-muted animate-pulse ${className}`}
        style={{ aspectRatio: '16/9' }}
      >
        {poster && (
          <img src={poster} alt="Video thumbnail" className="w-full h-full object-cover" />
        )}
      </div>
    );
  }

  return (
    <div ref={videoRef}>
      <video
        src={src}
        poster={poster}
        className={className}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
      >
        {captions.map((caption, index) => (
          <track
            key={index}
            kind="captions"
            src={caption.src}
            srcLang={caption.srclang}
            label={caption.label}
          />
        ))}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
