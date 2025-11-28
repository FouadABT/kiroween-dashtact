/**
 * Footer Component
 * 
 * Responsive footer for the landing page with links and copyright information.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Linkedin, Facebook, Instagram, Mail } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';
import { useTheme } from '@/contexts/ThemeContext';
import { getDefaultLogoUrl } from '@/lib/constants/branding';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { resolvedTheme } = useTheme();
  const { 
    getLogoUrl, 
    getBrandName, 
    getTagline, 
    getDescription,
    getSupportEmail, 
    getSocialLinks 
  } = useBranding();

  // Get branding info
  const isDark = resolvedTheme === 'dark';
  const logoUrl = getLogoUrl(isDark) || getDefaultLogoUrl(isDark);
  const brandName = getBrandName();
  const tagline = getTagline();
  const description = getDescription() || tagline || 'Professional dashboard starter kit with comprehensive features.';
  const supportEmail = getSupportEmail();
  const socialLinks = getSocialLinks();
  const brandInitial = brandName.charAt(0).toUpperCase();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {logoUrl.endsWith('.svg') || logoUrl.endsWith('.png') || logoUrl.endsWith('.jpg') || logoUrl.endsWith('.jpeg') || logoUrl.endsWith('.webp') ? (
                <div className="w-8 h-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt={`${brandName} logo`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">{brandInitial}</span>
                </div>
              )}
              <span className="font-bold text-xl text-foreground">{brandName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
            {supportEmail && (
              <a 
                href={`mailto:${supportEmail}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {supportEmail}
              </a>
            )}
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/login" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link 
                  href="/signup" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <div className="flex space-x-4">
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {!socialLinks?.twitter && !socialLinks?.linkedin && !socialLinks?.facebook && !socialLinks?.instagram && (
                <>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
