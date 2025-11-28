/**
 * Security Page Client Component
 * 
 * Simple password change page
 */

'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { PasswordChangeForm } from './PasswordChangeForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SecurityPageClient() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Change Password"
        description="Update your password to keep your account secure"
      />

      <Card>
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>
            Enter your current password and choose a new secure password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>
    </div>
  );
}
