'use client';

import React, { useState } from 'react';
import { VisualEditor } from '@/components/landing/VisualEditor';
import type { LandingPageSection } from '@/types/landing-cms';

// Sample initial sections for demonstration
const INITIAL_SECTIONS: LandingPageSection[] = [
  {
    id: 'section-1',
    type: 'hero',
    content: {
      headline: 'Welcome to Our Platform',
      subheadline: 'Build amazing landing pages with ease',
      cta: { text: 'Get Started', link: '/signup' },
    },
    design: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    layout: {
      padding: '4rem 2rem',
      containerWidth: 'standard',
      contentAlignment: 'center',
    },
    visible: true,
    order: 0,
  },
  {
    id: 'section-2',
    type: 'features',
    content: {
      title: 'Amazing Features',
      features: [
        { icon: 'zap', title: 'Fast', description: 'Lightning fast performance' },
        { icon: 'shield', title: 'Secure', description: 'Enterprise-grade security' },
        { icon: 'heart', title: 'Easy', description: 'Simple and intuitive' },
      ],
    },
    design: {
      background: '#ffffff',
    },
    layout: {
      padding: '4rem 2rem',
      containerWidth: 'standard',
      contentAlignment: 'center',
    },
    visible: true,
    order: 1,
  },
  {
    id: 'section-3',
    type: 'cta',
    content: {
      title: 'Ready to Get Started?',
      description: 'Join thousands of satisfied customers',
      cta: { text: 'Start Free Trial', link: '/signup' },
    },
    design: {
      background: '#f7fafc',
    },
    layout: {
      padding: '4rem 2rem',
      containerWidth: 'standard',
      contentAlignment: 'center',
    },
    visible: true,
    order: 2,
  },
];

export default function LandingEditorPage() {
  const [sections, setSections] = useState<LandingPageSection[]>(INITIAL_SECTIONS);

  const handleSave = async (updatedSections: LandingPageSection[]) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In a real app, this would call the API
    // await ApiClient.put('/landing/content', { sections: updatedSections });
    
    setSections(updatedSections);
    console.log('Saved sections:', updatedSections);
  };

  return (
    <div className="h-screen">
      <VisualEditor
        initialSections={sections}
        onSave={handleSave}
        autoSaveEnabled={true}
      />
    </div>
  );
}
