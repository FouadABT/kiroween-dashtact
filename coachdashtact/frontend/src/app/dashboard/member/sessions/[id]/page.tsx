'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, Clock, User, Star, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { SessionsApi } from '@/lib/api/coaching';
import { MessageButton } from '@/components/messaging/MessageButton';
import type { Session } from '@/types/coaching';

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [cancelReason, setCancelReason] = useState('');
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
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleRateSession = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      await SessionsApi.rate(sessionId, { rating, feedback: feedback || undefined });
      toast.success('Session rated successfully');
      setShowRatingDialog(false);
      loadSession();
    } catch (error) {
      console.error('Failed to rate session:', error);
      toast.error('Failed to rate session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSession = async () => {
    try {
      setSubmitting(true);
      await SessionsApi.cancel(sessionId, cancelReason || undefined);
      toast.success('Session cancelled successfully');
      setShowCancelDialog(false);
      loadSession();
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

  const canCancel = session?.status === 'scheduled' && new Date(session.scheduledAt) > new Date();
  const canRate = session?.status === 'completed' && !session.rating;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Session not found</p>
        <Button onClick={() => router.push('/dashboard/member/sessions')}>
          Back to Sessions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Session Details"
        description={`${session.type.charAt(0).toUpperCase() + session.type.slice(1)} session on ${formatDate(session.scheduledAt)}`}
        breadcrumbProps={{
          customItems: [
            { label: 'Member Portal', href: '/dashboard/member' },
            { label: 'My Sessions', href: '/dashboard/member/sessions' },
            { label: 'Session Details', href: `/dashboard/member/sessions/${sessionId}` }
          ]
        }}
        actions={getStatusBadge(session.status)}
      />

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Date & Time</span>
              </div>
              <p className="font-medium">{formatDate(session.scheduledAt)}</p>
              <p className="text-sm text-muted-foreground">{formatTime(session.scheduledAt)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Duration</span>
              </div>
              <p className="font-medium">{session.duration} minutes</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">Type</span>
              </div>
              <p className="font-medium capitalize">{session.type}</p>
            </div>

            {session.coach && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Coach</span>
                </div>
                <p className="font-medium">{session.coach.name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {session.memberNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Your Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{session.memberNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Rating */}
      {session.rating && (
        <Card>
          <CardHeader>
            <CardTitle>Your Rating</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{'⭐'.repeat(session.rating)}</span>
              <span className="text-muted-foreground">({session.rating}/5)</span>
            </div>
            {session.ratingFeedback && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Feedback:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {session.ratingFeedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancellation Info */}
      {session.status === 'cancelled' && session.cancellationReason && (
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{session.cancellationReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {canRate && (
          <Button onClick={() => setShowRatingDialog(true)}>
            <Star className="h-4 w-4 mr-2" />
            Rate Session
          </Button>
        )}
        {canCancel && (
          <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
            <X className="h-4 w-4 mr-2" />
            Cancel Session
          </Button>
        )}
        {session.coach && (
          <MessageButton
            userId={session.coachId}
            userName={session.coach.name || 'your coach'}
            variant="outline"
            dashboardType="member"
          >
            Message Coach
          </MessageButton>
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Session</DialogTitle>
            <DialogDescription>
              How would you rate your coaching session?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-3xl hover:scale-110 transition-transform"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts about the session..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRateSession} disabled={submitting || rating === 0}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancelReason">Reason (Optional)</Label>
            <Textarea
              id="cancelReason"
              placeholder="Why are you cancelling?"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSession}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
