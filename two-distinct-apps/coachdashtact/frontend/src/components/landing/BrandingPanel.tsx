'use client';

/**
 * Branding Panel Component
 * Displays current branding settings with sync and edit capabilities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Palette, 
  Image as ImageIcon, 
  RefreshCw, 
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react';
import { BrandingApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface BrandSettings {
  id: string;
  brandName: string;
  tagline?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  faviconUrl?: string | null;
  websiteUrl?: string | null;
  supportEmail?: string | null;
  socialLinks?: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

interface BrandingPanelProps {
  onSync?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function BrandingPanel({
  onSync,
  onEdit,
  showActions = true,
  compact = false,
}: BrandingPanelProps) {
  const [branding, setBranding] = useState<BrandSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch branding settings
  const fetchBranding = async () => {
    try {
      setIsLoading(true);
      const data = await BrandingApi.getBrandSettings();
      setBranding(data);
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      toast.error('Failed to load branding settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sync
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      
      // Call the onSync callback if provided
      if (onSync) {
        await onSync();
      }
      
      toast.success('Branding synced successfully');
    } catch (error) {
      console.error('Failed to sync branding:', error);
      toast.error('Failed to sync branding');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle edit
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      // Navigate to branding settings page
      window.location.href = '/admin/branding';
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!branding) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Branding Not Available
          </CardTitle>
          <CardDescription>
            Unable to load branding settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchBranding} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          {branding.logoUrl && (
            <img 
              src={branding.logoUrl} 
              alt={branding.brandName}
              className="h-8 w-auto object-contain"
            />
          )}
          <div>
            <p className="font-semibold text-sm">{branding.brandName}</p>
            {branding.tagline && (
              <p className="text-xs text-muted-foreground">{branding.tagline}</p>
            )}
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="ghost"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleEdit}
              variant="ghost"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Current Branding
        </CardTitle>
        <CardDescription>
          Brand settings that will be applied to your landing pages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Brand Name */}
        <div>
          <h3 className="text-sm font-medium mb-2">Brand Name</h3>
          <p className="text-2xl font-bold">{branding.brandName}</p>
          {branding.tagline && (
            <p className="text-sm text-muted-foreground mt-1">{branding.tagline}</p>
          )}
        </div>

        <Separator />

        {/* Logos */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Logos
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Light Logo */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Light Mode</p>
              {branding.logoUrl ? (
                <div className="flex items-center justify-center h-20 bg-background border border-border rounded-lg p-2">
                  <img 
                    src={branding.logoUrl} 
                    alt="Light logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 bg-muted border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">No logo</p>
                </div>
              )}
            </div>

            {/* Dark Logo */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Dark Mode</p>
              {branding.logoDarkUrl ? (
                <div className="flex items-center justify-center h-20 bg-slate-900 border border-border rounded-lg p-2">
                  <img 
                    src={branding.logoDarkUrl} 
                    alt="Dark logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 bg-muted border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">No logo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Social Links */}
        {branding.socialLinks && Object.keys(branding.socialLinks).length > 0 && (
          <>
            <div>
              <h3 className="text-sm font-medium mb-3">Social Links</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(branding.socialLinks).map(([platform, url]) => (
                  url && (
                    <Badge key={platform} variant="secondary" className="capitalize">
                      <Check className="h-3 w-3 mr-1" />
                      {platform}
                    </Badge>
                  )
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Contact Info */}
        {(branding.websiteUrl || branding.supportEmail) && (
          <>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Contact Information</h3>
              {branding.websiteUrl && (
                <p className="text-sm text-muted-foreground">
                  Website: <span className="text-foreground">{branding.websiteUrl}</span>
                </p>
              )}
              {branding.supportEmail && (
                <p className="text-sm text-muted-foreground">
                  Email: <span className="text-foreground">{branding.supportEmail}</span>
                </p>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="default"
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Branding
            </Button>
            <Button
              onClick={handleEdit}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Edit Branding
            </Button>
          </div>
        )}

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(branding.updatedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
