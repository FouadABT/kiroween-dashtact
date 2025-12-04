/**
 * Accessibility Utilities
 * Handles accessibility validation, ARIA attributes, and keyboard navigation
 */

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'alt-text' | 'contrast' | 'heading' | 'aria' | 'keyboard' | 'form';
  message: string;
  element?: string;
  suggestion?: string;
}

export interface ContrastRatio {
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
    aaLarge: boolean;
    aaaLarge: boolean;
  };
}

/**
 * Calculate color contrast ratio (WCAG)
 */
export function calculateContrastRatio(foreground: string, background: string): ContrastRatio {
  const fgLuminance = getRelativeLuminance(foreground);
  const bgLuminance = getRelativeLuminance(background);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: {
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
      aaLarge: ratio >= 3,
      aaaLarge: ratio >= 4.5,
    },
  };
}

/**
 * Get relative luminance of a color
 */
function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Validate alt text for images
 */
export function validateAltText(altText: string): AccessibilityIssue | null {
  if (!altText || altText.trim() === '') {
    return {
      type: 'error',
      category: 'alt-text',
      message: 'Image is missing alt text',
      suggestion: 'Add descriptive alt text that explains the image content',
    };
  }
  
  if (altText.length < 3) {
    return {
      type: 'warning',
      category: 'alt-text',
      message: 'Alt text is too short',
      suggestion: 'Provide more descriptive alt text (at least 3 characters)',
    };
  }
  
  if (altText.length > 125) {
    return {
      type: 'warning',
      category: 'alt-text',
      message: 'Alt text is too long',
      suggestion: 'Keep alt text concise (under 125 characters)',
    };
  }
  
  const badPatterns = ['image of', 'picture of', 'photo of', 'graphic of'];
  if (badPatterns.some((pattern) => altText.toLowerCase().includes(pattern))) {
    return {
      type: 'info',
      category: 'alt-text',
      message: 'Alt text contains redundant phrases',
      suggestion: 'Remove phrases like "image of" or "picture of"',
    };
  }
  
  return null;
}

/**
 * Validate heading hierarchy
 */
export function validateHeadingHierarchy(headings: { level: number; text: string }[]): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  if (headings.length === 0) {
    return issues;
  }
  
  // Check if first heading is h1
  if (headings[0].level !== 1) {
    issues.push({
      type: 'error',
      category: 'heading',
      message: 'Page should start with an h1 heading',
      suggestion: 'Add an h1 heading as the main page title',
    });
  }
  
  // Check for skipped levels
  for (let i = 1; i < headings.length; i++) {
    const prevLevel = headings[i - 1].level;
    const currentLevel = headings[i].level;
    
    if (currentLevel > prevLevel + 1) {
      issues.push({
        type: 'error',
        category: 'heading',
        message: `Heading level skipped from h${prevLevel} to h${currentLevel}`,
        element: headings[i].text,
        suggestion: `Use h${prevLevel + 1} instead of h${currentLevel}`,
      });
    }
  }
  
  // Check for empty headings
  headings.forEach((heading) => {
    if (!heading.text || heading.text.trim() === '') {
      issues.push({
        type: 'error',
        category: 'heading',
        message: `Empty h${heading.level} heading found`,
        suggestion: 'Add descriptive text to the heading',
      });
    }
  });
  
  return issues;
}

/**
 * Validate ARIA attributes
 */
export function validateAriaAttributes(
  element: { role?: string; ariaLabel?: string; ariaLabelledBy?: string; ariaDescribedBy?: string }
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check for role without label
  if (element.role && !element.ariaLabel && !element.ariaLabelledBy) {
    const rolesNeedingLabel = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem'];
    if (rolesNeedingLabel.includes(element.role)) {
      issues.push({
        type: 'warning',
        category: 'aria',
        message: `Element with role="${element.role}" should have an accessible label`,
        suggestion: 'Add aria-label or aria-labelledby attribute',
      });
    }
  }
  
  return issues;
}

/**
 * Validate form accessibility
 */
export function validateFormAccessibility(form: {
  inputs: { id?: string; label?: string; required?: boolean; type?: string }[];
}): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  form.inputs.forEach((input, index) => {
    // Check for missing labels
    if (!input.label) {
      issues.push({
        type: 'error',
        category: 'form',
        message: `Input field ${index + 1} is missing a label`,
        suggestion: 'Add a <label> element associated with the input',
      });
    }
    
    // Check for required fields without indication
    if (input.required && input.label && !input.label.includes('*') && !input.label.toLowerCase().includes('required')) {
      issues.push({
        type: 'warning',
        category: 'form',
        message: `Required field "${input.label}" should indicate it's required`,
        suggestion: 'Add visual indicator (e.g., asterisk) and aria-required="true"',
      });
    }
  });
  
  return issues;
}

/**
 * Generate ARIA live region announcement
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;
  
  let liveRegion = document.getElementById('aria-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  liveRegion.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    if (liveRegion) liveRegion.textContent = '';
  }, 1000);
}

/**
 * Create focus trap for modals
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  firstElement?.focus();
  
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Handle keyboard navigation for custom components
 */
export function handleArrowKeyNavigation(
  e: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onNavigate: (index: number) => void
): void {
  const { key } = e;
  
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
    return;
  }
  
  e.preventDefault();
  
  let newIndex = currentIndex;
  
  switch (key) {
    case 'ArrowUp':
    case 'ArrowLeft':
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      break;
    case 'ArrowDown':
    case 'ArrowRight':
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = items.length - 1;
      break;
  }
  
  items[newIndex]?.focus();
  onNavigate(newIndex);
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
  
  return isInteractive || (tabIndex !== null && tabIndex !== '-1');
}

/**
 * Get accessibility score for a page
 */
export function calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
  const errorWeight = 10;
  const warningWeight = 5;
  const infoWeight = 1;
  
  const totalDeductions = issues.reduce((sum, issue) => {
    switch (issue.type) {
      case 'error':
        return sum + errorWeight;
      case 'warning':
        return sum + warningWeight;
      case 'info':
        return sum + infoWeight;
      default:
        return sum;
    }
  }, 0);
  
  return Math.max(0, 100 - totalDeductions);
}
