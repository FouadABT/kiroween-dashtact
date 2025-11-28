'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMetadata } from '@/contexts/MetadataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { BrandingApi } from '@/lib/api/branding';
import type { BrandSettings, UpdateBrandSettingsDto } from '@/types/branding';
import { Loader2 } from 'lucide-react';
import { LogoUpload } from './components/LogoUpload';
import { BrandInfoForm } from './components/BrandInfoForm';
import { SocialLinksForm } from './components/SocialLinksForm';
import { FaviconUpload } from './components/FaviconUpload';
import { BrandingPreview } from './components/BrandingPreview';

export default function BrandingSettingsPage() {
  const { updateMetadata } = useMetadata();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [formData, setFormData] = useState<UpdateBrandSettingsDto>({});
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | undefined>();
  const [faviconUrl, setFaviconUrl] = useState<string | undefined>();
  const [hasChanges, setHasChanges] = useState(false);

  // Check permission
  const hasBrandingPermission = user?.role?.rolePermissions?.some(
    (rp) => rp.permission.name === 'branding:manage'
  ) || user?.role?.name === 'Super Admin';

  useEffect(() => {
    updateMetadata({
      title: 'Branding Settings',
      description: 'Manage your brand identity and assets',
      keywords: ['branding', 'logo', 'favicon', 'brand settings'],
    });
  }, [updateMetadata]);

  useEffect(() => {
    loadBrandSettings();
  }, []);

  const loadBrandSettings = async () => {
    try {
      setLoading(true);
      const settings = await BrandingApi.getBrandSettings();
      setBrandSettings(settings);
      setFormData({
        brandName: settings.brandName,
        tagline: settings.tagline,
        description: settings.description,
        websiteUrl: settings.websiteUrl,
        supportEmail: settings.supportEmail,
        socialLinks: settings.socialLinks,
      });
      setLogoUrl(settings.logoUrl);
      setLogoDarkUrl(settings.logoDarkUrl);
      setFaviconUrl(settings.faviconUrl);
    } catch (error) {
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandInfoChange = (data: UpdateBrandSettingsDto) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setHasChanges(true);
  };

  const handleSocialLinksChange = (socialLinks: UpdateBrandSettingsDto['socialLinks']) => {
    setFormData((prev) => ({ ...prev, socialLinks }));
    setHasChanges(true);
  };

  const handleLogoUpload = (url: string) => {
    setLogoUrl(url);
    setHasChanges(true);
  };

  const handleLogoDarkUpload = (url: string) => {
    setLogoDarkUrl(url);
    setHasChanges(true);
  };

  const handleFaviconUpload = (url: string) => {
    setFaviconUrl(url);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasBrandingPermission) {
      toast.error('You do not have permission to manage branding');
      return;
    }

    try {
      setSaving(true);
      const updated = await BrandingApi.updateBrandSettings(formData);
      setBrandSettings(updated);
      setHasChanges(false);
      toast.success('Branding settings updated successfully');
      
      // Reload to get latest URLs
      await loadBrandSettings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update branding settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!hasBrandingPermission) {
      toast.error('You do not have permission to manage branding');
      return;
    }

    if (!confirm('Are you sure you want to reset branding to default values? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const defaultSettings = await BrandingApi.resetBranding();
      setBrandSettings(defaultSettings);
      setFormData({
        brandName: defaultSettings.brandName,
        tagline: defaultSettings.tagline,
        description: defaultSettings.description,
        websiteUrl: defaultSettings.websiteUrl,
        supportEmail: defaultSettings.supportEmail,
        socialLinks: defaultSettings.socialLinks,
      });
      setLogoUrl(defaultSettings.logoUrl);
      setLogoDarkUrl(defaultSettings.logoDarkUrl);
      setFaviconUrl(defaultSettings.faviconUrl);
      setHasChanges(false);
      toast.success('Branding reset to default values');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset branding');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (brandSettings) {
      setFormData({
        brandName: brandSettings.brandName,
        tagline: brandSettings.tagline,
        description: brandSettings.description,
        websiteUrl: brandSettings.websiteUrl,
        supportEmail: brandSettings.supportEmail,
        socialLinks: brandSettings.socialLinks,
      });
      setLogoUrl(brandSettings.logoUrl);
      setLogoDarkUrl(brandSettings.logoDarkUrl);
      setFaviconUrl(brandSettings.faviconUrl);
      setHasChanges(false);
    }
  };

  if (!hasBrandingPermission) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Branding Settings"
          description="Manage your brand identity and assets"
        />
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              You do not have permission to access branding settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Branding Settings"
          description="Manage your brand identity and assets"
        />
        <Card>
          <CardContent className="pt-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding Settings"
        description="Manage your brand identity and assets"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Section - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo Uploads */}
          <div className="grid gap-6 md:grid-cols-2">
            <LogoUpload
              title="Light Mode Logo"
              description="Logo for light theme"
              currentLogoUrl={logoUrl}
              onUploadSuccess={handleLogoUpload}
            />
            <LogoUpload
              title="Dark Mode Logo"
              description="Logo for dark theme"
              currentLogoUrl={logoDarkUrl}
              isDarkMode
              onUploadSuccess={handleLogoDarkUpload}
            />
          </div>

          {/* Brand Info Form */}
          <BrandInfoForm
            initialData={formData}
            onChange={handleBrandInfoChange}
          />

          {/* Social Links Form */}
          <SocialLinksForm
            initialData={formData.socialLinks}
            onChange={handleSocialLinksChange}
          />

          {/* Favicon Upload */}
          <FaviconUpload
            currentFaviconUrl={faviconUrl}
            onUploadSuccess={handleFaviconUpload}
          />
        </div>

        {/* Preview Section - 1 column */}
        <div className="space-y-6">
          <BrandingPreview
            brandSettings={formData}
            logoUrl={logoUrl}
            logoDarkUrl={logoDarkUrl}
            faviconUrl={faviconUrl}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={!hasChanges || saving}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saving}
        >
          Reset to Default
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
