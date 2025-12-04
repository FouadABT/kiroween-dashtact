'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FontStatus {
  name: string;
  variable: string;
  loaded: boolean;
  fallback: string;
}

export function FontVerification() {
  const [fontStatuses, setFontStatuses] = useState<FontStatus[]>([]);

  useEffect(() => {
    // Check if fonts are loaded
    const checkFonts = async () => {
      const fonts: FontStatus[] = [
        // Sans Serif
        { name: 'Inter', variable: '--font-inter', loaded: false, fallback: 'system-ui' },
        { name: 'Roboto', variable: '--font-roboto', loaded: false, fallback: 'system-ui' },
        { name: 'Open Sans', variable: '--font-open-sans', loaded: false, fallback: 'system-ui' },
        { name: 'Lato', variable: '--font-lato', loaded: false, fallback: 'system-ui' },
        { name: 'Poppins', variable: '--font-poppins', loaded: false, fallback: 'system-ui' },
        { name: 'Montserrat', variable: '--font-montserrat', loaded: false, fallback: 'system-ui' },
        { name: 'Source Sans 3', variable: '--font-source-sans', loaded: false, fallback: 'system-ui' },
        { name: 'Nunito', variable: '--font-nunito', loaded: false, fallback: 'system-ui' },
        // Serif
        { name: 'Merriweather', variable: '--font-merriweather', loaded: false, fallback: 'Georgia' },
        { name: 'Playfair Display', variable: '--font-playfair', loaded: false, fallback: 'Georgia' },
        { name: 'Lora', variable: '--font-lora', loaded: false, fallback: 'Georgia' },
        { name: 'PT Serif', variable: '--font-pt-serif', loaded: false, fallback: 'Georgia' },
        { name: 'Crimson Text', variable: '--font-crimson-text', loaded: false, fallback: 'Georgia' },
        { name: 'Source Serif 4', variable: '--font-source-serif', loaded: false, fallback: 'Georgia' },
        // Monospace
        { name: 'Fira Code', variable: '--font-fira-code', loaded: false, fallback: 'monospace' },
        { name: 'JetBrains Mono', variable: '--font-jetbrains-mono', loaded: false, fallback: 'monospace' },
        { name: 'Source Code Pro', variable: '--font-source-code-pro', loaded: false, fallback: 'monospace' },
        { name: 'IBM Plex Mono', variable: '--font-ibm-plex-mono', loaded: false, fallback: 'monospace' },
      ];

      // Check if CSS variable exists
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      fonts.forEach((font) => {
        const varValue = computedStyle.getPropertyValue(font.variable);
        font.loaded = varValue.trim() !== '';
      });

      setFontStatuses(fonts);
    };

    // Wait for fonts to load
    if (document.fonts) {
      document.fonts.ready.then(() => {
        checkFonts();
      });
    } else {
      // Fallback if Font Loading API not available
      setTimeout(checkFonts, 1000);
    }
  }, []);

  const loadedCount = fontStatuses.filter(f => f.loaded).length;
  const totalCount = fontStatuses.length;

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Font Verification
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {loadedCount} of {totalCount} fonts loaded successfully
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {fontStatuses.map((font) => (
          <div
            key={font.variable}
            className="flex items-center gap-2 p-3 bg-muted/50 rounded border border-border"
          >
            {font.loaded ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {font.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {font.variable}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded">
        <p className="text-sm text-foreground">
          <strong>Note:</strong> Fonts are loaded via Next.js font optimization. 
          If a font shows as not loaded, it will fall back to {' '}
          <code className="px-1 py-0.5 bg-muted rounded text-xs">system-ui</code>, {' '}
          <code className="px-1 py-0.5 bg-muted rounded text-xs">Georgia</code>, or {' '}
          <code className="px-1 py-0.5 bg-muted rounded text-xs">monospace</code> {' '}
          depending on the font type.
        </p>
      </div>
    </Card>
  );
}
