'use client';

/**
 * ThemePreview Component
 * Shows live preview of theme changes with sample UI elements
 */

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export function ThemePreview() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-4">
      {/* Current Theme Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">Current Theme:</span>
        <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium capitalize">
          {resolvedTheme}
        </span>
      </div>

      {/* Typography Samples */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Heading Text</h3>
        <p className="text-base text-foreground">
          This is body text demonstrating the default font size and line height for readable content.
        </p>
        <p className="text-sm text-muted-foreground">
          This is muted text, typically used for secondary information and descriptions.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold mb-2">Buttons</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Primary
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Secondary
          </button>
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Destructive
          </button>
          <button className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors">
            Outline
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold mb-2">Card</h4>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <h5 className="font-semibold mb-2 text-card-foreground">Card Title</h5>
          <p className="text-sm text-muted-foreground">
            This is a card component showing how content appears with the current theme.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold mb-2">Input</h4>
        <input
          type="text"
          placeholder="Enter text..."
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold mb-2">Alerts</h4>
        
        <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-md">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Information</p>
            <p className="text-xs text-muted-foreground">This is an informational message.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Success</p>
            <p className="text-xs text-muted-foreground">Operation completed successfully.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Error</p>
            <p className="text-xs text-muted-foreground">Something went wrong.</p>
          </div>
        </div>
      </div>

      {/* Chart Colors */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold mb-2">Chart Colors</h4>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className="flex-1 h-12 rounded-md"
              style={{ backgroundColor: `var(--chart-${num})` }}
              title={`Chart ${num}`}
            />
          ))}
        </div>
      </div>

      {/* Muted Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold mb-2">Muted Background</h4>
        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            This section uses muted colors for subtle backgrounds and secondary content areas.
          </p>
        </div>
      </div>

      {/* Accent Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold mb-2">Accent</h4>
        <div className="bg-accent p-4 rounded-md">
          <p className="text-sm text-accent-foreground">
            Accent colors are used for highlights and emphasis throughout the interface.
          </p>
        </div>
      </div>
    </div>
  );
}
