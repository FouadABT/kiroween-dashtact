'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HeaderEditor } from '@/components/landing/HeaderEditor';
import { FooterEditor } from '@/components/landing/FooterEditor';
import { SettingsPanel } from '@/components/landing/SettingsPanel';
import { SectionEditor } from '@/components/landing/SectionEditor';
import { ValidationErrorAlert } from '@/components/landing/ValidationErrorAlert';
import { LandingApi } from '@/lib/api';
import { extractValidationErrors } from '@/lib/validation-error-parser';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Layout,
  Menu,
  Columns,
  Settings,
  Eye,
  Save,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import type { LandingPageContent } from '@/types/landing-page';

export function LandingPageSettingsClient() {
  const router = useRouter();
  const { user, hasRole, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('editor');
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [headerConfig, setHeaderConfig] = useState<any>(null);
  const [footerConfig, setFooterConfig] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // Check if user has permission (Super Admin only)
  const hasPermission = hasRole('Super Admin');

  useEffect(() => {
    if (!authLoading && !hasPermission) {
      toast.error('Access denied. Super Admin role required.');
      router.push('/dashboard/settings');
    }
  }, [authLoading, hasPermission, router]);

  useEffect(() => {
    if (hasPermission) {
      loadAllData();
    }
  }, [hasPermission]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [contentData, headerData, footerData, settingsData] =
        await Promise.all([
          LandingApi.getContent(),
          LandingApi.getHeaderConfig(),
          LandingApi.getFooterConfig(),
          LandingApi.getSettings(),
        ]);

      setContent(contentData);
      setHeaderConfig(headerData);
      setFooterConfig(footerData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load landing page data:', error);
      toast.error('Failed to load landing page settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    if (!content) return;

    try {
      setSaving(true);
      setValidationErrors([]);
      await LandingApi.updateContent({
        sections: content.sections,
        settings: content.settings,
      });
      toast.success('Landing page content saved successfully');
    } catch (error: any) {
      console.error('Failed to save content:', error);
      
      // Extract and display validation errors
      const errors = extractValidationErrors(error);
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error('Please fix the validation errors below');
      } else {
        toast.error('Failed to save landing page content');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHeader = async () => {
    if (!headerConfig) return;

    try {
      setSaving(true);
      // Strip database fields before sending
      const { id, createdAt, updatedAt, ...updateData } = headerConfig;
      await LandingApi.updateHeaderConfig(updateData);
      toast.success('Header configuration saved successfully');
    } catch (error) {
      console.error('Failed to save header:', error);
      toast.error('Failed to save header configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async () => {
    if (!footerConfig) return;

    try {
      setSaving(true);
      // Strip database fields before sending
      const { id, createdAt, updatedAt, ...updateData } = footerConfig;
      await LandingApi.updateFooterConfig(updateData);
      toast.success('Footer configuration saved successfully');
    } catch (error) {
      console.error('Failed to save footer:', error);
      toast.error('Failed to save footer configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await LandingApi.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const handleBackToSettings = () => {
    router.push('/dashboard/settings');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Landing Page Settings"
          description="Loading..."
        />
        <Card className="p-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Card>
      </div>
    );
  }

  // Show access denied if no permission
  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Landing Page Settings"
          description="Access Denied"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Super Admin role is required.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBackToSettings} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToSettings} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <PageHeader
          title="Landing Page Settings"
          description="Manage your landing page content, header, footer, and settings"
        />
        <Card className="p-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button onClick={handleBackToSettings} variant="ghost" size="sm" className="h-8 px-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Settings
        </Button>
        <span>/</span>
        <span className="text-foreground font-medium">Landing Page</span>
      </div>

      <PageHeader
        title="Landing Page Settings"
        description="Customize your landing page content, layout, and appearance"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handlePreview} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={() => {
                if (activeTab === 'editor') handleSaveContent();
                else if (activeTab === 'header') handleSaveHeader();
                else if (activeTab === 'footer') handleSaveFooter();
                else if (activeTab === 'settings') handleSaveSettings();
              }}
              disabled={saving}
              size="sm"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        }
      />

      {/* Quick stats overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content?.sections?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active sections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Header</CardTitle>
            <Menu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{headerConfig?.menuItems?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Menu items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Footer</CardTitle>
            <Columns className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{footerConfig?.sections?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Footer sections</p>
          </CardContent>
        </Card>

      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="editor" className="gap-2">
                <Layout className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="header" className="gap-2">
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">Header</span>
              </TabsTrigger>
              <TabsTrigger value="footer" className="gap-2">
                <Columns className="h-4 w-4" />
                <span className="hidden sm:inline">Footer</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="editor" className="space-y-4">
          {validationErrors.length > 0 && (
            <ValidationErrorAlert
              errors={validationErrors}
              onDismiss={() => setValidationErrors([])}
            />
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Page Content Editor
              </CardTitle>
              <CardDescription>
                Drag and drop sections to reorder, toggle visibility, and manage content
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {content && content.sections && (
                <SectionEditor
                  sections={content.sections}
                  onChange={(updatedSections) => {
                    setContent({ ...content, sections: updatedSections });
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Header Configuration
              </CardTitle>
              <CardDescription>
                Customize navigation menu, logo, and header appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {headerConfig && (
                <HeaderEditor
                  config={headerConfig}
                  onChange={setHeaderConfig}
                  onSave={handleSaveHeader}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Columns className="h-5 w-5" />
                Footer Configuration
              </CardTitle>
              <CardDescription>
                Manage footer sections, links, and social media
              </CardDescription>
            </CardHeader>
            <CardContent>
              {footerConfig && (
                <FooterEditor
                  config={footerConfig}
                  onChange={setFooterConfig}
                  onSave={handleSaveFooter}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Global Settings
              </CardTitle>
              <CardDescription>
                Configure SEO, branding, theme, and global preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings && (
                <SettingsPanel
                  settings={settings}
                  onChange={setSettings}
                  onSave={handleSaveSettings}
                  onReset={() => loadAllData()}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
}
