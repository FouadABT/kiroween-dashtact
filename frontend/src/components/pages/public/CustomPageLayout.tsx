'use client';

import { ReactNode } from 'react';
import { CustomPage } from '@/types/pages';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

interface CustomPageLayoutProps {
  page: CustomPage;
  children: ReactNode;
}

export function CustomPageLayout({ page, children }: CustomPageLayoutProps) {
  // Build dynamic values for breadcrumbs
  const dynamicValues: Record<string, string> = {
    pageTitle: page.title,
    pageId: page.id,
  };

  if (page.parentPage) {
    dynamicValues.parentTitle = page.parentPage.title;
  }

  return (
    <div className={`custom-page-layout ${page.customCssClass || ''}`}>
      {/* Breadcrumb navigation */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb dynamicValues={dynamicValues} />
      </div>

      {/* Page content */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
