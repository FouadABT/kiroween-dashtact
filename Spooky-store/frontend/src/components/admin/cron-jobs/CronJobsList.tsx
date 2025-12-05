'use client';

import { CronJob } from '@/types/cron-job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CronJobsListProps {
  jobs: CronJob[];
  selectedJob: CronJob | null;
  onSelectJob: (job: CronJob) => void;
  onJobUpdate: (job: CronJob) => void;
}

export function CronJobsList({ jobs, selectedJob, onSelectJob }: CronJobsListProps) {
  const getStatusBadge = (job: CronJob) => {
    if (!job.isEnabled) {
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" />
          Disabled
        </Badge>
      );
    }

    if (job.consecutiveFailures > 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failing
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const getSuccessRate = (job: CronJob) => {
    const total = job.successCount + job.failureCount;
    if (total === 0) return 'N/A';
    const rate = (job.successCount / total) * 100;
    return `${rate.toFixed(1)}%`;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduled Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No cron jobs found
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedJob?.id === job.id && 'bg-accent'
                    )}
                    onClick={() => onSelectJob(job)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.name}</div>
                        {job.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {job.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {job.schedule}
                      </code>
                    </TableCell>
                    <TableCell>{getStatusBadge(job)}</TableCell>
                    <TableCell className="text-sm">{formatTime(job.lastRunAt)}</TableCell>
                    <TableCell className="text-sm">{formatTime(job.nextRunAt)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {getSuccessRate(job)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
