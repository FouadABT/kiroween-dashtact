'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SessionsApi, MembersApi } from '@/lib/api/coaching';
import { CoachStatsCard } from '@/components/coaching/CoachStatsCard';
import { toast } from '@/hooks/use-toast';
import type { Session } from '@/types/coaching';
import { Calendar, Users, Clock } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

export default function CoachDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todaysSessions, setTodaysSessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all sessions for the coach
      const allSessions = await SessionsApi.getAll();
      
      // Filter today's sessions
      const today = allSessions.filter((session) =>
        isToday(parseISO(session.scheduledAt)) && session.status === 'scheduled'
      );
      setTodaysSessions(today);

      // Get upcoming sessions (next 7 days, excluding today)
      const now = new Date();
      const upcoming = allSessions
        .filter((session) => {
          const sessionDate = parseISO(session.scheduledAt);
          return (
            session.status === 'scheduled' &&
            sessionDate > now &&
            !isToday(sessionDate)
          );
        })
        .sort((a, b) => 
          parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime()
        )
        .slice(0, 5);
      setUpcomingSessions(upcoming);

      // Load member count
      const members = await MembersApi.getAll();
      const activeMembers = members.filter(
        (m) => m.membershipStatus === 'active'
      );
      setMemberCount(activeMembers.length);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadDashboardData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold">Coaching Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your coaching sessions and members
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Quick statistics">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg" aria-hidden="true">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today&apos;s Sessions</p>
                  <p className="text-2xl font-bold" aria-label={`${todaysSessions.length} sessions today`}>{todaysSessions.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg" aria-hidden="true">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold" aria-label={`${memberCount} active members`}>{memberCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg" aria-hidden="true">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                  <p className="text-2xl font-bold" aria-label={`${upcomingSessions.length} upcoming sessions`}>{upcomingSessions.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <nav className="flex flex-wrap gap-3" aria-label="Quick actions">
              <Button onClick={() => router.push('/dashboard/coaching/members')}>
                <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                View Members
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/coaching/sessions')}
              >
                <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
                View All Sessions
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/coaching/availability')}
              >
                <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
                Manage Availability
              </Button>
            </nav>
          </Card>

          {/* Today's Sessions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today&apos;s Sessions</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/coaching/sessions')}
                aria-label="View all sessions"
              >
                View All
              </Button>
            </div>
            {todaysSessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8" role="status">
                No sessions scheduled for today
              </p>
            ) : (
              <div className="space-y-3" role="list" aria-label="Today's sessions">
                {todaysSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onClick={() =>
                      router.push(`/dashboard/coaching/sessions/${session.id}`)
                    }
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Sessions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/coaching/sessions')}
              >
                View All
              </Button>
            </div>
            {upcomingSessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No upcoming sessions scheduled
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onClick={() =>
                      router.push(`/dashboard/coaching/sessions/${session.id}`)
                    }
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Coach Stats */}
        <div className="lg:col-span-1">
          <CoachStatsCard />
        </div>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  onClick,
}: {
  session: Session;
  onClick: () => void;
}) {
  const sessionDate = parseISO(session.scheduledAt);
  const memberName = session.member?.user?.name || 'Unknown Member';

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={`Session with ${memberName} on ${format(sessionDate, 'MMMM d')} at ${format(sessionDate, 'h:mm a')}, ${session.duration} minutes, ${session.type} type`}
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg" aria-hidden="true">
          <span className="text-xs text-muted-foreground">
            {format(sessionDate, 'MMM')}
          </span>
          <span className="text-xl font-bold">{format(sessionDate, 'd')}</span>
        </div>
        <div>
          <p className="font-medium">{memberName}</p>
          <p className="text-sm text-muted-foreground">
            {format(sessionDate, 'h:mm a')} • {session.duration} min •{' '}
            {session.type}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" tabIndex={-1} aria-hidden="true">
        View Details
      </Button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <Skeleton className="h-32 w-full" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  );
}
