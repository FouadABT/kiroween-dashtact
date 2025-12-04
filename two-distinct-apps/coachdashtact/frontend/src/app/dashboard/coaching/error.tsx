'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function CoachingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Coaching dashboard error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <div className="mx-auto max-w-md">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              <CardTitle className="text-lg sm:text-xl">Something went wrong</CardTitle>
            </div>
            <CardDescription className="text-sm">
              We encountered an error in the coaching dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-mono text-muted-foreground break-words">
                {error.message || 'An unexpected error occurred'}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={reset} className="w-full sm:flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'} className="w-full sm:flex-1">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
