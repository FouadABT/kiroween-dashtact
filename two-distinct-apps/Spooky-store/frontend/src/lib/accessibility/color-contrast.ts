/**
 * Color Contrast Utilities
 * 
 * Utilities for checking WCAG 2.1 color contrast compliance.
 * Supports HSL and RGB color formats.
 */

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * Calculate relative luminance of a color
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function getContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const l1 = getRelativeLuminance(...color1);
  const l2 = getRelativeLuminance(...color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse HSL color string to RGB
 */
export function parseHslToRgb(hslString: string): [number, number, number] | null {
  // Match HSL format: "240 10% 3.9%" or "hsl(240, 10%, 3.9%)"
  const match = hslString.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
  
  if (!match) {
    return null;
  }

  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]);
  const l = parseFloat(match[3]);

  return hslToRgb(h, s, l);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAG_AA(
  contrastRatio: number,
  isLargeText: boolean = false
): boolean {
  const threshold = isLargeText ? 3 : 4.5;
  return contrastRatio >= threshold;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAG_AAA(
  contrastRatio: number,
  isLargeText: boolean = false
): boolean {
  const threshold = isLargeText ? 4.5 : 7;
  return contrastRatio >= threshold;
}

/**
 * Get WCAG compliance level for a contrast ratio
 */
export function getWCAGLevel(
  contrastRatio: number,
  isLargeText: boolean = false
): 'AAA' | 'AA' | 'Fail' {
  if (meetsWCAG_AAA(contrastRatio, isLargeText)) {
    return 'AAA';
  }
  if (meetsWCAG_AA(contrastRatio, isLargeText)) {
    return 'AA';
  }
  return 'Fail';
}

/**
 * Check contrast between two HSL color strings
 */
export function checkHslContrast(
  hsl1: string,
  hsl2: string,
  isLargeText: boolean = false
): {
  ratio: number;
  level: 'AAA' | 'AA' | 'Fail';
  passes: boolean;
} {
  const rgb1 = parseHslToRgb(hsl1);
  const rgb2 = parseHslToRgb(hsl2);

  if (!rgb1 || !rgb2) {
    return {
      ratio: 0,
      level: 'Fail',
      passes: false,
    };
  }

  const ratio = getContrastRatio(rgb1, rgb2);
  const level = getWCAGLevel(ratio, isLargeText);
  const passes = meetsWCAG_AA(ratio, isLargeText);

  return { ratio, level, passes };
}

/**
 * Verify all theme colors meet WCAG AA standards
 */
export function verifyThemeContrast(theme: {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  destructive: string;
  destructiveForeground: string;
  mutedForeground: string;
}): {
  valid: boolean;
  results: Array<{
    pair: string;
    ratio: number;
    level: string;
    passes: boolean;
  }>;
} {
  const checks = [
    { pair: 'background/foreground', colors: [theme.background, theme.foreground] },
    { pair: 'primary/primaryForeground', colors: [theme.primary, theme.primaryForeground] },
    { pair: 'destructive/destructiveForeground', colors: [theme.destructive, theme.destructiveForeground] },
    { pair: 'background/mutedForeground', colors: [theme.background, theme.mutedForeground] },
  ];

  const results = checks.map(({ pair, colors }) => {
    const result = checkHslContrast(colors[0], colors[1]);
    return {
      pair,
      ...result,
    };
  });

  const valid = results.every((r) => r.passes);

  return { valid, results };
}

/**
 * Get CSS custom property value from document
 */
export function getCssVariable(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/**
 * Check current theme contrast in browser
 */
export function checkCurrentThemeContrast(): {
  valid: boolean;
  results: Array<{
    pair: string;
    ratio: number;
    level: string;
    passes: boolean;
  }>;
} {
  const theme = {
    background: getCssVariable('--background'),
    foreground: getCssVariable('--foreground'),
    primary: getCssVariable('--primary'),
    primaryForeground: getCssVariable('--primary-foreground'),
    destructive: getCssVariable('--destructive'),
    destructiveForeground: getCssVariable('--destructive-foreground'),
    mutedForeground: getCssVariable('--muted-foreground'),
  };

  return verifyThemeContrast(theme);
}
