'use client';

import { useState, useEffect } from 'react';
import { CronJob, JobStatistics, CronLog } from '@/types/cron-job';
import { CronJobsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { JobControls } from './JobControls';
import { JobStatistics as JobStatsComponent } from './JobStatistics';
import { ScheduleEditor } from './ScheduleEditor';
import { ExecutionHistory } from './ExecutionHistory';
import { Button } from '@/components/ui/button';
import { Edit, X } from 'lucide-react';

interface CronJobDetailsProps {
  job: CronJob;
  onUpdate: (job: CronJob) => void;
}

export function CronJobDetails({ job, onUpdate }: CronJobDetailsProps) {
  const [statistics, setStatistics] = useState<JobStatistics | null>(null);
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobData();
  }, [job.id]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const [stats, logsData] = await Promise.all([
        CronJobsApi.getStatistics(job.id),
        CronJobsApi.getLogs(job.id, { limit: 50 }),
      ]);
      setStatistics(stats);
      setLogs(logsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load job data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleUpdate = (updatedJob: CronJob) => {
    onUpdate(updatedJob);
    setShowScheduleEditor(false);
    toast.success('Schedule updated successfully');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{job.name}</CardTitle>
              <CardDescription>{job.description || 'No description'}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Statistics */}
          {statistics && <JobStatsComponent job={job} statistics={statistics} />}

          <Separator />

          {/* Job Controls */}
          <JobControls job={job} onUpdate={onUpdate} />

          <Separator />

          {/* Schedule Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Schedule</h3>
              {!job.isLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScheduleEditor(!showScheduleEditor)}
                >
                  {showScheduleEditor ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </>
                  )}
                </Button>
              )}
            </div>
            {showScheduleEditor ? (
              <ScheduleEditor job={job} onUpdate={handleScheduleUpdate} />
            ) : (
              <code className="text-sm bg-muted px-3 py-2 rounded block">
                {job.schedule}
              </code>
            )}
            {job.isLocked && (
              <p className="text-xs text-muted-foreground mt-2">
                This schedule is locked and cannot be modified through the UI
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution History */}
      <ExecutionHistory logs={logs} loading={loading} onRefresh={loadJobData} />
    </div>
  );
}
