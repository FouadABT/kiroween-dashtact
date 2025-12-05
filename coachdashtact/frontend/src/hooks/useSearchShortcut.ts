/**
 * useSearchShortcut Hook
 * Manages keyboard shortcut (Cmd+K / Ctrl+K) for opening search dialog
 */

import { useEffect, useState } from 'react';

export function useSearchShortcut() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => setIsOpen(false);

  return {
    isOpen,
    openSearch,
    closeSearch,
  };
}
