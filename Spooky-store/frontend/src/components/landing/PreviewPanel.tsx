'use client';

/**
 * Preview Panel Component
 * 
 * Live preview of the landing page with desktop/mobile toggle.
 */

import { useState } from 'react';
import { LandingPageContent } from '@/types/landing-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';

interface PreviewPanelProps {
  content: LandingPageContent;
}

export function PreviewPanel({ content }: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const enabledSections = content.sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Preview</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div
          className={`bg-background border rounded-lg overflow-hidden transition-all ${
            viewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
          }`}
        >
          <div className="p-4 space-y-4">
            {enabledSections.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p>No sections to preview</p>
                <p className="text-sm mt-2">Add sections to see them here</p>
              </div>
            ) : (
              enabledSections.map((section) => (
                <div
                  key={section.id}
                  className="border rounded-lg p-4 bg-card"
                >
                  <div className="text-xs text-muted-foreground mb-2">
                    {section.type.toUpperCase()}
                  </div>
                  <div className="text-sm">
                    {renderSectionPreview(section)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderSectionPreview(section: any) {
  switch (section.type) {
    case 'hero':
      return (
        <div className="space-y-2">
          <div className="font-bold text-lg">{section.data.headline}</div>
          <div className="text-muted-foreground">{section.data.subheadline}</div>
          <div className="flex gap-2 mt-4">
            {section.data.primaryCta && (
              <div className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs">
                {section.data.primaryCta.text}
              </div>
            )}
            {section.data.secondaryCta && (
              <div className="px-3 py-1 border rounded text-xs">
                {section.data.secondaryCta.text}
              </div>
            )}
          </div>
        </div>
      );

    case 'features':
      return (
        <div className="space-y-2">
          <div className="font-semibold">{section.data.title}</div>
          {section.data.subtitle && (
            <div className="text-xs text-muted-foreground">
              {section.data.subtitle}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {section.data.features?.slice(0, 4).map((feature: any) => (
              <div key={feature.id} className="border rounded p-2">
                <div className="font-medium text-xs">{feature.title}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-2 text-center">
          <div className="font-semibold">{section.data.title}</div>
          <div className="text-xs text-muted-foreground">
            {section.data.description}
          </div>
          {section.data.primaryCta && (
            <div className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs inline-block mt-2">
              {section.data.primaryCta.text}
            </div>
          )}
        </div>
      );

    case 'testimonials':
      return (
        <div className="space-y-2">
          <div className="font-semibold">{section.data.title}</div>
          <div className="grid gap-2">
            {section.data.testimonials?.slice(0, 2).map((testimonial: any) => (
              <div key={testimonial.id} className="border rounded p-2">
                <div className="text-xs italic">"{testimonial.quote}"</div>
                <div className="text-xs font-medium mt-1">
                  {testimonial.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'stats':
      return (
        <div className="space-y-2">
          {section.data.title && (
            <div className="font-semibold">{section.data.title}</div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {section.data.stats?.map((stat: any) => (
              <div key={stat.id} className="text-center border rounded p-2">
                <div className="font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'content':
      return (
        <div className="space-y-2">
          {section.data.title && (
            <div className="font-semibold">{section.data.title}</div>
          )}
          <div className="text-xs text-muted-foreground line-clamp-3">
            {section.data.content}
          </div>
        </div>
      );

    case 'footer':
      return (
        <div className="space-y-2">
          <div className="font-semibold">{section.data.companyName}</div>
          <div className="text-xs text-muted-foreground">
            {section.data.description}
          </div>
          <div className="text-xs">{section.data.copyright}</div>
        </div>
      );

    default:
      return <div className="text-xs text-muted-foreground">Preview not available</div>;
  }
}
