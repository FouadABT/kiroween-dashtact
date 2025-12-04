/**
 * Accessibility Testing Utilities
 * 
 * This file contains utilities to test accessibility features
 * in the dashboard starter kit components.
 */

export interface AccessibilityTestResult {
  component: string;
  passed: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Test keyboard navigation functionality
 */
export function testKeyboardNavigation(): AccessibilityTestResult {
  const issues: string[] = [];

  // Test focus management
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) {
    issues.push('No focusable elements found on page');
  }

  // Test skip link
  const skipLink = document.querySelector('a[href="#main-content"]');
  if (!skipLink) {
    issues.push('Skip to main content link not found');
  }

  // Test ARIA labels
  const buttonsWithoutLabels = document.querySelectorAll(
    'button:not([aria-label]):not([aria-labelledby]):not([title])'
  );
  
  buttonsWithoutLabels.forEach((button) => {
    const hasVisibleText = button.textContent?.trim();
    const hasScreenReaderText = button.querySelector('.sr-only');
    
    if (!hasVisibleText && !hasScreenReaderText) {
      issues.push(`Button without accessible label found: ${button.outerHTML.substring(0, 100)}...`);
    }
  });

  return {
    component: 'Keyboard Navigation',
    passed: issues.length === 0,
    issues,
    recommendations: [
      'Ensure all interactive elements are keyboard accessible',
      'Provide clear focus indicators',
      'Implement logical tab order',
      'Add skip links for main content areas'
    ]
  };
}

/**
 * Test ARIA attributes and semantic markup
 */
export function testAriaAttributes(): AccessibilityTestResult {
  const issues: string[] = [];

  // Test form labels
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') ||
                    document.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel) {
      issues.push(`Form control without label: ${input.outerHTML.substring(0, 100)}...`);
    }
  });

  // Test navigation landmarks
  const nav = document.querySelector('nav[aria-label]');
  if (!nav) {
    issues.push('Navigation without aria-label found');
  }

  // Test main content area
  const main = document.querySelector('main[role="main"], main');
  if (!main) {
    issues.push('Main content area not properly marked up');
  }

  // Test table accessibility
  const tables = document.querySelectorAll('table');
  tables.forEach((table) => {
    const hasCaption = table.querySelector('caption') || table.getAttribute('aria-label');
    if (!hasCaption) {
      issues.push('Table without caption or aria-label found');
    }

    const headers = table.querySelectorAll('th');
    headers.forEach((header) => {
      if (!header.getAttribute('scope') && !header.getAttribute('role')) {
        issues.push('Table header without scope attribute found');
      }
    });
  });

  return {
    component: 'ARIA Attributes',
    passed: issues.length === 0,
    issues,
    recommendations: [
      'Use semantic HTML elements where possible',
      'Add ARIA labels for complex interactions',
      'Ensure form controls have associated labels',
      'Use landmarks to structure page content'
    ]
  };
}

/**
 * Test screen reader compatibility
 */
export function testScreenReaderSupport(): AccessibilityTestResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Test live regions
  const liveRegions = document.querySelectorAll('[aria-live]');
  if (liveRegions.length === 0) {
    recommendations.push('Consider adding live regions for dynamic content updates');
  }

  // Test hidden content
  const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
  hiddenElements.forEach((element) => {
    const hasInteractiveContent = element.querySelectorAll('button, a, input, select, textarea').length > 0;
    if (hasInteractiveContent) {
      issues.push('Interactive content found inside aria-hidden element');
    }
  });

  // Test image alt text
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
      issues.push(`Image without alt text: ${img.outerHTML.substring(0, 100)}...`);
    }
  });

  // Test icon accessibility
  const icons = document.querySelectorAll('svg, [class*="icon"]');
  icons.forEach((icon) => {
    const isDecorative = icon.getAttribute('aria-hidden') === 'true';
    const hasLabel = icon.getAttribute('aria-label') || icon.getAttribute('title');
    
    if (!isDecorative && !hasLabel) {
      recommendations.push('Consider adding aria-hidden="true" to decorative icons or aria-label to meaningful icons');
    }
  });

  return {
    component: 'Screen Reader Support',
    passed: issues.length === 0,
    issues,
    recommendations: [
      'Provide alternative text for images',
      'Use aria-hidden for decorative elements',
      'Implement live regions for dynamic updates',
      'Test with actual screen readers'
    ]
  };
}

/**
 * Test color contrast and visual accessibility
 */
export function testVisualAccessibility(): AccessibilityTestResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Test focus indicators
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  let elementsWithoutFocusStyles = 0;
  focusableElements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element, ':focus');
    const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '0px';
    const hasBoxShadow = computedStyle.boxShadow !== 'none';
    const hasRing = computedStyle.getPropertyValue('--tw-ring-width') !== '';
    
    if (!hasOutline && !hasBoxShadow && !hasRing) {
      elementsWithoutFocusStyles++;
    }
  });

  if (elementsWithoutFocusStyles > 0) {
    recommendations.push(`${elementsWithoutFocusStyles} elements may need better focus indicators`);
  }

  // Test text size
  const textElements = document.querySelectorAll('p, span, div, button, a');
  textElements.forEach((element) => {
    const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    if (fontSize < 14) {
      recommendations.push('Some text may be too small (less than 14px)');
    }
  });

  return {
    component: 'Visual Accessibility',
    passed: issues.length === 0,
    issues,
    recommendations: [
      'Ensure sufficient color contrast (4.5:1 for normal text)',
      'Provide clear focus indicators',
      'Use adequate font sizes (minimum 14px)',
      'Test with high contrast mode'
    ]
  };
}

/**
 * Run all accessibility tests
 */
export function runAccessibilityTests(): AccessibilityTestResult[] {
  return [
    testKeyboardNavigation(),
    testAriaAttributes(),
    testScreenReaderSupport(),
    testVisualAccessibility()
  ];
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(): string {
  const results = runAccessibilityTests();
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  
  let report = `Accessibility Test Report\n`;
  report += `========================\n\n`;
  report += `Overall Score: ${passedTests}/${totalTests} tests passed\n\n`;
  
  results.forEach((result) => {
    report += `${result.component}: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    
    if (result.issues.length > 0) {
      report += `  Issues:\n`;
      result.issues.forEach(issue => {
        report += `    - ${issue}\n`;
      });
    }
    
    if (result.recommendations.length > 0) {
      report += `  Recommendations:\n`;
      result.recommendations.forEach(rec => {
        report += `    - ${rec}\n`;
      });
    }
    
    report += `\n`;
  });
  
  return report;
}