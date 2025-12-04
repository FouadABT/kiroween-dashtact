'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionsApi } from '@/lib/api/coaching';
import type { Session } from '@/types/coaching';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, List, Clock, User, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/PageHeader';

type ViewMode = 'calendar' | 'list';
type FilterMode = 'upcoming' | 'past' | 'cancelled';

export default function CoachSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<FilterMode>('upcoming');

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await SessionsApi.getByCoach(user.id);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSessions = () => {
    const now = new Date();
    
    switch (filterMode) {
      case 'upcoming':
        return sessions.filter(
          s => s.status === 'scheduled' && new Date(s.scheduledAt) >= now
        ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      
      case 'past':
        return sessions.filter(
          s => s.status === 'completed' || (s.status === 'scheduled' && new Date(s.scheduledAt) < now)
        ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
      
      case 'cancelled':
        return sessions.filter(s => s.status === 'cancelled')
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
      
      default:
        return sessions;
    }
  };

  const getStatusBadge = (status: Session['status']) => {
    const variants = {
      scheduled: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const filteredSessions = getFilteredSessions();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sessions"
          description="View and manage your coaching sessions"
        />
        <div className="text-center py-12 text-muted-foreground">
          Loading sessions...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Breadcrumbs */}
      <PageHeader
        title="Sessions"
        description="View and manage your coaching sessions"
        actions={
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Tabs value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={filterMode} className="mt-6">
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No {filterMode} sessions found
                  </p>
                </Card>
              ) : (
                filteredSessions.map((session) => (
                  <Card key={session.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Session Header */}
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session
                          </h3>
                          {getStatusBadge(session.status)}
                        </div>

                        {/* Member Info */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>
                            {session.member?.user?.name || 'Unknown Member'}
                          </span>
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatDate(session.scheduledAt)} at {formatTime(session.scheduledAt)}
                          </span>
                          <span className="text-xs">({session.duration} min)</span>
                        </div>

                        {/* Rating (if completed) */}
                        {session.status === 'completed' && session.rating && (
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{session.rating}/5</span>
                            {session.ratingFeedback && (
                              <span className="text-muted-foreground">
                                - {session.ratingFeedback}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Notes Preview */}
                        {session.coachNotes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            Notes: {session.coachNotes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <Link href={`/dashboard/coaching/sessions/${session.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Calendar view coming soon
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
