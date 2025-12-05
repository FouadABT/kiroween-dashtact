'use client';

/**
 * Section Editor Demo
 * 
 * Demonstrates the usage of section editors with properties panel
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionEditorWithProperties } from './SectionEditorWithProperties';
import type { LandingPageSection } from '@/types/landing-cms';

const sampleSections: Record<string, LandingPageSection> = {
  hero: {
    id: 'hero-1',
    type: 'hero',
    content: {
      headline: 'Welcome to Our Platform',
      subheadline: 'Build amazing things with our tools',
      primaryCta: { text: 'Get Started', link: '/signup', linkType: 'url' },
      secondaryCta: { text: 'Learn More', link: '/about', linkType: 'url' },
      backgroundType: 'gradient',
      gradientStart: '#667eea',
      gradientEnd: '#764ba2',
      gradientAngle: '135',
      textAlignment: 'center',
      height: 'large',
    },
    design: {
      background: '#ffffff',
      shadow: 'lg',
    },
    layout: {
      padding: '4rem 2rem',
      containerWidth: 'standard',
      contentAlignment: 'center',
    },
    animation: {
      entrance: 'fade',
      timing: 800,
      delay: 0,
    },
    visible: true,
    order: 0,
  },
  features: {
    id: 'features-1',
    type: 'features',
    content: {
      title: 'Our Features',
      subtitle: 'Everything you need to succeed',
      layout: 'grid',
      columns: 3,
      features: [
        {
          id: 'f1',
          icon: 'star',
          title: 'Fast Performance',
          description: 'Lightning-fast load times',
          order: 0,
        },
        {
          id: 'f2',
          icon: 'shield',
          title: 'Secure',
          description: 'Enterprise-grade security',
          order: 1,
        },
        {
          id: 'f3',
          icon: 'zap',
          title: 'Easy to Use',
          description: 'Intuitive interface',
          order: 2,
        },
      ],
    },
    design: {
      background: '#f9fafb',
    },
    layout: {
      padding: '3rem 2rem',
      containerWidth: 'wide',
    },
    animation: {
      entrance: 'slide',
      timing: 600,
      delay: 200,
    },
    visible: true,
    order: 1,
  },
  testimonials: {
    id: 'testimonials-1',
    type: 'testimonials',
    content: {
      title: 'What Our Customers Say',
      subtitle: 'Trusted by thousands worldwide',
      layout: 'grid',
      showRatings: true,
      testimonials: [
        {
          id: 't1',
          quote: 'This product changed our business!',
          author: 'John Doe',
          role: 'CEO',
          company: 'Acme Corp',
          rating: 5,
          order: 0,
        },
        {
          id: 't2',
          quote: 'Excellent support and features.',
          author: 'Jane Smith',
          role: 'CTO',
          company: 'Tech Inc',
          rating: 5,
          order: 1,
        },
      ],
    },
    design: {
      background: '#ffffff',
    },
    layout: {
      padding: '3rem 2rem',
      containerWidth: 'standard',
    },
    visible: true,
    order: 2,
  },
  cta: {
    id: 'cta-1',
    type: 'cta',
    content: {
      title: 'Ready to Get Started?',
      description: 'Join thousands of satisfied customers today',
      primaryCta: { text: 'Start Free Trial', link: '/signup', linkType: 'url' },
      secondaryCta: { text: 'Contact Sales', link: '/contact', linkType: 'url' },
      backgroundColor: '#667eea',
      textColor: '#ffffff',
      alignment: 'center',
    },
    design: {
      shadow: 'xl',
    },
    layout: {
      padding: '4rem 2rem',
      containerWidth: 'narrow',
    },
    animation: {
      entrance: 'zoom',
      timing: 700,
    },
    visible: true,
    order: 3,
  },
  stats: {
    id: 'stats-1',
    type: 'stats',
    content: {
      title: 'Our Impact',
      layout: 'horizontal',
      stats: [
        { id: 's1', value: '10K+', label: 'Active Users', order: 0 },
        { id: 's2', value: '99.9%', label: 'Uptime', order: 1 },
        { id: 's3', value: '24/7', label: 'Support', order: 2 },
        { id: 's4', value: '50+', label: 'Countries', order: 3 },
      ],
    },
    design: {
      background: '#f3f4f6',
    },
    layout: {
      padding: '2rem',
      containerWidth: 'wide',
    },
    visible: true,
    order: 4,
  },
  content: {
    id: 'content-1',
    type: 'content',
    content: {
      title: 'About Our Platform',
      content: 'We provide cutting-edge solutions for modern businesses. Our platform is designed to help you succeed in today\'s competitive market.',
      layout: 'two-column',
      imagePosition: 'right',
      contentWidth: 'standard',
    },
    design: {
      background: '#ffffff',
    },
    layout: {
      padding: '3rem 2rem',
      containerWidth: 'standard',
    },
    visible: true,
    order: 5,
  },
};

export function SectionEditorDemo() {
  const [selectedType, setSelectedType] = useState<string>('hero');
  const [section, setSection] = useState<LandingPageSection>(sampleSections.hero);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setSection(sampleSections[type]);
  };

  const handleSectionChange = (updatedSection: LandingPageSection) => {
    setSection(updatedSection);
  };

  const handleSave = () => {
    console.log('Saving section:', section);
    alert('Section saved! Check console for details.');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Section Editor Demo</h1>
          <p className="text-muted-foreground mt-1">
            Test all section editors with properties panel
          </p>
        </div>
        <Button onClick={handleSave}>Save Section</Button>
      </div>

      <Card className="p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Section Type</label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hero">Hero Section</SelectItem>
              <SelectItem value="features">Features Section</SelectItem>
              <SelectItem value="testimonials">Testimonials Section</SelectItem>
              <SelectItem value="cta">CTA Section</SelectItem>
              <SelectItem value="stats">Stats Section</SelectItem>
              <SelectItem value="content">Content Section</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="p-6">
        <SectionEditorWithProperties
          section={section}
          onChange={handleSectionChange}
        />
      </Card>

      <Card className="p-4 bg-muted">
        <h3 className="font-semibold mb-2">Current Section Data (JSON)</h3>
        <pre className="text-xs overflow-auto max-h-96 bg-background p-4 rounded">
          {JSON.stringify(section, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
