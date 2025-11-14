/**
 * Landing Layout Component
 * 
 * Layout wrapper for landing page with navigation and footer.
 * Provides consistent structure for all landing page sections.
 */

'use client';

import { ReactNode } from 'react';
import { PublicNavigation } from './PublicNavigation';
import { Footer } from './Footer';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavigation />
      
      {/* Main content with top padding to account for fixed navigation */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
