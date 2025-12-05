/**
 * Footer Section Component
 * 
 * Renders the footer section with company info, navigation links, and social links.
 * Automatically falls back to branding social links if none are set in footer.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LandingPageSection, FooterSectionData, SocialLink } from '@/types/landing-page';
import { resolveCtaLink, isExternalUrl, getLinkTarget, getLinkRel } from '@/lib/landing-helpers';
import { BrandingApi } from '@/lib/api/branding';
import * as Icons from 'lucide-react';

interface FooterSectionProps {
  section: LandingPageSection;
  maxWidth?: 'full' | 'container' | 'narrow';
}

export function FooterSection({ section, maxWidth = 'container' }: FooterSectionProps) {
  const data = section.data as FooterSectionData;
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(data.socialLinks || []);

  // Auto-sync with branding if no social links in footer
  useEffect(() => {
    if (!data.socialLinks || data.socialLinks.length === 0) {
      loadBrandingSocialLinks();
    }
  }, [data.socialLinks]);

  const loadBrandingSocialLinks = async () => {
    try {
      const branding = await BrandingApi.getBrandSettings();
      if (branding.socialLinks) {
        const converted: SocialLink[] = [];
        const iconMap: Record<string, string> = {
          twitter: 'Twitter',
          linkedin: 'Linkedin',
          facebook: 'Facebook',
          instagram: 'Instagram',
          github: 'Github',
          youtube: 'Youtube',
        };

        Object.entries(branding.socialLinks).forEach(([platform, url]) => {
          if (url && typeof url === 'string' && url.trim()) {
            converted.push({
              platform,
              url: url as string,
              icon: iconMap[platform] || platform,
            });
          }
        });

        setSocialLinks(converted);
      }
    } catch (error) {
      console.error('Failed to load branding social links:', error);
    }
  };

  // Sort links by order
  const sortedNavLinks = [...data.navLinks].sort((a, b) => a.order - b.order);

  // Get icon component
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <footer data-section-type="footer" className="bg-muted/50 border-t border-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {data.companyName}
            </h3>
            <p className="text-muted-foreground mb-4">
              {data.description}
            </p>
            
            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.url}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.platform}
                  >
                    {social.icon && getIcon(social.icon)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {sortedNavLinks.map((link) => {
                const href = resolveCtaLink(link);
                const isExternal = isExternalUrl(href);
                
                return (
                  <li key={link.label}>
                    {isExternal ? (
                      <a
                        href={href}
                        target={getLinkTarget(href)}
                        rel={getLinkRel(href)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter (optional) */}
          {data.showNewsletter && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                {data.newsletterTitle || 'Newsletter'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {data.newsletterDescription || 'Subscribe to our newsletter for updates'}
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-foreground"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          {data.copyright}
        </div>
      </div>
    </footer>
  );
}
