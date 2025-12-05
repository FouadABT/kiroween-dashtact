/**
 * Focus Trap Utility
 * Traps focus within a container for modal dialogs and dropdowns
 */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
}

/**
 * Focus trap configuration
 */
interface FocusTrapOptions {
  initialFocus?: HTMLElement | null;
  returnFocus?: HTMLElement | null;
  escapeDeactivates?: boolean;
  onDeactivate?: () => void;
}

/**
 * Create a focus trap within a container
 */
export function createFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {}
): {
  activate: () => void;
  deactivate: () => void;
} {
  const {
    initialFocus = null,
    returnFocus = null,
    escapeDeactivates = true,
    onDeactivate,
  } = options;

  let isActive = false;
  let previousActiveElement: HTMLElement | null = null;

  /**
   * Handle Tab key to trap focus
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isActive) return;

    // Handle Escape key
    if (e.key === 'Escape' && escapeDeactivates) {
      e.preventDefault();
      deactivate();
      return;
    }

    // Handle Tab key
    if (e.key === 'Tab') {
      const focusableElements = getFocusableElements(container);
      
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element -> focus last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab on last element -> focus first element
      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
        return;
      }
    }
  };

  /**
   * Activate the focus trap
   */
  const activate = () => {
    if (isActive) return;

    isActive = true;
    previousActiveElement = document.activeElement as HTMLElement;

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Focus initial element or first focusable element
    const focusableElements = getFocusableElements(container);
    const elementToFocus = initialFocus || focusableElements[0];
    
    if (elementToFocus) {
      // Use setTimeout to ensure the element is rendered
      setTimeout(() => {
        elementToFocus.focus();
      }, 0);
    }
  };

  /**
   * Deactivate the focus trap
   */
  const deactivate = () => {
    if (!isActive) return;

    isActive = false;

    // Remove event listener
    document.removeEventListener('keydown', handleKeyDown);

    // Return focus to previous element
    if (returnFocus || previousActiveElement) {
      const elementToFocus = returnFocus || previousActiveElement;
      if (elementToFocus) {
        setTimeout(() => {
          elementToFocus.focus();
        }, 0);
      }
    }

    // Call deactivate callback
    onDeactivate?.();
  };

  return {
    activate,
    deactivate,
  };
}

/**
 * React hook for focus trap
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean,
  options: FocusTrapOptions = {}
) {
  const focusTrapRef = React.useRef<ReturnType<typeof createFocusTrap> | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Create focus trap
    focusTrapRef.current = createFocusTrap(containerRef.current, options);

    // Activate/deactivate based on isActive prop
    if (isActive) {
      focusTrapRef.current.activate();
    }

    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
      }
    };
  }, [containerRef, isActive, options]);

  // Don't return the ref during render - it's managed internally
}

// Add React import for the hook
import React from 'react';
