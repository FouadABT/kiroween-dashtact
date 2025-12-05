'use client';

/**
 * SkipToNotifications Component
 * Provides a skip link for keyboard users to jump directly to notifications
 */

import { useEffect, useState } from 'react';

/**
 * SkipToNotifications Component
 * Hidden link that becomes visible on keyboard focus
 */
export function SkipToNotifications() {
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip link on Tab key
      if (e.key === 'Tab') {
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  /**
   * Handle skip link click
   */
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Find notification center button
    const notificationButton = document.querySelector('[aria-label*="Notifications"]') as HTMLElement;
    
    if (notificationButton) {
      notificationButton.focus();
      notificationButton.click();
    }
  };

  return (
    <a
      href="#notifications"
      onClick={handleSkip}
      className={`
        fixed top-4 left-4 z-[9999]
        px-4 py-2 
        bg-primary text-primary-foreground
        rounded-md
        font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}
      `}
      tabIndex={0}
    >
      Skip to notifications
    </a>
  );
}
