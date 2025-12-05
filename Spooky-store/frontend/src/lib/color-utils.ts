/**
 * Color Utilities
 * Functions for color manipulation, contrast checking, and dark mode generation
 */

/**
 * Parse HSL color string to components
 */
function parseHSL(hsl: string): { h: number; s: number; l: number } | null {
  const match = hsl.match(/hsl\((\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%\)/);
  if (!match) return null;

  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

/**
 * Convert HSL components to string
 */
function hslToString(h: number, s: number, l: number): string {
  return `hsl(${h} ${s}% ${l}%)`;
}

/**
 * Calculate relative luminance for contrast checking
 */
function getRelativeLuminance(hsl: string): number {
  const parsed = parseHSL(hsl);
  if (!parsed) return 0;

  // Convert HSL to RGB
  const { h, s, l } = parsed;
  const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l / 100 - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  r += m;
  g += m;
  b += m;

  // Calculate relative luminance
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsContrastStandard(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(color1, color2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Generate dark mode color from light mode color
 * Inverts lightness while maintaining hue and adjusting saturation
 */
export function generateDarkModeColor(lightColor: string): string {
  const parsed = parseHSL(lightColor);
  if (!parsed) return lightColor;

  const { h, s, l } = parsed;

  // Invert lightness (light colors become dark, dark colors become light)
  const newL = 100 - l;

  // Slightly reduce saturation for dark mode (more muted colors)
  const newS = Math.max(0, s * 0.9);

  return hslToString(h, newS, newL);
}

/**
 * Generate a complete dark mode palette from light mode palette
 */
export function generateDarkModePalette(lightPalette: Record<string, string>): Record<string, string> {
  const darkPalette: Record<string, string> = {};

  for (const [key, value] of Object.entries(lightPalette)) {
    darkPalette[key] = generateDarkModeColor(value);
  }

  return darkPalette;
}

/**
 * Adjust color lightness
 */
export function adjustLightness(color: string, amount: number): string {
  const parsed = parseHSL(color);
  if (!parsed) return color;

  const { h, s, l } = parsed;
  const newL = Math.max(0, Math.min(100, l + amount));

  return hslToString(h, s, newL);
}

/**
 * Adjust color saturation
 */
export function adjustSaturation(color: string, amount: number): string {
  const parsed = parseHSL(color);
  if (!parsed) return color;

  const { h, s, l } = parsed;
  const newS = Math.max(0, Math.min(100, s + amount));

  return hslToString(h, newS, l);
}

/**
 * Get color suggestions based on a base color
 */
export function getColorSuggestions(baseColor: string): {
  lighter: string;
  light: string;
  base: string;
  dark: string;
  darker: string;
} {
  return {
    lighter: adjustLightness(baseColor, 20),
    light: adjustLightness(baseColor, 10),
    base: baseColor,
    dark: adjustLightness(baseColor, -10),
    darker: adjustLightness(baseColor, -20),
  };
}

/**
 * Validate contrast and suggest improvements
 */
export function validateAndSuggestContrast(
  foreground: string,
  background: string
): {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  suggestion?: string;
} {
  const ratio = getContrastRatio(foreground, background);
  const meetsAA = ratio >= 4.5;
  const meetsAAA = ratio >= 7;

  let suggestion: string | undefined;

  if (!meetsAA) {
    // Suggest adjusting foreground color
    const parsed = parseHSL(foreground);
    if (parsed) {
      const bgLuminance = getRelativeLuminance(background);
      const targetL = bgLuminance > 0.5 ? 20 : 80; // Dark text on light bg, light text on dark bg
      suggestion = hslToString(parsed.h, parsed.s, targetL);
    }
  }

  return {
    ratio,
    meetsAA,
    meetsAAA,
    suggestion,
  };
}

/**
 * Generate accessible color pair (foreground + background)
 */
export function generateAccessiblePair(baseColor: string): {
  foreground: string;
  background: string;
} {
  const parsed = parseHSL(baseColor);
  if (!parsed) {
    return {
      foreground: 'hsl(0 0% 0%)',
      background: 'hsl(0 0% 100%)',
    };
  }

  const { h, s } = parsed;

  // Generate light background and dark foreground
  const background = hslToString(h, Math.max(10, s * 0.2), 95);
  const foreground = hslToString(h, Math.min(100, s * 1.2), 20);

  return { foreground, background };
}
