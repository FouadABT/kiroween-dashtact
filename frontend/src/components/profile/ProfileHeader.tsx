/**
 * Profile Header Component
 * 
 * Displays user avatar, name, and basic account information
 */

'use client';

import { ProfileResponse } from '@/types/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarUpload } from './AvatarUpload';
import { Badge } from '@/components/ui/badge';
import { Calendar, Shield, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileHeaderProps {
  profile: ProfileResponse;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <AvatarUpload
            currentAvatarUrl={profile.avatarUrl}
            userName={profile.name || profile.email}
          />
        </div>

        {/* Account Information */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-sm text-muted-foreground">Account Information</h3>
          
          {/* Role */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Role</span>
            </div>
            <Badge variant="secondary">{profile.role.name}</Badge>
          </div>

          {/* Email Verification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email Status</span>
            </div>
            <div className="flex items-center gap-1">
              {profile.emailVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Not Verified</span>
                </>
              )}
            </div>
          </div>

          {/* Account Created */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined</span>
            </div>
            <span className="text-sm">
              {format(new Date(profile.createdAt), 'MMM d, yyyy')}
            </span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last Updated</span>
            </div>
            <span className="text-sm">
              {format(new Date(profile.updatedAt), 'MMM d, yyyy')}
            </span>
          </div>

          {/* Last Password Change */}
          {profile.lastPasswordChange && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Password Changed</span>
              </div>
              <span className="text-sm">
                {format(new Date(profile.lastPasswordChange), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
