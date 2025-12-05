'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { MessageButton } from '@/components/messaging/MessageButton';
import { toast } from '@/hooks/use-toast';
import { MembersApi } from '@/lib/api/coaching';
import type { MemberProfile } from '@/types/coaching';

export default function MemberProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [goals, setGoals] = useState('');
  const [healthInfo, setHealthInfo] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      const goalsChanged = goals !== (profile.goals || '');
      const healthChanged = healthInfo !== (profile.healthInfo || '');
      setHasChanges(goalsChanged || healthChanged);
    }
  }, [goals, healthInfo, profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const memberProfile = await MembersApi.getMe();
      if (!memberProfile) {
        toast.error('Member profile not found');
        return;
      }
      setProfile(memberProfile);
      setGoals(memberProfile.goals || '');
      setHealthInfo(memberProfile.healthInfo || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      await MembersApi.update(profile.id, {
        goals: goals || undefined,
        healthInfo: healthInfo || undefined,
      });
      toast.success('Profile updated successfully');
      setHasChanges(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: MemberProfile['membershipStatus']) => {
    const variants: Record<MemberProfile['membershipStatus'], 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      inactive: 'destructive',
      paused: 'secondary',
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Profile not found</p>
        <Button onClick={() => router.push('/dashboard/member')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Profile"
        description="Manage your coaching profile and goals"
        breadcrumbProps={{
          customItems: [
            { label: 'Member Portal', href: '/dashboard/member' },
            { label: 'My Profile', href: '/dashboard/member/profile' }
          ]
        }}
        actions={
          hasChanges ? (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">Name</span>
              </div>
              <p className="font-medium">{profile.user?.name || 'Not set'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="font-medium">{profile.user?.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Member Since</span>
              </div>
              <p className="font-medium">{formatDate(profile.joinedAt)}</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <div>{getStatusBadge(profile.membershipStatus)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Coach Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Coach</CardTitle>
            <CardDescription>Information about your assigned coach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.coach ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Coach Name</span>
                  </div>
                  <p className="font-medium">{profile.coach.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="font-medium">{profile.coach.email}</p>
                </div>

                {profile.coachId && (
                  <MessageButton
                    userId={profile.coachId}
                    userName={profile.coach?.name || 'your coach'}
                    variant="outline"
                    className="w-full"
                    dashboardType="member"
                  >
                    Message Coach
                  </MessageButton>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No coach assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle>My Goals</CardTitle>
          <CardDescription>
            What do you want to achieve through coaching?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe your coaching goals..."
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Share your goals with your coach to help them provide better guidance
          </p>
        </CardContent>
      </Card>

      {/* Health Info */}
      <Card>
        <CardHeader>
          <CardTitle>Health Information</CardTitle>
          <CardDescription>
            Any health information your coach should know about
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Share any relevant health information..."
            value={healthInfo}
            onChange={(e) => setHealthInfo(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            This information is private and only visible to you and your coach
          </p>
        </CardContent>
      </Card>

      {/* Coach Notes (Read-only) */}
      {profile.coachNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Coach Notes</CardTitle>
            <CardDescription>
              Notes from your coach about your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{profile.coachNotes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button (Bottom) */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
