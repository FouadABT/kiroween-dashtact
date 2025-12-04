/**
 * Color Contrast Utilities
 * Functions for calculating and validating WCAG color contrast ratios
 */

/**
 * Parse OKLCH color string to components
 * Format: oklch(L C H) or oklch(L C H / A)
 */
function parseOKLCH(color: string): { l: number; c: number; h: number; a: number } | null {
  const match = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/);
  if (!match) return null;

  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
    a: match[4] ? parseFloat(match[4]) : 1,
  };
}

/**
 * Convert OKLCH to relative luminance (simplified approximation)
 * For accurate WCAG contrast, we'd need full OKLCH -> sRGB -> relative luminance conversion
 * This is a simplified version using the L (lightness) component as an approximation
 */
function getRelativeLuminance(color: string): number {
  const oklch = parseOKLCH(color);
  if (!oklch) return 0.5; // Default middle value if parsing fails

  // OKLCH lightness (L) ranges from 0 to 1, which approximates relative luminance
  // This is a simplification - true conversion would require full color space transformation
  return oklch.l;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG formula: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * Normal text: 4.5:1
 * Large text: 3:1
 */
export function meetsWCAGAA(ratio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 * Normal text: 7:1
 * Large text: 4.5:1
 */
export function meetsWCAGAAA(ratio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get contrast level description
 */
export function getContrastLevel(ratio: number): 'fail' | 'aa' | 'aaa' {
  if (ratio >= 7) return 'aaa';
  if (ratio >= 4.5) return 'aa';
  return 'fail';
}

/**
 * Format contrast ratio for display
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
