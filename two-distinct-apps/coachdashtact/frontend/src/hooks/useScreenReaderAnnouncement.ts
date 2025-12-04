/**
 * useScreenReaderAnnouncement Hook
 * Provides accessible announcements for screen readers using ARIA live regions
 */

import { useEffect, useRef, useCallback } from 'react';

type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Hook to announce messages to screen readers
 * Creates and manages an ARIA live region for dynamic announcements
 */
export function useScreenReaderAnnouncement() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Create live region on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if live region already exists
    let liveRegion = document.getElementById('screen-reader-announcements') as HTMLDivElement;

    if (!liveRegion) {
      // Create live region
      liveRegion = document.createElement('div');
      liveRegion.id = 'screen-reader-announcements';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      
      // Add to document
      document.body.appendChild(liveRegion);
    }

    liveRegionRef.current = liveRegion;

    // Cleanup on unmount
    return () => {
      // Don't remove the live region as other components might be using it
      liveRegionRef.current = null;
    };
  }, []);

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   * @param priority - 'polite' (default) or 'assertive' for urgent messages
   */
  const announce = useCallback((message: string, priority: AnnouncementPriority = 'polite') => {
    if (!liveRegionRef.current) return;

    const liveRegion = liveRegionRef.current;

    // Update aria-live attribute based on priority
    liveRegion.setAttribute('aria-live', priority);

    // Clear previous message
    liveRegion.textContent = '';

    // Use setTimeout to ensure screen readers detect the change
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message;
      }
    }, 100);

    // Clear message after announcement
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 3000);
  }, []);

  return { announce };
}
