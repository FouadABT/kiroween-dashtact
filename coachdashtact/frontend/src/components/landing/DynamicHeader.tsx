'use client';

/**
 * Dynamic Header Component
 * 
 * Fetches and renders header configuration from the Landing Page CMS.
 * Uses the header config set in /dashboard/settings/landing-page.
 * Integrates with branding system for logo and brand name.
 * Supports light/dark theme switching.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderConfig } from '@/types/landing-cms';
import { LandingApi } from '@/lib/api';
import { useBranding } from '@/hooks/useBranding';

export function DynamicHeader() {
  const [config, setConfig] = useState<HeaderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getLogoUrl, getBrandName } = useBranding();

  // Force dark mode for landing page
  const resolvedTheme = 'dark';

  useEffect(() => {
    async function loadHeaderConfig() {
      try {
        const headerConfig = await LandingApi.getHeaderConfig();
        setConfig(headerConfig);
      } catch (error) {
        console.error('Failed to load header config:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHeaderConfig();
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="w-32 h-8 bg-muted animate-pulse rounded" />
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-20 h-4 bg-muted animate-pulse rounded" />
              <div className="w-20 h-4 bg-muted animate-pulse rounded" />
              <div className="w-24 h-10 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Fallback if no config
  if (!config) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">D</span>
              </div>
              <span className="font-bold text-xl text-foreground">Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Determine which logo to use based on theme
  // Priority: 1. CMS config, 2. Branding system, 3. Fallback
  const isDark = resolvedTheme === 'dark';
  const brandingLogo = getLogoUrl(isDark);
  const brandName = getBrandName('Dashboard');
  
  // Use CMS logo if set, otherwise fall back to branding system
  const logoUrl = (isDark ? config.logoDark : config.logoLight) || brandingLogo;

  // Determine header classes based on config
  // Use theme-aware classes instead of inline styles for proper dark/light mode support
  const headerClasses = [
    config.style.sticky ? 'fixed' : 'relative',
    'top-0 left-0 right-0 z-50',
    config.style.transparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur-md',
    config.style.shadow ? 'shadow-sm' : '',
    'border-b border-border',
  ].filter(Boolean).join(' ');

  return (
    <nav className={headerClasses}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={config.logoLink} className="flex items-center space-x-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${brandName} logo`}
                className={`object-contain ${
                  config.logoSize === 'sm' ? 'h-6' :
                  config.logoSize === 'lg' ? 'h-12' :
                  'h-8'
                }`}
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {brandName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-bold text-xl text-foreground">{brandName}</span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Links */}
            {config.navigation.map((item, index) => (
              <div key={index}>
                {item.type === 'dropdown' || item.type === 'mega-menu' ? (
                  <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={item.link || '#'}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target={item.type === 'external' ? '_blank' : undefined}
                    rel={item.type === 'external' ? 'noopener noreferrer' : undefined}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* CTA Buttons */}
            {config.ctas.map((cta, index) => (
              <Button
                key={index}
                asChild
                variant={
                  cta.style === 'primary' ? 'default' :
                  cta.style === 'secondary' ? 'secondary' :
                  'outline'
                }
              >
                <Link href={cta.link}>{cta.text}</Link>
              </Button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          {config.mobileMenu.enabled && (
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                config.mobileMenu.iconStyle === 'hamburger' ? (
                  <Menu className="w-6 h-6" />
                ) : config.mobileMenu.iconStyle === 'dots' ? (
                  <span className="text-2xl">⋮</span>
                ) : (
                  <span className="text-sm font-medium">Menu</span>
                )
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {config.mobileMenu.enabled && mobileMenuOpen && (
          <div
            className={`md:hidden py-4 border-t border-border ${
              config.mobileMenu.animation === 'slide' ? 'animate-in slide-in-from-top' :
              config.mobileMenu.animation === 'fade' ? 'animate-in fade-in' :
              'animate-in zoom-in'
            }`}
          >
            <div className="flex flex-col space-y-4">
              {/* Navigation Links */}
              {config.navigation.map((item, index) => (
                <Link
                  key={index}
                  href={item.link || '#'}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  target={item.type === 'external' ? '_blank' : undefined}
                  rel={item.type === 'external' ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </Link>
              ))}

              {/* CTA Buttons */}
              {config.ctas.map((cta, index) => (
                <Button
                  key={index}
                  asChild
                  variant={
                    cta.style === 'primary' ? 'default' :
                    cta.style === 'secondary' ? 'secondary' :
                    'outline'
                  }
                  className="w-full"
                >
                  <Link href={cta.link} onClick={() => setMobileMenuOpen(false)}>
                    {cta.text}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

