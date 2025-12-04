'use client';

import { ReactNode } from 'react';
import { CustomPage } from '@/types/pages';

interface CustomPageLayoutProps {
  page: CustomPage;
  children: ReactNode;
}

export function CustomPageLayout({ page, children }: CustomPageLayoutProps) {
  return (
    <div className={`custom-page-layout ${page.customCssClass || ''}`}>
      {/* Page content */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
