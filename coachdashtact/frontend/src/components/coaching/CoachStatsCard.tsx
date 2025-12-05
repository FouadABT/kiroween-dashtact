'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Users, TrendingUp } from 'lucide-react';
import { CoachesApi } from '@/lib/api/coaching';
import { toast } from '@/hooks/use-toast';
import type { CoachProfile } from '@/types/coaching';

/**
 * Coach Stats Card Component
 * 
 * Displays coach statistics including average rating, total ratings, and member count.
 * 
 * Requirements: 9.5
 */
export function CoachStatsCard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CoachProfile | null>(null);

  useEffect(() => {
    loadCoachProfile();
  }, []);

  const loadCoachProfile = async () => {
    try {
      setLoading(true);
      const coachProfile = await CoachesApi.getMyProfile();
      setProfile(coachProfile);
    } catch (error) {
      console.error('Failed to load coach profile:', error);
      toast.error('Failed to load coach statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Statistics</CardTitle>
          <CardDescription>Your coaching performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const hasRatings = profile.averageRating && profile.totalRatings && profile.totalRatings > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Statistics</CardTitle>
        <CardDescription>Your coaching performance metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Rating */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg">
              <Star className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              {hasRatings ? (
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{profile.averageRating!.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">/ 5.0</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No ratings yet</p>
              )}
            </div>
          </div>
          {hasRatings && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(profile.averageRating!)
                      ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Total Ratings */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ratings</p>
              <p className="text-2xl font-bold">{profile.totalRatings || 0}</p>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Members</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{profile.currentMemberCount || 0}</p>
                <p className="text-sm text-muted-foreground">/ {profile.maxMembers}</p>
              </div>
            </div>
          </div>
          {profile.currentMemberCount !== undefined && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {profile.availableCapacity || 0} spots left
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
