'use client';

import { useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { UserCircle, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ProfileSummaryCardProps {
  title?: string;
  showCompletion?: boolean;
  data?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    profileCompletion?: number;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

function getInitials(name: string): string {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
}

export function ProfileSummaryCard({
  title = 'My Profile',
  showCompletion = true,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission,
}: ProfileSummaryCardProps) {
  const router = useRouter();
  const [useContext] = useState(!propData);

  // For now, use prop data or mock data
  const data = propData || (useContext ? {
    name: 'User',
    email: 'user@example.com',
    role: 'User',
    profileCompletion: 75,
  } : undefined);

  const loading = propLoading;
  const error = propError;

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="card" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={error}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (!data) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={UserCircle} title="No Data" description="Profile data not available" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={data.avatar} alt={data.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">{getInitials(data.name || 'U')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{data.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{data.email}</p>
            <Badge variant="outline" className="mt-1">{data.role}</Badge>
          </div>
        </div>

        {showCompletion && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="font-semibold text-foreground">{data.profileCompletion}%</span>
            </div>
            <Progress value={data.profileCompletion} className="h-2" />
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/profile')}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>
    </WidgetContainer>
  );
}
