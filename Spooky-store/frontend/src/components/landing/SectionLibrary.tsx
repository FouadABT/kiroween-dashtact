'use client';

/**
 * Section Library Component
 * 
 * Modal dialog for selecting and adding new sections to the landing page.
 */

import { SectionType } from '@/types/landing-page';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  Grid3x3,
  MessageSquare,
  Megaphone,
  BarChart3,
  FileText,
  Layout,
} from 'lucide-react';

interface SectionLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: SectionType) => void;
}

interface SectionTemplate {
  type: SectionType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const sectionTemplates: SectionTemplate[] = [
  {
    type: 'hero',
    title: 'Hero Section',
    description: 'Large header with headline, subheadline, and call-to-action buttons',
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    type: 'features',
    title: 'Features Section',
    description: 'Showcase your product features with icons and descriptions',
    icon: <Grid3x3 className="h-6 w-6" />,
  },
  {
    type: 'cta',
    title: 'Call to Action',
    description: 'Encourage visitors to take action with a prominent CTA',
    icon: <Megaphone className="h-6 w-6" />,
  },
  {
    type: 'testimonials',
    title: 'Testimonials',
    description: 'Display customer reviews and testimonials',
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    type: 'stats',
    title: 'Statistics',
    description: 'Highlight key metrics and achievements',
    icon: <BarChart3 className="h-6 w-6" />,
  },
  {
    type: 'content',
    title: 'Content Section',
    description: 'Rich text content with optional image',
    icon: <FileText className="h-6 w-6" />,
  },
  {
    type: 'footer',
    title: 'Footer',
    description: 'Site footer with navigation, social links, and copyright',
    icon: <Layout className="h-6 w-6" />,
  },
];

export function SectionLibrary({ open, onClose, onSelect }: SectionLibraryProps) {
  const handleSelect = (type: SectionType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
          <DialogDescription>
            Choose a section type to add to your landing page
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {sectionTemplates.map((template) => (
            <Card
              key={template.type}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleSelect(template.type)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {template.icon}
                  </div>
                  <CardTitle className="text-base">{template.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{template.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
