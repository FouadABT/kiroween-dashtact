'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ComponentLibrary } from '@/components/landing/ComponentLibrary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import type { SectionTemplate } from '@/types/landing-cms';

export default function ComponentLibraryDemoPage() {
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<SectionTemplate[]>([]);

  const handleSelectTemplate = (template: SectionTemplate) => {
    setSelectedTemplates((prev) => [...prev, template]);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Component Library Demo</h1>
        <p className="text-muted-foreground">
          Test the component library modal with template browsing, search, and management features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Component Library Features</CardTitle>
          <CardDescription>
            Click the button below to open the component library and explore available templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Features:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Browse 20+ pre-built section templates</li>
                <li>Search and filter by category</li>
                <li>Save custom templates</li>
                <li>Import/export templates</li>
                <li>Template preview on hover</li>
                <li>Edit and delete custom templates</li>
                <li>Duplicate templates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Categories:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Hero sections</li>
                <li>Features sections</li>
                <li>Testimonials</li>
                <li>Call-to-Action (CTA)</li>
                <li>Statistics</li>
                <li>Content sections</li>
                <li>Pricing tables</li>
                <li>FAQ sections</li>
                <li>Team sections</li>
                <li>Gallery sections</li>
              </ul>
            </div>
          </div>

          <Button onClick={() => setShowLibrary(true)} size="lg">
            <Sparkles className="h-5 w-5 mr-2" />
            Open Component Library
          </Button>
        </CardContent>
      </Card>

      {selectedTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Templates</CardTitle>
            <CardDescription>
              Templates you have selected from the library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedTemplates.map((template, index) => (
                <div
                  key={`${template.id}-${index}`}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.category} • {template.isCustom ? 'Custom' : 'Default'}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelectedTemplates((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ComponentLibrary
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
