'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Sidebar Color Test Component
 * Shows all sidebar theme variables with their current values
 */
export function SidebarColorTest() {
  const { resolvedTheme, settings } = useTheme();

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  const palette = resolvedTheme === 'light' ? settings.lightPalette : settings.darkPalette;

  const sidebarColors = [
    { name: 'Sidebar Background', var: '--sidebar-background', value: palette.sidebar },
    { name: 'Sidebar Foreground', var: '--sidebar-foreground', value: palette.sidebarForeground },
    { name: 'Sidebar Primary', var: '--sidebar-primary', value: palette.sidebarPrimary },
    { name: 'Sidebar Primary Foreground', var: '--sidebar-primary-foreground', value: palette.sidebarPrimaryForeground },
    { name: 'Sidebar Accent', var: '--sidebar-accent', value: palette.sidebarAccent },
    { name: 'Sidebar Accent Foreground', var: '--sidebar-accent-foreground', value: palette.sidebarAccentForeground },
    { name: 'Sidebar Border', var: '--sidebar-border', value: palette.sidebarBorder },
    { name: 'Sidebar Ring', var: '--sidebar-ring', value: palette.sidebarRing },
  ];

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-semibold text-foreground">
        Sidebar Colors ({resolvedTheme} mode)
      </h3>
      
      <div className="space-y-2">
        {sidebarColors.map((color) => (
          <div key={color.var} className="flex items-center gap-4 p-3 bg-background rounded border border-border">
            <div
              className="w-12 h-12 rounded border-2 border-border flex-shrink-0"
              style={{ backgroundColor: `hsl(${color.value})` }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">{color.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{color.var}</div>
              <div className="text-xs text-muted-foreground font-mono">hsl({color.value})</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-sidebar rounded-lg border border-sidebar-border">
        <h4 className="text-sm font-semibold text-sidebar-foreground mb-3">
          Sidebar Preview
        </h4>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2 p-2 rounded text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
            <div className="w-5 h-5 bg-sidebar-foreground/60 rounded" />
            <span className="text-sm">Normal Menu Item</span>
          </button>
          <button className="w-full flex items-center gap-2 p-2 rounded bg-sidebar-accent text-sidebar-accent-foreground">
            <div className="w-5 h-5 bg-sidebar-accent-foreground rounded" />
            <span className="text-sm">Active Menu Item</span>
          </button>
          <div className="w-full flex items-center gap-2 p-2 rounded bg-sidebar-primary text-sidebar-primary-foreground">
            <div className="w-5 h-5 bg-sidebar-primary-foreground rounded" />
            <span className="text-sm">Primary Element</span>
          </div>
        </div>
      </div>
    </div>
  );
}
