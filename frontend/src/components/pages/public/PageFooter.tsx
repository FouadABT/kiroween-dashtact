'use client';

import Link from 'next/link';
import { CustomPage } from '@/types/pages';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageFooterProps {
  page: CustomPage;
}

export function PageFooter({ page }: PageFooterProps) {
  // Show related pages (sibling pages or child pages)
  const relatedPages = page.childPages || [];

  if (relatedPages.length === 0) {
    return null;
  }

  return (
    <footer className="page-footer bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">Related Pages</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedPages.map((relatedPage) => {
            // Build the full slug path
            const fullSlug = page.slug 
              ? `/${page.slug}/${relatedPage.slug}`
              : `/${relatedPage.slug}`;

            return (
              <Link
                key={relatedPage.id}
                href={fullSlug}
                className="group block p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {relatedPage.title}
                </h3>
                
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <span>Read more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Back to parent link */}
        {page.parentPage && (
          <div className="mt-8 pt-8 border-t">
            <Button asChild variant="outline">
              <Link href={`/${page.parentPage.slug}`}>
                ← Back to {page.parentPage.title}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </footer>
  );
}
