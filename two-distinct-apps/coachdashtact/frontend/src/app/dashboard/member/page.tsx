'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { MembersApi, SessionsApi } from '@/lib/api/coaching';
import { ErrorBoundary } from '@/components/coaching/ErrorBoundary';
import { DashboardSkeleton } from '@/components/coaching/LoadingSkeletons';
import { MessageButton } from '@/components/messaging/MessageButton';
import { PageHeader } from '@/components/layout/PageHeader';
import type { MemberProfile, Session } from '@/types/coaching';

// Note: Metadata is defined in metadata-config.ts for '/dashboard/member'
// Client component cannot export metadata directly

function MemberDashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get member profile
      const profile = await MembersApi.getMe();
      setProfile(profile);

      // Get upcoming sessions
      const sessions = await SessionsApi.getUpcoming();
      const sortedSessions = sessions
        .filter(s => s.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      
      setNextSession(sortedSessions[0] || null);
      setUpcomingSessions(sortedSessions.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const sessionDate = new Date(dateString);
    const diff = sessionDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Past';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Welcome Back!"
        description={profile?.coach ? `Your coach: ${profile.coach.name}` : 'No coach assigned yet'}
      />

      {/* Next Session & Quick Actions */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Next Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" aria-hidden="true" />
              Next Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextSession ? (
              <div className="space-y-4" role="region" aria-label="Next session details">
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{formatDate(nextSession.scheduledAt)}</p>
                  <p className="text-sm">{formatTime(nextSession.scheduledAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Until Session</p>
                  <p className="text-2xl font-bold text-primary" aria-live="polite">
                    {getTimeUntil(nextSession.scheduledAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{nextSession.duration} minutes</p>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/member/sessions/${nextSession.id}`)}
                  className="w-full"
                  aria-label={`View details for session on ${formatDate(nextSession.scheduledAt)}`}
                >
                  View Details
                </Button>
              </div>
            ) : (
              <div className="text-center py-8" role="status">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                <p className="text-muted-foreground mb-4">No upcoming sessions</p>
                <Button onClick={() => router.push('/dashboard/member/book-session')}>
                  Book a Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3" role="navigation" aria-label="Quick actions">
            <Button
              onClick={() => router.push('/dashboard/member/book-session')}
              className="w-full justify-start text-sm sm:text-base"
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Book a Session</span>
            </Button>
            {profile?.coachId && (
              <MessageButton
                userId={profile.coachId}
                userName={profile.coach?.name || 'your coach'}
                variant="outline"
                className="w-full justify-start text-sm sm:text-base"
                dashboardType="member"
              >
                <span className="truncate">Message Coach</span>
              </MessageButton>
            )}
            <Button
              onClick={() => router.push('/dashboard/member/sessions')}
              className="w-full justify-start text-sm sm:text-base"
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">View All Sessions</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/member/profile')}
              className="w-full justify-start text-sm sm:text-base"
              variant="outline"
            >
              <User className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Edit Profile</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Your next 3 scheduled sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <nav className="space-y-4" aria-label="Upcoming sessions list">
              {upcomingSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/member/sessions/${session.id}`}
                  className="block p-3 sm:p-4 rounded-lg border border-border hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`Session on ${formatDate(session.scheduledAt)} at ${formatTime(session.scheduledAt)}, ${session.duration} minutes, ${session.type} type`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{formatDate(session.scheduledAt)}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatTime(session.scheduledAt)} • {session.duration} minutes
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                        Type: {session.type}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-primary" aria-live="polite">
                        In {getTimeUntil(session.scheduledAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
          ) : (
            <div className="text-center py-8" role="status">
              <p className="text-muted-foreground mb-4">No upcoming sessions</p>
              <Button onClick={() => router.push('/dashboard/member/book-session')}>
                Book Your First Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MemberDashboard() {
  return (
    <ErrorBoundary>
      <MemberDashboardContent />
    </ErrorBoundary>
  );
}
