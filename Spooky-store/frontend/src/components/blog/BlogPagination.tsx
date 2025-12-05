'use client';

'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Blog Pagination Component
 * 
 * Displays pagination controls for navigating through blog posts.
 * Shows previous/next buttons and page numbers.
 * 
 * @param currentPage - Current page number (1-indexed)
 * @param totalPages - Total number of pages
 */

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function BlogPagination({ currentPage, totalPages }: BlogPaginationProps) {
  const router = useRouter();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Prefetch next page for better performance
  useEffect(() => {
    if (hasNext) {
      router.prefetch(`/blog?page=${currentPage + 1}`);
    }
    if (hasPrevious) {
      router.prefetch(`/blog?page=${currentPage - 1}`);
    }
  }, [currentPage, hasNext, hasPrevious, router]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Blog pagination"
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        asChild={hasPrevious}
        disabled={!hasPrevious}
      >
        {hasPrevious ? (
          <Link href={`/blog?page=${currentPage - 1}`} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </span>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              asChild={!isActive}
              disabled={isActive}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive ? (
                <span>{pageNum}</span>
              ) : (
                <Link href={`/blog?page=${pageNum}`}>{pageNum}</Link>
              )}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        asChild={hasNext}
        disabled={!hasNext}
      >
        {hasNext ? (
          <Link href={`/blog?page=${currentPage + 1}`} aria-label="Next page">
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        ) : (
          <span>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </span>
        )}
      </Button>
    </nav>
  );
}
