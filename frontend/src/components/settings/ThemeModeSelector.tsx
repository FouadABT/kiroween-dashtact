'use client';

/**
 * ThemeModeSelector Component
 * Allows users to select between light and dark theme modes
 */

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeModeSelector() {
  const { themeMode, setThemeMode } = useTheme();

  const modes: Array<{ value: 'light' | 'dark'; label: string; icon: React.ReactNode; description: string }> = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="w-5 h-5" />,
      description: 'Bright interface with light backgrounds',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="w-5 h-5" />,
      description: 'Dark interface easy on the eyes',
    },
  ];

  return (
    <div 
      className="space-y-3"
      role="radiogroup"
      aria-label="Theme mode selection"
    >
      {modes.map((mode) => (
        <label
          key={mode.value}
          className={`
            flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
            ${
              themeMode === mode.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }
          `}
        >
          <input
            type="radio"
            name="theme-mode"
            value={mode.value}
            checked={themeMode === mode.value}
            onChange={() => setThemeMode(mode.value)}
            className="sr-only"
            aria-label={`${mode.label} theme mode`}
            aria-describedby={`theme-mode-${mode.value}-description`}
          />
          <div
            className={`
              flex items-center justify-center w-10 h-10 rounded-md transition-colors
              ${themeMode === mode.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}
            aria-hidden="true"
          >
            {mode.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{mode.label}</span>
              {themeMode === mode.value && (
                <span 
                  className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full"
                  role="status"
                  aria-label="Currently active theme mode"
                >
                  Active
                </span>
              )}
            </div>
            <p 
              id={`theme-mode-${mode.value}-description`}
              className="text-sm text-muted-foreground mt-1"
            >
              {mode.description}
            </p>
          </div>
        </label>
      ))}
    </div>
  );
}
