'use client';

/**
 * Bulk Branding Update Component
 * Allows applying branding to all landing pages with preview and progress tracking
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { LandingApi, BrandingApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface BulkBrandingUpdateProps {
  onComplete?: () => void;
}

export function BulkBrandingUpdate({ onComplete }: BulkBrandingUpdateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'applying' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ updated: number; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    try {
      setIsApplying(true);
      setStatus('applying');
      setProgress(0);
      setError(null);

      // Fetch current branding settings
      setProgress(20);
      const branding = await BrandingApi.getBrandSettings();

      // Apply branding to all pages
      setProgress(50);
      const response = await LandingApi.applyBrandingToAll(branding);

      setProgress(100);
      setStatus('success');
      setResult(response);

      toast.success(`Branding applied to ${response.updated} page(s)`);

      if (onComplete) {
        onComplete();
      }

      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 2000);
    } catch (err) {
      console.error('Failed to apply branding:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to apply branding');
      toast.error('Failed to apply branding to all pages');
    } finally {
      setIsApplying(false);
    }
  };

  const resetState = () => {
    setProgress(0);
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!isApplying) {
      setIsOpen(open);
      if (!open) {
        resetState();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Apply Branding to All Pages
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Apply Branding to All Pages
          </DialogTitle>
          <DialogDescription>
            This will update all landing pages with the current branding settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Alert */}
          {status === 'idle' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will update:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Brand name in all sections</li>
                  <li>Logos in headers and footers</li>
                  <li>Social links in footers</li>
                  <li>Copyright text</li>
                  <li>SEO metadata</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Progress */}
          {status === 'applying' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Applying branding...</span>
                <Badge variant="secondary">{progress}%</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Success */}
          {status === 'success' && result && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {result.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {status === 'error' && error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {status === 'idle' && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={isApplying}>
                Apply Branding
              </Button>
            </>
          )}
          {status === 'applying' && (
            <Button disabled>
              <span className="animate-pulse">Applying...</span>
            </Button>
          )}
          {(status === 'success' || status === 'error') && (
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
