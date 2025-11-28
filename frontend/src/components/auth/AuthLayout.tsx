'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBranding } from '@/hooks/useBranding';
import { useTheme } from '@/contexts/ThemeContext';
import { getDefaultLogoUrl } from '@/lib/constants/branding';

/**
 * Props for the AuthLayout component
 */
export interface AuthLayoutProps {
  /** Content to be rendered inside the auth card */
  children: React.ReactNode;
  /** Title displayed in the auth card header */
  title: string;
  /** Description text displayed below the title */
  description: string;
  /** Text displayed before the navigation link */
  linkText: string;
  /** URL for the navigation link */
  linkHref: string;
  /** Label text for the navigation link */
  linkLabel: string;
}

export function AuthLayout({
  children,
  title,
  description,
  linkText,
  linkHref,
  linkLabel,
}: AuthLayoutProps) {
  const { resolvedTheme } = useTheme();
  const { getLogoUrl, getBrandName, getTagline } = useBranding();

  // Get logo based on theme
  const isDark = resolvedTheme === 'dark';
  const logoUrl = getLogoUrl(isDark) || getDefaultLogoUrl(isDark);
  const brandName = getBrandName();
  const tagline = getTagline();
  const brandInitial = brandName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-6">
        {/* Brand Logo */}
        <div className="text-center">
          {logoUrl.endsWith('.svg') || logoUrl.endsWith('.png') || logoUrl.endsWith('.jpg') || logoUrl.endsWith('.jpeg') || logoUrl.endsWith('.webp') ? (
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={`${brandName} logo`}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div 
              className="mx-auto h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-lg flex items-center justify-center mb-3 sm:mb-4"
              role="img"
              aria-label={`${brandName} logo`}
            >
              <span className="text-primary-foreground font-bold text-lg sm:text-xl" aria-hidden="true">{brandInitial}</span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{brandName}</h1>
          {tagline && (
            <p className="text-sm text-muted-foreground mt-1">{tagline}</p>
          )}
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg border-0 sm:border" role="main" aria-labelledby="auth-title">
          <CardHeader className="space-y-1 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle id="auth-title" className="text-xl sm:text-2xl text-center">{title}</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
            {children}
          </CardContent>
        </Card>

        {/* Navigation Link */}
        <div className="text-center px-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {linkText}{' '}
            <Link
              href={linkHref}
              className="font-medium text-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
            >
              {linkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}