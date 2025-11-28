'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import Image from 'next/image';
import type { BrandSettings } from '@/types/branding';

interface BrandingPreviewProps {
  brandSettings: Partial<BrandSettings>;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
}

export function BrandingPreview({
  brandSettings,
  logoUrl,
  logoDarkUrl,
  faviconUrl,
}: BrandingPreviewProps) {
  const brandName = brandSettings.brandName || 'Your Brand';
  const tagline = brandSettings.tagline || 'Your tagline here';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
        <CardDescription>
          See how your branding looks in different contexts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="header" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="tab">Browser Tab</TabsTrigger>
          </TabsList>

          {/* Header Preview */}
          <TabsContent value="header" className="space-y-4">
            <div className="border border-border rounded-lg overflow-hidden">
              {/* Light Mode */}
              <div className="bg-background p-4 border-b border-border">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 cursor-help">
                        {logoUrl ? (
                          <div className="relative h-8 w-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={logoUrl}
                              alt={brandName}
                              className="object-contain max-h-8 max-w-[120px]"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-24 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            Logo
                          </div>
                        )}
                        <span className="font-semibold text-foreground">{brandName}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Light mode header</p>
                      {logoUrl && <p className="text-xs text-muted-foreground">Logo: {logoUrl.split('/').pop()}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Dark Mode */}
              <div className="bg-slate-900 p-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 cursor-help">
                        {logoDarkUrl ? (
                          <div className="relative h-8 w-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={logoDarkUrl}
                              alt={brandName}
                              className="object-contain max-h-8 max-w-[120px]"
                            />
                          </div>
                        ) : logoUrl ? (
                          <div className="relative h-8 w-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={logoUrl}
                              alt={brandName}
                              className="object-contain max-h-8 max-w-[120px]"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-24 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-400">
                            Logo
                          </div>
                        )}
                        <span className="font-semibold text-white">{brandName}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Dark mode header</p>
                      {logoDarkUrl && <p className="text-xs text-muted-foreground">Logo: {logoDarkUrl.split('/').pop()}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Header appears at the top of every page</span>
            </div>
          </TabsContent>

          {/* Login Preview */}
          <TabsContent value="login" className="space-y-4">
            <div className="border border-border rounded-lg p-8 bg-muted/30">
              <div className="max-w-sm mx-auto space-y-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center space-y-3 cursor-help">
                        {logoUrl ? (
                          <div className="flex justify-center">
                            <div className="relative h-16 w-auto">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={logoUrl}
                                alt={brandName}
                                className="object-contain max-h-16 max-w-[160px]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 w-32 mx-auto bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            Logo
                          </div>
                        )}
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">{brandName}</h2>
                          <p className="text-sm text-muted-foreground">{tagline}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Login page branding</p>
                      <p className="text-xs text-muted-foreground">Shows logo, name, and tagline</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="space-y-3">
                  <div className="h-10 bg-background border border-border rounded" />
                  <div className="h-10 bg-background border border-border rounded" />
                  <div className="h-10 bg-primary/20 rounded" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Login page is the first impression for users</span>
            </div>
          </TabsContent>

          {/* Browser Tab Preview */}
          <TabsContent value="tab" className="space-y-4">
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-2 border-b border-border">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 bg-background rounded px-3 py-2 cursor-help">
                        {faviconUrl ? (
                          <div className="relative h-4 w-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={faviconUrl}
                              alt="Favicon"
                              className="h-4 w-4 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-4 w-4 bg-muted rounded-sm flex items-center justify-center">
                            <span className="text-[8px] text-muted-foreground">?</span>
                          </div>
                        )}
                        <span className="text-sm text-foreground">{brandName}</span>
                        <span className="text-xs text-muted-foreground ml-auto">×</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Browser tab appearance</p>
                      {faviconUrl && <p className="text-xs text-muted-foreground">Favicon: {faviconUrl.split('/').pop()}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="p-8 bg-background">
                <div className="text-center text-muted-foreground text-sm">
                  Page content appears here
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Favicon appears in browser tabs and bookmarks</span>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
