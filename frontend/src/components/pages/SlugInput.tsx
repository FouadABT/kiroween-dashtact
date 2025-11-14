'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface SlugInputProps {
  value: string;
  title: string;
  onChange: (value: string) => void;
  excludePageId?: string;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestedSlug?: string;
}

export function SlugInput({ value, title, onChange, excludePageId }: SlugInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Generate slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!isManualEdit && title) {
      const newSlug = generateSlug(title);
      if (newSlug !== value) {
        onChange(newSlug);
      }
    }
  }, [title, isManualEdit]);

  // Validate slug format
  const validateSlugFormat = (slug: string): boolean => {
    const slugPattern = /^[a-z0-9-]+$/;
    return slugPattern.test(slug);
  };

  // Validate slug with API
  const validateSlug = async (slug: string): Promise<ValidationResult> => {
    if (!slug) {
      return { isValid: false, message: 'Slug is required' };
    }

    if (!validateSlugFormat(slug)) {
      return {
        isValid: false,
        message: 'Slug can only contain lowercase letters, numbers, and hyphens',
      };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/validate-slug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          slug,
          excludeId: excludePageId,
        }),
      });

      if (response.ok) {
        return { isValid: true };
      }

      const error = await response.json();
      
      if (response.status === 409) {
        // Slug conflict
        return {
          isValid: false,
          message: error.message || 'This slug is already in use',
          suggestedSlug: error.suggestedSlug,
        };
      }

      if (response.status === 400) {
        // System route conflict
        return {
          isValid: false,
          message: error.message || 'This slug conflicts with a system route',
        };
      }

      return {
        isValid: false,
        message: 'Failed to validate slug',
      };
    } catch (error) {
      console.error('Error validating slug:', error);
      return {
        isValid: false,
        message: 'Failed to validate slug',
      };
    }
  };

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce(async (slug: string) => {
      if (!slug) {
        setValidation({ isValid: false, message: 'Slug is required' });
        setIsValidating(false);
        return;
      }

      setIsValidating(true);
      const result = await validateSlug(slug);
      setValidation(result);
      setIsValidating(false);
    }, 500),
    [excludePageId]
  );

  // Validate on value change
  useEffect(() => {
    if (value) {
      debouncedValidate(value);
    } else {
      setValidation({ isValid: false, message: 'Slug is required' });
    }

    return () => {
      debouncedValidate.cancel();
    };
  }, [value, debouncedValidate]);

  const handleChange = (newValue: string) => {
    setIsManualEdit(true);
    onChange(newValue);
  };

  const handleRegenerate = () => {
    setIsManualEdit(false);
    const newSlug = generateSlug(title);
    onChange(newSlug);
  };

  const handleUseSuggestion = () => {
    if (validation.suggestedSlug) {
      onChange(validation.suggestedSlug);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">
        URL Slug <span className="text-destructive">*</span>
      </Label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            id="slug"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="page-url-slug"
            className={
              !validation.isValid && value
                ? 'border-destructive focus-visible:ring-destructive'
                : validation.isValid && value
                ? 'border-green-500 focus-visible:ring-green-500'
                : ''
            }
          />
          {isValidating && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {!isValidating && value && validation.isValid && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {!isValidating && value && !validation.isValid && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleRegenerate}
          disabled={!title}
          title="Regenerate slug from title"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Validation message */}
      {!validation.isValid && validation.message && (
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p>{validation.message}</p>
            {validation.suggestedSlug && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-destructive hover:text-destructive/80"
                onClick={handleUseSuggestion}
              >
                Use suggested slug: {validation.suggestedSlug}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Success message */}
      {validation.isValid && value && !isValidating && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <p>Slug is available</p>
        </div>
      )}

      {/* Help text */}
      <p className="text-sm text-muted-foreground">
        The URL slug is automatically generated from the title. You can edit it manually if needed.
        Only lowercase letters, numbers, and hyphens are allowed.
      </p>

      {/* Preview URL */}
      {value && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">Preview URL:</p>
          <p className="text-sm font-mono break-all">
            {process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/{value}
          </p>
        </div>
      )}
    </div>
  );
}
