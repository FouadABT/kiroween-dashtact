/**
 * Landing Layout Component
 * 
 * Layout wrapper for landing page with navigation and footer.
 * Provides consistent structure for all landing page sections.
 * 
 * Supports both static and dynamic header/footer based on feature flag.
 */

'use client';

import { ReactNode } from 'react';
import { PublicNavigation } from './PublicNavigation';
import { Footer } from './Footer';
import { DynamicHeader } from './DynamicHeader';
import { DynamicFooter } from './DynamicFooter';
import { featuresConfig } from '@/config/features.config';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  const useDynamic = featuresConfig.landingPage.useDynamicHeaderFooter;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Dynamic or Static */}
      {useDynamic ? <DynamicHeader /> : <PublicNavigation />}
      
      {/* Main content with top padding to account for fixed navigation */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      
      {/* Footer - Dynamic or Static */}
      {useDynamic ? <DynamicFooter /> : <Footer />}
    </div>
  );
}
