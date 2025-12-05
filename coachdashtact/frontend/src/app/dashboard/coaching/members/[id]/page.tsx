'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MembersApi, SessionsApi } from '@/lib/api/coaching';
import { MessageButton } from '@/components/messaging/MessageButton';
import { toast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import type { MemberProfile, Session } from '@/types/coaching';
import {
  Calendar,
  Save,
  User,
  Heart,
  FileText,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [coachNotes, setCoachNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberId) {
      loadMemberData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load member profile
      const memberData = await MembersApi.getById(memberId);
      setMember(memberData);
      setCoachNotes(memberData.coachNotes || '');

      // Load member's sessions
      const sessionsData = await SessionsApi.getByMember(memberId);
      setSessions(
        sessionsData.sort(
          (a, b) =>
            parseISO(b.scheduledAt).getTime() -
            parseISO(a.scheduledAt).getTime()
        )
      );
    } catch (err) {
      console.error('Failed to load member data:', err);
      setError('Failed to load member data');
      toast.error('Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!member) return;

    try {
      setSaving(true);
      await MembersApi.update(member.id, { coachNotes });
      toast.success('Coach notes saved successfully');
    } catch (err) {
      console.error('Failed to save notes:', err);
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return <MemberDetailSkeleton />;
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error || 'Member not found'}</p>
        <Button onClick={() => router.push('/dashboard/coaching/members')}>
          Back to Members
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Breadcrumbs */}
      <PageHeader
        title={member.user?.name || 'Unknown Member'}
        description={member.user?.email}
        breadcrumbProps={{
          dynamicValues: {
            userName: member.user?.name || 'Unknown Member',
          },
        }}
        actions={
          member?.userId && (
            <MessageButton
              userId={member.userId}
              userName={member.user?.name || 'member'}
              dashboardType="coach"
            >
              Message Member
            </MessageButton>
          )
        }
      />

      {/* Member Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Membership</span>
              <Badge
                variant={
                  member.membershipStatus === 'active'
                    ? 'default'
                    : member.membershipStatus === 'paused'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {member.membershipStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Onboarding</span>
              <Badge
                variant={
                  member.onboardingStatus === 'completed'
                    ? 'default'
                    : member.onboardingStatus === 'in_progress'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {member.onboardingStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Sessions</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-medium">{sessions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-medium">
                {sessions.filter((s) => s.status === 'completed').length}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Joined</h3>
          </div>
          <p className="text-2xl font-bold">
            {format(parseISO(member.joinedAt), 'MMM d, yyyy')}
          </p>
        </Card>
      </div>

      {/* Goals */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Member Goals</h2>
        </div>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {member.goals || 'No goals set'}
        </p>
      </Card>

      {/* Health Info */}
      {member.healthInfo && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Health Information</h2>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {member.healthInfo}
          </p>
        </Card>
      )}

      {/* Coach Notes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Coach Notes (Private)</h2>
          </div>
          <Button onClick={handleSaveNotes} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
        <Textarea
          value={coachNotes}
          onChange={(e) => setCoachNotes(e.target.value)}
          placeholder="Add private notes about this member..."
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          These notes are only visible to coaches and admins
        </p>
      </Card>

      {/* Session History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Session History</h2>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No sessions yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {format(parseISO(session.scheduledAt), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{session.type}</Badge>
                  </TableCell>
                  <TableCell>{session.duration} min</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.status === 'completed'
                          ? 'default'
                          : session.status === 'cancelled'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {session.rating ? (
                      <span>⭐ {session.rating}/5</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/coaching/sessions/${session.id}`)
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/coaching/sessions?memberId=${member.id}`)
            }
          >
            <Calendar className="h-4 w-4 mr-2" />
            View All Sessions
          </Button>
          {member?.userId && (
            <MessageButton
              userId={member.userId}
              userName={member.user?.name || 'member'}
              variant="outline"
              dashboardType="coach"
            >
              Send Message
            </MessageButton>
          )}
        </div>
      </Card>
    </div>
  );
}

function MemberDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-24 w-full" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <Skeleton className="h-32 w-full" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-48 w-full" />
      </Card>
    </div>
  );
}
