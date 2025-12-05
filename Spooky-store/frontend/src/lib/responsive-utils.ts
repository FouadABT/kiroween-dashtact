/**
 * Responsive Design Utilities
 * Handles breakpoints, responsive styles, and device detection
 */

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface ResponsiveValue<T> {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
  default: T;
}

export interface DeviceFrame {
  name: string;
  width: number;
  height: number;
  type: 'phone' | 'tablet' | 'desktop';
}

export const BREAKPOINTS: BreakpointConfig = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export const DEVICE_FRAMES: DeviceFrame[] = [
  { name: 'iPhone 14 Pro', width: 393, height: 852, type: 'phone' },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, type: 'phone' },
  { name: 'Samsung Galaxy S23', width: 360, height: 780, type: 'phone' },
  { name: 'iPad Mini', width: 768, height: 1024, type: 'tablet' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, type: 'tablet' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, type: 'tablet' },
  { name: 'MacBook Air', width: 1280, height: 832, type: 'desktop' },
  { name: 'MacBook Pro 14"', width: 1512, height: 982, type: 'desktop' },
  { name: 'MacBook Pro 16"', width: 1728, height: 1117, type: 'desktop' },
  { name: 'Desktop HD', width: 1920, height: 1080, type: 'desktop' },
  { name: 'Desktop 4K', width: 3840, height: 2160, type: 'desktop' },
];

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number = typeof window !== 'undefined' ? window.innerWidth : 1024): Breakpoint {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'mobile';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  if (width < BREAKPOINTS.wide) return 'desktop';
  return 'wide';
}

/**
 * Get responsive value for current breakpoint
 */
export function getResponsiveValue<T>(
  value: ResponsiveValue<T>,
  breakpoint: Breakpoint
): T {
  // Try exact match first
  if (value[breakpoint] !== undefined) {
    return value[breakpoint] as T;
  }
  
  // Fall back to smaller breakpoints
  const fallbackOrder: Breakpoint[] = ['wide', 'desktop', 'tablet', 'mobile'];
  const currentIndex = fallbackOrder.indexOf(breakpoint);
  
  for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
    const fallbackBreakpoint = fallbackOrder[i];
    if (value[fallbackBreakpoint] !== undefined) {
      return value[fallbackBreakpoint] as T;
    }
  }
  
  return value.default;
}

/**
 * Generate responsive CSS classes
 */
export function generateResponsiveClasses(
  property: string,
  values: ResponsiveValue<string | number>
): string {
  const classes: string[] = [];
  
  // Base class (mobile-first)
  const baseValue = values.mobile || values.default;
  classes.push(`${property}-${baseValue}`);
  
  // Responsive classes
  if (values.tablet) classes.push(`md:${property}-${values.tablet}`);
  if (values.desktop) classes.push(`lg:${property}-${values.desktop}`);
  if (values.wide) classes.push(`xl:${property}-${values.wide}`);
  
  return classes.join(' ');
}

/**
 * Generate srcset for responsive images
 */
export function generateResponsiveSrcSet(
  src: string,
  breakpoints: Partial<Record<Breakpoint, string>> = {}
): string {
  const srcset: string[] = [];
  
  if (breakpoints.mobile) {
    srcset.push(`${breakpoints.mobile} ${BREAKPOINTS.mobile}w`);
  }
  if (breakpoints.tablet) {
    srcset.push(`${breakpoints.tablet} ${BREAKPOINTS.tablet}w`);
  }
  if (breakpoints.desktop) {
    srcset.push(`${breakpoints.desktop} ${BREAKPOINTS.desktop}w`);
  }
  if (breakpoints.wide) {
    srcset.push(`${breakpoints.wide} ${BREAKPOINTS.wide}w`);
  }
  
  return srcset.join(', ') || src;
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(
  sizes: Partial<Record<Breakpoint, string>>
): string {
  const sizesList: string[] = [];
  
  if (sizes.wide) {
    sizesList.push(`(min-width: ${BREAKPOINTS.wide}px) ${sizes.wide}`);
  }
  if (sizes.desktop) {
    sizesList.push(`(min-width: ${BREAKPOINTS.desktop}px) ${sizes.desktop}`);
  }
  if (sizes.tablet) {
    sizesList.push(`(min-width: ${BREAKPOINTS.tablet}px) ${sizes.tablet}`);
  }
  if (sizes.mobile) {
    sizesList.push(sizes.mobile);
  }
  
  return sizesList.join(', ') || '100vw';
}

/**
 * Validate responsive content
 */
export interface ResponsiveValidationIssue {
  type: 'error' | 'warning';
  breakpoint: Breakpoint;
  message: string;
  suggestion: string;
}

export function validateResponsiveContent(
  content: {
    fontSize?: ResponsiveValue<number>;
    padding?: ResponsiveValue<number>;
    width?: ResponsiveValue<number>;
    visible?: ResponsiveValue<boolean>;
  }
): ResponsiveValidationIssue[] {
  const issues: ResponsiveValidationIssue[] = [];
  
  // Check font size readability
  if (content.fontSize) {
    Object.entries(content.fontSize).forEach(([bp, size]) => {
      if (typeof size === 'number' && size < 14 && bp !== 'default') {
        issues.push({
          type: 'warning',
          breakpoint: bp as Breakpoint,
          message: `Font size ${size}px may be too small for ${bp}`,
          suggestion: 'Use at least 14px for body text',
        });
      }
    });
  }
  
  // Check touch target sizes on mobile
  if (content.width?.mobile && content.width.mobile < 44) {
    issues.push({
      type: 'error',
      breakpoint: 'mobile',
      message: 'Touch target is too small',
      suggestion: 'Interactive elements should be at least 44x44px on mobile',
    });
  }
  
  // Check if content is hidden on all breakpoints
  if (content.visible) {
    const allHidden = Object.values(content.visible).every((v) => v === false);
    if (allHidden) {
      issues.push({
        type: 'error',
        breakpoint: 'mobile',
        message: 'Content is hidden on all breakpoints',
        suggestion: 'Make content visible on at least one breakpoint',
      });
    }
  }
  
  return issues;
}

/**
 * Check for horizontal scrolling
 */
export function checkHorizontalScroll(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth;
}

/**
 * Get device type from user agent
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent;
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Convert breakpoint to Tailwind prefix
 */
export function breakpointToTailwindPrefix(breakpoint: Breakpoint): string {
  const prefixMap: Record<Breakpoint, string> = {
    mobile: '',
    tablet: 'md:',
    desktop: 'lg:',
    wide: 'xl:',
  };
  
  return prefixMap[breakpoint];
}

/**
 * Generate responsive spacing classes
 */
export function generateResponsiveSpacing(
  property: 'p' | 'm' | 'px' | 'py' | 'pt' | 'pb' | 'pl' | 'pr' | 'mx' | 'my' | 'mt' | 'mb' | 'ml' | 'mr',
  values: ResponsiveValue<number>
): string {
  const classes: string[] = [];
  
  // Base value
  classes.push(`${property}-${values.default}`);
  
  // Responsive values
  if (values.tablet !== undefined) {
    classes.push(`md:${property}-${values.tablet}`);
  }
  if (values.desktop !== undefined) {
    classes.push(`lg:${property}-${values.desktop}`);
  }
  if (values.wide !== undefined) {
    classes.push(`xl:${property}-${values.wide}`);
  }
  
  return classes.join(' ');
}

/**
 * Check if viewport is in portrait mode
 */
export function isPortrait(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerHeight > window.innerWidth;
}

/**
 * Get safe area insets (for notched devices)
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined' || !CSS.supports('padding-top: env(safe-area-inset-top)')) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
  };
}
