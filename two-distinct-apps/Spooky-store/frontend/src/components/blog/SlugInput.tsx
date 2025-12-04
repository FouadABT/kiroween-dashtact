'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  generateSlug,
  validateSlug,
  validateSlugFormat,
  formatSlugPreview,
} from '@/lib/slug-utils';
import { debounce } from '@/lib/debounce';
import { Loader2, Check, X, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  title: string;
  postId?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * SlugInput Component
 * 
 * Enhanced slug input with:
 * - Auto-generation from title
 * - Real-time validation
 * - Availability checking
 * - Format validation
 * - Conflict suggestions
 * - Live preview
 * 
 * @param value - Current slug value
 * @param onChange - Callback when slug changes
 * @param title - Post title for auto-generation
 * @param postId - Post ID (for edit mode, excludes from validation)
 * @param disabled - Whether input is disabled
 * @param required - Whether slug is required
 */
export function SlugInput({
  value,
  onChange,
  title,
  postId,
  disabled = false,
  required = false,
}: SlugInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    available: boolean;
    message: string;
    suggestions?: string[];
  } | null>(null);
  const [formatErrors, setFormatErrors] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Validate slug format (client-side)
   */
  useEffect(() => {
    if (!value) {
      setFormatErrors([]);
      return;
    }

    const { valid, errors } = validateSlugFormat(value);
    setFormatErrors(valid ? [] : errors);
  }, [value]);

  /**
   * Validate slug availability (server-side)
   * Debounced to prevent excessive API calls
   */
  const validateSlugAvailability = useCallback(
    async (slug: string) => {
      if (!slug || formatErrors.length > 0) {
        setValidationResult(null);
        return;
      }

      setIsValidating(true);
      try {
        const token = localStorage.getItem('accessToken');
        const result = await validateSlug(slug, postId, token);
        setValidationResult(result);
      } catch (error) {
        console.error('Error validating slug:', error);
        setValidationResult({
          available: false,
          message: 'Unable to validate slug. Please try again.',
        });
      } finally {
        setIsValidating(false);
      }
    },
    [postId, formatErrors],
  );

  // Create debounced version using useMemo
  const debouncedValidation = useMemo(
    () => debounce(validateSlugAvailability, 500),
    [validateSlugAvailability]
  );

  /**
   * Trigger validation when slug changes
   */
  useEffect(() => {
    if (value && isEditing) {
      debouncedValidation(value);
    }
  }, [value, isEditing, debouncedValidation]);

  /**
   * Auto-generate slug from title
   */
  const handleGenerateSlug = () => {
    if (!title) return;

    const generatedSlug = generateSlug(title);
    onChange(generatedSlug);
    setIsEditing(true);
  };

  /**
   * Apply suggested slug
   */
  const handleApplySuggestion = (suggestion: string) => {
    onChange(suggestion);
    setIsEditing(true);
  };

  /**
   * Handle manual slug input
   */
  const handleSlugChange = (newSlug: string) => {
    onChange(newSlug);
    setIsEditing(true);
  };

  /**
   * Get validation status icon
   */
  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    if (formatErrors.length > 0) {
      return <X className="h-4 w-4 text-destructive" />;
    }

    if (validationResult) {
      return validationResult.available ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-destructive" />
      );
    }

    return null;
  };

  /**
   * Get validation status color
   */
  const getInputClassName = () => {
    if (formatErrors.length > 0) {
      return 'border-destructive focus-visible:ring-destructive';
    }

    if (validationResult && !validationResult.available) {
      return 'border-destructive focus-visible:ring-destructive';
    }

    if (validationResult && validationResult.available) {
      return 'border-green-600 focus-visible:ring-green-600';
    }

    return '';
  };

  return (
    <div className="space-y-3">
      {/* Label and Input */}
      <div className="space-y-2">
        <Label htmlFor="slug">
          Slug {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="slug"
              value={value}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-friendly-slug"
              disabled={disabled}
              required={required}
              className={getInputClassName()}
            />
            {/* Validation Icon */}
            {value && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateSlug}
            disabled={!title || disabled}
            title="Generate slug from title"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground">
          {value ? (
            <>Leave empty to auto-generate from title</>
          ) : (
            <>Enter a custom slug or click Generate to create from title</>
          )}
        </p>
      </div>

      {/* Format Errors */}
      {formatErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {formatErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Availability Status */}
      {validationResult && formatErrors.length === 0 && (
        <Alert variant={validationResult.available ? 'default' : 'destructive'}>
          {validationResult.available ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <p>{validationResult.message}</p>

            {/* Suggestions */}
            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Available alternatives:</p>
                <div className="flex flex-wrap gap-2">
                  {validationResult.suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplySuggestion(suggestion)}
                      disabled={disabled}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Slug Preview */}
      {value && formatErrors.length === 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Preview URL:</p>
          <div className="flex items-center gap-2">
            <code className="text-sm text-muted-foreground break-all">
              {formatSlugPreview(value)}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.open(formatSlugPreview(value), '_blank')}
              disabled={!validationResult?.available}
              title="Preview in new tab"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
