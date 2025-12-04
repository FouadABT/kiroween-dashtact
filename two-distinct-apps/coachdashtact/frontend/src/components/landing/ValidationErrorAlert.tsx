'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationErrorAlertProps {
  errors: ValidationError[];
  onDismiss?: () => void;
  className?: string;
}

export function ValidationErrorAlert({
  errors,
  onDismiss,
  className,
}: ValidationErrorAlertProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className={cn('mb-4', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Validation Error</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-xs font-medium text-destructive/80 min-w-fit">
                {error.field}:
              </span>
              <span className="text-sm">{error.message}</span>
            </div>
          ))}
        </div>
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute right-2 top-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}
