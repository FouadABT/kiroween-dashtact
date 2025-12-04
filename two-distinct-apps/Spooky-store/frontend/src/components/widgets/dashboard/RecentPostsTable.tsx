'use client';

/**
 * Recent Posts Table Widget
 * Displays the last 10 blog posts
 */

import { useState, useEffect, useMemo } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardApi } from '@/lib/api';
import { format } from 'date-fns';

export interface RecentPostsTableProps {
  title?: string;
  limit?: number;
  data?: Array<{ id: string; title: string; author: string; publishedAt: string }>;
  loading?: boolean;
  error?: string;
  permission?: string;
}

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

export function RecentPostsTable({
  title = 'Recent Blog Posts',
  limit = 10,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'blog:read',
}: RecentPostsTableProps) {
  const router = useRouter();
  const [apiData, setApiData] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [useApi] = useState(!propData);

  useEffect(() => {
    if (!useApi) return;
    const fetchData = async () => {
      try {
        setApiLoading(true);
        const data = await DashboardApi.getContent();
        setApiData(data);
      } catch (err) {
        setApiError('Failed to load data');
      } finally {
        setApiLoading(false);
      }
    };
    fetchData();
  }, [useApi]);

  const posts = useMemo(() => {
    if (propData) return propData.slice(0, limit);
    if (!apiData?.recentPosts) return [];
    return apiData.recentPosts.slice(0, limit);
  }, [propData, apiData, limit]);

  const loading = propLoading || apiLoading;
  const error = propError || apiError;

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="table" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={error}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (posts.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={FileText} title="No Posts" description="No blog posts found" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Title</TableHead>
              <TableHead className="min-w-[150px]">Author</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Published Date</TableHead>
              <TableHead className="min-w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post: any) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">
                  <div className="max-w-[300px] truncate">{post.title}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{post.author}</TableCell>
                <TableCell>
                  <Badge variant="default">
                    <span className="text-green-600 dark:text-green-400">Published</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(post.publishedAt)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/blog/posts/${post.id}/edit`)} className="h-8 w-8 p-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WidgetContainer>
  );
}
