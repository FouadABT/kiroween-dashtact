'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { MembersApi } from '@/lib/api/coaching';
import { BookSessionForm } from '@/components/coaching/BookSessionForm';
import { PageHeader } from '@/components/layout/PageHeader';
import type { MemberProfile } from '@/types/coaching';

export default function BookSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const memberProfile = await MembersApi.getMe();
      if (!memberProfile) {
        toast.error('Member profile not found');
        router.push('/dashboard/member');
        return;
      }
      
      setProfile(memberProfile);

      if (!memberProfile.coachId) {
        toast.error('You need to be assigned to a coach before booking sessions');
        router.push('/dashboard/member');
        return;
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
      router.push('/dashboard/member');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingComplete = () => {
    router.push('/dashboard/member/sessions');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!profile || !profile.coachId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <PageHeader
        title="Book a Session"
        description="Select an available time slot with your coach"
        breadcrumbProps={{
          customItems: [
            { label: 'Member Portal', href: '/dashboard/member' },
            { label: 'Book Session', href: '/dashboard/member/book-session' }
          ]
        }}
      />

      {/* Coach Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{profile.coach?.name || 'Coach'}</p>
              <p className="text-sm text-muted-foreground">{profile.coach?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Time Slot
          </CardTitle>
          <CardDescription>
            Choose an available time slot. Green indicates available slots, red indicates full slots, and gray indicates already booked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookSessionForm
            memberId={profile.userId}
            coachId={profile.coachId}
            onBookingComplete={handleBookingComplete}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Slot Status Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-600 dark:bg-green-700" />
              <span className="text-sm text-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-destructive" />
              <span className="text-sm text-foreground">Full</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted" />
              <span className="text-sm text-foreground">Already Booked</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
