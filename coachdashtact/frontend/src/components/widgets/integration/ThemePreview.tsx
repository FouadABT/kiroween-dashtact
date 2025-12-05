'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Copy, Check } from 'lucide-react';

/**
 * ThemePreview - Display components in different theme modes with code snippets
 * 
 * Features:
 * - Preview component in light and dark themes
 * - Show multiple variants side-by-side
 * - Display code snippet for implementation
 * - Copy code to clipboard
 * - Theme-aware styling
 * 
 * @example
 * ```tsx
 * <ThemePreview
 *   title="Button Component"
 *   description="Primary button with different states"
 *   component={<Button>Click me</Button>}
 *   variants={[
 *     { label: 'Primary', component: <Button>Primary</Button> },
 *     { label: 'Secondary', component: <Button variant="secondary">Secondary</Button> },
 *   ]}
 *   code={`<Button>Click me</Button>`}
 * />
 * ```
 */

export interface ThemePreviewVariant {
  /** Variant label */
  label: string;
  /** Component to preview */
  component: React.ReactNode;
  /** Optional code snippet for this variant */
  code?: string;
}

export interface ThemePreviewProps {
  /** Preview title */
  title: string;
  /** Preview description */
  description?: string;
  /** Main component to preview */
  component?: React.ReactNode;
  /** Array of component variants to preview */
  variants?: ThemePreviewVariant[];
  /** Code snippet to display */
  code?: string;
  /** Show theme toggle (default: true) */
  showThemeToggle?: boolean;
  /** Default theme mode (default: 'light') */
  defaultTheme?: 'light' | 'dark';
  /** Additional CSS classes */
  className?: string;
}

export function ThemePreview({
  title,
  description,
  component,
  variants = [],
  code,
  showThemeToggle = true,
  defaultTheme = 'light',
  className,
}: ThemePreviewProps) {
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(defaultTheme);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (codeText: string, variantLabel?: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCode(variantLabel || 'main');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const toggleTheme = () => {
    setPreviewTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Card className={`p-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {showThemeToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center gap-2"
          >
            {previewTheme === 'light' ? (
              <>
                <Sun className="w-4 h-4" />
                Light
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                Dark
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          {code && <TabsTrigger value="code">Code</TabsTrigger>}
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-4">
          <div
            className={`rounded-lg border border-border p-8 transition-colors ${
              previewTheme === 'dark' ? 'bg-slate-950 dark' : 'bg-white'
            }`}
          >
            {/* Main component preview */}
            {component && (
              <div className="flex items-center justify-center mb-6">
                {component}
              </div>
            )}

            {/* Variants preview */}
            {variants.length > 0 && (
              <div className="space-y-6">
                {variants.map((variant, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {variant.label}
                      </span>
                      {variant.code && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(variant.code!, variant.label)}
                          className="h-8 px-2"
                        >
                          {copiedCode === variant.label ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-center p-4 rounded border border-border/50">
                      {variant.component}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Code Tab */}
        {code && (
          <TabsContent value="code" className="mt-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code className="text-foreground">{code}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyCode(code)}
                className="absolute top-2 right-2"
              >
                {copiedCode === 'main' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </Card>
  );
}

/**
 * Simplified theme preview for inline documentation
 */
export function InlineThemePreview({
  component,
  code,
}: {
  component: React.ReactNode;
  code?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 p-2 rounded border border-border bg-card">
      <div className="flex items-center">{component}</div>
      {code && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      )}
    </div>
  );
}
