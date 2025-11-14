'use client';

/**
 * Section Editor Component
 * 
 * Routes to the appropriate section-specific editor based on section type.
 */

import { LandingPageSection } from '@/types/landing-page';
import { HeroSectionEditor } from '@/components/landing/editors/HeroSectionEditor';
import { FeaturesSectionEditor } from '@/components/landing/editors/FeaturesSectionEditor';
import { FooterSectionEditor } from '@/components/landing/editors/FooterSectionEditor';
import { CtaSectionEditor } from '@/components/landing/editors/CtaSectionEditor';
import { TestimonialsSectionEditor } from '@/components/landing/editors/TestimonialsSectionEditor';
import { StatsSectionEditor } from '@/components/landing/editors/StatsSectionEditor';
import { ContentSectionEditor } from '@/components/landing/editors/ContentSectionEditor';

interface SectionEditorProps {
  section: LandingPageSection;
  onChange: (data: any) => void;
}

export function SectionEditor({ section, onChange }: SectionEditorProps) {
  switch (section.type) {
    case 'hero':
      return <HeroSectionEditor data={section.data as any} onChange={onChange} />;
    case 'features':
      return <FeaturesSectionEditor data={section.data as any} onChange={onChange} />;
    case 'footer':
      return <FooterSectionEditor data={section.data as any} onChange={onChange} />;
    case 'cta':
      return <CtaSectionEditor data={section.data as any} onChange={onChange} />;
    case 'testimonials':
      return <TestimonialsSectionEditor data={section.data as any} onChange={onChange} />;
    case 'stats':
      return <StatsSectionEditor data={section.data as any} onChange={onChange} />;
    case 'content':
      return <ContentSectionEditor data={section.data as any} onChange={onChange} />;
    default:
      return (
        <div className="text-sm text-muted-foreground">
          Editor not available for this section type
        </div>
      );
  }
}
