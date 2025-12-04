'use client';

/**
 * Theme Toggle Component
 * Allows visitors to toggle between light and dark themes on landing pages
 */

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingTheme } from '@/contexts/LandingThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useLandingTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {resolvedTheme === 'light' ? (
        <>
          <Moon className="h-5 w-5" />
          {showLabel && <span className="ml-2">Dark</span>}
        </>
      ) : (
        <>
          <Sun className="h-5 w-5" />
          {showLabel && <span className="ml-2">Light</span>}
        </>
      )}
    </Button>
  );
}
