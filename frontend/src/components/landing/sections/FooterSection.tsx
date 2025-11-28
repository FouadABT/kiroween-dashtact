/**
 * Footer Section Component
 * 
 * Renders the footer section with company info, navigation links, and social links.
 */

'use client';

import Link from 'next/link';
import { LandingPageSection, FooterSectionData } from '@/types/landing-page';
import { resolveCtaLink, isExternalUrl, getLinkTarget, getLinkRel } from '@/lib/landing-helpers';
import * as Icons from 'lucide-react';

interface FooterSectionProps {
  section: LandingPageSection;
  maxWidth?: 'full' | 'container' | 'narrow';
}

export function FooterSection({ section, maxWidth = 'container' }: FooterSectionProps) {
  const data = section.data as FooterSectionData;

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
            {data.socialLinks && data.socialLinks.length > 0 && (
              <div className="flex gap-4">
                {data.socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.platform}
                  >
                    {getIcon(social.icon)}
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
              {sortedNavLinks.map((link, index) => {
                const href = resolveCtaLink(link);
                const isExternal = isExternalUrl(href);
                
                return (
                  <li key={index}>
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
