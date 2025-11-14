'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbs, BreadcrumbItem } from '@/lib/breadcrumb-helpers';
import { useMetadata } from '@/contexts/MetadataContext';

export interface BreadcrumbProps {
  /**
   * Custom breadcrumb items to display instead of auto-generated ones
   */
  customItems?: BreadcrumbItem[];
  
  /**
   * Whether to show the home icon as the first item
   * @default true
   */
  showHome?: boolean;
  
  /**
   * Custom separator element between breadcrumb items
   * @default <ChevronRight />
   */
  separator?: React.ReactNode;
  
  /**
   * Additional CSS classes for the nav element
   */
  className?: string;
  
  /**
   * Dynamic values for resolving template strings in breadcrumb labels
   */
  dynamicValues?: Record<string, string>;
  
  /**
   * Maximum number of breadcrumb items to display before truncating
   */
  maxItems?: number;
}

/**
 * Breadcrumb navigation component with accessibility support
 * 
 * Features:
 * - Automatic breadcrumb generation from pathname
 * - Dynamic label resolution
 * - ARIA labels and semantic HTML
 * - Keyboard navigation support
 * - Theme-aware styling
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <Breadcrumb />
 * 
 * <Breadcrumb 
 *   dynamicValues={{ userName: 'John Doe' }}
 *   showHome={false}
 * />
 * 
 * <Breadcrumb 
 *   customItems={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' }
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({
  customItems,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4" />,
  className = '',
  dynamicValues: propDynamicValues,
  maxItems,
}: BreadcrumbProps) {
  const pathname = usePathname();
  const { dynamicValues: contextDynamicValues } = useMetadata();
  
  // Use prop dynamicValues if provided, otherwise use context dynamicValues
  const dynamicValues = propDynamicValues || contextDynamicValues;
  
  // Force re-render when context dynamic values change
  React.useEffect(() => {
    console.log('[Breadcrumb] Context dynamic values changed:', contextDynamicValues);
  }, [contextDynamicValues]);
  
  console.log('[Breadcrumb] Rendering:', {
    pathname,
    propDynamicValues,
    contextDynamicValues,
    finalDynamicValues: dynamicValues,
    hasCustomItems: !!customItems
  });
  
  const breadcrumbs = useMemo(() => {
    if (customItems) {
      console.log('[Breadcrumb] Using custom items:', customItems);
      return customItems;
    }
    const generated = generateBreadcrumbs(pathname, dynamicValues);
    console.log('[Breadcrumb] Generated breadcrumbs:', generated);
    return generated;
  }, [pathname, dynamicValues, customItems]);
  
  // Truncate breadcrumbs if maxItems is specified
  const displayBreadcrumbs = useMemo(() => {
    if (!maxItems || breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }
    
    // Keep first and last items, truncate middle
    const firstItems = breadcrumbs.slice(0, 1);
    const lastItems = breadcrumbs.slice(-(maxItems - 2));
    
    return [
      ...firstItems,
      { label: '...', href: '#' },
      ...lastItems,
    ];
  }, [breadcrumbs, maxItems]);
  
  if (displayBreadcrumbs.length === 0 && !showHome) return null;
  
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2 flex-wrap">
        {showHome && (
          <li>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
        )}
        
        {displayBreadcrumbs.map((item, index) => {
          const isLast = index === displayBreadcrumbs.length - 1;
          const isTruncated = item.label === '...';
          
          return (
            <React.Fragment key={`${item.href}-${index}`}>
              {(showHome || index > 0) && (
                <li className="text-muted-foreground flex items-center" aria-hidden="true">
                  {separator}
                </li>
              )}
              
              <li className="flex items-center">
                {isLast ? (
                  <span
                    className="font-medium text-foreground"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : isTruncated ? (
                  <span className="text-muted-foreground px-1">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Compact breadcrumb variant for mobile/small screens
 */
export function BreadcrumbCompact({
  customItems,
  dynamicValues: propDynamicValues,
  className = '',
}: Omit<BreadcrumbProps, 'showHome' | 'separator' | 'maxItems'>) {
  const pathname = usePathname();
  const { dynamicValues: contextDynamicValues } = useMetadata();
  
  // Use prop dynamicValues if provided, otherwise use context dynamicValues
  const dynamicValues = propDynamicValues || contextDynamicValues;
  
  const breadcrumbs = useMemo(() => {
    if (customItems) return customItems;
    return generateBreadcrumbs(pathname, dynamicValues);
  }, [pathname, dynamicValues, customItems]);
  
  if (breadcrumbs.length === 0) return null;
  
  const currentItem = breadcrumbs[breadcrumbs.length - 1];
  const parentItem = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;
  
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {parentItem && (
          <>
            <li>
              <Link
                href={parentItem.href}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Link>
            </li>
            <li>
              <Link
                href={parentItem.href}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                {parentItem.label}
              </Link>
            </li>
            <li className="text-muted-foreground" aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
          </>
        )}
        <li>
          <span className="font-medium text-foreground" aria-current="page">
            {currentItem.label}
          </span>
        </li>
      </ol>
    </nav>
  );
}
