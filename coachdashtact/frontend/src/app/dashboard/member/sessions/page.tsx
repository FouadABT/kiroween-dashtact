'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from '@/hooks/use-toast';
import { SessionsApi } from '@/lib/api/coaching';
import type { Session } from '@/types/coaching';

type SessionFilter = 'upcoming' | 'past' | 'cancelled';

export default function MemberSessionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<SessionFilter>('upcoming');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await SessionsApi.getAll();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const getStatusBadge = (status: Session['status']) => {
    const variants: Record<Session['status'], 'default' | 'secondary' | 'destructive'> = {
      scheduled: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getFilteredSessions = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return sessions
          .filter(s => s.status === 'scheduled' && new Date(s.scheduledAt) >= now)
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      case 'past':
        return sessions
          .filter(s => s.status === 'completed' || (s.status === 'scheduled' && new Date(s.scheduledAt) < now))
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
      case 'cancelled':
        return sessions
          .filter(s => s.status === 'cancelled')
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
      default:
        return sessions;
    }
  };

  const filteredSessions = getFilteredSessions();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Sessions"
        description="View and manage your coaching sessions"
        breadcrumbProps={{
          customItems: [
            { label: 'Member Portal', href: '/dashboard/member' },
            { label: 'My Sessions', href: '/dashboard/member/sessions' }
          ]
        }}
        actions={
          <Button onClick={() => router.push('/dashboard/member/book-session')}>
            <Calendar className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        }
      />

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as SessionFilter)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => router.push(`/dashboard/member/sessions/${session.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{formatDate(session.scheduledAt)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(session.scheduledAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {session.duration} minutes • {session.type}
                          </p>
                        </div>

                        {session.memberNotes && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Notes:</p>
                            <p className="text-sm line-clamp-2">{session.memberNotes}</p>
                          </div>
                        )}

                        {session.rating && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Your rating:</span>
                            <span className="text-sm font-medium">
                              {'⭐'.repeat(session.rating)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(session.status)}
                        {session.status === 'completed' && !session.rating && (
                          <Badge variant="outline" className="text-xs">
                            Not Rated
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No {filter} sessions found
                </p>
                {filter === 'upcoming' && (
                  <Button onClick={() => router.push('/dashboard/member/book-session')}>
                    Book a Session
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
