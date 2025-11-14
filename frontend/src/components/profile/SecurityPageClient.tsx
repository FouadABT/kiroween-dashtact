/**
 * Security Page Client Component
 * 
 * Client-side security settings page with password change
 */

'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { PasswordChangeForm } from './PasswordChangeForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { Shield, Key, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function SecurityPageClient() {
  const { data: profile, isLoading } = useProfile();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Settings"
        description="Manage your password and security preferences"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Security info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : (
                <>
                  {/* Password Status */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Password</p>
                      {profile?.lastPasswordChange ? (
                        <p className="text-xs text-muted-foreground">
                          Last changed {format(new Date(profile.lastPasswordChange), 'MMM d, yyyy')}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Never changed
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Account Age */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Account Age</p>
                      {profile?.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          Created {format(new Date(profile.createdAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Password change form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
