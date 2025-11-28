/**
 * Performance Optimization Utilities
 * Handles image optimization, lazy loading, and performance monitoring
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  blur?: boolean;
}

export interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  onLoad?: () => void;
}

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

/**
 * Generate optimized image URL with responsive variants
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const { width, height, quality = 75, format = 'webp' } = options;
  
  // For Next.js Image Optimization API
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('f', format);
  
  return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [640, 768, 1024, 1280, 1536]
): string {
  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(src, { width, format: 'webp' });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataUrl(width: number = 10, height: number = 10): string {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) return '';
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(200, 200, 200, 0.1)');
  gradient.addColorStop(1, 'rgba(150, 150, 150, 0.1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * Lazy load observer hook
 */
export function createLazyLoadObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: LazyLoadOptions = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  const { rootMargin = '50px', threshold = 0.01 } = options;
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
        }
      });
    },
    { rootMargin, threshold }
  );
}

/**
 * Measure Core Web Vitals
 */
export function measureWebVitals(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      resolve({ fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0 });
      return;
    }
    
    const metrics: Partial<PerformanceMetrics> = {};
    
    // TTFB
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }
    
    // FCP
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }
    
    // LCP
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }
    }
    
    // Return metrics after a delay to allow collection
    setTimeout(() => {
      resolve({
        fcp: metrics.fcp || 0,
        lcp: metrics.lcp || 0,
        fid: 0, // FID requires user interaction
        cls: 0, // CLS requires layout shift tracking
        ttfb: metrics.ttfb || 0,
      });
    }, 3000);
  });
}

/**
 * Calculate Lighthouse-style performance score
 */
export function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  // Simplified scoring based on Core Web Vitals
  const fcpScore = metrics.fcp < 1800 ? 100 : Math.max(0, 100 - (metrics.fcp - 1800) / 10);
  const lcpScore = metrics.lcp < 2500 ? 100 : Math.max(0, 100 - (metrics.lcp - 2500) / 20);
  const ttfbScore = metrics.ttfb < 600 ? 100 : Math.max(0, 100 - (metrics.ttfb - 600) / 5);
  
  // Weighted average
  return Math.round((fcpScore * 0.3 + lcpScore * 0.4 + ttfbScore * 0.3));
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources: string[]): void {
  if (typeof document === 'undefined') return;
  
  resources.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    
    // Determine resource type
    if (href.endsWith('.woff2') || href.endsWith('.woff')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (href.endsWith('.css')) {
      link.as = 'style';
    } else if (href.endsWith('.js')) {
      link.as = 'script';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Defer non-critical CSS
 */
export function deferNonCriticalCSS(href: string): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
  };
  
  document.head.appendChild(link);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get optimal image format support
 */
export async function getOptimalImageFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
  if (typeof window === 'undefined') return 'jpeg';
  
  // Check AVIF support
  const avifSupport = await checkImageFormatSupport('avif');
  if (avifSupport) return 'avif';
  
  // Check WebP support
  const webpSupport = await checkImageFormatSupport('webp');
  if (webpSupport) return 'webp';
  
  return 'jpeg';
}

async function checkImageFormatSupport(format: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    
    const testImages: Record<string, string> = {
      webp: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=',
    };
    
    img.src = testImages[format] || '';
  });
}
