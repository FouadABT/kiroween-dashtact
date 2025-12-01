'use client';

/**
 * SearchErrorState Component
 * Displays error message when search fails
 */

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function SearchErrorState({ error, onRetry }: SearchErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Search Failed
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">
        {error || 'An error occurred while searching. Please try again.'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

