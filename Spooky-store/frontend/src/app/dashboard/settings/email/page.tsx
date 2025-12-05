'use client';

/**
 * Email Settings Page
 * 
 * Super admin only page for configuring email system settings including:
 * - SMTP configuration
 * - Email system toggle
 * - Test email functionality
 * - Email templates management
 * - Email logs and statistics
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Settings, FileText, BarChart3 } from 'lucide-react';
import { EmailConfigurationForm } from '@/app/dashboard/settings/email/components/EmailConfigurationForm';
import { EmailToggle } from '@/app/dashboard/settings/email/components/EmailToggle';
import { TestEmailDialog } from '@/app/dashboard/settings/email/components/TestEmailDialog';
import { EmailTemplateList } from '@/app/dashboard/settings/email/components/EmailTemplateList';
import { EmailTemplateEditor } from '@/app/dashboard/settings/email/components/EmailTemplateEditor';
import { EmailLogsTable } from '@/app/dashboard/settings/email/components/EmailLogsTable';
import { EmailStatsCards } from '@/app/dashboard/settings/email/components/EmailStatsCards';
import { RateLimitSettings } from '@/app/dashboard/settings/email/components/RateLimitSettings';
import { emailConfigApi } from '@/lib/api/email';
import type { EmailConfiguration, EmailTemplate } from '@/types/email';

export default function EmailSettingsPage() {
  const { user, hasRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [configuration, setConfiguration] = useState<EmailConfiguration | null>(null);
  const [activeTab, setActiveTab] = useState('configuration');
  
  // Template editor state
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Check if user is super admin
  useEffect(() => {
    if (!authLoading && user) {
      if (!hasRole('Super Admin')) {
        router.push('/dashboard/access-denied');
      }
    }
  }, [user, hasRole, authLoading, router]);

  // Load email configuration
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        setIsLoading(true);
        const config = await emailConfigApi.getConfiguration();
        setConfiguration(config);
      } catch (error) {
        console.error('Failed to load email configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && hasRole('Super Admin')) {
      loadConfiguration();
    }
  }, [user, hasRole]);

  // Handle configuration update
  const handleConfigurationUpdate = (config: EmailConfiguration) => {
    setConfiguration(config);
  };

  // Template editor handlers
  const handleTemplateCreate = () => {
    setSelectedTemplate(null);
    setShowTemplateEditor(true);
  };

  const handleTemplateEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleTemplateSave = () => {
    setShowTemplateEditor(false);
    setSelectedTemplate(null);
  };

  const handleTemplateCancel = () => {
    setShowTemplateEditor(false);
    setSelectedTemplate(null);
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Email Settings"
          description="Configure email system and SMTP settings"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Only render for super admins
  if (!user || !hasRole('Super Admin')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Settings"
        description="Configure email system and SMTP settings"
        breadcrumbProps={{
          customItems: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings', href: '/dashboard/settings' },
            { label: 'Email', href: '/dashboard/settings/email' },
          ],
        }}
      />

      {/* Email System Status */}
      {configuration && (
        <EmailToggle
          configuration={configuration}
          onUpdate={handleConfigurationUpdate}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Statistics</span>
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <EmailConfigurationForm
            configuration={configuration}
            onUpdate={handleConfigurationUpdate}
          />

          {/* Test Email Section - Always show if configuration exists or after saving */}
          {configuration && configuration.smtpHost && (
            <TestEmailDialog configuration={configuration} />
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {showTemplateEditor ? (
            <EmailTemplateEditor
              template={selectedTemplate}
              onSave={handleTemplateSave}
              onCancel={handleTemplateCancel}
            />
          ) : (
            <EmailTemplateList
              onEdit={handleTemplateEdit}
              onCreateNew={handleTemplateCreate}
            />
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <EmailLogsTable />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <EmailStatsCards />
          <RateLimitSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
