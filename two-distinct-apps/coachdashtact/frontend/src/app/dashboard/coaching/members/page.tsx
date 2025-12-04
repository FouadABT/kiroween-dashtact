'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MembersApi } from '@/lib/api/coaching';
import { toast } from '@/hooks/use-toast';
import type { MemberProfile } from '@/types/coaching';
import { Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function MembersListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onboardingFilter, setOnboardingFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, searchQuery, statusFilter, onboardingFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MembersApi.getAll();
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError('Failed to load members');
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.user?.name?.toLowerCase().includes(query) ||
          member.user?.email?.toLowerCase().includes(query) ||
          member.goals?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (member) => member.membershipStatus === statusFilter
      );
    }

    // Onboarding filter
    if (onboardingFilter !== 'all') {
      filtered = filtered.filter(
        (member) => member.onboardingStatus === onboardingFilter
      );
    }

    setFilteredMembers(filtered);
  };

  if (loading) {
    return <MembersListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadMembers}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Members</h1>
          <p className="text-foreground/70">
            Manage your coaching members
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, or goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          {/* Onboarding Filter */}
          <Select
            value={onboardingFilter}
            onValueChange={setOnboardingFilter}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Onboarding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Onboarding</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-foreground/70">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </Card>

      {/* Members Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Goals</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-foreground/70">
                    {searchQuery || statusFilter !== 'all' || onboardingFilter !== 'all'
                      ? 'No members match your filters'
                      : 'No members yet'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() =>
                    router.push(`/dashboard/coaching/members/${member.id}`)
                  }
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {member.user?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {format(parseISO(member.joinedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                      {member.goals || 'No goals set'}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/coaching/members/${member.id}`);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function MembersListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card className="p-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
      </Card>
      <Card>
        <Skeleton className="h-96 w-full" />
      </Card>
    </div>
  );
}
