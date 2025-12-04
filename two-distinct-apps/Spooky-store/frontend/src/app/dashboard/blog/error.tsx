'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

/**
 * Blog Management Error Boundary
 * 
 * Catches and handles errors that occur in the blog management dashboard.
 * Provides user-friendly error message and recovery options.
 * 
 * Features:
 * - Error logging to console
 * - User-friendly error message
 * - Retry functionality
 * - Navigation to dashboard
 * - Responsive design
 * - Accessible with proper ARIA labels
 * 
 * @param error - Error object
 * @param reset - Function to retry the operation
 */

interface BlogManagementErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogManagementError({
  error,
  reset,
}: BlogManagementErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Blog management error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[600px] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Error Loading Blog Management
          </h1>
          <p className="text-muted-foreground">
            We encountered an error while loading the blog management interface.
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
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
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
