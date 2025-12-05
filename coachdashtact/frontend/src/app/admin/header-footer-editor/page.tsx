'use client';

import React, { useState } from 'react';
import { HeaderEditor } from '@/components/landing/HeaderEditor';
import { FooterEditor } from '@/components/landing/FooterEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { HeaderConfig, FooterConfig } from '@/types/landing-cms';

// Default configurations
const defaultHeaderConfig: HeaderConfig = {
  id: '1',
  logoLight: '',
  logoDark: '',
  logoSize: 'md',
  logoLink: '/',
  navigation: [
    { label: 'Home', link: '/', type: 'internal' },
    { label: 'Features', link: '/features', type: 'internal' },
    { label: 'Pricing', link: '/pricing', type: 'internal' },
    { label: 'About', link: '/about', type: 'internal' },
  ],
  ctas: [
    { text: 'Sign In', link: '/login', style: 'secondary' },
    { text: 'Get Started', link: '/signup', style: 'primary' },
  ],
  style: {
    background: '#ffffff',
    sticky: true,
    stickyBehavior: 'always',
    transparent: false,
    shadow: true,
  },
  mobileMenu: {
    enabled: true,
    iconStyle: 'hamburger',
    animation: 'slide',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultFooterConfig: FooterConfig = {
  id: '1',
  layout: 'multi-column',
  columns: [
    {
      heading: 'Product',
      type: 'links',
      links: [
        { label: 'Features', link: '/features' },
        { label: 'Pricing', link: '/pricing' },
        { label: 'FAQ', link: '/faq' },
      ],
    },
    {
      heading: 'Company',
      type: 'links',
      links: [
        { label: 'About', link: '/about' },
        { label: 'Blog', link: '/blog' },
        { label: 'Careers', link: '/careers' },
      ],
    },
    {
      heading: 'Resources',
      type: 'links',
      links: [
        { label: 'Documentation', link: '/docs' },
        { label: 'Support', link: '/support' },
        { label: 'API', link: '/api' },
      ],
    },
    {
      heading: 'About Us',
      type: 'text',
      text: 'We are building the future of web development with modern tools and best practices.',
    },
  ],
  social: [
    { platform: 'twitter', url: 'https://twitter.com/yourcompany', icon: 'twitter' },
    { platform: 'github', url: 'https://github.com/yourcompany', icon: 'github' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/yourcompany', icon: 'linkedin' },
  ],
  newsletter: {
    enabled: true,
    title: 'Subscribe to our newsletter',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
  },
  copyright: '© {year} {brand}. All rights reserved.',
  legalLinks: [
    { label: 'Privacy Policy', link: '/privacy' },
    { label: 'Terms of Service', link: '/terms' },
    { label: 'Cookie Policy', link: '/cookies' },
  ],
  style: {
    background: '#1a1a1a',
    textColor: '#ffffff',
    borderTop: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function HeaderFooterEditorPage() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(defaultHeaderConfig);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(defaultFooterConfig);
  const [activeTab, setActiveTab] = useState('header');

  const handleSaveHeader = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Header saved:', headerConfig);
  };

  const handleSaveFooter = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Footer saved:', footerConfig);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <PageHeader
        title="Header & Footer Editor"
        description="Customize your site's header and footer configuration"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-background px-4">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="header" className="h-full mt-0">
            <HeaderEditor
              config={headerConfig}
              onChange={setHeaderConfig}
              onSave={handleSaveHeader}
            />
          </TabsContent>

          <TabsContent value="footer" className="h-full mt-0">
            <FooterEditor
              config={footerConfig}
              onChange={setFooterConfig}
              onSave={handleSaveFooter}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
