/**
 * Profile Page Client Component
 * 
 * Client-side profile page with form and avatar management
 */

'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileHeader } from './ProfileHeader';
import { ProfileForm } from './ProfileForm';
import { ProfileSkeleton } from './ProfileSkeleton';
import { useProfile } from '@/hooks/useProfile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ProfilePageClient() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Profile"
          description="Manage your personal information and settings"
        />
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Profile"
          description="Manage your personal information and settings"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load profile'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and settings"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Avatar and basic info */}
        <div className="lg:col-span-1">
          <ProfileHeader profile={profile} />
        </div>

        {/* Right column: Edit form */}
        <div className="lg:col-span-2">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
