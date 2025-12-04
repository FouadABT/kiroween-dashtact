'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';

/**
 * Blog Error Boundary
 * 
 * Catches and handles errors that occur in the blog listing page.
 * Provides user-friendly error message and recovery options.
 * 
 * Features:
 * - Error logging to console
 * - User-friendly error message
 * - Retry functionality
 * - Navigation options
 * - Responsive design
 * - Accessible with proper ARIA labels
 * 
 * @param error - Error object
 * @param reset - Function to retry the operation
 */

interface BlogErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogError({ error, reset }: BlogErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Blog page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-lg text-muted-foreground">
            We encountered an error while loading the blog.
          </p>
        </div>

        {/* Error Message */}
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground font-mono break-words">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button onClick={reset} size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            If this problem persists, please contact support with the error ID above.
          </p>
        </div>
      </div>
    </div>
  );
}
