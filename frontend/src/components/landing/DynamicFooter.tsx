/**
 * Dynamic Footer Component
 * 
 * Fetches and renders footer configuration from the Landing Page CMS.
 * Uses the footer config set in /dashboard/settings/landing-page.
 * Integrates with branding system for brand name and social links.
 * Supports light/dark theme.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FooterConfig } from '@/types/landing-cms';
import { LandingApi } from '@/lib/api';
import { useBranding } from '@/hooks/useBranding';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  Mail,
} from 'lucide-react';

const socialIcons: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  youtube: Youtube,
};

export function DynamicFooter() {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const { getBrandName, getSocialLinks, getSupportEmail } = useBranding();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    async function loadFooterConfig() {
      try {
        const footerConfig = await LandingApi.getFooterConfig();
        setConfig(footerConfig);
      } catch (error) {
        console.error('Failed to load footer config:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFooterConfig();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', newsletterEmail);
    setNewsletterEmail('');
  };

  // Loading skeleton
  if (loading) {
    return (
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="w-24 h-6 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="w-full h-4 bg-muted animate-pulse rounded" />
                  <div className="w-3/4 h-4 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  // Fallback if no config
  if (!config) {
    return (
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Replace template variables in copyright
  // Priority: 1. CMS config, 2. Branding system
  const currentYear = new Date().getFullYear();
  const brandName = getBrandName('Dashboard');
  const brandingSocialLinks = getSocialLinks();
  const supportEmail = getSupportEmail();
  
  const copyright = config.copyright
    .replace('{year}', currentYear.toString())
    .replace('{brand}', brandName);
  
  // Merge CMS social links with branding social links
  // CMS config takes priority if both exist
  const mergedSocialLinks = config.social.length > 0 
    ? config.social 
    : brandingSocialLinks
        ? Object.entries(brandingSocialLinks)
            .filter(([_, url]) => url)
            .map(([platform, url]) => ({
              platform,
              url: url as string,
              icon: platform,
            }))
        : [];

  // Use theme-aware classes instead of inline styles for proper dark/light mode support
  const footerClasses = [
    'bg-muted/50',
    config.style.borderTop ? 'border-t border-border' : '',
  ].filter(Boolean).join(' ');

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div
          className={`grid gap-8 mb-8 ${
            config.layout === 'single'
              ? 'grid-cols-1'
              : config.layout === 'centered'
              ? 'grid-cols-1 place-items-center'
              : config.layout === 'split'
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {/* Footer Columns */}
          {config.columns.map((column, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground">{column.heading}</h3>

              {/* Links Type */}
              {column.type === 'links' && column.links && (
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.link}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* Text Type */}
              {column.type === 'text' && column.text && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{column.text}</p>
              )}

              {/* Contact Type */}
              {column.type === 'contact' && column.text && (
                <div className="text-sm text-muted-foreground space-y-2">
                  {column.text.split('\n').map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {line.toLowerCase().includes('email') && <Mail className="w-4 h-4 mt-0.5" />}
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Newsletter Section */}
          {config.newsletter.enabled && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground">{config.newsletter.title}</h3>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder={config.newsletter.placeholder}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="flex-1 bg-background border-input"
                />
                <Button type="submit">{config.newsletter.buttonText}</Button>
              </form>
            </div>
          )}
        </div>

        {/* Social Links - Uses CMS config or falls back to branding system */}
        {mergedSocialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mb-8 pb-8 border-b border-border">
            {mergedSocialLinks.map((social, index) => {
              const Icon = socialIcons[social.platform] || Mail;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.platform}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}
        
        {/* Support Email from Branding (if no contact column in CMS) */}
        {supportEmail && !config.columns.some(col => col.type === 'contact') && (
          <div className="flex justify-center mb-8 pb-8 border-b border-border">
            <a 
              href={`mailto:${supportEmail}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {supportEmail}
            </a>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center md:text-left">{copyright}</p>

          {/* Legal Links */}
          {config.legalLinks.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {config.legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.link}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
