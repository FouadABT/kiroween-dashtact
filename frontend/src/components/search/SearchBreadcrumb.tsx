/**
 * SearchBreadcrumb Component
 * Breadcrumb navigation for search results page
 */

'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function SearchBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      <Link
        href="/dashboard"
        className="hover:text-foreground transition-colors"
      >
        Dashboard
      </Link>
      <ChevronRight className="h-4 w-4 mx-2" />
      <span className="text-foreground font-medium">Search Results</span>
    </nav>
  );
}
