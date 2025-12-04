'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SessionsApi } from '@/lib/api/coaching';
import type { Session } from '@/types/coaching';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Clock, 
  User, 
  Calendar, 
  Star, 
  CheckCircle, 
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { MessageButton } from '@/components/messaging/MessageButton';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [coachNotes, setCoachNotes] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await SessionsApi.getById(sessionId);
      setSession(data);
      setCoachNotes(data.coachNotes || '');
      setOutcomes(data.outcomes || '');
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!session) return;

    try {
      setSubmitting(true);
      await SessionsApi.addCoachNotes(session.id, coachNotes);
      toast.success('Notes saved successfully');
      setIsEditing(false);
      await loadSession();
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!session) return;

    try {
      setSubmitting(true);
      await SessionsApi.complete(session.id, {
        coachNotes,
        outcomes: outcomes || undefined,
      });
      toast.success('Session marked as complete');
      setShowCompleteDialog(false);
      await loadSession();
    } catch (error) {
      console.error('Failed to complete session:', error);
      toast.error('Failed to complete session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSession = async () => {
    if (!session) return;

    try {
      setSubmitting(true);
      await SessionsApi.cancel(session.id, cancellationReason || undefined);
      toast.success('Session cancelled');
      setShowCancelDialog(false);
      await loadSession();
    } catch (error) {
      console.error('Failed to cancel session:', error);
      toast.error('Failed to cancel session');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">
          Loading session...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Session not found</p>
          <Link href="/dashboard/coaching/sessions">
            <Button variant="outline" className="mt-4">
              Back to Sessions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <PageHeader
        title="Session Details"
        description={`${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session`}
        actions={
          <div className="flex items-center gap-2">
            {getStatusBadge(session.status)}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Session Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Session Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(session.scheduledAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {formatTime(session.scheduledAt)} ({session.duration} minutes)
                  </p>
                </div>
              </div>

              {session.status === 'completed' && session.completedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">{formatDate(session.completedAt)}</p>
                  </div>
                </div>
              )}

              {session.status === 'cancelled' && session.cancelledAt && (
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cancelled</p>
                    <p className="font-medium">{formatDate(session.cancelledAt)}</p>
                    {session.cancellationReason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Reason: {session.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Coach Notes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Coach Notes</h2>
              {session.status === 'scheduled' && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Notes
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="coachNotes">Notes</Label>
                  <Textarea
                    id="coachNotes"
                    value={coachNotes}
                    onChange={(e) => setCoachNotes(e.target.value)}
                    placeholder="Add your notes about this session..."
                    rows={6}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveNotes} disabled={submitting}>
                    Save Notes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setCoachNotes(session.coachNotes || '');
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {session.coachNotes ? (
                  <p className="text-sm whitespace-pre-wrap">{session.coachNotes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes added yet</p>
                )}
              </div>
            )}
          </Card>

          {/* Member Notes */}
          {session.memberNotes && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Member Notes</h2>
              <p className="text-sm whitespace-pre-wrap">{session.memberNotes}</p>
            </Card>
          )}

          {/* Outcomes */}
          {session.outcomes && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Session Outcomes</h2>
              <p className="text-sm whitespace-pre-wrap">{session.outcomes}</p>
            </Card>
          )}

          {/* Member Rating */}
          {session.status === 'completed' && session.rating && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Member Rating</h2>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{session.rating}/5</span>
              </div>
              {session.ratingFeedback && (
                <p className="text-sm text-muted-foreground mt-2">
                  {session.ratingFeedback}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Member Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Member</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {session.member?.user?.name || 'Unknown Member'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session.member?.user?.email}
                </p>
              </div>
            </div>
            <Link href={`/dashboard/coaching/members/${session.memberId}`}>
              <Button variant="outline" size="sm" className="w-full">
                View Profile
              </Button>
            </Link>
          </Card>

          {/* Actions */}
          {session.status === 'scheduled' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => setShowCompleteDialog(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Session
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Session
                </Button>
              </div>
            </Card>
          )}

          {/* Quick Links */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <div className="space-y-2">
              {session.member?.userId && (
                <MessageButton
                  userId={session.member.userId}
                  userName={session.member.user?.name || 'member'}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  dashboardType="coach"
                >
                  Message Member
                </MessageButton>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Complete Session Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
            <DialogDescription>
              Mark this session as complete and add final notes and outcomes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="completeNotes">Coach Notes *</Label>
              <Textarea
                id="completeNotes"
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="Add your notes about this session..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="outcomes">Session Outcomes (Optional)</Label>
              <Textarea
                id="outcomes"
                value={outcomes}
                onChange={(e) => setOutcomes(e.target.value)}
                placeholder="What were the key outcomes of this session?"
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSession}
              disabled={submitting || !coachNotes.trim()}
            >
              Complete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Session Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="cancelReason">Cancellation Reason (Optional)</Label>
            <Textarea
              id="cancelReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Why is this session being cancelled?"
              rows={4}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={submitting}
            >
              Keep Session
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSession}
              disabled={submitting}
            >
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
