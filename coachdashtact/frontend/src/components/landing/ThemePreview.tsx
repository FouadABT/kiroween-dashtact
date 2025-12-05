'use client';

/**
 * Theme Preview Component
 * Shows side-by-side comparison of light and dark themes in the editor
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Monitor, SplitSquareHorizontal } from 'lucide-react';
import { useLandingTheme } from '@/contexts/LandingThemeContext';

interface ThemePreviewProps {
  children: React.ReactNode;
  showControls?: boolean;
}

export function ThemePreview({ children, showControls = true }: ThemePreviewProps) {
  const { themeMode, resolvedTheme, setThemeMode } = useLandingTheme();
  const [viewMode, setViewMode] = useState<'single' | 'split'>('single');

  return (
    <div className="space-y-4">
      {showControls && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Theme Preview</span>
              <Badge variant="outline" className="capitalize">
                {themeMode}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Mode Selector */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Theme Mode</p>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={themeMode === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setThemeMode('light')}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={themeMode === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setThemeMode('dark')}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={themeMode === 'auto' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setThemeMode('auto')}
                  className="flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Auto
                </Button>
                <Button
                  variant={themeMode === 'toggle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setThemeMode('toggle')}
                  className="flex items-center gap-2"
                >
                  <SplitSquareHorizontal className="h-4 w-4" />
                  Toggle
                </Button>
              </div>
            </div>

            {/* View Mode Selector */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Preview Mode</p>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'single' | 'split')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single View</TabsTrigger>
                  <TabsTrigger value="split">Side-by-Side</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Current Theme Indicator */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Current Theme:</span>
              <Badge variant="secondary" className="capitalize">
                {resolvedTheme === 'light' ? (
                  <>
                    <Sun className="h-3 w-3 mr-1" />
                    Light
                  </>
                ) : (
                  <>
                    <Moon className="h-3 w-3 mr-1" />
                    Dark
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Content */}
      {viewMode === 'single' ? (
        <div className="border border-border rounded-lg overflow-hidden">
          {children}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <Sun className="h-4 w-4" />
              <span className="text-sm font-medium">Light Theme</span>
            </div>
            <div className="light border border-border rounded-lg overflow-hidden">
              {children}
            </div>
          </div>

          {/* Dark Theme Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <Moon className="h-4 w-4" />
              <span className="text-sm font-medium">Dark Theme</span>
            </div>
            <div className="dark border border-border rounded-lg overflow-hidden bg-slate-950">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
